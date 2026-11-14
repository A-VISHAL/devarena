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
        arena: {
          bg: '#080a10',
          surface: '#0f1422',
          surfaceLight: '#161d31',
          surfaceHover: '#1f2842',
          card: '#121727',
          border: 'rgba(255, 255, 255, 0.09)',
          borderHover: 'rgba(139, 92, 246, 0.4)',
          violet: '#8b5cf6',
          violetDark: '#6d28d9',
          violetLight: '#a78bfa',
          cyan: '#06b6d4',
          cyanLight: '#22d3ee',
          cyanDark: '#0891b2',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(139, 92, 246, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}

