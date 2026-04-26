import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './button';

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#181c32]/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-[0_30px_70px_rgba(0,0,0,0.25)] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="p-8 pb-0 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-[#181c32]">{title}</h2>
            {description && (
              <p className="text-xs font-semibold text-[#a1a5b7] mt-1">{description}</p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f5f8fa] text-[#a1a5b7] hover:bg-[#fff5f8] hover:text-[#f1416c] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {children}
        </div>

        {footer && (
          <div className="p-8 pt-0 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    modalRoot
  );
};

export default ReModal;
