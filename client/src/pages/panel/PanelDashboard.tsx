import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { panelService } from '../../services/panel.service.js';
import { useAuthStore } from '../../store/authStore.js';
import { getSocket, joinRoom } from '../../socket/socketClient.js';
import { PanelHeader } from '../../components/panel/PanelHeader.js';
import { CandidateCard } from '../../components/panel/CandidateCard.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { Navbar } from '../../components/common/Navbar.js';
import { PanelStatus } from '../../types/index.js';
import { toast } from 'sonner';

export const PanelDashboard: React.FC = () => {
  const { panelCode } = useParams<{ panelCode: string }>();
  const authPanel = useAuthStore((state) => state.panel);
  const queryClient = useQueryClient();

  const activePanelId = panelCode || authPanel?.panelCode || authPanel?._id || 'P1';

  // Fetch Panel Information
  const { data: panel, isLoading, refetch } = useQuery({
    queryKey: ['panel', activePanelId],
    queryFn: () => panelService.getPanelById(activePanelId),
    staleTime: 30000,
  });

  // Socket Subscription (mount once per panel ID)
  useEffect(() => {
    if (!panel?._id) return;

    const socket = getSocket();
    joinRoom.panel(panel._id);

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['panel', activePanelId] });
    };

    socket.on('panel.updated', handleUpdate);
    socket.on('panel.status.updated', handleUpdate);
    socket.on('student.assigned', handleUpdate);
    socket.on('interview.started', handleUpdate);
    socket.on('interview.completed', handleUpdate);

    return () => {
      socket.off('panel.updated', handleUpdate);
      socket.off('panel.status.updated', handleUpdate);
      socket.off('student.assigned', handleUpdate);
      socket.off('interview.started', handleUpdate);
      socket.off('interview.completed', handleUpdate);
    };
  }, [panel?._id, activePanelId, queryClient]);

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: (status: PanelStatus) => panelService.updateStatus(panel!._id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(['panel', activePanelId], updated);
      toast.success(`Panel status set to ${updated.status}`);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update panel status'),
  });

  const startInterviewMutation = useMutation({
    mutationFn: () => panelService.startInterview(panel!._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panel', activePanelId] });
      toast.success('Interview started!');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to start interview'),
  });

  const completeInterviewMutation = useMutation({
    mutationFn: () => panelService.completeInterview(panel!._id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['panel', activePanelId] });
      toast.success(res.message || 'Interview marked complete. Panel is now AVAILABLE.');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to complete interview'),
  });

  if (isLoading) {
    return <LoadingSpinner message="Connecting to interview panel workstation..." />;
  }

  if (!panel) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border text-center max-w-md">
          <h2 className="text-lg font-bold text-slate-900">Panel Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            Unable to load panel details. Please check the panel code.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Panel Overview Header */}
        <PanelHeader
          panel={panel}
          onUpdateStatus={(status) => updateStatusMutation.mutate(status)}
        />

        {/* Live Assigned Candidate Workstation Card */}
        <CandidateCard
          candidate={panel.currentCandidateId as any}
          panel={panel}
          onStartInterview={() => startInterviewMutation.mutate()}
          onCompleteInterview={() => completeInterviewMutation.mutate()}
          isLoading={completeInterviewMutation.isPending}
        />
      </main>
    </div>
  );
};
