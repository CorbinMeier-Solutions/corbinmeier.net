export const VERIFICATION_FILE: string
export interface PageFacts {
  canonicals: string[]
  noindex: boolean
  hrefs: string[]
}
export function readPageFacts(html: string): PageFacts
export function sitemapLocs(xml: string): string[]
export function normalizeUrl(href: string, origin: string): string | null
export function verificationFindings(content: string | null): string[]
export function canonicalFindings(pages: { file: string; canonicals: string[]; noindex: boolean }[]): string[]
export function unlinkedFindings(locs: string[], pages: { file: string; canonicals: string[]; hrefs: string[] }[], origin: string): string[]
export function run(out: string): { pages: number; findings: string[] }
