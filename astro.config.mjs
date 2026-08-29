import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static',
  adapter: vercel({
    edgeMiddleware: true,
    webAnalytics: { enabled: true }
  }),
  integrations: [tailwind()],
  vite: {
    optimizeDeps: {
      include: ['jalali-moment', 'gsap']
    }
  },
  prefetch: true,
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto'
  }
});