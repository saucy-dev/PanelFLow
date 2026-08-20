import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { ThemeToggle } from './ThemeToggle.js';
import { QRCodeModal } from './QRCodeModal.js';
import { Button } from '../ui/Button.js';
import {
  Layers,
  QrCode,
  LayoutDashboard,
  Users,
  BarChart3,
  History,
  Tv,
  LogOut,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, panel, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isQrOpen, setIsQrOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/admin', label: 'Control Center', icon: LayoutDashboard, role: 'ADMIN' },
    { to: '/admin/panels', label: 'Panels & Teams', icon: Users, role: 'ADMIN' },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, role: 'ADMIN' },
    { to: '/admin/audit', label: 'Audit Trail', icon: History, role: 'ADMIN' },
    { to: '/display', label: 'Waiting Room TV', icon: Tv, role: 'ALL' },
  ];

  const visibleLinks = navLinks.filter((link) => {
    if (link.role === 'ALL') return true;
    if (user?.role === 'ADMIN') return true;
    return false;
  });

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFFCE1]/90 dark:bg-[#0F1626]/90 backdrop-blur-md border-b border-[#FFDDB0] dark:border-slate-800 shadow-2xs h-14 shrink-0 select-none transition-colors duration-150">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Brand Logo & Nav Tabs */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-xl bg-[#FFBE91] border border-[#EA9661]/40 flex items-center justify-center text-amber-950 shadow-2xs group-hover:bg-[#F5A875] transition-colors">
                  <Layers className="w-4.5 h-4.5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">PanelFlow</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded bg-[#CFEBFF] dark:bg-[#CFEBFF]/20 text-sky-900 dark:text-[#CFEBFF] border border-[#BAE2FE] dark:border-[#CFEBFF]/30">
                    Live
                  </span>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                {visibleLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#FFBE91] text-amber-950 border border-[#EA9661]/40 shadow-2xs font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-[#FFDDB0]/40 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-950' : 'text-slate-500 dark:text-slate-400'}`} />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Controls: Theme Toggle, QR, User */}
            <div className="flex items-center gap-2.5">
              {/* Theme Switcher Toggle */}
              <ThemeToggle />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsQrOpen(true)}
                className="gap-1.5 text-xs font-semibold h-8 bg-white/80 dark:bg-slate-800/80 border-[#FFDDB0] dark:border-slate-700 dark:text-slate-200 hover:bg-[#FFFCE1] dark:hover:bg-slate-700"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-900 dark:text-[#FFBE91]" />
                <span className="hidden sm:inline">QR Code</span>
              </Button>

              {isAuthenticated && user ? (
                <div className="flex items-center gap-2 pl-2.5 border-l border-[#FFDDB0] dark:border-slate-800">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {user.role === 'PANEL' && panel ? `Panel ${panel.panelCode}` : user.name}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                      {user.role}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    title="Log Out"
                    className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 h-8 w-8"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 pl-2.5 border-l border-[#FFDDB0] dark:border-slate-800">
                  <Link to="/login">
                    <Button variant="primary" size="sm" className="text-xs h-8">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* QR Code Dialog */}
      <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
    </>
  );
};
