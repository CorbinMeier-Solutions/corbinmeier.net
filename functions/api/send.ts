// standard: contact-form@2026-10-16
import { renderConfirmationEmail, renderOwnerEmail } from "../lib/contact-emails";
import { buildReplyTo, parseContactForm } from "../lib/contact-form";
import {
  createKeyAlerts,
  detectEnvironment,
  EMAIL_TOKEN_REF,
  missingKey,
  turnstileRef,
  type CredentialRef,
  type KeyAlerts,
} from "../lib/key-alert";
import { EmailSendError, parseRecipients, sendEmail } from "../lib/send-email";
import { jsonResponse, rejectUnverified } from "../lib/turnstile";

interface CloudflareEnv {
  CLOUDFLARE_EMAIL_API_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  MAIL_FROM: string;
  FORM_TO_ADDRESSES: string;
  TURNSTILE_SECRET: string;
  KEY_ALERT_GITHUB_PAT?: string;
  KEY_ALERT_GITHUB_REPO?: string;
  SITE_URL?: string;
}

const TURNSTILE_ACTION = "send";
const GENERIC_ERROR = "Error submitting message, please try again later.";

function logEvent(event: string, fields: Record<string, unknown> = {}): void {
  console.error(JSON.stringify({ event, ...fields }));
}

function missingConfig(env: Partial<CloudflareEnv>): string[] {
  const required = [
    "CLOUDFLARE_EMAIL_API_TOKEN",
    "CLOUDFLARE_ACCOUNT_ID",
    "MAIL_FROM",
    "FORM_TO_ADDRESSES",
    "TURNSTILE_SECRET",
  ] as const;
  return required.filter((key) => !env[key]);
}

/** Sends, and reports a credential failure to the alerts; a success marks the token as working. */
async function sendReporting(
  env: CloudflareEnv,
  alerts: KeyAlerts,
  worked: CredentialRef[],
  message: Parameters<typeof sendEmail>[1]
): Promise<void> {
  try {
    await sendEmail(env, message);
    worked.push(EMAIL_TOKEN_REF);
  } catch (error) {
    if (error instanceof EmailSendError && error.credential) alerts.failure(error.credential);
    throw error;
  }
}

export const onRequestPost: PagesFunction<CloudflareEnv> = async ({ request, env, waitUntil }) => {
  const alerts = createKeyAlerts({
    env,
    feature: "/api/send",
    environment: detectEnvironment(request.url, env.SITE_URL),
    waitUntil,
  });
  const worked: CredentialRef[] = [];
  try {
    // 1. Turnstile, before anything else. Fails closed without its secret.
    if (!env.TURNSTILE_SECRET) {
      logEvent("config_missing", { missing: ["TURNSTILE_SECRET"] });
      alerts.failure(missingKey(turnstileRef(env.TURNSTILE_SECRET)));
      return jsonResponse({ error: GENERIC_ERROR }, 500);
    }
    const raw: unknown = await request.json();
    const token =
      typeof raw === "object" && raw !== null && "turnstileToken" in raw && typeof raw.turnstileToken === "string"
        ? raw.turnstileToken
        : "";
    const { rejection, credential } = await rejectUnverified(request, env.TURNSTILE_SECRET, token, TURNSTILE_ACTION);
    if (credential) alerts.failure(credential);
    else if (token) worked.push(turnstileRef(env.TURNSTILE_SECRET));
    if (rejection) return rejection;

    // 2. Field validation. Header injection: parseContactForm rejects [\r\n] in every single-line field.
    const parsed = parseContactForm(raw);
    if (!parsed.ok) return jsonResponse({ error: parsed.error }, 400);
    const { form } = parsed;

    // 3. Configuration check: names go to the log, never to the visitor.
    const missing = missingConfig(env);
    if (missing.length > 0) {
      logEvent("config_missing", { missing });
      if (missing.includes(EMAIL_TOKEN_REF.setting)) alerts.failure(missingKey(EMAIL_TOKEN_REF));
      return jsonResponse({ error: GENERIC_ERROR }, 500);
    }
    const recipients = parseRecipients(env.FORM_TO_ADDRESSES);

    // 4. Send. The owner's notification must land; the visitor's confirmation is a courtesy.
    const owner = await renderOwnerEmail(form);
    await sendReporting(env, alerts, worked, {
      to: recipients,
      from: env.MAIL_FROM,
      replyTo: buildReplyTo(form),
      subject: owner.subject,
      html: owner.html,
      text: owner.text,
    });

    try {
      const confirmation = await renderConfirmationEmail(form);
      await sendReporting(env, alerts, worked, {
        to: form.email,
        from: env.MAIL_FROM,
        replyTo: recipients[0],
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
      });
    } catch (error) {
      logEvent("confirmation_failed", { cause: error instanceof Error ? error.message : "unknown" });
    }

    return jsonResponse({ ok: true }, 200);
  } catch (error) {
    logEvent("send_failed", {
      cause: error instanceof EmailSendError ? `status ${error.status}: ${error.detail}` : String(error),
    });
    return jsonResponse({ error: GENERIC_ERROR }, 500);
  } finally {
    alerts.recovered(worked);
  }
};
