import { createContext, useContext } from 'react';

export interface DialogConfig {
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
  closeDialog: () => void;
}

export const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useCuteDialog = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useCuteDialog must be used within a DialogProvider');
  return context;
};
