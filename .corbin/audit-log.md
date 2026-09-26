# Audit Log

## [2026-07-21] seo audit - run 1
### Fixed this run
- Broken favicon reference: `index.html` pointed `<link rel="icon">` to `/favicon.ico` (which didn't exist) with the wrong MIME type (`image/svg+xml`). Generated a real multi-size `favicon.ico` from `public/corbin.jpg` and corrected the type to `image/x-icon`. (`index.html`, new `public/favicon.ico`)
- Added `<link rel="canonical" href="https://corbinmeier.net/">` (`index.html`)
- Added Open Graph tags (`og:type`, `og:title`, `og:description`, `og:url`, `og:image`) and Twitter card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`), derived from the existing title/description and using `corbin.jpg` as the share image (`index.html`)
- Created `public/robots.txt` (allow all, points to sitemap)
- Created `public/sitemap.xml` covering all 4 routes (`/`, `/about`, `/portfolio`, `/contact`) with `lastmod`
- Added `loading="lazy"` to three below-the-fold `<img>` tags that were missing it: `src/components/AssociateCard.tsx`, and two images in `src/components/EducationStrip.tsx` (school logo + diploma preview). `ProjectCard.tsx` images already had it.
- Verified `npm run build` succeeds after all changes (vite build, no errors).

### Next Up (prioritized)
- [ ] Per-page `<title>`/`<meta description>` - site is a 4-route SPA (`/`, `/about`, `/portfolio`, `/contact`) with no `react-helmet-async` (or similar) wired up, so every route serves the same static title/description from `index.html`. This is a duplicate-metadata issue for Google. Needs `react-helmet-async` (or React 19 native `<title>`/`<meta>` in JSX) added and one unique title/description written per page. Medium effort (new dependency + 4 pages touched).
- [ ] `LocalBusiness` / `Person` JSON-LD structured data - no schema markup exists anywhere. Needs confirmed business details (name, address if any, phone, hours) before it can be added safely - currently only email/phone form fields exist in `Contact.tsx`, no visible NAP block to source from.
- [ ] Explicit `width`/`height` (or aspect-ratio wrappers) on `<img>` tags to fully harden against CLS - spot-checked and most images sit inside sized wrapper `div`s (e.g. `w-12 h-12`, `aspect-video`) which already constrains layout, but no explicit intrinsic `width`/`height` attributes are set on the `<img>` elements themselves. Low priority given the wrapper sizing already in place.
- [ ] Bing Webmaster Tools verification meta tag - needs the user's verification code; not fabricated.
- [ ] Google Search Console verification meta tag - needs the user's GSC verification code/property setup.

### Deferred / Needs user input
- Social share image currently reuses `corbin.jpg` (a personal headshot) for all pages via OG/Twitter tags - confirm this is acceptable or if a dedicated brand/share image should be designed instead.
- GSC and Bing verification codes must come from the user's own accounts - cannot proceed without them.

---

## [2026-07-21] page-optimization audit - run 1

**Route inventory** (`src/App.tsx`): `/` (Home), `/about` (About), `/contact` (Contact), `/portfolio` (Portfolio), `/privacy-policy` (PrivacyPolicy, new this run), `*` (404). Prior to this run there was no mobile nav menu, no scroll-reset on navigation, and no privacy policy.

### Fixed this run
- **Real navigation bug:** `src/components/ProjectModalProvider.tsx` fullscreen gallery arrow buttons called undefined `prevImage()`/`nextImage()` (stale names from an earlier refactor) - clicking either arrow threw a runtime `ReferenceError` and did nothing. Fixed to call the actual `paginate(-1)` / `paginate(1)` handlers that already drive keyboard arrow-key navigation. Confirmed via `tsc --noEmit` (2 errors here → 0) and a clean `vite build`.
- **Scroll position on navigation:** added `src/components/ScrollToTop.tsx` (resets `window.scrollTo(0,0)` on route change, keyed on `pathname`) and mounted it in `src/App.tsx` - React Router preserves scroll offset by default, stranding users mid-page after navigating from a long page.
- **Mobile navigation menu (was missing):** `src/components/Header.tsx` wrapped `Portfolio`/`About` links in `hidden md:flex` with no mobile alternative - below `md` only the logo and Contact button were reachable. Added a hamburger button (44px touch target) opening an animated dropdown panel; closes on Escape and auto-closes on route change.
- **Legal / privacy policy (required, was missing):** added `src/pages/PrivacyPolicy.tsx`, routed at `/privacy-policy`, linked from the footer's "Legal" column (`src/components/Footer.tsx`). Grounded in the actual data flow in `functions/api/send.ts`: the contact form (`src/pages/Contact.tsx`) sends straight to Resend for a visitor confirmation + owner notification email - no database/D1 persistence of submissions exists - so the policy describes storage generically as email-provider mailbox retention, frames all data as user-volunteered, and includes a liability clause. Flagged in-page as a good-faith draft, not legal advice.
- **Scaffolding leftovers:** removed unused Next.js starter assets from `public/` - `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` - grepped `src/` first to confirm none were referenced (this is a Vite/React project, not Next.js; these were dead template artifacts, not brand assets).
- Noted, not re-done (already fixed as uncommitted local changes by the concurrent SEO-audit pass logged above): favicon MIME type, OG/Twitter tags, `loading="lazy"` on `AssociateCard.tsx`/`EducationStrip.tsx` images.

### Verify
- `npm run build` (vite build) - succeeds, no errors.
- `npx tsc --noEmit` - 0 errors in every file touched this run. Two pre-existing errors remain in `functions/api/send.ts` (`Cannot find name 'PagesFunction'`, implicit `any` on `context`) - unrelated to rendering, needs `@cloudflare/workers-types` wired into `tsconfig`; see Deferred.
- Not verified in a live browser this pass - new mobile menu and privacy-policy page should get a visual check at 375/768/1440/1920px next time a browser session is available.

### Next Up (prioritized)
- [ ] Visual check of the new mobile menu and privacy-policy page across all four viewport tiers.
- [ ] Explicit `width`/`height` (or `aspect-ratio` wrapper confirmation) on `ProjectCard.tsx` and `ProjectModalProvider.tsx` gallery `<img>` tags - likely already CLS-safe via `aspect-video`/`aspect-square` container classes but not visually confirmed (same item the SEO-audit pass flagged independently above).
- [ ] `ProjectModalProvider.tsx` fullscreen image swap has no transition on `activeIndex` change (the thumbnail strip already tracks a `direction` state that isn't applied to the fullscreen view) - polish, not a defect.

### Deferred / Needs user input
- `functions/api/send.ts:10` type errors - build-tooling fix (`@cloudflare/workers-types`), not a rendering defect; hand to a build-fix pass.
- Terms of Service page: not present. Flagging per policy since a contact form exists - not auto-created; add only if wanted alongside the new privacy policy.
- Privacy policy content should get a human/legal read before being treated as binding (also noted in-page).

---

## [2026-07-21] follow-up pass - user-directed fixes

### Fixed this run
- **Per-route SEO metadata:** installed `react-helmet-async`, wrapped the app in `HelmetProvider` (`src/main.tsx`), added `src/components/SeoHead.tsx` (title/description/canonical/OG/Twitter per route) and wired it into `Home`, `About`, `Portfolio`, `Contact`, `PrivacyPolicy`, and the new `TermsOfService` page. Closes the duplicate-metadata gap flagged in the SEO audit above.
- **JSON-LD structured data:** added `src/components/PersonJsonLd.tsx` (schema.org `Person`, with `alumniOf` Butte College and `sameAs` GitHub/LinkedIn from the footer), mounted once in `App.tsx` so it's present on every route via Helmet's script dedup.
- **Butte College logo:** processed the user-supplied `bute_college_logo.svg` (horizontal lockup, mark + wordmark, 182:39 aspect ratio - won't fit a square crop) with `svgo`, saved as `public/butte-college-logo.svg`, and pointed `src/data/associates.json` at it instead of the remote `butte.edu` URL. Widened the logo container in `src/components/EducationStrip.tsx` from a square (`w-16/w-20 h-16/h-20`) to a wide box (`w-40/w-52 h-16/h-20`) so the wordmark isn't cropped; kept the white background plate since the logo's text is solid black and the site has a dark mode.
- **Contact CTA on mobile:** `src/components/Header.tsx` - the standalone "Contact" button is now `hidden md:inline-flex` (desktop only) and a matching full-width Contact link was added inside the mobile hamburger dropdown, so it isn't lost on small screens.
- **Terms of Service:** added `src/pages/TermsOfService.tsx` at `/terms-of-service`, cross-linked with the Privacy Policy and linked from the footer's Legal column. Added to `public/sitemap.xml` along with the previously-missing `/privacy-policy` entry.
- **Privacy policy - collected data accuracy:** corrected the "does not collect any personal information automatically" claim (inaccurate - Cloudflare Pages logs IP/user-agent/URL/timestamp for every request, and Vercel Analytics records aggregate page/referrer/country/device data). Added an "Information Collected Automatically" section and expanded "Cookies & Analytics" with specifics on what Vercel Analytics records and doesn't (cookieless, no cross-site tracking, no PII).
- OG/Twitter share image: confirmed acceptable to keep reusing `corbin.jpg` (user-approved).
- Verified `npm run build` succeeds after all changes.

### Next Up
- Visual check of the new Contact-in-hamburger placement and the widened Butte College logo box across breakpoints (no browser session available this pass).
- GSC/Bing verification meta tags still need the user's own verification codes.
- `functions/api/send.ts` `PagesFunction` type errors are pre-existing and unrelated to this pass; `@cloudflare/workers-types` is already a devDependency, so this is a tsconfig `types` wiring fix, not a missing-package issue - hand to a build-fix pass.

---

## [2026-07-21] mobile spacing + logo correction - user-directed fixes

### Fixed this run
- **Hero mobile spacing:** `Hero.tsx` no longer uses the shared `.section-container` (which alone contributed ~128px of top padding pre-fix); rewrote as `pt-8 pb-16 sm:py-32 min-h-[60vh] sm:min-h-[85vh]` so the eyebrow badge sits much closer to the header on mobile while desktop is unchanged.
- **Hero centered on mobile:** content is now `text-center sm:text-left`, `items-center sm:items-start`; eyebrow badge and CTA button row center via `mx-auto`/`justify-center` on mobile, left-align again at `sm:`.
- **Removed the arrow icon** from the "Start a project" button (`ArrowRight` import and usage dropped from `Hero.tsx`).
- **Global mobile section spacing:** `.section-container` in `globals.css` changed from flat `py-32` to `py-16 sm:py-32`, halving the vertical gap between sections on mobile site-wide (Hero, FeaturedProjects, Services, CTA, and page headers on About/Portfolio/Contact) while leaving desktop untouched. Also trimmed mobile-specific margins in `FeaturedProjects.tsx` (`mb-20` → `mb-10 sm:mb-20`), `Services.tsx` (`mb-16` → `mb-10 sm:mb-16`), `CTA.tsx` inner panel (`py-20` → `py-12 sm:py-20`), and the `Home.tsx` page wrapper bottom padding (`pb-20` → `pb-12 sm:pb-20`).
- **Butte College logo swap:** the wordmark SVG added last run didn't match what the user wanted. Recovered the original `butte-logo.png` (114×113 circular Butte-Glenn Community College District seal) from the already-deployed production site (`https://corbinmeier.net/butte-logo.png`) since it wasn't present in this working copy or git history; Cloudflare was serving it as a WebP payload under a `.png` name, so re-encoded it to a real PNG before saving to `public/butte-logo.png`. Reverted `associates.json` to point at it and reverted `EducationStrip.tsx`'s logo box back to the original square (`w-16/w-20 h-16/h-20`) container. Removed the now-unused `public/butte-college-logo.svg`.
- Verified `npm run build` succeeds after all changes.

### Next Up
- Visual check of Hero mobile centering/spacing and the reduced section gaps across breakpoints (no browser session available this pass either - flagging again).
