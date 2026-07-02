const { chromium } = require("playwright");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });

  try {
    await page.goto(appUrl, { waitUntil: "load" });
    await page.evaluate(() => localStorage.removeItem("suiyoukai-shrine-today-teachers-v1"));
    await page.reload({ waitUntil: "load" });
    await page.locator('[data-map-destination="shrine"]').click();
    await page.locator("[data-shrine-intro-skip]").click();
    await page.locator('[data-view="shrine"]').waitFor({ state: "visible" });

    const initialActiveCount = await page.locator("[data-shrine-active-teachers] article").count();
    assert(initialActiveCount === 7, `初期の今日の先生が7人ではありません: ${initialActiveCount}`);

    await page.locator("[data-shrine-teacher-editor-toggle]").click();
    await page.locator('[data-shrine-teacher="teacher_extra_01"]').setChecked(false);
    await page.locator('[data-shrine-teacher="teacher_extra_02"]').setChecked(false);

    const activeCount = await page.locator("[data-shrine-active-teachers] article").count();
    const flowerIconCount = await page.locator(".shrine-active-teacher-flower-icon").count();
    const teacherSealCount = await page.locator(".shrine-active-teacher-seal").count();
    const boardBadgeCount = await page.locator(".shrine-active-teacher-board").count();
    const editorHidden = await page.locator("[data-shrine-teachers]").evaluate((element) => element.hidden);
    const countText = await page.locator("[data-shrine-teacher-count]").textContent();

    assert(activeCount === 5, `選択後の今日の先生が5人ではありません: ${activeCount}`);
    assert(flowerIconCount === 5, `花アイコンが5つではありません: ${flowerIconCount}`);
    assert(teacherSealCount === 5, `先生印が5つではありません: ${teacherSealCount}`);
    assert(boardBadgeCount === 5, `面数札が5つではありません: ${boardBadgeCount}`);
    assert(editorHidden === false, "編集リストが開いていません。");
    assert(countText.includes("5人"), `先生人数表示が5人ではありません: ${countText}`);

    await page.locator("[data-shrine-teacher-editor-toggle]").click();
    const editorClosed = await page.locator("[data-shrine-teachers]").evaluate((element) => element.hidden);
    assert(editorClosed === true, "編集リストを閉じられません。");

    await page.locator("[data-shrine-participants]").fill(["佐藤さん", "鈴木さん", "田中さん"].join("\n"));
    await page.locator("[data-shrine-generate]").click();
    const resultText = await page.locator("[data-shrine-result]").textContent();
    assert(!resultText.includes("追加先生A") && !resultText.includes("追加先生B"), "不参加の追加先生が組み合わせ結果に出ています。");

    console.log("ALL OK: shrine today teacher display");
    console.log(JSON.stringify({ initialActiveCount, activeCount, flowerIconCount, teacherSealCount, boardBadgeCount, countText }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
