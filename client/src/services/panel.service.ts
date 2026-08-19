import { api } from './api.js';
import { IPanel, PanelStatus, IQueueEntry, IStudent, IInterviewer } from '../types/index.js';

export const panelService = {
  getAllPanels: () => api.get<IPanel[]>('/panels'),
  getPanelById: (id: string) => api.get<IPanel>(`/panels/${id}`),
  updateStatus: (id: string, status: PanelStatus) =>
    api.patch<IPanel>(`/panels/${id}/status`, { status }),
  createPanel: (data: { panelCode: string; name: string; roomLocation?: string; interviewerIds?: string[] }) =>
    api.post<IPanel>('/panels', data),
  updatePanelDetails: (id: string, data: { name?: string; roomLocation?: string }) =>
    api.patch<IPanel>(`/panels/${id}`, data),
  addInterviewer: (panelId: string, data: { name: string; email: string; domains: string[] }) =>
    api.post<IPanel>(`/panels/${panelId}/interviewers`, data),
  updateInterviewer: (interviewerId: string, data: { name?: string; email?: string; domains?: string[] }) =>
    api.put<{ interviewer: IInterviewer; panel: IPanel }>(`/panels/interviewers/${interviewerId}`, data),
  removeInterviewer: (panelId: string, interviewerId: string) =>
    api.delete<IPanel>(`/panels/${panelId}/interviewers/${interviewerId}`),
  startInterview: (panelId: string) =>
    api.post<{ panel: IPanel; queueEntry: IQueueEntry }>(`/interviews/${panelId}/start`),
  completeInterview: (panelId: string) =>
    api.post<{ success: boolean; panel: IPanel; student: IStudent; durationMinutes: number; message: string }>(
      `/interviews/${panelId}/complete`
    ),
};
