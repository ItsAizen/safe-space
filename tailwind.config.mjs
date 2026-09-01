/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['SafeSpace', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        surface: {
          dark: '#0c0a1a',
          'dark-elevated': '#13102a',
          'dark-card': '#1a1530',
        },
        rose: {
          deep: '#be185d',
          light: '#f472b6',
          glow: 'rgba(244, 114, 182, 0.15)',
          'glow-strong': 'rgba(244, 114, 182, 0.3)',
        },
        lavender: {
          deep: '#7c3aed',
          light: '#c4b5fd',
          glow: 'rgba(124, 58, 237, 0.15)',
        },
        blush: '#fdf2f8',
        'pixel-glow': 'rgba(244, 114, 182, 0.15)',
        glass: {
          border: 'rgba(255, 255, 255, 0.08)',
          fill: 'rgba(255, 255, 255, 0.03)',
        },
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(244, 114, 182, 0.1)',
        'glow-md': '0 0 30px rgba(244, 114, 182, 0.15)',
        'glow-lg': '0 0 60px rgba(244, 114, 182, 0.2)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'soft-dark': '0 1px 3px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.2)',
        'pixel': '4px 4px 0px rgba(0, 0, 0, 0.4)',
        'pixel-sm': '2px 2px 0px rgba(0, 0, 0, 0.4)',
        'pixel-rose': '4px 4px 0px rgba(190, 24, 93, 0.3)',
        'pixel-lavender': '4px 4px 0px rgba(124, 58, 237, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pixel-blink': 'pixelBlink 1.2s step-end infinite',
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
        pixelBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
