import React from 'react';
import { Sparkles, Star } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { DomainMatchResult } from '../../types/index.js';

interface MatchIndicatorProps {
  matchResult: DomainMatchResult;
  size?: 'sm' | 'md';
  showDetails?: boolean;
}

export const MatchIndicator: React.FC<MatchIndicatorProps> = ({
  matchResult,
  size = 'md',
  showDetails = false,
}) => {
  const { level, label, matchedPreferences } = matchResult;

  if (level === 'STRONG_MATCH') {
    return (
      <div className="flex flex-col gap-1">
        <span
          className={cn(
            'inline-flex items-center gap-1 font-semibold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5',
            size === 'sm' ? 'text-[11px]' : 'text-xs'
          )}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Strong Match</span>
          {matchedPreferences.length > 0 && (
            <span className="text-emerald-600 font-normal ml-0.5">
              (Pref #{matchedPreferences[0].priority}: {matchedPreferences[0].domainName})
            </span>
          )}
        </span>
        {showDetails && matchedPreferences.length > 0 && (
          <p className="text-[11px] text-slate-500 pl-1">{label}</p>
        )}
      </div>
    );
  }

  if (level === 'GOOD_MATCH') {
    return (
      <div className="flex flex-col gap-1">
        <span
          className={cn(
            'inline-flex items-center gap-1 font-medium rounded-md bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5',
            size === 'sm' ? 'text-[11px]' : 'text-xs'
          )}
        >
          <Star className="w-3 h-3 text-blue-500 shrink-0 fill-blue-500" />
          <span>Good Match</span>
          {matchedPreferences.length > 0 && (
            <span className="text-blue-600 font-normal ml-0.5">
              (Pref #{matchedPreferences[0].priority}: {matchedPreferences[0].domainName})
            </span>
          )}
        </span>
      </div>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-normal rounded-md bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5',
        size === 'sm' ? 'text-[11px]' : 'text-xs'
      )}
    >
      No direct match
    </span>
  );
};
