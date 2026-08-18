import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queueService } from '../../services/queue.service.js';
import { adminService } from '../../services/admin.service.js';
import { IDomain } from '../../types/index.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Layers, Search, Sparkles, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const JoinQueuePage: React.FC = () => {
  const navigate = useNavigate();

  const [regNumber, setRegNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [year, setYear] = useState('1');
  const [phone, setPhone] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lookupSuccess, setLookupSuccess] = useState(false);

  // Fetch available active domains
  const { data: domains = [] } = useQuery<IDomain[]>({
    queryKey: ['domains'],
    queryFn: adminService.getAllDomains,
  });

  // Auto lookup when registration number reaches 6+ chars
  const handleLookup = async (inputReg: string) => {
    const cleanReg = inputReg.trim().toUpperCase();
    if (cleanReg.length < 3) return;

    setIsLookingUp(true);
    try {
      const student = await queueService.lookupStudent(cleanReg);
      if (student) {
        setName(student.name || '');
        setEmail(student.email || '');
        setBranch(student.branch || 'CSE');
        setYear(student.year?.toString() || '1');
        setPhone(student.phone || '');

        if (student.domainPreferences && student.domainPreferences.length > 0) {
          const prefIds = student.domainPreferences.map((p: any) =>
            typeof p.domainId === 'object' && p.domainId !== null ? p.domainId._id : p.domainId
          );
          setSelectedDomains(prefIds);
        }
        setLookupSuccess(true);
        toast.success(`Found candidate record for ${student.name}!`);
      }
    } catch {
      setLookupSuccess(false);
      // not pre-imported, allow manual entry
    } finally {
      setIsLookingUp(false);
    }
  };

  const toggleDomain = (domainId: string) => {
    if (selectedDomains.includes(domainId)) {
      setSelectedDomains(selectedDomains.filter((id) => id !== domainId));
    } else {
      if (selectedDomains.length >= 3) {
        toast.info('You can select up to 3 domain preferences.');
        return;
      }
      setSelectedDomains([...selectedDomains, domainId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regNumber.trim()) {
      toast.error('Registration number is required.');
      return;
    }
    if (!name.trim()) {
      toast.error('Candidate name is required.');
      return;
    }
    if (!email.trim()) {
      toast.error('Email address is required.');
      return;
    }
    if (selectedDomains.length === 0) {
      toast.error('Please select at least 1 domain preference.');
      return;
    }

    setIsSubmitting(true);
    try {
      const domainPreferences = selectedDomains.map((dId, idx) => ({
        domainId: dId,
        priority: idx + 1,
      }));

      const res = await queueService.join({
        registrationNumber: regNumber.trim().toUpperCase(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        branch: branch.trim(),
        year,
        phone: phone.trim(),
        domainPreferences,
      });

      if (res.isExisting) {
        toast.info(res.message);
      } else {
        toast.success('Joined queue successfully!');
      }

      navigate(`/interview/queue/${res.queueEntry._id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to join queue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Mobile Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto text-white shadow-inner">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight">Club Interview Queue</h1>
          <p className="text-xs text-blue-100 font-medium">
            Scan & enter your details to join the live interview waiting queue.
          </p>
        </div>

        {/* Join Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Registration Number Lookup */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Registration Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. 24BCE1001"
                value={regNumber}
                onChange={(e) => {
                  setRegNumber(e.target.value);
                  handleLookup(e.target.value);
                }}
                className="w-full h-11 px-3.5 font-mono uppercase text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
              {lookupSuccess && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Enter your student registration number to auto-fill details.
            </p>
          </div>

          {/* Student Info Inputs */}
          <div className="space-y-3">
            <Input
              label="Full Name *"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address *"
              type="email"
              placeholder="your.email@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Branch
                </label>
                <input
                  type="text"
                  placeholder="e.g. CSE"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none font-medium"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Domain Preferences Selection */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Domain Preferences ({selectedDomains.length}/3) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Order by choice</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {domains.map((dom) => {
                const isSelected = selectedDomains.includes(dom._id);
                const rank = selectedDomains.indexOf(dom._id) + 1;

                return (
                  <button
                    type="button"
                    key={dom._id}
                    onClick={() => toggleDomain(dom._id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{dom.name}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 ml-1">
                        #{rank}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Join Queue Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full gap-2 font-bold text-sm h-12 shadow-md shadow-blue-600/20 bg-blue-600 hover:bg-blue-700"
          >
            <span>JOIN WAITING QUEUE</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
