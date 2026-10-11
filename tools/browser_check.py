#!/usr/bin/env python3
"""BETA ART browser checks for the release package in dist/vercel.

axe-core (WCAG 2.2 AA) in four views, console errors, broken in-page links,
horizontal overflow at 320 and 390 px, passport focus return, the rights-claim
route into Join, and the strict CSP from dist/vercel/vercel.json.
Exit code 0 = pass, 1 = at least one FAIL.

Usage (from the project root):
    python3 tools/browser_check.py
Chromium: BA_CHROMIUM, else the newest under PLAYWRIGHT_BROWSERS_PATH, else Playwright's own.
axe-core: BA_AXE (path to axe.min.js), else installed once into ~/.cache/beta-art/axe.
"""
import asyncio, glob, json, os, pathlib, subprocess, sys, time
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
REL = ROOT / "dist" / "vercel"
PORT = 8765


def chromium():
    if os.environ.get("BA_CHROMIUM"):
        return os.environ["BA_CHROMIUM"]
    found = sorted(glob.glob(os.path.join(os.environ.get("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers"), "chromium-*", "chrome-linux", "chrome")))
    return found[-1] if found else None


def axe_source():
    if os.environ.get("BA_AXE"):
        return pathlib.Path(os.environ["BA_AXE"]).read_text(encoding="utf-8")
    cache = pathlib.Path.home() / ".cache" / "beta-art" / "axe"
    js = cache / "node_modules" / "axe-core" / "axe.min.js"
    if not js.exists():
        cache.mkdir(parents=True, exist_ok=True)
        subprocess.run(["npm", "install", "--prefix", str(cache), "--no-save", "--silent", "axe-core@4"], check=True)
    return js.read_text(encoding="utf-8")


AXE_RUN = ("async () => { const r = await axe.run(document, {runOnly:{type:'tag',values:"
           "['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}}); "
           "return r.violations.map(v => ({id: v.id, impact: v.impact, nodes: v.nodes.slice(0, 3).map(n => n.target.join(' '))})) }")
OVERFLOW = ("() => ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, "
            "wide: [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); "
            "return r.right > document.documentElement.clientWidth + 1 && getComputedStyle(e).position !== 'fixed' "
            "&& !e.closest('.tbl-wrap,.mnav,dialog'); }).slice(0, 6).map(e => e.tagName + '.' + e.className)})")
LINKS = ("() => [...new Set([...document.querySelectorAll('a[href^=\"#\"]')].map(a => a.getAttribute('href')))]"
         ".filter(h => h.length > 1 && !document.getElementById(h.slice(1)))")


async def main():
    fails, oks = [], []
    axe = axe_source()
    csp = [h["value"] for h in json.loads((REL / "vercel.json").read_text())["headers"][0]["headers"]
           if h["key"] == "Content-Security-Policy"][0].replace("upgrade-insecure-requests", "")
    url = f"http://127.0.0.1:{PORT}/"

    async def run_axe(pg, label):
        await pg.add_script_tag(content=axe)
        v = await pg.evaluate(AXE_RUN)
        (fails if v else oks).append(f"axe {label}: {len(v)} violation(s)" + (f" {json.dumps(v)[:400]}" if v else ""))

    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=chromium())

        async def page(**ctx):
            c = await b.new_context(**ctx)
            pg = await c.new_page()
            errs = []
            pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(url)
            await pg.wait_for_timeout(600)
            return c, pg, errs

        c, pg, errs = await page(viewport={"width": 1440, "height": 900}, color_scheme="light")
        bad = await pg.evaluate(LINKS)
        (fails if bad else oks).append(f"in-page links: {'broken ' + ', '.join(bad) if bad else 'all resolve'}")
        await run_axe(pg, "light/EN/desktop")
        first = pg.locator(".pl").first
        pid = await first.get_attribute("data-id")
        await first.click(); await pg.wait_for_timeout(300)
        is_open = await pg.evaluate("document.getElementById('passport').open")
        (oks if is_open else fails).append(f"passport opens: {is_open}")
        await run_axe(pg, "passport open")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
        back = await pg.evaluate("document.activeElement && document.activeElement.dataset.id")
        (oks if back == pid else fails).append(f"focus returns to plate: {back} (expected {pid})")
        await first.click(); await pg.wait_for_timeout(200)
        await pg.locator("#ppClaim").click(); await pg.wait_for_timeout(400)
        route = await pg.evaluate("document.getElementById('enqRoute').value")
        (oks if route == "rights" else fails).append(f"rights claim opens the enquiry: route={route}")
        (fails if errs else oks).append(f"console errors light/EN: {errs or 0}")
        await c.close()

        c, pg, errs = await page(viewport={"width": 1280, "height": 900}, color_scheme="dark")
        await pg.locator('[data-lang-btn="no"]').first.click(); await pg.wait_for_timeout(300)
        lang = await pg.evaluate("document.documentElement.lang")
        (oks if lang == "nb" else fails).append(f"html lang after NB: {lang}")
        await run_axe(pg, "dark/NO/desktop")
        (fails if errs else oks).append(f"console errors dark/NO: {errs or 0}")
        await c.close()

        for w in (390, 320):
            c, pg, errs = await page(viewport={"width": w, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
            await pg.locator('[data-lang-btn="no"]').first.click(); await pg.wait_for_timeout(300)
            ov = await pg.evaluate(OVERFLOW)
            (oks if ov["sw"] <= w and not ov["wide"] else fails).append(f"overflow {w}px/NO: scrollWidth {ov['sw']}, wide {ov['wide'] or 'none'}")
            if w == 390:
                await run_axe(pg, "mobile/NO")
            (fails if errs else oks).append(f"console errors {w}px: {errs or 0}")
            await c.close()

        c = await b.new_context(viewport={"width": 1440, "height": 900})
        pg = await c.new_page()
        msgs, ext = [], []
        pg.on("console", lambda m: msgs.append(m.text) if m.type in ("error", "warning") else None)
        pg.on("request", lambda r: ext.append(r.url) if not r.url.startswith(url[:-1]) and not r.url.startswith("data:") else None)

        async def add_csp(route):
            r = await route.fetch()
            h = dict(r.headers); h["content-security-policy"] = csp
            await route.fulfill(response=r, headers=h)
        await pg.route("**/*", add_csp)
        await pg.goto(url); await pg.wait_for_timeout(800)
        await pg.locator('[data-lang-btn="no"]').first.click()
        await pg.locator(".pl").nth(1).click(); await pg.wait_for_timeout(300)
        works = await pg.evaluate("document.getElementById('passport').open")
        (fails if msgs or ext or not works else oks).append(
            f"strict CSP: messages {msgs or 0}, external requests {ext or 0}, script runs {works}")
        await c.close()
        await b.close()

    for s in oks: print("PASS ", s)
    for s in fails: print("FAIL ", s)
    print(f"\n{len(oks)} pass, {len(fails)} fail")
    return 1 if fails else 0


if __name__ == "__main__":
    if not (REL / "index.html").exists():
        sys.exit("dist/vercel/index.html not found: run python3 src/build.py first")
    srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"], cwd=REL,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        code = asyncio.run(main())
    finally:
        srv.terminate()
    sys.exit(code)
