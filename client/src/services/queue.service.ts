import { api } from './api.js';
import { IQueueEntry, IStudent } from '../types/index.js';

export interface JoinQueuePayload {
  sessionId?: string;
  registrationNumber: string;
  name: string;
  email: string;
  branch: string;
  year: number | string;
  phone?: string;
  domainPreferences: Array<{ domainId: string; priority: number }>;
}

export interface JoinQueueResponse {
  isExisting: boolean;
  queueEntry: IQueueEntry;
  student: IStudent;
  position: number;
  studentsAhead: number;
  message: string;
}

export const queueService = {
  join: (data: JoinQueuePayload) => api.post<JoinQueueResponse>('/queue/join', data),
  getQueue: (sessionId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (sessionId) params.append('sessionId', sessionId);
    if (status) params.append('status', status);
    return api.get<IQueueEntry[]>(`/queue?${params.toString()}`);
  },
  getStatus: (identifier: string) =>
    api.get<{ queueEntry: IQueueEntry; studentsAhead: number; estimatedWaitMinutes: number }>(
      `/queue/${identifier}`
    ),
  removeFromQueue: (queueEntryId: string, reason?: string) =>
    api.post<IQueueEntry>(`/queue/${queueEntryId}/remove`, { reason }),
  restoreToQueue: (queueEntryId: string) => api.post<IQueueEntry>(`/queue/${queueEntryId}/restore`),
  lookupStudent: (registrationNumber: string) =>
    api.get<IStudent>(`/students/lookup/${registrationNumber}`),
};
