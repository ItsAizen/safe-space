import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode palette (default)
        space: {
          950: '#030407',
          900: '#090a0f',
          850: '#0d0f15',
          800: '#12151d',
          750: '#1a1e29',
          700: '#222733',
        },
        // Light mode palette
        porcelain: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
        },
        // Neon accent
        neon: {
          emerald: '#10b981',
          mint: '#34d399',
          glow: '#059669',
        },
        // Glass borders
        glass: {
          border: 'rgba(255, 255, 255, 0.08)',
          borderLight: 'rgba(0, 0, 0, 0.08)',
          bg: 'rgba(255, 255, 255, 0.03)',
          bgLight: 'rgba(255, 255, 255, 0.7)',
          bgHover: 'rgba(255, 255, 255, 0.06)',
          bgHoverLight: 'rgba(0, 0, 0, 0.04)',
        }
      },
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', 'sans-serif'],
        display: ['Vazirmatn', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem, 5vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['clamp(1.75rem, 4vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-md': ['clamp(1.375rem, 3vw, 1.75rem)', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading': ['clamp(1.125rem, 2.5vw, 1.375rem)', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.7', fontWeight: '400' }],
        'body': ['0.9375rem', { lineHeight: '1.65', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['0.8125rem', { lineHeight: '1.5', fontWeight: '400' }],
        'micro': ['0.75rem', { lineHeight: '1.5', fontWeight: '500' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3rem',
      },
      boxShadow: {
        'glass': '0 2px 16px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
        'glass-lg': '0 8px 48px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
        'glass-light': '0 2px 16px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04) inset',
        'glass-lg-light': '0 8px 48px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.04) inset',
        'neon': '0 0 24px rgba(16, 185, 129, 0.35), 0 0 48px rgba(16, 185, 129, 0.15)',
        'neon-sm': '0 0 12px rgba(16, 185, 129, 0.25)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
        'inner-glow-light': 'inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 rgba(0, 0, 0, 0.02)',
      },
      backdropBlur: {
        'glass': '20px',
        'glass-lg': '40px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-tight': 'cubic-bezier(0.4, 1.4, 0.6, 1)',
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      animation: {
        'fade-in': 'fadeIn 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-down': 'slideDown 400ms cubic-bezier(0.4, 1.4, 0.6, 1) forwards',
        'scale-in': 'scaleIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'shake': 'shake 400ms cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'pulse-glow': 'pulseGlow 2000ms ease-in-out infinite',
        'float': 'float 6000ms ease-in-out infinite',
        'rotate-slow': 'rotateSlow 20s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(16, 185, 129, 0.25), 0 0 24px rgba(16, 185, 129, 0.1)' },
          '50%': { boxShadow: '0 0 24px rgba(16, 185, 129, 0.4), 0 0 48px rgba(16, 185, 129, 0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '25%': { transform: 'translateY(-12px) translateX(6px)' },
          '50%': { transform: 'translateY(6px) translateX(-8px)' },
          '75%': { transform: 'translateY(-8px) translateX(4px)' },
        },
        rotateSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;