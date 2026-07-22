import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
}) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backgroundColor: 'var(--color-modal-overlay)' }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${sizeMap[size]} rounded-2xl p-6 shadow-2xl border`}
            style={{
              backgroundColor: 'var(--color-modal-bg)',
              borderColor: 'var(--color-border)',
            }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {/* Header */}
            {(title || subtitle) && (
              <div className="flex items-start justify-between mb-5">
                <div>
                  {subtitle && (
                    <p className="text-[10px] font-mono uppercase tracking-widest mb-1"
                       style={{ color: 'var(--color-primary)' }}>
                      {subtitle}
                    </p>
                  )}
                  {title && (
                    <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                      {title}
                    </h2>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:opacity-80 focus-ring cursor-pointer"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
