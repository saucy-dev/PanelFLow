import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queueService } from '../../services/queue.service.js';
import { getSocket, joinRoom } from '../../socket/socketClient.js';
import { QueueTicketCard } from '../../components/student/QueueTicketCard.js';
import { AssignedAlert } from '../../components/student/AssignedAlert.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { ThemeToggle } from '../../components/common/ThemeToggle.js';
import { Button } from '../../components/ui/Button.js';
import { CheckCircle2, RefreshCw, Layers } from 'lucide-react';

export const QueueStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['student-status', id],
    queryFn: () => queueService.getStatus(id || ''),
    enabled: !!id,
    staleTime: 30000,
  });

  const queueEntry = data?.queueEntry;
  const student = queueEntry?.studentId;

  // Real-time socket event subscription (attached cleanly per queue ticket)
  useEffect(() => {
    if (!queueEntry) return;

    const socket = getSocket();
    const studentId = typeof student === 'object' ? (student as any)._id : student;
    joinRoom.student(studentId, queueEntry.sessionId);

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['student-status', id] });
    };

    socket.on('student.assigned', handleUpdate);
    socket.on('student.status.updated', handleUpdate);
    socket.on('queue.updated', handleUpdate);
    socket.on('interview.completed', handleUpdate);

    return () => {
      socket.off('student.assigned', handleUpdate);
      socket.off('student.status.updated', handleUpdate);
      socket.off('queue.updated', handleUpdate);
      socket.off('interview.completed', handleUpdate);
    };
  }, [queueEntry?._id, id, queryClient]);

  if (isLoading) {
    return <LoadingSpinner message="Fetching your real-time queue position..." />;
  }

  if (!queueEntry) {
    return (
      <div className="min-h-screen bg-[#FFFCE1] dark:bg-[#0B0F19] flex flex-col items-center justify-center p-4">
        <div className="bg-white/95 dark:bg-[#0F1626]/95 border border-[#FFDDB0] dark:border-slate-800 p-8 rounded-3xl shadow-md text-center max-w-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Queue Entry Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The specified queue ticket could not be found or has expired.
          </p>
          <Link to="/interview/join">
            <Button size="md" variant="primary" className="w-full">
              Join Interview Queue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAssignedOrInterviewing =
    (queueEntry.status === 'ASSIGNED' || queueEntry.status === 'INTERVIEWING') &&
    queueEntry.assignedPanelId;

  return (
    <div className="min-h-screen bg-[#FFFCE1] dark:bg-[#0B0F19] flex flex-col items-center justify-center p-4 sm:p-6 select-none transition-colors duration-150 font-sans">
      <div className="w-full max-w-md space-y-4">
        {/* Top Mini Brand Bar & Theme Switcher */}
        <div className="flex items-center justify-between px-2">
          <Link to="/" className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900">
            <div className="w-5 h-5 rounded-lg bg-[#FFBE91] text-amber-950 flex items-center justify-center">
              <Layers className="w-3 h-3" />
            </div>
            <span>PanelFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="text-[11px] font-semibold text-amber-900 dark:text-[#FFBE91] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Dynamic Assignment Alert if Called! */}
        {isAssignedOrInterviewing && (
          <AssignedAlert
            panel={queueEntry.assignedPanelId as any}
            status={queueEntry.status}
          />
        )}

        {/* If Completed */}
        {queueEntry.status === 'COMPLETED' ? (
          <div className="bg-white/95 dark:bg-[#0F1626]/95 rounded-3xl p-8 border border-[#FFDDB0] dark:border-slate-800 text-center shadow-lg space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Interview Completed!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thank you for participating in the interview round. The club coordinators will announce the final results
                soon.
              </p>
            </div>
          </div>
        ) : (
          /* Normal Live Queue Ticket */
          <QueueTicketCard
            queueEntry={queueEntry}
            studentsAhead={data?.studentsAhead ?? 0}
            estimatedWaitMinutes={data?.estimatedWaitMinutes}
          />
        )}
      </div>
    </div>
  );
};
