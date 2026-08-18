import React from 'react';
import { IPanel, PanelStatus } from '../../types/index.js';
import { StatusBadge } from '../common/StatusBadge.js';
import { Button } from '../ui/Button.js';
import { formatTime } from '../../utils/formatters.js';
import { Users, User, ArrowRight, PauseCircle, PlayCircle, PowerOff, CheckCircle2 } from 'lucide-react';

interface PanelGridProps {
  panels: IPanel[];
  onSelectPanel: (panel: IPanel) => void;
  onUpdateStatus: (panelId: string, status: PanelStatus) => void;
  onCompleteInterview?: (panelId: string) => void;
}

export const PanelGrid: React.FC<PanelGridProps> = ({
  panels,
  onSelectPanel,
  onUpdateStatus,
  onCompleteInterview,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            Interview Panels
          </h2>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
            {panels.filter((p) => p.status === 'AVAILABLE').length} Available
          </span>
        </div>
        <span className="text-xs text-slate-500 font-medium">{panels.length} Total Panels</span>
      </div>

      {/* Grid */}
      <div className="p-4 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {panels.map((panel) => {
          const candidate = panel.currentCandidateId;
          const interviewers = panel.interviewerIds || [];

          return (
            <div
              key={panel._id}
              className={`rounded-xl border p-4 transition-all duration-150 flex flex-col justify-between ${
                panel.status === 'AVAILABLE'
                  ? 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300'
                  : panel.status === 'OCCUPIED'
                  ? 'border-rose-200 bg-rose-50/20 hover:border-rose-300'
                  : panel.status === 'PAUSED'
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-slate-200 bg-slate-50/60 opacity-80'
              }`}
            >
              <div>
                {/* Panel Top Row: Code, Name, Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900 font-mono">
                        {panel.panelCode}
                      </span>
                      <span className="text-xs text-slate-600 font-semibold truncate max-w-[140px] sm:max-w-[180px]">
                        {panel.name}
                      </span>
                    </div>
                    {panel.roomLocation && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{panel.roomLocation}</p>
                    )}
                  </div>
                  <StatusBadge status={panel.status} size="sm" />
                </div>

                {/* Interviewers & Their Domains */}
                <div className="space-y-1.5 mb-3 bg-white/70 rounded-lg p-2.5 border border-slate-100">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <Users className="w-3 h-3" /> Interviewers ({interviewers.length})
                  </div>
                  <div className="space-y-1">
                    {interviewers.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No interviewers assigned</p>
                    ) : (
                      interviewers.map((int: any) => (
                        <div key={int._id} className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-800">{int.name}</span>
                          <div className="flex items-center gap-1">
                            {int.domains?.map((dom: any) => (
                              <span
                                key={dom._id || dom}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono border border-slate-200"
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
                  <div className="mb-3 p-3 bg-white rounded-lg border border-rose-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                        <User className="w-3 h-3" /> Current Candidate
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatTime(panel.statusUpdatedAt)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <p className="text-sm font-bold text-slate-900">{candidate.name}</p>
                      <span className="text-xs font-mono text-slate-500">
                        {candidate.registrationNumber}
                      </span>
                    </div>

                    {/* Candidate Preferences */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      {candidate.domainPreferences?.map((p: any, idx: number) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-medium"
                        >
                          #{p.priority} {p.domainId?.name || p.domainId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons & Status Controls */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                <div className="flex items-center gap-1">
                  {/* Status Toggle Helpers */}
                  {panel.status === 'PAUSED' ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onUpdateStatus(panel._id, 'AVAILABLE')}
                      className="h-7 text-[11px] px-2 text-emerald-700 hover:bg-emerald-50"
                      title="Resume Panel"
                    >
                      <PlayCircle className="w-3.5 h-3.5 mr-1" /> Resume
                    </Button>
                  ) : panel.status === 'AVAILABLE' ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onUpdateStatus(panel._id, 'PAUSED')}
                      className="h-7 text-[11px] px-2 text-amber-700 hover:bg-amber-50"
                      title="Pause Panel"
                    >
                      <PauseCircle className="w-3.5 h-3.5 mr-1" /> Pause
                    </Button>
                  ) : null}

                  {panel.status === 'OCCUPIED' && onCompleteInterview && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => onCompleteInterview(panel._id)}
                      className="h-7 text-[11px] px-2.5 bg-emerald-600 hover:bg-emerald-700 font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete Interview
                    </Button>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectPanel(panel)}
                  className="h-7 text-xs px-2.5 ml-auto gap-1 border-slate-200"
                >
                  <span>Inspect Panel</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
