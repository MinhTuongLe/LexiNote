import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div 
      className={`relative overflow-hidden rounded-lg bg-muted/80 dark:bg-muted/50 animate-pulse ${className}`}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-[shimmer_2s_infinite]" />
    </div>
  );
};

export { Skeleton };
export default Skeleton;
