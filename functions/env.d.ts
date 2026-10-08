/// <reference types="@cloudflare/workers-types" />

// Bindings available to the Cloudflare Pages Functions in this directory.
// Secrets are set on the Pages project; plain values live in wrangler.toml [vars].
interface CloudflareEnv {
  CLOUDFLARE_EMAIL_API_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  MAIL_FROM: string;
  FORM_TO_ADDRESSES: string;
  TURNSTILE_SECRET: string;
}
