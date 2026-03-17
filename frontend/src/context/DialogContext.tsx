import React, { createContext, useContext, useState, type ReactNode } from 'react';
import Dialog from '../components/Dialog';

interface DialogConfig {
  title: string;
  message: string;
  type: 'alert' | 'confirm' | 'success' | 'error';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

interface DialogContextType {
  showAlert: (title: string, message: string, type?: 'alert' | 'success' | 'error') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, config?: Partial<DialogConfig>) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

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
    <DialogContext.Provider value={{ showAlert, showConfirm }}>
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

export const useCuteDialog = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useCuteDialog must be used within a DialogProvider');
  return context;
};
