"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CyberCodeLinkButton } from "@/components/cybercode/CyberCodeUIKit";
import projects from "@/data/projects.json";
import ProjectCard from "./ProjectCard";
import { useProjectModal } from "./ProjectModalContext";

export default function FeaturedProjects() {
  const selectedSlugs = ["addressdb", "early-byrd-services", "living-water-jet-boat-tours"];
  const featured = selectedSlugs
    .map(slug => projects.find((p) => p.slug === slug && !p.hidden))
    .filter((p): p is typeof projects[number] => !!p);
  const { open } = useProjectModal();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const item: any = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <section className="section-container border-b border-border/50">
      <div className="mb-10 tablet:mb-20">
        <div className="flex justify-between items-baseline mb-6 gap-8">
          <h2 className="text-h2 font-serif">Selected Works</h2>
          <CyberCodeLinkButton
            to="/projects"
            className="group whitespace-nowrap shrink-0"
          >
            View all work
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </CyberCodeLinkButton>
        </div>
        <p className="text-narrative">
          A curated selection of digital infrastructure and performance-critical systems
          built with precision and purpose.
        </p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-8"
      >
        {featured.map((p) => (
          <motion.div key={p.slug} variants={item}>
            <ProjectCard 
              project={p} 
              onClick={() => open(p, featured)}
              className="h-full"
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
