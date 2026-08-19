import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service.js';
import { panelService } from '../../services/panel.service.js';
import { queueService } from '../../services/queue.service.js';
import { getSocket, joinRoom } from '../../socket/socketClient.js';
import { IQueueEntry, IPanel, PanelStatus } from '../../types/index.js';
import { Navbar } from '../../components/common/Navbar.js';
import { SessionControlBar } from '../../components/admin/SessionControlBar.js';
import { QueueView } from '../../components/admin/QueueView.js';
import { PanelGrid } from '../../components/admin/PanelGrid.js';
import { StudentDrawer } from '../../components/admin/StudentDrawer.js';
import { PanelDrawer } from '../../components/admin/PanelDrawer.js';
import { CallNextModal } from '../../components/admin/CallNextModal.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();

  const [selectedStudent, setSelectedStudent] = useState<IQueueEntry | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<IPanel | null>(null);
  const [isCallNextOpen, setIsCallNextOpen] = useState(false);

  // Fetch Authoritative Admin Dashboard Data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminService.getDashboard,
    staleTime: 30000,
  });

  // Socket.IO Room Joining & Live Event Synchronization (mounted once)
  useEffect(() => {
    const socket = getSocket();
    joinRoom.admin();

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    };

    socket.on('queue.updated', handleUpdate);
    socket.on('student.assigned', handleUpdate);
    socket.on('panel.updated', handleUpdate);
    socket.on('interview.started', handleUpdate);
    socket.on('interview.completed', handleUpdate);
    socket.on('assignment.reassigned', handleUpdate);
    socket.on('session.updated', handleUpdate);

    return () => {
      socket.off('queue.updated', handleUpdate);
      socket.off('student.assigned', handleUpdate);
      socket.off('panel.updated', handleUpdate);
      socket.off('interview.started', handleUpdate);
      socket.off('interview.completed', handleUpdate);
      socket.off('assignment.reassigned', handleUpdate);
      socket.off('session.updated', handleUpdate);
    };
  }, [queryClient]);

  // Mutations
  const assignMutation = useMutation({
    mutationFn: ({ queueEntryId, panelId }: { queueEntryId: string; panelId: string }) =>
      adminService.assignStudent(queueEntryId, panelId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success(`Assigned candidate to Panel ${res.panel.panelCode}!`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Assignment failed. The panel may have already been occupied.');
      refetch();
    },
  });

  const removeStudentMutation = useMutation({
    mutationFn: (queueEntryId: string) => queueService.removeFromQueue(queueEntryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.info('Student removed from queue.');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to remove student'),
  });

  const updatePanelStatusMutation = useMutation({
    mutationFn: ({ panelId, status }: { panelId: string; status: PanelStatus }) =>
      panelService.updateStatus(panelId, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success(`Panel ${updated.panelCode} status set to ${updated.status}`);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update panel status'),
  });

  const completeInterviewMutation = useMutation({
    mutationFn: (panelId: string) => panelService.completeInterview(panelId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success(res.message || 'Interview completed and panel freed.');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to complete interview'),
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading Real-Time Interview Control Center..." />;
  }

  const session = data?.session;
  const queue = data?.queue || [];
  const panels = data?.panels || [];
  const analytics = data?.analytics;

  const availablePanels = panels.filter((p) => p.status === 'AVAILABLE');
  const nextWaitingCandidate = queue.find((q) => q.status === 'WAITING') || null;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100/70 select-none">
      {/* Top Fixed Navbar */}
      <Navbar />

      {/* Main Full-Height Fluid Workspace */}
      <main className="flex-1 min-h-0 max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 flex flex-col gap-3 overflow-hidden">
        {/* Session Toolbar */}
        {session && (
          <SessionControlBar
            session={session}
            analytics={analytics}
            onCallNext={() => setIsCallNextOpen(true)}
            onRefresh={() => refetch()}
            onUpdateSessionStatus={(status) =>
              adminService.updateSession(session._id, { status }).then(() => refetch())
            }
          />
        )}

        {/* Two-Pane Desktop Control Center: Queue (Left) & Panels (Right) */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 overflow-hidden">
          {/* Waiting Queue Table (Left - 6 Cols) */}
          <div className="lg:col-span-6 h-full min-h-0 flex flex-col overflow-hidden">
            <QueueView
              queue={queue}
              availablePanels={availablePanels}
              onSelectStudent={(entry) => setSelectedStudent(entry)}
              onQuickAssign={(entry, panelId) =>
                assignMutation.mutate({ queueEntryId: entry._id, panelId })
              }
              onRemoveStudent={(entry) => removeStudentMutation.mutate(entry._id)}
            />
          </div>

          {/* Panels Grid (Right - 6 Cols) */}
          <div className="lg:col-span-6 h-full min-h-0 flex flex-col overflow-hidden">
            <PanelGrid
              panels={panels}
              onSelectPanel={(panel) => setSelectedPanel(panel)}
              onUpdateStatus={(panelId, status) =>
                updatePanelStatusMutation.mutate({ panelId, status })
              }
              onCompleteInterview={(panelId) => completeInterviewMutation.mutate(panelId)}
            />
          </div>
        </div>
      </main>

      {/* Drawers & Triage Modals */}
      <StudentDrawer
        entry={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        panels={panels}
        onAssign={(entry, panelId) => assignMutation.mutate({ queueEntryId: entry._id, panelId })}
      />

      <PanelDrawer
        panel={selectedPanel}
        isOpen={!!selectedPanel}
        onClose={() => setSelectedPanel(null)}
        waitingQueue={queue.filter((q) => q.status === 'WAITING')}
        onAssignStudent={(entry, panelId) =>
          assignMutation.mutate({ queueEntryId: entry._id, panelId })
        }
        onUpdateStatus={(panelId, status) =>
          updatePanelStatusMutation.mutate({ panelId, status })
        }
        onCompleteInterview={(panelId) => completeInterviewMutation.mutate(panelId)}
      />

      <CallNextModal
        isOpen={isCallNextOpen}
        onClose={() => setIsCallNextOpen(false)}
        nextEntry={nextWaitingCandidate}
        availablePanels={availablePanels}
        onAssign={(entry, panelId) => assignMutation.mutate({ queueEntryId: entry._id, panelId })}
      />
    </div>
  );
};
