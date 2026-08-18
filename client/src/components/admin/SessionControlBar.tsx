import React, { useState } from 'react';
import { IInterviewSession, ISessionAnalytics } from '../../types/index.js';
import { Button } from '../ui/Button.js';
import { Play, Pause, FileSpreadsheet, QrCode, PhoneCall, Sliders, RefreshCw, BarChart2 } from 'lucide-react';
import { QRCodeModal } from '../common/QRCodeModal.js';
import { SheetsImportModal } from './SheetsImportModal.js';

interface SessionControlBarProps {
  session: IInterviewSession;
  analytics?: ISessionAnalytics;
  onCallNext: () => void;
  onRefresh: () => void;
  onUpdateSessionStatus: (status: 'ACTIVE' | 'PAUSED' | 'COMPLETED') => void;
}

export const SessionControlBar: React.FC<SessionControlBarProps> = ({
  session,
  analytics,
  onCallNext,
  onRefresh,
  onUpdateSessionStatus,
}) => {
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const isActive = session.status === 'ACTIVE';

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Session Title, Status Dot, Quick Metrics */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{session.sessionName}</h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border select-none ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {session.status}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span>
              Queue:{' '}
              <strong className="text-slate-900 font-bold font-mono">
                {analytics?.queue.WAITING ?? 0}
              </strong>{' '}
              waiting
            </span>
            <span>•</span>
            <span>
              Panels:{' '}
              <strong className="text-emerald-700 font-bold font-mono">
                {analytics?.panels.AVAILABLE ?? 0}
              </strong>{' '}
              available
            </span>
            <span>•</span>
            <span>
              Completed:{' '}
              <strong className="text-teal-700 font-bold font-mono">
                {analytics?.queue.COMPLETED ?? 0}
              </strong>
            </span>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Smart "Call Next" Candidate Trigger */}
          <Button
            size="md"
            variant="primary"
            onClick={onCallNext}
            className="gap-2 shadow-sm font-bold bg-blue-600 hover:bg-blue-700"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Next Candidate</span>
          </Button>

          {/* Import Sheets / CSV Button */}
          <Button
            size="md"
            variant="outline"
            onClick={() => setIsImportOpen(true)}
            className="gap-1.5 border-slate-200 font-medium text-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Sheets</span>
          </Button>

          {/* QR Code Button */}
          <Button
            size="md"
            variant="outline"
            onClick={() => setIsQrOpen(true)}
            className="gap-1.5 border-slate-200 font-medium text-xs"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>QR Code</span>
          </Button>

          {/* Refresh Manual Button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={onRefresh}
            title="Refresh authoritative state"
            className="text-slate-500 hover:text-slate-900 border border-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Modals */}
      <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} sessionName={session.sessionName} />
      <SheetsImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={onRefresh}
      />
    </>
  );
};
