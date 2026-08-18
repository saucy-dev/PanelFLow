import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import { useSocketStore } from './store/socketStore.js';
import { getSocket } from './socket/socketClient.js';
import { Toaster } from 'sonner';

// Pages
import { LoginPage } from './pages/auth/LoginPage.js';
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { PanelsManagement } from './pages/admin/PanelsManagement.js';
import { AnalyticsPage } from './pages/admin/AnalyticsPage.js';
import { AuditLogsPage } from './pages/admin/AuditLogsPage.js';
import { PanelDashboard } from './pages/panel/PanelDashboard.js';
import { JoinQueuePage } from './pages/student/JoinQueuePage.js';
import { QueueStatusPage } from './pages/student/QueueStatusPage.js';
import { WaitingRoomDisplay } from './pages/display/WaitingRoomDisplay.js';

export function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const setConnected = useSocketStore((state) => state.setConnected);

  // Initialize authentication check once on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Initialize socket lifecycle once on mount
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    if (socket.connected) {
      setConnected(true);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Authentication */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/panels" element={<PanelsManagement />} />
        <Route path="/admin/analytics" element={<AnalyticsPage />} />
        <Route path="/admin/audit" element={<AuditLogsPage />} />

        {/* Panel Workstation */}
        <Route path="/panel" element={<PanelDashboard />} />
        <Route path="/panel/:panelCode" element={<PanelDashboard />} />

        {/* Candidate QR Flow */}
        <Route path="/interview/join" element={<JoinQueuePage />} />
        <Route path="/interview/queue/:id" element={<QueueStatusPage />} />

        {/* Public Waiting Room TV Display */}
        <Route path="/display" element={<WaitingRoomDisplay />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </>
  );
}

export default App;
