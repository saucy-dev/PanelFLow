import React from 'react';
import { IQueueEntry } from '../../types/index.js';
import { StatusBadge } from '../common/StatusBadge.js';
import { formatQueueNumber, formatTime } from '../../utils/formatters.js';
import { Users } from 'lucide-react';

interface QueueTicketCardProps {
  queueEntry: IQueueEntry;
  studentsAhead: number;
  estimatedWaitMinutes?: number;
}

export const QueueTicketCard: React.FC<QueueTicketCardProps> = ({
  queueEntry,
  studentsAhead,
}) => {
  const student = queueEntry.studentId;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#FFDDB0] shadow-xl overflow-hidden text-center">
      {/* Ticket Header in Peach */}
      <div className="bg-[#FFBE91] text-amber-950 py-4 px-6 border-b border-[#EA9661]/40">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-amber-900/80">
          Club Interview Queue Ticket
        </p>
        <h2 className="text-base font-extrabold text-amber-950 mt-0.5">{student?.name}</h2>
        <p className="text-xs text-amber-900 font-mono font-semibold">{student?.registrationNumber}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Giant Queue Ticket Number */}
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Queue Number</p>
          <div className="text-6xl font-black font-mono tracking-tight text-slate-900">
            {formatQueueNumber(queueEntry.queueNumber)}
          </div>
          <div className="pt-2 flex justify-center">
            <StatusBadge status={queueEntry.status} size="lg" />
          </div>
        </div>

        {/* Dynamic Students Ahead Indicator */}
        {queueEntry.status === 'WAITING' && (
          <div className="bg-[#FFDDB0]/60 border border-[#FFDDB0] rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-center gap-2 text-amber-950 font-bold text-base">
              <Users className="w-5 h-5 text-amber-800" />
              <span>{studentsAhead} Candidate{studentsAhead === 1 ? '' : 's'} Ahead of You</span>
            </div>
            <p className="text-xs text-amber-900 font-medium">
              Please remain in the waiting area. This ticket updates live automatically.
            </p>
          </div>
        )}

        {/* Domain Preferences Review */}
        <div className="space-y-2 text-left bg-[#FFFCE1] rounded-2xl p-4 border border-[#FFDDB0]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-950">
            Your Domain Preferences:
          </p>
          <div className="space-y-1.5">
            {student?.domainPreferences?.map((pref: any, idx: number) => {
              const domainName =
                typeof pref.domainId === 'object' && pref.domainId !== null
                  ? pref.domainId.name
                  : `Domain ${pref.priority}`;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-[#FFDDB0]/70 text-xs"
                >
                  <span className="font-semibold text-slate-900">{domainName}</span>
                  <span className="text-[10px] font-bold text-sky-900 px-2 py-0.5 rounded-md bg-[#CFEBFF] border border-[#BAE2FE] uppercase">
                    Choice #{pref.priority}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-slate-400">
          Joined queue at {formatTime(queueEntry.joinedAt)}. Keep this browser tab open.
        </p>
      </div>
    </div>
  );
};
