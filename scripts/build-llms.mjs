// standard: llms-txt@2026-10-14 - /llms.txt and a Markdown version of every indexable page, built from the prerendered HTML.
// Usage:   node scripts/build-llms.mjs   (runs inside `npm run build`, after scripts/finish-build.sh;
//          runs from any cwd, finds the project root from its own location: <root>/scripts/)
// Does:    1. For each indexable page in build/client (canonical present, no noindex; the sitemap's set) writes
//             <route>.md (home: index.md): the <main> content converted to Markdown, no added or reworded text.
//          2. Writes llms.txt: H1 = the site name (the home page's brand), blockquote = the home meta description,
//             H2 "Pages" and "Optional" link lists; each link's text is the page title and each note the page's
//             own meta description.
//          3. Appends a per-page `Link: <...md>; rel="alternate"; type="text/markdown"` block to build/client/_headers.
//          4. Validates llms.txt (see validateLlmsTxt) and fails the build on any violation.
// Success: prints "LLMS PASS (<n> pages)". Failure: "LLMS FAIL: <why>" and exit 1.
import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'svg', 'canvas', 'img', 'template', 'hr'])
const BLOCK_TAGS = new Set([
  'address', 'article', 'aside', 'blockquote', 'button', 'details', 'dd', 'div', 'dl', 'dt', 'fieldset',
  'figcaption', 'figure', 'footer', 'form', 'header', 'main', 'nav', 'p', 'section', 'summary',
])
const BREAK = '\u0001'
const OPTIONAL_ROUTES = new Set(['/privacy-policy', '/terms-of-service'])

const collapse = (text) => text.replace(/\s+/g, ' ').trim()
/** Text of a node with a space between every text node, so adjacent blocks do not run together. */
const spacedText = (node) => {
  const parts = []
  const visit = (n) => {
    if (n.nodeType === 3) parts.push(n.textContent)
    else if (n.nodeType === 1 && !SKIP_TAGS.has(n.tagName.toLowerCase())) n.childNodes.forEach(visit)
  }
  visit(node)
  return collapse(parts.join(' '))
}
const absolute = (href, origin) => new URL(href, origin + '/').href

/** Converts the <main> element of a prerendered page to Markdown; text is copied, never rewritten. */
export function htmlToMarkdown(html, origin) {
  const document = new JSDOM(html).window.document
  const root = document.querySelector('main') ?? document.body
  const lines = [] // { text, tight }
  let buf = ''
  let itemPrefix = null
  const lists = []

  const flush = () => {
    const text = collapse(buf).replaceAll(BREAK, '  \n')
    buf = ''
    if (!text) return
    if (itemPrefix !== null) {
      lines.push({ text: itemPrefix + text, tight: true })
      itemPrefix = null
    } else {
      lines.push({ text, tight: false })
    }
  }
  const inline = (node, wrap) => {
    const inner = collapse(node.textContent ?? '')
    if (inner) buf += `${wrap}${inner}${wrap}`
  }

  const walk = (node) => {
    if (node.nodeType === 3) {
      buf += node.textContent
      return
    }
    if (node.nodeType !== 1) return
    const tag = node.tagName.toLowerCase()
    if (SKIP_TAGS.has(tag) || node.getAttribute('aria-hidden') === 'true' || node.classList.contains('hidden')) return
    if (/^h[1-6]$/.test(tag)) {
      flush()
      const text = collapse(node.textContent ?? '')
      if (text) lines.push({ text: `${'#'.repeat(Number(tag[1]))} ${text}`, tight: false })
      return
    }
    if (tag === 'a') {
      const text = collapse(node.textContent ?? '')
      const href = node.getAttribute('href')
      if (text) buf += href ? `[${text}](${absolute(href, origin)})` : text
      return
    }
    if (tag === 'strong' || tag === 'b') return inline(node, '**')
    if (tag === 'em' || tag === 'i') return inline(node, '*')
    if (tag === 'code') return inline(node, '`')
    if (tag === 'br') {
      buf += BREAK
      return
    }
    if (tag === 'pre') {
      flush()
      lines.push({ text: '```\n' + (node.textContent ?? '').replace(/\n+$/, '') + '\n```', tight: false })
      return
    }
    if (tag === 'table') {
      flush()
      const rows = [...node.querySelectorAll('tr')].map((tr) =>
        [...tr.children].map((cell) => spacedText(cell).replaceAll('|', '\\|')),
      )
      if (rows.length === 0) return
      const width = Math.max(...rows.map((row) => row.length))
      const pad = (row) => `| ${[...row, ...Array(width - row.length).fill('')].join(' | ')} |`
      const separator = `| ${Array(width).fill('---').join(' | ')} |`
      lines.push({ text: [pad(rows[0]), separator, ...rows.slice(1).map(pad)].join('\n'), tight: false })
      return
    }
    if (tag === 'ul' || tag === 'ol') {
      flush()
      lists.push({ ordered: tag === 'ol', count: 0 })
      for (const child of node.childNodes) walk(child)
      flush()
      lists.pop()
      return
    }
    if (tag === 'li') {
      flush()
      const list = lists.at(-1)
      const marker = list?.ordered ? `${++list.count}. ` : '- '
      itemPrefix = '  '.repeat(Math.max(0, lists.length - 1)) + marker
      for (const child of node.childNodes) walk(child)
      flush()
      itemPrefix = null
      return
    }
    const block = BLOCK_TAGS.has(tag)
    if (block) flush()
    for (const child of node.childNodes) walk(child)
    if (block) flush()
  }

  walk(root)
  flush()
  let out = ''
  lines.forEach((line, i) => {
    out += i === 0 ? line.text : (line.tight && lines[i - 1].tight ? '\n' : '\n\n') + line.text
  })
  return out + '\n'
}

/** Reads the fields llms.txt needs from a prerendered page. */
export function readPage(html) {
  const document = new JSDOM(html).window.document
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? ''
  const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? ''
  return {
    canonical,
    noindex: /noindex/i.test(robots),
    title: collapse(document.querySelector('title')?.textContent ?? ''),
    description: collapse(document.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''),
  }
}

/** Path of a page's Markdown version: /about -> /about.md, / -> /index.md. */
export function markdownPath(route) {
  return route === '/' ? '/index.md' : `${route}.md`
}

/** Builds llms.txt from the site name, its summary and the indexable pages ({ route, title, description }). */
export function buildLlmsTxt({ siteName, summary, origin, pages }) {
  const item = (page) => `- [${page.title}](${origin}${markdownPath(page.route)}): ${page.description}`
  const section = (name, list) => (list.length ? `## ${name}\n\n${list.map(item).join('\n')}\n` : '')
  const main = pages.filter((page) => !OPTIONAL_ROUTES.has(page.route))
  const optional = pages.filter((page) => OPTIONAL_ROUTES.has(page.route))
  const parts = [`# ${siteName}\n`, `> ${summary}\n`, section('Pages', main), section('Optional', optional)]
  return parts.filter(Boolean).join('\n')
}

/** Returns the list of violations of the llms-txt requirement; empty means valid. */
export function validateLlmsTxt(text, linkExists) {
  const problems = []
  const lines = (text.startsWith('\uFEFF') ? text.slice(1) : text).split('\n')
  const headings = lines.filter((line) => /^#{1,6}\s/.test(line))
  const h1 = headings.filter((line) => /^#\s/.test(line))
  if (h1.length === 0) problems.push('llms.txt has no H1')
  if (h1.length > 1) problems.push('llms.txt has more than one H1')
  if (lines.find((line) => /^\S/.test(line)) !== h1[0]) problems.push('llms.txt does not start with the H1')
  for (const heading of headings) {
    if (/^#{3,6}\s/.test(heading)) problems.push(`llms.txt has a heading other than H1/H2: ${heading}`)
  }
  for (const [, url] of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    if (!linkExists(url)) problems.push(`llms.txt links to a URL that would not return 200: ${url}`)
  }
  return problems
}

/** Per-page Link header blocks for build/client/_headers. */
export function linkHeaderBlocks(origin, routes) {
  return routes
    .map((route) => `${route}\n  Link: <${origin}${markdownPath(route)}>; rel="alternate"; type="text/markdown"\n`)
    .join('\n')
}

function listPages(out) {
  const files = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'assets') continue
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (entry.name.endsWith('.html')) files.push(path)
    }
  }
  walk(out)
  return files.sort()
}

export function run(out) {
  const pages = []
  for (const file of listPages(out)) {
    const html = readFileSync(file, 'utf8')
    const page = readPage(html)
    if (page.noindex || !page.canonical) continue
    const origin = new URL(page.canonical).origin
    const route = new URL(page.canonical).pathname.replace(/\/$/, '') || '/'
    if (!page.title || !page.description) throw new Error(`${relative(out, file)} has no title or description`)
    pages.push({ route, origin, title: page.title, description: page.description, html })
  }
  if (pages.length === 0) throw new Error('no indexable pages in ' + out)
  pages.sort((a, b) => a.route.localeCompare(b.route))
  const home = pages.find((page) => page.route === '/')
  if (!home) throw new Error('no indexable home page')
  const origin = home.origin

  for (const page of pages) {
    writeFileSync(join(out, markdownPath(page.route)), htmlToMarkdown(page.html, origin), 'utf8')
  }
  const brand = readFileSync(new URL('../src/data/site.ts', import.meta.url), 'utf8').match(/brandName:\s*"([^"]+)"/)
  if (!brand) throw new Error('brandName not found in src/data/site.ts')
  const text = buildLlmsTxt({ siteName: brand[1], summary: home.description, origin, pages })
  writeFileSync(join(out, 'llms.txt'), text, 'utf8')
  appendFileSync(
    join(out, '_headers'),
    '\n' + linkHeaderBlocks(origin, pages.map((page) => page.route === '/' ? '/' : page.route)),
  )

  const problems = validateLlmsTxt(text, (url) => url.startsWith(origin + '/') && existsSync(join(out, url.slice(origin.length))))
  if (problems.length) throw new Error(problems.join('; '))
  return pages.length
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const out = fileURLToPath(new URL('../build/client', import.meta.url))
    console.log(`LLMS PASS (${run(out)} pages)`)
  } catch (error) {
    console.error('LLMS FAIL: ' + (error instanceof Error ? error.message : String(error)))
    process.exit(1)
  }
}
