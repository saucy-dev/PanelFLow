import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog } from '../ui/Dialog.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { IPanel, IDomain } from '../../types/index.js';
import { panelService } from '../../services/panel.service.js';
import { adminService } from '../../services/admin.service.js';
import { Users, UserPlus, Trash2, Edit2, Check, X, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditPanelModalProps {
  panel: IPanel | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditPanelModal: React.FC<EditPanelModalProps> = ({
  panel,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const [panelName, setPanelName] = useState('');
  const [roomLocation, setRoomLocation] = useState('');

  // Add interviewer state
  const [isAddingInterviewer, setIsAddingInterviewer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDomains, setNewDomains] = useState<string[]>([]);

  // Edit existing interviewer state
  const [editingInterviewerId, setEditingInterviewerId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDomains, setEditDomains] = useState<string[]>([]);

  // Sync state when panel changes
  React.useEffect(() => {
    if (panel) {
      setPanelName(panel.name || '');
      setRoomLocation(panel.roomLocation || '');
      setIsAddingInterviewer(false);
      setEditingInterviewerId(null);
    }
  }, [panel]);

  // Fetch all domains for selector
  const { data: domains = [] } = useQuery<IDomain[]>({
    queryKey: ['domains'],
    queryFn: adminService.getAllDomains,
  });

  // Mutations
  const updatePanelDetailsMutation = useMutation({
    mutationFn: () =>
      panelService.updatePanelDetails(panel!._id, {
        name: panelName.trim(),
        roomLocation: roomLocation.trim(),
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['panels'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['panel', panel?.panelCode] });
      toast.success('Panel details updated successfully!');
      onSuccess?.();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update panel details'),
  });

  const addInterviewerMutation = useMutation({
    mutationFn: () =>
      panelService.addInterviewer(panel!._id, {
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        domains: newDomains,
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['panels'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['panel', panel?.panelCode] });
      setIsAddingInterviewer(false);
      setNewName('');
      setNewEmail('');
      setNewDomains([]);
      toast.success('Interviewer added to panel!');
      onSuccess?.();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to add interviewer'),
  });

  const updateInterviewerMutation = useMutation({
    mutationFn: () =>
      panelService.updateInterviewer(editingInterviewerId!, {
        name: editName.trim(),
        email: editEmail.trim().toLowerCase(),
        domains: editDomains,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panels'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['panel', panel?.panelCode] });
      setEditingInterviewerId(null);
      toast.success('Interviewer updated successfully!');
      onSuccess?.();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update interviewer'),
  });

  const removeInterviewerMutation = useMutation({
    mutationFn: (interviewerId: string) =>
      panelService.removeInterviewer(panel!._id, interviewerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panels'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['panel', panel?.panelCode] });
      toast.success('Interviewer removed from panel.');
      onSuccess?.();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to remove interviewer'),
  });

  if (!panel) return null;

  const interviewers = panel.interviewerIds || [];

  const handleStartEdit = (int: any) => {
    setEditingInterviewerId(int._id);
    setEditName(int.name);
    setEditEmail(int.email);
    setEditDomains(int.domains?.map((d: any) => (typeof d === 'object' ? d._id : d)) || []);
  };

  const toggleDomain = (domainId: string, isEdit: boolean) => {
    if (isEdit) {
      if (editDomains.includes(domainId)) {
        setEditDomains(editDomains.filter((id) => id !== domainId));
      } else {
        setEditDomains([...editDomains, domainId]);
      }
    } else {
      if (newDomains.includes(domainId)) {
        setNewDomains(newDomains.filter((id) => id !== domainId));
      } else {
        setNewDomains([...newDomains, domainId]);
      }
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Panel ${panel.panelCode} Details & Team`}
      description="Update panel display name, room location, and interviewer domain team members."
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Section 1: General Details */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updatePanelDetailsMutation.mutate();
          }}
          className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-200/70"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" /> Panel Information
            </h3>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Code: {panel.panelCode}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Panel Name"
              value={panelName}
              onChange={(e) => setPanelName(e.target.value)}
              placeholder="e.g. Panel 1 — Advanced Tech"
              required
            />
            <Input
              label="Room / Location"
              value={roomLocation}
              onChange={(e) => setRoomLocation(e.target.value)}
              placeholder="e.g. Room 301, Lab Building"
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              size="sm"
              variant="primary"
              isLoading={updatePanelDetailsMutation.isPending}
              className="text-xs font-semibold h-8"
            >
              Save Panel Info
            </Button>
          </div>
        </form>

        {/* Section 2: Interviewers Management */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" /> Panel Interviewers ({interviewers.length})
            </h3>
            {!isAddingInterviewer && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddingInterviewer(true)}
                className="text-xs h-7 gap-1 font-semibold border-slate-200"
              >
                <UserPlus className="w-3 h-3 text-blue-600" />
                <span>Add Interviewer</span>
              </Button>
            )}
          </div>

          {/* Add Interviewer Inline Form */}
          {isAddingInterviewer && (
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">Add New Interviewer</span>
                <button
                  onClick={() => setIsAddingInterviewer(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Name *"
                  placeholder="e.g. Rahul Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <Input
                  label="Email Address *"
                  type="email"
                  placeholder="e.g. rahul@college.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              {/* Domain Tag Selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Domain Specializations ({newDomains.length} selected) *
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {domains.map((dom) => {
                    const isSelected = newDomains.includes(dom._id);
                    return (
                      <button
                        type="button"
                        key={dom._id}
                        onClick={() => toggleDomain(dom._id, false)}
                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {dom.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsAddingInterviewer(false)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => addInterviewerMutation.mutate()}
                  isLoading={addInterviewerMutation.isPending}
                  disabled={!newName.trim() || !newEmail.trim() || newDomains.length === 0}
                  className="text-xs h-8 font-semibold"
                >
                  Add to Panel
                </Button>
              </div>
            </div>
          )}

          {/* List of Interviewers */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {interviewers.length === 0 ? (
              <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                No interviewers currently assigned to this panel. Click "Add Interviewer" to assign members.
              </div>
            ) : (
              interviewers.map((int: any) => {
                const isEditing = editingInterviewerId === int._id;

                if (isEditing) {
                  return (
                    <div
                      key={int._id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-300 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <Input
                          label="Name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                        <Input
                          label="Email"
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600">
                          Domain Specializations:
                        </label>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                          {domains.map((dom) => {
                            const isSelected = editDomains.includes(dom._id);
                            return (
                              <button
                                type="button"
                                key={dom._id}
                                onClick={() => toggleDomain(dom._id, true)}
                                className={`text-[10px] px-2 py-0.5 rounded font-medium border cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-slate-700 border-slate-200'
                                }`}
                              >
                                {dom.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingInterviewerId(null)}
                          className="h-7 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => updateInterviewerMutation.mutate()}
                          isLoading={updateInterviewerMutation.isPending}
                          className="h-7 text-xs font-semibold"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={int._id}
                    className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{int.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{int.email}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {int.domains?.map((dom: any) => (
                          <span
                            key={dom._id || dom}
                            className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono border border-slate-200"
                          >
                            {dom.name || dom}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(int)}
                        title="Edit interviewer"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeInterviewerMutation.mutate(int._id)}
                        title="Remove from panel"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};
