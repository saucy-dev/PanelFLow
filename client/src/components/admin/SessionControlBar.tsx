import React, { useState } from 'react';
import { IInterviewSession, ISessionAnalytics } from '../../types/index.js';
import { Button } from '../ui/Button.js';
import { FileSpreadsheet, QrCode, PhoneCall, RefreshCw } from 'lucide-react';
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
      <div className="bg-white/90 dark:bg-[#0F1626]/90 backdrop-blur-md rounded-2xl border border-[#FFDDB0] dark:border-slate-800 shadow-2xs px-4 py-3 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3 select-none transition-colors duration-150">
        {/* Left: Session Title & Metrics */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">{session.sessionName}</h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-[#FFDDB0]/60 dark:bg-amber-950/40 text-amber-950 dark:text-amber-300 border-[#FFDDB0] dark:border-amber-800/40'
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

          <div className="hidden sm:flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 pl-3 border-l border-[#FFDDB0] dark:border-slate-800">
            <span className="px-2 py-0.5 rounded-md bg-[#FFFCE1] dark:bg-amber-950/30 border border-[#FFDDB0]/80 dark:border-amber-800/40 text-slate-700 dark:text-slate-200">
              <strong className="text-amber-950 dark:text-[#FFBE91] font-bold font-mono">
                {analytics?.queue.WAITING ?? 0}
              </strong>{' '}
              Waiting
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-slate-700 dark:text-slate-200">
              <strong className="text-rose-700 dark:text-rose-400 font-bold font-mono">
                {analytics?.panels.OCCUPIED ?? 0}
              </strong>{' '}
              In Interview
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-slate-700 dark:text-slate-200">
              <strong className="text-emerald-800 dark:text-emerald-400 font-bold font-mono">
                {analytics?.panels.AVAILABLE ?? 0}
              </strong>{' '}
              Panels Free
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#CFEBFF]/60 dark:bg-sky-950/30 border border-[#BAE2FE] dark:border-sky-800/40 text-slate-700 dark:text-slate-200">
              <strong className="text-sky-900 dark:text-[#CFEBFF] font-bold font-mono">
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
            className="gap-1.5 font-bold text-xs h-8.5 shadow-xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Next Candidate</span>
          </Button>

          {/* Import Button */}
          <Button
            size="sm"
            variant="ice"
            onClick={() => setIsImportOpen(true)}
            className="gap-1.5 text-xs font-semibold h-8.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-sky-800 dark:text-sky-300" />
            <span className="hidden sm:inline">Import Sheets</span>
          </Button>

          {/* QR Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsQrOpen(true)}
            className="gap-1.5 text-xs font-semibold h-8.5 bg-white dark:bg-[#111726] border-[#FFDDB0] dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-[#FFFCE1] dark:hover:bg-slate-800"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-900 dark:text-[#FFBE91]" />
            <span className="hidden sm:inline">QR Code</span>
          </Button>

          {/* Refresh */}
          <Button
            size="icon"
            variant="ghost"
            onClick={onRefresh}
            title="Refresh state"
            className="text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-[#FFDDB0] dark:border-slate-700 bg-white/70 dark:bg-[#111726] h-8.5 w-8.5"
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
