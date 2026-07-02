const { chromium } = require("playwright");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
    });
    await page.goto(appUrl, { waitUntil: "load" });
    await page.evaluate(() => localStorage.removeItem("suiyoukai-shrine-today-teachers-v1"));
    await page.reload({ waitUntil: "load" });
    await page.locator('[data-map-destination="shrine"]').click();
    await page.locator("[data-shrine-intro-skip]").click();
    await page.locator('[data-view="shrine"]').waitFor({ state: "visible" });
    await page.screenshot({
      path: "docs/shrine-today-teachers-visual-2026-07-02.png",
      fullPage: true,
    });
    console.log("Saved docs/shrine-today-teachers-visual-2026-07-02.png");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
