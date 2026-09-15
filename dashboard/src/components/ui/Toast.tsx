import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (payload: { type: ToastType; title: string; message?: string }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

const icons: Record<ToastType, LucideIcon> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const colors: Record<ToastType, string> = {
  success: 'bg-[#e8fff3] border-[#50cd89]/20 text-[#50cd89]',
  error: 'bg-[#fff5f8] border-[#f1416c]/20 text-[#f1416c]',
  info: 'bg-[#f1faff] border-[#009ef7]/20 text-[#009ef7]',
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ type, title, message }: { type: ToastType; title: string; message?: string }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[10000] flex flex-col gap-3 w-full max-w-[360px]">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div 
              key={t.id}
              className={`flex items-start gap-4 p-4 rounded-2xl border shadow-lg animate-in slide-in-from-right fade-in duration-300 ${colors[t.type]}`}
            >
              <div className="mt-0.5">
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold leading-tight">{t.title}</h4>
                {t.message && <p className="text-[11px] font-semibold opacity-80 mt-1">{t.message}</p>}
              </div>
              <button 
                onClick={() => removeToast(t.id)}
                className="hover:opacity-60 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
