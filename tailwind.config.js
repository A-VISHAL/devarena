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
          bg: '#141719',
          surface: '#1D2224',
          elevated: '#242A2D',
          border: '#30383A',
          borderHover: '#455053',
          amber: '#E6A746',
          amberHover: '#D49635',
          primary: '#E6A746',
          primaryHover: '#D49635',
          secondary: '#83B6A3',
          secondaryHover: '#72A491',
          teal: '#83B6A3',
          tealHover: '#72A491',
          blue: '#E6A746', // Unified with Midnight & Amber primary
          blueHover: '#D49635',
          textPrimary: '#F2F0E9',
          textSecondary: '#A3A8A6',
          textSubtle: '#727978',
          success: '#83B6A3',
          warning: '#E6A746',
          error: '#E36C72',
        }
      },
      maxWidth: {
        'page': '1600px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.35)',
        card: '0 4px 12px -2px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
