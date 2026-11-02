// standard: key-failure-alerts@2026-10-30
// Credential failures of the keyed calls (Email Sending token, Turnstile secret): classify,
// log, and file or comment on a GitHub issue at failure time through the site's own PAT,
// which is independent of the failing key. No database here: the open issue is the dedup.

const GITHUB_API = "https://api.github.com";
const LABEL = "key-failure";
const KEY_ERROR_CODES_EMAIL = new Set([10101, 10102, 10103]);
const KEY_ERROR_CODES_TURNSTILE = new Set(["invalid-input-secret", "missing-input-secret"]);

export type KeyService = "Cloudflare Email Sending" | "Turnstile";
export type KeyMode = "test" | "live" | "n/a";
export type Environment = "production" | "preview" | "local";

export interface CredentialRef {
  service: KeyService;
  /** The setting that holds the key: a name, never a value. */
  setting: string;
  mode: KeyMode;
}

export interface KeyFailure extends CredentialRef {
  code: string;
  message: string;
}

export interface AlertEnv {
  KEY_ALERT_GITHUB_PAT?: string;
  KEY_ALERT_GITHUB_REPO?: string;
  SITE_URL?: string;
  CLOUDFLARE_EMAIL_API_TOKEN?: string;
  TURNSTILE_SECRET?: string;
}

export const EMAIL_TOKEN_REF: CredentialRef = {
  service: "Cloudflare Email Sending",
  setting: "CLOUDFLARE_EMAIL_API_TOKEN",
  mode: "n/a",
};

const FIX: Record<KeyService, string> = {
  "Cloudflare Email Sending":
    "Create an API token with Email Sending permission (Cloudflare dashboard > My Profile > API Tokens), set it as CLOUDFLARE_EMAIL_API_TOKEN on the Pages project (production and preview), then redeploy.",
  Turnstile:
    "Copy the widget's secret key (Cloudflare dashboard > Turnstile), set it as TURNSTILE_SECRET on the Pages project (production and preview), then redeploy.",
};

// ---- Classification (pure) ----

/** Turnstile's documented dummy secrets start with 1x, 2x or 3x and zeros. */
export function turnstileRef(secret: string | undefined): CredentialRef {
  return {
    service: "Turnstile",
    setting: "TURNSTILE_SECRET",
    mode: secret && /^[123]x0{10,}/.test(secret) ? "test" : "live",
  };
}

/** Hub note 339: codes 10101-10103 are key failures; a bare 403 is not; with no code only 401 counts. */
export function classifyEmailSending(status: number, errors: { code: number; message: string }[]): KeyFailure | null {
  const hit = errors.find((error) => KEY_ERROR_CODES_EMAIL.has(error.code));
  if (hit) return { ...EMAIL_TOKEN_REF, code: String(hit.code), message: hit.message };
  if (errors.length === 0 && status === 401) {
    return { ...EMAIL_TOKEN_REF, code: "401", message: "Unauthorized (no error code in the response)" };
  }
  return null;
}

export function classifyTurnstile(secret: string | undefined, errorCodes: string[]): KeyFailure | null {
  const hit = errorCodes.find((code) => KEY_ERROR_CODES_TURNSTILE.has(code));
  return hit ? { ...turnstileRef(secret), code: hit, message: `siteverify answered ${hit}` } : null;
}

/** A required key that is empty or missing where the code needs it. */
export function missingKey(ref: CredentialRef): KeyFailure {
  return { ...ref, code: "missing", message: `${ref.setting} is empty or missing from the Pages environment` };
}

export function detectEnvironment(requestUrl: string, siteUrl: string | undefined): Environment {
  const { hostname } = new URL(requestUrl);
  if (hostname === "localhost" || hostname === "127.0.0.1") return "local";
  if (siteUrl && hostname === new URL(siteUrl).hostname) return "production";
  return "preview";
}

// ---- Redaction (pure) ----

const KEY_SHAPES = [
  /Bearer\s+[\w.~+/=-]+/gi,
  /github_pat_\w+/g,
  /gh[pousr]_\w+/g,
  /\b[srp]k_(?:test_|live_)?\w{8,}/g,
  /\bwhsec_\w+/g,
  /\bre_\w{8,}/g,
  /api_secret=[^\s&]+/gi,
];

/** Removes key-shaped strings and the exact values of this environment's own secrets. */
export function redact(text: string, env: AlertEnv): string {
  let out = text;
  const secrets = [env.CLOUDFLARE_EMAIL_API_TOKEN, env.TURNSTILE_SECRET, env.KEY_ALERT_GITHUB_PAT];
  for (const secret of secrets) {
    if (secret && secret.length >= 6) out = out.split(secret).join("[redacted]");
  }
  for (const shape of KEY_SHAPES) out = out.replace(shape, "[redacted]");
  return out;
}

// ---- Issue text (pure) ----

export function markerFor(ref: CredentialRef): string {
  return `<!-- key-failure-alert: ${ref.service}:${ref.setting}:${ref.mode} -->`;
}

function where(environment: Environment, mode: KeyMode): string {
  return mode === "n/a" ? environment : `${environment}, ${mode} mode`;
}

export function issueTitle(failure: KeyFailure, environment: Environment): string {
  return `Key failure: ${failure.service} ${failure.setting} (${where(environment, failure.mode)}): ${failure.message}`;
}

export function issueBody(failure: KeyFailure, environment: Environment, feature: string, at: string): string {
  return [
    markerFor(failure),
    `- Service: ${failure.service}`,
    `- Setting: ${failure.setting}`,
    `- Environment: ${where(environment, failure.mode)}`,
    `- Provider error: ${failure.code}: ${failure.message}`,
    `- Made by: ${feature}`,
    `- First seen: ${at}`,
    "",
    `Fix: ${FIX[failure.service]}`,
    "",
    "Repeats are comments on this issue. Recovery is a comment too; this issue is never closed by code.",
  ].join("\n");
}

export function repeatComment(failure: KeyFailure, at: string): string {
  return `Failed again at ${at}: ${failure.code}: ${failure.message}`;
}

export const RECOVERY_MARKER = "<!-- key-failure-recovered -->";

export function recoveryComment(at: string): string {
  return `${RECOVERY_MARKER}\nRecovered: the credential worked again at ${at}.`;
}

// ---- GitHub filing (I/O) ----

interface OpenIssue {
  number: number;
  body: string;
  comments: number;
}

function isOpenIssue(value: unknown): value is OpenIssue {
  return (
    typeof value === "object" &&
    value !== null &&
    "number" in value &&
    typeof value.number === "number" &&
    "body" in value &&
    typeof value.body === "string" &&
    "comments" in value &&
    typeof value.comments === "number"
  );
}

function hasBody(value: unknown): value is { body: string } {
  return typeof value === "object" && value !== null && "body" in value && typeof value.body === "string";
}

export type Log = (event: string, fields?: Record<string, unknown>) => void;

class Github {
  constructor(
    private pat: string,
    private repo: string,
    private env: AlertEnv,
    private log: Log
  ) {}

  private async call(path: string, init: RequestInit = {}): Promise<unknown> {
    const response = await fetch(`${GITHUB_API}/repos/${this.repo}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.pat}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "corbinmeier-net-key-alerts",
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      // The PAT itself failing is the blind spot: logged redacted, never thrown at a visitor.
      const text = redact(await response.text(), this.env);
      this.log(response.status === 401 || response.status === 403 ? "key_alert_pat_failed" : "key_alert_github_failed", {
        status: response.status,
        detail: text.slice(0, 300),
      });
      return null;
    }
    return response.json();
  }

  async openIssues(): Promise<OpenIssue[]> {
    const data = await this.call(`/issues?state=open&labels=${LABEL}&per_page=100`);
    return Array.isArray(data) ? data.filter(isOpenIssue) : [];
  }

  async comment(issue: number, body: string): Promise<void> {
    await this.call(`/issues/${issue}/comments`, { method: "POST", body: JSON.stringify({ body }) });
  }

  async create(title: string, body: string): Promise<void> {
    await this.call("/issues", { method: "POST", body: JSON.stringify({ title, body, labels: [LABEL] }) });
  }

  async lastComment(issue: OpenIssue): Promise<string> {
    if (issue.comments === 0) return "";
    const page = Math.ceil(issue.comments / 100);
    const data = await this.call(`/issues/${issue.number}/comments?per_page=100&page=${page}`);
    const last = Array.isArray(data) ? data.filter(hasBody).at(-1) : undefined;
    return last?.body ?? "";
  }
}

const findIssue = (issues: OpenIssue[], ref: CredentialRef) =>
  issues.find((issue) => issue.body.split("\n", 1)[0] === markerFor(ref));

// ---- Per-request alerts ----

export interface KeyAlertOptions {
  env: AlertEnv;
  /** The route that makes the keyed calls. */
  feature: string;
  environment: Environment;
  waitUntil: (promise: Promise<unknown>) => void;
  now?: () => Date;
}

export interface KeyAlerts {
  /** Logs the failure and files or comments on its issue after the response. Never throws. */
  failure(failure: KeyFailure): void;
  /** Comments "recovered" on the open issue of each credential that worked and did not fail this request. */
  recovered(refs: CredentialRef[]): void;
}

export function createKeyAlerts(options: KeyAlertOptions): KeyAlerts {
  const { env, feature, environment, waitUntil } = options;
  const now = options.now ?? (() => new Date());
  const failed = new Set<string>();
  const log: Log = (event, fields = {}) => console.error(JSON.stringify({ event, ...fields }));
  const github =
    env.KEY_ALERT_GITHUB_PAT && env.KEY_ALERT_GITHUB_REPO
      ? new Github(env.KEY_ALERT_GITHUB_PAT, env.KEY_ALERT_GITHUB_REPO, env, log)
      : null;

  const schedule = (work: () => Promise<void>) => {
    waitUntil(
      work().catch((error: unknown) =>
        log("key_alert_failed", { cause: redact(error instanceof Error ? error.message : String(error), env) })
      )
    );
  };

  return {
    failure(failure) {
      failed.add(markerFor(failure));
      log("key_failure", {
        service: failure.service,
        setting: failure.setting,
        mode: failure.mode,
        environment,
        feature,
        code: failure.code,
        message: redact(failure.message, env),
      });
      if (!github) {
        log("key_alert_off", { reason: "KEY_ALERT_GITHUB_PAT or KEY_ALERT_GITHUB_REPO is not set" });
        return;
      }
      const safe = { ...failure, message: redact(failure.message, env) };
      schedule(async () => {
        const at = now().toISOString();
        const open = findIssue(await github.openIssues(), safe);
        if (open) await github.comment(open.number, repeatComment(safe, at));
        else await github.create(issueTitle(safe, environment), issueBody(safe, environment, feature, at));
      });
    },
    recovered(refs) {
      const working = refs.filter((ref) => !failed.has(markerFor(ref)));
      if (!github || working.length === 0) return;
      schedule(async () => {
        const issues = await github.openIssues();
        for (const ref of working) {
          const open = findIssue(issues, ref);
          if (!open) continue;
          if ((await github.lastComment(open)).startsWith(RECOVERY_MARKER)) continue;
          await github.comment(open.number, recoveryComment(now().toISOString()));
        }
      });
    },
  };
}
