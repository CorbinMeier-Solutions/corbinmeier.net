// standard: turnstile@2026-10-30
// Server-side Turnstile verification (siteverify). Called first by every form handler.
import { classifyTurnstile, type KeyFailure } from "./key-alert";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface SiteverifyOutcome {
  success: boolean;
  action?: string;
  "error-codes"?: string[];
}

export interface Verification {
  /** A 403 when the request is not verified; null when it is. */
  rejection: Response | null;
  /** Set when siteverify refused the secret itself (key-failure-alerts). */
  credential: KeyFailure | null;
}

export function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/**
 * Rejects (403) when the token is missing, rejected, or was issued
 * for another action; accepts when the request is verified. The action is the
 * endpoint name, so a token minted for another form cannot be replayed here.
 */
export async function rejectUnverified(
  request: Request,
  secret: string,
  token: string,
  action: string
): Promise<Verification> {
  const denied = () => jsonResponse({ error: "Security check failed. Please try again." }, 403);
  if (!token) return { rejection: denied(), credential: null };

  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) form.append("remoteip", ip);

  const result = await fetch(SITEVERIFY_URL, { body: form, method: "POST" });
  const outcome = (await result.json()) as SiteverifyOutcome;
  const credential = classifyTurnstile(secret, outcome["error-codes"] ?? []);
  const verified = outcome.success && outcome.action === action;
  return { rejection: verified ? null : denied(), credential };
}
