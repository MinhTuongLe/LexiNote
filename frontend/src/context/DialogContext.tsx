import React, { useState, type ReactNode } from 'react';
import Dialog from '../components/Dialog';
import { DialogContext, type DialogConfig } from './useCuteDialog';

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<DialogConfig>({
    title: '',
    message: '',
    type: 'alert'
  });

  const showAlert = (title: string, message: string, type: 'alert' | 'success' | 'error' = 'alert') => {
    setConfig({ title, message, type });
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, extra?: Partial<DialogConfig>) => {
    setConfig({ 
      title, 
      message, 
      type: 'confirm', 
      onConfirm,
      ...extra 
    });
    setIsOpen(true);
  };

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm, closeDialog }}>
      {children}
      <Dialog 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={config.onConfirm}
        title={config.title}
        message={config.message}
        type={config.type}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
      />
    </DialogContext.Provider>
  );
};
