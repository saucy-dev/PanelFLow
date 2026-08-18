import React from 'react';
import { cn } from '../../utils/cn.js';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const base = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-slate-100 text-slate-800 border border-slate-200',
    secondary: 'bg-slate-200 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/60',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/60',
    info: 'bg-blue-50 text-blue-700 border border-blue-200/60',
    outline: 'border border-slate-300 text-slate-700',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
