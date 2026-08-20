import React from 'react';
import { cn } from '../../utils/cn.js';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div
    className={cn(
      'bg-white dark:bg-[#0F1626] rounded-2xl border border-[#FFDDB0] dark:border-slate-800 shadow-2xs transition-colors duration-150',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
  <h3 className={cn('text-base font-bold text-slate-900 dark:text-white leading-none tracking-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-xs text-slate-500 dark:text-slate-400 mt-1', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('p-5', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('px-5 py-3.5 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 rounded-b-2xl flex items-center justify-between', className)} {...props}>
    {children}
  </div>
);
