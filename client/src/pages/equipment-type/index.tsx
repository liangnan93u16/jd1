import React, { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EquipmentTypeForm } from "@/components/forms/equipment-type-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { formatDate } from "@/lib/utils";
import type { EquipmentType } from "@shared/schema";

export default function EquipmentTypePage() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedType, setSelectedType] = useState<EquipmentType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data from API
  const { data: types, isLoading } = useQuery<EquipmentType[]>({
    queryKey: ["/api/equipment-types"],
  });

  // Define deletion mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/equipment-types/${id}`);
    },
    onSuccess: async () => {
      toast({
        title: "设备类型已删除",
        description: "设备类型已成功从系统中移除",
      });
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/equipment-types"] });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "删除失败",
        description: (error as Error).message || "设备类型可能已被引用，无法删除",
        variant: "destructive",
      });
    },
  });

  // Define table columns
  const columns = [
    {
      header: "ID",
      accessorKey: "typeId",
    },
    {
      header: "类型名称",
      accessorKey: "typeName",
    },
    {
      header: "生命周期（年）",
      accessorKey: "lifecycleYears",
      cell: (row: EquipmentType) => row.lifecycleYears || "-",
    },
    {
      header: "创建时间",
      accessorKey: "createdAt",
      cell: (row: EquipmentType) => formatDate(row.createdAt),
    },
    {
      header: "更新时间",
      accessorKey: "updatedAt",
      cell: (row: EquipmentType) => formatDate(row.updatedAt),
    },
  ];

  // Handle form submission
  const handleAddType = () => {
    setSelectedType(null);
    setOpenForm(true);
  };

  const handleEditType = (type: EquipmentType) => {
    setSelectedType(type);
    setOpenForm(true);
  };

  const handleDeleteType = (type: EquipmentType) => {
    setSelectedType(type);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedType(null);
  };

  const confirmDelete = () => {
    if (selectedType) {
      deleteMutation.mutate(selectedType.typeId);
    }
  };

  return (
    <Layout
      breadcrumbs={[
        { label: "首页", href: "/dashboard" },
        { label: "设备类型管理" },
      ]}
      title="设备类型管理"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-gray-500">
            管理系统中的所有设备类型信息
          </p>
        </div>
        <Button onClick={handleAddType} className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> 添加设备类型
        </Button>
      </div>

      <DataTable
        data={types || []}
        columns={columns}
        isLoading={isLoading}
        rowActions={(row) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditType(row);
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
                handleDeleteType(row);
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
              {selectedType ? "编辑设备类型" : "添加设备类型"}
            </DialogTitle>
          </DialogHeader>
          <EquipmentTypeForm
            defaultValues={selectedType || undefined}
            typeId={selectedType?.typeId}
            onSuccess={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除"
        description={`您确定要删除设备类型 "${selectedType?.typeName}" 吗？此操作不可撤销，且可能影响关联的设备和部件。`}
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
      />
    </Layout>
  );
}
