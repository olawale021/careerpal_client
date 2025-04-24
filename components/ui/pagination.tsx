import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  // Generate page numbers logic
  const generatePagination = () => {
    // Always show first page
    const firstPage = 1;
    // Always show last page
    const lastPage = totalPages;
    
    const pages: (number | "ellipsis")[] = [];
    
    // Add first page
    pages.push(firstPage);
    
    // Calculate range around current page
    const leftSibling = Math.max(2, currentPage - siblingCount);
    const rightSibling = Math.min(totalPages - 1, currentPage + siblingCount);
    
    // Add ellipsis if needed before current range
    if (leftSibling > 2) {
      pages.push("ellipsis");
    }
    
    // Add pages in range
    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== firstPage && i !== lastPage) {
        pages.push(i);
      }
    }
    
    // Add ellipsis if needed after current range
    if (rightSibling < totalPages - 1) {
      pages.push("ellipsis");
    }
    
    // Add last page if not already included
    if (lastPage !== firstPage) {
      pages.push(lastPage);
    }
    
    return pages;
  };
  
  const pages = generatePagination();

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>
      
      {pages.map((page, i) => (
        page === "ellipsis" ? (
          <Button 
            key={`ellipsis-${i}`}
            variant="ghost" 
            disabled
            className="h-8 w-8"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More pages</span>
          </Button>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => onPageChange(page)}
            className="h-8 w-8"
          >
            {page}
          </Button>
        )
      ))}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  );
} 