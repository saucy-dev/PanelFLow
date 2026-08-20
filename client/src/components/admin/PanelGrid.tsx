import React, { useState } from 'react';
import { IPanel, PanelStatus } from '../../types/index.js';
import { StatusBadge } from '../common/StatusBadge.js';
import { Button } from '../ui/Button.js';
import { formatTime } from '../../utils/formatters.js';
import {
  Users,
  User,
  ArrowRight,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  Building2,
  Clock,
} from 'lucide-react';

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
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'PAUSED'>('ALL');

  const filteredPanels = panels.filter((p) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PAUSED') return p.status === 'PAUSED' || p.status === 'OFFLINE';
    return p.status === statusFilter;
  });

  const availableCount = panels.filter((p) => p.status === 'AVAILABLE').length;
  const occupiedCount = panels.filter((p) => p.status === 'OCCUPIED').length;

  return (
    <div className="bg-white/90 dark:bg-[#0F1626]/90 backdrop-blur-md rounded-2xl border border-[#FFDDB0] dark:border-slate-800 shadow-2xs flex flex-col h-full overflow-hidden transition-colors duration-150">
      {/* Header & Filter Tabs */}
      <div className="p-3.5 border-b border-[#FFDDB0] dark:border-slate-800 bg-[#FFFCE1]/70 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Interview Panels
          </h2>
          <span className="bg-[#FFBE91] text-amber-950 text-[11px] font-bold px-2 py-0.2 rounded-full border border-[#EA9661]/40">
            {availableCount} Available
          </span>
          {occupiedCount > 0 && (
            <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-[11px] font-bold px-2 py-0.2 rounded-full border border-rose-200 dark:border-rose-800/60">
              {occupiedCount} In Interview
            </span>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex bg-[#FFDDB0]/50 dark:bg-slate-800/80 p-0.5 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          {(
            [
              { key: 'ALL', label: 'All' },
              { key: 'AVAILABLE', label: 'Available' },
              { key: 'OCCUPIED', label: 'Occupied' },
              { key: 'PAUSED', label: 'Paused' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-white dark:bg-[#111726] text-amber-950 dark:text-white shadow-2xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panels List */}
      <div className="p-3 flex-1 overflow-y-auto space-y-3">
        {filteredPanels.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            No interview panels match the selected filter.
          </div>
        ) : (
          filteredPanels.map((panel) => {
            const candidate = panel.currentCandidateId;
            const interviewers = panel.interviewerIds || [];

            const isAvailable = panel.status === 'AVAILABLE';
            const isOccupied = panel.status === 'OCCUPIED';
            const isPaused = panel.status === 'PAUSED';

            return (
              <div
                key={panel._id}
                className={`rounded-2xl border transition-all duration-150 p-3.5 space-y-3 ${
                  isAvailable
                    ? 'border-emerald-200/90 dark:border-emerald-800/50 bg-emerald-50/20 dark:bg-emerald-950/20 hover:border-emerald-300 dark:hover:border-emerald-700/60'
                    : isOccupied
                    ? 'border-[#FFBE91] dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 hover:border-[#F5A875]'
                    : isPaused
                    ? 'border-[#FFDDB0] dark:border-slate-800 bg-[#FFFCE1]/40 dark:bg-slate-900/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 opacity-85'
                }`}
              >
                {/* Row 1: Panel Badge, Title, Location & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-extrabold text-sm shrink-0 shadow-2xs border ${
                        isAvailable
                          ? 'bg-emerald-600 text-white border-emerald-700/40'
                          : isOccupied
                          ? 'bg-rose-600 text-white border-rose-700/40'
                          : isPaused
                          ? 'bg-[#FFBE91] text-amber-950 border-[#EA9661]/40'
                          : 'bg-slate-700 text-white border-slate-800'
                      }`}
                    >
                      {panel.panelCode}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                          {panel.name}
                        </h3>
                      </div>
                      {panel.roomLocation && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500" /> {panel.roomLocation}
                        </p>
                      )}
                    </div>
                  </div>

                  <StatusBadge status={panel.status} size="sm" />
                </div>

                {/* Row 2: Occupied Candidate Spotlight or Ready Status */}
                {isOccupied && candidate ? (
                  <div className="p-3 bg-white dark:bg-[#111726] rounded-xl border border-rose-200 dark:border-rose-900/60 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1">
                        <User className="w-3 h-3 text-rose-500" /> Active Candidate
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Since {formatTime(panel.statusUpdatedAt)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{candidate.name}</span>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 ml-2">
                          {candidate.registrationNumber} • {candidate.branch}
                        </span>
                      </div>
                    </div>

                    {/* Domain preferences */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      {candidate.domainPreferences?.map((p: any, idx: number) => {
                        const domainName = p.domainId?.name || p.domainId;
                        return (
                          <span
                            key={idx}
                            className="text-[9px] px-1.5 py-0.2 rounded-md font-medium bg-[#CFEBFF] dark:bg-[#CFEBFF]/20 text-sky-950 dark:text-[#CFEBFF] border border-[#BAE2FE] dark:border-[#CFEBFF]/30"
                          >
                            #{p.priority} {domainName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : isAvailable ? (
                  <div className="px-3 py-2 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-100/80 dark:border-emerald-800/40 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5 font-medium text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Ready for next candidate assignment
                    </span>
                    <button
                      onClick={() => onSelectPanel(panel)}
                      className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      Assign Student <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : null}

                {/* Row 3: Interviewers & Domain Tags */}
                <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1 shrink-0">
                    <Users className="w-3 h-3" /> Team:
                  </span>
                  {interviewers.length === 0 ? (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">No interviewers assigned</span>
                  ) : (
                    interviewers.map((int: any) => (
                      <div
                        key={int._id}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-[#111726] rounded-lg border border-[#FFDDB0] dark:border-slate-700 text-[11px]"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{int.name}</span>
                        <div className="flex items-center gap-0.5">
                          {int.domains?.map((d: any) => (
                            <span
                              key={d._id || d}
                              className="text-[9px] px-1.5 py-0.2 rounded bg-[#FFFCE1] dark:bg-[#FFFCE1]/15 text-amber-950 dark:text-[#FFDDB0] font-mono font-medium border border-[#FFDDB0]/60 dark:border-slate-700"
                            >
                              {d.name || d}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Row 4: Action Footer */}
                <div className="pt-2 border-t border-[#FFDDB0]/40 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {panel.status === 'PAUSED' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onUpdateStatus(panel._id, 'AVAILABLE')}
                        className="h-7 text-[11px] px-2.5 font-bold"
                      >
                        <PlayCircle className="w-3.5 h-3.5 mr-1" /> Resume Panel
                      </Button>
                    ) : panel.status === 'AVAILABLE' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onUpdateStatus(panel._id, 'PAUSED')}
                        className="h-7 text-[11px] px-2.5 font-bold dark:bg-slate-800 dark:text-amber-300 dark:border-slate-700"
                      >
                        <PauseCircle className="w-3.5 h-3.5 mr-1" /> Pause Panel
                      </Button>
                    ) : null}

                    {isOccupied && onCompleteInterview && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => onCompleteInterview(panel._id)}
                        className="h-7 text-[11px] px-2.5 bg-emerald-600 hover:bg-emerald-700 font-extrabold shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete Interview
                      </Button>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectPanel(panel)}
                    className="h-7 text-[11px] px-2.5 ml-auto gap-1 font-semibold border-[#FFDDB0] dark:border-slate-700 bg-white dark:bg-[#111726] text-slate-700 dark:text-slate-200 hover:bg-[#FFFCE1] dark:hover:bg-slate-800"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
