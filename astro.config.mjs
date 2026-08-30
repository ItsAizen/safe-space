import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  integrations: [tailwind()],
  output: 'server',
  adapter: vercel(),
  server: { port: 4321 },
  vite: {
    optimizeDeps: {
      exclude: ['@upstash/redis']
    }
  }
});
