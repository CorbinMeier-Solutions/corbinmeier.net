"use client";

import { motion } from "framer-motion";
import { Terminal, ArrowRight } from "lucide-react";
import { homeCta } from "@/data/home";
import { CyberCodeTerminalWindow, CyberCodeButton } from "@/components/cybercode/CyberCodeUIKit";

export default function CTA() {
  return (
    <section className="section-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <CyberCodeTerminalWindow
          title="cta.sh"
          icon={<Terminal className="w-3 h-3" />}
          showDots={true}
        >
          <div className="py-12 tablet:py-16 text-center max-w-2xl mx-auto">
            <h2 className="text-h2 font-serif mb-8">
              {homeCta.headingPre} <span className="text-accent italic">{homeCta.headingAccent}</span>
            </h2>
            <p className="text-muted text-lg tablet:text-xl mb-12 leading-relaxed">
              {homeCta.body}
            </p>
            <div className="flex justify-center">
              <CyberCodeButton to={homeCta.button.href} className="inline-flex items-center gap-2 text-base px-8 py-4">
                {homeCta.button.label}
                <ArrowRight className="w-4 h-4" />
              </CyberCodeButton>
            </div>
          </div>
        </CyberCodeTerminalWindow>
      </motion.div>
    </section>
  );
}
