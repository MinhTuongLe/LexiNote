import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { useTranslation } from 'react-i18next';
import './Dialog.css';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'alert' | 'confirm' | 'success' | 'error';
  confirmText?: string;
  cancelText?: string;
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'alert',
  confirmText,
  cancelText
}) => {
  const { t } = useTranslation();
  
  const actualConfirmText = confirmText || t('common.ok');
  const actualCancelText = cancelText || t('common.cancel_cute');

  const getIcon = () => {
    switch (type) {
      case 'success': return '🎉';
      case 'error': return '😿';
      case 'confirm': return '❓';
      default: return '✨';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="cute-dialog">
        <div className="dialog-icon">{getIcon()}</div>
        <h2 className="dialog-title">{title}</h2>
        <p className="dialog-message">{message}</p>
        
        <div className="dialog-actions">
          {type === 'confirm' && (
            <Button variant="outline" onClick={onClose}>
              {actualCancelText}
            </Button>
          )}
          <Button 
            variant={type === 'error' ? 'primary' : 'primary'} 
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
          >
            {actualConfirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default Dialog;
