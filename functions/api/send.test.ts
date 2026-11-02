import { afterEach, describe, expect, it, vi } from "vitest";
import { onRequestPost } from "./send";

const env = {
  CLOUDFLARE_EMAIL_API_TOKEN: "token-placeholder",
  CLOUDFLARE_ACCOUNT_ID: "acct",
  MAIL_FROM: "Site <contact@example.com>",
  FORM_TO_ADDRESSES: "owner@example.com",
  TURNSTILE_SECRET: "secret-placeholder",
};
const body = { firstName: "Ada", email: "ada@example.com", subject: "Hi", message: "Hello", turnstileToken: "tok" };

function call(payload: unknown, overrides: Partial<typeof env> = {}) {
  const request = new Request("https://example.com/api/send", { method: "POST", body: JSON.stringify(payload) });
  const context = { request, env: { ...env, ...overrides } };
  return onRequestPost(context as unknown as Parameters<typeof onRequestPost>[0]);
}

const sendOk = () =>
  new Response(JSON.stringify({ success: true, result: { delivered: [], permanent_bounces: [], queued: [] } }));

function stubFetch(verify: { success: boolean; action?: string }, mail: () => Response = sendOk) {
  const mock = vi.fn<(url: string, init?: { body: string }) => Promise<Response>>(async (url) =>
    url.includes("siteverify") ? new Response(JSON.stringify(verify)) : mail()
  );
  vi.stubGlobal("fetch", mock);
  return mock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/send", () => {
  it("rejects an unverified request before validation or any send", async () => {
    const mock = stubFetch({ success: false });
    const response = await call({ ...body, email: "not-an-email" });
    expect(response.status).toBe(403);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("rejects a token issued for another action", async () => {
    stubFetch({ success: true, action: "other" });
    expect((await call(body)).status).toBe(403);
  });

  it("rejects header injection after verification, without sending", async () => {
    const mock = stubFetch({ success: true, action: "send" });
    const response = await call({ ...body, subject: "Hi\r\nBcc: x@y.com" });
    expect(response.status).toBe(400);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("sends HTML and text with Reply-To, then the confirmation", async () => {
    const mock = stubFetch({ success: true, action: "send" });
    const response = await call(body);
    expect(response.status).toBe(200);
    const sent = mock.mock.calls
      .filter(([url]) => !url.includes("siteverify"))
      .map(([, init]) => JSON.parse(init?.body ?? "{}"));
    expect(sent).toHaveLength(2);
    expect(sent[0].to).toBe("owner@example.com");
    expect(sent[0].reply_to).toBe('"Ada" <ada@example.com>');
    expect(sent[0].html).toContain("<");
    expect(sent[0].text).toContain("Hello");
  });

  it("returns the generic error and logs the detail when configuration is missing", async () => {
    stubFetch({ success: true, action: "send" });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await call(body, { MAIL_FROM: "" });
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).not.toContain("MAIL_FROM");
    expect(log.mock.calls[0][0]).toContain("MAIL_FROM");
  });

  it("files a key-failure issue when Email Sending rejects the token, and the visitor sees only the generic error", async () => {
    const calls: { url: string; body: string }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: { body?: string }) => {
        calls.push({ url, body: String(init?.body ?? "") });
        if (url.includes("siteverify")) return new Response(JSON.stringify({ success: true, action: "send" }));
        if (url.includes("email/sending"))
          return new Response(JSON.stringify({ success: false, errors: [{ code: 10101, message: "Invalid token" }] }), {
            status: 403,
          });
        if (url.includes("/issues?")) return new Response("[]");
        return new Response("{}", { status: 201 });
      })
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
    const pending: Promise<unknown>[] = [];
    const request = new Request("https://example.com/api/send", { method: "POST", body: JSON.stringify(body) });
    const context = {
      request,
      env: { ...env, KEY_ALERT_GITHUB_PAT: "pat-placeholder", KEY_ALERT_GITHUB_REPO: "owner/repo" },
      waitUntil: (p: Promise<unknown>) => pending.push(p),
    };
    const response = await onRequestPost(context as unknown as Parameters<typeof onRequestPost>[0]);
    await Promise.all(pending);
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("10101");
    const filed = calls.find((c) => c.url.endsWith("/repos/owner/repo/issues"));
    expect(filed?.body).toContain("CLOUDFLARE_EMAIL_API_TOKEN");
    expect(filed?.body).not.toContain("token-placeholder");
  });

  it("returns the generic error when the provider rejects every recipient", async () => {
    stubFetch({ success: true, action: "send" }, () => new Response("{}", { status: 500 }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await call(body);
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("rejected");
  });
});
