import type { PricingContent } from "./types";

export const pricing: PricingContent = {
  eyebrow: "Investment Menu",
  headingPre: "Own the build,",
  headingAccent: "choose the upkeep.",
  intro:
    "You pay once for the site to be built. After that you decide whether you look after it or I do. Everything beyond the build is chosen line by line, so you are never paying for a feature you did not ask for.",
  ballpark:
    "Treat these as ballpark figures. They cover the general shape of a project, but every scope is different, and the honest number comes out of a conversation about what you actually need.",

  tiersHeading: "Pick a starting point",
  tiersIntro:
    "One-time build prices. None of them carry a required monthly, because hosting a straightforward site genuinely costs nothing to run.",
  tiers: [
    {
      id: "starter",
      name: "Starter",
      build: "$1,400",
      tagline: "A real presence, quickly",
      summary:
        "A small custom site for a business that needs to be found, look credible, and be easy to contact. Hand-coded rather than assembled from a template, and fast on a phone.",
      includes: [
        "One to three pages, built to your content",
        "Contact form delivered straight to your inbox",
        "Set up so search engines can find and list you",
        "No monthly cost at all if you take the keys",
      ],
    },
    {
      id: "foundation",
      name: "Foundation",
      build: "$2,400",
      tagline: "The one most businesses want",
      summary:
        "Room to actually tell your story: services, background, proof, and the legal pages a business site is expected to have. The usual starting point for an established local business.",
      includes: [
        "Up to five pages, built to your content",
        "Terms of Service and Privacy Policy written for your site, included",
        "Photo and content layouts shaped around your business",
        "Everything in Starter",
      ],
      featured: true,
    },
    {
      id: "growth",
      name: "Growth",
      build: "$4,200",
      tagline: "You update it yourself",
      summary:
        "Foundation plus the machinery to run the site without calling me. A private admin area, a familiar editor, and somewhere to put large photos and video. Bought separately these run $5,200.",
      includes: [
        "Private admin area, one owner account",
        "Write and format content like a word processor",
        "Upload large photos and video without slowing the site",
        "Everything in Foundation",
      ],
    },
  ],

  maintenanceHeading: "Then decide who maintains it",
  maintenanceIntro:
    "This is the part most quotes hide. A finished site still needs someone to keep it current and keep an eye on it. That someone can be you.",
  maintenanceOptions: [
    {
      id: "self-managed",
      name: "You maintain it",
      price: "$0/mo to me",
      summary:
        "I set up every account in your name, hand you the login details, and walk you through them. The site is yours outright, with nothing tying you to me.",
      points: [
        "Accounts are in your name from day one, not mine",
        "You keep the logins whether or not we work together again",
        "Platform costs go straight to you, and for a straightforward site those are $0",
        "You can bring me back later as an administrator whenever you want",
      ],
    },
    {
      id: "maintained",
      name: "I maintain it",
      price: "$150 - $500/mo",
      summary:
        "I stay on as an administrator and keep the site healthy. The rate is set per project against what I am actually responsible for: $150 covers a straightforward site, and it climbs from there as that list grows. You see the list, agreed in writing, before you agree to a number.",
      points: [
        "Content and copy changes handled as they come up",
        "Security patches and dependency updates applied for you",
        "Uptime monitoring, so I know when your site goes down or has issues",
        "Backups with 1 click restoration",
        "Debugging when something stops behaving the way it should",
      ],
    },
  ],

  addOnsHeadingPre: "The",
  addOnsHeadingAccent: "add-ons.",
  addOnsIntro:
    "Add any of these to any package. Each row names what it costs and what I am on the hook for, grouped by category and then ordered by how much is riding on it. A monthly appears only where the feature genuinely consumes an outside service, billed on top of whichever upkeep option you chose. Anything under \"Needs\" has to be in place first, and its cost is listed there so you can see the real total.",

  levelLegend: [
    {
      level: 1,
      name: "Nice to have",
      description: "Polish and presentation. If it breaks, nothing is lost.",
    },
    {
      level: 2,
      name: "Brings in business",
      description: "Leads, content, visibility. If it breaks, you miss opportunities.",
    },
    {
      level: 3,
      name: "Business-critical",
      description: "Money, bookings, identity, access. If it breaks, you lose revenue or trust.",
    },
  ],

  categories: [
    {
      id: "connections",
      title: "Connections & Email",
      blurb: "Getting your own domain and inbox working the way visitors expect.",
      items: [
        {
          id: "integrations",
          name: "Vendor Integration (each)",
          upfront: "$300",
          recurring: null,
          prerequisites: [],
          level: 1,
          responsibility:
            "Connects your site to an outside system you already use, such as a point of sale, a booking tool, or a supplier. Priced per system, since each one stores credentials, maps data, and gets tested separately.",
        },
        {
          id: "domain-connection",
          name: "Domain Connection / Move From an Old Host",
          upfront: "Quoted",
          recurring: null,
          prerequisites: [],
          level: 2,
          responsibility:
            "Point your existing domain at the new site, or move it over from wherever it lives today, untangling the DNS and email records along the way so nothing goes down in the switch.",
        },
        {
          id: "business-email",
          name: "Business Email Setup",
          upfront: "Quoted",
          recurring: null,
          prerequisites: [],
          level: 3,
          responsibility:
            "A business email address on your own domain, authenticated so it lands in inboxes instead of spam folders.",
        },
      ],
    },
    {
      id: "leads",
      title: "Get Found & Get Leads",
      blurb: "Turning visitors into people you can actually follow up with.",
      items: [
        {
          id: "reviews",
          name: "Reviews & Testimonials",
          upfront: "$150",
          recurring: null,
          prerequisites: [],
          level: 1,
          responsibility:
            "Your customer reviews pulled in and displayed properly, so the proof that you are good at your job is on your own site instead of only on someone else's platform.",
        },
        {
          id: "countdown",
          name: "Countdown Timers & Timelines",
          upfront: "$400",
          recurring: null,
          prerequisites: [],
          level: 1,
          responsibility:
            "Live countdowns to an opening, a deadline, or an event, plus timeline layouts for telling a story in order.",
        },
        {
          id: "gallery",
          name: "Interactive Media Gallery",
          upfront: "$550",
          recurring: null,
          prerequisites: [],
          level: 1,
          responsibility:
            "A browsable photo or video gallery, laid out around how you want the work shown. Files uploaded through the site have a size ceiling set by the host, so full-length or high-resolution video is better kept on a video platform and pulled into the gallery from there.",
        },
        {
          id: "leaderboards",
          name: "Live Leaderboards & Rankings",
          upfront: "$900",
          recurring: null,
          prerequisites: ["database"],
          level: 1,
          responsibility:
            "Standings that update as results come in, for competitions, fundraising drives, or sales targets.",
        },
        {
          id: "mailing-list",
          name: "Mailing List & Lead Capture",
          upfront: "$400",
          recurring: "$10 - $60/mo",
          prerequisites: [],
          level: 2,
          responsibility:
            "Sign-up forms that screen out bots before they reach you, so your list stays real people and your mail does not get flagged as spam. The monthly covers the delivery service: $10 up to 3,000 emails a month, $60 above that.",
        },
        {
          id: "estimator",
          name: "Custom Inquiry & Estimator Forms",
          upfront: "$700",
          recurring: null,
          prerequisites: [],
          level: 2,
          responsibility:
            "Multi-step forms that ask the right follow-up questions and can return a live estimate, so the enquiries reaching you are already qualified.",
        },
        {
          id: "local-seo",
          name: "Local SEO & Search Visibility",
          upfront: "$700",
          recurring: "$300/mo optional",
          prerequisites: [],
          level: 2,
          responsibility:
            "Everything on the website side of being found locally: your site marked up so search engines understand where you are and what you do, your details made consistent, and the standard practices applied at launch. Done once, at build. I do not claim or verify your Google Business Profile, because Google requires a video walkthrough of your premises that only you can record, and I do not post to it either. The optional monthly buys three hours of ongoing competitor checks, auditing, and verification.",
        },
      ],
    },
    {
      id: "publishing",
      title: "Publishing Your Own Content",
      blurb: "Updating the site yourself, without calling me first.",
      note:
        "On a maintenance plan, updates are included. These are only for owners who'd rather do it themselves.",
      items: [
        {
          id: "wysiwyg",
          name: "Rich Text Editor",
          upfront: "$800",
          recurring: null,
          prerequisites: ["admin-single"],
          level: 1,
          responsibility:
            "Format your content the way you would in a word processor, with headings, links, images, and lists, and no code to learn. Included in Growth.",
        },
        {
          id: "uploader",
          name: "Media Uploader",
          upfront: "$800",
          recurring: "from $10/mo",
          prerequisites: ["admin-single", "database"],
          level: 2,
          responsibility:
            "Large photo and video uploads go straight to secure storage rather than through the website, which keeps your pages fast and your upload limits generous. The monthly is the storage bill and it grows with how much you keep there, so it starts at $10 and rises as the library does. Included in Growth.",
        },
        {
          id: "blog",
          name: "Blog / Article Publishing",
          upfront: "$900",
          recurring: null,
          prerequisites: ["admin-single", "database"],
          level: 2,
          responsibility:
            "Write, edit, schedule, and publish posts yourself. Because a post lives in your database rather than in the site's code, each published article also gets a plain readable copy built out at the same web address your visitors use, so search engines have something to read and list.",
        },
      ],
    },
    {
      id: "bookings-sales",
      title: "Bookings & Sales",
      blurb: "Taking money and reservations, with the funds landing directly in your account.",
      items: [
        {
          id: "catalog",
          name: "Product Catalog & Cart",
          upfront: "$1,200",
          recurring: null,
          prerequisites: ["checkout"],
          level: 2,
          responsibility:
            "The shop front that sits on top of checkout: a browsable product range, grouped the way you actually sell, with a cart that holds several items and hands the total over to be paid. This is the shopping half, not the paying half, which is why it is priced separately.",
        },
        {
          id: "crowdfunding",
          name: "Crowdfunding & Goal Tracker",
          upfront: "$1,200",
          recurring: null,
          prerequisites: ["checkout"],
          level: 2,
          responsibility:
            "Collect contributions against a public target, with a progress display that updates as donations arrive.",
        },
        {
          id: "booking",
          name: "Booking & Scheduling",
          upfront: "$1,800",
          recurring: "$50/mo",
          prerequisites: ["admin-single", "database"],
          level: 3,
          responsibility:
            "Live availability that accounts for what is already reserved, blocks out holidays and time off, and sends confirmation and change notices automatically.",
        },
        {
          id: "ticketing",
          name: "Digital Ticketing",
          upfront: "$1,800",
          recurring: "$30/mo",
          prerequisites: ["checkout", "admin-single"],
          level: 3,
          responsibility:
            "Someone buys a ticket and automatically receives a unique digital pass by email, ready to be checked at the door.",
        },
        {
          id: "checkout",
          name: "Secure Checkout",
          upfront: "$2,400",
          recurring: "$30/mo",
          prerequisites: ["database"],
          level: 3,
          responsibility:
            "The payment machinery itself, and on its own it is enough to charge for an invoice, a deposit, or a donation with no product range in sight. It handles the card form, the receipt, the record of who has paid and who has not, and the payout landing in your bank. Money never sits with me. Everything else in this category is built on top of it.",
        },
      ],
    },
    {
      id: "accounts",
      title: "Accounts & Security",
      blurb: "Letting people sign in, and controlling what they can reach.",
      items: [
        {
          id: "rate-limiting",
          name: "Usage Limits & Abuse Protection",
          upfront: "$600",
          recurring: null,
          prerequisites: ["database"],
          level: 2,
          responsibility:
            "Caps how often one person can submit or request something, with allowances resetting at their local midnight rather than yours.",
        },
        {
          id: "admin-single",
          name: "Single-User Admin Portal",
          upfront: "$1,200",
          recurring: null,
          prerequisites: ["database"],
          level: 2,
          responsibility:
            "A private area where you add, edit, and remove your own content. One owner account, straightforward by design, and protected by multi-factor authentication so a stolen password on its own is not enough to get in. Included in Growth.",
        },
        {
          id: "identity",
          name: "ID Verification",
          upfront: "$1,800",
          recurring: "$50/mo + usage",
          prerequisites: ["database"],
          level: 3,
          responsibility:
            "Confirms a customer is who they claim to be. The sensitive ID documents are handled by the verification provider and are never stored on your site.",
        },
        {
          id: "otp",
          name: "Passwordless Login",
          upfront: "$2,200",
          recurring: "$10 - $60/mo",
          prerequisites: ["database"],
          level: 3,
          responsibility:
            "Users sign in with a one-time code instead of a password, so there is nothing to forget, reset, or leak. Email codes run on the same tiers as the mailing list. Codes by text message are available too, but they need a Twilio account opened in your name, and Twilio bills you directly for the messages.",
        },
        {
          id: "admin-multi",
          name: "Multi-User Admin Portal",
          upfront: "$4,200",
          recurring: "$200/mo",
          prerequisites: ["database"],
          level: 3,
          responsibility:
            "Multiple staff accounts with different permission levels, where each person sees only their own data and only the areas you have granted them. Multi-factor authentication on every account.",
        },
      ],
    },
  ],

  databaseTier: {
    id: "database",
    name: "Database Tier",
    upfront: "$0",
    recurring: "$30 - $200/mo",
    prerequisites: [],
    responsibility:
      "The memory behind your site. The moment it needs to remember someone, whether that is an account, a booking, an order, or an uploaded photo, it needs this. There is no build fee for it, so the monthly is the whole cost, and it moves with real usage rather than a flat guess. Paid straight to the platform if you self-manage.",
  },

  customSolution: {
    id: "custom",
    name: "Custom Solution",
    upfront: "Quoted",
    recurring: null,
    prerequisites: [],
    responsibility:
      "Anything not on this menu, including the specialised pieces some industries need such as age or content gating. Bring me the problem and I will scope it honestly, naming the build price and any monthly it carries before you commit, including telling you when it is not worth building.",
  },

  noticesHeading: "Before you budget",
  notices: [
    {
      title: "The site belongs to you",
      body: "Whichever option you choose, the accounts are set up in your name and you can ask for the login details at any time. There is no version of this where leaving means losing your website.",
    },
    {
      title: "Cheaper than hiring for it",
      body: "A year of upkeep costs less than a handful of hours from a freelance developer, and a fraction of what an in-house hire runs once you count the salary, taxes, and the months they are not busy.",
    },
    {
      title: "These prices move with scope",
      body: "Everything here is negotiable against the real shape of the work: how deep the integrations run, how much content there is, and whether we are working together long-term.",
    },
    {
      title: "Ongoing partners keep their rate",
      body: "While a maintenance agreement is active, your pricing stays where it started, even as these numbers rise. Ending that agreement ends the locked rate, and returning later means coming back at current pricing.",
    },
    {
      title: "I build websites, not marketing",
      body: "My work stops at the edge of the website. I do not write your posts, run your ad accounts, or manage the profiles that need you to verify them in person. Where a job needs one of those, I will say so rather than quietly leave it out of scope.",
    },
    {
      title: "Regulated health and social data",
      body: "I do not build systems that hold medical, social services, or restricted government records directly. What I can do is connect your site to an established platform that is already certified to hold that data, so it stays with them and out of your website.",
    },
  ],

  ctaHeadingPre: "Not sure what you",
  ctaHeadingAccent: "actually need?",
  ctaBody:
    "Most people do not arrive knowing which line items apply to them, and that is fine. Tell me what you want your site to do and I will map it back to this menu, including the parts you can safely skip for now.",
  ctaLabel: "Talk through your project",
};
