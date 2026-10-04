#!/usr/bin/env python3
"""BETA ART media check.

Checks every image, video, audio and embed in the built pages, and every raster
file in a public asset folder, against the rules in SKILL.md.
Exit code 0 = pass, 1 = at least one FAIL.

Usage (from the project root):
    python3 skills/beta-art-medya/scripts/media_check.py
    python3 media_check.py --html dist/index.html dist/vercel/index.html --assets dist/vercel
"""
import argparse, re, sys
from html.parser import HTMLParser
from pathlib import Path

try:
    from PIL import Image, ExifTags
except ImportError:  # the HTML checks still run without Pillow
    Image = None

SIZE_WARN = 500 * 1024
EXPECTED = {"og.png": (1200, 630), "apple-touch-icon.png": (180, 180), "favicon-32.png": (32, 32)}
GPS_TAG = 0x8825
CAMERA_TAGS = {0x010F: "Make", 0x0110: "Model", 0x0132: "DateTime", 0x9003: "DateTimeOriginal", 0x013B: "Artist"}


class Media(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.items = []          # (tag, attrs, line, inside_picture, picture_sources)
        self.pic = None
        self.video = None
        self.meta = {}

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        line = self.getpos()[0]
        if tag == "picture":
            self.pic = []
        elif tag == "source" and self.pic is not None:
            self.pic.append(a.get("type", ""))
        elif tag == "img":
            self.items.append(("img", a, line, self.pic is not None, list(self.pic or [])))
        elif tag == "video":
            self.video = {"a": a, "line": line, "tracks": []}
        elif tag == "track" and self.video is not None:
            self.video["tracks"].append(a.get("kind", ""))
        elif tag in ("audio", "iframe", "embed", "object"):
            self.items.append((tag, a, line, False, []))
        elif tag == "meta" and (a.get("property") or a.get("name")):
            self.meta[a.get("property") or a.get("name")] = a.get("content", "")

    def handle_endtag(self, tag):
        if tag == "picture":
            self.pic = None
        elif tag == "video" and self.video is not None:
            self.items.append(("video", self.video["a"], self.video["line"], False, self.video["tracks"]))
            self.video = None


def is_external(url):
    return bool(re.match(r"^(https?:)?//", url or ""))


def check_html(path, fails, warns, oks):
    p = Media(); p.feed(Path(path).read_text(encoding="utf-8"))
    name = Path(path).as_posix()
    imgs = [i for i in p.items if i[0] == "img"]
    for n, (tag, a, line, in_pic, sources) in enumerate(p.items):
        where = f"{name}:{line} <{tag}>"
        srcs = " ".join(a.get(k, "") for k in ("src", "srcset", "poster", "data"))
        if any(is_external(u) for u in srcs.split()):
            fails.append(f"{where} loads media from another site ({srcs[:80]}); media is served from the site itself")
        if tag == "img":
            if "alt" not in a:
                fails.append(f"{where} has no alt attribute")
            elif not a["alt"].strip() and a.get("aria-hidden") != "true" and a.get("role") not in ("presentation", "none"):
                warns.append(f"{where} has empty alt; fine only if purely decorative")
            if not (a.get("width") and a.get("height")) and "aspect-ratio" not in a.get("style", ""):
                fails.append(f"{where} has no width/height (layout shift)")
            if imgs and (tag, a, line, in_pic, sources) != imgs[0] and "loading" not in a:
                warns.append(f"{where} below the first image without loading=\"lazy\"")
            src = a.get("src", "")
            if re.search(r"\.(jpe?g|png)(\?|$)", src, re.I) and not any("avif" in s or "webp" in s for s in sources):
                small = a.get("width", "0").isdigit() and int(a.get("width", "0")) <= 256
                if not small:
                    warns.append(f"{where} {src} has no AVIF/WebP <source>")
        elif tag == "video":
            if "autoplay" in a and "muted" not in a:
                fails.append(f"{where} autoplays with sound")
            if "captions" not in sources and "subtitles" not in sources:
                fails.append(f"{where} has no captions track (EN and NO)")
            if not a.get("poster"):
                warns.append(f"{where} has no poster frame")
        elif tag == "audio":
            if "autoplay" in a:
                fails.append(f"{where} autoplays audio")
        else:
            fails.append(f"{where} third-party embed; CSP is frame-src none and embeds need Betul's decision")
    if "og:image" in p.meta:
        og = p.meta["og:image"]
        if not is_external(og):
            warns.append(f"{name}: og:image is relative ({og}); set SITE in build.py once the domain is chosen")
        else:
            oks.append(f"{name}: og:image {og}")
        if not p.meta.get("og:image:alt"):
            warns.append(f"{name}: og:image has no og:image:alt")
    oks.append(f"{name}: {len(p.items)} media element(s) checked")


def check_assets(folder, fails, warns, oks):
    root = Path(folder)
    site = (root / "index.html").exists()  # share image and icons are only expected next to a page
    for fname, dims in (EXPECTED.items() if site else []):
        f = root / fname
        if not f.exists():
            warns.append(f"{fname} missing in {root}")
        elif Image:
            with Image.open(f) as im:
                (oks if im.size == dims else fails).append(f"{fname} is {im.size[0]}×{im.size[1]} (expected {dims[0]}×{dims[1]})")
    if site and not (root / "favicon.svg").exists():
        warns.append("favicon.svg missing")
    for f in sorted(root.rglob("*")):
        if not f.is_file():
            continue
        rel = f.relative_to(root).as_posix()
        if f.suffix.lower() in (".ttf", ".otf", ".woff", ".eot"):
            warns.append(f"{rel}: font is not woff2")
        if f.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"):
            continue
        if f.stat().st_size > SIZE_WARN:
            warns.append(f"{rel}: {f.stat().st_size // 1024} KB, above the 500 KB budget for a public file")
        if not Image:
            continue
        try:
            with Image.open(f) as im:
                exif = im.getexif()
                if exif and (GPS_TAG in exif or exif.get_ifd(GPS_TAG)):
                    fails.append(f"{rel}: contains GPS position; public files never carry location")
                cam = [v for k, v in CAMERA_TAGS.items() if k in exif]
                if cam:
                    warns.append(f"{rel}: carries camera metadata ({', '.join(cam)}); capture data belongs in the passport, read from the vault original")
                if im.mode not in ("RGB", "RGBA", "P", "L", "LA"):
                    warns.append(f"{rel}: colour mode {im.mode}; public files are sRGB")
                icc = im.info.get("icc_profile")
                if icc and b"sRGB" not in icc:
                    warns.append(f"{rel}: embedded colour profile is not sRGB")
        except Exception as e:  # unreadable file is a failure, not a crash
            fails.append(f"{rel}: cannot be opened ({e.__class__.__name__})")
    fonts = [f.name for f in root.rglob("*.woff2")]
    for fam, lic in (("fraunces", "OFL-Fraunces.txt"), ("inter-tight", "OFL-InterTight.txt"), ("ibm-plex-mono", "OFL-IBMPlexMono.txt")):
        if any(n.startswith(fam) for n in fonts) and not list(root.rglob(lic)):
            warns.append(f"{fam} fonts shipped without {lic}")
    oks.append(f"{root.as_posix()}: assets checked")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--html", nargs="*", default=["dist/index.html", "dist/vercel/index.html"])
    ap.add_argument("--assets", default="dist/vercel")
    args = ap.parse_args()
    fails, warns, oks = [], [], []
    for h in args.html:
        if Path(h).exists():
            check_html(h, fails, warns, oks)
        else:
            warns.append(f"{h} not found")
    if args.assets and Path(args.assets).exists():
        check_assets(args.assets, fails, warns, oks)
    for s in oks: print("PASS ", s)
    for s in warns: print("WARN ", s)
    for s in fails: print("FAIL ", s)
    print(f"\n{len(oks)} pass, {len(warns)} warn, {len(fails)} fail")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
