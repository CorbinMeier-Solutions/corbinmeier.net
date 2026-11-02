"use client";

import associates from "@/data/associates.json";
import { education } from "@/data/education";
import { GraduationCap, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { CyberCodeTerminalWindow } from "@/components/cybercode/CyberCodeUIKit";

// The local diploma file arrives later (config task); until it exists in
// public/images the preview is omitted instead of requesting a missing file.
const hasDiplomaPreview =
  Object.keys(import.meta.glob("/public/images/diploma-preview.jpg")).length > 0;

export default function EducationStrip() {
  const butte = associates.find((a) => a.name.toLowerCase().includes("butte"));
  if (!butte) return null;

  return (
    <section className="section-container !py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <CyberCodeTerminalWindow
          title="education.sh"
          icon={<Terminal className="w-3 h-3" />}
          showDots={true}
        >
          <div className="flex flex-col tablet:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 tablet:w-24 tablet:h-24 relative bg-white rounded-full border border-border overflow-hidden m-0.5 p-px">
                <img
                  src={butte.logo}
                  alt={`${butte.name} logo`}
                  className="absolute inset-px w-[calc(100%-2px)] h-[calc(100%-2px)] object-cover rounded-full"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="flex-1 text-center tablet:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-3">
                <GraduationCap className="w-3 h-3" />
                {education.eyebrow}
              </div>
              <h3 className="text-h3 font-serif mb-1">
                {education.degreeTitle}
              </h3>
              <p className="text-muted">
                {butte.name} • Class of 2025
              </p>
            </div>

            <div className="flex-shrink-0">
              <a
                href={education.diplomaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-32 h-24 tablet:w-40 tablet:h-28 rounded-xl overflow-hidden border border-border transition-transform hover:scale-105"
                aria-label="View official diploma on Parchment.com"
                title="Official diploma (opens in new tab)"
              >
                {hasDiplomaPreview && (
                  <img
                    src={education.diplomaPreviewPath}
                    alt="Diploma preview"
                    width={160}
                    height={112}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-bold uppercase">{education.diplomaOverlayLabel}</span>
                </div>
              </a>
            </div>
          </div>
        </CyberCodeTerminalWindow>
      </motion.div>
    </section>
  );
}
