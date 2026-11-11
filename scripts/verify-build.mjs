// Usage:   node scripts/verify-build.mjs   (runs at the end of `npm run build`, after scripts/build-llms.mjs;
//          runs from any cwd, finds the project root from its own location: <root>/scripts/)
// Does:    asserts on the built output in build/client (scripts/check.sh runs tests before the build):
//          1. Search Console verification file googlef16b5b81923cc5d2.html exists with exactly its one line (dec-998).
//          2. Every indexable page (no robots noindex) has exactly one <link rel="canonical">; every noindex page
//             (/contact, 404) has none.
//          3. Every sitemap.xml URL appears as a plain <a href> (path or absolute) in at least one other built page.
//          Skips Google verification files and __spa-fallback.html.
// Success: prints "VERIFY PASS (<n> pages)". Failure: "VERIFY FAIL: <finding>" per line and exit 1.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

export const VERIFICATION_FILE = 'googlef16b5b81923cc5d2.html'
const SKIPPED = new Set(['__spa-fallback.html'])

/** Canonicals (every <link rel=canonical>), noindex flag and plain <a href> values of one page. */
export function readPageFacts(html) {
  const document = new JSDOM(html).window.document
  const canonicals = [...document.querySelectorAll('link[rel~="canonical" i]')].map((el) => (el.getAttribute('href') ?? '').trim())
  const noindex = [...document.querySelectorAll('meta[name]')].some(
    (el) => ['robots', 'googlebot'].includes(el.getAttribute('name').toLowerCase()) && /noindex/i.test(el.getAttribute('content') ?? ''),
  )
  const hrefs = [...document.querySelectorAll('a[href]')].map((el) => el.getAttribute('href'))
  return { canonicals, noindex, hrefs }
}

/** The <loc> values of a sitemap.xml. */
export function sitemapLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1])
}

/** Absolute URL without query, hash or trailing slash; null for non-http links. */
export function normalizeUrl(href, origin) {
  let url
  try {
    url = new URL(href, origin + '/')
  } catch {
    return null
  }
  if (!/^https?:$/.test(url.protocol)) return null
  const path = url.pathname.replace(/\/+$/, '')
  return url.origin + path
}

/** Findings for the Search Console verification file's content (null = file missing). */
export function verificationFindings(content) {
  if (content === null) return [`${VERIFICATION_FILE} is missing from the build`]
  const expected = `google-site-verification: ${VERIFICATION_FILE}`
  return content === expected || content === expected + '\n' ? [] : [`${VERIFICATION_FILE} must contain exactly "${expected}"`]
}

/** Findings for canonical counts: one on an indexable page, none on a noindex page. pages: [{ file, canonicals, noindex }]. */
export function canonicalFindings(pages) {
  return pages.flatMap(({ file, canonicals, noindex }) => {
    if (noindex) return canonicals.length ? [`${file} is noindex but has ${canonicals.length} canonical link(s)`] : []
    return canonicals.length === 1 ? [] : [`${file} is indexable and must have exactly one canonical, found ${canonicals.length}`]
  })
}

/** Findings for sitemap URLs that no other page links with a plain <a href>. pages: [{ file, canonicals, hrefs }]. */
export function unlinkedFindings(locs, pages, origin) {
  return locs.flatMap((loc) => {
    const target = normalizeUrl(loc, origin)
    const linked = pages.some(
      (page) => !page.canonicals.some((c) => normalizeUrl(c, origin) === target) && page.hrefs.some((h) => normalizeUrl(h, origin) === target),
    )
    return linked ? [] : [`sitemap URL ${loc} is not linked by a plain <a href> from any other page`]
  })
}

function listPages(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return entry.name === 'assets' || entry.name.startsWith('.') ? [] : listPages(path)
    return entry.name.endsWith('.html') && !SKIPPED.has(entry.name) && entry.name !== VERIFICATION_FILE && !/^google[0-9a-f]+\.html$/.test(entry.name) ? [path] : []
  })
}

/** Runs every assertion over a build directory; returns { pages, findings }. */
export function run(out) {
  const files = listPages(out)
  const pages = files.map((path) => ({ file: relative(out, path), ...readPageFacts(readFileSync(path, 'utf8')) }))
  const verificationPath = join(out, VERIFICATION_FILE)
  const findings = [
    ...verificationFindings(existsSync(verificationPath) ? readFileSync(verificationPath, 'utf8') : null),
    ...canonicalFindings(pages),
  ]
  const sitemapPath = join(out, 'sitemap.xml')
  if (!existsSync(sitemapPath)) findings.push('sitemap.xml is missing from the build')
  else {
    const home = pages.find((page) => page.file === 'index.html')
    const origin = home && home.canonicals[0] ? new URL(home.canonicals[0]).origin : null
    if (!origin) findings.push('index.html has no canonical to take the origin from')
    else findings.push(...unlinkedFindings(sitemapLocs(readFileSync(sitemapPath, 'utf8')), pages, origin))
  }
  return { pages: pages.length, findings }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { pages, findings } = run(fileURLToPath(new URL('../build/client', import.meta.url)))
  if (findings.length) {
    for (const finding of findings) console.error('VERIFY FAIL: ' + finding)
    process.exit(1)
  }
  console.log(`VERIFY PASS (${pages} pages)`)
}
