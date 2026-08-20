import React from 'react';
import { ISessionAnalytics } from '../../types/index.js';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import { Clock, Hourglass, CheckCircle2, Activity } from 'lucide-react';

export const AnalyticsView: React.FC<{ analytics: ISessionAnalytics | null }> = ({ analytics }) => {
  if (!analytics) return null;

  const { queue, panels, metrics } = analytics;

  const statCards = [
    {
      title: 'Avg. Waiting Time',
      value: `${metrics.averageWaitMinutes} min`,
      subtitle: `Longest wait: ${metrics.longestWaitMinutes} min`,
      icon: Hourglass,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
    },
    {
      title: 'Avg. Interview Duration',
      value: `${metrics.averageDurationMinutes} min`,
      subtitle: 'Target: 15 min / candidate',
      icon: Clock,
      color: 'text-blue-600 dark:text-[#CFEBFF]',
      bg: 'bg-blue-50 dark:bg-sky-950/50',
    },
    {
      title: 'Completed Interviews',
      value: queue.COMPLETED,
      subtitle: `${queue.TOTAL} total candidates registered`,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      title: 'Panel Utilization Rate',
      value: `${metrics.panelUtilizationPercentage}%`,
      subtitle: `${panels.OCCUPIED} of ${panels.AVAILABLE + panels.OCCUPIED + panels.PAUSED} active panels interviewing`,
      icon: Activity,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">{stat.subtitle}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center border border-slate-100 dark:border-slate-800`}>
                  <Icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Queue Breakdown & Panel Status Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Queue Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Waiting in Queue', count: queue.WAITING, color: 'bg-amber-500', total: queue.TOTAL },
              { label: 'Assigned to Panel', count: queue.ASSIGNED, color: 'bg-blue-500', total: queue.TOTAL },
              { label: 'Currently Interviewing', count: queue.INTERVIEWING, color: 'bg-purple-500', total: queue.TOTAL },
              { label: 'Interviews Completed', count: queue.COMPLETED, color: 'bg-emerald-500', total: queue.TOTAL },
              { label: 'Removed / Cancelled', count: queue.CANCELLED + queue.REMOVED, color: 'bg-slate-400', total: queue.TOTAL },
            ].map((item, idx) => {
              const pct = queue.TOTAL > 0 ? Math.round((item.count / queue.TOTAL) * 100) : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
                    <span className="font-mono text-slate-900 dark:text-white font-bold">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Panel Availability State */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Panel Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Available (Ready for Candidate)', count: panels.AVAILABLE, color: 'bg-emerald-500', total: panels.TOTAL },
              { label: 'Occupied (Interview in Progress)', count: panels.OCCUPIED, color: 'bg-rose-500', total: panels.TOTAL },
              { label: 'Paused (Break / Discussion)', count: panels.PAUSED, color: 'bg-amber-500', total: panels.TOTAL },
              { label: 'Offline', count: panels.OFFLINE, color: 'bg-slate-400', total: panels.TOTAL },
            ].map((item, idx) => {
              const pct = panels.TOTAL > 0 ? Math.round((item.count / panels.TOTAL) * 100) : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
                    <span className="font-mono text-slate-900 dark:text-white font-bold">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
