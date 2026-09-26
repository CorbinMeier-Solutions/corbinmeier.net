import SeoHead from "@/components/SeoHead";
import PageShell from "@/components/PageShell";
import { ArrowRight, Terminal } from "lucide-react";
import { about } from "@/data/about";
import { motion, Variants } from "framer-motion";
import {
  CyberCodeTerminalWindow,
  CyberCodeTerminalLine,
  Typewriter,
  CyberCodeButton,
} from "@/components/cybercode/CyberCodeUIKit";

export default function About() {
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
    <PageShell theme="red">
      <SeoHead
        title="About | Corbin Meier"
        description="A journey from theoretical computer science to hands-on software architecture, driven by a relentless pursuit of digital craftsmanship."
        path="/about"
      />
      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="page-container"
      >
        <motion.header variants={item} className="w-full mb-12 text-left">
          <CyberCodeTerminalLine prompt=">" className="mb-2">
            <Typewriter as="span">cat /profile/about.dat</Typewriter>
          </CyberCodeTerminalLine>
          <h1 className="text-h1 font-serif mb-6">
            <Typewriter as="span">{about.heroHeading}</Typewriter>
          </h1>
          <p className="text-narrative">
            <Typewriter as="span">{about.heroSubhead}</Typewriter>
          </p>
        </motion.header>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <motion.div variants={item} className="w-full lg:w-[384px] lg:sticky lg:top-16 flex-none mx-auto lg:mx-0">
            <CyberCodeTerminalWindow title="corbin.jpg" icon={<Terminal className="w-3 h-3" />} collapsible>
              <div className="relative aspect-square -m-6 overflow-hidden">
                <img
                  src="/corbin.jpg"
                  alt="Corbin Meier"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </CyberCodeTerminalWindow>
            <CyberCodeTerminalWindow
              title="whoami.sh"
              icon={<Terminal className="w-3 h-3" />}
              showDots={false}
              className="mt-6"
            >
              <CyberCodeTerminalLine output className="mb-0">
                <span className="text-accent">{about.sidebarLabel}</span>
              </CyberCodeTerminalLine>
              <div className="h-px bg-border w-full my-3" />
              <CyberCodeTerminalLine output className="mb-0 italic">
                &quot;{about.sidebarQuote}&quot;
              </CyberCodeTerminalLine>
            </CyberCodeTerminalWindow>
          </motion.div>

          <motion.div variants={item} className="flex-1 w-full text-foreground">
            {about.sections.map((section, i) => (
              <CyberCodeTerminalWindow
                key={section.heading}
                title={`LOG_${String(i + 1).padStart(2, "0")}.log`}
                icon={<Terminal className="w-3 h-3" />}
                showDots={false}
                className={section.panelClassName ?? "mb-12"}
              >
                <h2 className={section.headingClassName ?? "text-h2 font-mono mb-6"}>
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className={`text-lg text-muted-foreground leading-relaxed${index < section.paragraphs.length - 1 ? " mb-6" : ""}`}
                  >
                    {paragraph}
                  </p>
                ))}
              </CyberCodeTerminalWindow>
            ))}

            <CyberCodeTerminalWindow title="EOF" icon={<Terminal className="w-3 h-3" />} showDots={false} className="text-left">
              <h2 className={about.closingSection.headingClassName}>
                {about.closingSection.heading}
              </h2>
              <p className="text-muted-foreground mb-6">
                {about.closingSection.paragraphs[0]}{" "}
                <span className="font-bold text-foreground underline decoration-accent decoration-2 underline-offset-4">{about.closingSection.boldFragment}</span>{" "}
                {about.closingSection.paragraphs[1]}
              </p>
              <CyberCodeTerminalLine prompt=">" className="mb-4">
                initiate_contact --propose
              </CyberCodeTerminalLine>
              <div className="flex justify-start">
                <CyberCodeButton
                  to={about.closingSection.ctaHref}
                  className="inline-flex items-center gap-2 px-8 py-4"
                >
                  {about.closingSection.ctaLabel}
                  <ArrowRight className="w-4 h-4" />
                </CyberCodeButton>
              </div>
            </CyberCodeTerminalWindow>
          </motion.div>
        </div>
      </motion.main>
    </PageShell>
  );
}
