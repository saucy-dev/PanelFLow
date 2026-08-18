import React from 'react';
import { Dialog } from '../ui/Dialog.js';
import { Button } from '../ui/Button.js';
import { IQueueEntry, IPanel } from '../../types/index.js';
import { calculateDomainMatch } from '../../utils/domainMatcher.js';
import { formatQueueNumber } from '../../utils/formatters.js';
import { Sparkles, UserCheck, Phone, Mail, GraduationCap } from 'lucide-react';

interface CallNextModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextEntry: IQueueEntry | null;
  availablePanels: IPanel[];
  onAssign: (entry: IQueueEntry, panelId: string) => void;
}

export const CallNextModal: React.FC<CallNextModalProps> = ({
  isOpen,
  onClose,
  nextEntry,
  availablePanels,
  onAssign,
}) => {
  if (!nextEntry || !nextEntry.studentId) return null;

  const student = nextEntry.studentId;

  // Rank available panels by domain match
  const rankedPanels = availablePanels
    .map((panel) => ({
      panel,
      match: calculateDomainMatch(student, panel),
    }))
    .sort((a, b) => b.match.score - a.match.score);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Call Next Candidate"
      description="Review the next student in FCFS arrival order and select a panel for interview assignment."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Next Student Highlight Card */}
        <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Next in FCFS Queue
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-600 text-white rounded">
              Ticket {formatQueueNumber(nextEntry.queueNumber)}
            </span>
          </div>

          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <h3 className="text-lg font-bold text-slate-900">{student.name}</h3>
            <span className="text-xs font-mono text-slate-600 font-semibold">
              {student.registrationNumber} • {student.branch} (Yr {student.year})
            </span>
          </div>

          {/* Ordered Domain Preferences */}
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Domain Preferences:</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {student.domainPreferences?.map((p: any, idx: number) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-md font-semibold bg-white border border-blue-200 text-blue-800 shadow-2xs"
                >
                  #{p.priority} {p.domainId?.name || p.domainId}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Available Panels Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Available Panels ({availablePanels.length})
            </h4>
            <span className="text-xs text-slate-400">Select one to finalize assignment</span>
          </div>

          {rankedPanels.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 text-center">
              No panels are currently AVAILABLE. Please wait for an ongoing interview to finish.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {rankedPanels.map(({ panel, match }) => {
                const isStrong = match.level === 'STRONG_MATCH';

                return (
                  <div
                    key={panel._id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      isStrong
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {panel.panelCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 truncate">
                          {panel.name}
                        </span>
                        {panel.roomLocation && (
                          <span className="text-[11px] text-slate-400">({panel.roomLocation})</span>
                        )}
                      </div>

                      {/* Domain match label */}
                      <p className="text-xs">
                        {isStrong ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 fill-emerald-600" /> {match.label}
                          </span>
                        ) : match.level === 'GOOD_MATCH' ? (
                          <span className="text-blue-700 font-medium">{match.label}</span>
                        ) : (
                          <span className="text-slate-400 italic">No direct domain match</span>
                        )}
                      </p>

                      <p className="text-[11px] text-slate-500 truncate">
                        Interviewers: {panel.interviewerIds?.map((i: any) => i.name).join(', ') || 'None'}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant={isStrong ? 'success' : 'primary'}
                      onClick={() => {
                        onAssign(nextEntry, panel._id);
                        onClose();
                      }}
                      className="shrink-0 text-xs gap-1.5 h-8 font-semibold"
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
      </div>
    </Dialog>
  );
};
