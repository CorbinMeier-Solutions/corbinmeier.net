// standard: turnstile@2026-10-30 - fails the production Pages build without a real Turnstile site key.
import { readFileSync } from 'node:fs'
const file = new URL('../src/data/turnstile.ts', import.meta.url)
const code = readFileSync(file, 'utf8').split('\n').filter((l) => !/^\s*(\/\/|\/\*|\*)/.test(l)).join('\n')
if (!/['"]0x[0-9A-Za-z_-]{10,}['"]/.test(code)) {
  console.error('Site key not provided with Turnstile')
  if (process.env.CF_PAGES === '1' && process.env.CF_PAGES_BRANCH === 'main') process.exit(1)
}
