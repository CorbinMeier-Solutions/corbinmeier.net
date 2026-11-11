import { describe, expect, it } from 'vitest'
import {
  canonicalFindings,
  normalizeUrl,
  readPageFacts,
  sitemapLocs,
  unlinkedFindings,
  verificationFindings,
} from './verify-build.mjs'

const ORIGIN = 'https://example.test'
const line = 'google-site-verification: googlef16b5b81923cc5d2.html'

describe('verificationFindings', () => {
  it('accepts the exact line with or without one trailing newline', () => {
    expect(verificationFindings(line)).toEqual([])
    expect(verificationFindings(line + '\n')).toEqual([])
  })
  it('flags a missing file and altered content', () => {
    expect(verificationFindings(null)[0]).toContain('missing')
    expect(verificationFindings(line + '\n\n')).toHaveLength(1)
    expect(verificationFindings('<html></html>')).toHaveLength(1)
  })
})

describe('readPageFacts + canonicalFindings', () => {
  const page = (head: string, body = '') => readPageFacts(`<html><head>${head}</head><body>${body}</body></html>`)
  const canon = '<link rel="canonical" href="https://example.test/a">'

  it('passes one canonical on indexable and none on noindex pages', () => {
    const pages = [
      { file: 'a.html', ...page(canon) },
      { file: 'contact.html', ...page('<meta name="robots" content="noindex"/>') },
    ]
    expect(canonicalFindings(pages)).toEqual([])
  })
  it('fails zero or two canonicals on an indexable page', () => {
    expect(canonicalFindings([{ file: 'a.html', ...page('') }])[0]).toContain('found 0')
    expect(canonicalFindings([{ file: 'a.html', ...page(canon + canon) }])[0]).toContain('found 2')
  })
  it('fails a canonical on a noindex page', () => {
    expect(canonicalFindings([{ file: 'c.html', ...page('<meta name="robots" content="noindex,follow">' + canon) }])).toHaveLength(1)
  })
})

describe('sitemap link assertion', () => {
  const xml = '<urlset><url><loc>https://example.test</loc></url><url><loc>https://example.test/pricing</loc></url></urlset>'
  const locs = sitemapLocs(xml)
  const home = { file: 'index.html', canonicals: [ORIGIN], ...{ hrefs: ['/pricing', '/contact'] } }
  const about = { file: 'about.html', canonicals: [ORIGIN + '/about'], hrefs: ['/', '/pricing/'] }

  it('reads locs and normalizes URLs', () => {
    expect(locs).toEqual([ORIGIN, ORIGIN + '/pricing'])
    expect(normalizeUrl('/pricing/?a=1#x', ORIGIN)).toBe(ORIGIN + '/pricing')
    expect(normalizeUrl('/', ORIGIN)).toBe(ORIGIN)
    expect(normalizeUrl('mailto:a@b.test', ORIGIN)).toBeNull()
  })
  it('passes when another page links every URL', () => {
    expect(unlinkedFindings(locs, [home, about], ORIGIN)).toEqual([])
  })
  it('ignores a page linking itself and flags an orphan', () => {
    const selfOnly = { file: 'pricing.html', canonicals: [ORIGIN + '/pricing'], hrefs: ['/pricing'] }
    const findings = unlinkedFindings(locs, [{ ...home, hrefs: [] }, selfOnly], ORIGIN)
    expect(findings).toHaveLength(2)
  })
})
