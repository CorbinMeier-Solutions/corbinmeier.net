import path from 'path'
import { configDefaults, defineConfig } from 'vitest/config'
import { readSiteUrl } from './scripts/site-url.mjs'

export default defineConfig({
  define: { __SITE_URL__: JSON.stringify(readSiteUrl()) },
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}', 'functions/**/*.test.ts', 'scripts/**/*.test.ts'],
    exclude: [...configDefaults.exclude, '.claude/worktrees/**'],
    setupFiles: ['src/test-setup.ts'],
  },
})
