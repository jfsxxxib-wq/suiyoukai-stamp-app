const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;
const outputDir = path.join(__dirname, "fairy-guide-check-2026-06-19");
const progressKey = "suiyoukai-stamp-progress-v1";
const teacherIds = ["tsuneishi", "yuki", "koike", "yamashiro", "matsumoto"];

fs.mkdirSync(outputDir, { recursive: true });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const seedParticipation = async (page, participationCount) => {
  await page.evaluate(([key, ids, count]) => {
    localStorage.setItem(key, JSON.stringify({
      schemaVersion: 2,
      stamps: {
        participationCount: count,
        teacherLessonCounts: Object.fromEntries(ids.map((id) => [id, 0])),
        teacherCircleRounds: 0,
      },
      earned: { fairies: [], medals: [], titles: [], companions: [] },
    }));
  }, [progressKey, teacherIds, participationCount]);
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
    await seedParticipation(page, 0);

    const guide = page.locator("[data-next-adventure-guide]");
    const guideImage = page.locator("[data-next-adventure-guide-image]");
    assert(await guide.getAttribute("data-guide-fairy-id") === "first-guide", "未獲得時に最初の案内役が選ばれません。");
    assert((await guideImage.getAttribute("src")) === "assets/fairy-apollon-guide.png", "未獲得の図鑑妖精を先に表示しています。");
    const imageBox = await guideImage.boundingBox();
    assert(imageBox && imageBox.width >= 56 && imageBox.width <= 72, "妖精案内人が指定サイズ内ではありません。");
    const pointerEvents = await guide.evaluate((element) => getComputedStyle(element).pointerEvents);
    assert(pointerEvents === "none", "妖精案内人がタップ操作を妨げます。");
    checks.push("未獲得時は専用の最初の案内役を表示");
    checks.push("56〜72pxで操作を妨げない配置");
    await page.screenshot({ path: path.join(outputDir, "fairy-guide-first.png"), fullPage: true });

    const speech = (await page.locator("[data-next-adventure-guide-speech]").textContent()).trim();
    assert(speech.length > 0 && speech.length <= 12, "案内のセリフが長すぎます。");
    await page.locator("[data-next-adventure-button]").click();
    assert(await page.locator('[data-view="field-guide"]').isVisible(), "案内人追加後に次の冒険を操作できません。");
    checks.push("短いセリフで次の冒険を案内");

    await seedParticipation(page, 10);
    assert(await guide.getAttribute("data-guide-fairy-id") === "fairy_cosmos", "最後に獲得したコスモスの妖精へ交代しません。");
    assert((await guideImage.getAttribute("src")) === "assets/fairy-apollon-flower-style.png", "獲得済み妖精の画像が表示されません。");
    assert(!(await guideImage.getAttribute("src")).includes("fuji"), "未獲得の次巡妖精を表示しています。");
    checks.push("最後に獲得した妖精だけを表示");
    await page.screenshot({ path: path.join(outputDir, "fairy-guide-earned.png"), fullPage: true });

    await seedParticipation(page, 20);
    assert(await guide.getAttribute("data-guide-fairy-id") === "fairy_fuji", "複数獲得時に最後の妖精が案内役になりません。");
    assert((await guideImage.getAttribute("src")) === "assets/fairy-companion-fuji-lion.png", "最後に獲得した妖精の素材が使われません。");
    checks.push("獲得順の最後の妖精へ更新");

    await page.emulateMedia({ reducedMotion: "reduce" });
    const animationName = await guideImage.evaluate((element) => getComputedStyle(element).animationName);
    assert(animationName === "none", "動きを減らす設定で浮遊表現が停止しません。");
    checks.push("動きを減らす設定で浮遊を停止");

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
