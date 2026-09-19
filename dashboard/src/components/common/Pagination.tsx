import React from 'react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number | ((prev: number) => number)) => void;
  totalItems?: number;
  limit?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  totalItems,
  limit,
  className = '',
}) => {
  if (totalPages <= 1 && !totalItems) return null;

  return (
    <div className={`p-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/10 text-xs ${className}`}>
      <p className="text-muted-foreground text-xs">
        Showing Page <span className="font-semibold text-foreground">{page}</span> of{' '}
        <span className="font-semibold text-foreground">{Math.max(1, totalPages)}</span>
        {totalItems !== undefined && (
          <span className="ml-1">({totalItems.toLocaleString()} total items)</span>
        )}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange((p: number) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="h-8 px-3 text-xs"
          >
            Previous
          </Button>

          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-muted-foreground">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(p)}
                    className={`w-7 h-7 rounded-md text-xs font-medium transition-all ${
                      page === p
                        ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange((p: number) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="h-8 px-3 text-xs"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
