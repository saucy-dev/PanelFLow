import { api } from './api.js';
import { UserSession, IPanel } from '../types/index.js';

export interface LoginResponse {
  user: UserSession;
  token: string;
  panel?: IPanel;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const data = await api.post<LoginResponse>('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('panelflow_token', data.token);
    }
    return data;
  },

  panelLogin: async (panelCode: string): Promise<LoginResponse> => {
    const data = await api.post<LoginResponse>('/auth/panel-login', { panelCode });
    if (data.token) {
      localStorage.setItem('panelflow_token', data.token);
    }
    return data;
  },

  getMe: async (): Promise<{ user: UserSession; panel?: IPanel }> => {
    return api.get<{ user: UserSession; panel?: IPanel }>('/auth/me');
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('panelflow_token');
    await api.post('/auth/logout');
  },
};
