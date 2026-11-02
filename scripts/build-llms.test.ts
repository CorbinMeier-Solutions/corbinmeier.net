import { describe, expect, it } from 'vitest'
import {
  buildLlmsTxt,
  htmlToMarkdown,
  linkHeaderBlocks,
  markdownPath,
  readPage,
  validateLlmsTxt,
} from './build-llms.mjs'

const ORIGIN = 'https://example.test'
const always = () => true

describe('htmlToMarkdown', () => {
  it('converts main content and drops chrome, scripts and icons', () => {
    const md = htmlToMarkdown(
      `<body><header>menu</header><main><h1>Title</h1><p>One <strong>bold</strong> and <a href="/faq">FAQ</a>.</p>
       <svg><path/></svg><script>x()</script><ul><li>a</li><li>b<ul><li>c</li></ul></li></ul></main><footer>foot</footer></body>`,
      ORIGIN,
    )
    expect(md).toBe(
      '# Title\n\nOne **bold** and [FAQ](https://example.test/faq).\n\n- a\n- b\n  - c\n',
    )
  })

  it('renders tables with spaced cells and skips display:none content', () => {
    const md = htmlToMarkdown(
      `<main><table><tr><th>Plan</th><th>Price</th></tr><tr><td><div>Starter</div><div>quick</div></td><td>$1</td></tr></table>
       <div class="hidden">secret</div></main>`,
      ORIGIN,
    )
    expect(md).toBe('| Plan | Price |\n| --- | --- |\n| Starter quick | $1 |\n')
  })
})

describe('readPage', () => {
  it('reads canonical, noindex, title and description', () => {
    const page = readPage(
      '<head><title>About | X</title><meta name="description" content="Desc"><link rel="canonical" href="https://example.test/about"></head>',
    )
    expect(page).toEqual({ canonical: 'https://example.test/about', noindex: false, title: 'About | X', description: 'Desc' })
    expect(readPage('<head><meta name="robots" content="noindex"></head>').noindex).toBe(true)
  })
})

describe('buildLlmsTxt', () => {
  const pages = [
    { route: '/', title: 'Home', description: 'Home desc' },
    { route: '/privacy-policy', title: 'Privacy', description: 'Privacy desc' },
  ]
  const text = buildLlmsTxt({ siteName: 'Site', summary: 'Sum', origin: ORIGIN, pages })

  it('has one H1, a summary, H2 lists and an Optional section linking .md files', () => {
    expect(text).toBe(
      '# Site\n\n> Sum\n\n## Pages\n\n- [Home](https://example.test/index.md): Home desc\n\n## Optional\n\n- [Privacy](https://example.test/privacy-policy.md): Privacy desc\n',
    )
    expect(validateLlmsTxt(text, always)).toEqual([])
  })

  it('maps routes to Markdown paths and Link header blocks', () => {
    expect(markdownPath('/')).toBe('/index.md')
    expect(markdownPath('/about')).toBe('/about.md')
    expect(linkHeaderBlocks(ORIGIN, ['/about'])).toBe(
      '/about\n  Link: <https://example.test/about.md>; rel="alternate"; type="text/markdown"\n',
    )
  })
})

describe('validateLlmsTxt', () => {
  it('fails with no H1', () => {
    expect(validateLlmsTxt('> only a summary\n', always)).toContain('llms.txt has no H1')
  })
  it('fails with a second H1 or an H3', () => {
    expect(validateLlmsTxt('# A\n\n# B\n', always).join()).toMatch(/more than one H1/)
    expect(validateLlmsTxt('# A\n\n### C\n', always).join()).toMatch(/other than H1\/H2/)
  })
  it('fails when a link would not return 200', () => {
    const text = '# A\n\n## Pages\n\n- [x](https://example.test/gone.md): d\n'
    expect(validateLlmsTxt(text, () => false).join()).toMatch(/gone\.md/)
  })
})
