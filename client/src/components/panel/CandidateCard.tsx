import React, { useState, useEffect } from 'react';
import { IStudent, IPanel } from '../../types/index.js';
import { Button } from '../ui/Button.js';
import { formatTime } from '../../utils/formatters.js';
import { User, CheckCircle2, Play, Clock, Phone, Mail, GraduationCap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CandidateCardProps {
  candidate: IStudent | null;
  panel: IPanel;
  onStartInterview: () => void;
  onCompleteInterview: () => void;
  isLoading?: boolean;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  panel,
  onStartInterview,
  onCompleteInterview,
  isLoading = false,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live Timer based on statusUpdatedAt
  useEffect(() => {
    if (!candidate || panel.status !== 'OCCUPIED') {
      setElapsedSeconds(0);
      return;
    }

    const startTime = new Date(panel.statusUpdatedAt).getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((now - startTime) / 1000));
      setElapsedSeconds(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [candidate, panel.status, panel.statusUpdatedAt]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const formattedTimer = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleComplete = () => {
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.7 },
    });
    onCompleteInterview();
  };

  if (!candidate) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
          <Clock className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Waiting for Next Candidate</h2>
          <p className="text-xs text-slate-500 max-w-md">
            This panel is currently <strong className="text-emerald-700">AVAILABLE</strong>. The club coordinator
            will assign the next matching candidate from the queue shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-rose-200 shadow-md p-6 space-y-6">
      {/* Header with Candidate Tag & Live Elapsed Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" /> Current Candidate
          </span>
          <span className="text-xs text-slate-400">Assigned at {formatTime(panel.statusUpdatedAt)}</span>
        </div>

        {/* Live Elapsed Stopwatch */}
        <div className="flex items-center gap-2 bg-slate-900 text-white px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold shadow-xs">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Interview Time: {formattedTimer}</span>
        </div>
      </div>

      {/* Candidate Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div>
            <span className="text-xs font-bold font-mono text-blue-600">
              {candidate.registrationNumber}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{candidate.name}</h2>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-800">
                {candidate.branch} • Year {candidate.year}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{candidate.email}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{candidate.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Candidate Domain Preferences */}
        <div className="space-y-2 bg-slate-50 rounded-xl p-4 border border-slate-200/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Candidate Domain Preferences (Ranked)
          </h3>
          <div className="space-y-2">
            {candidate.domainPreferences?.map((pref: any, idx: number) => {
              const domainName =
                typeof pref.domainId === 'object' && pref.domainId !== null
                  ? pref.domainId.name
                  : `Domain ${pref.priority}`;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center">
                      {pref.priority}
                    </span>
                    <span className="font-bold text-slate-900">{domainName}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    Preference #{pref.priority}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <Button
          size="lg"
          variant="success"
          onClick={handleComplete}
          isLoading={isLoading}
          className="w-full sm:w-auto px-8 gap-2 font-extrabold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 text-sm h-12"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>INTERVIEW COMPLETE</span>
        </Button>
      </div>
    </div>
  );
};
