import React, { useState } from 'react';
import { IInterviewSession, ISessionAnalytics } from '../../types/index.js';
import { Button } from '../ui/Button.js';
import { FileSpreadsheet, QrCode, PhoneCall, RefreshCw, Layers } from 'lucide-react';
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
}) => {
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const isActive = session.status === 'ACTIVE';

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs px-4 py-3 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3 select-none">
        {/* Left: Session Title & Metrics */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">{session.sessionName}</h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                  : 'bg-amber-50 text-amber-700 border-amber-200/80'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {session.status}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2.5 text-xs text-slate-500 pl-3 border-l border-slate-200">
            <span>
              <strong className="text-slate-900 font-bold font-mono">
                {analytics?.queue.WAITING ?? 0}
              </strong>{' '}
              Waiting
            </span>
            <span className="text-slate-300">•</span>
            <span>
              <strong className="text-rose-600 font-bold font-mono">
                {analytics?.panels.OCCUPIED ?? 0}
              </strong>{' '}
              In Interview
            </span>
            <span className="text-slate-300">•</span>
            <span>
              <strong className="text-emerald-700 font-bold font-mono">
                {analytics?.panels.AVAILABLE ?? 0}
              </strong>{' '}
              Panels Free
            </span>
            <span className="text-slate-300">•</span>
            <span>
              <strong className="text-teal-700 font-bold font-mono">
                {analytics?.queue.COMPLETED ?? 0}
              </strong>{' '}
              Completed
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Call Next Button */}
          <Button
            size="sm"
            variant="primary"
            onClick={onCallNext}
            className="gap-1.5 font-bold text-xs h-8 shadow-2xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Next Candidate</span>
          </Button>

          {/* Import Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsImportOpen(true)}
            className="gap-1.5 text-xs font-semibold h-8"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Import Sheets</span>
          </Button>

          {/* QR Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsQrOpen(true)}
            className="gap-1.5 text-xs font-semibold h-8"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">QR Code</span>
          </Button>

          {/* Refresh */}
          <Button
            size="icon"
            variant="ghost"
            onClick={onRefresh}
            title="Refresh state"
            className="text-slate-400 hover:text-slate-800 border border-slate-200 h-8 w-8"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} sessionName={session.sessionName} />
      <SheetsImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={onRefresh}
      />
    </>
  );
};
