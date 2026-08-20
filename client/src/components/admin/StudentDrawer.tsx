import React from 'react';
import { Drawer } from '../ui/Drawer.js';
import { IQueueEntry, IPanel } from '../../types/index.js';
import { StatusBadge } from '../common/StatusBadge.js';
import { Button } from '../ui/Button.js';
import { calculateDomainMatch } from '../../utils/domainMatcher.js';
import { formatQueueNumber, formatTime } from '../../utils/formatters.js';
import { UserCheck, Sparkles, Building2, Phone, Mail, GraduationCap, Clock } from 'lucide-react';

interface StudentDrawerProps {
  entry: IQueueEntry | null;
  isOpen: boolean;
  onClose: () => void;
  panels: IPanel[];
  onAssign: (entry: IQueueEntry, panelId: string) => void;
}

export const StudentDrawer: React.FC<StudentDrawerProps> = ({
  entry,
  isOpen,
  onClose,
  panels,
  onAssign,
}) => {
  if (!entry || !entry.studentId) return null;

  const student = entry.studentId;

  // Categorize panels into Available and Others
  const availablePanels = panels.filter((p) => p.status === 'AVAILABLE');
  const otherPanels = panels.filter((p) => p.status !== 'AVAILABLE');

  // Calculate matches for all panels
  const rankedAvailablePanels = availablePanels
    .map((panel) => ({
      panel,
      match: calculateDomainMatch(student, panel),
    }))
    .sort((a, b) => b.match.score - a.match.score);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={student.name}
      subtitle={`Queue Ticket ${formatQueueNumber(entry.queueNumber)} • ${student.registrationNumber}`}
      width="lg"
    >
      <div className="space-y-6">
        {/* Candidate Profile Details */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Candidate Info</span>
            <StatusBadge status={entry.status} size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {student.branch} (Year {student.year})
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{student.email}</span>
            </div>
            {student.phone && (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{student.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Joined {formatTime(entry.joinedAt)}</span>
            </div>
          </div>

          {/* Domain Preferences List */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Domain Preferences (Ordered)
            </p>
            <div className="flex flex-col gap-1.5">
              {student.domainPreferences?.map((pref: any, idx: number) => {
                const domainName =
                  typeof pref.domainId === 'object' && pref.domainId !== null
                    ? pref.domainId.name
                    : `Domain ${pref.priority}`;

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs bg-[#CFEBFF]/10 dark:bg-sky-950/40 border-[#CFEBFF]/30 dark:border-sky-800/40"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Preference #{pref.priority}: {domainName}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Rank {pref.priority}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Available Matching Panels Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#FFBE91]" /> Available Matching Panels
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {availablePanels.length} panel{availablePanels.length === 1 ? '' : 's'} available
            </span>
          </div>

          {rankedAvailablePanels.length === 0 ? (
            <div className="p-4 text-center rounded-xl bg-amber-50/50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
              No interview panels are currently AVAILABLE. Please wait for an active interview to finish or resume a
              paused panel.
            </div>
          ) : (
            <div className="space-y-2.5">
              {rankedAvailablePanels.map(({ panel, match }) => {
                const isStrong = match.level === 'STRONG_MATCH';
                const isGood = match.level === 'GOOD_MATCH';

                return (
                  <div
                    key={panel._id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isStrong
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60 shadow-2xs'
                        : isGood
                        ? 'bg-blue-50/30 dark:bg-sky-950/40 border-blue-200 dark:border-sky-800/60'
                        : 'bg-white dark:bg-[#111726] border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                          {panel.panelCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                          {panel.name}
                        </span>
                      </div>

                      {/* Match explanation pill */}
                      {isStrong ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded">
                          <Sparkles className="w-3 h-3 fill-emerald-600 dark:fill-emerald-400" /> {match.label}
                        </span>
                      ) : isGood ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-[#CFEBFF] bg-blue-100/80 dark:bg-sky-950/80 px-2 py-0.5 rounded">
                          {match.label}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">No direct domain match</span>
                      )}

                      {/* Panel interviewers */}
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        Interviewers: {panel.interviewerIds?.map((i: any) => i.name).join(', ') || 'None'}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant={isStrong ? 'success' : 'primary'}
                      onClick={() => {
                        onAssign(entry, panel._id);
                        onClose();
                      }}
                      className="shrink-0 text-xs gap-1 h-8 px-3 font-semibold"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Assign to {panel.panelCode}</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Other Panels (Occupied / Paused) for Reassignment or Visibility */}
        {otherPanels.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Other Panels ({otherPanels.length})
            </p>
            <div className="grid grid-cols-2 gap-2">
              {otherPanels.map((p) => (
                <div
                  key={p._id}
                  className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between"
                >
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{p.panelCode}</span>
                  <StatusBadge status={p.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};
