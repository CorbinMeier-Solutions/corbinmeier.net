import { describe, expect, it } from 'vitest'
import {
  normalizeUrl,
  sitemapLocs,
  unlinkedFindings,
} from './verify-build.mjs'

const ORIGIN = 'https://example.test'

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
