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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable, type SortDirection } from "@/components/ui/data-table";
import { EquipmentForm } from "@/components/forms/equipment-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Eye, Pencil, Trash2, Plus, Search, X, ListTree } from "lucide-react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { TreeViewDialog } from "@/components/common/tree-view-dialog";
import { formatDate } from "@/lib/utils";
import type { ExtendedEquipment, Base, EquipmentType, Workshop } from "@shared/schema";
import type { TreeNode } from "@/components/ui/tree-view";

export default function EquipmentPage() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<ExtendedEquipment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [treeViewOpen, setTreeViewOpen] = useState(false);
  const [viewingEquipmentId, setViewingEquipmentId] = useState<number | null>(null);
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    baseId: "",
    workshopId: "",
    typeId: "",
    search: "",
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  
  const [sorting, setSorting] = useState({
    field: "equipmentId",
    direction: "desc" as SortDirection,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch base data for filters
  const { data: bases } = useQuery<Base[]>({
    queryKey: ["/api/bases"],
  });

  // Fetch workshop data for filters
  const { data: workshops } = useQuery<Workshop[]>({
    queryKey: ["/api/workshops", filters.baseId],
    queryFn: async () => {
      const url = filters.baseId 
        ? `/api/workshops?baseId=${filters.baseId}`
        : "/api/workshops";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch workshops");
      return res.json();
    },
  });

  // Fetch equipment type data for filters
  const { data: equipmentTypes } = useQuery<EquipmentType[]>({
    queryKey: ["/api/equipment-types"],
  });

  // Fetch equipment data with pagination and filters
  const { data: equipmentResponse, isLoading: isLoadingEquipment } = useQuery({
    queryKey: [
      "/api/equipment", 
      pagination.page, 
      pagination.limit, 
      filters,
      sorting,
    ],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: sorting.field,
        sortOrder: sorting.direction,
      });
      
      if (filters.baseId) queryParams.append("baseId", filters.baseId);
      if (filters.workshopId) queryParams.append("workshopId", filters.workshopId);
      if (filters.typeId) queryParams.append("typeId", filters.typeId);
      if (filters.search) queryParams.append("search", filters.search);
      
      const url = `/api/equipment?${queryParams.toString()}`;
      const res = await fetch(url);
      
      if (!res.ok) throw new Error("Failed to fetch equipment");
      return res.json();
    },
  });

  // Fetch equipment hierarchy data
  const { data: equipmentHierarchy, isLoading: isLoadingHierarchy } = useQuery<TreeNode>({
    queryKey: ["/api/hierarchy/equipment", viewingEquipmentId],
    queryFn: async () => {
      if (!viewingEquipmentId) return null;
      const res = await fetch(`/api/hierarchy/equipment/${viewingEquipmentId}`);
      if (!res.ok) throw new Error("Failed to fetch equipment hierarchy");
      return res.json();
    },
    enabled: !!viewingEquipmentId && treeViewOpen,
  });

  // Define deletion mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/equipment/${id}`);
    },
    onSuccess: async () => {
      toast({
        title: "设备已删除",
        description: "设备已成功从系统中移除",
      });
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "删除失败",
        description: (error as Error).message || "设备可能已被引用，无法删除",
        variant: "destructive",
      });
    },
  });

  // Define table columns
  const columns = [
    {
      header: "ID",
      accessorKey: "equipmentId",
      sortable: true,
    },
    {
      header: "设备名称",
      accessorKey: "equipmentName",
      sortable: true,
    },
    {
      header: "基地",
      accessorKey: "baseName",
      sortable: true,
    },
    {
      header: "车间",
      accessorKey: "workshopName",
      sortable: true,
    },
    {
      header: "设备类型",
      accessorKey: "typeName",
      sortable: true,
    },
    {
      header: "创建时间",
      accessorKey: "createdAt",
      cell: (row: ExtendedEquipment) => formatDate(row.createdAt),
      sortable: true,
    },
  ];

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    // Reset page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Reset workshopId when baseId changes
    if (key === "baseId") {
      setFilters(prev => ({ ...prev, [key]: value, workshopId: "" }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleSearch = (query: string) => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setFilters(prev => ({ ...prev, search: query }));
  };

  const handleResetFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setFilters({
      baseId: "",
      workshopId: "",
      typeId: "",
      search: "",
    });
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // Sorting handlers
  const handleSortChange = (field: string, direction: SortDirection) => {
    setSorting({ field, direction });
  };

  // Form handlers
  const handleAddEquipment = () => {
    setSelectedEquipment(null);
    setOpenForm(true);
  };

  const handleEditEquipment = (equipment: ExtendedEquipment) => {
    setSelectedEquipment(equipment);
    setOpenForm(true);
  };

  const handleDeleteEquipment = (equipment: ExtendedEquipment) => {
    setSelectedEquipment(equipment);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedEquipment(null);
  };

  const confirmDelete = () => {
    if (selectedEquipment) {
      deleteMutation.mutate(selectedEquipment.equipmentId);
    }
  };
  
  const handleViewTree = (equipment: ExtendedEquipment) => {
    setViewingEquipmentId(equipment.equipmentId);
    setTreeViewOpen(true);
  };
  
  const handleTreeViewClose = () => {
    setTreeViewOpen(false);
    setViewingEquipmentId(null);
  };

  return (
    <Layout
      breadcrumbs={[
        { label: "首页", href: "/dashboard" },
        { label: "设备管理" },
      ]}
      title="设备管理"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-gray-500">
            管理系统中的所有设备信息
          </p>
        </div>
        <Button onClick={handleAddEquipment} className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> 添加设备
        </Button>
      </div>

      {/* Filter section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="base-filter" className="mb-1 block">基地</Label>
            <Select
              value={filters.baseId}
              onValueChange={(value) => handleFilterChange("baseId", value)}
            >
              <SelectTrigger id="base-filter">
                <SelectValue placeholder="全部基地" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部基地</SelectItem>
                {bases?.map((base) => (
                  <SelectItem key={base.baseId} value={base.baseId.toString()}>
                    {base.baseName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="workshop-filter" className="mb-1 block">车间</Label>
            <Select
              value={filters.workshopId}
              onValueChange={(value) => handleFilterChange("workshopId", value)}
              disabled={!filters.baseId}
            >
              <SelectTrigger id="workshop-filter">
                <SelectValue placeholder="全部车间" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部车间</SelectItem>
                {workshops?.filter(w => 
                  !filters.baseId || w.baseId.toString() === filters.baseId
                ).map((workshop) => (
                  <SelectItem key={workshop.workshopId} value={workshop.workshopId.toString()}>
                    {workshop.workshopName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="type-filter" className="mb-1 block">设备类型</Label>
            <Select
              value={filters.typeId}
              onValueChange={(value) => handleFilterChange("typeId", value)}
            >
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="全部类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部类型</SelectItem>
                {equipmentTypes?.map((type) => (
                  <SelectItem key={type.typeId} value={type.typeId.toString()}>
                    {type.typeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="设备名称搜索..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            {filters.search && (
              <button
                onClick={() => handleFilterChange("search", "")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <Button variant="default" onClick={() => handleSearch(filters.search)}>
            搜索
          </Button>
          <Button variant="outline" onClick={handleResetFilters}>
            重置
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={equipmentResponse?.data || []}
        columns={columns}
        isLoading={isLoadingEquipment}
        pagination={equipmentResponse?.pagination ? {
          pageIndex: equipmentResponse.pagination.page,
          pageSize: equipmentResponse.pagination.limit,
          pageCount: equipmentResponse.pagination.totalPages,
          total: equipmentResponse.pagination.total,
        } : undefined}
        sorting={sorting}
        onPaginationChange={handlePageChange}
        onSortingChange={handleSortChange}
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
              <ListTree className="h-4 w-4 mr-1" /> 备件结构
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditEquipment(row);
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
                handleDeleteEquipment(row);
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
              {selectedEquipment ? "编辑设备" : "添加设备"}
            </DialogTitle>
          </DialogHeader>
          <EquipmentForm
            defaultValues={selectedEquipment ? {
              equipmentName: selectedEquipment.equipmentName,
              workshopId: selectedEquipment.workshopId.toString(),
              typeId: selectedEquipment.typeId.toString()
            } : undefined}
            equipmentId={selectedEquipment?.equipmentId}
            onSuccess={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除"
        description={`您确定要删除设备 "${selectedEquipment?.equipmentName}" 吗？此操作不可撤销，且可能影响关联的部件和备件信息。`}
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
      />
      
      {/* Tree View Dialog */}
      <TreeViewDialog
        open={treeViewOpen}
        onOpenChange={handleTreeViewClose}
        title={`设备结构: ${equipmentResponse?.data?.find((e: ExtendedEquipment) => e.equipmentId === viewingEquipmentId)?.equipmentName || ''}`}
        data={equipmentHierarchy ? [equipmentHierarchy] : null}
        isLoading={isLoadingHierarchy}
      />
    </Layout>
  );
}
