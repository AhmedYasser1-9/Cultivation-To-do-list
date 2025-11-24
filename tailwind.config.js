/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        jade: {
          400: '#34d399',
        },
        amber: {
          900: '#713f12',
        },
        crimson: {
          500: '#ef4444',
        },
      },
      backgroundImage: {
        'celestial-grid':
          'radial-gradient(circle at 20% 20%, rgba(8,145,178,0.15), transparent 40%), radial-gradient(circle at 80% 0%, rgba(248,250,252,0.08), transparent 30%)',
      },
      boxShadow: {
        aura: '0 0 35px rgba(251,191,36,0.25)',
      },
    },
  },
  plugins: [],
}

