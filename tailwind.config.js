/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0b0b0f',
        background: '#141218',
        surface: '#141218',
        panel: '#1d1b20',
        panelHigh: '#211f24',
        panelHigher: '#2b292f',
        border: '#2a2a2a',
        outline: '#494551',
        muted: '#9ca3af',
        text: '#f5f5f5',
        crimson: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        crimson: '0 0 34px rgba(220, 38, 38, 0.18)',
        panel: '0 24px 70px rgba(0, 0, 0, 0.38)',
      },
      backgroundImage: {
        app: 'linear-gradient(135deg, #09090b 0%, #141218 46%, #2a0808 100%)',
        panel:
          'linear-gradient(145deg, rgba(29, 27, 32, 0.96), rgba(13, 13, 16, 0.98))',
        crimson:
          'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #450a0a 100%)',
      },
    },
  },
  plugins: [],
};
