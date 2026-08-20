import React, { useState } from 'react';
import { IQueueEntry, IPanel } from '../../types/index.js';
import { StatusBadge } from '../common/StatusBadge.js';
import { Button } from '../ui/Button.js';
import { formatTime, formatQueueNumber } from '../../utils/formatters.js';
import { calculateDomainMatch } from '../../utils/domainMatcher.js';
import { UserCheck, Sparkles, UserX, Clock, Search } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WAITING' | 'ASSIGNED'>('WAITING');

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

  const waitingCount = queue.filter((q) => q.status === 'WAITING').length;

  return (
    <div className="bg-white/90 dark:bg-[#0F1626]/90 backdrop-blur-md rounded-2xl border border-[#FFDDB0] dark:border-slate-800 shadow-2xs flex flex-col h-full overflow-hidden transition-colors duration-150">
      {/* Queue Header & Filters */}
      <div className="p-3.5 border-b border-[#FFDDB0] dark:border-slate-800 bg-[#FFFCE1]/70 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Waiting Queue
          </h2>
          <span className="bg-[#FFBE91] text-amber-950 text-[11px] font-bold px-2 py-0.2 rounded-full border border-[#EA9661]/40">
            {waitingCount} Waiting
          </span>
        </div>

        {/* Search & Tabs */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-7.5 pl-8 pr-2.5 text-xs bg-white dark:bg-[#111726] border border-[#FFDDB0] dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:border-[#FFBE91] focus:ring-1 focus:ring-[#FFBE91] w-32 sm:w-40"
            />
          </div>

          <div className="flex bg-[#FFDDB0]/50 dark:bg-slate-800/80 p-0.5 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            {(['WAITING', 'ASSIGNED', 'ALL'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white dark:bg-[#111726] text-amber-950 dark:text-white font-bold shadow-2xs'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Queue Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#FFDDB0]/40 dark:divide-slate-800">
        {filteredQueue.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Candidates in Queue"
              description={
                statusFilter === 'WAITING'
                  ? 'No candidates are waiting right now. Candidates who scan the QR code will appear here in queue order.'
                  : 'No candidate records match the selected filter.'
              }
            />
          </div>
        ) : (
          filteredQueue.map((entry) => {
            const student = entry.studentId;
            if (!student) return null;

            // Find best matching available panel
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
                className="p-3.5 hover:bg-[#FFFCE1]/50 dark:hover:bg-slate-900/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#FFBE91] text-amber-950 border border-[#EA9661]/40 flex items-center justify-center shrink-0 font-mono font-bold text-xs shadow-2xs">
                    {formatQueueNumber(entry.queueNumber)}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => onSelectStudent(entry)}
                        className="text-xs font-bold text-slate-900 dark:text-white hover:text-amber-900 dark:hover:text-[#FFBE91] transition-colors text-left truncate cursor-pointer hover:underline"
                      >
                        {student.name}
                      </button>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-medium">
                        {student.registrationNumber}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#CFEBFF]/60 dark:bg-[#CFEBFF]/20 text-sky-900 dark:text-[#CFEBFF] border border-[#BAE2FE] dark:border-[#CFEBFF]/30 font-medium">
                        {student.branch} • Y{student.year}
                      </span>
                      <StatusBadge status={entry.status} size="sm" />
                    </div>

                    {/* Domain Preferences */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {student.domainPreferences?.map((pref: any, idx: number) => {
                        const domainName =
                          typeof pref.domainId === 'object' && pref.domainId !== null
                            ? pref.domainId.name
                            : `Domain ${pref.priority}`;

                        return (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[#FFFCE1] dark:bg-[#FFFCE1]/15 text-amber-950 dark:text-[#FFDDB0] border border-[#FFDDB0] dark:border-slate-700"
                          >
                            <span className="text-amber-700 dark:text-[#FFBE91] font-bold mr-1">#{pref.priority}</span>
                            {domainName}
                          </span>
                        );
                      })}
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTime(entry.joinedAt)}
                      </span>
                      {entry.assignedPanelId && (
                        <span className="text-sky-800 dark:text-[#CFEBFF] font-semibold">
                          → Assigned to Panel {entry.assignedPanelId.panelCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 sm:self-center shrink-0">
                  {entry.status === 'WAITING' && (
                    <>
                      {bestPanelMatch && (
                        <Button
                          size="sm"
                          variant="ice"
                          onClick={() => onQuickAssign(entry, bestPanelMatch!.panel._id)}
                          className="text-[11px] gap-1 h-7.5 font-bold"
                          title={`Assign to ${bestPanelMatch.panel.panelCode} (${bestPanelMatch.match.label})`}
                        >
                          <Sparkles className="w-3 h-3 text-sky-700" />
                          <span>Assign {bestPanelMatch.panel.panelCode}</span>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onSelectStudent(entry)}
                        className="text-[11px] gap-1 h-7.5 font-bold"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Assign Panel</span>
                      </Button>
                    </>
                  )}

                  {entry.status === 'ASSIGNED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectStudent(entry)}
                      className="text-[11px] h-7.5 text-sky-900 dark:text-[#CFEBFF] border-[#BAE2FE] dark:border-sky-800 bg-[#CFEBFF]/30 dark:bg-sky-950/40 hover:bg-[#CFEBFF] dark:hover:bg-sky-900/60 font-semibold"
                    >
                      Reassign
                    </Button>
                  )}

                  {entry.status === 'WAITING' && (
                    <button
                      onClick={() => onRemoveStudent(entry)}
                      title="Remove from queue"
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <UserX className="w-3.5 h-3.5" />
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
