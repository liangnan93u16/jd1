import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showEdges?: boolean;
  siblingCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showEdges = true,
  siblingCount = 1,
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    // Always show first, last, current, and siblings around current
    const range: (number | string)[] = [];
    
    const rangeStart = Math.max(1, currentPage - siblingCount);
    const rangeEnd = Math.min(totalPages, currentPage + siblingCount);
    
    // Handle first page and ellipsis
    if (rangeStart > 1) {
      if (showEdges) {
        range.push(1);
      }
      if (rangeStart > 2) {
        range.push("start-ellipsis");
      }
    }
    
    // Add page numbers in the range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      range.push(i);
    }
    
    // Handle last page and ellipsis
    if (rangeEnd < totalPages) {
      if (rangeEnd < totalPages - 1) {
        range.push("end-ellipsis");
      }
      if (showEdges) {
        range.push(totalPages);
      }
    }
    
    return range;
  };
  
  const pageNumbers = getPageNumbers();
  
  if (totalPages <= 1) {
    return null;
  }
  
  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <span className="sr-only">上一页</span>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {pageNumbers.map((page, index) => {
        if (typeof page === "string") {
          return (
            <Button
              key={`${page}-${index}`}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          );
        }
        
        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        );
      })}
      
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <span className="sr-only">下一页</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
