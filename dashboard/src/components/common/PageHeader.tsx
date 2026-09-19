import React, { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  icon,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3.5">
        {icon && (
          <div className="w-11 h-11 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {action && <div className="flex items-center gap-2.5">{action}</div>}
    </div>
  );
};

export default PageHeader;
