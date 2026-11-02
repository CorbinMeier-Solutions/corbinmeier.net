import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, FileText, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CyberCodeTerminalWindow } from "@/components/cybercode/CyberCodeUIKit";

export type FaqSource = {
  label: string;
  url: string;
};

export type FaqStat = {
  value: string;
  label: string;
};

export type FaqEntry = {
  id: string;
  logId: string;
  question: string;
  date?: string;
  tag?: string;
  answer: string;
  stat?: FaqStat | null;
  sources?: FaqSource[];
};

export type FaqCategory = {
  slug: string;
  title: string;
  logPath: string;
  description?: string;
  entries: FaqEntry[];
};

function FaqLogEntry({ entry, categorySlug }: { entry: FaqEntry; categorySlug: string }) {
  const [open, setOpen] = useState(false);
  const filename = `${entry.logId}_${entry.id}.log`;
  const sources = (entry.sources ?? []).filter((s) => s.label && s.url);

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
        <FileText className={cn("w-4 h-4 shrink-0", open ? "text-accent" : "text-accent/70")} />
        <span className="text-muted/70 hidden tablet:inline">{categorySlug}/</span>
        <span className="font-bold text-foreground">{filename}</span>
        <span className="hidden tablet:inline text-muted truncate flex-1">{entry.question}</span>
        <span className="ml-auto flex items-center gap-3 shrink-0 pl-3 text-[10px] uppercase tracking-widest">
          {entry.tag && (
            <span className="px-2 py-0.5 rounded bg-accent/15 text-accent font-bold border border-accent/20">
              {entry.tag}
            </span>
          )}
          {entry.date && <span className="hidden tablet:inline text-muted/60">{entry.date}</span>}
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
            <div className="px-4 pb-6 pl-11 space-y-4 border-l border-accent/20 ml-[1.15rem]">
              <p className="pt-2 font-mono text-sm font-bold text-foreground tablet:hidden">
                {entry.question}
              </p>

              <div
                className="faq-answer text-sm text-muted leading-relaxed max-w-none"
                dangerouslySetInnerHTML={{ __html: entry.answer }}
              />

              {entry.stat && (
                <div className="inline-flex items-baseline gap-3 rounded-lg border border-accent/20 bg-accent/10 px-4 py-3">
                  <span className="font-mono text-2xl font-bold text-accent">{entry.stat.value}</span>
                  <span className="text-xs text-muted uppercase tracking-widest">{entry.stat.label}</span>
                </div>
              )}

              <div className="flex items-start gap-2 pt-1 font-mono text-[10px] uppercase tracking-widest text-muted/60">
                <Link2 className="w-3 h-3 shrink-0 mt-0.5" />
                <span className="shrink-0">{sources.length > 1 ? "Sources:" : "Source:"}</span>
                {sources.length > 0 ? (
                  <span className="flex flex-wrap gap-x-3 gap-y-1 normal-case tracking-normal">
                    {sources.map((s) => (
                      <a
                        key={s.url}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        {s.label}
                      </a>
                    ))}
                  </span>
                ) : (
                  <span className="italic normal-case tracking-normal">pending citation</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqLog({ category }: { category: FaqCategory }) {
  return (
    <CyberCodeTerminalWindow
      title={`cat ${category.logPath}`}
      showDots={false}
      bodyClassName="p-0"
      className="w-full"
    >
      <p className="px-4 pt-3 pb-1 font-mono text-[10px] uppercase tracking-widest text-muted">
        total {category.entries.length}
      </p>
      <div>
        {category.entries.map((entry) => (
          <FaqLogEntry key={entry.id} entry={entry} categorySlug={category.slug} />
        ))}
      </div>
    </CyberCodeTerminalWindow>
  );
}
