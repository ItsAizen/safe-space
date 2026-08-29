/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        'canvas-2': 'var(--color-canvas-2)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        ink: 'var(--color-ink)',
        'ink-soft': 'var(--color-ink-soft)',
        mint: 'var(--color-mint)',
        'mint-soft': 'var(--color-mint-soft)',
        'mint-ink': '#07261c',
        line: 'var(--color-border)',
        danger: 'var(--color-danger)',
      },
      fontFamily: {
        sans: ['SafeSpace', 'Vazirmatn', 'Tahoma', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 60px -10px var(--color-glow)',
      },
    },
  },
  plugins: [],
};
