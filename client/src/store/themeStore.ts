import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

const applyThemeToDOM = (theme: ThemeMode) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: (typeof localStorage !== 'undefined' && (localStorage.getItem('panelflow_theme') as ThemeMode)) || 'light',

  initTheme: () => {
    const saved = (localStorage.getItem('panelflow_theme') as ThemeMode) || 'light';
    applyThemeToDOM(saved);
    set({ theme: saved });
  },

  setTheme: (theme: ThemeMode) => {
    localStorage.setItem('panelflow_theme', theme);
    applyThemeToDOM(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));
