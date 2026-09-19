import React from 'react';
import { Skeleton } from '../Skeleton';
import { Card, CardContent } from '../card';

export const MetricCardSkeleton: React.FC = () => {
  return (
    <Card className="border-border/60 bg-card shadow-xs">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
      </CardContent>
    </Card>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <Card className="border-border/60 bg-card shadow-xs">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>

        {/* Chart Body Simulation */}
        <div className="h-[320px] w-full flex flex-col justify-between pt-4 pb-2 border-b border-l border-border/60">
          <div className="space-y-6 w-full">
            <div className="w-full h-px bg-border/40 border-dashed" />
            <div className="w-full h-px bg-border/40 border-dashed" />
            <div className="w-full h-px bg-border/40 border-dashed" />
            <div className="w-full h-px bg-border/40 border-dashed" />
          </div>
          
          {/* Simulated Bars / Wave Line */}
          <div className="flex items-end justify-between px-4 h-48 gap-2">
            {[40, 65, 30, 85, 55, 90, 70, 45, 60, 80, 50, 75].map((h, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton className={`w-full rounded-t-sm`} style={{ height: `${h}%` }} />
                <Skeleton className="h-3 w-6" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ActivityStreamSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-2 rounded-lg">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};
