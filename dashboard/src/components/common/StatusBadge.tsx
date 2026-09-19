import React from 'react';
import Tooltip from '@/components/ui/Tooltip';

interface StatusBadgeProps {
  isActive: boolean;
  activeText?: string;
  inactiveText?: string;
  onClick?: () => void;
  tooltipContent?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  isActive,
  activeText = 'Active',
  inactiveText = 'Inactive',
  onClick,
  tooltipContent,
}) => {
  const badgeContent = (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      } ${
        isActive
          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
          : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
        }`}
      />
      {isActive ? activeText : inactiveText}
    </span>
  );

  if (tooltipContent) {
    return <Tooltip content={tooltipContent} side="top">{badgeContent}</Tooltip>;
  }

  return badgeContent;
};

export default StatusBadge;
