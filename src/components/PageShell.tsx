import type { ReactNode } from "react";
import ConsoleBackdrop from "@/components/ConsoleBackdrop";
import { cn } from "@/lib/utils";
import { useThemeTransition } from "@/hooks/useThemeTransition";
import type { ThemeName } from "@/lib/theme";

/**
 * Shared page-level root: owns the top clearance needed to sit below the
 * fixed mobile header and the ambient background layer. Every page renders exactly one of these
 * as its root, smoothly transitioning the document's color palette to match.
 */
export default function PageShell({
  children,
  className,
  theme = "blue",
}: {
  children: ReactNode;
  className?: string;
  theme?: ThemeName;
}) {
  useThemeTransition(theme);

  return (
    <div className={cn("relative min-h-screen pt-16 lg:pt-6 pb-10", className)}>
      <ConsoleBackdrop />
      {children}
    </div>
  );
}
