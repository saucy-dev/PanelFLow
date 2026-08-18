import React from 'react';
import { IEventLog } from '../../types/index.js';
import { formatTime, formatDateTime } from '../../utils/formatters.js';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.js';
import {
  UserPlus,
  UserCheck,
  UserX,
  PlayCircle,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
  Activity,
  History,
} from 'lucide-react';

interface AuditLogStreamProps {
  events: IEventLog[];
  maxHeight?: string;
  showTitle?: boolean;
}

export const AuditLogStream: React.FC<AuditLogStreamProps> = ({
  events,
  maxHeight = 'max-h-96',
  showTitle = true,
}) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'STUDENT_JOINED_QUEUE':
        return <UserPlus className="w-3.5 h-3.5 text-blue-600" />;
      case 'STUDENT_ASSIGNED':
        return <UserCheck className="w-3.5 h-3.5 text-emerald-600" />;
      case 'STUDENT_REASSIGNED':
        return <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />;
      case 'STUDENT_REMOVED':
        return <UserX className="w-3.5 h-3.5 text-rose-600" />;
      case 'INTERVIEW_STARTED':
        return <PlayCircle className="w-3.5 h-3.5 text-purple-600" />;
      case 'INTERVIEW_COMPLETED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />;
      case 'DATA_IMPORTED':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatEventText = (event: IEventLog) => {
    const meta = event.metadata || {};
    switch (event.eventType) {
      case 'STUDENT_JOINED_QUEUE':
        return `${meta.studentName || 'Student'} entered queue (Ticket #${meta.queueNumber})`;
      case 'STUDENT_ASSIGNED':
        return `Assigned ${meta.studentName || 'candidate'} to Panel ${meta.panelCode || ''}`;
      case 'STUDENT_REASSIGNED':
        return `Reassigned ${meta.studentName || 'candidate'} from Panel ${meta.fromPanel} to Panel ${meta.toPanel}`;
      case 'STUDENT_REMOVED':
        return `Removed Ticket #${meta.queueNumber} from queue (${meta.reason || 'Coordinator action'})`;
      case 'STUDENT_RESTORED':
        return `Restored Ticket #${meta.queueNumber} to waiting queue`;
      case 'INTERVIEW_STARTED':
        return `Interview started for ${meta.studentName || 'candidate'} at Panel ${meta.panelCode}`;
      case 'INTERVIEW_COMPLETED':
        return `Interview completed for ${meta.studentName || 'candidate'} at Panel ${meta.panelCode} (${meta.durationMinutes || 15}m)`;
      case 'PANEL_STATUS_CHANGED':
        return `Panel ${meta.panelCode} status changed: ${meta.previousStatus} → ${meta.newStatus}`;
      case 'SESSION_STARTED':
        return `Recruitment session initialized (${meta.sessionName || ''})`;
      case 'DATA_IMPORTED':
        return `Imported ${meta.count || 0} ${meta.type || 'records'} via Google Sheets/CSV`;
      default:
        return event.eventType.replace(/_/g, ' ');
    }
  };

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <CardTitle>Real-Time Audit Event Trail</CardTitle>
          </div>
          <span className="text-xs font-mono text-slate-400">{events.length} Events</span>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className={`overflow-y-auto divide-y divide-slate-100 ${maxHeight}`}>
          {events.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No recent events logged.</div>
          ) : (
            events.map((event) => (
              <div
                key={event._id}
                className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-start gap-3 text-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getEventIcon(event.eventType)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 leading-snug">
                    {formatEventText(event)}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="font-mono">{formatTime(event.createdAt)}</span>
                    <span>•</span>
                    <span className="capitalize">{event.actorName || event.actorRole}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
