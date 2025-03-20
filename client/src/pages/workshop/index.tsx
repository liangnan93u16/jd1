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
import { WorkshopForm } from "@/components/forms/workshop-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, Plus, Factory } from "lucide-react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { formatDate } from "@/lib/utils";
import type { Workshop, Base } from "@shared/schema";

export default function WorkshopPage() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [baseFilter, setBaseFilter] = useState<string>("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch workshops data
  const { data: workshops, isLoading: isLoadingWorkshops } = useQuery<Workshop[]>({
    queryKey: ["/api/workshops", baseFilter],
    queryFn: async () => {
      const url = baseFilter === "all"
        ? "/api/workshops"
        : `/api/workshops?baseId=${baseFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch workshops");
      return res.json();
    },
  });

  // Fetch bases for filter
  const { data: bases, isLoading: isLoadingBases } = useQuery<Base[]>({
    queryKey: ["/api/bases"],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/workshops/${id}`);
    },
    onSuccess: async () => {
      toast({
        title: "车间已删除",
        description: "车间已成功从系统中移除",
      });
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/workshops"] });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "删除失败",
        description: (error as Error).message || "车间可能已被引用，无法删除",
        variant: "destructive",
      });
    },
  });

  // Define table columns
  const columns = [
    {
      header: "ID",
      accessorKey: "workshopId",
    },
    {
      header: "车间名称",
      accessorKey: "workshopName",
    },
    {
      header: "所属基地",
      accessorKey: "baseId",
      cell: (row: any) => {
        const base = bases?.find(b => b.baseId === row.baseId);
        return base?.baseName || row.baseId;
      },
    },
    {
      header: "作业级别",
      accessorKey: "busyLevel",
      cell: (row: Workshop) => {
        const level = row.busyLevel;
        let variant = "default";
        let label = "";
        
        switch (level) {
          case "1":
            variant = "destructive";
            label = "1: 连续作业";
            break;
          case "2":
            variant = "warning";
            label = "2: 正常作业";
            break;
          case "3":
            variant = "success";
            label = "3: 间歇作业";
            break;
          case "4":
            variant = "secondary";
            label = "4: 不作业";
            break;
        }
        
        return <Badge variant={variant as any}>{label}</Badge>;
      },
    },
    {
      header: "创建时间",
      accessorKey: "createdAt",
      cell: (row: Workshop) => formatDate(row.createdAt),
    },
  ];

  // Handle form submission
  const handleAddWorkshop = () => {
    setSelectedWorkshop(null);
    setOpenForm(true);
  };

  const handleEditWorkshop = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setOpenForm(true);
  };

  const handleDeleteWorkshop = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedWorkshop(null);
  };

  const confirmDelete = () => {
    if (selectedWorkshop) {
      deleteMutation.mutate(selectedWorkshop.workshopId);
    }
  };

  return (
    <Layout
      breadcrumbs={[
        { label: "首页", href: "/dashboard" },
        { label: "车间管理" },
      ]}
      title="车间管理"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-gray-500">
            管理系统中的所有车间信息
          </p>
        </div>
        <Button onClick={handleAddWorkshop} className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> 添加车间
        </Button>
      </div>

      {/* Filter section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-full sm:w-64">
            <Label htmlFor="base-filter" className="mb-1 block">基地筛选</Label>
            <Select
              value={baseFilter}
              onValueChange={setBaseFilter}
            >
              <SelectTrigger id="base-filter">
                <SelectValue placeholder="所有基地" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有基地</SelectItem>
                {bases?.map((base) => (
                  <SelectItem key={base.baseId} value={base.baseId.toString()}>
                    {base.baseName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <DataTable
        data={workshops || []}
        columns={columns}
        isLoading={isLoadingWorkshops || isLoadingBases}
        rowActions={(row) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditWorkshop(row);
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
                handleDeleteWorkshop(row);
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
              {selectedWorkshop ? "编辑车间" : "添加车间"}
            </DialogTitle>
          </DialogHeader>
          <WorkshopForm
            defaultValues={selectedWorkshop ? {
              workshopName: selectedWorkshop.workshopName,
              baseId: selectedWorkshop.baseId.toString(),
              busyLevel: selectedWorkshop.busyLevel
            } : undefined}
            workshopId={selectedWorkshop?.workshopId}
            onSuccess={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除"
        description={`您确定要删除车间 "${selectedWorkshop?.workshopName}" 吗？此操作不可撤销，且可能影响关联的设备。`}
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
      />
    </Layout>
  );
}
