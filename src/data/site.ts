import type { SiteContent } from "./types";

export const site: SiteContent = {
  brandName: "Corbin Meier",
  navItems: [
    { name: "Projects", href: "/projects" },
    { name: "Pricing", href: "/pricing" },
    { name: "Workshop", href: "/workshop" },
    { name: "FAQ", href: "/faq" },
    { name: "About", href: "/about" },
  ],
  contactCtaLabel: "Contact",
  missionStatement: "Outperforming standard CMS platforms - solutions for every business.",
  footerTagline:
    "Providing high-performance, custom-engineered digital infrastructure for local businesses with a zero up-front hosting model.",
  footerSocial: {
    github: "https://github.com/CorbinMeier",
    linkedin: "https://www.linkedin.com/in/corbin-meier-a49484125/",
    email: "mailto:contact@corbinmeier.net",
  },
  footerNavLabel: "Navigation",
  footerLegalLabel: "Legal",
  footerLegalLinks: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
  ],
  builtWithLine: "Built with React, Vite, and Cloudflare.",
};
