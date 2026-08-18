import { create } from 'zustand';
import { UserSession, IPanel } from '../types/index.js';
import { authService } from '../services/auth.service.js';

interface AuthState {
  user: UserSession | null;
  panel: IPanel | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: UserSession | null, panel?: IPanel | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  panel: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, panel = null) => {
    set({
      user,
      panel,
      isAuthenticated: !!user,
      isLoading: false,
    });
  },

  checkAuth: async () => {
    try {
      const data = await authService.getMe();
      set({
        user: data.user,
        panel: data.panel || null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        panel: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      set({
        user: null,
        panel: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
