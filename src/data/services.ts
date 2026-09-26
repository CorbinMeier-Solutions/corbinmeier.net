import type { ServicesSectionContent } from "./types";

export const servicesSection: ServicesSectionContent = {
  headingPre: "A Tiered Strategy for",
  headingAccent: "Success.",
  intro:
    "Stop fighting complex tools alone. I serve as your dedicated digital contractor, handling the engineering so you can focus on your business. My mission is simple: to support my family by ensuring your business succeeds.",
  items: [
    {
      id: "websites",
      title: "The Foundation",
      desc: "Custom high-performance websites. Simple static sites cost nothing to host (only domain cost). Database additions scale to what you actually use.",
      icon: "Globe",
    },
    {
      id: "ai-setup",
      title: "Private AI Deployment",
      desc: "Professional deployment of private, uncensored AI (Hermes) on your own cloud infrastructure. Total data sovereignty without per-user markups.",
      icon: "Brain",
      link: "/workshop",
    },
    {
      id: "apps",
      title: "Growth Tier",
      desc: "Bespoke booking systems, client portals, and custom lead-capture flows designed to automate your specific business operations.",
      icon: "Code2",
    },
    {
      id: "growth",
      title: "Automation Tier",
      desc: "Connect your digital presence to your real-world operations with custom API integrations, POS sync, and reporting dashboards.",
      icon: "TrendingUp",
    },
    {
      id: "seo",
      title: "Search Authority",
      desc: "Data-driven SEO auditing and keyword strategy. Leveraging high-performance architecture for superior crawlability and local search dominance.",
      icon: "Search",
    },
    {
      id: "automations",
      title: "Email & Lead Flow",
      desc: "Robust, reliable communication channels with custom automation. Turn anonymous visitors into loyal clients automatically.",
      icon: "Mail",
    },
    {
      id: "payments",
      title: "Global Commerce",
      desc: "Scale without limits. Secure, custom-integrated payment processing and subscription billing tailored to your workflow.",
      icon: "CreditCard",
    },
    {
      id: "performance",
      title: "Digital Infrastructure",
      desc: "Deep tech-stack advisory and consulting. Environment provisioning and troubleshooting for systems that cannot afford to fail.",
      icon: "Zap",
    },
  ],
};
