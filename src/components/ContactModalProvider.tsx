import React, { useState, ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MapPin, Clock, Mailbox, Save, Bot, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CloudflareTurnstile } from "@/components/CloudflareTurnstile";
import { contact } from "@/data/contact";
import { homeHero } from "@/data/home";
import type { ContactInfoItem } from "@/data/types";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { CyberCodeTerminalWindow, CyberCodeButton, CyberCodeTerminalLine, CyberCodeWindowChrome } from "@/components/cybercode/CyberCodeUIKit";
import { ContactModalContext } from "./ContactModalContext";

const CONTACT_ICONS: Record<ContactInfoItem["icon"], LucideIcon> = {
  Mail,
  MapPin,
  Mailbox,
  Clock,
};

const TURNSTILE_SITE_KEY = import.meta.env.TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

export default function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useBodyScrollLock(isOpen);

  // Form states maintained in provider to persist when closed/reopened
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [turnstileStatus, setTurnstileStatus] = useState<"verifying" | "verified" | "expired" | "error">("verifying");
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [turnstileInitialized, setTurnstileInitialized] = useState(false);

  const open = (options?: { subject?: string }) => {
    if (options?.subject !== undefined) {
      setForm((f) => ({ ...f, subject: options.subject || "" }));
    }
    setIsOpen(true);
    setTurnstileInitialized(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  // Intercept all clicks to "/contact" globally
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href) {
          try {
            const url = new URL(href, window.location.origin);
            if (url.pathname === "/contact") {
              e.preventDefault();
              e.stopPropagation();
              const subject = url.searchParams.get("subject") || undefined;
              open({ subject });
            }
          } catch {
            // Ignore malformed URLs
          }
        }
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  // Listen to escape key to close contact modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

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

      const responseText = await res.text();
      let data: { error?: string; ok?: boolean } = {};
      try {
        if (responseText.trim()) {
          data = JSON.parse(responseText);
        }
      } catch (err) {
        console.error("Failed to parse JSON response:", err);
      }

      if (!res.ok) {
        setStatus({
          ok: false,
          message: data?.error || `Server error: ${res.status} ${res.statusText}`,
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
        // Reset turnstile status on successful submit so they re-verify next time
        setTurnstileToken("");
        setTurnstileStatus("verifying");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus({ ok: false, message: msg || "Unknown error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ContactModalContext.Provider value={{ isOpen, open, close }}>
      {children}

      {/* Persist Turnstile component outside of conditional rendering to keep token/status intact */}
      {TURNSTILE_SITE_KEY && turnstileInitialized && (
        <div className="hidden">
          <CloudflareTurnstile
            siteKey={TURNSTILE_SITE_KEY}
            onVerify={(token) => {
              setTurnstileToken(token);
              // Small timeout to simulate synapscan
              setTimeout(() => {
                setTurnstileStatus("verified");
              }, 1000);
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
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="absolute inset-0 bg-background/95"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
            >
              <CyberCodeWindowChrome
                title="contact_terminal.sh"
                icon={<Save className="w-4 h-4 text-accent" />}
                showDots={true}
                onDotClick={close}
              />

              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                  {/* Info Panel */}
                  <div className="lg:col-span-5 flex flex-col justify-between">
                    <div>
                      <header className="mb-8">
                        <CyberCodeTerminalLine prompt=">" className="mb-2">
                          <span className="font-mono text-sm">mailto contact@corbinmeier.net</span>
                        </CyberCodeTerminalLine>
                        <h2 className="text-2xl sm:text-3xl font-serif mb-4">
                          {contact.heading}
                        </h2>
                        {form.subject.toLowerCase() === "strategic partnership" ? (
                          <div className="space-y-4 text-sm text-muted leading-relaxed mb-6">
                            <p>{homeHero.paragraph}</p>
                            <div className="border border-border bg-background/50 rounded-lg p-4 font-mono text-[11px] leading-relaxed">
                              <p className="font-bold text-[var(--accent)] mb-2">
                                {">"} {homeHero.pricingDetails.summary}
                              </p>
                              <ul className="space-y-2 list-disc pl-4">
                                {homeHero.pricingDetails.points.map((point) => (
                                  <li key={point}>{point}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted leading-relaxed">
                            {contact.subhead}
                          </p>
                        )}
                      </header>

                      <div className="space-y-6">
                        {contact.infoItems.map((infoItem) => {
                          const Icon = CONTACT_ICONS[infoItem.icon];
                          return (
                            <div key={infoItem.label} className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-[var(--accent)]" style={{ color: "var(--accent)" }}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">
                                  {infoItem.label}
                                </p>
                                <p className="text-sm font-medium">
                                  {infoItem.value}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Form Panel */}
                  <div className="lg:col-span-7">
                    <CyberCodeTerminalWindow
                      title="visitor@meier.net:~/contact_form"
                      accent="primary"
                      className="!bg-[var(--background)] !border-[var(--border)]"
                      bodyClassName="p-4 sm:p-6"
                    >
                      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1 py-1">
                            <label className={cn(
                              "font-mono text-xs select-none transition-colors",
                              getValidationError("firstName") ? "animate-label-flash text-[var(--accent)] font-bold" : "text-[var(--accent)]/80"
                            )}>$ first_name: {getValidationError("firstName") && <span className="text-[10px] opacity-90 font-bold">{getValidationError("firstName")}</span>}</label>
                            <input
                              type="text"
                              className="w-full bg-transparent border-b border-border focus:border-[var(--accent)] outline-none font-mono text-sm text-[var(--accent)] p-0 pb-0.5 focus:ring-0 transition-colors"
                              value={form.firstName}
                              onChange={(e) => update("firstName", e.target.value)}
                              onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1 py-1">
                            <label className="font-mono text-xs text-[var(--accent)]/80 select-none">$ last_name:</label>
                            <input
                              type="text"
                              className="w-full bg-transparent border-b border-border focus:border-[var(--accent)] outline-none font-mono text-sm text-[var(--accent)] p-0 pb-0.5 focus:ring-0 transition-colors"
                              value={form.lastName}
                              onChange={(e) => update("lastName", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1 py-1">
                            <label className={cn(
                              "font-mono text-xs select-none transition-colors",
                              getValidationError("email") ? "animate-label-flash text-[var(--accent)] font-bold" : "text-[var(--accent)]/80"
                            )}>$ email: {getValidationError("email") && <span className="text-[10px] opacity-90 font-bold">{getValidationError("email")}</span>}</label>
                            <input
                              type="email"
                              className="w-full bg-transparent border-b border-border focus:border-[var(--accent)] outline-none font-mono text-sm text-[var(--accent)] p-0 pb-0.5 focus:ring-0 transition-colors"
                              value={form.email}
                              onChange={(e) => update("email", e.target.value)}
                              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1 py-1">
                            <label className={cn(
                              "font-mono text-xs select-none transition-colors",
                              getValidationError("phone") ? "animate-label-flash text-[var(--accent)] font-bold" : "text-[var(--accent)]/80"
                            )}>$ phone: {getValidationError("phone") && <span className="text-[10px] opacity-90 font-bold">{getValidationError("phone")}</span>}</label>
                            <input
                              type="tel"
                              className="w-full bg-transparent border-b border-border focus:border-[var(--accent)] outline-none font-mono text-sm text-[var(--accent)] p-0 pb-0.5 focus:ring-0 transition-colors"
                              value={form.phone}
                              onChange={(e) => update("phone", e.target.value)}
                              onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 py-1">
                          <label className={cn(
                            "font-mono text-xs select-none transition-colors",
                            getValidationError("subject") ? "animate-label-flash text-[var(--accent)] font-bold" : "text-[var(--accent)]/80"
                          )}>$ subject: {getValidationError("subject") && <span className="text-[10px] opacity-90 font-bold">{getValidationError("subject")}</span>}</label>
                          <input
                            type="text"
                            className="w-full bg-transparent border-b border-border focus:border-[var(--accent)] outline-none font-mono text-sm text-[var(--accent)] p-0 pb-0.5 focus:ring-0 transition-colors"
                            value={form.subject}
                            onChange={(e) => update("subject", e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, subject: true }))}
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-2 py-1">
                          <label className={cn(
                            "font-mono text-xs select-none transition-colors",
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
                                <span>Transmitting...</span>
                              </>
                            ) : turnstileStatus === "verifying" ? (
                              <>
                                <Bot className="w-4 h-4 text-[var(--accent)] animate-bounce" />
                                <span>Scanning synapses...</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 text-[var(--accent)]" />
                                <span>Submit</span>
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
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ContactModalContext.Provider>
  );
}
