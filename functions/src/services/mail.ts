/*
 * MailerKit™ - Corbin Meier Solutions
 * Licensed component. Modification permitted under your license agreement;
 * copying, redistribution, or removal of this notice is not.
 * This notice must remain intact in all copies and derivative works.
 */
// standard: email-sending@2026-09-13

const API_BASE = "https://api.cloudflare.com/client/v4";

export interface MailEnv {
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_EMAIL_API_TOKEN?: string;
}

export interface EmailAddress {
  address: string;
  name?: string;
}

export interface EmailMessage {
  to: string | string[];
  from: string | EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  /** snake_case: the REST API differs from the Workers binding here. */
  reply_to?: string | EmailAddress;
  headers?: Record<string, string>;
}

export interface SendResult {
  delivered: string[];
  permanent_bounces: string[];
  queued: string[];
}

interface ApiEnvelope<T> {
  success: boolean;
  errors?: { code: number; message: string }[];
  result: T | null;
}

/** Carries upstream detail for the log. Never surface `detail` to a visitor. */
export class EmailSendError extends Error {
  status: number;
  detail: string;
  /** 429 and 5xx are worth another attempt; validation and auth failures are not. */
  retryable: boolean;

  constructor(message: string, status: number, detail: string) {
    super(message);
    this.name = "EmailSendError";
    this.status = status;
    this.detail = detail;
    this.retryable = status === 429 || status >= 500;
  }
}

/**
 * Recipient fields may arrive comma-separated, because that is the only shape
 * an environment variable can hold. Normalising here rather than at each call
 * site means no caller can forget and send to one malformed
 * "a@example.com, b@example.com" address.
 */
export function parseRecipients(value: string | string[]): string[] {
  const list = Array.isArray(value) ? value : value.split(",");
  return list.map((address) => address.trim()).filter(Boolean);
}

// Stricter than "has an @ and a dot": also rejects a leading/trailing dot in
// either the local part or the domain, and consecutive dots anywhere. Those
// shapes pass a looser check but the Email Sending API 400s on them at send
// time (10202: email.sending.error.email.invalid) - caught here instead,
// before Turnstile is spent.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function hasBadDots(part: string): boolean {
  return part.startsWith(".") || part.endsWith(".") || part.includes("..");
}

export function isValidEmail(value: string): boolean {
  if (!EMAIL_SHAPE.test(value)) return false;
  const [local, domain] = value.split("@");
  return !hasBadDots(local) && !hasBadDots(domain);
}

export async function sendEmail(env: MailEnv, message: EmailMessage): Promise<SendResult> {
  if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_EMAIL_API_TOKEN) {
    throw new EmailSendError(
      "Email Sending is not configured.",
      0,
      "CLOUDFLARE_ACCOUNT_ID and/or CLOUDFLARE_EMAIL_API_TOKEN are missing from the Pages environment."
    );
  }

  const payload: EmailMessage = {
    ...message,
    to: parseRecipients(message.to),
    ...(message.cc ? { cc: parseRecipients(message.cc) } : {}),
    ...(message.bcc ? { bcc: parseRecipients(message.bcc) } : {}),
  };

  const response = await fetch(
    `${API_BASE}/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/email/sending/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_EMAIL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const bodyText = await response.text();
  let envelope: ApiEnvelope<SendResult> | null = null;
  try {
    envelope = JSON.parse(bodyText) as ApiEnvelope<SendResult>;
  } catch {
    // Non-JSON body (a gateway error page); bodyText is the only detail there is.
  }

  if (!response.ok || !envelope?.success || !envelope.result) {
    const detail = envelope?.errors?.map((e) => `${e.code}: ${e.message}`).join("; ") || bodyText;
    throw new EmailSendError("Email Sending rejected the message.", response.status, detail);
  }

  return envelope.result;
}
