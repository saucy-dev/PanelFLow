/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        palette: {
          peach: '#FFBE91',
          peachDark: '#EA9661',
          apricot: '#FFDDB0',
          apricotDark: '#E2B882',
          cream: '#FFFCE1',
          creamLight: '#FFFDF0',
          ice: '#CFEBFF',
          iceDark: '#93C5FD',
        },
        background: '#FFFCE1',
        foreground: '#1E293B',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1E293B',
        },
        primary: {
          DEFAULT: '#FFBE91',
          hover: '#F5A875',
          foreground: '#431407',
        },
        secondary: {
          DEFAULT: '#FFDDB0',
          hover: '#F2CCA0',
          foreground: '#78350F',
        },
        ice: {
          DEFAULT: '#CFEBFF',
          hover: '#BAE2FE',
          foreground: '#0369A1',
        },
        status: {
          available: {
            bg: '#ECFDF5',
            text: '#047857',
            border: '#A7F3D0',
            dot: '#10B981',
          },
          occupied: {
            bg: '#FEF2F2',
            text: '#B91C1C',
            border: '#FECACA',
            dot: '#EF4444',
          },
          paused: {
            bg: '#FFFBEB',
            text: '#B45309',
            border: '#FDE68A',
            dot: '#F59E0B',
          },
          offline: {
            bg: '#F3F4F6',
            text: '#4B5563',
            border: '#E5E7EB',
            dot: '#9CA3AF',
          },
          assigned: {
            bg: '#CFEBFF',
            text: '#0369A1',
            border: '#BAE2FE',
            dot: '#0284C7',
          },
          interviewing: {
            bg: '#FAF5FF',
            text: '#7E22CE',
            border: '#E9D5FF',
            dot: '#A855F7',
          },
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
