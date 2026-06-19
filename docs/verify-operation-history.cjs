const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;
const outputDir = path.join(__dirname, "operation-history-check-2026-06-19");
const backupPath = path.join(outputDir, "history-restore-source.json");
const progressKey = "suiyoukai-stamp-progress-v1";
const historyKey = "suiyoukai-operation-history-v1";
const teacherIds = ["tsuneishi", "yuki", "koike", "yamashiro", "matsumoto"];

fs.mkdirSync(outputDir, { recursive: true });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const unlockAdmin = async (page) => {
  await page.locator('[data-panel="admin"]').click();
  await page.locator("[data-admin-passcode-input]").fill("suiyoukai2026");
  await page.locator("[data-admin-passcode-button]").click();
};

const readHistory = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "[]"), historyKey);

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
    await page.evaluate(([pKey, hKey, ids]) => {
      localStorage.setItem(pKey, JSON.stringify({
        schemaVersion: 2,
        stamps: {
          participationCount: 0,
          teacherLessonCounts: Object.fromEntries(ids.map((id) => [id, 0])),
          teacherCircleRounds: 0,
        },
        earned: { fairies: [], medals: [], titles: [], companions: [] },
      }));
      localStorage.removeItem(hKey);
    }, [progressKey, historyKey, teacherIds]);
    await page.reload({ waitUntil: "load" });

    await page.locator("[data-next-adventure-button]").click();
    await page.locator("[data-participation-stamp-button]").click();
    await page.locator("[data-operator-auth-input]").fill("suiyoukai2026");
    await page.locator("[data-operator-auth-confirm]").click();
    let history = await readHistory(page);
    assert(history.at(-1)?.type === "participation_stamp", "参加押印の操作種別がありません。");
    assert(history.at(-1)?.target === "参加スタンプ" && history.at(-1)?.before === 0 && history.at(-1)?.after === 1, "参加押印の対象または変更前後が正しくありません。");
    checks.push("押印を対象・変更前後・日時付きで保存");

    await unlockAdmin(page);
    await page.locator('[data-admin-adjust="minus"][data-admin-type="participation"]').click();
    await page.locator('[data-admin-adjust="plus"][data-admin-type="teacher"][data-admin-id="tsuneishi"]').click();
    await page.locator("[data-admin-save-button]").click();
    history = await readHistory(page);
    const decrement = history.find((entry) => entry.type === "decrement");
    const adjustment = history.find((entry) => entry.type === "admin_adjustment");
    assert(decrement?.target === "参加スタンプ" && decrement.before === 1 && decrement.after === 0, "減算履歴が対象ごとに残りません。");
    assert(adjustment?.target.includes("常石") && adjustment.before === 0 && adjustment.after === 1, "管理調整履歴が対象ごとに残りません。");
    assert(history.some((entry) => entry.type === "participation_stamp"), "修正後に過去の押印履歴が消えました。");
    checks.push("減算と管理調整を追加し、過去履歴を保持");

    await unlockAdmin(page);
    const downloadPromise = page.waitForEvent("download");
    await page.locator("[data-admin-backup-save]").click();
    const download = await downloadPromise;
    await download.saveAs(backupPath);

    await page.locator('[data-admin-adjust="plus"][data-admin-type="participation"]').click();
    await page.locator("[data-admin-save-button]").click();
    await unlockAdmin(page);
    await page.locator("[data-admin-backup-file]").setInputFiles(backupPath);
    await page.locator("[data-admin-restore-confirm]").waitFor({ state: "visible" });
    await page.locator("[data-admin-restore-input]").fill("復元");
    const beforeRestoreDownload = page.waitForEvent("download");
    await page.locator("[data-admin-restore-confirm-button]").click();
    await beforeRestoreDownload;
    history = await readHistory(page);
    assert(history.at(-1)?.type === "restore" && history.at(-1)?.target === "バックアップ記録", "復元履歴が残りません。");
    checks.push("復元を履歴の末尾へ追加");

    await page.locator("[data-admin-passcode-input]").fill("suiyoukai2026");
    await page.locator("[data-admin-passcode-button]").click();
    await page.locator("[data-admin-reset-button]").click();
    await page.locator("[data-admin-reset-input]").fill("リセット");
    await page.locator("[data-admin-reset-confirm-button]").click();
    history = await readHistory(page);
    assert(history.at(-1)?.type === "reset" && history.at(-1)?.target === "すべてのスタンプ", "全リセット履歴が残りません。");
    assert(history.length <= 50, "履歴が最大50件を超えています。");
    checks.push("全リセットを保存し、最大50件を維持");

    await page.locator("[data-admin-passcode-input]").fill("suiyoukai2026");
    await page.locator("[data-admin-passcode-button]").click();
    const visibleHistory = (await page.locator("[data-admin-history-list]").textContent()).replace(/\s+/g, " ");
    assert(visibleHistory.includes("全リセット") && visibleHistory.includes("復元") && visibleHistory.includes("減算"), "操作種別が運営画面に表示されません。");
    assert(visibleHistory.includes("すべてのスタンプ") && visibleHistory.includes("1 → 0"), "対象と変更前後が運営画面に表示されません。");
    const storedText = JSON.stringify(history);
    assert(!storedText.includes("suiyoukai2026") && !storedText.includes("互先") && !storedText.includes("勝ち"), "履歴に不要な情報が含まれています。");
    checks.push("最近の履歴を分かりやすく表示し、不要情報を保存しない");

    assert(errors.length === 0, `画面エラー: ${errors.join(" / ")}`);
    await page.locator(".admin-history").screenshot({ path: path.join(outputDir, "operation-history.png") });
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
