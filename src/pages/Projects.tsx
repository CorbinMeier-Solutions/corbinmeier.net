import projects from "@/data/projects.json";
import ProjectFilters from "@/components/project-filters";
import { pageMeta } from "@/lib/seo";
import PageShell from "@/components/PageShell";
import { CyberCodeTerminalLine, Typewriter } from "@/components/cybercode/CyberCodeUIKit";
import { motion, Variants } from "framer-motion";

export function meta() {
  return pageMeta({
    title: "Projects | Corbin Meier",
    description: "A deep dive into the systems, applications, and digital experiences built by Corbin Meier - each project solved through meticulous engineering and user-centric design.",
    path: "/projects",
  });
}

export default function Projects() {
  const visibleProjects = projects.filter((p) => !("hidden" in p && p.hidden));

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
    <PageShell theme="green">
      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="page-container"
      >
        <motion.header variants={item} className="w-full mb-16 text-left">
          <CyberCodeTerminalLine prompt=">" className="mb-2">
            <Typewriter as="span">cat /projects.dat</Typewriter>
          </CyberCodeTerminalLine>
          <h1 className="text-h1 font-serif mb-6">
            <Typewriter as="span">Projects</Typewriter>
          </h1>
          <p className="text-narrative mb-4">
            <Typewriter as="span">
              A deep dive into the systems, applications, and digital experiences
              I&apos;ve built. Each project represents a unique challenge solved through
              meticulous engineering and user-centric design.
            </Typewriter>
          </p>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            <Typewriter as="span">
              {visibleProjects.length} {visibleProjects.length === 1 ? "Project" : "Projects"}
            </Typewriter>
          </p>
        </motion.header>

        <motion.section variants={item} className="w-full">
          <ProjectFilters projects={visibleProjects} />
        </motion.section>
      </motion.main>
    </PageShell>
  );
}
