import React, { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/ui/data-table";
import { SparePartForm } from "@/components/forms/spare-part-form";
import { SupplierForm } from "@/components/forms/supplier-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Search, X, Truck } from "lucide-react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { formatDate } from "@/lib/utils";
import type { SparePart } from "@shared/schema";

export default function SparePartPage() {
  const [openForm, setOpenForm] = useState(false);
  const [openSupplierForm, setOpenSupplierForm] = useState(false);
  const [selectedSparePart, setSelectedSparePart] = useState<SparePart | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Search and filters
  const [search, setSearch] = useState("");
  const [isCustomFilter, setIsCustomFilter] = useState<boolean | undefined>(undefined);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch spare parts data
  const { data: spareParts, isLoading } = useQuery<SparePart[]>({
    queryKey: ["/api/spare-parts", search, isCustomFilter],
    queryFn: async () => {
      let url = "/api/spare-parts";
      const params = new URLSearchParams();
      
      if (search) params.append("search", search);
      if (isCustomFilter !== undefined) params.append("isCustom", isCustomFilter.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch spare parts");
      return res.json();
    },
  });

  // Define deletion mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/spare-parts/${id}`);
    },
    onSuccess: async () => {
      toast({
        title: "备件已删除",
        description: "备件已成功从系统中移除",
      });
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/spare-parts"] });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "删除失败",
        description: (error as Error).message || "备件可能已被引用，无法删除",
        variant: "destructive",
      });
    },
  });

  // Define table columns
  const columns = [
    {
      header: "物料编号",
      accessorKey: "materialCode",
    },
    {
      header: "制造商",
      accessorKey: "manufacturer",
    },
    {
      header: "制造商物料编号",
      accessorKey: "manufacturerMaterialCode",
      cell: (row: SparePart) => row.manufacturerMaterialCode || "-",
    },
    {
      header: "规格型号",
      accessorKey: "specification",
      cell: (row: SparePart) => row.specification || "-",
    },
    {
      header: "描述",
      accessorKey: "description",
      cell: (row: SparePart) => row.description || "-",
    },
    {
      header: "定制件",
      accessorKey: "isCustom",
      cell: (row: SparePart) => 
        row.isCustom ? 
        <Badge variant="warning">是</Badge> : 
        <Badge variant="secondary">否</Badge>,
    },
    {
      header: "创建时间",
      accessorKey: "createdAt",
      cell: (row: SparePart) => formatDate(row.createdAt),
    },
  ];

  // Handlers
  const handleSearch = (query: string) => {
    setSearch(query);
  };

  const handleAddSparePart = () => {
    setSelectedSparePart(null);
    setOpenForm(true);
  };

  const handleEditSparePart = (sparePart: SparePart) => {
    setSelectedSparePart(sparePart);
    setOpenForm(true);
  };

  const handleDeleteSparePart = (sparePart: SparePart) => {
    setSelectedSparePart(sparePart);
    setDeleteDialogOpen(true);
  };

  const handleAddSupplier = (sparePart: SparePart) => {
    setSelectedSparePart(sparePart);
    setOpenSupplierForm(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedSparePart(null);
  };

  const handleSupplierFormClose = () => {
    setOpenSupplierForm(false);
  };

  const confirmDelete = () => {
    if (selectedSparePart) {
      deleteMutation.mutate(selectedSparePart.sparePartId);
    }
  };

  return (
    <Layout
      breadcrumbs={[
        { label: "首页", href: "/dashboard" },
        { label: "备件/物料管理" },
      ]}
      title="备件/物料管理"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-gray-500">
            管理系统中的所有备件和物料信息
          </p>
        </div>
        <Button onClick={handleAddSparePart} className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> 添加备件
        </Button>
      </div>

      {/* Filter section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label className="mb-1 block">搜索</Label>
            <div className="relative">
              <Input
                placeholder="物料编号、制造商、规格或描述..."
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
          
          <div className="flex-none sm:w-48">
            <Label className="mb-1 block">定制件筛选</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Switch 
                id="custom-filter" 
                checked={isCustomFilter === true}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setIsCustomFilter(true);
                  } else if (isCustomFilter === true) {
                    setIsCustomFilter(undefined); // All
                  } else {
                    setIsCustomFilter(false);
                  }
                }}
              />
              <Label htmlFor="custom-filter">
                {isCustomFilter === true ? "只看定制件" : 
                 isCustomFilter === false ? "只看非定制件" : "全部备件"}
              </Label>
            </div>
          </div>
          
          <div className="flex-none self-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearch("");
                setIsCustomFilter(undefined);
              }}
            >
              重置筛选
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        data={spareParts || []}
        columns={columns}
        isLoading={isLoading}
        rowActions={(row) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleAddSupplier(row);
              }}
            >
              <Truck className="h-4 w-4 mr-1" /> 添加供应商
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditSparePart(row);
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
                handleDeleteSparePart(row);
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
              {selectedSparePart ? "编辑备件" : "添加备件"}
            </DialogTitle>
          </DialogHeader>
          <SparePartForm
            defaultValues={selectedSparePart || undefined}
            sparePartId={selectedSparePart?.sparePartId}
            onSuccess={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Supplier Form Dialog */}
      <Dialog open={openSupplierForm} onOpenChange={setOpenSupplierForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              添加供应商
            </DialogTitle>
          </DialogHeader>
          <SupplierForm
            preselectedSparePartId={selectedSparePart?.sparePartId}
            onSuccess={handleSupplierFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除"
        description={`您确定要删除备件 "${selectedSparePart?.materialCode}" 吗？此操作不可撤销，且可能影响关联的供应商和设备信息。`}
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
      />
    </Layout>
  );
}
