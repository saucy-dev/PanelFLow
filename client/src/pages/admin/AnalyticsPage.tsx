import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service.js';
import { Navbar } from '../../components/common/Navbar.js';
import { AnalyticsView } from '../../components/admin/AnalyticsView.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const AnalyticsPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['session-analytics'],
    queryFn: () => adminService.getAnalytics(),
    refetchInterval: 10000,
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Session Analytics & Metrics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time performance analytics, average candidate wait durations, and panel utilization.
          </p>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Calculating session statistics..." />
        ) : (
          <AnalyticsView analytics={data || null} />
        )}
      </main>
    </div>
  );
};
