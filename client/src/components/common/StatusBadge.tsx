import React from 'react';
import { cn } from '../../utils/cn.js';
import { PanelStatus, QueueStatus } from '../../types/index.js';

interface StatusBadgeProps {
  status: PanelStatus | QueueStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  className,
}) => {
  const normStatus = (status || '').toUpperCase();

  const statusConfig: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
    // Panel States
    AVAILABLE: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-300 font-semibold',
      border: 'border-emerald-200/80 dark:border-emerald-800/60',
      dot: 'bg-emerald-500',
      label: 'Available',
    },
    OCCUPIED: {
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      text: 'text-rose-700 dark:text-rose-300 font-semibold',
      border: 'border-rose-200/80 dark:border-rose-800/60',
      dot: 'bg-rose-500 animate-pulse',
      label: 'Occupied',
    },
    PAUSED: {
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-700 dark:text-amber-300 font-semibold',
      border: 'border-amber-200/80 dark:border-amber-800/60',
      dot: 'bg-amber-500',
      label: 'Paused',
    },
    OFFLINE: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-600 dark:text-slate-300 font-medium',
      border: 'border-slate-200 dark:border-slate-700',
      dot: 'bg-slate-400',
      label: 'Offline',
    },

    // Queue / Student States
    WAITING: {
      bg: 'bg-amber-50/90 dark:bg-amber-950/60',
      text: 'text-amber-800 dark:text-amber-300 font-semibold',
      border: 'border-amber-200 dark:border-amber-800/60',
      dot: 'bg-amber-500 animate-live-dot',
      label: 'Waiting',
    },
    ASSIGNED: {
      bg: 'bg-blue-50 dark:bg-sky-950/60',
      text: 'text-blue-700 dark:text-[#CFEBFF] font-semibold',
      border: 'border-blue-200 dark:border-sky-800/60',
      dot: 'bg-blue-500',
      label: 'Assigned',
    },
    INTERVIEWING: {
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      text: 'text-purple-700 dark:text-purple-300 font-semibold',
      border: 'border-purple-200 dark:border-purple-800/60',
      dot: 'bg-purple-500 animate-pulse',
      label: 'Interviewing',
    },
    COMPLETED: {
      bg: 'bg-teal-50 dark:bg-teal-950/60',
      text: 'text-teal-700 dark:text-teal-300 font-semibold',
      border: 'border-teal-200 dark:border-teal-800/60',
      dot: 'bg-teal-500',
      label: 'Completed',
    },
    CANCELLED: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-500 dark:text-slate-400 font-medium',
      border: 'border-slate-200 dark:border-slate-700',
      dot: 'bg-slate-400',
      label: 'Cancelled',
    },
    REMOVED: {
      bg: 'bg-rose-50/70 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-300 font-medium',
      border: 'border-rose-200 dark:border-rose-800/50',
      dot: 'bg-rose-400',
      label: 'Removed',
    },
  };

  const config = statusConfig[normStatus] || {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-200',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
    label: status,
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    lg: 'text-xs px-3 py-1 gap-2 font-bold',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border select-none',
        config.bg,
        config.text,
        config.border,
        sizeClasses,
        className
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />}
      <span>{config.label}</span>
    </span>
  );
};
