import React, { useState } from 'react';
import { IPanel, PanelStatus } from '../../types/index.js';
import { StatusBadge } from '../common/StatusBadge.js';
import { Button } from '../ui/Button.js';
import { EditPanelModal } from '../common/EditPanelModal.js';
import { Users, PauseCircle, PlayCircle, PowerOff, Building2, Settings2 } from 'lucide-react';

interface PanelHeaderProps {
  panel: IPanel;
  onUpdateStatus: (status: PanelStatus) => void;
  onPanelUpdated?: () => void;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  panel,
  onUpdateStatus,
  onPanelUpdated,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const interviewers = panel.interviewerIds || [];

  return (
    <>
      <div className="bg-white dark:bg-[#0F1626] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4 transition-colors">
        {/* Top Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFBE91] text-amber-950 flex items-center justify-center font-mono font-extrabold text-xl shadow-md border border-[#EA9661]/40">
                {panel.panelCode}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{panel.name}</h1>
                  <StatusBadge status={panel.status} size="md" />
                </div>
                {panel.roomLocation && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> {panel.roomLocation}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Panel Status Quick Toggles & Edit Button */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-[#111726]"
            >
              <Settings2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Edit Panel & Team</span>
            </Button>

            {panel.status === 'PAUSED' ? (
              <Button
                variant="success"
                size="sm"
                onClick={() => onUpdateStatus('AVAILABLE')}
                className="text-xs font-bold gap-1.5"
              >
                <PlayCircle className="w-4 h-4" /> Resume Panel
              </Button>
            ) : panel.status === 'AVAILABLE' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus('PAUSED')}
                className="text-xs font-semibold gap-1.5 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 bg-white dark:bg-[#111726]"
              >
                <PauseCircle className="w-4 h-4" /> Take a Break (Pause)
              </Button>
            ) : null}

            {panel.status !== 'OFFLINE' && panel.status !== 'OCCUPIED' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdateStatus('OFFLINE')}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <PowerOff className="w-3.5 h-3.5 mr-1" /> Go Offline
              </Button>
            )}

            {panel.status === 'OFFLINE' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onUpdateStatus('AVAILABLE')}
                className="text-xs font-bold gap-1.5"
              >
                <PlayCircle className="w-4 h-4" /> Set Available
              </Button>
            )}
          </div>
        </div>

        {/* Panel Interviewers List */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 flex-wrap text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Interviewers:
          </span>
          {interviewers.length === 0 ? (
            <span className="text-slate-400 dark:text-slate-500 italic">No interviewers assigned yet. Click "Edit Panel & Team" to add.</span>
          ) : (
            interviewers.map((int: any) => (
              <div
                key={int._id}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <span className="font-semibold text-slate-900 dark:text-white">{int.name}</span>
                <div className="flex items-center gap-1">
                  {int.domains?.map((dom: any) => (
                    <span
                      key={dom._id || dom}
                      className="text-[10px] px-1.5 py-0.2 rounded bg-[#FFFCE1] dark:bg-[#FFFCE1]/15 text-amber-950 dark:text-[#FFDDB0] border border-[#FFDDB0]/60 dark:border-slate-700 font-mono font-medium"
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

      {/* Edit Panel Modal */}
      <EditPanelModal
        panel={panel}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => onPanelUpdated?.()}
      />
    </>
  );
};
