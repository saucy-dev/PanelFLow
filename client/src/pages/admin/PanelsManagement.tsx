import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { panelService } from '../../services/panel.service.js';
import { Navbar } from '../../components/common/Navbar.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Dialog } from '../../components/ui/Dialog.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { EditPanelModal } from '../../components/common/EditPanelModal.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { IPanel } from '../../types/index.js';
import { Users, Plus, Building2, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

export const PanelsManagement: React.FC = () => {
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [selectedPanelToEdit, setSelectedPanelToEdit] = useState<IPanel | null>(null);
  const [panelCode, setPanelCode] = useState('');
  const [name, setName] = useState('');
  const [roomLocation, setRoomLocation] = useState('');

  const { data: panels = [], isLoading, refetch } = useQuery({
    queryKey: ['panels-manage'],
    queryFn: panelService.getAllPanels,
  });

  const createPanelMutation = useMutation({
    mutationFn: () =>
      panelService.createPanel({
        panelCode: panelCode.trim().toUpperCase(),
        name: name.trim(),
        roomLocation: roomLocation.trim(),
      }),
    onSuccess: () => {
      refetch();
      setIsAddPanelOpen(false);
      setPanelCode('');
      setName('');
      setRoomLocation('');
      toast.success('New panel created successfully!');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create panel'),
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading panels configuration..." />;
  }

  return (
    <div className="min-h-screen bg-[#FFFCE1] dark:bg-[#0B0F19] flex flex-col transition-colors duration-150 font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Panels & Interviewers Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure interview panels, interviewer team assignments, and domain specializations.
            </p>
          </div>

          <Button
            size="md"
            variant="primary"
            onClick={() => setIsAddPanelOpen(true)}
            className="gap-2 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Panel</span>
          </Button>
        </div>

        {/* Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {panels.map((panel) => {
            const interviewers = panel.interviewerIds || [];

            return (
              <div
                key={panel._id}
                className="bg-white/95 dark:bg-[#0F1626] rounded-2xl border border-[#FFDDB0] dark:border-slate-800 shadow-2xs p-5 space-y-4 flex flex-col justify-between transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#FFBE91] text-amber-950 font-mono font-black flex items-center justify-center text-base shadow-xs border border-[#EA9661]/40">
                        {panel.panelCode}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{panel.name}</h3>
                        {panel.roomLocation && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500" /> {panel.roomLocation}
                          </p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={panel.status} size="sm" />
                  </div>

                  {/* Interviewers */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3" /> Interviewers ({interviewers.length})
                      </p>
                      <button
                        onClick={() => setSelectedPanelToEdit(panel)}
                        className="text-[10px] font-semibold text-amber-900 dark:text-[#FFBE91] hover:underline cursor-pointer"
                      >
                        + Add / Edit
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {interviewers.length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic">No interviewers assigned</p>
                      ) : (
                        interviewers.map((int: any) => (
                          <div
                            key={int._id}
                            className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 dark:border-slate-700 text-xs flex items-center justify-between"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{int.name}</span>
                            <div className="flex items-center gap-1 flex-wrap justify-end">
                              {int.domains?.map((d: any) => (
                                <span
                                  key={d._id || d}
                                  className="text-[10px] px-1.5 py-0.2 rounded bg-[#FFFCE1] dark:bg-[#FFFCE1]/15 text-amber-950 dark:text-[#FFDDB0] font-mono border border-[#FFDDB0]/60 dark:border-slate-700"
                                >
                                  {d.name || d}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    ID: {panel._id.slice(-6)}
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedPanelToEdit(panel)}
                    className="text-xs h-7.5 gap-1.5 font-semibold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111726] hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Settings2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span>Edit Panel & Team</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Create Panel Dialog */}
      <Dialog
        isOpen={isAddPanelOpen}
        onClose={() => setIsAddPanelOpen(false)}
        title="Create New Interview Panel"
        description="Add a new panel code and room location to the interview session."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createPanelMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Panel Code *"
            placeholder="e.g. P5"
            value={panelCode}
            onChange={(e) => setPanelCode(e.target.value.toUpperCase())}
            required
          />

          <Input
            label="Panel Name *"
            placeholder="e.g. Panel 5 — Emerging Technologies"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Room Location"
            placeholder="e.g. Room 305, Lab Block"
            value={roomLocation}
            onChange={(e) => setRoomLocation(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddPanelOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createPanelMutation.isPending}
            >
              Create Panel
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Panel & Team Modal */}
      <EditPanelModal
        panel={selectedPanelToEdit}
        isOpen={!!selectedPanelToEdit}
        onClose={() => setSelectedPanelToEdit(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
