#!/usr/bin/env python3
"""Write the next numbered BETA ART MAIN version (web-yayin-rutini, step 1).

Copies dist/index.html, the standalone page, to versions/beta-art-main-vNN.html.
An existing version is never overwritten.

Usage (from the project root):
    python3 tools/new_version.py            # writes the next version, prints e.g. v10
    python3 tools/new_version.py --dry-run  # prints the number it would use
"""
import hashlib, pathlib, re, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
VERSIONS = ROOT / "versions"
LIVE = ROOT / "dist" / "index.html"
NAME = "beta-art-main-v{:02d}.html"
# Betul's own BETA ART files already use V04 (BETA_ART_MAIN_V04_2026-10-01) and V08 (the chat build),
# so numbering in this repository continues after 08.
HIGHEST_BEFORE_REPO = 8


def next_number():
    found = [int(m.group(1)) for p in VERSIONS.glob("beta-art-main-v*.html")
             if (m := re.fullmatch(r"beta-art-main-v(\d{2,})\.html", p.name))]
    return max(found + [HIGHEST_BEFORE_REPO]) + 1


def main():
    n = next_number()
    if "--dry-run" in sys.argv:
        print(f"v{n:02d}")
        return 0
    if not LIVE.exists():
        sys.exit("dist/index.html not found: run python3 src/build.py first")
    VERSIONS.mkdir(exist_ok=True)
    target = VERSIONS / NAME.format(n)
    if target.exists():
        sys.exit(f"{target.name} already exists; versions are never overwritten")
    shutil.copy2(LIVE, target)
    same = hashlib.sha256(target.read_bytes()).digest() == hashlib.sha256(LIVE.read_bytes()).digest()
    if not same:
        sys.exit("copy differs from dist/index.html")
    print(f"v{n:02d}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
