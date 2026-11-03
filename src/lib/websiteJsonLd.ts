import { SITE_URL } from "@/config/site";
import { site } from "@/data/site";

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.brandName,
    url: SITE_URL,
  };
}
