/// <reference types="vite/client" />
import { afterEach, describe, expect, it, vi } from "vitest";
import wranglerToml from "../../wrangler.toml?raw";
import { EmailSendError, parseRecipients, sendEmail } from "./send-email";

// RFC 5322 "Display Name <user@domain.tld>" - the shape the API accepts.
const SENDER = /^[^<>@\r\n]+ <[^\s@<>.]+(\.[^\s@<>.]+)*@[^\s@<>.]+(\.[^\s@<>.]+)+>$/;

describe("MAIL_FROM in wrangler.toml", () => {
  const values = [...wranglerToml.matchAll(/^MAIL_FROM\s*=\s*"([^"]*)"/gm)].map((m) => m[1]);

  it("is set in both the production and preview blocks", () => {
    expect(values).toHaveLength(2);
  });

  it.each(values)("parses as a display name plus address: %s", (value) => {
    expect(value).toMatch(SENDER);
  });
});

describe("parseRecipients", () => {
  it("splits, trims and drops empties", () => {
    expect(parseRecipients(" a@x.com, b@y.com ,, ")).toEqual(["a@x.com", "b@y.com"]);
  });
  it("normalises arrays too", () => {
    expect(parseRecipients(["a@x.com ", ""])).toEqual(["a@x.com"]);
  });
  it("returns an empty list for an empty value", () => {
    expect(parseRecipients("")).toEqual([]);
  });
});

describe("sendEmail", () => {
  const env = { CLOUDFLARE_ACCOUNT_ID: "acct", CLOUDFLARE_EMAIL_API_TOKEN: "token-placeholder" };
  const message = {
    from: "Site <contact@example.com>",
    to: "a@x.com, b@y.com",
    subject: "Hi",
    html: "<p>Hi</p>",
    text: "Hi",
    replyTo: '"Ada" <ada@z.com>',
  };
  const ok = () =>
    new Response(JSON.stringify({ success: true, result: { delivered: [], permanent_bounces: [], queued: [] } }));
  const rejected = () => new Response(JSON.stringify({ success: false, errors: [{ code: 1, message: "no" }] }), { status: 400 });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sends one message per recipient, mapping replyTo", async () => {
    const fetchMock = vi.fn<(url: string, init: { body: string }) => Promise<Response>>(async () => ok());
    vi.stubGlobal("fetch", fetchMock);
    await sendEmail(env, message);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const bodies = fetchMock.mock.calls.map((c) => JSON.parse(c[1].body));
    expect(bodies.map((b) => b.to)).toEqual(["a@x.com", "b@y.com"]);
    expect(bodies[0].reply_to).toBe('"Ada" <ada@z.com>');
  });

  it("succeeds when any recipient is accepted", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValueOnce(rejected()).mockResolvedValueOnce(ok());
    vi.stubGlobal("fetch", fetchMock);
    await expect(sendEmail(env, message)).resolves.toBeUndefined();
  });

  it("throws when no recipient is accepted", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(async () => rejected()));
    await expect(sendEmail(env, message)).rejects.toBeInstanceOf(EmailSendError);
  });

  it("throws a configuration error without credentials", async () => {
    await expect(sendEmail({}, message)).rejects.toBeInstanceOf(EmailSendError);
  });
});
