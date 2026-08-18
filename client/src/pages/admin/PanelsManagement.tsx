import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { panelService } from '../../services/panel.service.js';
import { adminService } from '../../services/admin.service.js';
import { Navbar } from '../../components/common/Navbar.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Dialog } from '../../components/ui/Dialog.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { Users, Plus, Building2, UserPlus, Shield } from 'lucide-react';
import { toast } from 'sonner';

export const PanelsManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [panelCode, setPanelCode] = useState('');
  const [name, setName] = useState('');
  const [roomLocation, setRoomLocation] = useState('');

  const { data: panels = [], isLoading, refetch } = useQuery({
    queryKey: ['panels-manage'],
    queryFn: panelService.getAllPanels,
  });

  const { data: domains = [] } = useQuery({
    queryKey: ['domains'],
    queryFn: adminService.getAllDomains,
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Panels & Interviewers Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
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
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-base">
                        {panel.panelCode}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{panel.name}</h3>
                        {panel.roomLocation && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" /> {panel.roomLocation}
                          </p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={panel.status} size="sm" />
                  </div>

                  {/* Interviewers */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Interviewers ({interviewers.length})
                    </p>
                    <div className="space-y-1.5">
                      {interviewers.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No interviewers assigned</p>
                      ) : (
                        interviewers.map((int: any) => (
                          <div
                            key={int._id}
                            className="p-2 bg-slate-50 rounded-lg border border-slate-200/80 text-xs flex items-center justify-between"
                          >
                            <span className="font-semibold text-slate-800">{int.name}</span>
                            <div className="flex items-center gap-1 flex-wrap justify-end">
                              {int.domains?.map((d: any) => (
                                <span
                                  key={d._id || d}
                                  className="text-[10px] px-1.5 py-0.2 rounded bg-white text-slate-600 font-mono border"
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

                <div className="pt-2 text-right">
                  <span className="text-[11px] font-mono text-slate-400">
                    ID: {panel._id.slice(-6)}
                  </span>
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
    </div>
  );
};
