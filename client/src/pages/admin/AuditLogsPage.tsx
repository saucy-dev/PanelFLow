import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service.js';
import { Navbar } from '../../components/common/Navbar.js';
import { AuditLogStream } from '../../components/admin/AuditLogStream.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button.js';

export const AuditLogsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');

  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ['audit-events'],
    queryFn: () => adminService.getEvents(undefined, 200),
    refetchInterval: 10000,
  });

  const filteredEvents = events.filter((e) => {
    if (eventTypeFilter !== 'ALL' && e.eventType !== eventTypeFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchActor = e.actorName?.toLowerCase().includes(term);
      const matchType = e.eventType?.toLowerCase().includes(term);
      const matchMeta = JSON.stringify(e.metadata || {}).toLowerCase().includes(term);
      if (!matchActor && !matchType && !matchMeta) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Trail & Event Log</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable chronological record of all queue registrations, assignments, panel status shifts, and interview events.
            </p>
          </div>

          <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-1.5 self-start">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Logs
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by candidate, panel, or actor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500">Filter Event:</span>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Events</option>
              <option value="STUDENT_JOINED_QUEUE">Queue Registrations</option>
              <option value="STUDENT_ASSIGNED">Panel Assignments</option>
              <option value="STUDENT_REASSIGNED">Reassignments</option>
              <option value="INTERVIEW_COMPLETED">Interview Completions</option>
              <option value="PANEL_STATUS_CHANGED">Panel Status Shifts</option>
              <option value="DATA_IMPORTED">Google Sheets Imports</option>
            </select>
          </div>
        </div>

        {/* Logs */}
        {isLoading ? (
          <LoadingSpinner message="Fetching event log stream..." />
        ) : (
          <AuditLogStream events={filteredEvents} maxHeight="max-h-[650px]" showTitle={false} />
        )}
      </main>
    </div>
  );
};
