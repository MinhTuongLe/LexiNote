import React from 'react';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';
import ReModal from './ReModal';
import { Button } from './button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
}) => {
  const iconMap = {
    danger: <Trash2 size={24} className="text-destructive" />,
    warning: <AlertTriangle size={24} className="text-amber-500" />,
    primary: <Info size={24} className="text-primary" />,
  };

  const buttonVariantMap: Record<'danger' | 'warning' | 'primary', 'destructive' | 'default' | 'default'> = {
    danger: 'destructive',
    warning: 'default',
    primary: 'default',
  };

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <ReModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      footer={
        <div className="flex items-center gap-2.5 w-full justify-end">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={buttonVariantMap[variant]}
            size="sm"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-4 pt-2">
        <div className="p-3 rounded-2xl bg-muted/60 border border-border/60 shrink-0">
          {iconMap[variant]}
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground tracking-tight">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
        </div>
      </div>
    </ReModal>
  );
};

export default ConfirmModal;
