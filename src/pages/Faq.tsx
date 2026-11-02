import faqs from "@/data/faqs.json";
import FaqLog, { type FaqCategory } from "@/components/FaqLog";
import { faqJsonLd } from "@/lib/faqJsonLd";
import { pageMeta } from "@/lib/seo";
import PageShell from "@/components/PageShell";
import { CyberCodeTerminalLine, Typewriter } from "@/components/cybercode/CyberCodeUIKit";
import { motion, Variants } from "framer-motion";

const categories = faqs as FaqCategory[];
const totalEntries = categories.reduce((sum, category) => sum + category.entries.length, 0);

export function meta() {
  return [
    ...pageMeta({
      title: "FAQ | Corbin Meier",
      description: "A plain-English guide to SEO and mobile vs. desktop: how search ranking actually works, why SEO is billed monthly, where it gets managed, and what really changes on a small screen.",
      path: "/faq",
    }),
    { "script:ld+json": faqJsonLd(categories) },
  ];
}

export default function Faq() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <PageShell theme="orange">
      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="page-container"
      >
        <motion.header variants={item} className="w-full mb-16 text-left">
          <CyberCodeTerminalLine prompt=">" className="mb-2">
            <Typewriter as="span">cat ./faq/*.log</Typewriter>
          </CyberCodeTerminalLine>
          <h1 className="text-h1 font-serif mb-6">
            <Typewriter as="span">FAQ</Typewriter>
          </h1>
          <p className="text-narrative mb-4">
            <Typewriter as="span">
              Answers to what clients ask most - backed by data, not
              guesswork, and logged here one entry at a time.
            </Typewriter>
          </p>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            <Typewriter as="span">
              {totalEntries} {totalEntries === 1 ? "Entry" : "Entries"}
            </Typewriter>
          </p>
        </motion.header>

        {categories.map((category) => (
          <motion.section key={category.slug} variants={item} className="w-full mb-10 last:mb-0">
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-accent mb-2">
              {category.title}
            </h2>
            {category.description && (
              <p className="text-sm text-muted leading-relaxed mb-4">{category.description}</p>
            )}
            <FaqLog category={category} />
          </motion.section>
        ))}
      </motion.main>
    </PageShell>
  );
}
