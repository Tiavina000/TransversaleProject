/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        accent:  '#06B6D4',
        danger:  '#EF4444',
        warning: '#F59E0B',
        surface: 'rgba(255,255,255,0.05)',
        glass:   'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-metal':  'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
        'gradient-dark':   'linear-gradient(135deg, #0F0F1A 0%, #1A0A2E 100%)',
        'gradient-card':   'linear-gradient(145deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.1) 100%)',
      },
      backdropBlur: {
        glass: '16px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'gradient':   'gradient 4s ease infinite',
      },
      keyframes: {
        glow: {
          '0%':   { boxShadow: '0 0 5px #7C3AED' },
          '100%': { boxShadow: '0 0 20px #06B6D4, 0 0 40px #7C3AED' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}

