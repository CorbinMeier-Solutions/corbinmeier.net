import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import DataTable from "@/components/DataTable";
import LazyImage from "./LazyImage";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import type { WorkshopEntry, WorkshopImage } from "@/data/types";

function EntryImageModal({
  entry,
  images,
  activeIndex,
  onClose,
  onNavigate,
}: {
  entry: WorkshopEntry;
  images: WorkshopImage[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (direction: number) => void;
}) {
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
        <div className="flex-1 overflow-y-auto">
          <div className="relative w-full bg-muted/20 flex items-center justify-center">
            <LazyImage
              src={image.src}
              alt={`${entry.name} ${image.label || ""}`}
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

type SpecRow = { field: string; value: string };

function specRows(entry: WorkshopEntry): SpecRow[] {
  const rows: SpecRow[] = [
    { field: "The problem", value: entry.problem },
    { field: "What was built", value: entry.built },
  ];
  if (entry.stack) rows.push({ field: "Stack", value: entry.stack });
  if (entry.replaced) rows.push({ field: "What it replaced", value: entry.replaced });
  return rows;
}

function WorkshopEntryCard({ entry }: { entry: WorkshopEntry }) {
  const images = entry.images ?? [];
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const navigateImage = useCallback((direction: number) => {
    if (images.length === 0) return;
    setActiveImageIndex((prev) => {
      if (prev === null) return prev;
      return (prev + direction + images.length) % images.length;
    });
  }, [images.length]);

  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-h3 text-foreground">{entry.name}</h3>
          {entry.tagline && <p className="text-sm text-muted mt-1">{entry.tagline}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0 text-[10px] font-mono uppercase tracking-widest">
          {entry.status && (
            <span className="px-2 py-0.5 rounded bg-accent/15 text-accent font-bold border border-accent/20">
              {entry.status}
            </span>
          )}
          {entry.date && <span className="text-muted/60">{entry.date}</span>}
        </div>
      </header>

      <DataTable
        columns={[
          { key: "field", label: "Spec", render: (row) => row.field, className: "w-40 font-mono text-xs uppercase tracking-widest text-muted" },
          { key: "value", label: "Detail", render: (row) => row.value },
        ]}
        rows={specRows(entry)}
        rowKey={(row) => row.field}
      />

      {images.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border/50">
          <table className="w-full font-mono text-xs">
            <tbody>
              {images.map((img, idx) => (
                <tr key={img.src} className={idx > 0 ? "border-t border-border/30" : undefined}>
                  <td className="w-48 sm:w-56 p-2 align-middle">
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className="relative block w-full overflow-hidden rounded bg-muted/10 cursor-zoom-in transition-opacity hover:opacity-80"
                    >
                      <LazyImage
                        src={img.src}
                        alt={`${entry.name} ${img.label || ""}`}
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

      <AnimatePresence>
        {activeImageIndex !== null && (
          <EntryImageModal
            entry={entry}
            images={images}
            activeIndex={activeImageIndex}
            onClose={() => setActiveImageIndex(null)}
            onNavigate={navigateImage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/** Full-specs listing for one Workshop category: every entry rendered open,
 *  since there are no per-entry pages yet (waits on prerendering, #12). */
export default function WorkshopLog({ entries, emptyNote }: { entries: WorkshopEntry[]; emptyNote: string }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted italic">{emptyNote}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {entries.map((entry) => (
        <WorkshopEntryCard key={entry.slug} entry={entry} />
      ))}
    </div>
  );
}
