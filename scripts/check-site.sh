#!/usr/bin/env bash
# check-site: static site gate for a Jekyll/GitHub Pages site.
# Uses only bash and python3 stdlib (no ruby, jekyll, PyYAML, npm or network).
# Checks must never be removed or weakened by later tasks; only added to.
set -euo pipefail
cd "$(dirname "$0")/.."

fail=0

fail_msg() {
  echo "check-site: $1"
  fail=1
}

# 1. required files must exist.
for f in index.html _layouts/default.html _config.yml assets/css/style.css assets/cv.pdf; do
  if [ ! -f "$f" ]; then
    fail_msg "missing required file: $f"
  fi
done

# 2. no package.json at the repo root.
if [ -f package.json ]; then
  fail_msg "package.json must not exist at the repo root"
fi

# 3. _config.yml must not declare a top-level plugins: or gems: key.
if [ -f _config.yml ] && grep -Eq '^(plugins|gems):' _config.yml; then
  fail_msg "_config.yml must not declare a top-level plugins: or gems: key"
fi

# Gather the html/liquid files the remaining checks scan: index.html,
# every _layouts/*.html and every _includes/*.html (if that dir exists).
files=(index.html)
for f in _layouts/*.html; do
  [ -f "$f" ] && files+=("$f")
done
for f in _includes/*.html; do
  [ -f "$f" ] && files+=("$f")
done

if ! python3 - "${files[@]}" <<'PY'
import sys, re, glob, os

files = sys.argv[1:]
failed = []

# 4. no <script src="..."> pointing at an http(s) or protocol-relative URL.
script_re = re.compile(r'<script\b[^>]*\bsrc\s*=\s*["\']((https?:)?//[^"\']*)["\']', re.IGNORECASE)

# 5. exactly one <h1 across all scanned files.
h1_count = 0

# 6. balanced Liquid block tags per file.
tag_pairs = [('for', 'endfor'), ('if', 'endif'), ('unless', 'endunless'), ('case', 'endcase')]
open_re = {name: re.compile(r'\{%-?\s*' + name + r'\b') for name, _ in tag_pairs}
close_re = {name: re.compile(r'\{%-?\s*' + name + r'\s*-?%\}') for _, name in tag_pairs}

# 7. every '/path' | relative_url reference must point at a file that exists.
relative_url_re = re.compile(r"""\{\{\s*['"](/[^'"]*)['"]\s*\|\s*relative_url\s*\}\}""")

for f in files:
    if not os.path.isfile(f):
        continue
    text = open(f, encoding='utf-8').read()

    for m in script_re.finditer(text):
        failed.append(f"{f}: external <script src> not allowed: {m.group(1)}")

    h1_count += len(re.findall(r'<h1\b', text, re.IGNORECASE))

    for open_name, close_name in tag_pairs:
        opens = len(open_re[open_name].findall(text))
        closes = len(close_re[close_name].findall(text))
        if opens != closes:
            failed.append(
                f"{f}: unbalanced {{% {open_name} %}}/{{% {close_name} %}} tags "
                f"({opens} open, {closes} close)"
            )

    for m in relative_url_re.finditer(text):
        target = m.group(1).lstrip('/')
        if not os.path.isfile(target):
            failed.append(f"{f}: relative_url reference to missing file: {m.group(1)}")

if h1_count != 1:
    failed.append(
        f"expected exactly one <h1> across {', '.join(files)}, found {h1_count}"
    )

# 8. every _data/*.yml file (if any) is non-empty and has no tab characters.
for f in sorted(glob.glob('_data/*.yml')):
    content = open(f, encoding='utf-8').read()
    if content.strip() == '':
        failed.append(f"{f}: _data yml file must not be empty")
    if '\t' in content:
        failed.append(f"{f}: _data yml file must not contain tab characters")

for msg in failed:
    print(f"check-site: {msg}")

sys.exit(1 if failed else 0)
PY
then
  fail=1
fi

# 9. the ambient canvas background and floating-shapes parallax must stay removed.
for f in index.html _layouts/*.html _includes/*.html; do
  [ -f "$f" ] || continue
  if grep -Eq 'background\.js|bg-canvas|floating-shapes' "$f"; then
    fail_msg "$f: must not reference background.js, bg-canvas or floating-shapes"
  fi
done

# 10. the cat cursor must stay unlinked from index.html, layouts and includes.
for f in index.html _layouts/*.html _includes/*.html; do
  [ -f "$f" ] || continue
  if grep -Eq 'cat-cursor' "$f"; then
    fail_msg "$f: must not reference cat-cursor"
  fi
done

# 11. _data/projects.yml must exist and hold at least one entry, and index.html
# must render it via site.data.projects rather than copy-pasted markup.
if [ ! -f _data/projects.yml ]; then
  fail_msg "missing required file: _data/projects.yml"
elif ! grep -Eq '^\s*-\s*title:' _data/projects.yml; then
  fail_msg "_data/projects.yml must contain at least one '- title:' entry"
fi

if ! grep -q 'site.data.projects' index.html; then
  fail_msg "index.html must loop over site.data.projects"
fi

# 12. heading order in index.html: the first heading must be <h1>, and no
# heading may skip more than one level deeper than the previous heading.
if ! python3 - index.html <<'PY'
import re, sys

text = open(sys.argv[1], encoding='utf-8').read()
# strip Liquid tags first so only literal HTML headings are inspected.
text = re.sub(r'\{%-?.*?-?%\}', '', text, flags=re.DOTALL)
text = re.sub(r'\{\{-?.*?-?\}\}', '', text, flags=re.DOTALL)

levels = [int(m.group(1)) for m in re.finditer(r'<h([1-6])\b', text, re.IGNORECASE)]

failed = []
if not levels or levels[0] != 1:
    failed.append("index.html: the first heading on the page must be <h1>")

prev = levels[0] if levels else 1
for level in levels[1:]:
    if level > prev + 1:
        failed.append(
            f"index.html: heading level jumps from h{prev} to h{level}, "
            "skipping a level"
        )
    prev = level

for msg in failed:
    print(f"check-site: {msg}")

sys.exit(1 if failed else 0)
PY
then
  fail=1
fi

# 13. every interactive element needs a visible :focus-visible outline;
# style.css must cover at least a, button and summary, and must never turn
# the outline off for a focus-visible rule.
if ! python3 - assets/css/style.css <<'PY'
import re, sys

text = open(sys.argv[1], encoding='utf-8').read()
text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)

failed = []
required = {'a', 'button', 'summary'}
covered = set()

for selector, body in re.findall(r'([^{}]+)\{([^{}]*)\}', text):
    if 'focus-visible' not in selector:
        continue
    m = re.search(r'outline\s*:\s*([^;]+);', body)
    if not m:
        continue
    value = m.group(1).strip().lower()
    if value in ('none', '0'):
        failed.append(
            f"assets/css/style.css: a :focus-visible rule disables the "
            f"outline ({selector.strip()})"
        )
        continue
    for tag in required:
        if re.search(r'(?<![\w-])' + tag + r'\s*:focus-visible', selector):
            covered.add(tag)

missing = required - covered
if missing:
    failed.append(
        "assets/css/style.css: :focus-visible must set a visible outline for "
        + ', '.join(sorted(missing))
    )

for msg in failed:
    print(f"check-site: {msg}")

sys.exit(1 if failed else 0)
PY
then
  fail=1
fi

# 14. prefers-reduced-motion: reduce must disable transitions and animations
# and force instant scrolling for every element on the page.
if ! python3 - assets/css/style.css <<'PY'
import re, sys

text = open(sys.argv[1], encoding='utf-8').read()
text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)

failed = []
block = None
start = text.find('@media')
while start != -1:
    if re.match(r'@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)', text[start:]):
        brace = text.index('{', start)
        depth, i = 0, brace
        while i < len(text):
            if text[i] == '{':
                depth += 1
            elif text[i] == '}':
                depth -= 1
                if depth == 0:
                    break
            i += 1
        block = text[brace + 1:i]
        break
    start = text.find('@media', start + 1)

if block is None:
    failed.append(
        "assets/css/style.css: missing @media (prefers-reduced-motion: reduce) block"
    )
else:
    universal_rule = re.search(r'\*[^{]*\{([^}]*)\}', block)
    if not universal_rule:
        failed.append(
            "assets/css/style.css: prefers-reduced-motion block must apply to a "
            "universal (*) selector so it disables motion for every element"
        )
    else:
        body = universal_rule.group(1).lower()
        if not re.search(r'transition\s*:\s*(none|0s?)\b', body):
            failed.append(
                "assets/css/style.css: prefers-reduced-motion universal rule "
                "must set transition: none"
            )
        if not re.search(r'animation\s*:\s*(none|0s?)\b', body):
            failed.append(
                "assets/css/style.css: prefers-reduced-motion universal rule "
                "must set animation: none"
            )

    if not re.search(r'scroll-behavior\s*:\s*auto\b', block.lower()):
        failed.append(
            "assets/css/style.css: prefers-reduced-motion block must set "
            "scroll-behavior: auto"
        )

for msg in failed:
    print(f"check-site: {msg}")

sys.exit(1 if failed else 0)
PY
then
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  exit 1
fi

echo "check-site: OK"
