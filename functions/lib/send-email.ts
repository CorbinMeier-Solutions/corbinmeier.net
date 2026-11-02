/*
 * MailerKit™ - Corbin Meier Solutions
 * Licensed component. Modification permitted under your license agreement;
 * copying, redistribution, or removal of this notice is not.
 * This notice must remain intact in all copies and derivative works.
 */
// standard: email-transport@2026-10-16
// The only code that talks to the mail provider (Cloudflare Email Sending, REST).
import { classifyEmailSending, EMAIL_TOKEN_REF, missingKey, type KeyFailure } from "./key-alert";

const API_BASE = "https://api.cloudflare.com/client/v4";

export interface MailEnv {
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_EMAIL_API_TOKEN?: string;
}

export interface EmailMessage {
  /** One address, or a comma-separated list: each recipient gets its own message. */
  to: string | string[];
  /** One RFC 5322 field, "Business Name <address@domain>". */
  from: string;
  subject: string;
  html: string;
  text: string;
  /** One RFC 5322 field, e.g. `"First Last" <visitor@example.com>`. */
  replyTo?: string;
}

interface SendResult {
  delivered: string[];
  permanent_bounces: string[];
  queued: string[];
}

interface ApiEnvelope {
  success: boolean;
  errors?: { code: number; message: string }[];
  result: SendResult | null;
}

/** Carries upstream detail for the log. Never surface `detail` to a visitor. */
export class EmailSendError extends Error {
  status: number;
  detail: string;
  /** 429 and 5xx are worth another attempt; validation and auth failures are not. */
  retryable: boolean;
  /** Set when the cause is the API token (key-failure-alerts); the caller reports it. */
  credential: KeyFailure | null;

  constructor(message: string, status: number, detail: string, credential: KeyFailure | null = null) {
    super(message);
    this.name = "EmailSendError";
    this.status = status;
    this.detail = detail;
    this.retryable = status === 429 || status >= 500;
    this.credential = credential;
  }
}

/** An environment variable can only hold a comma-separated list; normalise it here. */
export function parseRecipients(value: string | string[]): string[] {
  const list = Array.isArray(value) ? value : value.split(",");
  return list.map((address) => address.trim()).filter(Boolean);
}

async function sendOne(env: Required<MailEnv>, recipient: string, message: EmailMessage): Promise<void> {
  const response = await fetch(`${API_BASE}/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/email/sending/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.CLOUDFLARE_EMAIL_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: recipient,
      from: message.from,
      subject: message.subject,
      html: message.html,
      text: message.text,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    }),
  });

  const bodyText = await response.text();
  let envelope: ApiEnvelope | null = null;
  try {
    envelope = JSON.parse(bodyText) as ApiEnvelope;
  } catch {
    // Non-JSON body (a gateway error page); bodyText is the only detail there is.
  }

  if (!response.ok || !envelope?.success || !envelope.result) {
    const detail = envelope?.errors?.map((e) => `${e.code}: ${e.message}`).join("; ") || bodyText;
    const credential = classifyEmailSending(response.status, envelope?.errors ?? []);
    throw new EmailSendError("Email Sending rejected the message.", response.status, detail, credential);
  }
  if (envelope.result.permanent_bounces.length > 0) {
    throw new EmailSendError("Email Sending reported a permanent bounce.", response.status, "permanent bounce");
  }
}

/**
 * Sends one message per recipient, so one bad address cannot block the others.
 * Resolves when at least one recipient was accepted; throws the last
 * EmailSendError when none was.
 */
export async function sendEmail(env: MailEnv, message: EmailMessage): Promise<void> {
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_EMAIL_API_TOKEN } = env;
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_EMAIL_API_TOKEN) {
    throw new EmailSendError(
      "Email Sending is not configured.",
      0,
      "CLOUDFLARE_ACCOUNT_ID and/or CLOUDFLARE_EMAIL_API_TOKEN are missing from the Pages environment.",
      CLOUDFLARE_EMAIL_API_TOKEN ? null : missingKey(EMAIL_TOKEN_REF)
    );
  }
  const recipients = parseRecipients(message.to);
  if (recipients.length === 0) {
    throw new EmailSendError("No recipient.", 0, "The message has no recipient address.");
  }

  let delivered = 0;
  let lastError: EmailSendError | null = null;
  for (const recipient of recipients) {
    try {
      await sendOne({ CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_EMAIL_API_TOKEN }, recipient, message);
      delivered += 1;
    } catch (error) {
      if (!(error instanceof EmailSendError)) throw error;
      lastError = error;
      console.error(
        JSON.stringify({
          event: "email_send_failed",
          status: error.status,
          retryable: error.retryable,
          detail: error.detail,
        })
      );
    }
  }
  if (delivered === 0 && lastError) throw lastError;
}
