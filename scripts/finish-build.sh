#!/usr/bin/env bash
# finish-build.sh - post-build step for a React Router prerendered site on Cloudflare Pages.
# Usage:   scripts/finish-build.sh   (runs inside `npm run build`, after `react-router build`;
#          runs from any cwd, finds the project root from its own location: <root>/scripts/)
# Does:    1. /404/index.html -> build/client/404.html (Pages serves it, with a 404 status, for unknown
#             paths); removes __spa-fallback.html on a fully prerendered site.
#          2. Flattens every <route>/index.html to <route>.html so Pages serves /<route> directly
#             instead of 308-redirecting to /<route>/ (canonical links carry no trailing slash).
#             Directories that are tier-3 rewrite targets in public/_redirects (`/x/*  /x/  200`) stay.
#          3. Origin = the canonical origin of build/client/index.html (must be https).
#          4. sitemap.xml, only when public/sitemap.xml does not exist: one <loc> per page by its canonical
#             URL, sorted, no <lastmod> (a build date is not a real last change). Skips 404.html, Google
#             verification files and noindex pages.
#          5. robots.txt, only when public/robots.txt does not exist: allow all + Sitemap line.
# Success: prints "FINISH PASS". Failure: "FINISH FAIL: <why>" and exit 1.
set -euo pipefail

fail() { echo "FINISH FAIL: $1"; exit 1; }

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/build/client"
[ -f "$OUT/index.html" ] || fail "no build/client/index.html (run react-router build first)"

# Tier-3 rewrite targets: `/x/*  /x/  200` lines in public/_redirects (one directory per line).
TIER3=()
if [ -f "$ROOT/public/_redirects" ]; then
  while IFS= read -r d; do TIER3+=("$d"); done < <(
    awk '!/^[[:space:]]*(#|$)/ && NF>=3 && $3=="200" && $1 ~ /\/\*$/ && $1!="/*" && $2 !~ /^\/index(\.html)?$/ { s=$1; sub(/\/\*$/,"",s); sub(/^\//,"",s); print s }' "$ROOT/public/_redirects")
fi
is_tier3() { # relative dir (no slashes at the ends)
  local d
  for d in ${TIER3[@]+"${TIER3[@]}"}; do
    [ "$1" = "$d" ] || [[ "$1" == "$d"/* ]] && return 0
  done
  return 1
}

# 1. 404 page.
if [ -f "$OUT/404/index.html" ]; then
  mv "$OUT/404/index.html" "$OUT/404.html"
  rmdir "$OUT/404" 2>/dev/null || true
elif [ ! -f "$OUT/404.html" ] && [ ${#TIER3[@]} -eq 0 ]; then
  fail "no prerendered /404 (build/client/404/index.html) and no tier-3 rewrite in public/_redirects"
fi
[ ${#TIER3[@]} -eq 0 ] && rm -f "$OUT/__spa-fallback.html"

# 2. Flatten <route>/index.html (deepest first); remove the directory only when it is left empty.
while IFS= read -r page; do
  dir="$(dirname "$page")"
  rel="${dir#"$OUT"/}"
  is_tier3 "$rel" && continue
  [ -e "$dir.html" ] && fail "cannot flatten $rel/index.html: $rel.html already exists"
  mv "$page" "$dir.html"
  rmdir "$dir" 2>/dev/null || true
done < <(find "$OUT" -mindepth 2 -name index.html -not -path "$OUT/assets/*" | sort -r)

# 3-5. Origin, sitemap, robots.
SITEMAP_PUBLIC=no; ROBOTS_PUBLIC=no
[ -f "$ROOT/public/sitemap.xml" ] && SITEMAP_PUBLIC=yes
[ -f "$ROOT/public/robots.txt" ] && ROBOTS_PUBLIC=yes
python3 -I - "$OUT" "$SITEMAP_PUBLIC" "$ROBOTS_PUBLIC" <<'PY' || exit 1
import os, sys
from html.parser import HTMLParser
from urllib.parse import urlparse
from xml.sax.saxutils import escape

out, sm_public, rb_public = sys.argv[1], sys.argv[2] == "yes", sys.argv[3] == "yes"


def fail(msg):
    print("FINISH FAIL: " + msg)
    sys.exit(1)


class Head(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.canon, self.noindex = None, False

    def handle_starttag(self, tag, attrs):
        a = {k.lower(): (v or "") for k, v in attrs}
        if tag == "link" and "canonical" in a.get("rel", "").lower().split() and self.canon is None:
            self.canon = a.get("href", "").strip()
        elif tag == "meta" and a.get("name", "").lower() in ("robots", "googlebot") and "noindex" in a.get("content", "").lower():
            self.noindex = True


def scan(path):
    h = Head()
    with open(path, "rb") as fh:
        raw = fh.read(3 * 1024 * 1024)
    if raw.lstrip()[:24].lower().startswith(b"google-site-verification"):
        return None
    h.feed(raw.decode("utf-8", "replace"))
    return h


home = scan(os.path.join(out, "index.html"))
pu = urlparse(home.canon or "")
if pu.scheme != "https" or not pu.netloc:
    fail("build/client/index.html has no absolute https canonical link (got %r)" % (home.canon,))
origin = "https://" + pu.netloc

if not sm_public:
    locs = set()
    for root, dirs, files in os.walk(out):
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        for fn in files:
            if not fn.endswith(".html"):
                continue
            rel = os.path.relpath(os.path.join(root, fn), out)
            if rel in ("404.html", "__spa-fallback.html"):
                continue
            h = scan(os.path.join(root, fn))
            if h is None or h.noindex:
                continue
            if not h.canon:
                fail("no canonical link in " + rel)
            locs.add(h.canon)
    if not locs:
        fail("no pages to list in the sitemap")
    with open(os.path.join(out, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for loc in sorted(locs):
            f.write("  <url><loc>%s</loc></url>\n" % escape(loc))
        f.write("</urlset>\n")

if not rb_public:
    with open(os.path.join(out, "robots.txt"), "w", encoding="utf-8") as f:
        f.write("User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n" % origin)
PY
echo "FINISH PASS"

