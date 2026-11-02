import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readSiteUrl } from './site-url.mjs'

const MESSAGE =
  'SITE_URL is not set in wrangler.toml [vars]: set it to the production origin, e.g. https://example.com'

let dir: string
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'site-url-'))
})
afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

function toml(body: string): string {
  const file = join(dir, 'wrangler.toml')
  writeFileSync(file, body)
  return file
}

describe('readSiteUrl', () => {
  it('returns the origin from [vars]', () => {
    expect(readSiteUrl(toml('[vars]\nSITE_URL = "https://corbinmeier.net"\n'))).toBe('https://corbinmeier.net')
  })

  it('ignores a different SITE_URL under [env.preview.vars]', () => {
    const file = toml(
      '[vars]\nSITE_URL = "https://corbinmeier.net"\n[env.preview.vars]\nSITE_URL = "https://preview.example.org"\n',
    )
    expect(readSiteUrl(file)).toBe('https://corbinmeier.net')
  })

  it('throws the exact message when the key is missing', () => {
    expect(() => readSiteUrl(toml('[vars]\nMAIL_FROM = "a"\n'))).toThrow(MESSAGE)
  })

  it('does not read a SITE_URL that sits only under the preview table', () => {
    expect(() => readSiteUrl(toml('[env.preview.vars]\nSITE_URL = "https://corbinmeier.net"\n'))).toThrow(MESSAGE)
  })

  it.each([
    ['example.com', 'https://example.com'],
    ['http scheme', 'http://corbinmeier.net'],
    ['a path', 'https://corbinmeier.net/home'],
    ['a trailing slash', 'https://corbinmeier.net/'],
    ['a pages.dev host', 'https://corbinmeier-net.pages.dev'],
    ['localhost', 'https://localhost'],
    ['a placeholder', 'https://<your-domain>'],
  ])('throws the exact message for %s', (_label, value) => {
    expect(() => readSiteUrl(toml(`[vars]\nSITE_URL = "${value}"\n`))).toThrow(MESSAGE)
  })
})
