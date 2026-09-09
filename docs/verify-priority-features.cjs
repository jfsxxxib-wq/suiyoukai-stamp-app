const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;
const outputDir = path.join(__dirname, "priority-features-check-2026-06-19");
const storageKey = "suiyoukai-stamp-progress-v1";
const historyKey = "suiyoukai-operation-history-v1";
const teacherIds = ["tsuneishi", "yuki", "koike", "yamashiro", "matsumoto"];

fs.mkdirSync(outputDir, { recursive: true });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const unlockAdmin = async (page) => {
  const adminTab = page.locator('[data-panel="admin"]');
  if (!(await adminTab.isVisible())) {
    const participationStartClose = page.locator("[data-participation-start-close]").first();
    if (await participationStartClose.isVisible()) await participationStartClose.click();
    const infoPanel = page.locator(".info-panel");
    if (await infoPanel.isVisible()) await page.locator(".close-panel").click();
    const guidebookButton = page.locator(".guidebook-button");
    await guidebookButton.click();
    await guidebookButton.click();
    await guidebookButton.click();
    await adminTab.waitFor({ state: "visible" });
  }
  await adminTab.click();
  await page.locator("[data-admin-passcode-input]").fill("運営端末で設定したパスコード");
  await page.locator("[data-admin-passcode-button]").click();
};

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const page = await context.newPage();
  const errors = [];
  const checks = [];

  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  try {
    await page.goto(appUrl, { waitUntil: "load" });
    await page.evaluate(([progressKey, operationKey, ids]) => {
      localStorage.setItem(progressKey, JSON.stringify({
        schemaVersion: 2,
        stamps: {
          participationCount: 9,
          teacherLessonCounts: Object.fromEntries(ids.map((id) => [id, 0])),
          teacherCircleRounds: 0,
        },
        earned: { fairies: [], medals: [], titles: [] },
      }));
      localStorage.removeItem(operationKey);
    }, [storageKey, historyKey, teacherIds]);
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(850);

    const nextAdventure = (await page.locator("[data-next-adventure-button]").textContent()).replace(/\s+/g, " ").trim();
    assert(nextAdventure.includes("あと1回でコスモス満開"), "最も近い達成が『次の冒険』に表示されません。");
    checks.push("次の冒険は最も近い達成を表示");
    await page.screenshot({ path: path.join(outputDir, "next-adventure-home.png"), fullPage: true });

    await page.locator("[data-next-adventure-button]").click();
    assert(await page.locator('[data-view="field-guide"]').isVisible(), "次の冒険から花図鑑へ移動できません。");
    checks.push("次の冒険から対象画面へ移動");

    const receptionResult = await page.evaluate(() => {
      const now = new Date();
      const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const payload = { type: "participation_stamp", id: `priority-participation-${date}`, date };
      const first = window.suiyoukaiLinkage.applyParticipationStamp(payload);
      const duplicate = window.suiyoukaiLinkage.applyParticipationStamp(payload);
      return { first, duplicate };
    });
    const afterCorrect = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).stamps.participationCount, storageKey);
    assert(receptionResult.first.ok && receptionResult.first.reason === "applied", "受付QRの初回反映が正しくありません。");
    assert(receptionResult.duplicate.ok && receptionResult.duplicate.reason === "already_applied", "受付QRの当日重複防止が正しくありません。");
    assert(afterCorrect === 10, "受付QRで参加スタンプが保存されません。");
    checks.push("受付QRで1件だけ保存し当日重複を防止");

    await unlockAdmin(page);
    const history = (await page.locator("[data-admin-history-list]").textContent()).replace(/\s+/g, " ");
    assert(history.includes("受付QR 参加スタンプ") && history.includes("9 → 10"), "押印履歴に受付QRの参加スタンプ変更がありません。");
    checks.push("管理画面に直近の押印履歴を表示");

    const earnedAtTen = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).earned, storageKey);
    assert(earnedAtTen.fairies.some((item) => item.id === "fairy_cosmos"), "10回達成時のコスモス妖精が保存されません。");
    await page.locator('[data-admin-adjust="minus"][data-admin-type="participation"]').click();
    await page.locator("[data-admin-save-button]").click();

    const afterDecrease = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
    assert(afterDecrease.stamps.participationCount === 9, "運営による参加スタンプの減算が保存されません。");
    assert(afterDecrease.earned.fairies.some((item) => item.id === "fairy_cosmos"), "減算後に獲得済み妖精が消えました。");
    assert(afterDecrease.earned.medals.some((item) => item.id === "medal_participation_cosmos_full_bloom"), "減算後に獲得済み勲章が消えました。");
    assert(afterDecrease.earned.titles.some((item) => item.id === "title_cosmos_full_bloom_friend"), "減算後に獲得済み称号が消えました。");
    checks.push("減算後も獲得済み報酬を保持");

    await page.locator('[data-panel="profile"]').click();
    const profileText = (await page.locator('[data-view="profile"]').textContent()).replace(/\s+/g, " ");
    assert(profileText.includes("コスモスの妖精"), "減算後の冒険者カードに妖精が残りません。");
    assert((await page.locator("[data-profile-guide-progress]").textContent()).trim() === "1/33", "減算後の花図鑑件数が保持されません。");
    checks.push("減算後も冒険者カードと花図鑑に表示");

    await page.locator('[data-panel="admin"]').click();
    await page.locator("[data-admin-passcode-input]").fill("運営端末で設定したパスコード");
    await page.locator("[data-admin-passcode-button]").click();
    await page.locator('[data-admin-adjust="plus"][data-admin-type="participation"]').click();
    await page.locator("[data-admin-save-button]").click();
    const afterReachievement = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
    const rewardIds = afterReachievement.earned.fairies.map((item) => item.id);
    assert(rewardIds.filter((id) => id === "fairy_cosmos").length === 1, "再達成時に妖精が重複しました。");
    checks.push("再達成時に報酬を重複保存しない");

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

