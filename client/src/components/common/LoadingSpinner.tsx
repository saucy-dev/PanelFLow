import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading real-time data...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[300px] p-6 space-y-3">
    <div className="w-8 h-8 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
    <p className="text-xs font-medium text-slate-500">{message}</p>
  </div>
);
