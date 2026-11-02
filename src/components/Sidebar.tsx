"use client";

import { Link } from "react-router";
import { useRoutePath } from "@/hooks/useRoutePath";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FileCode2, Home, Save, Wrench } from "lucide-react";
import { site } from "@/data/site";
import { CyberCodeButton } from "@/components/cybercode/CyberCodeUIKit";
import { useAnimatedAccent } from "@/hooks/useAnimatedAccent";
import { bellEase } from "@/lib/theme";

const ICONS = [Home, FileCode2, Wrench, Wrench];

export default function Sidebar() {
  const pathname = useRoutePath();
  const items = [{ name: "Home", href: "/" }, ...site.navItems];
  const activeColor = useAnimatedAccent(pathname);

  return (
    <aside className="hidden desktop:flex fixed top-0 left-0 bottom-0 z-40 w-60 flex-col border-r border-border bg-background">
      <Link to="/" className="flex items-center gap-3 px-6 py-6 border-b border-border group">
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

      <nav className="relative flex-1 px-3 py-6 space-y-1">
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
                  layoutId="sidebar-nav-pill"
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

      <div className="p-4 border-t border-border flex justify-center">
        <CyberCodeButton
          to="/contact"
          className="w-full"
        >
          <Save className="w-4 h-4" />
          {site.contactCtaLabel}
        </CyberCodeButton>
      </div>
    </aside>
  );
}
