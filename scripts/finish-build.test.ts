import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const SCRIPT = join(__dirname, 'finish-build.sh')
const ORIGIN = 'https://example.test'
const page = (canonical: string) => `<html><head><link rel="canonical" href="${canonical}"></head><body></body></html>`
const IDENTITY = ['-c', 'user.name=t', '-c', 'user.email=t@example.test']

let dirs: string[] = []
afterEach(() => {
  for (const d of dirs) rmSync(d, { recursive: true, force: true })
  dirs = []
})

const git = (cwd: string, ...args: string[]) => execFileSync('git', ['-C', cwd, ...IDENTITY, ...args], { encoding: 'utf8' })

function write(root: string, rel: string, content: string) {
  mkdirSync(dirname(join(root, rel)), { recursive: true })
  writeFileSync(join(root, rel), content)
}

/** Commits one file with the given author date; the committer date is always later, to prove it is ignored. */
function commit(root: string, rel: string, content: string, date: string) {
  write(root, rel, content)
  git(root, 'add', '-A')
  execFileSync('git', ['-C', root, ...IDENTITY, 'commit', '-q', '-m', rel, '--date', date], {
    env: { ...process.env, GIT_COMMITTER_DATE: '2026-12-31T12:00:00Z' },
  })
}

function install(root: string) {
  mkdirSync(join(root, 'scripts'), { recursive: true })
  copyFileSync(SCRIPT, join(root, 'scripts', 'finish-build.sh'))
  write(root, 'build/client/index.html', page(ORIGIN))
  write(root, 'build/client/about.html', page(ORIGIN + '/about'))
  write(root, 'build/client/404.html', '<html><head><meta name="robots" content="noindex"></head></html>')
}

/** A fixture project: Home imports a component that imports data; About imports its own data. */
function project(routes = "index('pages/Home.tsx'),\n  route('about', 'pages/About.tsx'),") {
  const root = mkdtempSync(join(tmpdir(), 'finish-build-'))
  dirs.push(root)
  git(root, 'init', '-q')
  install(root)
  write(root, 'src/routes.ts', `export default [\n  ${routes}\n]`)
  commit(root, 'src/pages/Home.tsx', 'import Hero from "@/components/Hero";', '2026-11-03T10:00:00Z')
  commit(root, 'src/pages/About.tsx', 'import { about } from "../data/about";', '2026-11-04T10:00:00Z')
  commit(root, 'src/components/Hero.tsx', 'import { hero } from "@/data/hero";', '2026-11-05T10:00:00Z')
  commit(root, 'src/data/hero.ts', 'export const hero = 1', '2026-11-08T10:00:00Z')
  commit(root, 'src/data/about.ts', 'export const about = 1', '2026-11-06T10:00:00Z')
  return root
}

const finish = (root: string) =>
  execFileSync('bash', [join(root, 'scripts', 'finish-build.sh')], { encoding: 'utf8', env: { ...process.env, CF_PAGES: '' } })
const sitemap = (root: string) => readFileSync(join(root, 'build/client/sitemap.xml'), 'utf8')

describe('finish-build.sh sitemap lastmod', () => {
  it('dates a route by the newest author date over its transitive components and data', () => {
    const root = project()
    const out = finish(root)
    expect(out).toContain('FINISH PASS')
    expect(out).not.toContain('FINISH NOTE')
    expect(sitemap(root)).toContain(`<url><loc>${ORIGIN}</loc><lastmod>2026-11-08</lastmod></url>`)
    expect(sitemap(root)).toContain(`<url><loc>${ORIGIN}/about</loc><lastmod>2026-11-06</lastmod></url>`)
  })

  it('uses the author date, not the later committer date', () => {
    const root = project()
    finish(root)
    expect(sitemap(root)).not.toContain('2026-12-31')
  })

  it('prints a note, with no build-date fallback, for a page it cannot resolve', () => {
    const root = project("index('pages/Home.tsx'),")
    const out = finish(root)
    expect(out).toContain(`FINISH NOTE: no lastmod for ${ORIGIN}/about: no route /about in src/routes.ts`)
    expect(sitemap(root)).toContain(`<url><loc>${ORIGIN}/about</loc></url>`)
  })

  it('prints one note when routes.ts is missing', () => {
    const root = project()
    rmSync(join(root, 'src/routes.ts'))
    const out = finish(root)
    expect(out.match(/FINISH NOTE/g)).toHaveLength(1)
    expect(sitemap(root)).not.toContain('lastmod')
  })

  it('omits every lastmod with one note on a shallow clone outside Pages', () => {
    const source = project()
    const holder = mkdtempSync(join(tmpdir(), 'finish-build-clone-'))
    dirs.push(holder)
    const shallow = join(holder, 'r')
    execFileSync('git', ['clone', '-q', '--depth', '1', 'file://' + source, shallow])
    install(shallow)
    const out = finish(shallow)
    expect(out).toContain('FINISH NOTE: sitemap <lastmod> omitted for every URL: shallow git history')
    expect(sitemap(shallow)).not.toContain('lastmod')
  })
})
