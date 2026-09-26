import { motion } from "framer-motion";
import { Cpu, ShieldCheck, Zap, DollarSign, ArrowRight, Server, BrainCircuit, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { aiSetup } from "@/data/ai-setup";
import type { AiSetupValueProp } from "@/data/types";

const VALUE_PROP_ICONS: Record<AiSetupValueProp["icon"], LucideIcon> = {
  ShieldCheck,
  DollarSign,
  Zap,
};

export default function AiSetup() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <PageShell className="overflow-hidden">
      <div className="page-container relative z-10">
        {/* Hero Section */}
        <div className="w-full mb-12 text-center sm:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-[0.2em] mb-8"
          >
            <BrainCircuit className="w-4 h-4" />
            {aiSetup.eyebrow}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-h1 font-serif mb-8"
          >
            {aiSetup.headingLine1} <br />
            <span className="text-accent italic">{aiSetup.headingAccent}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-narrative w-full"
          >
            {aiSetup.intro}
          </motion.p>
        </div>

        {/* Value Propositions */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {aiSetup.valueProps.map((prop) => {
            const Icon = VALUE_PROP_ICONS[prop.icon];
            return (
              <motion.div key={prop.title} variants={item} className="relative glass-panel p-8">
                <Icon className="w-10 h-10 text-accent mb-6" />
                <h3 className="text-h3 font-serif mb-3">{prop.title}</h3>
                <p className="text-sm text-muted">{prop.body}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Technical Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl bg-accent/5 border border-accent/10 flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 crt-scanlines"></div>
               <Server className="w-48 h-48 text-accent/20" />
               <Cpu className="w-24 h-24 text-accent absolute animate-pulse" />
            </div>
          </motion.div>
          
          <div>
            <h2 className="text-h2 font-serif mb-8">{aiSetup.stackHeadingPre} <span className="text-accent italic">{aiSetup.stackHeadingAccent}</span> Environment</h2>
            <p className="text-narrative mb-8">
              {aiSetup.stackBody}
            </p>
            <ul className="space-y-4 mb-10">
              {aiSetup.checklist.map((entry) => (
                <li key={entry.text} className="flex items-start gap-3 text-muted">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>{entry.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pricing/CTA Section */}
        <div className="relative glass-panel p-12 text-center w-full">
          <h2 className="text-h2 font-serif mb-6">{aiSetup.pricingHeadingPre} <span className="text-accent italic">{aiSetup.pricingHeadingAccent}</span></h2>
          <div className="flex flex-col items-center mb-10">
            <span className="text-sm uppercase tracking-widest text-accent font-bold mb-2">{aiSetup.pricingTierLabel}</span>
            <div className="text-6xl font-serif flex items-start">
              <span className="text-2xl mt-2">$</span>
              <span>{aiSetup.price}</span>
              <span className="text-xl self-end mb-2 text-muted">.00</span>
            </div>
            <p className="text-muted mt-4">{aiSetup.priceNote}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
            {aiSetup.packages.map((pkg) => (
              <div key={pkg.title} className="p-6 rounded-2xl bg-muted/20 border border-border">
                <h4 className="font-bold mb-2">{pkg.title}</h4>
                {pkg.note && <p className="text-sm text-muted italic text-accent">{pkg.note}</p>}
                <p className="text-sm text-muted">{pkg.body}</p>
              </div>
            ))}
          </div>

          <Link to="/contact" className="btn-artisan">
            {aiSetup.ctaLabel}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
