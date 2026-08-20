import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore.js';
import { authService } from '../../services/auth.service.js';
import { panelService } from '../../services/panel.service.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { ThemeToggle } from '../../components/common/ThemeToggle.js';
import { Layers, Shield, Users, User, ArrowRight, Lock } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [activeTab, setActiveTab] = useState<'admin' | 'panel' | 'student'>('admin');
  const [email, setEmail] = useState('admin@panelflow.com');
  const [password, setPassword] = useState('adminpassword123');
  const [regNo, setRegNo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch live panels to reflect login state (Red if logged in/active, Green if logged out/offline)
  const { data: panels = [] } = useQuery({
    queryKey: ['login-panels'],
    queryFn: panelService.getAllPanels,
    staleTime: 10000,
  });

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      setAuth(res.user, null);
      toast.success('Signed in as Admin Coordinator!');
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePanelLogin = async (selectedCode: string) => {
    setIsLoading(true);
    try {
      const res = await authService.panelLogin(selectedCode);
      setAuth(res.user, res.panel);
      toast.success(`Accessed workstation for Panel ${selectedCode}!`);
      navigate(`/panel/${selectedCode}`);
    } catch (error: any) {
      toast.error(error.message || 'Panel login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNo.trim()) return;
    navigate(`/interview/queue/${regNo.trim().toUpperCase()}`);
  };

  const defaultPanelCodes = [
    { code: 'P1', domains: 'AR/VR • IOT • ML' },
    { code: 'P2', domains: 'Web • Android' },
    { code: 'P3', domains: 'ML • Web' },
    { code: 'P4', domains: 'Android • IOT' },
  ];

  return (
    <div className="min-h-screen bg-[#FFFCE1] dark:bg-[#0B0F19] flex flex-col justify-center items-center p-4 sm:p-6 select-none relative transition-colors duration-150 font-sans">
      {/* Top Floating Theme Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white/95 dark:bg-[#0F1626]/95 backdrop-blur-md rounded-3xl border border-[#FFDDB0] dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Logo Banner in Peach */}
        <div className="bg-[#FFBE91] text-amber-950 p-6 text-center space-y-2 border-b border-[#EA9661]/40">
          <div className="w-11 h-11 rounded-2xl bg-white/80 border border-[#EA9661]/40 flex items-center justify-center mx-auto text-amber-950 shadow-sm">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">PanelFlow Portal</h1>
          <p className="text-xs text-amber-900/90 font-medium">
            Real-Time Multi-Panel Club Interview Management System
          </p>
        </div>

        {/* Role Switcher */}
        <div className="p-3.5 border-b border-[#FFDDB0] dark:border-slate-800 bg-[#FFFCE1]/60 dark:bg-slate-900/60">
          <div className="flex bg-[#FFDDB0]/50 dark:bg-slate-800/80 p-0.5 rounded-xl text-xs font-semibold">
            {(
              [
                { key: 'admin', label: 'Admin', icon: Shield },
                { key: 'panel', label: 'Panel Login', icon: Users },
                { key: 'student', label: 'Candidate', icon: User },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === tab.key
                      ? 'bg-white dark:bg-[#111726] text-amber-950 dark:text-white font-bold shadow-2xs'
                      : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Admin Login */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="p-6 space-y-4">
            <Input
              label="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="p-3 rounded-xl bg-[#FFFCE1] dark:bg-slate-900/80 border border-[#FFDDB0] dark:border-slate-700 text-[11px] text-amber-950 dark:text-slate-300 space-y-0.5">
              <p className="font-bold text-amber-950 dark:text-[#FFBE91]">Demo Credentials:</p>
              <p className="font-mono text-slate-600 dark:text-slate-400">Email: admin@panelflow.com</p>
              <p className="font-mono text-slate-600 dark:text-slate-400">Password: adminpassword123</p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold h-11 text-xs"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" /> Sign In as Admin Coordinator
            </Button>
          </form>
        )}

        {/* Tab 2: Panel Quick Login (Red if Logged In, Green if Logged Out) */}
        {activeTab === 'panel' && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2">
                Select Active Interview Panel:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {defaultPanelCodes.map(({ code, domains }) => {
                  const livePanel = panels.find((p) => p.panelCode === code);
                  // Panel is logged in if its status is active (AVAILABLE, OCCUPIED, PAUSED)
                  // Panel is logged out if its status is OFFLINE
                  const isLoggedIn = livePanel ? livePanel.status !== 'OFFLINE' : false;

                  return (
                    <button
                      key={code}
                      onClick={() => handlePanelLogin(code)}
                      className={`p-3.5 rounded-2xl border text-center font-bold text-sm transition-all cursor-pointer flex flex-col justify-center items-center gap-1 shadow-2xs ${
                        isLoggedIn
                          ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/80 text-rose-950 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                          : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                      }`}
                    >
                      <span className="font-mono text-sm font-black">Panel {code}</span>
                      <span className="text-[10px] font-medium opacity-80 truncate w-full text-center">
                        {livePanel?.name ? livePanel.name.replace(/^Panel \d+ — /, '') : domains}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-400">
              Clicking any panel button opens its dedicated interviewer workstation.
            </p>
          </div>
        )}

        {/* Tab 3: Candidate Lookup */}
        {activeTab === 'student' && (
          <form onSubmit={handleStudentLookup} className="p-6 space-y-4">
            <Input
              label="Your Registration Number"
              placeholder="e.g. 2025XXXXXXX"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value.toUpperCase())}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold h-11 text-xs"
            >
              <span>View My Live Queue Position</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>

            <div className="pt-1 text-center">
              <Link
                to="/interview/join"
                className="text-xs font-semibold text-amber-900 dark:text-[#FFBE91] hover:underline"
              >
                Not in queue yet? Click here to join queue →
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
