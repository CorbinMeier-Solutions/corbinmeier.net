import { afterEach, describe, expect, it, vi } from "vitest";
import {
  classifyEmailSending,
  classifyTurnstile,
  createKeyAlerts,
  detectEnvironment,
  EMAIL_TOKEN_REF,
  issueBody,
  issueTitle,
  markerFor,
  missingKey,
  recoveryComment,
  redact,
  turnstileRef,
  type KeyFailure,
} from "./key-alert";

const FAKE_PAT = "github_pat_11ABCDEFG0123456789_fakefakefakefake";
const FAKE_TOKEN = "cf-token-0123456789abcdef";
const env = {
  KEY_ALERT_GITHUB_PAT: FAKE_PAT,
  KEY_ALERT_GITHUB_REPO: "owner/repo",
  CLOUDFLARE_EMAIL_API_TOKEN: FAKE_TOKEN,
  TURNSTILE_SECRET: "0x4AAAAAAAfakesecretvalue",
};
const emailFailure: KeyFailure = { ...EMAIL_TOKEN_REF, code: "10101", message: "Invalid token" };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("classification", () => {
  it.each([10101, 10102, 10103])("counts Email Sending code %i as a key failure", (code) => {
    expect(classifyEmailSending(403, [{ code, message: "x" }])?.code).toBe(String(code));
  });
  it.each([10105, 10203, 10207, 10000, 10001])("does not count code %i", (code) => {
    expect(classifyEmailSending(403, [{ code, message: "x" }])).toBeNull();
  });
  it("does not count a bare 403, but counts a bare 401", () => {
    expect(classifyEmailSending(403, [])).toBeNull();
    expect(classifyEmailSending(401, [])?.code).toBe("401");
  });
  it("does not count 5xx or rate limits", () => {
    expect(classifyEmailSending(500, [])).toBeNull();
    expect(classifyEmailSending(429, [])).toBeNull();
  });
  it("counts a bad Turnstile secret only", () => {
    expect(classifyTurnstile("s", ["invalid-input-secret"])?.service).toBe("Turnstile");
    expect(classifyTurnstile("s", ["invalid-input-response"])).toBeNull();
    expect(classifyTurnstile("s", [])).toBeNull();
  });
  it("reads test mode from Turnstile's dummy secret prefix", () => {
    expect(turnstileRef("1x0000000000000000000000000000000AA").mode).toBe("test");
    expect(turnstileRef("0x4AAAAAAAreal").mode).toBe("live");
  });
  it("names the setting for a missing key", () => {
    expect(missingKey(EMAIL_TOKEN_REF)).toMatchObject({ code: "missing", setting: "CLOUDFLARE_EMAIL_API_TOKEN" });
  });
  it("detects the environment from the host", () => {
    expect(detectEnvironment("https://corbinmeier.net/api/send", "https://corbinmeier.net")).toBe("production");
    expect(detectEnvironment("https://abc.corbinmeier-net.pages.dev/api/send", "https://corbinmeier.net")).toBe("preview");
    expect(detectEnvironment("http://localhost:8788/api/send", undefined)).toBe("local");
  });
});

describe("redaction", () => {
  it("removes every secret value and key shape from any text", () => {
    const text = `${FAKE_PAT} ${FAKE_TOKEN} ${env.TURNSTILE_SECRET} Bearer abc.def sk_test_51Habcdefghij re_abcdefgh12 api_secret=zzz`;
    const out = redact(text, env);
    for (const leak of [FAKE_PAT, FAKE_TOKEN, env.TURNSTILE_SECRET, "abc.def", "sk_test_51H", "re_abcdefgh12", "zzz"]) {
      expect(out).not.toContain(leak);
    }
  });
  it("keeps the setting name", () => {
    expect(redact("CLOUDFLARE_EMAIL_API_TOKEN is missing", env)).toContain("CLOUDFLARE_EMAIL_API_TOKEN");
  });
});

describe("issue text", () => {
  it("names service, setting, environment and the provider message", () => {
    const title = issueTitle(emailFailure, "production");
    expect(title).toBe("Key failure: Cloudflare Email Sending CLOUDFLARE_EMAIL_API_TOKEN (production): Invalid token");
    const turnstile = { ...turnstileRef("0x4"), code: "invalid-input-secret", message: "bad" };
    expect(issueTitle(turnstile, "preview")).toContain("(preview, live mode)");
  });
  it("starts the body with the dedup marker", () => {
    const body = issueBody(emailFailure, "production", "/api/send", "2026-11-01T00:00:00Z");
    expect(body.split("\n")[0]).toBe(markerFor(emailFailure));
    expect(body).toContain("Fix:");
  });
});

interface Call {
  method: string;
  url: string;
  body: Record<string, string>;
}

function stubGithub(openIssues: unknown[], comments: unknown[] = [], status = 200) {
  const calls: Call[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: { method?: string; body?: string }) => {
      calls.push({ method: init?.method ?? "GET", url, body: JSON.parse(init?.body ?? "{}") });
      if (status !== 200) return new Response(`denied ${FAKE_PAT}`, { status });
      if (url.includes("/comments?")) return new Response(JSON.stringify(comments));
      if (url.includes("/issues?")) return new Response(JSON.stringify(openIssues));
      return new Response("{}", { status: 201 });
    })
  );
  return calls;
}

function alertsWith(overrides: Partial<typeof env> = {}) {
  const pending: Promise<unknown>[] = [];
  const alerts = createKeyAlerts({
    env: { ...env, ...overrides },
    feature: "/api/send",
    environment: "production",
    waitUntil: (p) => pending.push(p),
    now: () => new Date("2026-11-01T12:00:00Z"),
  });
  return { alerts, settle: () => Promise.all(pending) };
}

describe("filing", () => {
  it("opens one labelled issue when none is open, and logs without the key", async () => {
    const calls = stubGithub([]);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { alerts, settle } = alertsWith();
    alerts.failure({ ...emailFailure, message: `bad ${FAKE_TOKEN}` });
    await settle();
    const created = calls.find((c) => c.method === "POST");
    expect(created?.url).toBe("https://api.github.com/repos/owner/repo/issues");
    expect(created?.body.labels).toEqual(["key-failure"]);
    expect(created?.body.body.split("\n")[0]).toBe(markerFor(emailFailure));
    expect(JSON.stringify(calls) + JSON.stringify(log.mock.calls)).not.toContain(FAKE_TOKEN);
    expect(log.mock.calls[0][0]).toContain('"service":"Cloudflare Email Sending"');
    expect(log.mock.calls[0][0]).toContain('"setting":"CLOUDFLARE_EMAIL_API_TOKEN"');
  });

  it("comments on the open issue for a repeat instead of filing a twin", async () => {
    const calls = stubGithub([{ number: 7, body: `${markerFor(emailFailure)}\nrest`, comments: 0 }]);
    const { alerts, settle } = alertsWith();
    alerts.failure(emailFailure);
    await settle();
    const posts = calls.filter((c) => c.method === "POST");
    expect(posts).toHaveLength(1);
    expect(posts[0].url).toContain("/issues/7/comments");
  });

  it("does not match another credential's issue", async () => {
    const other = { ...emailFailure, setting: "OTHER" };
    const calls = stubGithub([{ number: 7, body: `${markerFor(other)}\nrest`, comments: 0 }]);
    const { alerts, settle } = alertsWith();
    alerts.failure(emailFailure);
    await settle();
    expect(calls.find((c) => c.method === "POST")?.url).toMatch(/\/issues$/);
  });

  it("logs that alerting is off and files nothing without the PAT", async () => {
    const calls = stubGithub([]);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { alerts, settle } = alertsWith({ KEY_ALERT_GITHUB_PAT: "" });
    alerts.failure(emailFailure);
    await settle();
    expect(calls).toHaveLength(0);
    expect(log.mock.calls.map((c) => c[0]).join()).toContain("key_alert_off");
  });

  it("logs a failing PAT redacted and never throws", async () => {
    stubGithub([], [], 401);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { alerts, settle } = alertsWith();
    alerts.failure(emailFailure);
    await expect(settle()).resolves.toBeDefined();
    const logged = log.mock.calls.map((c) => c[0]).join();
    expect(logged).toContain("key_alert_pat_failed");
    expect(logged).not.toContain(FAKE_PAT);
  });
});

describe("recovery", () => {
  const open = { number: 9, body: `${markerFor(emailFailure)}\nrest` };

  it("comments once when a failing credential works again", async () => {
    const calls = stubGithub([{ ...open, comments: 0 }]);
    const { alerts, settle } = alertsWith();
    alerts.recovered([EMAIL_TOKEN_REF]);
    await settle();
    const post = calls.find((c) => c.method === "POST");
    expect(post?.url).toContain("/issues/9/comments");
    expect(post?.body.body).toBe(recoveryComment("2026-11-01T12:00:00.000Z"));
  });

  it("does not comment again when the last comment is already the recovery", async () => {
    const calls = stubGithub([{ ...open, comments: 1 }], [{ body: recoveryComment("t") }]);
    const { alerts, settle } = alertsWith();
    alerts.recovered([EMAIL_TOKEN_REF]);
    await settle();
    expect(calls.filter((c) => c.method === "POST")).toHaveLength(0);
  });

  it("does nothing when no issue is open for the credential", async () => {
    const calls = stubGithub([]);
    const { alerts, settle } = alertsWith();
    alerts.recovered([EMAIL_TOKEN_REF]);
    await settle();
    expect(calls.filter((c) => c.method === "POST")).toHaveLength(0);
  });

  it("skips a credential that failed in the same request", async () => {
    const calls = stubGithub([{ ...open, comments: 0 }]);
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { alerts, settle } = alertsWith();
    alerts.failure(emailFailure);
    alerts.recovered([EMAIL_TOKEN_REF]);
    await settle();
    expect(calls.filter((c) => c.url.endsWith("/issues/9/comments") && c.body.body.includes("Recovered"))).toHaveLength(0);
  });
});
