import { api } from './api.js';
import { IPanel, PanelStatus, IAssignment, IQueueEntry, IStudent } from '../types/index.js';

export const panelService = {
  getAllPanels: () => api.get<IPanel[]>('/panels'),
  getPanelById: (id: string) => api.get<IPanel>(`/panels/${id}`),
  updateStatus: (id: string, status: PanelStatus) =>
    api.patch<IPanel>(`/panels/${id}/status`, { status }),
  createPanel: (data: { panelCode: string; name: string; roomLocation?: string; interviewerIds?: string[] }) =>
    api.post<IPanel>('/panels', data),
  startInterview: (panelId: string) =>
    api.post<{ panel: IPanel; queueEntry: IQueueEntry }>(`/interviews/${panelId}/start`),
  completeInterview: (panelId: string) =>
    api.post<{ success: boolean; panel: IPanel; student: IStudent; durationMinutes: number; message: string }>(
      `/interviews/${panelId}/complete`
    ),
};
