// standard: turnstile@2026-09-12 (~/Code/Work/Sites/standards/turnstile/README.md)
//
// The site key is committed content, never a build/deploy variable. Routed
// through one, an unset or renamed variable silently disables the whole check
// while the form carries on accepting submissions (#18). It is public by
// design - the widget renders it into the page for every visitor - so there is
// nothing here to keep out of a public repo.
//
// On localhost/127.0.0.1 this swaps to Cloudflare's "always passes" test key,
// so local development never needs the real widget or a matching secret. The
// swap is deliberately host-based and not a fallback: a fallback is what let
// production quietly run on the test key.
const TEST_HOSTS = ["localhost", "127.0.0.1"];

const isTestHost =
  typeof window !== "undefined" && TEST_HOSTS.includes(window.location.hostname);

export const turnstileSiteKey = isTestHost
  ? "1x00000000000000000000AA"
  : "0x4AAAAAADmL9GKnshoGuOB2";
