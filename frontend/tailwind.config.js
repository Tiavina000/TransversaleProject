/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1B8A5A',
        'primary-dark': '#126B45',
        'primary-light': '#EAF7F0',
        accent:  '#D64545',
        danger:  '#D64545',
        warning: '#D97706',
        surface: 'rgba(27,138,90,0.04)',
        glass:   'rgba(255,255,255,0.8)',
        'text-main': '#333333',
        'text-sec': '#555555',
        'text-muted': '#888888',
        border: '#E0E0E0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-green':  'linear-gradient(135deg, #1B8A5A 0%, #126B45 100%)',
        'gradient-hero':   'linear-gradient(135deg, #EAF7F0 0%, #FFFFFF 50%)',
        'gradient-card':   'linear-gradient(135deg, rgba(27,138,90,0.06) 0%, rgba(27,138,90,0.02) 100%)',
      },
    },
  },
  plugins: [],
}

