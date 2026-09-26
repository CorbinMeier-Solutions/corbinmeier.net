import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
  ElementType,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useRevealOnScroll } from "./useCyberCodeEffects";

/**
 * CyberCode UI Kit - neon terminal/IDE-flavored primitives: windows, code
 * blocks, stat cards, skill bars, project cards, form fields, and buttons.
 * Every accent-driven color reads from CSS custom properties set per
 * instance, so multiple accents can coexist on one page. Pair with
 * `CyberCodeStyles` (mounted once near the app root) for the custom
 * keyframe animations (glitch, blink, float) used below, and with
 * `CyberCodeBackdrops.tsx` for canvas/cursor decorations.
 */

/**
 * Only two channels: "primary" (Signal Blue, the site's sole accent - used
 * for nearly everything) and "danger" (Alert Red, reserved for genuine error
 * states only - see .claude/rules/style.md). Both read from the global theme
 * tokens in globals.css, so a future palette change propagates automatically
 * instead of drifting out of sync with a second hardcoded palette.
 */
export type CyberAccent = "primary" | "danger";

const ACCENT: Record<CyberAccent, { text: string; border: string; glow: string; soft: string }> = {
  primary: {
    text: "var(--accent)",
    border: "rgba(var(--accent-rgb), 0.35)",
    glow: "var(--accent-glow)",
    soft: "var(--accent-soft)",
  },
  danger: {
    text: "var(--danger)",
    border: "rgba(var(--danger-rgb), 0.35)",
    glow: "var(--danger-glow)",
    soft: "var(--danger-soft)",
  },
};

function cx(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}

function accentVars(accent: CyberAccent): CSSProperties {
  const a = ACCENT[accent];
  return {
    ["--cc-text" as string]: a.text,
    ["--cc-border" as string]: a.border,
    ["--cc-glow" as string]: a.glow,
    ["--cc-soft" as string]: a.soft,
  } as CSSProperties;
}

/* ------------------------------------------------------------------------ */
/* Global keyframes - mount once near the app root                          */
/* ------------------------------------------------------------------------ */

/** Injects the @keyframes used by glitch/blink/float utilities below. Mount once, e.g. in App.tsx. */
export function CyberCodeStyles() {
  return (
    <style>{`
      @keyframes cc-glitch-skew { 0%,100%{transform:skew(0)} 20%{transform:skew(0)} 21%{transform:skew(1deg)} 22%{transform:skew(0)} }
      @keyframes cc-glitch-slice-a { 0%{transform:translate(0)} 20%{transform:translate(-3px,3px)} 40%{transform:translate(-3px,-3px)} 60%{transform:translate(3px,3px)} 80%{transform:translate(3px,-3px)} 100%{transform:translate(0)} }
      @keyframes cc-blink { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes cc-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      @keyframes cc-code-drift { 0%{transform:translate3d(-8%,20px,0);opacity:0} 18%,82%{opacity:1} 100%{transform:translate3d(18%,-70px,0);opacity:0} }
    `}</style>
  );
}

/* ------------------------------------------------------------------------ */
/* Window chrome - macOS-style traffic-light header                        */
/* ------------------------------------------------------------------------ */

/**
 * Traffic-light dot cluster sitting directly on a bordered panel's top edge,
 * like a terminal window titlebar. Place on a `relative` ancestor - the
 * parent supplies its own border, which the dots sit on top of.
 */
export function CyberCodeSectionLabel({ className }: { className?: string }) {
  return (
    <span className={cx("absolute -top-[5px] left-4 z-10 flex gap-1.5", className)}>
      <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
      <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
      <span className="h-2 w-2 rounded-full bg-[#28c840]" />
    </span>
  );
}

export function CyberCodeWindowChrome({
  title,
  icon,
  showDots = true,
  onDotClick,
  className,
}: {
  title: ReactNode;
  icon?: ReactNode;
  showDots?: boolean;
  onDotClick?: () => void;
  className?: string;
}) {
  const dotColors = ["#ff5f57", "#febc2e", "#28c840"];
  return (
    <div className={cx("flex items-center gap-3 border-b border-border bg-white/5 px-4 py-3", className)}>
      {showDots && (
        <div className="flex gap-1.5">
          {dotColors.map((color) =>
            onDotClick ? (
              <button
                key={color}
                type="button"
                onClick={onDotClick}
                aria-label="Toggle window"
                className="h-2.5 w-2.5 rounded-full transition-transform hover:scale-125"
                style={{ backgroundColor: color }}
              />
            ) : (
              <span key={color} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            )
          )}
        </div>
      )}
      <span className="flex items-center gap-2 truncate font-mono text-xs text-muted">
        {icon}
        {title}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Terminal window + lines                                                  */
/* ------------------------------------------------------------------------ */

export function CyberCodeTerminalWindow({
  title,
  icon,
  accent = "primary",
  showDots = true,
  collapsible = false,
  onDotClick,
  bodyClassName,
  className,
  children,
}: {
  title: ReactNode;
  icon?: ReactNode;
  accent?: CyberAccent;
  showDots?: boolean;
  collapsible?: boolean;
  onDotClick?: () => void;
  bodyClassName?: string;
  className?: string;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const handleDotClick = onDotClick || (collapsible ? () => setCollapsed((c) => !c) : undefined);
  return (
    <div
      className={cx(
        "overflow-hidden rounded-xl border border-border bg-background",
        className
      )}
      style={accentVars(accent)}
    >
      <CyberCodeWindowChrome
        title={title}
        icon={icon}
        showDots={showDots}
        onDotClick={handleDotClick}
      />
      <div
        className={cx(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className={bodyClassName || "p-6"}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export function CyberCodeTerminalLine({
  prompt = "$",
  output = false,
  className,
  children,
}: {
  prompt?: ReactNode;
  output?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("mb-3 font-mono text-sm leading-relaxed", output ? "pl-6 text-muted" : "text-foreground", className)}>
      {!output && (
        <span className="inline-block w-6 text-[var(--cc-text)]" style={{ textShadow: "var(--cc-glow)" }}>
          {prompt}
        </span>
      )}
      {children}
    </div>
  );
}

/** Blinking text cursor, e.g. trailing a typewriter effect. */
export function CyberCodeBlinkCursor({ accent = "primary", className }: { accent?: CyberAccent; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx("text-[var(--cc-text)] [animation:cc-blink_1s_infinite]", className)}
      style={{ ...accentVars(accent), textShadow: "var(--cc-glow)" }}
    >
      |
    </span>
  );
}

/* ------------------------------------------------------------------------ */
/* Glitch heading                                                           */
/* ------------------------------------------------------------------------ */

export function CyberCodeGlitchHeading({
  as = "h2",
  children,
  accent = "primary",
  className,
}: {
  as?: "h1" | "h2" | "h3";
  children: ReactNode;
  accent?: CyberAccent;
  className?: string;
}) {
  const As = as as ElementType;
  return (
    <As
      className={cx(
        "relative inline-block font-black text-foreground [animation:cc-glitch-skew_4s_infinite_linear_alternate-reverse]",
        className
      )}
      style={accentVars(accent)}
    >
      {children}
      <span
        aria-hidden="true"
        className="absolute inset-0 text-[var(--cc-text)] opacity-70 [animation:cc-glitch-slice-a_3s_infinite_linear_alternate-reverse] [clip-path:polygon(0_0,100%_0,100%_35%,0_35%)]"
      >
        {children}
      </span>
    </As>
  );
}

/* ------------------------------------------------------------------------ */
/* Code editor block - tabs + line numbers + code content                   */
/* ------------------------------------------------------------------------ */

export function CyberCodeEditorWindow({
  tabs,
  activeTab = 0,
  lineCount,
  accent = "primary",
  className,
  children,
}: {
  tabs: ReactNode[];
  activeTab?: number;
  lineCount?: number;
  accent?: CyberAccent;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx("overflow-hidden rounded-xl border border-border bg-background", className)}
      style={accentVars(accent)}
    >
      <div className="flex gap-0.5 border-b border-border bg-white/5 px-2 pt-2">
        {tabs.map((tab, index) => (
          <span
            key={index}
            className={cx(
              "rounded-t-md px-4 py-1.5 font-mono text-xs",
              index === activeTab ? "border-t-2 border-[var(--cc-text)] bg-background/80 text-foreground" : "text-muted"
            )}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="flex p-5">
        {lineCount !== undefined && (
          <div
            aria-hidden="true"
            className="mr-5 select-none border-r border-border pr-5 font-mono text-xs leading-7 text-muted"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        )}
        <div className="overflow-x-auto font-mono text-sm leading-7 text-foreground">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Stat card with animated counter                                          */
/* ------------------------------------------------------------------------ */

export function CyberCodeStatCard({
  icon,
  value,
  suffix = "",
  label,
  accent = "primary",
  className,
}: {
  icon?: ReactNode;
  value: number;
  suffix?: string;
  label: string;
  accent?: CyberAccent;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex min-h-[150px] flex-col items-center justify-center rounded-xl border border-border bg-white/5 p-6 text-center transition-transform hover:-translate-y-1",
        className
      )}
      style={accentVars(accent)}
    >
      {icon && (
        <div
          className="mb-2.5 flex h-13 w-13 items-center justify-center rounded-2xl border text-[var(--cc-text)]"
          style={{ borderColor: "var(--cc-border)", background: "var(--cc-soft)" }}
        >
          {icon}
        </div>
      )}
      <div className="text-3xl font-bold text-[var(--cc-text)]" style={{ textShadow: "var(--cc-glow)" }}>
        {value}
        {suffix}
      </div>
      <div className="mt-2 text-xs text-muted">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Skill bar - animates fill into view on scroll                            */
/* ------------------------------------------------------------------------ */

export function CyberCodeSkillBar({
  name,
  level,
  accent = "primary",
  className,
}: {
  name: string;
  level: number;
  accent?: CyberAccent;
  className?: string;
}) {
  const [ref, visible] = useRevealOnScroll<HTMLDivElement>();
  return (
    <div ref={ref} className={cx("grid grid-cols-[minmax(86px,110px)_1fr_42px] items-center gap-3", className)} style={accentVars(accent)}>
      <span className="truncate text-xs text-muted">{name}</span>
      <div className="h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[var(--cc-text)] transition-[width] duration-1000 ease-out"
          style={{ width: visible ? `${level}%` : "0%", boxShadow: "var(--cc-glow)" }}
        />
      </div>
      <span className="text-right text-xs text-[var(--cc-text)]">{level}%</span>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Project card - header/body/footer slots                                  */
/* ------------------------------------------------------------------------ */

export function CyberCodeProjectCard({
  fileName,
  fileIcon,
  tags = [],
  links,
  accent = "primary",
  className,
  children,
}: {
  fileName: ReactNode;
  fileIcon?: ReactNode;
  tags?: string[];
  links?: ReactNode;
  accent?: CyberAccent;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      className={cx(
        "overflow-hidden rounded-xl border border-border bg-white/5 transition-all hover:-translate-y-2",
        className
      )}
      style={accentVars(accent)}
    >
      <CyberCodeWindowChrome title={fileName} icon={fileIcon} />
      <div className="max-h-[250px] overflow-hidden p-5 font-mono text-xs leading-relaxed text-muted">{children}</div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-4">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <CyberCodeTag key={tag} accent={accent}>
              {tag}
            </CyberCodeTag>
          ))}
        </div>
        {links && <div className="flex gap-3">{links}</div>}
      </div>
    </article>
  );
}

export function CyberCodeTag({
  accent = "primary",
  className,
  children,
}: {
  accent?: CyberAccent;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx("rounded border px-2.5 py-1 text-[0.65rem] text-[var(--cc-text)]", className)}
      style={{ ...accentVars(accent), borderColor: "var(--cc-border)", background: "var(--cc-soft)" }}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------------ */
/* Button                                                                    */
/* ------------------------------------------------------------------------ */

const BUTTON_CLASSNAME =
  "inline-flex items-center justify-center gap-2 rounded-md border px-6 py-3 font-mono text-sm text-[var(--cc-text)] transition-all hover:-translate-y-0.5 hover:[text-shadow:var(--cc-glow)]";

/**
 * `to` renders a react-router `Link` styled as this button (for internal
 * navigation CTAs); omit it for an actual `<button type="...">` form action.
 */
export function CyberCodeButton({
  accent = "primary",
  className,
  type = "button",
  children,
  to,
  ...rest
}: {
  accent?: CyberAccent;
  className?: string;
  children: ReactNode;
  to?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const sharedClassName = cx(BUTTON_CLASSNAME, className);
  const sharedStyle = { ...accentVars(accent), borderColor: "var(--cc-text)" };

  if (to) {
    return (
      <Link to={to} className={sharedClassName} style={sharedStyle}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={sharedClassName} style={sharedStyle} {...rest}>
      {children}
    </button>
  );
}

/**
 * `to` renders a react-router `Link` (client-side navigation, internal
 * routes); omit it and pass `href` for external links, which render a plain
 * `<a>`.
 */
export function CyberCodeLinkButton({
  accent = "primary",
  className,
  children,
  to,
  ...rest
}: {
  accent?: CyberAccent;
  className?: string;
  children: ReactNode;
  to?: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const sharedClassName = cx(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3.5 py-2.5 text-xs text-muted no-underline transition-colors hover:text-[var(--cc-text)]",
    className
  );
  const sharedStyle = { ...accentVars(accent), borderColor: "var(--cc-border)", background: "var(--cc-soft)" };

  if (to) {
    return (
      <Link to={to} className={sharedClassName} style={sharedStyle} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a className={sharedClassName} style={sharedStyle} {...rest}>
      {children}
    </a>
  );
}

/* ------------------------------------------------------------------------ */
/* Form field - CLI-style prompt + input/textarea                           */
/* ------------------------------------------------------------------------ */

type FormFieldBase = {
  promptIcon?: ReactNode;
  accent?: CyberAccent;
  className?: string;
};

export function CyberCodeFormField({
  promptIcon,
  accent = "primary",
  className,
  multiline,
  ...rest
}: FormFieldBase &
  (
    | ({ multiline: true } & TextareaHTMLAttributes<HTMLTextAreaElement>)
    | ({ multiline?: false } & InputHTMLAttributes<HTMLInputElement>)
  )) {
  return (
    <div className={cx("flex items-start gap-3", className)} style={accentVars(accent)}>
      <span className="flex min-w-11 items-center justify-center pt-2 text-[var(--cc-text)]">{promptIcon ?? ">"}</span>
      {multiline ? (
        <textarea
          className="min-h-[100px] flex-1 resize-y rounded-md border border-border bg-white/5 p-2.5 font-mono text-sm text-foreground outline-none focus:border-[var(--cc-text)]"
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className="flex-1 rounded-md border border-border bg-white/5 p-2.5 font-mono text-sm text-foreground outline-none focus:border-[var(--cc-text)]"
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Social link - circular icon with hover tooltip                           */
/* ------------------------------------------------------------------------ */

export function CyberCodeSocialLink({
  icon,
  label,
  accent = "primary",
  className,
  ...rest
}: {
  icon: ReactNode;
  label: string;
  accent?: CyberAccent;
  className?: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      aria-label={label}
      className={cx(
        "group relative flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white/5 text-lg text-muted transition-all hover:-translate-y-1 hover:text-[var(--cc-text)]",
        className
      )}
      style={{ ...accentVars(accent), ["--tw-hover-border" as string]: "var(--cc-border)" }}
      {...rest}
    >
      {icon}
      <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-background px-2 py-1 text-[0.7rem] text-muted opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </a>
  );
}

/* ------------------------------------------------------------------------ */
/* Status pill - pulsing dot + label                                        */
/* ------------------------------------------------------------------------ */

export function CyberCodeStatusPill({
  online = true,
  label = "online",
  accent = "primary",
  className,
}: {
  online?: boolean;
  label?: string;
  accent?: CyberAccent;
  className?: string;
}) {
  return (
    <div
      className={cx("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs", className)}
      style={{ ...accentVars(accent), borderColor: "var(--cc-border)", background: "var(--cc-soft)", color: "var(--cc-text)" }}
    >
      <span
        className={cx("h-2 w-2 rounded-full bg-[var(--cc-text)]", online && "animate-pulse")}
        style={{ boxShadow: "var(--cc-glow)" }}
      />
      {label}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Feature link card - icon + title + subtitle + arrow                      */
/* ------------------------------------------------------------------------ */

export function CyberCodeFeatureLinkCard({
  icon,
  eyebrow,
  title,
  subtitle,
  accent = "primary",
  className,
  to,
  ...rest
}: {
  icon?: ReactNode;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  accent?: CyberAccent;
  className?: string;
  to?: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const sharedClassName = cx(
    "grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border p-4.5 no-underline transition-transform hover:-translate-y-1",
    className
  );
  const sharedStyle = {
    ...accentVars(accent),
    borderColor: "var(--cc-border)",
    background: "var(--cc-soft)",
  };
  const content = (
    <>
      {icon && (
        <span
          className="flex h-13.5 w-13.5 items-center justify-center rounded-2xl border text-2xl text-[var(--cc-text)]"
          style={{ borderColor: "var(--cc-border)", background: "var(--cc-soft)" }}
        >
          {icon}
        </span>
      )}
      <span className="flex flex-col gap-1">
        {eyebrow && <span className="text-xs text-muted">{eyebrow}</span>}
        <strong className="text-base text-foreground">{title}</strong>
        {subtitle && <small className="text-xs text-muted">{subtitle}</small>}
      </span>
      <span aria-hidden="true" className="text-lg text-[var(--cc-text)]">
        &#8599;
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={sharedClassName} style={sharedStyle} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <a className={sharedClassName} style={sharedStyle} {...rest}>
      {content}
    </a>
  );
}

export { default as Typewriter } from "./Typewriter";

