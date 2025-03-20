import React, { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { BaseForm } from "@/components/forms/base-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Eye, Pencil, Trash2, Plus, ListTree } from "lucide-react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { TreeViewDialog } from "@/components/common/tree-view-dialog";
import { formatDate } from "@/lib/utils";
import type { Base } from "@shared/schema";
import type { TreeNode } from "@/components/ui/tree-view";

export default function BasePage() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedBase, setSelectedBase] = useState<Base | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [treeViewOpen, setTreeViewOpen] = useState(false);
  const [viewingBaseId, setViewingBaseId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data from API
  const { data: bases, isLoading } = useQuery<Base[]>({
    queryKey: ["/api/bases"],
  });
  
  // Fetch base hierarchy data
  const { data: baseHierarchy, isLoading: isLoadingHierarchy } = useQuery<TreeNode>({
    queryKey: ["/api/hierarchy/base", viewingBaseId],
    queryFn: async () => {
      if (!viewingBaseId) return null;
      const res = await fetch(`/api/hierarchy/base/${viewingBaseId}`);
      if (!res.ok) throw new Error("Failed to fetch base hierarchy");
      return res.json();
    },
    enabled: !!viewingBaseId && treeViewOpen,
  });

  // Define deletion mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/bases/${id}`);
    },
    onSuccess: async () => {
      toast({
        title: "基地已删除",
        description: "基地已成功从系统中移除",
      });
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/bases"] });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "删除失败",
        description: (error as Error).message || "基地可能已被引用，无法删除",
        variant: "destructive",
      });
    },
  });

  // Define table columns
  const columns = [
    {
      header: "ID",
      accessorKey: "baseId",
    },
    {
      header: "基地名称",
      accessorKey: "baseName",
    },
    {
      header: "创建时间",
      accessorKey: "createdAt",
      cell: (row: Base) => formatDate(row.createdAt),
    },
    {
      header: "更新时间",
      accessorKey: "updatedAt",
      cell: (row: Base) => formatDate(row.updatedAt),
    },
  ];

  // Handle form submission
  const handleAddBase = () => {
    setSelectedBase(null);
    setOpenForm(true);
  };

  const handleEditBase = (base: Base) => {
    setSelectedBase(base);
    setOpenForm(true);
  };

  const handleDeleteBase = (base: Base) => {
    setSelectedBase(base);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedBase(null);
  };

  const confirmDelete = () => {
    if (selectedBase) {
      deleteMutation.mutate(selectedBase.baseId);
    }
  };
  
  const handleViewTree = (base: Base) => {
    setViewingBaseId(base.baseId);
    setTreeViewOpen(true);
  };
  
  const handleTreeViewClose = () => {
    setTreeViewOpen(false);
    setViewingBaseId(null);
  };

  return (
    <Layout
      breadcrumbs={[
        { label: "首页", href: "/dashboard" },
        { label: "基地管理" },
      ]}
      title="基地管理"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-gray-500">
            管理系统中的所有基地信息
          </p>
        </div>
        <Button onClick={handleAddBase} className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> 添加基地
        </Button>
      </div>

      <DataTable
        data={bases || []}
        columns={columns}
        isLoading={isLoading}
        rowActions={(row) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewTree(row);
              }}
            >
              <ListTree className="h-4 w-4 mr-1" /> 查看结构
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditBase(row);
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
                handleDeleteBase(row);
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
              {selectedBase ? "编辑基地" : "添加基地"}
            </DialogTitle>
          </DialogHeader>
          <BaseForm
            defaultValues={selectedBase || undefined}
            baseId={selectedBase?.baseId}
            onSuccess={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除"
        description={`您确定要删除基地 "${selectedBase?.baseName}" 吗？此操作不可撤销，且可能影响关联的车间和设备。`}
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
      />

      {/* Tree View Dialog */}
      <TreeViewDialog
        open={treeViewOpen}
        onOpenChange={handleTreeViewClose}
        title={`基地结构: ${bases?.find(b => b.baseId === viewingBaseId)?.baseName || ''}`}
        data={baseHierarchy ? [baseHierarchy] : null}
        isLoading={isLoadingHierarchy}
      />
    </Layout>
  );
}
