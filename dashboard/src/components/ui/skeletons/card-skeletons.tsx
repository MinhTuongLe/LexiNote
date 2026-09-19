import React from 'react';
import { Skeleton } from '../Skeleton';
import { Card, CardContent } from '../card';

export interface CardGridSkeletonProps {
  count?: number;
}

export const WordCardSkeleton: React.FC<CardGridSkeletonProps> = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border/60 bg-card shadow-xs overflow-hidden rounded-xl">
          <CardContent className="p-5 space-y-4">
            {/* Header: Title, Badge, Owner Avatar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-6 w-32 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="w-6 h-6 rounded-full" />
            </div>

            {/* Meaning Box */}
            <div className="p-3 bg-muted/30 border border-border/40 rounded-lg space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            {/* Example sentence */}
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3.5 w-full" />
            </div>

            {/* Tag Pills */}
            <div className="flex items-center gap-1.5 pt-1">
              <Skeleton className="h-5 w-14 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-12 rounded-md" />
            </div>

            {/* Card Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-16 rounded-md" />
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export const ModerationCardSkeleton: React.FC<CardGridSkeletonProps> = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border/60 bg-card shadow-xs overflow-hidden rounded-xl">
          <CardContent className="p-5 space-y-4">
            {/* Submitter Info & Status */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>

            {/* Word & Definition Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-muted/20 border border-border/40 rounded-lg">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-border/40 pt-2 md:pt-0 md:pl-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};
