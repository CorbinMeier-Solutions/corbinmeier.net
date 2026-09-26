import type { ReactNode } from "react";
import Typewriter from "@/components/cybercode/Typewriter";
import { CyberCodeTerminalLine } from "@/components/cybercode/CyberCodeUIKit";
import { cn } from "@/lib/utils";

interface PageSectionProps {
  /** The `> cat /x.dat`-style terminal line above the heading. Page-header
   *  use only - omit it for a mid-page section. */
  prompt?: ReactNode;
  eyebrow?: ReactNode;
  heading: ReactNode;
  /** 1 for a page's own <header>, 2 (default) for a section further down the
   *  page. Only the h1 in the page header ever reveals - see `reveal`. */
  headingLevel?: 1 | 2;
  lead?: ReactNode;
  /** Wraps the prompt/eyebrow/heading/lead in the site's text-reveal
   *  Typewriter effect. Per docs/style_guide.md's motion rule this belongs
   *  only on a page's own header (headingLevel 1) - default off. */
  reveal?: boolean;
  children?: ReactNode;
  className?: string;
  headerClassName?: string;
}

/** Shared page-section shell: eyebrow, heading, lead description, then
 *  children - the spacing scale in src/globals.css (.page-header-gap for a
 *  page's own header, .section-gap between sections further down). Every
 *  page adopts this in place of its own hand-rolled header/section markup. */
export default function PageSection({
  prompt,
  eyebrow,
  heading,
  headingLevel = 2,
  lead,
  reveal = false,
  children,
  className,
  headerClassName,
}: PageSectionProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const headingClass = headingLevel === 1 ? "text-h1 font-serif mb-6" : "text-h2 font-serif mb-3";
  const gapClass = headingLevel === 1 ? "page-header-gap" : "section-gap";

  const wrap = (node: ReactNode) =>
    reveal ? <Typewriter as="span">{node}</Typewriter> : node;

  return (
    <section className={cn("w-full", gapClass, className)}>
      <header className={cn("w-full text-left", headerClassName)}>
        {prompt && (
          <CyberCodeTerminalLine prompt=">" className="mb-2">
            {wrap(prompt)}
          </CyberCodeTerminalLine>
        )}
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
            {wrap(eyebrow)}
          </p>
        )}
        <Heading className={headingClass}>{wrap(heading)}</Heading>
        {lead && <p className="text-narrative mb-4">{wrap(lead)}</p>}
      </header>
      {children}
    </section>
  );
}
