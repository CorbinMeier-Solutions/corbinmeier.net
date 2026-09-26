/// <reference types="@cloudflare/workers-types" />

// Bindings available to the Cloudflare Pages Functions in this directory.
// Configure these as secrets/vars on the Pages project, not in source.
interface CloudflareEnv {
  RESEND_API_KEY: string;
  PERSONAL_EMAIL: string;
  TURNSTILE_SECRET: string;
}
