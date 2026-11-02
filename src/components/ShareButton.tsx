// standard: share-button@2026-10-30 (endpoints checked 2026-10-30; Facebook and LinkedIn are undocumented but working)
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Check, Link2, Mail, Share2 } from "lucide-react";
import { IconBrandFacebook, IconBrandLinkedin, IconBrandWhatsapp, IconBrandX } from "@tabler/icons-react";
import { buildShareLinks, canonicalShareUrl, supportsNativeShare } from "@/lib/share";

const ICONS = {
  facebook: IconBrandFacebook,
  x: IconBrandX,
  linkedin: IconBrandLinkedin,
  whatsapp: IconBrandWhatsapp,
  email: Mail,
} as const;

const itemClass =
  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-muted hover:text-accent hover:bg-white/5 transition-colors";

export default function ShareButton() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  const onToggle = async () => {
    const title = document.title;
    if (supportsNativeShare(navigator)) {
      try {
        await navigator.share({ title, url: canonicalShareUrl(pathname, "share") });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error(JSON.stringify({ event: "share.native_failed", cause: String(err) }));
      }
    }
    setOpen((o) => !o);
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(canonicalShareUrl(pathname, "copy"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error(JSON.stringify({ event: "share.copy_failed", cause: String(err) }));
    }
  };

  const links = buildShareLinks(pathname, typeof document === "undefined" ? "" : document.title);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Share this page"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={onToggle}
        className="group flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white/5 text-muted transition-all hover:-translate-y-1 hover:text-accent"
      >
        <Share2 className="w-5 h-5" />
      </button>
      {open && (
        <div
          role="group"
          aria-label="Share this page"
          className="absolute bottom-full left-0 z-20 mb-2 w-52 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-background p-2 shadow-lg"
        >
          {links.map(({ platform, label, href }) => {
            const Icon = ICONS[platform];
            return (
              <a key={platform} href={href} target="_blank" rel="noopener noreferrer" className={itemClass}>
                <Icon className="w-5 h-5" />
                {label}
              </a>
            );
          })}
          <button type="button" onClick={onCopy} className={`${itemClass} w-full text-left`}>
            {copied ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
            Copy link
          </button>
          <p role="status" className="px-3 text-xs text-accent min-h-4">
            {copied ? "Link copied" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
