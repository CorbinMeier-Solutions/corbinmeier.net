import type { WorkshopContent } from "./types";

export const workshop: WorkshopContent = {
  eyebrow: "Side Projects",
  headingPre: "The",
  headingAccent: "Workshop.",
  intro:
    "Tools and builds I make for myself and for client work - kept lean, kept sharp, and expanded here one entry at a time, in full: the problem, what got built, and the stack behind it.",
  emptyCategoryNote: "Nothing posted here yet - check back as new builds land.",
  categories: [
    {
      id: "websites",
      title: "Websites",
      entries: [],
    },
    {
      id: "software",
      title: "Software",
      entries: [
        {
          slug: "focalassist",
          name: "FocalAssist",
          tagline: "Keeps the part of a photo that matters locked in place across every screen size.",
          status: "Active",
          date: "2026-08-14",
          problem:
            "Most crop tools guess a percentage and hope it still looks right on the next breakpoint.",
          built:
            "FocalAssist works the other way around: you mark the point in a photo that actually matters - a face, a logo, a product - and it keeps that point anchored as the surrounding layout changes shape, from a wide desktop hero down to a narrow mobile card, with no gaps or awkward re-crops along the way. A live visual tuner sits on top of the real page - drag the target to where the subject should land, and the tool shows exactly what's reachable at the current zoom before you commit. When it looks right, the settings copy straight into the project, with no separate image editor and no round-tripping exported crops back into code.",
          images: [
            {
              src: "/tools/focalassist/original-head-cropped.png",
              label: "Original",
              caption: "Head chopped off, before the focal point was set.",
            },
            {
              src: "/tools/focalassist/wide-monitor.png",
              label: "Extra Wide Monitor",
              caption: "Extra wide monitor.",
            },
            {
              src: "/tools/focalassist/tablet-view.png",
              label: "Tablet",
              caption: "Tablet view.",
            },
            {
              src: "/tools/focalassist/phone-view.png",
              label: "Phone",
              caption: "Phone view.",
            },
          ],
        },
        {
          slug: "ai-infrastructure-setup",
          name: "Private AI Infrastructure Setup",
          tagline: "Direct cloud ownership of an open-weight AI model, without per-seat SaaS pricing.",
          status: "Available",
          problem:
            "Hosted AI subscriptions charge per seat and keep your data on someone else's servers, with no way to know what happens to it.",
          built:
            "A professional setup that deploys a private, uncensored AI environment - such as Hermes - directly on your own cloud infrastructure: optimized Linux VPS provisioning, deployment of the model and its web-based interaction layer, secure API access, and security hardening with automated backups. One-time setup starts at $499; the underlying VPS is billed separately by the host.",
          stack: "Hostinger VPS, an open-weight LLM (e.g. Hermes), a secured API / web interaction layer.",
        },
      ],
    },
  ],
};
