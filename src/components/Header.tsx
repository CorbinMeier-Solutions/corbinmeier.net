"use client";

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, Home, FileCode2, FolderOpen, Save, Wrench } from "lucide-react";
import { site } from "@/data/site";
import { CyberCodeButton } from "@/components/cybercode/CyberCodeUIKit";
import { useAnimatedAccent } from "@/hooks/useAnimatedAccent";
import { bellEase } from "@/lib/theme";

const ICONS = [Home, FileCode2, Wrench, Wrench];

export default function Header() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = [{ name: "Home", href: "/" }, ...site.navItems];
  const activeColor = useAnimatedAccent(pathname);

  // Close the mobile menu on browser back/forward. In-app navigation closes it
  // from the link handlers below, so the drawer keeps its slide-out animation.
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, []);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="desktop:hidden fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-end">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-controls="mobile-nav-menu"
          className="glass-panel flex items-center justify-center w-11 h-11 rounded-lg border border-[var(--accent)] hover:shadow-[0_0_12px_rgba(59,130,246,0.35)] transition-shadow"
          style={{ color: "var(--accent)" }}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <FolderOpen className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              id="mobile-nav-menu"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-60 flex flex-col border-r border-border bg-background"
            >
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-6 border-b border-border group"
              >
                <div className="relative w-9 h-9 overflow-hidden rounded-full border border-border transition-transform group-hover:scale-105">
                  <img
                    src="/corbin.jpg"
                    alt="Corbin Meier"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <span className="font-serif text-base tracking-tight truncate">{site.brandName}</span>
              </Link>

              <nav className="relative flex-1 px-3 py-6 space-y-1" onClick={() => setMenuOpen(false)}>
                <p className="px-3 mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">// nav</p>
                {items.map((item, index) => {
                  const Icon = ICONS[index] ?? FileCode2;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-2 rounded-lg font-mono text-sm border-l-2 border-transparent transition-colors",
                        !active && "text-muted hover:text-foreground hover:bg-muted/5"
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId="mobile-nav-pill"
                          className="absolute inset-0 rounded-lg border-l-2"
                          style={{ borderColor: activeColor, backgroundColor: "var(--accent-soft)" }}
                          transition={{ type: "tween", duration: 0.6, ease: bellEase }}
                        />
                      )}
                      {active ? (
                        <motion.span style={{ color: activeColor }} className="relative flex items-center gap-3">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.name.toLowerCase()}</span>
                        </motion.span>
                      ) : (
                        <>
                          <Icon className="relative w-4 h-4 shrink-0" />
                          <span className="relative truncate">{item.name.toLowerCase()}</span>
                        </>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border flex justify-center" onClick={() => setMenuOpen(false)}>
                <CyberCodeButton to="/contact" className="w-full">
                  <Save className="w-4 h-4" />
                  {site.contactCtaLabel}
                </CyberCodeButton>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
