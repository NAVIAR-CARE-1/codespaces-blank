#!/usr/bin/env python3
"""BETA ART design-system check.

Checks the built page and the stylesheet against the rules in SKILL.md.
Exit code 0 = pass, 1 = at least one FAIL.

Usage (from the project root, the folder that holds src/ and dist/):
    python3 skills/beta-art-tasarim-sistemi/scripts/design_check.py
    python3 design_check.py --html dist/index.html --css src/styles.css
"""
import argparse, html, json, re, sys
from html.parser import HTMLParser
from pathlib import Path

WORD_FAIL, WORD_WARN = 20, 15   # per paragraph, EN and NO counted separately
PAGE_BUDGET = 1250              # all translatable text on the page, per language (Betul 29.09.2026: "az tekst")
MICRO_REM = 0.6875  # 11 px at a 16 px root

# Claims that were deliberately left out of BETA ART. They must never come back.
BANNED = [
    (r"84[.,\s]?000", "“84,000+ frames” claim"),
    (r"24\s*(saat|hours?|timer)", "“delivery within 24 hours” claim"),
    (r"70\s*[–-]\s*80\s*%|%\s*70\s*[–-]\s*80", "“photographers receive 70–80%” claim"),
    (r"%\s*30\s*/\s*%?\s*70|30\s*%\s*/\s*70\s*%", "unconfirmed 30/70 commission"),
    (r"Jotunheimen|Kongsberg", "invented plate location"),
    (r"[\w.+-]+@betaart\.no|[\w.+-]+@beta-art\.(no|com)", "unverified e-mail address"),
    (r"RAW Archived|Metadata Reviewed|License Signed", "fake verification tick"),
    (r"✓", "tick mark that implies verification"),
]


class Walk(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.h1 = 0
        self.stack = []
        self.i18n = {}      # key -> text (EN, as rendered)
        self.cur = []
        self.robots = ""
        self.gfonts = []
        self.lang_btns = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "h1":
            self.h1 += 1
        if tag == "meta" and a.get("name") == "robots":
            self.robots = a.get("content", "")
        if tag == "link" and "fonts.googleapis.com/css2" in (a.get("href") or ""):
            self.gfonts.append(a["href"])
        if a.get("data-lang-btn"):
            self.lang_btns += 1
        if "data-i18n" in a:
            self.cur.append([a["data-i18n"], [], tag])
        self.stack.append(tag)

    def handle_endtag(self, tag):
        if self.cur and self.cur[-1][2] == tag:
            k, parts, _ = self.cur.pop()
            self.i18n[k] = "".join(parts)
            if self.cur:
                self.cur[-1][1].append("".join(parts))
        if self.stack:
            self.stack.pop()

    def handle_data(self, data):
        if self.cur:
            self.cur[-1][1].append(data)


def words(s):
    s = re.sub(r"<[^>]+>", " ", html.unescape(s or "")).replace("­", "")
    return len([w for w in re.split(r"\s+", s) if re.search(r"\w", w)])


def strip_root_blocks(css):
    """Remove :root token blocks (light and dark) so hex colours elsewhere can be found."""
    return re.sub(r":root[^{]*\{[^}]*\}", "", css)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--html", default="dist/index.html")
    ap.add_argument("--css", default="src/styles.css")
    args = ap.parse_args()
    page = Path(args.html).read_text(encoding="utf-8")
    css = Path(args.css).read_text(encoding="utf-8")
    fails, warns, oks = [], [], []

    # 1. Tokens: no raw colours outside :root blocks.
    body_css = re.sub(r"/\*.*?\*/", "", strip_root_blocks(css), flags=re.S)
    raw = sorted(set(re.findall(r"#[0-9a-fA-F]{3,8}\b", body_css)))
    (fails if raw else oks).append(f"colour tokens only: {'raw colours ' + ', '.join(raw) if raw else 'no raw hex outside :root'}")

    # 2. Type floor: nothing below 11 px.
    small = []
    for m in re.finditer(r"font-size:\s*([0-9.]+)(rem|px)", css):
        v, unit = float(m.group(1)), m.group(2)
        if (unit == "rem" and v < MICRO_REM) or (unit == "px" and v < 11):
            small.append(m.group(0))
    (fails if small else oks).append(f"type floor 11 px: {', '.join(small) if small else 'ok'}")

    # 3. Eyebrow labels are sentence case.
    lab = re.search(r"\.label\{[^}]*\}", css)
    if lab and "uppercase" in lab.group(0):
        fails.append(".label uses text-transform:uppercase (eyebrows are sentence case)")
    else:
        oks.append(".label is sentence case")

    # 4. No glass blur, no rainbow gradients.
    slop = [p for p in ("backdrop-filter", "conic-gradient") if p in css]
    (fails if slop else oks).append(f"anti-slop: {', '.join(slop) if slop else 'no backdrop-filter / conic-gradient'}")

    # 5. Structure from the built page.
    w = Walk(); w.feed(page)
    (oks if w.h1 == 1 else fails).append(f"single h1: found {w.h1}")
    if "noindex" in w.robots:
        oks.append("noindex present (publication not approved)")
    else:
        fails.append("robots meta has no noindex; publication needs Betul's “yayınla”")
    (oks if w.lang_btns == 2 else fails).append(f"EN/NO switch buttons: {w.lang_btns}")

    # 6. Copy length and EN/NO parity.
    m = re.search(r"var NO = (\{.*?\});\n", page, flags=re.S)
    no = json.loads(m.group(1)) if m else {}
    missing = [k for k in w.i18n if k not in no]
    (fails if missing else oks).append(f"NO translation for every key: {len(w.i18n)} keys, missing {missing[:8] if missing else 0}")
    long_f, long_w = [], []
    for k, en in w.i18n.items():
        for lang, txt in (("en", en), ("no", no.get(k, ""))):
            n = words(txt)
            if n > WORD_FAIL:
                long_f.append(f"{k}/{lang}={n}")
            elif n > WORD_WARN:
                long_w.append(f"{k}/{lang}={n}")
    (fails if long_f else oks).append(f"paragraphs ≤ {WORD_FAIL} words: {', '.join(long_f) if long_f else 'ok'}")
    tot_en = sum(words(v) for v in w.i18n.values()); tot_no = sum(words(no.get(k, "")) for k in w.i18n)
    over = [f"{l} {n}" for l, n in (("EN", tot_en), ("NO", tot_no)) if n > PAGE_BUDGET]
    (fails if over else oks).append(f"page text budget ≤ {PAGE_BUDGET} words: EN {tot_en}, NO {tot_no}" + (f" (over: {', '.join(over)})" if over else ""))
    if long_w:
        warns.append(f"paragraphs over {WORD_WARN} words (target): {', '.join(long_w)}")

    # 6b. Middle dots only in record notation (BA-003 · Sea of Fog, BETA ART · Enquiry), never as label glue.
    dots = []
    for k, en in w.i18n.items():
        for lang, txt in (("en", en), ("no", no.get(k, ""))):
            plain = html.unescape(re.sub(r"<[^>]+>", "", txt or ""))
            if "·" in plain and not re.search(r"BETA ART ·|\b[A-Z]{2}-\d{3}\b", plain):
                dots.append(f"{k}/{lang}: {plain[:50]}")
    (fails if dots else oks).append(f"middle dots only in record notation: {'; '.join(dots[:6]) if dots else 'ok'}")

    # 7. Fabrication guard (visible text + dictionary).
    visible = re.sub(r"<script\b(?![^>]*ld\+json).*?</script>", " ", page, flags=re.S)
    haystack = html.unescape(re.sub(r"<[^>]+>", " ", visible)) + " " + " ".join(no.values())
    hits = [label for pat, label in BANNED if re.search(pat, haystack, flags=re.I)]
    (fails if hits else oks).append(f"no excluded claims: {', '.join(hits) if hits else 'ok'}")

    # 8. Font weights actually loaded.
    for href in w.gfonts:
        if re.search(r"Inter\+Tight:wght@[^&]*600|Fraunces[^&]*(500|600)\b", href):
            warns.append("Google Fonts URL loads weights the page does not use (Inter Tight 600 / Fraunces 500–600)")

    for s in oks: print("PASS ", s)
    for s in warns: print("WARN ", s)
    for s in fails: print("FAIL ", s)
    print(f"\n{len(oks)} pass, {len(warns)} warn, {len(fails)} fail")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
