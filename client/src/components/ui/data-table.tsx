import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type SortDirection = "asc" | "desc";

export type Column<T> = {
  header: string;
  accessorKey: string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
};

export type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  sorting?: {
    field: string;
    direction: SortDirection;
  };
  onPaginationChange?: (page: number) => void;
  onSortingChange?: (field: string, direction: SortDirection) => void;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  isLoading?: boolean;
  rowActions?: (item: T) => React.ReactNode;
};

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  rowClassName,
  pagination,
  sorting,
  onPaginationChange,
  onSortingChange,
  onSearch,
  searchPlaceholder = "搜索...",
  showSearch = true,
  isLoading = false,
  rowActions,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleSortingChange = (field: string) => {
    if (!onSortingChange) return;

    let direction: SortDirection = "asc";
    
    if (sorting?.field === field) {
      direction = sorting.direction === "asc" ? "desc" : "asc";
    }
    
    onSortingChange(field, direction);
  };

  const getSortingIcon = (field: string) => {
    if (sorting?.field !== field) return null;
    
    return sorting.direction === "asc" ? 
      <ChevronUp className="ml-1 h-4 w-4" /> : 
      <ChevronDown className="ml-1 h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {showSearch && (
        <form onSubmit={handleSearchSubmit} className="flex w-full max-w-sm space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-10"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { 
                  setSearchQuery(""); 
                  if (onSearch) onSearch("");
                }}
                className="absolute right-2.5 top-2.5"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
          <Button type="submit">搜索</Button>
        </form>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.accessorKey}
                  className={column.sortable ? "cursor-pointer select-none" : ""}
                  onClick={column.sortable ? () => handleSortingChange(column.accessorKey) : undefined}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && getSortingIcon(column.accessorKey)}
                  </div>
                </TableHead>
              ))}
              {rowActions && <TableHead>操作</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (rowActions ? 1 : 0)} className="h-24 text-center">
                  正在加载数据...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (rowActions ? 1 : 0)} className="h-24 text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow
                  key={index}
                  className={`${onRowClick ? "cursor-pointer hover:bg-gray-50" : ""} ${
                    rowClassName ? rowClassName(item) : ""
                  }`}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {columns.map((column) => (
                    <TableCell key={column.accessorKey}>
                      {column.cell
                        ? column.cell(item)
                        : (item as any)[column.accessorKey] || "-"}
                    </TableCell>
                  ))}
                  {rowActions && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        {rowActions(item)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            显示 {pagination.total > 0 ? (pagination.pageIndex - 1) * pagination.pageSize + 1 : 0} 到{" "}
            {Math.min(pagination.pageIndex * pagination.pageSize, pagination.total)} 条，
            共 {pagination.total} 条记录
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm">每页显示</span>
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) => {
                  if (onPaginationChange) {
                    // Reset to page 1 when changing page size
                    onPaginationChange(1);
                  }
                }}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue placeholder={pagination.pageSize.toString()} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Pagination
              currentPage={pagination.pageIndex}
              totalPages={pagination.pageCount}
              onPageChange={onPaginationChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
