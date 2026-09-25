#!/usr/bin/env bash
# Static checks for the site, runnable without Ruby.
#
# GitHub Pages builds this repo with Jekyll, but the NIGHTSHIFT sandbox image
# carries node and python3 only, so `bundle exec jekyll build` is not available
# there. These checks cover the failures that actually reach production from a
# design change: broken JS, a stylesheet or script that points at a file which
# is not in the repo, unbalanced CSS, and a page with no or many <h1>.
set -euo pipefail
cd "$(dirname "$0")/.."

fail=0
note() { printf '  %s\n' "$*"; }
step() { printf '\n%s\n' "$*"; }

step 'JavaScript syntax'
shopt -s nullglob
for f in assets/js/*.js; do
  if node --check "$f" 2>/dev/null; then
    note "ok      $f"
  else
    note "FAILED  $f"
    node --check "$f" || true
    fail=1
  fi
done

step 'Local asset references resolve'
python3 - <<'PY' || fail=1
import pathlib, re, sys

# Matches /assets/... inside plain href/src attributes and inside Liquid such as
# {{ '/assets/css/style.css' | relative_url }}.
ref = re.compile(r"/assets/[A-Za-z0-9_./-]+")
sources = [*pathlib.Path().glob("*.html"),
           *pathlib.Path("_layouts").glob("*.html"),
           *pathlib.Path("assets/css").glob("*.css"),
           *pathlib.Path("assets/js").glob("*.js")]

bad = False
for src in sources:
    for target in sorted(set(ref.findall(src.read_text()))):
        if pathlib.Path(target.lstrip("/")).exists():
            print(f"  ok      {target}  ({src})")
        else:
            print(f"  MISSING {target}  referenced by {src}")
            bad = True
sys.exit(1 if bad else 0)
PY

step 'CSS braces balance'
python3 - <<'PY' || fail=1
import pathlib, sys

bad = False
for css in sorted(pathlib.Path("assets/css").glob("*.css")):
    text = css.read_text()
    opened, closed = text.count("{"), text.count("}")
    if opened == closed:
        print(f"  ok      {css}  ({opened} rules)")
    else:
        print(f"  FAILED  {css}  {opened} '{{' vs {closed} '}}'")
        bad = True
sys.exit(1 if bad else 0)
PY

step 'Exactly one <h1> per page'
python3 - <<'PY' || fail=1
import pathlib, re, sys

bad = False
for page in sorted(pathlib.Path().glob("*.html")):
    n = len(re.findall(r"<h1[\s>]", page.read_text(), re.I))
    if n == 1:
        print(f"  ok      {page}")
    else:
        print(f"  FAILED  {page} has {n} <h1> elements, expected 1")
        bad = True
sys.exit(1 if bad else 0)
PY

if [ "$fail" -ne 0 ]; then
  printf '\ncheck-site: FAILED\n'
  exit 1
fi
printf '\ncheck-site: all checks passed\n'
