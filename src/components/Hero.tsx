"use client";

import { useState } from "react";
import { Link } from "react-router";
import { motion, Variants } from "framer-motion";
import { homeHero } from "@/data/home";
import { site } from "@/data/site";
import { CyberCodeButton, CyberCodeLinkButton, CyberCodeTerminalLine, Typewriter } from "@/components/cybercode/CyberCodeUIKit";

export default function Hero() {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

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
    <section className="w-full px-6 tablet:px-10 pt-0 desktop:pt-0 pb-12 tablet:pb-16 flex flex-col justify-start items-start relative">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full relative z-10 text-left"
      >
        <motion.div variants={item} className="mb-2">
          <CyberCodeTerminalLine prompt=">" className="mb-2">
            <Typewriter as="span">cat /home.dat</Typewriter>
          </CyberCodeTerminalLine>
        </motion.div>

        <motion.p
          variants={item}
          className="mb-4 font-mono text-xs uppercase tracking-widest text-accent"
        >
          <Typewriter as="span">{site.missionStatement}</Typewriter>
        </motion.p>

        <motion.div variants={item}>
          <h1 className="text-display mb-6 font-serif text-foreground">
            <Typewriter as="span">
              <span className="whitespace-nowrap">{homeHero.headingLine1}</span> <br />
              <span className="text-accent italic">{homeHero.headingAccent}</span>
            </Typewriter>
          </h1>
        </motion.div>

        <motion.p
          variants={item}
          className="text-narrative mb-8"
        >
          <Typewriter as="span">{homeHero.paragraph}</Typewriter>
        </motion.p>

        <motion.div
          variants={item}
          className="group mb-14 w-full border border-border rounded-xl px-5 py-4 text-left overflow-hidden bg-background"
        >
          <button
            onClick={() => setIsPricingOpen(!isPricingOpen)}
            className="w-full cursor-pointer flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent focus:outline-none"
          >
            <span className={`transition-transform duration-300 ${isPricingOpen ? "rotate-90" : ""}`}>{">"}</span>
            {homeHero.pricingDetails.summary}
          </button>
          <motion.div
            initial={false}
            animate={{ height: isPricingOpen ? "auto" : 0, opacity: isPricingOpen ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="mt-4 space-y-3 pt-1">
              {homeHero.pricingDetails.points.map((point) => (
                <li key={point} className="text-sm text-muted leading-relaxed pl-4 border-l border-border">
                  {point}
                </li>
              ))}
            </ul>
            <Link
              to={homeHero.pricingDetails.cta.href}
              className="mt-4 ml-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent hover:opacity-80 transition-opacity"
            >
              {homeHero.pricingDetails.cta.label}
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={item}
          className="flex flex-wrap justify-start gap-8"
        >
          <CyberCodeButton to={homeHero.primaryCta.href}>
            {homeHero.primaryCta.label}
          </CyberCodeButton>
          <CyberCodeLinkButton to={homeHero.secondaryCta.href}>
            {homeHero.secondaryCta.label}
          </CyberCodeLinkButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
