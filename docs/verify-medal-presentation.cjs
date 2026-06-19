const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;
const outputDir = path.join(__dirname, "medal-presentation-check-2026-06-19");
const progressKey = "suiyoukai-stamp-progress-v1";
const teacherIds = ["tsuneishi", "yuki", "koike", "yamashiro", "matsumoto"];

fs.mkdirSync(outputDir, { recursive: true });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const seed = async (page, participationCount, teacherCount) => {
  await page.evaluate(([key, ids, participation, teacher]) => {
    localStorage.setItem(key, JSON.stringify({
      schemaVersion: 2,
      stamps: {
        participationCount: participation,
        teacherLessonCounts: Object.fromEntries(ids.map((id) => [id, teacher])),
        teacherCircleRounds: teacher,
      },
      earned: { fairies: [], medals: [], titles: [], companions: [] },
    }));
  }, [progressKey, teacherIds, participationCount, teacherCount]);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(850);
};

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const page = await context.newPage();
  const checks = [];
  const errors = [];

  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  try {
    await page.goto(appUrl, { waitUntil: "load" });
    await seed(page, 10, 0);
    await page.locator('[data-panel="profile"]').click();
    const profileMedal = page.locator("[data-profile-medal-icon]");
    const profileBox = await profileMedal.boundingBox();
    const chipBox = await page.locator(".badge-reward-icon").first().boundingBox();
    assert(profileBox && Math.round(profileBox.width) === 42 && Math.round(profileBox.height) === 42, "冒険者カードの最新勲章が42pxではありません。");
    assert(chipBox && Math.round(chipBox.width) === 28 && Math.round(chipBox.height) === 28, "獲得チップの勲章が28pxではありません。");
    checks.push("冒険者カードの勲章を見やすく拡大");
    await page.locator('[data-view="profile"]').screenshot({ path: path.join(outputDir, "profile-medal.png"), fullPage: true });

    await seed(page, 30, 5);
    await page.locator('[data-panel="titles"]').click();
    const medalImages = page.locator("[data-library-medal-list] .library-medal-image");
    assert(await medalImages.count() === 5, "本番割り当て済みの勲章5種類が書庫に表示されません。");
    const sizes = await medalImages.evaluateAll((images) => images.map((image) => {
      const rect = image.getBoundingClientRect();
      return [Math.round(rect.width), Math.round(rect.height)];
    }));
    assert(sizes.every(([width, height]) => width === 42 && height === 48), "書庫の勲章表示サイズが統一されていません。");
    const pageState = await page.evaluate(() => ({
      viewport: window.innerWidth,
      content: document.documentElement.scrollWidth,
      brokenImages: [...document.images]
        .filter((image) => image.offsetParent !== null && (!image.complete || image.naturalWidth === 0))
        .map((image) => image.src),
    }));
    assert(pageState.content <= pageState.viewport, "書庫がスマホ幅から横にはみ出しています。");
    assert(pageState.brokenImages.length === 0, "勲章画像に読み込み切れがあります。");
    checks.push("書庫の本番勲章5種類を統一サイズで表示");
    checks.push("スマホ幅で横はみ出し・画像切れなし");
    await page.locator('[data-view="titles"]').screenshot({ path: path.join(outputDir, "library-medals.png"), fullPage: true });

    assert(errors.length === 0, `画面エラー: ${errors.join(" / ")}`);
    fs.writeFileSync(
      path.join(outputDir, "result.json"),
      JSON.stringify({ ok: true, checkedAt: new Date().toISOString(), viewport: "430x932", checks, errors }, null, 2),
      "utf8"
    );
    console.log(`ALL OK: ${checks.length} checks`);
    console.log(outputDir);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
