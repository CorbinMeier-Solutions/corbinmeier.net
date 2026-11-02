import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { readSiteUrl } from './scripts/site-url.mjs';

export default defineConfig({
  plugins: [
    reactRouter(),
    tailwindcss(),
  ],
  define: { __SITE_URL__: JSON.stringify(readSiteUrl()) },
  envPrefix: ['VITE_', 'TURNSTILE_'],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // Vite 6 defaults to "baseline-widely-available" (Safari 16.0). A phone
    // below that floor cannot parse the bundle at all, so React never mounts
    // and #root stays empty - visually identical to the blank screen in issue
    // #7. Pin an explicit, older JS floor so the failure mode is impossible.
    target: ['es2020', 'safari14', 'chrome87', 'firefox78', 'edge88'],
    // Held at the Tailwind v4 floor on purpose: its output relies on
    // color-mix()/oklch()/@property, which no downlevelling can reproduce, and
    // aiming esbuild lower only risks rewriting CSS it cannot actually fix.
    cssTarget: 'safari16',
  },
});
