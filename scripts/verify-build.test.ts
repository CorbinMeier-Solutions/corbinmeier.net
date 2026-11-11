import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  canonicalFindings,
  lastmodFindings,
  run,
  sitemapLastmods,
  normalizeUrl,
  readPageFacts,
  sitemapLocs,
  unlinkedFindings,
  verificationFindings,
} from './verify-build.mjs'

const ORIGIN = 'https://example.test'
const file = 'googlef16b5b81923cc5d2.html'
const fleetFile = 'googlef927db9e19f8bd64.html'
const line = `google-site-verification: ${file}`
const fleetLine = `google-site-verification: ${fleetFile}`

describe('verificationFindings', () => {
  it('accepts the exact line with or without one trailing newline', () => {
    expect(verificationFindings(line, file)).toEqual([])
    expect(verificationFindings(line + '\n', file)).toEqual([])
  })
  it('names the file it checked, and rejects the other file\'s line', () => {
    expect(verificationFindings(fleetLine, fleetFile)).toEqual([])
    expect(verificationFindings(null, fleetFile)[0]).toContain(fleetFile)
    expect(verificationFindings(line, fleetFile)[0]).toContain(fleetFile)
  })
  it('flags a missing file and altered content', () => {
    expect(verificationFindings(null, file)[0]).toContain('missing')
    expect(verificationFindings(line + '\n\n', file)).toHaveLength(1)
    expect(verificationFindings('<html></html>', file)).toHaveLength(1)
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

describe('lastmodFindings', () => {
  it('accepts real dates up to today and reads them from the xml', () => {
    const xml = '<url><loc>a</loc><lastmod>2026-11-03</lastmod></url><url><loc>b</loc><lastmod> 2026-11-10 </lastmod></url>'
    expect(sitemapLastmods(xml)).toEqual(['2026-11-03', '2026-11-10'])
    expect(lastmodFindings(sitemapLastmods(xml), '2026-11-10')).toEqual([])
  })
  it('flags malformed, impossible and future dates', () => {
    const findings = lastmodFindings(['2026-11-3', '2026-02-30', '2026-11-11', ''], '2026-11-10')
    expect(findings).toHaveLength(4)
    expect(findings[2]).toContain('later than today')
  })
})

describe('run over a fixture build', () => {
  let dir = ''
  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  const html = (canonical: string, links: string[] = []) =>
    `<html><head><link rel="canonical" href="${canonical}"></head><body>${links.map((l) => `<a href="${l}">x</a>`).join('')}</body></html>`

  function fixture(sitemap: string | null, extra: Record<string, string> = {}) {
    dir = mkdtempSync(join(tmpdir(), 'verify-build-'))
    mkdirSync(join(dir, 'assets'))
    mkdirSync(join(dir, '.hidden'))
    const files: Record<string, string> = {
      'index.html': html(ORIGIN, ['/pricing']),
      'pricing.html': html(ORIGIN + '/pricing', ['/']),
      [file]: line,
      [fleetFile]: fleetLine,
      'google1234abcd.html': '<html></html>',
      '__spa-fallback.html': '<html></html>',
      'assets/skipped.html': '<html></html>',
      '.hidden/skipped.html': '<html></html>',
      ...extra,
    }
    if (sitemap !== null) files['sitemap.xml'] = sitemap
    for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content)
  }
  const urlset = (lastmod = '') =>
    `<urlset><url><loc>${ORIGIN}</loc>${lastmod}</url><url><loc>${ORIGIN}/pricing</loc>${lastmod}</url></urlset>`

  it('passes a clean build and counts only real pages', () => {
    fixture(urlset('<lastmod>2026-11-03</lastmod>'))
    expect(run(dir, '2026-11-10')).toEqual({ pages: 2, findings: [] })
  })
  it('reports a missing sitemap', () => {
    fixture(null)
    expect(run(dir, '2026-11-10').findings).toEqual(['sitemap.xml is missing from the build'])
  })
  it('reports a missing fleet verification file by name', () => {
    fixture(urlset('<lastmod>2026-11-03</lastmod>'))
    rmSync(join(dir, fleetFile))
    expect(run(dir, '2026-11-10').findings).toEqual([`${fleetFile} is missing from the build`])
  })
  it('reports bad lastmod dates and a wrong verification file by name', () => {
    fixture(urlset('<lastmod>2027-01-01</lastmod>'), { [file]: 'wrong' })
    const findings = run(dir, '2026-11-10').findings
    expect(findings.some((f) => f.includes(`${file} must contain`))).toBe(true)
    expect(findings.filter((f) => f.includes('later than today'))).toHaveLength(2)
  })
})
