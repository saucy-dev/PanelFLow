import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '../ui/Button.js';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
      <Icon className="w-6 h-6" />
    </div>
    <h4 className="text-sm font-semibold text-slate-900 mb-1">{title}</h4>
    <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
    {actionLabel && onAction && (
      <Button size="sm" variant="primary" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading real-time data...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[300px] p-6 space-y-3">
    <div className="w-8 h-8 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
    <p className="text-xs font-medium text-slate-500">{message}</p>
  </div>
);
