/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['SafeSpace', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        surface: {
          dark: '#090a0f',
          'dark-elevated': '#111218',
          'dark-card': '#16171d',
          light: '#fafaf9',
          'light-elevated': '#f5f5f4',
          'light-card': '#ffffff',
        },
        neon: {
          emerald: '#10b981',
          mint: '#34d399',
          glow: 'rgba(16, 185, 129, 0.15)',
          'glow-strong': 'rgba(16, 185, 129, 0.3)',
        },
        glass: {
          border: 'rgba(255, 255, 255, 0.08)',
          'border-light': 'rgba(0, 0, 0, 0.06)',
          fill: 'rgba(255, 255, 255, 0.03)',
          'fill-light': 'rgba(0, 0, 0, 0.02)',
        },
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(16, 185, 129, 0.1)',
        'glow-md': '0 0 30px rgba(16, 185, 129, 0.15)',
        'glow-lg': '0 0 60px rgba(16, 185, 129, 0.2)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'inner-glow-light': 'inset 0 1px 0 0 rgba(0, 0, 0, 0.03)',
        'soft-dark': '0 1px 3px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.2)',
        'soft-light': '0 1px 3px rgba(0, 0, 0, 0.05), 0 8px 24px rgba(0, 0, 0, 0.04)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
