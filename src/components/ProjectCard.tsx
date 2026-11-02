import React, { useRef, useState } from "react";
import { Link } from "react-router";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ExternalLink, Code2 } from "lucide-react";
import { 
  IconBrandGithub, 
  IconBrandPhp, 
  IconBrandPython, 
  IconBrandFlutter, 
  IconBrandTypescript, 
  IconBrandReact 
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { CyberCodeTerminalWindow } from "@/components/cybercode/CyberCodeUIKit";
import LazyImage from "./LazyImage";

export type Project = {
  title: string;
  slug: string;
  year: number;
  date?: string;
  skills?: string[];
  "public-url"?: string;
  "original-url"?: string;
  links?: { label: string; url: string }[];
  description?: string;
  body?: string;
  images?: { src: string; label?: string }[];
  archived?: boolean;
  hidden?: boolean;
  extension?: string;
  beforeAfter?: {
    before: {
      title: string;
      description: string;
      image?: string;
    };
    after: {
      title: string;
      description: string;
      image?: string;
    };
  };
};


function getProjectIcon(extension?: string) {
  switch (extension) {
    case "php":
      return <IconBrandPhp className="w-4 h-4 text-accent" />;
    case "py":
      return <IconBrandPython className="w-4 h-4 text-accent" />;
    case "dart":
      return <IconBrandFlutter className="w-4 h-4 text-accent" />;
    case "ts":
      return <IconBrandTypescript className="w-4 h-4 text-accent" />;
    case "tsx":
      return <IconBrandReact className="w-4 h-4 text-accent" />;
    default:
      return <Code2 className="w-4 h-4 text-accent" />;
  }
}

export default function ProjectCard({
  project,
  href,
  onClick,
  className,
}: {
  project: Project;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // Mouse tracking for the glow effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const content = (
    <div 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative h-full flex flex-col group"
    >
      <CyberCodeTerminalWindow
        title={`${project.slug}.${project.extension || "sh"}`}
        icon={getProjectIcon(project.extension)}
        showDots={false}
        className="h-full border-border bg-card transition-all duration-500 group-hover:border-accent/50 relative"
      >
        {/* Glow Effect */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: useTransform(
              [mouseX, mouseY],
              ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, var(--accent), transparent 40%)`
            ),
            opacity: hovered ? 0.15 : 0,
          }}
        />

        <div className="relative -mx-6 -mt-6 aspect-video overflow-hidden bg-muted/20 flex items-center justify-center border-b border-border/50">
          {project.images?.[0] ? (
            <LazyImage
              src={project.images[0].src}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
              <Code2 className="w-12 h-12" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Source View</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
             <div className="flex gap-2">
                {project["public-url"]?.includes("github.com") && (
                  <div className="p-2 rounded-full bg-background/90 text-foreground shadow-none">
                    <IconBrandGithub className="w-4 h-4" />
                  </div>
                )}
                <div className="p-2 rounded-full bg-accent text-white">
                  <ExternalLink className="w-4 h-4" />
                </div>
             </div>
          </div>
        </div>

        <div className="flex-1 pt-6 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2 mb-4">
            <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-[0.2em]">{project.date || project.year}</span>
            <div className="flex flex-wrap gap-2 min-w-0">
              {project.skills?.slice(0, 3).map(skill => (
                <span key={skill} className="px-2.5 py-1 rounded-md bg-muted/5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground border border-border/50">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <h3 className="text-h3 font-serif group-hover:text-accent transition-colors mb-3 text-left">
            {project.title}
          </h3>
          <p className="text-muted leading-relaxed line-clamp-2 text-left">
            {project.description}
          </p>
        </div>
      </CyberCodeTerminalWindow>
    </div>
  );

  const baseClass = cn("block text-left transition-all duration-300 w-full", className);

  if (href) {
    return (
      <Link to={href} className={baseClass}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} type="button" className={baseClass}>
      {content}
    </button>
  );
}
