import React, { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export type ToastPayload = { type: ToastType; title: string; message?: string };

export interface ToastFunction {
  (payload: ToastPayload): void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

interface ToastContextType {
  toast: ToastFunction;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
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
  success: 'bg-card border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-black/5',
  error: 'bg-card border-destructive/30 text-destructive shadow-lg shadow-black/5',
  info: 'bg-card border-primary/30 text-primary shadow-lg shadow-black/5',
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(({ type, title, message }: ToastPayload) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toastInstance = useMemo<ToastFunction>(() => {
    const mainFn = (payload: ToastPayload) => {
      addToast(payload);
    };

    return Object.assign(mainFn, {
      success: (title: string, message?: string) => {
        addToast({ type: 'success', title, message });
      },
      error: (title: string, message?: string) => {
        addToast({ type: 'error', title, message });
      },
      info: (title: string, message?: string) => {
        addToast({ type: 'info', title, message });
      },
    }) as ToastFunction;
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast: toastInstance }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none px-4">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md animate-in slide-in-from-top-2 fade-in duration-200 ${colors[t.type]}`}
            >
              <div className="mt-0.5 shrink-0">
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-foreground leading-tight">{t.title}</h4>
                {t.message && <p className="text-[11px] text-muted-foreground mt-0.5">{t.message}</p>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                aria-label="Close notification"
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
