export const VERIFICATION_FILES: string[]
export interface PageFacts {
  canonicals: string[]
  noindex: boolean
  hrefs: string[]
}
export function readPageFacts(html: string): PageFacts
export function sitemapLocs(xml: string): string[]
export function sitemapLastmods(xml: string): string[]
export function lastmodFindings(values: string[], today: string): string[]
export function normalizeUrl(href: string, origin: string): string | null
export function verificationFindings(content: string | null, file: string): string[]
export function canonicalFindings(pages: { file: string; canonicals: string[]; noindex: boolean }[]): string[]
export function unlinkedFindings(locs: string[], pages: { file: string; canonicals: string[]; hrefs: string[] }[], origin: string): string[]
export function run(out: string, today?: string): { pages: number; findings: string[] }
