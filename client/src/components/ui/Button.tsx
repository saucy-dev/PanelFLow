import React from 'react';
import { cn } from '../../utils/cn.js';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ice' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[#FFBE91] text-amber-950 hover:bg-[#F5A875] active:bg-[#EA9661] focus-visible:ring-[#FFBE91] border border-[#EA9661]/40 shadow-xs font-bold',
      secondary:
        'bg-[#FFDDB0] text-amber-900 hover:bg-[#F2CCA0] active:bg-[#E2B882] focus-visible:ring-[#FFDDB0] border border-[#E2B882]/40 shadow-2xs font-semibold',
      ice:
        'bg-[#CFEBFF] text-sky-900 hover:bg-[#BAE2FE] active:bg-[#93C5FD] focus-visible:ring-[#CFEBFF] border border-[#93C5FD]/50 shadow-2xs font-semibold',
      outline:
        'bg-white/90 border border-[#FFDDB0] text-slate-800 hover:bg-[#FFFCE1] hover:border-[#FFBE91] focus-visible:ring-[#FFBE91] shadow-2xs font-medium',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500 shadow-xs font-semibold',
      success:
        'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 shadow-xs font-semibold',
      ghost:
        'bg-transparent text-slate-700 hover:text-slate-900 hover:bg-[#FFDDB0]/30 focus-visible:ring-[#FFBE91]',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
      md: 'text-xs px-3.5 py-2 gap-2 h-9 font-semibold',
      lg: 'text-sm px-5 py-2.5 gap-2.5 h-11 font-bold',
      icon: 'h-8 w-8 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
