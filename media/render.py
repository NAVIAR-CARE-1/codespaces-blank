"""Render BETA ART share image and icons from media/ into an output folder (default ../dist/vercel)."""
import asyncio, glob, os, sys, pathlib
from playwright.async_api import async_playwright
HERE = pathlib.Path(__file__).resolve().parent
OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else HERE.parent / "dist" / "vercel"
def chromium():
    """BA_CHROMIUM, else a preinstalled Chromium under PLAYWRIGHT_BROWSERS_PATH, else Playwright's own download."""
    if os.environ.get("BA_CHROMIUM"):
        return os.environ["BA_CHROMIUM"]
    found = sorted(glob.glob(os.path.join(os.environ.get("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers"), "chromium-*", "chrome-linux", "chrome")))
    return found[-1] if found else None
async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=chromium())
        pg = await (await b.new_context(viewport={"width": 1200, "height": 630}, device_scale_factor=1)).new_page()
        await pg.goto((HERE / "og.html").as_uri()); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(300)
        await pg.locator(".c").screenshot(path=str(OUT / "og.png"))
        pg2 = await (await b.new_context(viewport={"width": 180, "height": 180}, device_scale_factor=1)).new_page()
        await pg2.goto((HERE / "icon.html").as_uri()); await pg2.locator(".i").screenshot(path=str(OUT / "apple-touch-icon.png"))
        pg3 = await (await b.new_context(viewport={"width": 32, "height": 32}, device_scale_factor=1)).new_page()
        await pg3.set_content('<style>html,body{margin:0;background:transparent}</style><img src="' + (HERE / "favicon.svg").as_uri() + '" width="32" height="32" style="display:block">')
        await pg3.wait_for_timeout(200); await pg3.screenshot(path=str(OUT / "favicon-32.png"), omit_background=True, clip={"x":0,"y":0,"width":32,"height":32})
        await b.close()
    (OUT / "favicon.svg").write_text((HERE / "favicon.svg").read_text())
    print("rendered into", OUT)
asyncio.run(main())
