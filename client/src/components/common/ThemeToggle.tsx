import React from 'react';
import { useThemeStore } from '../../store/themeStore.js';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      className={`relative inline-flex items-center justify-center w-8 h-8 rounded-xl transition-all cursor-pointer select-none border ${
        isDark
          ? 'bg-[#111726] text-[#FFDDB0] border-slate-700 hover:border-[#FFBE91] hover:text-[#FFBE91]'
          : 'bg-white/90 text-amber-950 border-[#FFDDB0] hover:bg-[#FFFCE1] hover:border-[#FFBE91]'
      } shadow-2xs ${className}`.trim()}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#FFBE91] transition-transform rotate-0 hover:rotate-45 duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-amber-900 transition-transform -rotate-12 hover:rotate-0 duration-200" />
      )}
    </button>
  );
};
