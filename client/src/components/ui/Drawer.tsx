import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[width];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={cn(
            'w-screen bg-white dark:bg-[#0F1626] shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200',
            widthClasses
          )}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
            <div>
              {title && <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>}
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 text-slate-900 dark:text-slate-100">{children}</div>
        </div>
      </div>
    </div>
  );
};
