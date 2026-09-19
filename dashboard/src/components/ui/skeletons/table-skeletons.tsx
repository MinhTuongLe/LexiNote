import React from 'react';
import { Skeleton } from '../Skeleton';
import { TableRow, TableCell } from '../table';

export interface TableSkeletonProps {
  rows?: number;
}

export const UserTableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent border-b border-border/60">
          {/* User Profile */}
          <TableCell className="px-6 py-3.5">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
          </TableCell>

          {/* Role */}
          <TableCell className="px-6 py-3.5">
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>

          {/* Status */}
          <TableCell className="px-6 py-3.5">
            <Skeleton className="h-5 w-20 rounded-full" />
          </TableCell>

          {/* Word Count */}
          <TableCell className="px-6 py-3.5 text-center">
            <Skeleton className="h-4 w-10 mx-auto" />
          </TableCell>

          {/* Joined Date */}
          <TableCell className="px-6 py-3.5">
            <Skeleton className="h-4 w-24" />
          </TableCell>

          {/* Actions */}
          <TableCell className="px-6 py-3.5 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export const AuditTableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent border-b border-border/60">
          {/* Timestamp */}
          <TableCell className="px-6 py-3.5 whitespace-nowrap">
            <Skeleton className="h-4 w-28" />
          </TableCell>

          {/* Actor */}
          <TableCell className="px-6 py-3.5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-7 h-7 rounded-full shrink-0" />
              <Skeleton className="h-4 w-36" />
            </div>
          </TableCell>

          {/* Action */}
          <TableCell className="px-6 py-3.5">
            <Skeleton className="h-5 w-24 rounded-full" />
          </TableCell>

          {/* Target */}
          <TableCell className="px-6 py-3.5">
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
          </TableCell>

          {/* IP Address */}
          <TableCell className="px-6 py-3.5 font-mono">
            <Skeleton className="h-4 w-24" />
          </TableCell>

          {/* Details Button */}
          <TableCell className="px-6 py-3.5 text-right">
            <Skeleton className="h-8 w-16 rounded-md ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export const TrashTableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent border-b border-border/60">
          {/* Item Type */}
          <TableCell className="px-6 py-3.5">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded-sm shrink-0" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </TableCell>

          {/* Record Details */}
          <TableCell className="px-6 py-3.5">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </TableCell>

          {/* Deleted Date */}
          <TableCell className="px-6 py-3.5">
            <Skeleton className="h-4 w-24" />
          </TableCell>

          {/* Deleted By */}
          <TableCell className="px-6 py-3.5">
            <Skeleton className="h-4 w-28" />
          </TableCell>

          {/* Actions */}
          <TableCell className="px-6 py-3.5 text-right">
            <div className="flex items-center justify-end gap-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};
