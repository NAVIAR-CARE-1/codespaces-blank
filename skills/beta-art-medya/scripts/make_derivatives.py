#!/usr/bin/env python3
"""Make public web derivatives of one BETA ART original, without touching the original.

The original stays in the vault with every byte and all its metadata. The public
copies are sRGB, never upscaled, and carry no EXIF, GPS or camera data.
A JSON record ties each derivative to the SHA-256 of the original.

Usage:
    python3 make_derivatives.py ORIGINAL --id BA-003 --out media/public
    python3 make_derivatives.py ORIGINAL --id BA-003 --widths 480 960 1600 2400
The <picture> snippet it prints has empty alt texts on purpose: a person who has
seen the image writes them (EN and NO). Nothing is guessed.
"""
import argparse, hashlib, io, json, re, sys
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageCms, ImageOps, features

GPS_TAG = 0x8825


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def to_srgb(im):
    icc = im.info.get("icc_profile")
    if icc:
        try:
            src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
            im = ImageCms.profileToProfile(im, src, ImageCms.createProfile("sRGB"), outputMode="RGB")
        except Exception:
            im = im.convert("RGB")
    return im.convert("RGB")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("original")
    ap.add_argument("--id", required=True, help="BETA-ID, e.g. BA-003")
    ap.add_argument("--out", default="media/public")
    ap.add_argument("--widths", nargs="*", type=int, default=[480, 960, 1600, 2400])
    a = ap.parse_args()
    if not re.fullmatch(r"BA-\d{3}", a.id):
        sys.exit("--id must look like BA-003")
    src = Path(a.original)
    raw = src.read_bytes()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)

    with Image.open(io.BytesIO(raw)) as im0:
        exif = im0.getexif()
        had_gps = bool(exif and (GPS_TAG in exif or exif.get_ifd(GPS_TAG)))
        im = ImageOps.exif_transpose(im0)  # respect camera orientation, then drop the tag
        im = to_srgb(im)
    W, H = im.size
    widths = sorted({w for w in a.widths if w <= W}) or [W]
    if max(W, H) < 1200:
        print(f"note: original is only {W}×{H}; derivatives stay at that size (never upscaled)", file=sys.stderr)

    formats = [("avif", "AVIF", {"quality": 55})] if features.check("avif") else []
    formats += [("webp", "WEBP", {"quality": 78, "method": 6}), ("jpg", "JPEG", {"quality": 82, "progressive": True, "optimize": True})]
    made = []
    for w in widths:
        h = round(H * w / W)
        frame = im if w == W else im.resize((w, h), Image.LANCZOS)
        for ext, fmt, opts in formats:
            buf = io.BytesIO()
            frame.save(buf, fmt, **opts)  # no exif=, no icc_profile= : public copies carry no metadata
            data = buf.getvalue()
            name = f"{a.id}-{w}.{ext}"
            (out / name).write_bytes(data)
            made.append({"file": name, "width": w, "height": h, "bytes": len(data), "sha256": sha256(data)})

    record = {
        "beta_id": a.id,
        "original": {"file": src.name, "sha256": sha256(raw), "width": W, "height": H, "had_gps": had_gps},
        "public_copies": made,
        "metadata_stripped": True,
        "made_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "note": "Public copies only. The original, its metadata and its checksum stay in the vault.",
    }
    (out / f"{a.id}-media.json").write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")

    big = widths[-1]; bh = round(H * big / W)
    srcset = lambda ext: ", ".join(f"{a.id}-{w}.{ext} {w}w" for w in widths)
    lines = ["<picture>"]
    if formats[0][0] == "avif":
        lines.append(f'  <source type="image/avif" srcset="{srcset("avif")}" sizes="(max-width: 860px) 100vw, 50vw">')
    lines.append(f'  <source type="image/webp" srcset="{srcset("webp")}" sizes="(max-width: 860px) 100vw, 50vw">')
    lines.append(f'  <img src="{a.id}-{widths[min(1, len(widths) - 1)]}.jpg" srcset="{srcset("jpg")}" sizes="(max-width: 860px) 100vw, 50vw"')
    lines.append(f'       width="{big}" height="{bh}" loading="lazy" decoding="async" alt="" data-alt-en="" data-alt-no="">')
    lines.append("</picture>")
    print("\n".join(lines))
    print(f"\n{len(made)} files in {out}. Fill data-alt-en / data-alt-no by hand before use.", file=sys.stderr)


if __name__ == "__main__":
    main()
