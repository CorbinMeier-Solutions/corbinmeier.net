import { useId } from "react";

const VARIANT_GLOW: Record<"blue", { fg: string; bg: string; text: string; shadow: string }> = {
  blue: {
    fg: "rgba(120,170,255,0.85)",
    bg: "radial-gradient(circle at 50% 30%, #11213a 0%, #060a14 70%, #0a0e17 100%)",
    text: "rgba(59,130,246,1)",
    shadow: "rgba(32,80,153,0.8)",
  },
};

export interface CrtNotFoundProps {
  /** Error code shown in the heading, e.g. "404". */
  errorCode?: string;
  /** Heading text preceding the error code. */
  title?: string;
  /** Body lines rendered as separate terminal-style output paragraphs. */
  lines?: string[];
  backLabel?: string;
  backHref?: string;
  homeLabel?: string;
  homeHref?: string;
  variant?: "blue";
  className?: string;
}

export default function CrtNotFound({
  errorCode = "404",
  title = "Error",
  lines = [
    "The page you are looking for might have been removed, had its name changed or is temporarily unavailable.",
    "Good luck.",
  ],
  backLabel = "go back",
  backHref = "#",
  homeLabel = "return to the homepage",
  homeHref = "/",
  variant = "blue",
  className = "",
}: CrtNotFoundProps) {
  const uid = useId().replace(/:/g, "");
  const palette = VARIANT_GLOW[variant];

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden font-mono uppercase ${className}`}
      style={{ background: palette.bg, color: palette.fg, textShadow: `0 0 1ex ${palette.text}, 0 0 2px rgba(255,255,255,0.8)` }}
    >
      <div className={`crt-noise-${uid} pointer-events-none absolute inset-0 z-0 opacity-[0.04]`} />
      <div className={`crt-scan-${uid} pointer-events-none absolute inset-0 z-10`} />

      <div className="relative z-20 mx-auto max-w-2xl px-8 py-16 tablet:px-16">
        <h1 className="text-3xl tablet:text-4xl">
          {title} <span className="text-white">{errorCode}</span>
        </h1>

        {lines.map((line, i) => (
          <p key={i} className="crt-output mt-4 text-base tablet:text-lg" style={{ color: palette.fg }}>
            {line}
          </p>
        ))}

        <p className="crt-output mt-4 text-base tablet:text-lg" style={{ color: palette.fg }}>
          Please try to{" "}
          <a href={backHref} className="crt-link text-white no-underline">
            {backLabel}
          </a>{" "}
          or{" "}
          <a href={homeHref} className="crt-link text-white no-underline">
            {homeLabel}
          </a>
          .
        </p>
      </div>

      <style>{`
        .crt-noise-${uid} {
          background-image: repeating-linear-gradient(
              0deg,
              rgba(255, 255, 255, 0.06) 0px,
              rgba(255, 255, 255, 0.06) 1px,
              transparent 1px,
              transparent 2px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.06) 0px,
              rgba(255, 255, 255, 0.06) 1px,
              transparent 1px,
              transparent 2px
            );
        }
        .crt-scan-${uid} {
          background: repeating-linear-gradient(
            180deg,
            rgba(0, 0, 0, 0) 0,
            rgba(0, 0, 0, 0.3) 50%,
            rgba(0, 0, 0, 0) 100%
          );
          background-size: auto 4px;
        }
        .crt-scan-${uid}::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(
            0deg,
            transparent 0%,
            ${palette.shadow} 2%,
            ${palette.shadow} 3%,
            ${palette.shadow} 3%,
            transparent 100%
          );
          background-repeat: no-repeat;
          animation: crt-scan-move-${uid} 7.5s linear 0s infinite;
        }
        @keyframes crt-scan-move-${uid} {
          0% {
            background-position: 0 -100vh;
          }
          35%,
          100% {
            background-position: 0 100vh;
          }
        }
        .crt-output::before {
          content: "> ";
        }
        .crt-link::before {
          content: "[";
        }
        .crt-link::after {
          content: "]";
        }
      `}</style>
    </div>
  );
}
