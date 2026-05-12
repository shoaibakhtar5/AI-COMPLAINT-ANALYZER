/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Semantic theme tokens (CSS variable–driven) ──────────────────────
        // These map to CSS variables set by [data-theme="*"] in index.css.
        // Use these everywhere in components instead of hardcoded palette values.
        't-bg':          'var(--t-bg)',
        't-bg-alt':      'var(--t-bg-alt)',
        't-surface':     'var(--t-surface)',
        't-panel':       'var(--t-panel)',
        't-panel-high':  'var(--t-panel-high)',
        't-border':      'var(--t-border)',
        't-border-strong': 'var(--t-border-strong)',
        't-text':        'var(--t-text)',
        't-text-muted':  'var(--t-text-muted)',
        't-text-faint':  'var(--t-text-faint)',
        't-accent':      'var(--t-accent)',
        't-accent-hover':'var(--t-accent-hover)',
        't-accent-dark': 'var(--t-accent-dark)',
        't-accent-subtle':'var(--t-accent-subtle)',
        't-success':     'var(--t-success)',
        't-success-subtle': 'var(--t-success-subtle)',
        't-warning':     'var(--t-warning)',
        't-warning-subtle': 'var(--t-warning-subtle)',
        't-error':       'var(--t-error)',
        't-error-subtle':'var(--t-error-subtle)',
        't-info':        'var(--t-info)',
        't-info-subtle': 'var(--t-info-subtle)',

        // ─── Keep legacy crimson scale (used by DarkVeil / animation assets) ──
        crimson: {
          50:  '#fff1f2',
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

        // ─── Static palette aliases (kept for animation-only helpers) ─────────
        obsidian:    '#0b0b0f',
      },

      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },

      boxShadow: {
        'panel':      '0 24px 70px var(--t-shadow)',
        'accent':     '0 0 34px var(--t-accent-glow)',
        'card-hover': '0 8px 32px var(--t-shadow), 0 0 0 1px var(--t-border-strong)',
      },

      backgroundImage: {
        'app-gradient': 'var(--t-body-gradient)',
        'accent-gradient': 'var(--t-accent-gradient)',
      },

      transitionProperty: {
        'theme': 'background-color, border-color, color, box-shadow, opacity',
      },

      transitionDuration: {
        'theme': '200ms',
      },
    },
  },
  plugins: [],
};
