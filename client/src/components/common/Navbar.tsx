import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { ConnectionIndicator } from './ConnectionIndicator.js';
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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs h-14 shrink-0 select-none">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Brand Logo & Nav Tabs */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-2xs group-hover:bg-blue-700 transition-colors">
                  <Layers className="w-4.5 h-4.5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900">PanelFlow</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200/80">
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
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Controls: Status, QR, User */}
            <div className="flex items-center gap-2.5">
              <ConnectionIndicator />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsQrOpen(true)}
                className="gap-1.5 text-xs font-semibold h-8"
              >
                <QrCode className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">QR Code</span>
              </Button>

              {isAuthenticated && user ? (
                <div className="flex items-center gap-2 pl-2.5 border-l border-slate-200">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {user.role === 'PANEL' && panel ? `Panel ${panel.panelCode}` : user.name}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      {user.role}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    title="Log Out"
                    className="text-slate-400 hover:text-rose-600 h-8 w-8"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 pl-2.5 border-l border-slate-200">
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
