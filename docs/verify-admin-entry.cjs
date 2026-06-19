const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;
const outputDir = path.join(__dirname, "admin-entry-check-2026-06-18");
const storageKey = "suiyoukai-stamp-progress-v1";
const teacherIds = ["tsuneishi", "yuki", "koike", "yamashiro", "matsumoto"];

fs.mkdirSync(outputDir, { recursive: true });

const initialProgress = {
  schemaVersion: 2,
  stamps: {
    participationCount: 0,
    teacherLessonCounts: Object.fromEntries(teacherIds.map((id) => [id, 0])),
    teacherCircleRounds: 0,
  },
  earned: { fairies: [], medals: [], titles: [] },
};

const assert = (condition, label) => {
  if (!condition) throw new Error(label);
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
    await page.evaluate(([key, progress]) => localStorage.setItem(key, JSON.stringify(progress)), [storageKey, initialProgress]);
    await page.reload({ waitUntil: "load" });

    const adminTab = page.locator('[data-panel="admin"]');
    assert((await adminTab.textContent()).trim() === "管理", "運営入口が「管理」表示ではありません。");
    checks.push("入口は控えめな「管理」表示");

    await adminTab.click();
    assert(await page.locator("[data-admin-lock-card]").isVisible(), "初回表示でロック画面が出ません。");
    assert(await page.locator(".admin-card").isHidden(), "解除前に管理UIが見えています。");
    checks.push("解除前は管理UIを非表示");

    await page.locator("[data-admin-passcode-input]").fill("wrong-code");
    await page.locator("[data-admin-passcode-button]").click();
    assert(await page.locator(".admin-card").isHidden(), "誤ったパスコードで解除されました。");
    checks.push("誤ったパスコードでは解除しない");

    await page.locator("[data-admin-passcode-input]").fill("suiyoukai2026");
    await page.locator("[data-admin-passcode-button]").click();
    assert(await page.locator(".admin-card").isVisible(), "正しいパスコードで解除できません。");
    checks.push("正しいパスコードで解除");

    await page.locator('[data-admin-adjust="plus"][data-admin-type="participation"]').click();
    const storedBeforeSave = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
    assert(storedBeforeSave.stamps.participationCount === 0, "確定前に保存内容が変わりました。");
    assert((await page.locator("[data-admin-draft-state]").textContent()).includes("未保存"), "未保存表示が出ません。");
    checks.push("下書きは確定前に保存しない");

    await page.locator("[data-admin-save-button]").click();
    const storedAfterSave = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
    assert(storedAfterSave.stamps.participationCount === 1, "確定後の参加スタンプが保存されません。");
    assert(await page.locator("[data-admin-lock-card]").isVisible(), "確定保存後に自動再ロックされません。");
    assert(await page.locator(".admin-card").isHidden(), "確定保存後も管理UIが開いたままです。");
    checks.push("確定時だけ保存して自動再ロック");

    await page.locator('[data-panel="profile"]').click();
    await adminTab.click();
    assert(await page.locator("[data-admin-lock-card]").isVisible(), "管理画面を離れた後に再ロックされません。");
    assert(await page.locator(".admin-card").isHidden(), "再訪時に管理UIが開いたままです。");
    checks.push("管理画面を離れると自動再ロック");

    await page.locator("[data-admin-passcode-input]").fill("suiyoukai2026");
    await page.locator("[data-admin-passcode-button]").click();
    await page.locator("[data-admin-reset-button]").click();
    const resetButton = page.locator("[data-admin-reset-confirm-button]");
    assert(await resetButton.isDisabled(), "確認語の入力前にリセットできます。");
    await page.locator("[data-admin-reset-input]").fill("リセッ");
    assert(await resetButton.isDisabled(), "不完全な確認語でリセットできます。");
    await page.locator("[data-admin-reset-input]").fill("リセット");
    assert(await resetButton.isEnabled(), "正しい確認語でリセットを実行できません。");
    checks.push("全リセットは確認語が必須");

    await page.locator('[data-view="admin"]').screenshot({ path: path.join(outputDir, "admin-unlocked.png") });
    assert(errors.length === 0, `画面エラー: ${errors.join(" / ")}`);
    checks.push("画面エラーなし");

    fs.writeFileSync(path.join(outputDir, "result.json"), JSON.stringify({ ok: true, checks }, null, 2));
    console.log(`ALL OK: ${checks.length} checks`);
    console.log(outputDir);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
