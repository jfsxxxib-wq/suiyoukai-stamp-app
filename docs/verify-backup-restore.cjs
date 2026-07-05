const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;
const outputDir = path.join(__dirname, "backup-restore-check-2026-06-19");
const backupPath = path.join(outputDir, "test-backup.json");
const oldBackupPath = path.join(outputDir, "test-old-backup-missing-extra-teachers.json");
const beforeRestorePath = path.join(outputDir, "test-before-restore.json");
const beforeOldRestorePath = path.join(outputDir, "test-before-old-restore.json");
const progressKey = "suiyoukai-stamp-progress-v1";
const historyKey = "suiyoukai-operation-history-v1";
const teacherIds = ["tsuneishi", "yuki", "koike", "yamashiro", "matsumoto"];
const extraTeacherIds = ["teacher_extra_01", "teacher_extra_02"];

fs.mkdirSync(outputDir, { recursive: true });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const unlockAdmin = async (page) => {
  await page.evaluate(() => {
    window.location.hash = "#admin";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
  await page.locator('[data-panel="admin"]').click();
  await page.locator("[data-admin-passcode-input]").fill("運営端末で設定したパスコード");
  await page.locator("[data-admin-passcode-button]").click();
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
    await page.evaluate(([pKey, hKey, ids]) => {
      localStorage.setItem(pKey, JSON.stringify({
        schemaVersion: 2,
        stamps: {
          participationCount: 10,
          teacherLessonCounts: Object.fromEntries(ids.map((id, index) => [id, index === 0 ? 5 : index])),
          teacherCircleRounds: 0,
        },
        earned: { fairies: [], medals: [], titles: [], companions: [] },
      }));
      localStorage.setItem(hKey, JSON.stringify([{
        id: "operation-test",
        type: "participation_stamp",
        label: "参加スタンプ",
        before: 9,
        after: 10,
        recordedAt: "2026-06-19T00:00:00.000Z",
      }]));
    }, [progressKey, historyKey, teacherIds]);
    await page.reload({ waitUntil: "load" });

    const expected = await page.evaluate(([pKey, hKey]) => ({
      progress: JSON.parse(localStorage.getItem(pKey)),
      history: JSON.parse(localStorage.getItem(hKey)),
    }), [progressKey, historyKey]);

    await unlockAdmin(page);
    const downloadPromise = page.waitForEvent("download");
    await page.locator("[data-admin-backup-save]").click();
    const download = await downloadPromise;
    await download.saveAs(backupPath);
    const backupText = fs.readFileSync(backupPath, "utf8");
    const backup = JSON.parse(backupText);
    const oldBackup = JSON.parse(JSON.stringify(backup));
    for (const teacherId of extraTeacherIds) {
      delete oldBackup.progress.stamps.teacherLessonCounts[teacherId];
    }
    fs.writeFileSync(oldBackupPath, JSON.stringify(oldBackup, null, 2), "utf8");
    assert(backup.appId === "suiyoukai-stamp-adventure" && backup.formatVersion === 1, "識別子または版番号がありません。");
    assert(backup.progress && Array.isArray(backup.operationHistory) && backup.savedAt, "必要なバックアップ項目が不足しています。");
    assert(!backupText.includes("運営端末で設定したパスコード") && !backupText.includes("みずの しずく"), "パスコードまたは個人情報が含まれています。");
    checks.push("必要項目だけをJSONファイルへ保存");

    await page.evaluate(([pKey, hKey, ids]) => {
      localStorage.setItem(pKey, JSON.stringify({
        schemaVersion: 2,
        stamps: {
          participationCount: 1,
          teacherLessonCounts: Object.fromEntries(ids.map((id) => [id, 0])),
          teacherCircleRounds: 0,
        },
        earned: { fairies: [], medals: [], titles: [], companions: [] },
      }));
      localStorage.setItem(hKey, "[]");
    }, [progressKey, historyKey, teacherIds]);
    await page.reload({ waitUntil: "load" });
    const beforeRestore = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), progressKey);

    await unlockAdmin(page);
    const chooserPromise = page.waitForEvent("filechooser");
    await page.locator("[data-admin-backup-select]").click();
    const chooser = await chooserPromise;
    await chooser.setFiles(backupPath);
    await page.locator("[data-admin-restore-confirm]").waitFor({ state: "visible" });
    const summary = (await page.locator("[data-admin-restore-summary]").textContent()).replace(/\s+/g, " ");
    assert(summary.includes("参加スタンプ10回") && summary.includes("先生の記録15回"), "復元内容の確認表示が正しくありません。");
    const unchanged = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), progressKey);
    assert(unchanged.stamps.participationCount === 1, "確認前に記録が上書きされました。");
    checks.push("ファイル選択後に内容を表示し、まだ上書きしない");

    const restoreButton = page.locator("[data-admin-restore-confirm-button]");
    await page.locator("[data-admin-restore-input]").fill("復");
    assert(await restoreButton.isDisabled(), "不完全な確認語で復元できます。");
    await page.locator("[data-admin-restore-input]").fill("復元");
    assert(await restoreButton.isEnabled(), "正しい確認語で復元できません。");
    checks.push("復元には確認語が必須");

    const autoDownloadPromise = page.waitForEvent("download");
    await restoreButton.click();
    const autoDownload = await autoDownloadPromise;
    await autoDownload.saveAs(beforeRestorePath);
    assert((await autoDownload.suggestedFilename()).includes("before-restore"), "復元前バックアップの名前が正しくありません。");
    const autoBackup = JSON.parse(fs.readFileSync(beforeRestorePath, "utf8"));
    assert(autoBackup.progress.stamps.participationCount === beforeRestore.stamps.participationCount, "復元前の状態が自動保存されません。");
    checks.push("復元前の状態を自動バックアップ");

    const restored = await page.evaluate(([pKey, hKey]) => ({
      progress: JSON.parse(localStorage.getItem(pKey)),
      history: JSON.parse(localStorage.getItem(hKey)),
    }), [progressKey, historyKey]);
    assert(JSON.stringify(restored.progress) === JSON.stringify(expected.progress), "バックアップ時と同じ進捗へ戻りません。");
    assert(JSON.stringify(restored.history.slice(0, -1)) === JSON.stringify(backup.operationHistory), "バックアップ時の履歴へ戻りません。");
    assert(restored.history.at(-1)?.type === "restore", "復元操作が履歴に追加されません。");
    assert(await page.locator("[data-admin-lock-card]").isVisible(), "復元後に自動再ロックされません。");
    checks.push("進捗と履歴を同じ状態へ復元して再ロック");

    await page.locator("[data-admin-passcode-input]").fill("運営端末で設定したパスコード");
    await page.locator("[data-admin-passcode-button]").click();
    await page.locator("[data-admin-backup-file]").setInputFiles(oldBackupPath);
    await page.locator("[data-admin-restore-confirm]").waitFor({ state: "visible" });
    await page.locator("[data-admin-restore-input]").fill("復元");
    const oldRestoreDownloadPromise = page.waitForEvent("download");
    await page.locator("[data-admin-restore-confirm-button]").click();
    const oldRestoreDownload = await oldRestoreDownloadPromise;
    await oldRestoreDownload.saveAs(beforeOldRestorePath);
    const oldRestored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), progressKey);
    for (const teacherId of extraTeacherIds) {
      assert(oldRestored.stamps.teacherLessonCounts[teacherId] === 0, `${teacherId} が0回で補完されません。`);
    }
    assert(oldRestored.stamps.teacherCircleRounds === 1, "旧バックアップ復元後に基本5人の先生の輪が後退しました。");
    checks.push("旧バックアップの不足先生IDを0回で補完し、基本5人の輪を維持");

    await page.locator("[data-admin-passcode-input]").fill("運営端末で設定したパスコード");
    await page.locator("[data-admin-passcode-button]").click();
    await page.locator("[data-admin-backup-file]").setInputFiles({
      name: "broken.json",
      mimeType: "application/json",
      buffer: Buffer.from("{broken"),
    });
    const brokenMessage = await page.locator("[data-admin-backup-message]").textContent();
    assert(brokenMessage.includes("読み取れません") || brokenMessage.includes("JSON"), "壊れたファイルを拒否しません。");

    await page.locator("[data-admin-backup-file]").setInputFiles({
      name: "other-app.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ ...backup, appId: "other-app" })),
    });
    const otherMessage = await page.locator("[data-admin-backup-message]").textContent();
    assert(otherMessage.includes("対応形式") && await page.locator("[data-admin-restore-confirm]").isHidden(), "別形式のファイルを拒否しません。");
    checks.push("壊れたファイルと別形式を拒否");

    assert(errors.length === 0, `画面エラー: ${errors.join(" / ")}`);
    await page.locator('[data-view="admin"]').screenshot({ path: path.join(outputDir, "backup-restore-admin.png"), fullPage: true });
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

