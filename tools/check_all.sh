#!/usr/bin/env bash
# BETA ART acceptance: build, design and media checks, browser checks. Stops at the first failure.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 src/build.py
python3 skills/beta-art-tasarim-sistemi/scripts/design_check.py
python3 skills/beta-art-tasarim-sistemi/scripts/design_check.py --html dist/vercel/index.html
python3 skills/beta-art-medya/scripts/media_check.py
python3 tools/browser_check.py
echo "ALL CHECKS PASSED"
