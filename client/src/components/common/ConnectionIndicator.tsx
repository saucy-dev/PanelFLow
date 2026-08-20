import React from 'react';
import { useSocketStore } from '../../store/socketStore.js';
import { cn } from '../../utils/cn.js';

export const ConnectionIndicator: React.FC<{ className?: string }> = ({ className }) => {
  const isConnected = useSocketStore((state) => state.isConnected);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors',
        isConnected
          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
        className
      )}
      title={isConnected ? 'Connected to live WebSocket server' : 'Reconnecting to server...'}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full shrink-0',
          isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-ping'
        )}
      />
      <span className="hidden sm:inline">{isConnected ? 'LIVE SYNC' : 'OFFLINE'}</span>
    </div>
  );
};
