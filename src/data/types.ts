export interface CtaLink {
  label: string;
  href: string;
}

export interface NavItem {
  name: string;
  href: string;
}

export interface HomePricingDetails {
  summary: string;
  points: string[];
  cta: CtaLink;
}

export interface HomeHeroContent {
  eyebrow: string;
  headingLine1: string;
  headingAccent: string;
  paragraph: string;
  pricingDetails: HomePricingDetails;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
}

export interface HomeCtaContent {
  headingPre: string;
  headingAccent: string;
  body: string;
  button: CtaLink;
}

export interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  icon: "Globe" | "Code2" | "TrendingUp" | "Search" | "Mail" | "CreditCard" | "AtSign" | "Zap" | "Brain";
  link?: string;
}

export interface ServicesSectionContent {
  headingPre: string;
  headingAccent: string;
  intro: string;
  items: ServiceItem[];
}

/** A single add-on to a package. `recurring` is null when the feature
 *  carries no monthly cost. `prerequisites` holds the ids of other line
 *  items (add-ons, or the standalone `databaseTier`/`customSolution`) that
 *  must be bought first, rather than their display names, so the table can
 *  resolve each one's real price instead of restating it by hand and
 *  drifting out of sync. Empty when the feature stands on its own.
 *  `responsibility` is the point of the table, not a footnote: it states in
 *  plain terms what the price actually buys - empty only for an add-on whose
 *  real cost depends entirely on the client's existing setup (a "Quoted"
 *  price). `level` is omitted for an add-on that sits outside every level,
 *  such as `customSolution`. */
export interface PricingLineItem {
  id: string;
  name: string;
  upfront: string;
  recurring: string | null;
  prerequisites: string[];
  responsibility: string;
  level?: 1 | 2 | 3;
}

/** One row of the level legend shown above the add-ons table - named by what
 *  happens if the add-on breaks, per .claude/rules/style.md. */
export interface PricingLevelInfo {
  level: 1 | 2 | 3;
  name: string;
  description: string;
}

/** A category of add-ons, ordered Level 1 -> 3 inside it. `note`, when set,
 *  is shown once above the category's table (e.g. the maintenance-plan aside
 *  above "Publishing Your Own Content"). */
export interface PricingCategory {
  id: string;
  title: string;
  blurb: string;
  note?: string;
  items: PricingLineItem[];
}

/** One of the build tiers. `build` is a one-time price, and there is
 *  deliberately no recurring field: ongoing cost is chosen separately on the
 *  maintenance axis below, so a self-managed client genuinely owes nothing
 *  monthly. Folding a monthly in here is what made the earlier single-tier
 *  page contradict the "no hosting fees" claim on the About page. */
export interface PricingTier {
  id: string;
  name: string;
  build: string;
  tagline: string;
  summary: string;
  includes: string[];
  /** Marks the tier to lead with visually. Exactly one tier sets this. */
  featured?: boolean;
}

/** How a finished site is looked after. This is an axis rather than a tier:
 *  every build is offered both ways, so it renders once beside the tiers
 *  instead of being repeated inside each one. */
export interface PricingMaintenanceOption {
  id: string;
  name: string;
  price: string;
  summary: string;
  points: string[];
}

export interface PricingNotice {
  title: string;
  body: string;
}

export interface PricingContent {
  eyebrow: string;
  headingPre: string;
  headingAccent: string;
  intro: string;
  ballpark: string;
  tiersHeading: string;
  tiersIntro: string;
  tiers: PricingTier[];
  maintenanceHeading: string;
  maintenanceIntro: string;
  maintenanceOptions: PricingMaintenanceOption[];
  addOnsHeadingPre: string;
  addOnsHeadingAccent: string;
  addOnsIntro: string;
  levelLegend: PricingLevelInfo[];
  categories: PricingCategory[];
  /** Not shown as its own row - resolved into a fixed "Needs: database
   *  (usage billed $30 - $200/mo)" line on any add-on whose
   *  `prerequisites` includes its id. */
  databaseTier: PricingLineItem;
  /** Shown after every category, outside all of them - no `level`. */
  customSolution: PricingLineItem;
  noticesHeading: string;
  notices: PricingNotice[];
  ctaHeadingPre: string;
  ctaHeadingAccent: string;
  ctaBody: string;
  ctaLabel: string;
}

export interface EducationContent {
  eyebrow: string;
  degreeTitle: string;
  diplomaUrl: string;
  diplomaPreviewUrl: string;
  diplomaOverlayLabel: string;
}

export interface AboutSection {
  heading: string;
  headingClassName?: string;
  paragraphs: string[];
  panelClassName?: string;
}

export interface AboutContent {
  heroHeading: string;
  heroSubhead: string;
  sidebarLabel: string;
  sidebarQuote: string;
  sections: AboutSection[];
  closingSection: AboutSection & { ctaLabel: string; ctaHref: string; boldFragment: string };
}

export interface ContactInfoItem {
  icon: "Mail" | "MapPin" | "Mailbox" | "Clock";
  label: string;
  value: string;
}

export interface ContactFormLabels {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  projectDetails: string;
  submit: string;
  submitting: string;
}

export interface ContactValidationMessages {
  missingFields: string;
  missingTurnstile: string;
  genericError: string;
  success: string;
}

export interface ContactContent {
  heading: string;
  subhead: string;
  infoItems: ContactInfoItem[];
  formLabels: ContactFormLabels;
  validation: ContactValidationMessages;
}

export interface SocialLinks {
  github: string;
  linkedin: string;
  email: string;
}

export interface SiteContent {
  brandName: string;
  navItems: NavItem[];
  contactCtaLabel: string;
  missionStatement: string;
  footerTagline: string;
  footerSocial: SocialLinks;
  footerNavLabel: string;
  footerLegalLabel: string;
  footerLegalLinks: NavItem[];
  builtWithLine: string;
}

export interface WorkshopImage {
  src: string;
  label?: string;
  caption?: string;
}

/** One side project, shown with full specs rather than a teaser. `stack` and
 *  `replaced` are omitted when there's nothing real to say - never
 *  fabricated to fill the row. */
export interface WorkshopEntry {
  slug: string;
  name: string;
  tagline?: string;
  status?: string;
  date?: string;
  problem: string;
  built: string;
  stack?: string;
  replaced?: string;
  images?: WorkshopImage[];
}

/** A section of the Workshop page. `entries` starts empty for a category
 *  with nothing to show yet - the section still renders, with a note, so
 *  the category exists ready for the next entry. */
export interface WorkshopCategory {
  id: string;
  title: string;
  entries: WorkshopEntry[];
}

export interface WorkshopContent {
  eyebrow: string;
  headingPre: string;
  headingAccent: string;
  intro: string;
  emptyCategoryNote: string;
  categories: WorkshopCategory[];
}
