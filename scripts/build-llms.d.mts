export interface LlmsPage {
  route: string
  title: string
  description: string
}
export function htmlToMarkdown(html: string, origin: string): string
export function readPage(html: string): { canonical: string; noindex: boolean; title: string; description: string }
export function markdownPath(route: string): string
export function buildLlmsTxt(input: { siteName: string; summary: string; origin: string; pages: LlmsPage[] }): string
export function validateLlmsTxt(text: string, linkExists: (url: string) => boolean): string[]
export function linkHeaderBlocks(origin: string, routes: string[]): string
export function run(out: string): number
