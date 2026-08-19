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
      bg: 'bg-emerald-50',
      text: 'text-emerald-700 font-semibold',
      border: 'border-emerald-200/80',
      dot: 'bg-emerald-500',
      label: 'Available',
    },
    OCCUPIED: {
      bg: 'bg-rose-50',
      text: 'text-rose-700 font-semibold',
      border: 'border-rose-200/80',
      dot: 'bg-rose-500 animate-pulse',
      label: 'Occupied',
    },
    PAUSED: {
      bg: 'bg-amber-50',
      text: 'text-amber-700 font-semibold',
      border: 'border-amber-200/80',
      dot: 'bg-amber-500',
      label: 'Paused',
    },
    OFFLINE: {
      bg: 'bg-slate-100',
      text: 'text-slate-600 font-medium',
      border: 'border-slate-200',
      dot: 'bg-slate-400',
      label: 'Offline',
    },

    // Queue / Student States
    WAITING: {
      bg: 'bg-amber-50/90',
      text: 'text-amber-800 font-semibold',
      border: 'border-amber-200',
      dot: 'bg-amber-500 animate-live-dot',
      label: 'Waiting',
    },
    ASSIGNED: {
      bg: 'bg-blue-50',
      text: 'text-blue-700 font-semibold',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
      label: 'Assigned',
    },
    INTERVIEWING: {
      bg: 'bg-purple-50',
      text: 'text-purple-700 font-semibold',
      border: 'border-purple-200',
      dot: 'bg-purple-500 animate-pulse',
      label: 'Interviewing',
    },
    COMPLETED: {
      bg: 'bg-teal-50',
      text: 'text-teal-700 font-semibold',
      border: 'border-teal-200',
      dot: 'bg-teal-500',
      label: 'Completed',
    },
    CANCELLED: {
      bg: 'bg-slate-100',
      text: 'text-slate-500 font-medium',
      border: 'border-slate-200',
      dot: 'bg-slate-400',
      label: 'Cancelled',
    },
    REMOVED: {
      bg: 'bg-rose-50/70',
      text: 'text-rose-600 font-medium',
      border: 'border-rose-200',
      dot: 'bg-rose-400',
      label: 'Removed',
    },
  };

  const config = statusConfig[normStatus] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
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
