import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useThemeTransition } from "@/hooks/useThemeTransition";
import type { ThemeName } from "@/lib/theme";

/**
 * Shared page-level root: owns the top clearance needed to sit below the
 * fixed mobile header. The ambient background (`ConsoleBackdrop`) mounts once
 * at the app level (`src/App.tsx`), not here, so it survives client-side
 * route changes instead of restarting per page (#31). Every page renders
 * exactly one of these as its root, smoothly transitioning the document's
 * color palette to match.
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

  return <div className={cn("relative min-h-screen pt-16 lg:pt-6 pb-10", className)}>{children}</div>;
}
