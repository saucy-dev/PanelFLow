import { api } from './api.js';
import {
  IInterviewSession,
  IQueueEntry,
  IPanel,
  ISessionAnalytics,
  IEventLog,
  IAssignment,
  IDomain,
} from '../types/index.js';

export interface AdminDashboardData {
  session: IInterviewSession;
  queue: IQueueEntry[];
  panels: IPanel[];
  analytics: ISessionAnalytics;
  recentEvents: IEventLog[];
}

export interface DisplayData {
  session: IInterviewSession;
  queue: IQueueEntry[];
  panels: IPanel[];
}

export const adminService = {
  getDashboard: () => api.get<AdminDashboardData>('/admin/dashboard'),
  getDisplayData: () => api.get<DisplayData>('/sessions/display'),
  getAnalytics: (sessionId?: string) => {
    const params = sessionId ? `?sessionId=${sessionId}` : '';
    return api.get<ISessionAnalytics>(`/admin/analytics${params}`);
  },
  getEvents: (sessionId?: string, limit: number = 100) => {
    const params = new URLSearchParams();
    if (sessionId) params.append('sessionId', sessionId);
    params.append('limit', limit.toString());
    return api.get<IEventLog[]>(`/admin/events?${params.toString()}`);
  },
  assignStudent: (queueEntryId: string, panelId: string, notes?: string) =>
    api.post<{ assignment: IAssignment; queueEntry: IQueueEntry; panel: IPanel }>('/assignments', {
      queueEntryId,
      panelId,
      notes,
    }),
  reassignStudent: (assignmentId: string, newPanelId: string, notes?: string) =>
    api.post<{ assignment: IAssignment; newPanel: IPanel; oldPanel: IPanel; queueEntry: IQueueEntry }>(
      `/assignments/${assignmentId}/reassign`,
      { newPanelId, notes }
    ),
  cancelAssignment: (assignmentId: string, reason?: string, returnToQueue: boolean = true) =>
    api.post<{ success: boolean; message: string }>(`/assignments/${assignmentId}/cancel`, {
      reason,
      returnToQueue,
    }),
  getAllDomains: () => api.get<IDomain[]>('/domains'),
  updateSession: (sessionId: string, data: any) =>
    api.patch<IInterviewSession>(`/sessions/${sessionId}`, data),
};
