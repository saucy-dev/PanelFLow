import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { authService } from '../../services/auth.service.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Layers, Shield, Users, User, ArrowRight, Lock } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [activeTab, setActiveTab] = useState<'admin' | 'panel' | 'student'>('admin');
  const [email, setEmail] = useState('admin@panelflow.com');
  const [password, setPassword] = useState('adminpassword123');
  const [panelCode, setPanelCode] = useState('P1');
  const [regNo, setRegNo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Logo Banner */}
        <div className="bg-slate-900 text-white p-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mx-auto text-white shadow-md shadow-blue-600/30">
            <Layers className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-extrabold tracking-tight">PanelFlow Portal</h1>
          <p className="text-xs text-slate-400">
            Real-Time Multi-Panel Club Interview Management System
          </p>
        </div>

        {/* Role Switcher */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/60">
          <div className="flex bg-slate-200/70 p-0.5 rounded-xl text-xs font-semibold">
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
                  className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === tab.key
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
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
          <form onSubmit={handleAdminLogin} className="p-5 space-y-4">
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

            <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 space-y-0.5">
              <p className="font-semibold">Demo Credentials:</p>
              <p className="font-mono text-slate-600">Email: admin@panelflow.com</p>
              <p className="font-mono text-slate-600">Password: adminpassword123</p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold h-10 text-xs"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" /> Sign In as Admin Coordinator
            </Button>
          </form>
        )}

        {/* Tab 2: Panel Quick Login */}
        {activeTab === 'panel' && (
          <div className="p-5 space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Select Active Interview Panel:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {['P1', 'P2', 'P3', 'P4'].map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      setPanelCode(code);
                      handlePanelLogin(code);
                    }}
                    className={`p-3 rounded-xl border text-center font-bold text-sm transition-all cursor-pointer ${
                      panelCode === code
                        ? 'bg-blue-50 border-blue-500 text-blue-900'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-mono text-sm block font-black">Panel {code}</span>
                    <span className="text-[10px] font-normal text-slate-500">
                      {code === 'P1'
                        ? 'AR/VR • IOT • ML'
                        : code === 'P2'
                        ? 'Web • Android'
                        : code === 'P3'
                        ? 'ML • Web'
                        : 'Android • IOT'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-400">
              Clicking a panel opens its dedicated interviewer workstation.
            </p>
          </div>
        )}

        {/* Tab 3: Candidate Lookup */}
        {activeTab === 'student' && (
          <form onSubmit={handleStudentLookup} className="p-5 space-y-4">
            <Input
              label="Your Registration Number"
              placeholder="e.g. 24BCE1001"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value.toUpperCase())}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold h-10 text-xs"
            >
              <span>View My Live Queue Position</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>

            <div className="pt-1 text-center">
              <Link
                to="/interview/join"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
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
