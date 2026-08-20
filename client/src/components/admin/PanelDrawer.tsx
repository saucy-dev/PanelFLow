import React, { useState } from 'react';
import { Drawer } from '../ui/Drawer.js';
import { IPanel, IQueueEntry, PanelStatus } from '../../types/index.js';
import { StatusBadge } from '../common/StatusBadge.js';
import { Button } from '../ui/Button.js';
import { EditPanelModal } from '../common/EditPanelModal.js';
import { calculateDomainMatch } from '../../utils/domainMatcher.js';
import { formatQueueNumber, formatTime } from '../../utils/formatters.js';
import { Users, UserCheck, Sparkles, CheckCircle2, PauseCircle, PlayCircle, Clock, Settings2 } from 'lucide-react';

interface PanelDrawerProps {
  panel: IPanel | null;
  isOpen: boolean;
  onClose: () => void;
  waitingQueue: IQueueEntry[];
  onAssignStudent: (entry: IQueueEntry, panelId: string) => void;
  onUpdateStatus: (panelId: string, status: PanelStatus) => void;
  onCompleteInterview: (panelId: string) => void;
}

export const PanelDrawer: React.FC<PanelDrawerProps> = ({
  panel,
  isOpen,
  onClose,
  waitingQueue,
  onAssignStudent,
  onUpdateStatus,
  onCompleteInterview,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!panel) return null;

  const candidate = panel.currentCandidateId;
  const interviewers = panel.interviewerIds || [];

  // If panel is AVAILABLE, compute matching waiting candidates
  const matchingCandidates = waitingQueue
    .map((entry) => ({
      entry,
      match: calculateDomainMatch(entry.studentId, panel),
    }))
    .sort((a, b) => {
      if (b.match.score !== a.match.score) {
        return b.match.score - a.match.score;
      }
      return a.entry.queueNumber - b.entry.queueNumber;
    });

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={`Panel ${panel.panelCode} — ${panel.name}`}
        subtitle={panel.roomLocation || 'Room Location Not Specified'}
        width="lg"
      >
        <div className="space-y-6">
          {/* Panel Status Control Bar & Edit Button */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Panel Status</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={panel.status} size="md" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs h-7 gap-1 font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111726] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Settings2 className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                  <span>Edit Team</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {panel.status === 'AVAILABLE' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(panel._id, 'PAUSED')}
                  className="text-xs gap-1.5 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 bg-white dark:bg-[#111726]"
                >
                  <PauseCircle className="w-3.5 h-3.5" /> Pause Panel
                </Button>
              )}

              {panel.status === 'PAUSED' && (
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => onUpdateStatus(panel._id, 'AVAILABLE')}
                  className="text-xs gap-1.5"
                >
                  <PlayCircle className="w-3.5 h-3.5" /> Resume (Mark Available)
                </Button>
              )}

              {panel.status === 'OFFLINE' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onUpdateStatus(panel._id, 'AVAILABLE')}
                  className="text-xs gap-1.5"
                >
                  <PlayCircle className="w-3.5 h-3.5" /> Bring Online
                </Button>
              )}

              {panel.status !== 'OFFLINE' && panel.status !== 'OCCUPIED' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onUpdateStatus(panel._id, 'OFFLINE')}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  Set Offline
                </Button>
              )}
            </div>
          </div>

          {/* Interviewers Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" /> Panel Interviewers ({interviewers.length})
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-[11px] font-semibold text-amber-900 dark:text-[#FFBE91] hover:underline cursor-pointer"
              >
                + Manage Interviewers
              </button>
            </div>

            <div className="bg-white dark:bg-[#111726] rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {interviewers.length === 0 ? (
                <div className="p-4 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                  No interviewers assigned. Click "Manage Interviewers" to add.
                </div>
              ) : (
                interviewers.map((int: any) => (
                  <div key={int._id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{int.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">{int.email}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap justify-end">
                      {int.domains?.map((dom: any) => (
                        <span
                          key={dom._id || dom}
                          className="px-2 py-0.5 rounded bg-blue-50 dark:bg-sky-950/60 text-blue-700 dark:text-[#CFEBFF] font-mono font-medium text-[10px] border border-blue-200 dark:border-sky-800/60"
                        >
                          {dom.name || dom}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Current Candidate Card (If Occupied) */}
          {panel.status === 'OCCUPIED' && candidate && (
            <div className="bg-rose-50/50 dark:bg-rose-950/40 rounded-xl p-4 border border-rose-200 dark:border-rose-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">Current Candidate</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" /> Since {formatTime(panel.statusUpdatedAt)}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{candidate.name}</h4>
                <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {candidate.registrationNumber}
                </span>
              </div>

              {/* Candidate Domain Preferences */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {candidate.domainPreferences?.map((p: any, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    #{p.priority} {p.domainId?.name || p.domainId}
                  </span>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  variant="success"
                  size="md"
                  onClick={() => {
                    onCompleteInterview(panel._id);
                    onClose();
                  }}
                  className="w-full gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Interview Complete
                </Button>
              </div>
            </div>
          )}

          {/* Matching Waiting Candidates (If Available) */}
          {panel.status === 'AVAILABLE' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Matching Waiting Candidates ({waitingQueue.length})
                </h3>
                <span className="text-[11px] text-slate-400 dark:text-slate-400">Ranked by domain match & arrival</span>
              </div>

              {matchingCandidates.length === 0 ? (
                <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  No candidates currently waiting in the queue.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {matchingCandidates.map(({ entry, match }) => {
                    const student = entry.studentId;
                    const isStrong = match.level === 'STRONG_MATCH';

                    return (
                      <div
                        key={entry._id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          isStrong
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60'
                            : 'bg-white dark:bg-[#111726] border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-slate-900 dark:bg-[#FFBE91] text-white dark:text-amber-950 px-1.5 py-0.5 rounded">
                              {formatQueueNumber(entry.queueNumber)}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {student.name}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-400">
                              {student.registrationNumber}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                            {isStrong ? (
                              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <Sparkles className="w-3 h-3 fill-emerald-600 dark:fill-emerald-400 inline" /> {match.label}
                              </span>
                            ) : (
                              match.label
                            )}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          variant={isStrong ? 'success' : 'primary'}
                          onClick={() => {
                            onAssignStudent(entry, panel._id);
                            onClose();
                          }}
                          className="shrink-0 text-xs h-7 px-2.5 font-semibold"
                        >
                          <UserCheck className="w-3 h-3 mr-1" /> Assign
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </Drawer>

      {/* Edit Panel & Team Modal */}
      <EditPanelModal
        panel={panel}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
};
