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
import { ComponentForm } from "@/components/forms/component-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { formatDate } from "@/lib/utils";
import type { ExtendedComponent, EquipmentType } from "@shared/schema";

export default function ComponentPage() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ExtendedComponent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch equipment types for filter
  const { data: equipmentTypes, isLoading: isLoadingTypes } = useQuery<EquipmentType[]>({
    queryKey: ["/api/equipment-types"],
  });

  // Fetch components data
  const { data: components, isLoading: isLoadingComponents } = useQuery<ExtendedComponent[]>({
    queryKey: ["/api/components", typeFilter],
    queryFn: async () => {
      const url = typeFilter 
        ? `/api/components?typeId=${typeFilter}`
        : "/api/components";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch components");
      return res.json();
    },
  });

  // Define deletion mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/components/${id}`);
    },
    onSuccess: async () => {
      toast({
        title: "部件已删除",
        description: "部件已成功从系统中移除",
      });
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/components"] });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "删除失败",
        description: (error as Error).message || "部件可能已被引用，无法删除",
        variant: "destructive",
      });
    },
  });

  // Define table columns
  const columns = [
    {
      header: "ID",
      accessorKey: "componentId",
    },
    {
      header: "部件名称",
      accessorKey: "componentName",
    },
    {
      header: "设备类型",
      accessorKey: "typeName",
    },
    {
      header: "重要性级别",
      accessorKey: "importanceLevel",
      cell: (row: ExtendedComponent) => {
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
      header: "损坏率",
      accessorKey: "failureRate",
      cell: (row: ExtendedComponent) => 
        row.failureRate !== null ? `${row.failureRate}%` : "-",
    },
    {
      header: "生命周期（年）",
      accessorKey: "lifecycleYears",
      cell: (row: ExtendedComponent) => row.lifecycleYears || "-",
    },
    {
      header: "创建时间",
      accessorKey: "createdAt",
      cell: (row: ExtendedComponent) => formatDate(row.createdAt),
    },
  ];

  // Form handlers
  const handleAddComponent = () => {
    setSelectedComponent(null);
    setOpenForm(true);
  };

  const handleEditComponent = (component: ExtendedComponent) => {
    setSelectedComponent(component);
    setOpenForm(true);
  };

  const handleDeleteComponent = (component: ExtendedComponent) => {
    setSelectedComponent(component);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedComponent(null);
  };

  const confirmDelete = () => {
    if (selectedComponent) {
      deleteMutation.mutate(selectedComponent.componentId);
    }
  };

  return (
    <Layout
      breadcrumbs={[
        { label: "首页", href: "/dashboard" },
        { label: "部件管理" },
      ]}
      title="部件管理"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-gray-500">
            管理系统中的所有部件信息
          </p>
        </div>
        <Button onClick={handleAddComponent} className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> 添加部件
        </Button>
      </div>

      {/* Filter section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-full sm:w-64">
            <Label htmlFor="type-filter" className="mb-1 block">设备类型筛选</Label>
            <Select
              value={typeFilter}
              onValueChange={setTypeFilter}
            >
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="所有设备类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">所有设备类型</SelectItem>
                {equipmentTypes?.map((type) => (
                  <SelectItem key={type.typeId} value={type.typeId.toString()}>
                    {type.typeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <DataTable
        data={components || []}
        columns={columns}
        isLoading={isLoadingComponents || isLoadingTypes}
        rowActions={(row) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditComponent(row);
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
                handleDeleteComponent(row);
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
              {selectedComponent ? "编辑部件" : "添加部件"}
            </DialogTitle>
          </DialogHeader>
          <ComponentForm
            defaultValues={selectedComponent || undefined}
            componentId={selectedComponent?.componentId}
            onSuccess={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除"
        description={`您确定要删除部件 "${selectedComponent?.componentName}" 吗？此操作不可撤销，且可能影响关联的备件信息。`}
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
      />
    </Layout>
  );
}
