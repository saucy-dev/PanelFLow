import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { queueService } from '../../services/queue.service.js';
import { IStudent } from '../../types/index.js';
import { Button } from '../../components/ui/Button.js';
import { ThemeToggle } from '../../components/common/ThemeToggle.js';
import { Layers, CheckCircle2, ArrowRight, UserCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const JoinQueuePage: React.FC = () => {
  const navigate = useNavigate();

  const [regNumber, setRegNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncedStudent, setSyncedStudent] = useState<IStudent | null>(null);

  // Debounced auto-lookup by Registration Number or Email
  useEffect(() => {
    const cleanReg = regNumber.trim();
    const cleanEmail = email.trim();
    const query = cleanReg || cleanEmail;

    if (!query || query.length < 3) {
      setSyncedStudent(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsLookingUp(true);
      try {
        const student = await queueService.lookupStudent(query);
        if (student) {
          setSyncedStudent(student);
          if (!email && student.email) setEmail(student.email);
          if (!regNumber && student.registrationNumber) setRegNumber(student.registrationNumber);
        }
      } catch {
        setSyncedStudent(null);
      } finally {
        setIsLookingUp(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [regNumber, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanReg = regNumber.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanReg && !cleanEmail) {
      toast.error('Please enter your Registration Number or Email ID.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await queueService.join({
        registrationNumber: cleanReg,
        email: cleanEmail,
      });

      if (res.isExisting) {
        toast.info(res.message);
      } else {
        toast.success(`Welcome ${res.student.name}! Joined queue at position #${res.position}.`);
      }

      navigate(`/interview/queue/${res.queueEntry._id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to join queue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCE1] dark:bg-[#0B0F19] flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans relative transition-colors duration-150">
      {/* Top Floating Theme Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white/95 dark:bg-[#0F1626]/95 backdrop-blur-md rounded-3xl border border-[#FFDDB0] dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Mobile Header Banner in Peach (#FFBE91) */}
        <div className="bg-[#FFBE91] text-amber-950 p-6 text-center space-y-2 border-b border-[#EA9661]/40">
          <div className="w-12 h-12 rounded-2xl bg-white/80 border border-[#EA9661]/40 flex items-center justify-center mx-auto text-amber-950 shadow-sm">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">Club Interview Queue</h1>
          <p className="text-xs text-amber-900/90 font-medium">
            Enter your Registration Number or Email to join the live waiting queue.
          </p>
        </div>

        {/* Streamlined Form (Registration Number & Email ID Only) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Field 1: Registration Number */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Registration Number <span className="text-rose-500">*</span>
              </label>
              {isLookingUp && (
                <span className="text-[10px] text-amber-800 dark:text-[#FFBE91] font-semibold animate-pulse">
                  Checking roster...
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="2025XXXXXXX"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                className="w-full h-11 px-3.5 font-mono uppercase text-sm font-bold bg-[#FFFCE1]/40 dark:bg-slate-900/60 border border-[#FFDDB0] dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-[#FFBE91] focus:outline-none focus:ring-2 focus:ring-[#FFBE91]/30 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal"
                autoFocus
              />
              {syncedStudent && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>

          {/* Field 2: Email ID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Email ID
            </label>
            <input
              type="email"
              placeholder="e.g. student.name@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3.5 text-xs font-medium bg-[#FFFCE1]/40 dark:bg-slate-900/60 border border-[#FFDDB0] dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-[#FFBE91] focus:outline-none focus:ring-2 focus:ring-[#FFBE91]/30 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Auto-Fetched Candidate Profile Preview */}
          {syncedStudent ? (
            <div className="p-4 bg-[#FFFCE1]/80 dark:bg-slate-900/80 rounded-2xl border border-[#FFDDB0] dark:border-slate-700 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Roster Record Found
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {syncedStudent.registrationNumber}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{syncedStudent.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {syncedStudent.branch} • Year {syncedStudent.year}
                </p>
              </div>

              {/* Synced Domain Preferences */}
              {syncedStudent.domainPreferences && syncedStudent.domainPreferences.length > 0 && (
                <div className="pt-1.5 border-t border-[#FFDDB0]/60 dark:border-slate-800 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Your Synced Preferences:
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {syncedStudent.domainPreferences.map((pref: any, idx: number) => {
                      const domainName =
                        typeof pref.domainId === 'object' && pref.domainId !== null
                          ? pref.domainId.name
                          : `Domain ${pref.priority}`;

                      return (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[#CFEBFF] dark:bg-[#CFEBFF]/20 text-sky-950 dark:text-[#CFEBFF] border border-[#BAE2FE] dark:border-[#CFEBFF]/30"
                        >
                          #{pref.priority} {domainName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#FFFCE1]/50 dark:bg-slate-900/60 border border-[#FFDDB0]/60 dark:border-slate-800 text-[11px] text-amber-900 dark:text-[#FFDDB0] flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-700 dark:text-[#FFBE91] shrink-0 mt-0.5" />
              <span>
                Your candidate profile and domain preferences will be automatically fetched and verified against the recruitment sheet.
              </span>
            </div>
          )}

          {/* Submit Action */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full gap-2 font-bold text-sm h-12 shadow-md bg-[#FFBE91] text-amber-950 hover:bg-[#F5A875] border border-[#EA9661]/40"
          >
            <span>CONFIRM & JOIN QUEUE</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-center text-[11px] text-slate-400">
            Once submitted, your queue ticket and position will update in real-time.
          </p>
        </form>
      </div>
    </div>
  );
};
