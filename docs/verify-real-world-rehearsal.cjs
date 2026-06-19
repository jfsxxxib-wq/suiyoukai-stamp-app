const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;
const outputDir = path.join(__dirname, "real-world-rehearsal-2026-06-19");
const backupPath = path.join(outputDir, "session-start-backup.json");
const beforeRestorePath = path.join(outputDir, "before-restore-backup.json");
const progressKey = "suiyoukai-stamp-progress-v1";
const historyKey = "suiyoukai-operation-history-v1";
const gameRecordsKey = "suiyoukai-game-records-v1";
const teacherIds = ["tsuneishi", "yuki", "koike", "yamashiro", "matsumoto"];

fs.mkdirSync(outputDir, { recursive: true });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const unlockAdmin = async (page) => {
  await page.locator('[data-panel="admin"]').evaluate((button) => button.click());
  await page.locator("[data-admin-passcode-input]").fill("suiyoukai2026");
  await page.locator("[data-admin-passcode-button]").click();
  assert(await page.locator(".admin-card").isVisible(), "管理画面を解除できません。");
};

const authenticateOperator = async (page) => {
  await page.locator("[data-operator-auth]").waitFor({ state: "visible" });
  await page.locator("[data-operator-auth-input]").fill("suiyoukai2026");
  await page.locator("[data-operator-auth-confirm]").click();
};

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 430, height: 932 }, acceptDownloads: true });
  const page = await context.newPage();
  const checks = [];
  const errors = [];

  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  try {
    await page.goto(appUrl, { waitUntil: "load" });
    await page.evaluate(([pKey, hKey, gKey, ids]) => {
      localStorage.setItem(pKey, JSON.stringify({
        schemaVersion: 2,
        stamps: {
          participationCount: 9,
          teacherLessonCounts: Object.fromEntries(ids.map((id) => [id, id === "tsuneishi" ? 4 : 0])),
          teacherCircleRounds: 0,
        },
        earned: { fairies: [], medals: [], titles: [], companions: [] },
      }));
      localStorage.removeItem(hKey);
      localStorage.removeItem(gKey);
    }, [progressKey, historyKey, gameRecordsKey, teacherIds]);
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(850);
    await page.screenshot({ path: path.join(outputDir, "01-session-start.png"), fullPage: true });

    await unlockAdmin(page);
    const backupDownloadPromise = page.waitForEvent("download");
    await page.locator("[data-admin-backup-save]").click();
    const backupDownload = await backupDownloadPromise;
    await backupDownload.saveAs(backupPath);
    const backup = JSON.parse(fs.readFileSync(backupPath, "utf8"));
    assert(backup.progress.stamps.participationCount === 9, "開始前の参加記録をバックアップできません。");
    assert(backup.progress.stamps.teacherLessonCounts.tsuneishi === 4, "開始前の先生記録をバックアップできません。");
    checks.push("開始前バックアップを保存");

    await page.locator('[data-panel="field-guide"]').click();
    await page.locator("[data-participation-stamp-button]").click();
    await authenticateOperator(page);
    let progress = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), progressKey);
    assert(progress.stamps.participationCount === 10, "参加スタンプを9回から10回へ押印できません。");
    assert(progress.earned.fairies.some((item) => item.id === "fairy_cosmos"), "参加10回の妖精を獲得できません。");
    checks.push("運営認証で参加スタンプを押印");

    await page.locator('[data-panel="field-guide"]').click();
    await page.locator('[data-teacher="tsuneishi"]').click();
    await page.locator(".complete-teacher").click();
    await page.waitForTimeout(750);
    await page.locator(".complete-teacher").click();
    await authenticateOperator(page);
    await page.locator("[data-achievement-modal]").waitFor({ state: "visible" });
    await page.locator("[data-achievement-modal]").screenshot({ path: path.join(outputDir, "02-teacher-fairy-achieved.png") });
    progress = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), progressKey);
    assert(progress.stamps.teacherLessonCounts.tsuneishi === 5, "指導碁スタンプを4回から5回へ押印できません。");
    assert(progress.earned.fairies.some((item) => item.teacherId === "tsuneishi"), "指導碁5回の妖精を獲得できません。");
    await page.locator(".achievement-modal-close").click();
    checks.push("運営認証で指導碁スタンプと妖精を記録");

    await unlockAdmin(page);
    await page.locator('[data-admin-adjust="minus"][data-admin-type="participation"]').click();
    await page.locator('[data-admin-adjust="minus"][data-admin-type="teacher"][data-admin-id="tsuneishi"]').click();
    await page.locator("[data-admin-save-button]").click();
    progress = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), progressKey);
    let history = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), historyKey);
    assert(progress.stamps.participationCount === 9 && progress.stamps.teacherLessonCounts.tsuneishi === 4, "誤りの減算が保存されません。");
    assert(history.filter((entry) => entry.type === "decrement").length === 2, "参加と先生の減算履歴が残りません。");
    checks.push("誤りを減算し、修正履歴を追加");

    assert(progress.earned.fairies.some((item) => item.id === "fairy_cosmos"), "減算後にコスモスの妖精が消えました。");
    assert(progress.earned.fairies.some((item) => item.teacherId === "tsuneishi"), "減算後に菖蒲の妖精が消えました。");
    assert(progress.earned.medals.some((item) => item.id === "medal_participation_cosmos_full_bloom"), "減算後に勲章が消えました。");
    assert(progress.earned.titles.some((item) => item.id === "title_cosmos_full_bloom_friend"), "減算後に称号が消えました。");
    await page.locator('[data-panel="profile"]').click();
    const profileText = (await page.locator('[data-view="profile"]').textContent()).replace(/\s+/g, " ");
    assert(profileText.includes("コスモスの妖精") && profileText.includes("菖蒲の妖精"), "冒険者カードに獲得済み妖精が残りません。");
    await page.locator('[data-view="profile"]').screenshot({ path: path.join(outputDir, "03-rewards-after-correction.png"), fullPage: true });
    checks.push("減算後も妖精・勲章・称号を保持");

    await unlockAdmin(page);
    await page.locator("[data-admin-backup-file]").setInputFiles(backupPath);
    await page.locator("[data-admin-restore-confirm]").waitFor({ state: "visible" });
    const restoreSummary = (await page.locator("[data-admin-restore-summary]").textContent()).replace(/\s+/g, " ");
    assert(restoreSummary.includes("参加スタンプ9回") && restoreSummary.includes("先生の記録4回"), "復元前の確認内容が一致しません。");
    await page.locator("[data-admin-restore-input]").fill("復元");
    const beforeRestoreDownloadPromise = page.waitForEvent("download");
    await page.locator("[data-admin-restore-confirm-button]").click();
    const beforeRestoreDownload = await beforeRestoreDownloadPromise;
    await beforeRestoreDownload.saveAs(beforeRestorePath);
    progress = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), progressKey);
    history = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), historyKey);
    assert(progress.stamps.participationCount === 9 && progress.stamps.teacherLessonCounts.tsuneishi === 4, "開始前の状態へ復元できません。");
    assert(progress.earned.fairies.length === 0, "開始前バックアップの獲得状態へ戻りません。");
    assert(history.at(-1)?.type === "restore", "復元操作が履歴に残りません。");
    assert(fs.existsSync(beforeRestorePath), "復元前バックアップが保存されません。");
    checks.push("確認後に開始前状態へ復元し、復元前も自動保存");

    await page.locator('[data-panel="profile"]').click();
    await page.locator(".close-panel").click();
    await page.waitForTimeout(200);
    const layout = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      contentWidth: document.documentElement.scrollWidth,
      nextAdventure: document.querySelector("[data-next-adventure-button]")?.getBoundingClientRect().toJSON(),
      guide: document.querySelector("[data-next-adventure-guide-image]")?.getBoundingClientRect().toJSON(),
      tabHeights: [...document.querySelectorAll(".info-tab")].map((item) => item.getBoundingClientRect().height),
      brokenImages: [...document.images]
        .filter((image) => image.offsetParent !== null && (!image.complete || image.naturalWidth === 0))
        .map((image) => image.src),
    }));
    assert(layout.contentWidth <= layout.viewportWidth, "スマホ表示で横方向にはみ出しています。");
    assert(
      Math.round(layout.guide.width) === 72 && Math.round(layout.guide.height) === 72,
      `妖精案内人が72pxで表示されません（${layout.guide.width}×${layout.guide.height}px）。`
    );
    assert(layout.tabHeights.every((height) => height >= 40), "下部タブのタップ領域が小さすぎます。");
    assert(layout.brokenImages.length === 0, "表示画像に読み込み切れがあります。");
    await page.screenshot({ path: path.join(outputDir, "04-restored-mobile-home.png"), fullPage: true });
    checks.push("スマホ幅430pxで操作領域・画像・横幅を確認");

    const storedHistoryText = JSON.stringify(history);
    assert(!storedHistoryText.includes("suiyoukai2026") && !storedHistoryText.includes("互先") && !storedHistoryText.includes("勝ち"), "履歴にパスコードまたは不要な対局内容が含まれています。");
    assert(errors.length === 0, `画面エラー: ${errors.join(" / ")}`);
    checks.push("履歴に機密情報・不要な対局内容・画面エラーなし");

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
