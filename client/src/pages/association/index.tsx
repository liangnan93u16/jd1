import React, { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import { AssociationForm } from "@/components/forms/association-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { formatDate } from "@/lib/utils";
import type { ExtendedAssociation, Equipment, Component, SparePart } from "@shared/schema";

export default function AssociationPage() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState<ExtendedAssociation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    equipmentId: "",
    componentId: "",
    sparePartId: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch equipment data for filter
  const { data: equipment, isLoading: isLoadingEquipment } = useQuery({
    queryKey: ["/api/equipment"],
  });

  // Fetch components data for filter
  const { data: components, isLoading: isLoadingComponents } = useQuery({
    queryKey: ["/api/components"],
  });

  // Fetch spare parts data for filter
  const { data: spareParts, isLoading: isLoadingSpareParts } = useQuery({
    queryKey: ["/api/spare-parts"],
  });

  // Fetch associations data
  const { data: associations, isLoading: isLoadingAssociations } = useQuery<ExtendedAssociation[]>({
    queryKey: ["/api/associations", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.equipmentId) params.append("equipmentId", filters.equipmentId);
      if (filters.componentId) params.append("componentId", filters.componentId);
      if (filters.sparePartId) params.append("sparePartId", filters.sparePartId);
      
      const url = `/api/associations${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      
      if (!res.ok) throw new Error("Failed to fetch associations");
      return res.json();
    },
  });

  // Define deletion mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/associations/${id}`);
    },
    onSuccess: async () => {
      toast({
        title: "关联已删除",
        description: "设备-部件-备件关联已成功从系统中移除",
      });
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/associations"] });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "删除失败",
        description: (error as Error).message || "发生未知错误",
        variant: "destructive",
      });
    },
  });

  // Define table columns
  const columns = [
    {
      header: "设备名称",
      accessorKey: "equipmentName",
    },
    {
      header: "部件名称",
      accessorKey: "componentName",
    },
    {
      header: "重要性",
      accessorKey: "importanceLevel",
      cell: (row: ExtendedAssociation) => {
        const level = row.importanceLevel;
        let variant = "default";
        
        switch (level) {
          case "A":
            variant = "importanceA";
            break;
          case "B":
            variant = "importanceB";
            break;
          case "C":
            variant = "importanceC";
            break;
        }
        
        return <Badge variant={variant as any}>{level}</Badge>;
      },
    },
    {
      header: "物料编号",
      accessorKey: "materialCode",
    },
    {
      header: "备件名称",
      accessorKey: "sparePartName",
      cell: (row: ExtendedAssociation) => row.sparePartName || "-",
    },
    {
      header: "规格型号",
      accessorKey: "specification",
      cell: (row: ExtendedAssociation) => row.specification || "-",
    },
    {
      header: "数量",
      accessorKey: "quantity",
    },
    {
      header: "制造商",
      accessorKey: "manufacturer",
    },
  ];

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      equipmentId: "",
      componentId: "",
      sparePartId: "",
    });
  };

  // Form handlers
  const handleAddAssociation = () => {
    setSelectedAssociation(null);
    setOpenForm(true);
  };

  const handleEditAssociation = (association: ExtendedAssociation) => {
    setSelectedAssociation(association);
    setOpenForm(true);
  };

  const handleDeleteAssociation = (association: ExtendedAssociation) => {
    setSelectedAssociation(association);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedAssociation(null);
  };

  const confirmDelete = () => {
    if (selectedAssociation) {
      deleteMutation.mutate(selectedAssociation.id);
    }
  };

  const isLoading = isLoadingEquipment || isLoadingComponents || isLoadingSpareParts || isLoadingAssociations;

  return (
    <Layout
      breadcrumbs={[
        { label: "首页", href: "/dashboard" },
        { label: "设备-部件-备件关联" },
      ]}
      title="设备-部件-备件关联"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-gray-500">
            管理设备、部件和备件之间的关联关系
          </p>
        </div>
        <Button onClick={handleAddAssociation} className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> 添加关联
        </Button>
      </div>

      {/* Filter section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="equipment-filter" className="mb-1 block">设备</Label>
            <Select
              value={filters.equipmentId}
              onValueChange={(value) => handleFilterChange("equipmentId", value)}
            >
              <SelectTrigger id="equipment-filter">
                <SelectValue placeholder="全部设备" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部设备</SelectItem>
                {equipment?.data?.map((equip: any) => (
                  <SelectItem key={equip.equipmentId} value={equip.equipmentId.toString()}>
                    {equip.equipmentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="component-filter" className="mb-1 block">部件</Label>
            <Select
              value={filters.componentId}
              onValueChange={(value) => handleFilterChange("componentId", value)}
            >
              <SelectTrigger id="component-filter">
                <SelectValue placeholder="全部部件" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部部件</SelectItem>
                {components?.map((component: any) => (
                  <SelectItem key={component.componentId} value={component.componentId.toString()}>
                    {component.componentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="spare-part-filter" className="mb-1 block">备件</Label>
            <Select
              value={filters.sparePartId}
              onValueChange={(value) => handleFilterChange("sparePartId", value)}
            >
              <SelectTrigger id="spare-part-filter">
                <SelectValue placeholder="全部备件" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部备件</SelectItem>
                {spareParts?.map((part: any) => (
                  <SelectItem key={part.sparePartId} value={part.sparePartId.toString()}>
                    {part.materialCode} - {part.description || part.specification || part.manufacturer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={handleResetFilters}>
            重置筛选
          </Button>
        </div>
      </div>

      <DataTable
        data={associations || []}
        columns={columns}
        isLoading={isLoading}
        rowActions={(row) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditAssociation(row);
              }}
            >
              <Pencil className="h-4 w-4 mr-1" /> 编辑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteAssociation(row);
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" /> 删除
            </Button>
          </>
        )}
      />

      {/* Form Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAssociation ? "编辑关联" : "添加关联"}
            </DialogTitle>
          </DialogHeader>
          <AssociationForm
            defaultValues={selectedAssociation || undefined}
            associationId={selectedAssociation?.id}
            onSuccess={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除"
        description="您确定要删除这个关联吗？此操作不可撤销。"
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
      />
    </Layout>
  );
}
