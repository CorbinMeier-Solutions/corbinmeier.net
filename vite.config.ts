/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  envPrefix: ['VITE_', 'TURNSTILE_'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
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
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}', 'functions/**/*.test.ts'],
    setupFiles: ['src/test-setup.ts'],
  },
});
