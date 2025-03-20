import React, { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import { SupplierForm } from "@/components/forms/supplier-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Search, X } from "lucide-react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { formatDate } from "@/lib/utils";
import type { ExtendedSparePartSupplier, SparePart } from "@shared/schema";

export default function SupplierPage() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<ExtendedSparePartSupplier | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // For filtering
  const [sparePartId, setSparePartId] = useState<string>("");
  const [search, setSearch] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch spare parts for filter
  const { data: spareParts } = useQuery<SparePart[]>({
    queryKey: ["/api/spare-parts"],
  });

  // Fetch suppliers data
  const { data: suppliers, isLoading } = useQuery<ExtendedSparePartSupplier[]>({
    queryKey: ["/api/suppliers", sparePartId],
    queryFn: async () => {
      const url = sparePartId 
        ? `/api/suppliers?sparePartId=${sparePartId}`
        : "/api/suppliers";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch suppliers");
      return res.json();
    },
  });

  // Define deletion mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/suppliers/${id}`);
    },
    onSuccess: async () => {
      toast({
        title: "供应商已删除",
        description: "供应商已成功从系统中移除",
      });
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "删除失败",
        description: (error as Error).message || "删除供应商时发生错误",
        variant: "destructive",
      });
    },
  });

  // Define table columns
  const columns = [
    {
      header: "ID",
      accessorKey: "supplierId",
    },
    {
      header: "供应商名称",
      accessorKey: "supplierName",
    },
    {
      header: "物料编号",
      accessorKey: "materialCode",
    },
    {
      header: "制造商",
      accessorKey: "manufacturer",
    },
    {
      header: "规格型号",
      accessorKey: "specification",
      cell: (row: ExtendedSparePartSupplier) => row.specification || "-",
    },
    {
      header: "供货周期(周)",
      accessorKey: "supplyCycleWeeks",
    },
    {
      header: "创建时间",
      accessorKey: "createdAt",
      cell: (row: ExtendedSparePartSupplier) => formatDate(row.createdAt),
    },
  ];

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers?.filter(supplier => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      supplier.supplierName.toLowerCase().includes(searchLower) ||
      supplier.materialCode.toLowerCase().includes(searchLower) ||
      supplier.manufacturer.toLowerCase().includes(searchLower) ||
      (supplier.specification && supplier.specification.toLowerCase().includes(searchLower))
    );
  });

  // Handlers
  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setOpenForm(true);
  };

  const handleEditSupplier = (supplier: ExtendedSparePartSupplier) => {
    setSelectedSupplier(supplier);
    setOpenForm(true);
  };

  const handleDeleteSupplier = (supplier: ExtendedSparePartSupplier) => {
    setSelectedSupplier(supplier);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedSupplier(null);
  };

  const confirmDelete = () => {
    if (selectedSupplier) {
      deleteMutation.mutate(selectedSupplier.supplierId);
    }
  };

  return (
    <Layout
      breadcrumbs={[
        { label: "首页", href: "/dashboard" },
        { label: "供应商管理" },
      ]}
      title="供应商管理"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-gray-500">
            管理系统中的所有备件供应商信息
          </p>
        </div>
        <Button onClick={handleAddSupplier} className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> 添加供应商
        </Button>
      </div>

      {/* Filter section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label className="mb-1 block">搜索</Label>
            <div className="relative">
              <Input
                placeholder="供应商名称、物料编号或制造商..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-none self-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearch("");
                setSparePartId("");
              }}
            >
              重置筛选
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        data={filteredSuppliers || []}
        columns={columns}
        isLoading={isLoading}
        rowActions={(row) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditSupplier(row);
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
                handleDeleteSupplier(row);
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
              {selectedSupplier ? "编辑供应商" : "添加供应商"}
            </DialogTitle>
          </DialogHeader>
          <SupplierForm
            defaultValues={selectedSupplier || undefined}
            supplierId={selectedSupplier?.supplierId}
            onSuccess={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除"
        description={`您确定要删除供应商 "${selectedSupplier?.supplierName}" 吗？此操作不可撤销。`}
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
      />
    </Layout>
  );
}
