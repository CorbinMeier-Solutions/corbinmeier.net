---
description: "Sourcing standard for public factual claims and FAQ markup rules"
paths:
  - "src/data/**"
  - "src/pages/**/*.tsx"
  - "src/components/Faq*.tsx"
---
# Sourcing Standard (public factual claims)

Any factual claim published on this site carries a citation link that has been
**fetched and confirmed** to resolve and to actually contain the claim. Never
cite from memory or from a search-result snippet: fetch the page, read it, and
quote what it really says. A stat that "everyone knows" is exactly the kind that
turns out to be misattributed.

Source tiers, most to least preferred:

1. **Official platform documentation** - unrestricted, any year.
   `developers.google.com`, `support.google.com`, `google.com/search/howsearchworks`,
   `web.dev`, `bing.com/webmasters`. Prefer current maintained docs over an old
   blog post announcing the same thing; cite the announcement alongside only when
   the date itself is part of the claim.
2. **First-party research** - the company that *measured* the data, publishing its
   own numbers. Counts as official regardless of year, on two conditions: cite the
   organization that collected the data (never a blog relaying it), and state the
   methodology and sample size in the answer text so the reader can weigh it.
   Currently: StatCounter, Contentsquare, Ahrefs.
3. **Secondary blogs must predate 2023.** A blog repeating someone else's figure is
   where AI-generated misinformation concentrates. If a secondary source is the only
   thing carrying a number, trace it to the primary and cite that instead - or drop
   the claim.

Watch for numbers that mutate in transit: cite what the primary source actually
says, not a vendor's downstream paraphrase.

`npm run check:sources` verifies every link in `src/data/faqs.json` resolves and
flags any host outside tiers 1 and 2. Run it after editing FAQ data, and
periodically - citations rot.

Never promise email delivery, inbox placement, uptime or rankings in site copy;
describe the work instead.

# FAQ Content (`src/data/faqs.json`)

Answers are HTML strings injected with `dangerouslySetInnerHTML`. Keep markup to
`<p>`, `<strong>`, `<em>`, `<ul>`/`<li>`.

Those tags never pass through Tailwind, and this project does **not** install
`@tailwindcss/typography`, so `prose` classes would silently emit nothing.
Styling for that subtree lives in the `.faq-answer` class in `src/globals.css`.
`space-y-*` emits malformed CSS when `@apply`d inside a nested selector; use
`li + li` for list spacing.

`src/components/FaqJsonLd.tsx` derives FAQPage structured data from these entries
automatically, stripping tags for the plain-text `acceptedAnswer`.
