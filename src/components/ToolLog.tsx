import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Folder, FolderOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CyberCodeTerminalWindow, CyberCodeWindowChrome } from "@/components/cybercode/CyberCodeUIKit";
import LazyImage from "./LazyImage";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

export type Tool = {
  name: string;
  slug: string;
  category?: string;
  status?: string;
  date?: string;
  tagline?: string;
  description?: string;
  images?: { src: string; label?: string; caption?: string }[];
};

function ToolImageModal({
  tool,
  activeIndex,
  onClose,
  onNavigate,
}: {
  tool: Tool;
  activeIndex: number;
  onClose: () => void;
  onNavigate: (direction: number) => void;
}) {
  const images = tool.images || [];
  const image = images[activeIndex];
  const hasNav = images.length > 1;

  // Mounted only while the lightbox is open, so the lock runs for its lifetime.
  useBodyScrollLock(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate(1);
      if (e.key === "ArrowLeft") onNavigate(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNavigate]);

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/95"
      />

      {hasNav && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(-1); }}
            aria-label="Previous image"
            className="hidden sm:flex absolute left-2 xl:left-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-background/60 hover:bg-background/90 border border-white/10 rounded-full transition-all items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(1); }}
            aria-label="Next image"
            className="hidden sm:flex absolute right-2 xl:right-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-background/60 hover:bg-background/90 border border-white/10 rounded-full transition-all items-center justify-center"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
      >
        <CyberCodeWindowChrome
          title={`${tool.slug}.${image.label ? image.label.toLowerCase().replace(/\s+/g, "-") : "img"}`}
          showDots={true}
          onDotClick={onClose}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="relative w-full bg-muted/20 flex items-center justify-center">
            <LazyImage
              src={image.src}
              alt={`${tool.name} ${image.label || ""}`}
              className="w-full max-h-[60vh]"
              imgClassName="w-full max-h-[60vh] object-contain"
              priority={true}
            />
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 border border-white/10 rounded-full text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-2">
            {image.label && (
              <h3 className="font-mono font-bold text-foreground uppercase tracking-wider text-sm">
                {image.label}
              </h3>
            )}
            {image.caption && (
              <p className="text-sm text-muted leading-relaxed">{image.caption}</p>
            )}
            {hasNav && (
              <p className="pt-2 text-[10px] font-mono text-muted/60 uppercase tracking-widest">
                {activeIndex + 1} / {images.length}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ToolLogEntry({ tool }: { tool: Tool }) {
  const [open, setOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const navigateImage = useCallback((direction: number) => {
    const total = tool.images?.length || 0;
    if (total === 0) return;
    setActiveImageIndex((prev) => {
      if (prev === null) return prev;
      const next = (prev + direction + total) % total;
      return next;
    });
  }, [tool.images]);

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3 text-left font-mono text-sm hover:bg-accent/5 transition-colors"
      >
        <ChevronRight
          className={cn("w-3.5 h-3.5 shrink-0 text-muted transition-transform duration-200", open && "rotate-90 text-accent")}
        />
        {open ? (
          <FolderOpen className="w-4 h-4 shrink-0 text-accent" />
        ) : (
          <Folder className="w-4 h-4 shrink-0 text-accent/70" />
        )}
        <span className="font-bold text-foreground">{tool.name}/</span>
        {tool.tagline && (
          <span className="hidden md:inline text-muted truncate flex-1">{tool.tagline}</span>
        )}
        <span className="ml-auto flex items-center gap-3 shrink-0 pl-3 text-[10px] uppercase tracking-widest">
          {tool.category && <span className="hidden sm:inline text-muted">{tool.category}</span>}
          {tool.status && (
            <span className="px-2 py-0.5 rounded bg-accent/15 text-accent font-bold border border-accent/20">
              {tool.status}
            </span>
          )}
          {tool.date && <span className="hidden sm:inline text-muted/60">{tool.date}</span>}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-6 pl-11 space-y-6 border-l border-accent/20 ml-[1.15rem]">
              {tool.description && (
                <div
                  className="text-sm text-muted leading-relaxed prose prose-invert prose-sm max-w-none pt-2"
                  dangerouslySetInnerHTML={{ __html: tool.description }}
                />
              )}

              {tool.images && tool.images.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-border/50">
                  <table className="w-full font-mono text-xs">
                    <tbody>
                      {tool.images.map((img, idx) => (
                        <tr key={img.src} className={idx > 0 ? "border-t border-border/30" : undefined}>
                          <td className="w-48 sm:w-56 p-2 align-middle">
                            <button
                              type="button"
                              onClick={() => setActiveImageIndex(idx)}
                              className="relative block w-full overflow-hidden rounded bg-muted/10 cursor-zoom-in transition-opacity hover:opacity-80"
                            >
                              <LazyImage
                                src={img.src}
                                alt={`${tool.name} ${img.label || ""}`}
                                className="w-full h-auto"
                                imgClassName="w-full h-auto object-contain"
                              />
                            </button>
                          </td>
                          <td className="p-2 align-middle">
                            {img.label && (
                              <span className="block font-bold text-foreground uppercase tracking-wider text-[10px] mb-0.5">
                                {img.label}
                              </span>
                            )}
                            {img.caption && <span className="text-muted leading-relaxed">{img.caption}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeImageIndex !== null && (
          <ToolImageModal
            tool={tool}
            activeIndex={activeImageIndex}
            onClose={() => setActiveImageIndex(null)}
            onNavigate={navigateImage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ToolLog({ tools }: { tools: Tool[] }) {
  return (
    <CyberCodeTerminalWindow
      title="ls -la ./tools/"
      showDots={false}
      bodyClassName="p-0"
      className="w-full"
    >
      <p className="px-4 pt-3 pb-1 font-mono text-[10px] uppercase tracking-widest text-muted">
        total {tools.length}
      </p>
      <div>
        {tools.map((tool) => (
          <ToolLogEntry key={tool.slug} tool={tool} />
        ))}
      </div>
    </CyberCodeTerminalWindow>
  );
}
