// standard: turnstile@2026-10-30
// Server-side Turnstile verification (siteverify). Called first by every form handler.

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface SiteverifyOutcome {
  success: boolean;
  action?: string;
}

export function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/**
 * Returns a 403 Response when the token is missing, rejected, or was issued
 * for another action; null when the request is verified. The action is the
 * endpoint name, so a token minted for another form cannot be replayed here.
 */
export async function rejectUnverified(
  request: Request,
  secret: string,
  token: string,
  action: string
): Promise<Response | null> {
  const denied = () => jsonResponse({ error: "Security check failed. Please try again." }, 403);
  if (!token) return denied();

  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) form.append("remoteip", ip);

  const result = await fetch(SITEVERIFY_URL, { body: form, method: "POST" });
  const outcome = (await result.json()) as SiteverifyOutcome;
  return outcome.success && outcome.action === action ? null : denied();
}
