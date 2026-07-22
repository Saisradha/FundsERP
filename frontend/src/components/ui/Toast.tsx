import React from 'react';
import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

/* ================================================================
   Toast Store
   ================================================================ */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (variant: ToastVariant, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (variant, message, duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set((state) => ({ toasts: [...state.toasts, { id, variant, message, duration }] }));
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/* Shorthand helpers */
export const toast = {
  success: (msg: string) => useToastStore.getState().addToast('success', msg),
  error: (msg: string) => useToastStore.getState().addToast('error', msg),
  warning: (msg: string) => useToastStore.getState().addToast('warning', msg),
  info: (msg: string) => useToastStore.getState().addToast('info', msg),
};

/* ================================================================
   Toast Provider UI
   ================================================================ */
const iconMap: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4" />,
  error: <XCircle className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />,
};

const colorMap: Record<ToastVariant, string> = {
  success: 'chip-success',
  error: 'chip-danger',
  warning: 'chip-warning',
  info: 'chip-primary',
};

export const ToastProvider: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium shadow-lg border ${colorMap[t.variant]}`}
            style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)' }}
            role="alert"
          >
            <span className={colorMap[t.variant]}>{iconMap[t.variant]}</span>
            <span className="flex-1" style={{ color: 'var(--color-text)' }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="opacity-50 hover:opacity-100 cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
