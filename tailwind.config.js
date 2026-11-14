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
          bg: '#101314',
          surface: '#1C2426',
          elevated: '#252D30',
          border: '#2B3538',
          borderHover: '#3E4C50',
          amber: '#FFAD42',
          amberHover: '#E59830',
          orange: '#FFAD42',
          primary: '#FFAD42',
          primaryHover: '#E59830',
          cyan: '#00E5FF',
          cyanHover: '#00C8E0',
          lime: '#B5FF4A',
          limeHover: '#9FE63B',
          secondary: '#83B6A3',
          secondaryHover: '#72A491',
          teal: '#00E5FF', // Neon cyan for live indicators & telemetry
          tealHover: '#00C8E0',
          blue: '#FFAD42',
          blueHover: '#E59830',
          textPrimary: '#F5F5F5',
          textSecondary: '#9AA5A6',
          textSubtle: '#667275',
          success: '#B5FF4A', // Neon lime for verified & winning states
          warning: '#FFAD42',
          error: '#FF5C67',
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
