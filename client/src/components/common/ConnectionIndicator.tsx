import React from 'react';
import { useSocketStore } from '../../store/socketStore.js';
import { cn } from '../../utils/cn.js';
import { Radio } from 'lucide-react';

export const ConnectionIndicator: React.FC<{ className?: string }> = ({ className }) => {
  const isConnected = useSocketStore((state) => state.isConnected);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
        isConnected
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-rose-50 text-rose-700 border-rose-200',
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
