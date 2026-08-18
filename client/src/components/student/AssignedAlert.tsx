import React, { useEffect } from 'react';
import { IPanel } from '../../types/index.js';
import { Sparkles, MapPin, Users, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AssignedAlertProps {
  panel: IPanel;
  status: string;
}

export const AssignedAlert: React.FC<AssignedAlertProps> = ({ panel, status }) => {
  useEffect(() => {
    // Fire festive vibration/confetti when assignment arrives
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }, [panel._id]);

  const interviewers = panel.interviewerIds || [];

  return (
    <div className="bg-gradient-to-b from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 fill-white" />
          {status === 'INTERVIEWING' ? 'INTERVIEW IN PROGRESS' : 'YOU HAVE BEEN CALLED!'}
        </span>
      </div>

      <div className="space-y-1 text-center py-2">
        <p className="text-xs uppercase font-bold tracking-widest text-blue-200">Proceed Directly To</p>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{panel.name || `Panel ${panel.panelCode}`}</h1>
        {panel.roomLocation && (
          <p className="text-sm font-semibold text-blue-100 flex items-center justify-center gap-1.5 pt-1">
            <MapPin className="w-4 h-4 text-blue-300" /> {panel.roomLocation}
          </p>
        )}
      </div>

      {/* Panel Interviewers */}
      <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-xs border border-white/15 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> Your Interviewers
        </p>
        <div className="space-y-1.5">
          {interviewers.map((int: any) => (
            <div key={int._id} className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">{int.name}</span>
              <div className="flex items-center gap-1">
                {int.domains?.map((d: any) => (
                  <span
                    key={d._id || d}
                    className="px-1.5 py-0.5 rounded bg-white/20 text-white text-[10px] font-mono"
                  >
                    {d.name || d}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 bg-white/10 rounded-xl text-center text-xs text-blue-100 font-medium">
        Please make your way to the panel table now. Good luck with your interview!
      </div>
    </div>
  );
};
