import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Info, X, XCircle } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: Toast['type'], message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (type: Toast['type'], message: string, duration: number = 3000) => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, type, message, duration }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    success: <CheckCircle size={18} className="text-emerald-400" />,
    error: <XCircle size={18} className="text-rose-400" />,
    warning: <AlertTriangle size={18} className="text-amber-400" />,
    info: <Info size={18} className="text-blue-400" />,
  };

  const borderColors = {
    success: 'border-l-emerald-400',
    error: 'border-l-rose-400',
    warning: 'border-l-amber-400',
    info: 'border-l-blue-400',
  };

  return (
    <div
      className={`
        glass-card-sm p-3 pr-10 border-l-4 ${borderColors[toast.type]}
        animate-slide-in-right shadow-glass-sm relative
      `}
    >
      <div className="flex items-start gap-2.5">
        {icons[toast.type]}
        <p className="text-sm text-[var(--color-text-primary)]">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="absolute top-2 right-2 p-1 rounded-md hover:bg-[var(--glass-bg-light)] text-[var(--color-text-muted)]"
      >
        <X size={14} />
      </button>
    </div>
  );
}
