// standard: share-button@2026-10-30 (pure URL builders; see components/ShareButton.tsx)
import { SITE_ORIGIN } from "@/data/site";

export type SharePlatform = "facebook" | "x" | "linkedin" | "whatsapp" | "email" | "copy" | "share";

export function canonicalShareUrl(pathname: string, source: SharePlatform): string {
  const path = pathname === "/" ? "" : pathname;
  const params = new URLSearchParams({ utm_source: source, utm_medium: "social", utm_campaign: "share" });
  return `${SITE_ORIGIN}${path}?${params.toString()}`;
}

export type ShareLink = { platform: Exclude<SharePlatform, "copy" | "share">; label: string; href: string };

export function buildShareLinks(pathname: string, title: string): ShareLink[] {
  const enc = encodeURIComponent;
  const url = (p: SharePlatform) => canonicalShareUrl(pathname, p);
  return [
    { platform: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url("facebook"))}` },
    { platform: "x", label: "X", href: `https://x.com/intent/tweet?text=${enc(title)}&url=${enc(url("x"))}` },
    { platform: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url("linkedin"))}` },
    { platform: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${enc(`${title} ${url("whatsapp")}`)}` },
    { platform: "email", label: "Email", href: `mailto:?subject=${enc(title)}&body=${enc(url("email"))}` },
  ];
}

export function supportsNativeShare(nav: Pick<Navigator, "share"> | { share?: undefined }): boolean {
  return typeof nav.share === "function";
}
