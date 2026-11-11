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
#             URL, sorted. <lastmod> (YYYY-MM-DD) = the newest git commit date of the route's page module (src/routes.ts
#             -> src/pages/<Page>.tsx) and the src/data/ modules it imports; never the build date (requirement
#             prerendering). Git history missing or shallow: every <lastmod> is omitted and one log line says why.
#             Skips 404.html, Google verification files and noindex pages.
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
python3 -I - "$ROOT" "$OUT" "$SITEMAP_PUBLIC" "$ROBOTS_PUBLIC" <<'PY' || exit 1
import os, re, subprocess, sys
from html.parser import HTMLParser
from urllib.parse import urlparse
from xml.sax.saxutils import escape

root, out, sm_public, rb_public = sys.argv[1], sys.argv[2], sys.argv[3] == "yes", sys.argv[4] == "yes"


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


def git(*args):
    r = subprocess.run(["git", "-C", root, *args], capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 else None


def history_problem():
    """Why git dates cannot be trusted, or None when the history is complete."""
    if git("rev-parse", "--is-inside-work-tree") != "true":
        return "no git history"
    if git("rev-parse", "--is-shallow-repository") != "false":
        return "shallow git history"
    return None


def route_modules():
    """{route path: [source files]}: the page module from src/routes.ts plus the src/data modules it imports."""
    try:
        routes = open(os.path.join(root, "src", "routes.ts"), encoding="utf-8").read()
    except OSError:
        return {}
    found = {"/": re.findall(r"index\(\s*['\"]([^'\"]+)['\"]", routes)}
    for path, page in re.findall(r"route\(\s*['\"]([^'\"]+)['\"]\s*,\s*['\"]([^'\"]+)['\"]", routes):
        found["/" + path] = [page]
    mods = {}
    for route, pages in found.items():
        files = []
        for page in pages:
            files.append(os.path.join("src", page))
            try:
                src = open(os.path.join(root, "src", page), encoding="utf-8").read()
            except OSError:
                continue
            for imp in re.findall(r"from\s+['\"]@/data/([^'\"]+)['\"]", src):
                for cand in (imp, imp + ".ts", imp + ".json", imp + "/index.ts"):
                    if os.path.isfile(os.path.join(root, "src", "data", cand)):
                        files.append(os.path.join("src", "data", cand))
                        break
        mods[route] = files
    return mods


def lastmods(urls, origin):
    """{url: YYYY-MM-DD} from git, or {} (with one log line) when the history is unusable."""
    problem = history_problem()
    if problem:
        print("FINISH NOTE: sitemap <lastmod> omitted for every URL: " + problem)
        return {}
    mods, dates = route_modules(), {}
    for url in urls:
        route = url[len(origin):] or "/"
        files = [f for f in mods.get(route, []) if os.path.isfile(os.path.join(root, f))]
        date = git("log", "-1", "--format=%cs", "--", *files) if files else None
        if date:
            dates[url] = date
    return dates


home = scan(os.path.join(out, "index.html"))
pu = urlparse(home.canon or "")
if pu.scheme != "https" or not pu.netloc:
    fail("build/client/index.html has no absolute https canonical link (got %r)" % (home.canon,))
origin = "https://" + pu.netloc

if not sm_public:
    locs = set()
    for base, dirs, files in os.walk(out):
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        for fn in files:
            if not fn.endswith(".html"):
                continue
            rel = os.path.relpath(os.path.join(base, fn), out)
            if rel in ("404.html", "__spa-fallback.html"):
                continue
            h = scan(os.path.join(base, fn))
            if h is None or h.noindex:
                continue
            if not h.canon:
                fail("no canonical link in " + rel)
            locs.add(h.canon)
    if not locs:
        fail("no pages to list in the sitemap")
    dates = lastmods(locs, origin)
    with open(os.path.join(out, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for loc in sorted(locs):
            mod = "<lastmod>%s</lastmod>" % dates[loc] if loc in dates else ""
            f.write("  <url><loc>%s</loc>%s</url>\n" % (escape(loc), mod))
        f.write("</urlset>\n")

if not rb_public:
    with open(os.path.join(out, "robots.txt"), "w", encoding="utf-8") as f:
        f.write("User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n" % origin)
PY
echo "FINISH PASS"

