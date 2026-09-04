import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service.js';
import { getSocket, joinRoom } from '../../socket/socketClient.js';
import { formatQueueNumber } from '../../utils/formatters.js';
import { QRCodeSVG } from 'qrcode.react';
import { Layers, Clock, Users, Building2, QrCode, GripVertical, GripHorizontal, Columns } from 'lucide-react';

export const WaitingRoomDisplay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const queryClient = useQueryClient();

  // Horizontal Split Ratio (Percentage for Left Column: between 35% and 80%)
  const [leftWidth, setLeftWidth] = useState<number>(() => {
    const saved = localStorage.getItem('display_split_width');
    return saved ? Math.max(35, Math.min(80, parseFloat(saved))) : 66;
  });

  // Vertical Split Ratio for Right Column (QR Code Card vs Up Next: between 15% and 75%)
  const [qrHeight, setQrHeight] = useState<number>(() => {
    const saved = localStorage.getItem('display_qr_height');
    return saved ? Math.max(15, Math.min(75, parseFloat(saved))) : 30;
  });

  const [isDraggingX, setIsDraggingX] = useState(false);
  const [isDraggingY, setIsDraggingY] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const rafRefX = useRef<number>(0);
  const rafRefY = useRef<number>(0);

  const { data, isLoading } = useQuery({
    queryKey: ['display-dashboard'],
    queryFn: adminService.getDisplayData,
    staleTime: 10000,
    retry: 3,
  });

  // Live Clock updater
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
    socket.on('interview.started', handleUpdate);
    socket.on('interview.completed', handleUpdate);
    socket.on('assignment.reassigned', handleUpdate);

    return () => {
      socket.off('queue.updated', handleUpdate);
      socket.off('student.assigned', handleUpdate);
      socket.off('panel.updated', handleUpdate);
      socket.off('interview.started', handleUpdate);
      socket.off('interview.completed', handleUpdate);
      socket.off('assignment.reassigned', handleUpdate);
    };
  }, [queryClient]);

  // Instant Horizontal Resizer Drag Handlers (Left vs Right)
  const handlePointerDownX = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingX(true);
  };

  const handlePointerMoveX = useCallback(
    (e: PointerEvent) => {
      if (!isDraggingX || !containerRef.current) return;
      if (rafRefX.current) cancelAnimationFrame(rafRefX.current);

      rafRefX.current = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        const clamped = Math.max(35, Math.min(80, percent));
        setLeftWidth(clamped);
      });
    },
    [isDraggingX]
  );

  const handlePointerUpX = useCallback(() => {
    setIsDraggingX(false);
    if (rafRefX.current) cancelAnimationFrame(rafRefX.current);
    setLeftWidth((current) => {
      localStorage.setItem('display_split_width', Math.round(current).toString());
      return current;
    });
  }, []);

  useEffect(() => {
    if (isDraggingX) {
      window.addEventListener('pointermove', handlePointerMoveX, { passive: true });
      window.addEventListener('pointerup', handlePointerUpX);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else if (!isDraggingY) {
      window.removeEventListener('pointermove', handlePointerMoveX);
      window.removeEventListener('pointerup', handlePointerUpX);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMoveX);
      window.removeEventListener('pointerup', handlePointerUpX);
    };
  }, [isDraggingX, handlePointerMoveX, handlePointerUpX, isDraggingY]);

  // Instant Vertical Resizer Drag Handlers (QR Code vs Up Next)
  const handlePointerDownY = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingY(true);
  };

  const handlePointerMoveY = useCallback(
    (e: PointerEvent) => {
      if (!isDraggingY || !rightColRef.current) return;
      if (rafRefY.current) cancelAnimationFrame(rafRefY.current);

      rafRefY.current = requestAnimationFrame(() => {
        if (!rightColRef.current) return;
        const rect = rightColRef.current.getBoundingClientRect();
        const percent = ((e.clientY - rect.top) / rect.height) * 100;
        const clamped = Math.max(15, Math.min(75, percent));
        setQrHeight(clamped);
      });
    },
    [isDraggingY]
  );

  const handlePointerUpY = useCallback(() => {
    setIsDraggingY(false);
    if (rafRefY.current) cancelAnimationFrame(rafRefY.current);
    setQrHeight((current) => {
      localStorage.setItem('display_qr_height', Math.round(current).toString());
      return current;
    });
  }, []);

  useEffect(() => {
    if (isDraggingY) {
      window.addEventListener('pointermove', handlePointerMoveY, { passive: true });
      window.addEventListener('pointerup', handlePointerUpY);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    } else if (!isDraggingX) {
      window.removeEventListener('pointermove', handlePointerMoveY);
      window.removeEventListener('pointerup', handlePointerUpY);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMoveY);
      window.removeEventListener('pointerup', handlePointerUpY);
    };
  }, [isDraggingY, handlePointerMoveY, handlePointerUpY, isDraggingX]);

  const setPreset = (width: number) => {
    setLeftWidth(width);
    localStorage.setItem('display_split_width', width.toString());
  };

  const panels = data?.panels || [];
  const queue = data?.queue || [];

  const activeInterviews = panels.filter(
    (p) => p.status === 'OCCUPIED' && p.currentCandidateId
  );
  const waitingQueue = queue.filter((q) => q.status === 'WAITING').slice(0, 8);

  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/interview/join`
      : 'http://localhost:5173/interview/join';

  // Determine optimal responsive grid classes so all boxes fit on screen without vertical scroll
  const count = activeInterviews.length;
  let gridLayout = 'grid-cols-1 auto-rows-fr';
  if (count === 2) {
    gridLayout = 'grid-cols-2 auto-rows-fr';
  } else if (count === 3 || count === 4) {
    gridLayout = 'grid-cols-2 grid-rows-2 auto-rows-fr';
  } else if (count === 5 || count === 6) {
    gridLayout = 'grid-cols-2 sm:grid-cols-3 grid-rows-3 sm:grid-rows-2 auto-rows-fr';
  } else if (count > 6) {
    gridLayout = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 auto-rows-fr';
  }

  const isTallQr = qrHeight >= 36;

  return (
    <div className="h-screen w-screen bg-[#0B0F19] text-white flex flex-col font-sans select-none overflow-hidden">
      {/* Top Header Bar */}
      <header className="px-6 py-2.5 bg-[#0F1626] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#FFBE91] border border-[#EA9661]/60 flex items-center justify-center text-amber-950 shadow-md">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white">PanelFlow</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#CFEBFF]/20 text-[#CFEBFF] border border-[#CFEBFF]/30">
                Live Waiting Room Display
              </span>
            </div>
            <p className="text-[11px] text-[#FFDDB0] font-semibold">
              {data?.session?.sessionName || 'Club Recruitment 2026'}
            </p>
          </div>
        </div>

        {/* Resizer Quick Presets & Clock */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Quick Resizer Split Presets */}
          <div className="hidden md:flex items-center gap-1 bg-[#111726] p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
            <span className="text-slate-500 px-1.5 flex items-center gap-1">
              <Columns className="w-3 h-3 text-slate-400" /> Split:
            </span>
            {[
              { label: '50:50', val: 50 },
              { label: '65:35', val: 65 },
              { label: '75:25', val: 75 },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setPreset(p.val)}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${Math.abs(leftWidth - p.val) <= 3
                  ? 'bg-[#FFBE91] text-amber-950 shadow-2xs font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="text-right">
            <div className="text-lg sm:text-xl font-mono font-black tracking-tight text-slate-100">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </header>

      {/* Main Full-Height Workspace with 0ms Latency Resizers */}
      <main
        ref={containerRef}
        className="flex-1 min-h-0 flex flex-row p-3 sm:p-4 overflow-hidden gap-0 relative"
      >
        {/* Left: NOW CALLING (Dynamic Width - Zero Transition Lag While Dragging) */}
        <div
          style={{ width: `${leftWidth}%` }}
          className={`flex flex-col h-full min-h-0 space-y-2.5 overflow-hidden pr-1.5 ${isDraggingX ? 'transition-none pointer-events-none' : 'transition-[width] duration-100'
            }`}
        >
          <div className="flex items-center justify-between pb-1 border-b border-slate-800 shrink-0 px-1">
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#FFBE91] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBE91] shadow-[0_0_8px_#FFBE91] animate-pulse shrink-0" />
              <span>NOW CALLING / IN INTERVIEW</span>
            </h2>
            <span className="text-xs font-mono text-slate-400 font-semibold">
              {activeInterviews.length} Active Interview{activeInterviews.length === 1 ? '' : 's'}
            </span>
          </div>

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#111726] rounded-2xl border border-slate-800 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#FFBE91] border-t-transparent animate-spin" />
              <p className="text-sm font-bold text-[#FFDDB0]">Syncing live interview status...</p>
            </div>
          ) : activeInterviews.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#111726] rounded-2xl border border-slate-800 text-center space-y-3">
              <Clock className="w-12 h-12 text-slate-600" />
              <p className="text-lg font-bold text-slate-300">No active interviews at this moment</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Candidates will appear here with room numbers as interview panels call them.
              </p>
            </div>
          ) : (
            /* Dynamic Auto-Fitting Grid (All boxes fit vertically with zero scroll) */
            <div className={`flex-1 min-h-0 grid ${gridLayout} gap-3 h-full overflow-hidden`}>
              {activeInterviews.map((panel) => {
                const candidate = panel.currentCandidateId;
                if (!candidate) return null;

                return (
                  <div
                    key={panel._id}
                    className="p-3 sm:p-3.5 bg-[#111726] rounded-2xl border border-slate-700/80 shadow-md flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-150"
                  >
                    {/* Panel Code & Badge */}
                    <div className="flex items-center justify-between gap-2 shrink-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FFBE91] text-amber-950 flex items-center justify-center font-mono font-black text-base sm:text-lg shadow-xs border border-[#EA9661]/40 shrink-0">
                        {panel.panelCode}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#CFEBFF]/15 text-[#CFEBFF] text-[10px] font-bold border border-[#CFEBFF]/30 uppercase tracking-wider shrink-0">
                        In Room
                      </span>
                    </div>

                    {/* Candidate Details */}
                    <div className="min-w-0 my-1">
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#FFDDB0]/80">
                        Candidate
                      </p>
                      <h3 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                        {candidate.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs font-mono text-[#CFEBFF] font-semibold truncate">
                        {candidate.registrationNumber} • {candidate.branch}
                      </p>
                    </div>

                    {/* Room Location */}
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 flex items-center gap-1.5 shrink-0 truncate">
                      <Building2 className="w-3.5 h-3.5 text-[#FFDDB0] shrink-0" />
                      <span className="truncate font-semibold">{panel.roomLocation || panel.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Draggable Vertical Splitter Handle (Left vs Right) */}
        <div
          onPointerDown={handlePointerDownX}
          className={`w-3.5 hover:w-4 flex items-center justify-center cursor-col-resize group shrink-0 transition-colors z-30 touch-none ${isDraggingX ? 'bg-[#FFBE91]/20' : 'hover:bg-slate-800/60'
            }`}
          title="Drag horizontally to resize columns"
        >
          <div
            className={`w-1 rounded-full flex items-center justify-center transition-all ${isDraggingX
              ? 'h-16 bg-[#FFBE91] shadow-md shadow-[#FFBE91]/40'
              : 'h-10 bg-slate-700 group-hover:bg-[#FFBE91] group-hover:h-14'
              }`}
          >
            <GripVertical className="w-2.5 h-2.5 text-slate-950 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Right Column: UP NEXT & INTEGRATED QR CODE with Vertical Resizer */}
        <div
          ref={rightColRef}
          style={{ width: `${100 - leftWidth}%` }}
          className={`flex flex-col h-full min-h-0 overflow-hidden pl-1.5 ${isDraggingX ? 'transition-none pointer-events-none' : 'transition-[width] duration-100'
            }`}
        >
          {/* Top: Integrated On-Screen QR Code Check-In Box (Auto-Scaling QR Size) */}
          <div
            style={{ height: `${qrHeight}%` }}
            className={`bg-[#0F1626] rounded-2xl border border-[#FFDDB0]/30 shadow-md p-3 sm:p-4 shrink-0 overflow-hidden flex ${isDraggingY ? 'transition-none pointer-events-none' : 'transition-[height] duration-100'
              } ${isTallQr ? 'flex-row items-center gap-4 sm:gap-6' : 'flex-row items-center gap-3.5'}`}
          >
            {/* Auto-Expanding QR Code Container (Stretches to 100% of Box Height) */}
            <div className="h-full aspect-square max-h-full bg-white p-2 rounded-2xl shadow-lg border-2 border-[#FFDDB0] flex items-center justify-center shrink-0">
              <QRCodeSVG
                value={joinUrl}
                size={256}
                level="M"
                className="w-full h-full max-h-full max-w-full object-contain"
              />
            </div>

            {/* Accompanying QR Text */}
            <div className="min-w-0 flex-1 flex flex-col justify-center space-y-1">
              <div className="flex items-center gap-2 text-[#FFBE91] font-extrabold">
                <QrCode className={`${isTallQr ? 'w-5 h-5' : 'w-4 h-4'} text-[#FFBE91] shrink-0`} />
                <span className={`${isTallQr ? 'text-sm sm:text-base font-black' : 'text-xs font-bold'} tracking-tight`}>
                  Scan to Join Queue
                </span>
              </div>

              <p className={`${isTallQr ? 'text-xs text-slate-200' : 'text-[10.5px] text-slate-300'} font-medium leading-snug`}>
                Point phone camera to take your live queue ticket.
              </p>

              <div className="pt-0.5">
                <span className="inline-block px-2 py-0.5 rounded-md bg-[#CFEBFF]/15 text-[#CFEBFF] border border-[#CFEBFF]/30 text-[10px] sm:text-[11px] font-mono font-bold truncate max-w-full">
                  {joinUrl}
                </span>
              </div>
            </div>
          </div>

          {/* Draggable Horizontal Splitter Handle (QR vs Up Next) */}
          <div
            onPointerDown={handlePointerDownY}
            className={`h-3.5 hover:h-4 w-full flex items-center justify-center cursor-row-resize group shrink-0 transition-colors z-30 my-0.5 touch-none ${isDraggingY ? 'bg-[#FFBE91]/20' : 'hover:bg-slate-800/60'
              }`}
            title="Drag vertically to resize QR Code vs Queue List"
          >
            <div
              className={`h-1 rounded-full flex items-center justify-center transition-all ${isDraggingY
                ? 'w-20 bg-[#FFBE91] shadow-md shadow-[#FFBE91]/40'
                : 'w-12 bg-slate-700 group-hover:bg-[#FFBE91] group-hover:w-16'
                }`}
            >
              <GripHorizontal className="w-2.5 h-2.5 text-slate-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Bottom: Up Next List (Takes remaining height) */}
          <div className="flex-1 min-h-0 flex flex-col bg-[#0F1626] rounded-2xl p-3.5 border border-slate-800 shadow-md overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#FFDDB0] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#FFDDB0]" />
                UP NEXT IN QUEUE
              </h2>
              <span className="text-xs font-mono text-slate-400 font-bold">
                {queue.filter((q) => q.status === 'WAITING').length} Waiting
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/60 mt-1.5">
              {waitingQueue.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">Waiting queue is empty.</div>
              ) : (
                waitingQueue.map((entry, idx) => {
                  const student = entry.studentId;
                  if (!student) return null;

                  return (
                    <div
                      key={entry._id}
                      className="py-2 flex items-center justify-between gap-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-[#FFBE91] text-amber-950 font-mono font-black text-xs flex items-center justify-center border border-[#EA9661]/50 shadow-xs shrink-0">
                          {formatQueueNumber(entry.queueNumber)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-100 text-xs truncate">{student.name}</p>
                          <p className="text-[10px] font-mono text-[#CFEBFF] truncate">{student.registrationNumber}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0 ${idx === 0
                          ? 'bg-[#FFDDB0] text-amber-950'
                          : 'bg-slate-800/80 text-slate-400'
                          }`}
                      >
                        {idx === 0 ? 'Next' : `Ahead: ${idx}`}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
