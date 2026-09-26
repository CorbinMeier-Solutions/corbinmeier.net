import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import SeoHead from "@/components/SeoHead";
import PageShell from "@/components/PageShell";
import { motion, Variants } from "framer-motion";
import { Mail, MapPin, Clock, Mailbox, Save, Bot, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CloudflareTurnstile } from "@/components/CloudflareTurnstile";
import { contact } from "@/data/contact";
import { homeHero } from "@/data/home";
import { turnstileSiteKey } from "@/data/turnstile";
import type { ContactInfoItem } from "@/data/types";
import { CyberCodeTerminalWindow, CyberCodeButton, Typewriter, CyberCodeTerminalLine } from "@/components/cybercode/CyberCodeUIKit";

const CONTACT_ICONS: Record<ContactInfoItem["icon"], LucideIcon> = {
  Mail,
  MapPin,
  Mailbox,
  Clock,
};

export default function Contact() {
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get("subject") || "";
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    subject: initialSubject,
    message: "",
  });

  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [turnstileStatus, setTurnstileStatus] = useState<"verifying" | "verified" | "expired" | "error">("verifying");
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  function getValidationError(field: "firstName" | "email" | "phone" | "subject" | "message") {
    if (!touched[field] && !submitted) return null;
    const value = form[field].trim();
    if (field === "firstName" || field === "subject" || field === "message") {
      if (!value) return "[INPUT REQUIRED]";
    }
    if (field === "email") {
      if (!value) return "[INPUT REQUIRED]";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "[INVALID EMAIL]";
    }
    if (field === "phone") {
      if (value) {
        const phoneDigits = value.replace(/\D/g, "");
        if (phoneDigits.length < 7 || phoneDigits.length > 15) return "[INVALID NUMBER]";
      }
    }
    return null;
  }

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setStatus(null);

    if (
      getValidationError("firstName") ||
      getValidationError("email") ||
      getValidationError("phone") ||
      getValidationError("subject") ||
      getValidationError("message")
    ) {
      setStatus({
        ok: false,
        message: contact.validation.missingFields,
      });
      return;
    }

    if (!turnstileToken) {
      // "verified" is absent by design: reaching here means no token was issued.
      const messages: Partial<Record<typeof turnstileStatus, string>> = {
        verifying: "Security check is running. Please wait...",
        error: "Security verification failed. Please refresh the page and try again.",
        expired: "Security verification expired. Please refresh the page.",
      };
      setStatus({
        ok: false,
        message: messages[turnstileStatus] || contact.validation.missingTurnstile,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken }),
      });

      const data = (await res.json()) as { error?: string; ok?: boolean };

      if (!res.ok) {
        setStatus({
          ok: false,
          message: data?.error || contact.validation.genericError,
        });
      } else {
        setStatus({
          ok: true,
          message: contact.validation.success,
        });
        setForm({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          subject: "",
          message: "",
        });
        setTouched({});
        setSubmitted(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus({ ok: false, message: msg || "Unknown error" });
    } finally {
      setLoading(false);
    }
  }

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <PageShell theme="contact">
      <SeoHead
        title="Contact | Corbin Meier"
        description="Ready to bring your project to life? Get in touch with Corbin Meier to discuss your next software engineering project."
        path="/contact"
      />
      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="page-container"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Header & Info */}
          <motion.div variants={item} className="lg:col-span-5">
            <header className="mb-12 text-center sm:text-left">
              <CyberCodeTerminalLine prompt=">" className="mb-2">
                <Typewriter durationMs={800} as="span">mailto contact@corbinmeier.net</Typewriter>
              </CyberCodeTerminalLine>
              <h1 className="text-h1 font-serif mb-6">
                <Typewriter durationMs={800} as="span">{contact.heading}</Typewriter>
              </h1>
              <p className="text-narrative mb-6">
                {form.subject.toLowerCase() === "strategic partnership" ? (
                  <div className="space-y-6 text-left">
                    <p>{homeHero.paragraph}</p>
                    <div className="border border-border bg-background/50 rounded-xl p-5 font-mono text-[11px] leading-relaxed">
                      <p className="font-bold text-[var(--accent)] mb-3">
                        {">"} {homeHero.pricingDetails.summary}
                      </p>
                      <ul className="space-y-2 list-disc pl-4 text-muted">
                        {homeHero.pricingDetails.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Typewriter durationMs={800} as="span">{contact.subhead}</Typewriter>
                )}
              </p>
            </header>

            <div className="space-y-8">
              {contact.infoItems.map((infoItem) => {
                const Icon = CONTACT_ICONS[infoItem.icon];
                return (
                <div key={infoItem.label} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--accent)]" style={{ color: "var(--accent)" }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">
                      {infoItem.label}
                    </p>
                    <p className="text-lg font-medium">
                      {infoItem.value}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          </motion.div>

          {/* Form inside Terminal Window */}
          <motion.div variants={item} className="lg:col-span-7">
            <CyberCodeTerminalWindow
              title="visitor@meier.net:~/contact_form"
              accent="primary"
              className="!bg-[var(--background)] !border-[var(--border)]"
              bodyClassName="p-4 sm:p-6"
            >
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-1">
                    <label className={cn(
                      "font-mono text-xs select-none whitespace-nowrap min-w-[110px] transition-colors",
                      getValidationError("firstName") ? "animate-label-flash text-[var(--accent)] font-bold" : "text-[var(--accent)]/80"
                    )}>$ first_name: {getValidationError("firstName") && <span className="text-[10px] opacity-90 font-bold">{getValidationError("firstName")}</span>}</label>
                    <input
                      type="text"
                      className="flex-1 bg-transparent border-b border-border focus:border-[var(--accent)] outline-none font-mono text-sm text-[var(--accent)] p-0 pb-0.5 focus:ring-0 transition-colors"
                      value={form.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-1">
                    <label className="font-mono text-xs text-[var(--accent)]/80 select-none whitespace-nowrap min-w-[110px]">$ last_name:</label>
                    <input
                      type="text"
                      className="flex-1 bg-transparent border-b border-border focus:border-[var(--accent)] outline-none font-mono text-sm text-[var(--accent)] p-0 pb-0.5 focus:ring-0 transition-colors"
                      value={form.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-1">
                    <label className={cn(
                      "font-mono text-xs select-none whitespace-nowrap min-w-[110px] transition-colors",
                      getValidationError("email") ? "animate-label-flash text-[var(--accent)] font-bold" : "text-[var(--accent)]/80"
                    )}>$ email: {getValidationError("email") && <span className="text-[10px] opacity-90 font-bold">{getValidationError("email")}</span>}</label>
                    <input
                      type="email"
                      className="flex-1 bg-transparent border-b border-border focus:border-[var(--accent)] outline-none font-mono text-sm text-[var(--accent)] p-0 pb-0.5 focus:ring-0 transition-colors"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-1">
                    <label className={cn(
                      "font-mono text-xs select-none whitespace-nowrap min-w-[110px] transition-colors",
                      getValidationError("phone") ? "animate-label-flash text-[var(--accent)] font-bold" : "text-[var(--accent)]/80"
                    )}>$ phone: {getValidationError("phone") && <span className="text-[10px] opacity-90 font-bold">{getValidationError("phone")}</span>}</label>
                    <input
                      type="tel"
                      className="flex-1 bg-transparent border-b border-border focus:border-[var(--accent)] outline-none font-mono text-sm text-[var(--accent)] p-0 pb-0.5 focus:ring-0 transition-colors"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-1">
                  <label className={cn(
                    "font-mono text-xs select-none whitespace-nowrap min-w-[110px] transition-colors",
                    getValidationError("subject") ? "animate-label-flash text-[var(--accent)] font-bold" : "text-[var(--accent)]/80"
                  )}>$ subject: {getValidationError("subject") && <span className="text-[10px] opacity-90 font-bold">{getValidationError("subject")}</span>}</label>
                  <input
                    type="text"
                    className="flex-1 bg-transparent border-b border-border focus:border-[var(--accent)] outline-none font-mono text-sm text-[var(--accent)] p-0 pb-0.5 focus:ring-0 transition-colors"
                    value={form.subject}
                    onChange={(e) => update("subject", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, subject: true }))}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 py-1">
                  <label className={cn(
                    "font-mono text-xs select-none whitespace-nowrap transition-colors",
                    getValidationError("message") ? "animate-label-flash text-[var(--accent)] font-bold" : "text-[var(--accent)]/80"
                  )}>$ message_body: {getValidationError("message") && <span className="text-[10px] opacity-90 font-bold">{getValidationError("message")}</span>}</label>
                  <textarea
                    rows={4}
                    className="w-full bg-transparent border border-border focus:border-[var(--accent)] rounded-md p-2.5 outline-none font-mono text-sm text-[var(--accent)] resize-none transition-colors"
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                  <CyberCodeButton
                    type="submit"
                    disabled={loading || turnstileStatus === "verifying"}
                    className="w-full sm:w-auto font-mono text-xs py-1.5 px-4 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span
                          className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
                        />
                        <span>Transmitting message...</span>
                      </>
                    ) : turnstileStatus === "verifying" ? (
                      <>
                        <Bot className="w-4 h-4 text-[var(--accent)] animate-bounce" />
                        <span>Scanning synapses... (are you organic?)</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-[var(--accent)]" />
                        <span>Submit (Humanity Passed)</span>
                      </>
                    )}
                  </CyberCodeButton>

                  <div className="flex items-center gap-2 text-xs font-mono select-none">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      turnstileStatus === "verified" && "bg-emerald-500 animate-pulse",
                      turnstileStatus === "verifying" && "bg-amber-500 animate-ping",
                      (turnstileStatus === "error" || turnstileStatus === "expired") && "bg-rose-500 animate-pulse"
                    )} />
                    <span className={cn(
                      turnstileStatus === "verified" && "text-emerald-500",
                      turnstileStatus === "verifying" && "text-amber-500",
                      (turnstileStatus === "error" || turnstileStatus === "expired") && "text-rose-500"
                    )}>
                      {turnstileStatus === "verifying" && "[human_check: pending...]"}
                      {turnstileStatus === "verified" && "[human_check: verified]"}
                      {turnstileStatus === "expired" && "[human_check: expired]"}
                      {turnstileStatus === "error" && "[human_check: failed]"}
                    </span>
                  </div>
                </div>

                  {/* Never wrapped in display:none - the widget renders into an
                      iframe and hangs indefinitely if its container is hidden.
                      The invisible size keeps it out of the layout instead. */}
                  <CloudflareTurnstile
                    siteKey={turnstileSiteKey}
                    onVerify={(token) => {
                      setTurnstileToken(token);
                      setTimeout(() => {
                        setTurnstileStatus("verified");
                      }, 5000);
                    }}
                    onError={() => {
                      setTurnstileToken("");
                      setTurnstileStatus("error");
                    }}
                    onExpire={() => {
                      setTurnstileToken("");
                      setTurnstileStatus("expired");
                    }}
                  />

                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-3 rounded-lg text-xs font-mono border mt-4",
                      status.ok
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-[var(--danger-soft)] text-[var(--danger)] border-[rgba(var(--danger-rgb),0.35)]"
                    )}
                  >
                    {status.ok ? `[success]: ${status.message}` : `[error]: ${status.message}`}
                  </motion.div>
                )}
              </form>
            </CyberCodeTerminalWindow>
          </motion.div>
        </div>
      </motion.main>
    </PageShell>
  );
}

