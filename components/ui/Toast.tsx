'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, message, duration }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed z-50 pointer-events-none flex flex-col gap-2 p-4 bottom-0 left-0 right-0 sm:bottom-auto sm:top-4 sm:right-4 sm:left-auto sm:max-w-md w-full"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast.duration) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[var(--color-sage-deep)] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[var(--color-error)] shrink-0" />,
    info: <Info className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />,
  };

  const borders = {
    success: 'border-[var(--color-sage-deep)]',
    error: 'border-[var(--color-error)]',
    info: 'border-[var(--color-border)]',
  };

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 bg-[var(--color-surface)] border ${
        borders[toast.type]
      } rounded-[4px] shadow-[var(--shadow-soft)] text-body-small text-[var(--color-text)] transition-all`}
    >
      <div className="flex items-center gap-2.5">
        {icons[toast.type]}
        <span>{toast.message}</span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
