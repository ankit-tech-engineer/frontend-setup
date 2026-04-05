'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './index';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  total,
  limit,
  onPageChange,
  onLimitChange,
  className
}) => {
  const totalPages = Math.ceil(total / limit) || 1;
  const startRange = (currentPage - 1) * limit + 1;
  const endRange = Math.min(currentPage * limit, total);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-muted/20 border-t border-border mt-auto", className)}>
      {/* Items Range Info */}
      <div className="flex flex-col">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Showing <span className="text-foreground">{startRange}-{endRange}</span> of <span className="text-foreground">{total}</span> Entries
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        {/* Limit Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Show</span>
          <select 
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="h-8 px-2 rounded-lg border border-border bg-background text-[10px] font-bold uppercase transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
          >
            {[10, 20, 50, 100].map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1.5">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 rounded-lg hover:border-indigo-400 disabled:opacity-30"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 rounded-lg hover:border-indigo-400 disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          <div className="flex items-center gap-1.5 px-2">
            {getPageNumbers().map((page, idx) => (
              typeof page === 'number' ? (
                <button
                  key={idx}
                  onClick={() => onPageChange(page)}
                  className={cn(
                    "min-w-[32px] h-8 px-2 rounded-lg text-[10px] font-bold uppercase transition-all border",
                    currentPage === page
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 dark:shadow-none"
                      : "bg-background border-border text-muted-foreground hover:border-indigo-400 hover:text-indigo-600"
                  )}
                >
                  {page}
                </button>
              ) : (
                <span key={idx} className="text-muted-foreground px-1 text-[10px] font-bold">...</span>
              )
            ))}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 rounded-lg hover:border-indigo-400 disabled:opacity-30"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 rounded-lg hover:border-indigo-400 disabled:opacity-30"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
