// standard: wrangler-config@2026-10-16 - the production origin, read from wrangler.toml [vars].
// Usage:   node scripts/site-url.mjs   (prints the origin; on a bad value prints the message and exits 1)
// Imported by vite.config.ts and vitest.config.ts for the __SITE_URL__ define.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export function readSiteUrl(file = new URL('../wrangler.toml', import.meta.url)) {
  let inVars = false, url = ''
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (/^\s*\[/.test(line)) inVars = line.trim() === '[vars]'
    const m = inVars && line.match(/^\s*SITE_URL\s*=\s*"([^"]*)"/)
    if (m) url = m[1]
  }
  if (!/^https:\/\/[^/\s]+$/.test(url) || /example\.com|<|localhost|pages\.dev/.test(url)) {
    throw new Error('SITE_URL is not set in wrangler.toml [vars]: set it to the production origin, e.g. https://example.com')
  }
  return url
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    console.log(readSiteUrl())
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}
