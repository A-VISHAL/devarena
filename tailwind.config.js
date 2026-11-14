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
          bg: '#101318',
          surface: '#1A2029',
          elevated: '#202936',
          border: '#293443',
          borderHover: '#394759',
          blue: '#4C7DFF',
          blueHover: '#3B6DEC',
          teal: '#39C6B5',
          tealHover: '#2EB0A0',
          textPrimary: '#F3F5F8',
          textSecondary: '#9AA6B5',
          textSubtle: '#758397',
          success: '#36B98A',
          warning: '#E5A33D',
          error: '#E36C72',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.25), 0 2px 4px -2px rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
