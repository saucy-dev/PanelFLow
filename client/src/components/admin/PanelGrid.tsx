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
  Sparkles,
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
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col h-full overflow-hidden">
      {/* Header & Filter Tabs */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Interview Panels
          </h2>
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.2 rounded-full">
            {availableCount} Available
          </span>
          {occupiedCount > 0 && (
            <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2 py-0.2 rounded-full">
              {occupiedCount} In Interview
            </span>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex bg-slate-200/70 p-0.5 rounded-lg text-[11px] font-semibold text-slate-600">
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
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'hover:text-slate-900'
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
          <div className="p-8 text-center text-slate-400 text-xs">
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
                className={`rounded-xl border transition-all duration-150 p-3.5 space-y-3 ${
                  isAvailable
                    ? 'border-emerald-200/90 bg-emerald-50/20 hover:border-emerald-300'
                    : isOccupied
                    ? 'border-rose-200/90 bg-rose-50/20 hover:border-rose-300'
                    : isPaused
                    ? 'border-amber-200/90 bg-amber-50/20'
                    : 'border-slate-200 bg-slate-50/50 opacity-85'
                }`}
              >
                {/* Row 1: Panel Badge, Title, Location & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-extrabold text-sm shrink-0 shadow-2xs ${
                        isAvailable
                          ? 'bg-emerald-600 text-white'
                          : isOccupied
                          ? 'bg-rose-600 text-white'
                          : isPaused
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      {panel.panelCode}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                          {panel.name}
                        </h3>
                      </div>
                      {panel.roomLocation && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" /> {panel.roomLocation}
                        </p>
                      )}
                    </div>
                  </div>

                  <StatusBadge status={panel.status} size="sm" />
                </div>

                {/* Row 2: Occupied Candidate Spotlight or Ready Status */}
                {isOccupied && candidate ? (
                  <div className="p-3 bg-white rounded-lg border border-rose-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 flex items-center gap-1">
                        <User className="w-3 h-3 text-rose-500" /> Active Candidate
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Since {formatTime(panel.statusUpdatedAt)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{candidate.name}</span>
                        <span className="text-[11px] font-mono text-slate-500 ml-2">
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
                            className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-blue-50 text-blue-700 border border-blue-100"
                          >
                            #{p.priority} {domainName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : isAvailable ? (
                  <div className="px-3 py-2 bg-emerald-50/60 rounded-lg border border-emerald-100/80 flex items-center justify-between text-xs text-emerald-800">
                    <span className="flex items-center gap-1.5 font-medium text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Ready for next candidate assignment
                    </span>
                    <button
                      onClick={() => onSelectPanel(panel)}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      Assign Student <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : null}

                {/* Row 3: Interviewers & Domain Tags */}
                <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 shrink-0">
                    <Users className="w-3 h-3" /> Team:
                  </span>
                  {interviewers.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">No interviewers assigned</span>
                  ) : (
                    interviewers.map((int: any) => (
                      <div
                        key={int._id}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white rounded-md border border-slate-200 text-[11px]"
                      >
                        <span className="font-semibold text-slate-800">{int.name}</span>
                        <div className="flex items-center gap-0.5">
                          {int.domains?.map((d: any) => (
                            <span
                              key={d._id || d}
                              className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-mono font-medium"
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
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {panel.status === 'PAUSED' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onUpdateStatus(panel._id, 'AVAILABLE')}
                        className="h-7 text-[11px] px-2.5 text-emerald-700 hover:bg-emerald-50 font-bold"
                      >
                        <PlayCircle className="w-3.5 h-3.5 mr-1" /> Resume Panel
                      </Button>
                    ) : panel.status === 'AVAILABLE' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onUpdateStatus(panel._id, 'PAUSED')}
                        className="h-7 text-[11px] px-2.5 text-amber-700 hover:bg-amber-50 font-bold"
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
                    className="h-7 text-[11px] px-2.5 ml-auto gap-1 font-semibold border-slate-200 hover:bg-slate-50"
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
