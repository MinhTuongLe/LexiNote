import React from 'react';
import Tooltip from '@/components/ui/Tooltip';

interface UserRoleBadgeProps {
  role: string;
  onClick?: () => void;
  tooltipContent?: string;
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({
  role,
  onClick,
  tooltipContent,
}) => {
  const isAdmin = role === 'ADMIN';

  const badgeContent = (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-md transition-all ${
        onClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
      } ${
        isAdmin
          ? 'bg-primary/15 text-primary border border-primary/30 font-bold'
          : 'bg-muted text-muted-foreground border border-border/60'
      }`}
    >
      {role || 'MEMBER'}
    </button>
  );

  if (tooltipContent) {
    return <Tooltip content={tooltipContent} side="top">{badgeContent}</Tooltip>;
  }

  return badgeContent;
};

export default UserRoleBadge;
