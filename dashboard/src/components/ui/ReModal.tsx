import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const ReModal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  footer 
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalRoot = document.body;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4 z-9999">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#181c32]/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-card text-card-foreground rounded-3xl border border-border/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-95 fade-in duration-300">
        <div className="flex items-start justify-between pb-0 p-7">
          <div>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            {description && (
              <p className="mt-1 text-xs font-semibold text-muted-foreground">{description}</p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="flex items-center justify-center transition-all w-9 h-9 rounded-xl bg-muted/60 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-7">
          {children}
        </div>

        {footer && (
          <div className="flex justify-end gap-3 pt-0 p-7">
            {footer}
          </div>
        )}
      </div>
    </div>,
    modalRoot
  );
};

export { ReModal };
export default ReModal;
