import React, { useState } from 'react';
import { IQueueEntry, IPanel } from '../../types/index.js';
import { StatusBadge } from '../common/StatusBadge.js';
import { Button } from '../ui/Button.js';
import { formatTime, formatQueueNumber } from '../../utils/formatters.js';
import { calculateDomainMatch } from '../../utils/domainMatcher.js';
import { UserCheck, Sparkles, UserX, Clock, ArrowRight, Filter, Search } from 'lucide-react';
import { EmptyState } from '../common/EmptyState.js';

interface QueueViewProps {
  queue: IQueueEntry[];
  availablePanels: IPanel[];
  onSelectStudent: (entry: IQueueEntry) => void;
  onQuickAssign: (entry: IQueueEntry, panelId: string) => void;
  onRemoveStudent: (entry: IQueueEntry) => void;
}

export const QueueView: React.FC<QueueViewProps> = ({
  queue,
  availablePanels,
  onSelectStudent,
  onQuickAssign,
  onRemoveStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WAITING' | 'ASSIGNED' | 'INTERVIEWING'>('WAITING');

  const filteredQueue = queue.filter((entry) => {
    const student = entry.studentId;
    if (!student) return false;

    // Status filter
    if (statusFilter !== 'ALL' && entry.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = student.name?.toLowerCase().includes(term);
      const matchReg = student.registrationNumber?.toLowerCase().includes(term);
      const matchBranch = student.branch?.toLowerCase().includes(term);
      if (!matchName && !matchReg && !matchBranch) return false;
    }

    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Queue Header & Filters */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            Waiting Queue (FCFS)
          </h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
            {queue.filter((q) => q.status === 'WAITING').length} Waiting
          </span>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 w-36 sm:w-48"
            />
          </div>

          {/* Status Segmented Control */}
          <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-medium text-slate-600">
            {(['WAITING', 'ASSIGNED', 'ALL'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Queue List / Table */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredQueue.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Candidates in Queue"
              description={
                statusFilter === 'WAITING'
                  ? 'No candidates are currently waiting. Candidates who scan the QR code will appear here in FCFS order.'
                  : 'No queue records matching the selected filter.'
              }
            />
          </div>
        ) : (
          filteredQueue.map((entry) => {
            const student = entry.studentId;
            if (!student) return null;

            // Find best matching available panel if any
            let bestPanelMatch: { panel: IPanel; match: any } | null = null;
            if (entry.status === 'WAITING' && availablePanels.length > 0) {
              const matches = availablePanels
                .map((p) => ({ panel: p, match: calculateDomainMatch(student, p) }))
                .filter((m) => m.match.level !== 'NO_MATCH')
                .sort((a, b) => b.match.score - a.match.score);

              if (matches.length > 0) {
                bestPanelMatch = matches[0];
              }
            }

            return (
              <div
                key={entry._id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left: Queue Number, Student Name, Reg, Preferences */}
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Immutable Queue Number Badge */}
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 shadow-xs font-mono font-bold text-sm">
                    <span>{formatQueueNumber(entry.queueNumber)}</span>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => onSelectStudent(entry)}
                        className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors text-left truncate cursor-pointer hover:underline"
                      >
                        {student.name}
                      </button>
                      <span className="text-xs font-mono text-slate-500 font-medium">
                        {student.registrationNumber}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {student.branch} • Yr {student.year}
                      </span>
                      <StatusBadge status={entry.status} size="sm" />
                    </div>

                    {/* Domain Preferences Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400 font-medium">Prefs:</span>
                      {student.domainPreferences?.map((pref: any, idx: number) => {
                        const domainName =
                          typeof pref.domainId === 'object' && pref.domainId !== null
                            ? pref.domainId.name
                            : `Domain ${pref.priority}`;
                        const domainColor =
                          typeof pref.domainId === 'object' && pref.domainId !== null
                            ? pref.domainId.color || '#3b82f6'
                            : '#3b82f6';

                        return (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1 border"
                            style={{
                              backgroundColor: `${domainColor}10`,
                              borderColor: `${domainColor}30`,
                              color: domainColor,
                            }}
                          >
                            <span className="text-[9px] font-bold opacity-70">#{pref.priority}</span>
                            <span>{domainName}</span>
                          </span>
                        );
                      })}
                    </div>

                    {/* Waiting time info */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Joined {formatTime(entry.joinedAt)}
                      </span>
                      {entry.assignedPanelId && (
                        <span className="text-blue-600 font-medium">
                          → Assigned to Panel {entry.assignedPanelId.panelCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions & Smart Match Suggestion */}
                <div className="flex items-center gap-2 sm:self-center shrink-0">
                  {entry.status === 'WAITING' && (
                    <>
                      {/* One-Click Match Helper Pill */}
                      {bestPanelMatch && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => onQuickAssign(entry, bestPanelMatch!.panel._id)}
                          className="text-xs gap-1.5 py-1 h-8 bg-emerald-600 hover:bg-emerald-700 font-semibold"
                          title={`Assign to ${bestPanelMatch.panel.panelCode} (${bestPanelMatch.match.label})`}
                        >
                          <Sparkles className="w-3 h-3 fill-emerald-200" />
                          <span>Assign {bestPanelMatch.panel.panelCode}</span>
                        </Button>
                      )}

                      {/* Main Details / Assign Drawer Button */}
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onSelectStudent(entry)}
                        className="text-xs gap-1 h-8"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Assign Panel</span>
                      </Button>
                    </>
                  )}

                  {entry.status === 'ASSIGNED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectStudent(entry)}
                      className="text-xs h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      Reassign
                    </Button>
                  )}

                  {/* Remove student button */}
                  {entry.status === 'WAITING' && (
                    <button
                      onClick={() => onRemoveStudent(entry)}
                      title="Remove from queue"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
