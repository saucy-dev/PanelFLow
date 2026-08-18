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
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
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
            bg: '#EFF6FF',
            text: '#1D4ED8',
            border: '#BFDBFE',
            dot: '#3B82F6',
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
