import React from 'react';
import { Skeleton } from '../Skeleton';
import { Card, CardContent } from '../card';

export const ConfigPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border/60 shadow-xs">
        <div className="flex items-center gap-4">
          <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1 */}
          <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
            <div className="p-5 border-b border-border/60 bg-muted/20 flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-52" />
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
            <div className="p-5 border-b border-border/60 bg-muted/20 flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card className="border-border/60 bg-card shadow-xs p-5 space-y-6">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-7 h-7 rounded-md shrink-0" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <div className="space-y-3 pt-4 border-t border-border/60">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const UserDetailModalSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-1">
      {/* Profile Banner */}
      <div className="flex items-center gap-4 p-4 bg-muted/30 border border-border/60 rounded-xl">
        <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-56" />
        </div>
      </div>

      {/* KPI Stats Header */}
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/60 pb-2">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>

      {/* Content Form Block */}
      <div className="space-y-4">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
};
