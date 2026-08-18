import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service.js';
import { getSocket, joinRoom } from '../../socket/socketClient.js';
import { formatQueueNumber } from '../../utils/formatters.js';
import { Layers, Clock, Users, Building2 } from 'lucide-react';

export const WaitingRoomDisplay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['display-dashboard'],
    queryFn: adminService.getDashboard,
    staleTime: 30000,
  });

  // Clock updater (isolated state)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Socket.IO real-time event listener
  useEffect(() => {
    const socket = getSocket();
    joinRoom.admin();

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['display-dashboard'] });
    };

    socket.on('queue.updated', handleUpdate);
    socket.on('student.assigned', handleUpdate);
    socket.on('panel.updated', handleUpdate);
    socket.on('interview.completed', handleUpdate);
    socket.on('assignment.reassigned', handleUpdate);

    return () => {
      socket.off('queue.updated', handleUpdate);
      socket.off('student.assigned', handleUpdate);
      socket.off('panel.updated', handleUpdate);
      socket.off('interview.completed', handleUpdate);
      socket.off('assignment.reassigned', handleUpdate);
    };
  }, [queryClient]);

  const panels = data?.panels || [];
  const queue = data?.queue || [];

  const activeInterviews = panels.filter(
    (p) => p.status === 'OCCUPIED' && p.currentCandidateId
  );
  const waitingQueue = queue.filter((q) => q.status === 'WAITING').slice(0, 12);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none overflow-hidden">
      {/* Top Header Display Bar */}
      <header className="px-8 py-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">PanelFlow</h1>
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Live Queue Display
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium">
              {data?.session?.sessionName || 'Club Recruitment 2026'}
            </p>
          </div>
        </div>

        {/* Live Clock & Status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE SYNC</span>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black font-mono tracking-tight text-slate-100">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <p className="text-xs text-slate-400">
              {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </header>

      {/* Main Split Screen */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-8 overflow-hidden">
        {/* Left: NOW CALLING / ACTIVE PANELS (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-lg font-black uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              NOW CALLING / INTERVIEWING
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {activeInterviews.length} Active Interview{activeInterviews.length === 1 ? '' : 's'}
            </span>
          </div>

          {activeInterviews.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-3xl border border-slate-800/80 text-center space-y-3">
              <Clock className="w-12 h-12 text-slate-600" />
              <p className="text-lg font-bold text-slate-400">No active interviews at this moment</p>
              <p className="text-xs text-slate-500">
                Candidates will be announced on this screen as panels call them.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto">
              {activeInterviews.map((panel) => {
                const candidate = panel.currentCandidateId;
                if (!candidate) return null;

                return (
                  <div
                    key={panel._id}
                    className="p-6 bg-gradient-to-br from-slate-900 to-slate-850 rounded-3xl border-2 border-rose-500/40 shadow-xl flex flex-col justify-between space-y-4 animate-in zoom-in-95 duration-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-mono font-black text-2xl shadow-lg shadow-rose-600/30">
                        {panel.panelCode}
                      </div>
                      <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 uppercase tracking-wider">
                        Interviewing
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Candidate Name</p>
                      <h3 className="text-2xl font-black text-white tracking-tight">{candidate.name}</h3>
                      <p className="text-sm font-mono text-blue-400 font-semibold">
                        {candidate.registrationNumber} • {candidate.branch}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <span>{panel.roomLocation || panel.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: UP NEXT IN QUEUE (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4 bg-slate-900/60 rounded-3xl p-6 border border-slate-800/80">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-base font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              UP NEXT (FCFS ORDER)
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {queue.filter((q) => q.status === 'WAITING').length} Total Waiting
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800/60">
            {waitingQueue.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">Waiting queue is empty.</div>
            ) : (
              waitingQueue.map((entry, idx) => {
                const student = entry.studentId;
                if (!student) return null;

                return (
                  <div
                    key={entry._id}
                    className="py-3 flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 font-mono font-black text-sm flex items-center justify-center border border-slate-700">
                        {formatQueueNumber(entry.queueNumber)}
                      </span>
                      <div>
                        <p className="font-bold text-slate-100">{student.name}</p>
                        <p className="text-xs font-mono text-slate-400">{student.registrationNumber}</p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      {idx === 0 ? 'Next' : `Ahead: ${idx}`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
