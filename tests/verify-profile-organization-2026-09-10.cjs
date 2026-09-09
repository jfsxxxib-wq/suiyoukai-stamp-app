const { chromium } = require("playwright");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;
const progressKey = "suiyoukai-stamp-progress-v1";
const qrAppliedKey = "suiyoukai-stamp-qr-applied-v1";
const teacherIds = [
  "tsuneishi",
  "yuki",
  "koike",
  "yamashiro",
  "matsumoto",
  "teacher_extra_01",
  "teacher_extra_02",
  "teacher_extra_03",
  "teacher_extra_04",
  "teacher_extra_05",
];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const readProgress = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), progressKey);

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];

  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  try {
    await page.goto(appUrl, { waitUntil: "load" });
    await page.evaluate(([key, ids]) => {
      localStorage.clear();
      localStorage.setItem(key, JSON.stringify({
        schemaVersion: 2,
        stamps: {
          participationCount: 9,
          lastParticipationStampDate: "",
          teacherLessonCounts: Object.fromEntries(ids.map((id) => [id, 0])),
          teacherCircleRounds: 0,
        },
        display: { participationLedgerCycleIndex: 0 },
        earned: { fairies: [], medals: [], titles: [], companions: [] },
      }));
    }, [progressKey, teacherIds]);
    await page.reload({ waitUntil: "load" });

    const structure = await page.evaluate(() => {
      const card = document.querySelector(".adventurer-card");
      const content = document.querySelector("[data-profile-collapsible='achievements']");
      const today = document.querySelector("[data-profile-latest-stamp]");
      const landscape = document.querySelector("[data-profile-landscape-space]");
      const selectors = [
        "[data-profile-title]",
        "[data-profile-rank]",
        "[data-profile-medal]",
        "[data-profile-guide-progress]",
        "[data-profile-fairies]",
        "[data-profile-special-companions]",
        "[data-profile-achievement-list]",
      ];

      return {
        fixedResultCount: document.querySelectorAll("[data-profile-achievement-results]").length,
        landscapeCount: document.querySelectorAll("[data-profile-landscape-space]").length,
        landscapeIsEmpty: landscape?.childElementCount === 0 && !landscape?.querySelector("img, button"),
        landscapeAfterIdentity: card && landscape
          ? card.querySelector(".adventurer-name-block")?.nextElementSibling === landscape
          : false,
        todayOutsideResults: Boolean(today && content && !content.contains(today)),
        resultPartsInside: selectors.every((selector) => {
          const items = document.querySelectorAll(selector);
          return items.length === 1 && content?.contains(items[0]);
        }),
        resultStartsCollapsed: content?.classList.contains("is-collapsed") ?? false,
      };
    });

    assert(structure.fixedResultCount === 1, "固定の達成判定結果が1件ではありません。");
    assert(structure.landscapeCount === 1 && structure.landscapeIsEmpty, "景色用の空領域に画像・宝箱・要素が入っています。");
    assert(structure.landscapeAfterIdentity, "景色用の空領域が冒険者名・受付番号の直後にありません。");
    assert(structure.todayOutsideResults, "今日の記録が達成判定結果の中へ移動しています。");
    assert(structure.resultPartsInside, "称号から達成判定内訳までが同じ要素のまま下部へ整理されていません。");
    assert(structure.resultStartsCollapsed, "達成判定結果の初期状態が閉じていません。");

    await page.locator('[data-panel="profile"]').click();
    await page.locator('[data-profile-toggle="achievements"]').click();
    assert(await page.locator("#profile-achievement-content").isVisible(), "達成判定結果を開けません。");

    const participationResult = await page.evaluate(() => {
      const now = new Date();
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      const date = local.toISOString().slice(0, 10);
      return window.suiyoukaiLinkage.applyParticipationStamp({
        type: "participation_stamp",
        id: `participation-profile-organization-${date}`,
        date,
      });
    });
    assert(participationResult.ok && participationResult.reason === "applied", "現在の受付QR処理で9回から10回へ進みません。");

    const completed = await readProgress(page);
    assert(completed.stamps.participationCount === 10, "参加回数が10回になっていません。");
    assert(completed.display.participationLedgerCycleIndex === 0, "10回目で台帳が自動的に次へ進みました。");
    assert(completed.earned.fairies.some((item) => item.id === "fairy_cosmos"), "コスモスの妖精が保存されていません。");
    assert(completed.earned.medals.some((item) => item.id === "medal_participation_cosmos_full_bloom"), "参加勲章が保存されていません。");
    assert(completed.earned.titles.some((item) => item.id === "title_cosmos_full_bloom_friend"), "参加称号が保存されていません。");
    assert(Object.keys(completed.display).length === 1, "新しい表示保存項目が追加されています。");

    const todayVisible = await page.locator("[data-profile-latest-stamp]").isVisible();
    assert(todayVisible, "今日の記録が現行どおり表示されません。");
    assert(await page.locator("[data-participation-ledger-grid] img").count() === 10, "大きな台帳に10個の既存スタンプが表示されません。");
    assert(await page.locator("[data-participation-ledger-fairy]").evaluate((element) => !element.hidden), "10/10の妖精完成表示がありません。");

    const beforeDuplicateRewards = JSON.stringify(completed.earned);
    const duplicateResult = await page.evaluate(() => {
      const now = new Date();
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      const date = local.toISOString().slice(0, 10);
      return window.suiyoukaiLinkage.applyParticipationStamp({
        type: "participation_stamp",
        id: `participation-profile-organization-${date}`,
        date,
      });
    });
    const afterDuplicate = await readProgress(page);
    assert(duplicateResult.ok && duplicateResult.reason === "already_applied", "当日の重複押印が拒否されません。");
    assert(afterDuplicate.stamps.participationCount === 10, "重複操作で参加回数が増えました。");
    assert(JSON.stringify(afterDuplicate.earned) === beforeDuplicateRewards, "重複操作で獲得記録が変わりました。");

    await page.reload({ waitUntil: "load" });
    const afterReload = await readProgress(page);
    assert(afterReload.display.participationLedgerCycleIndex === 0, "再読込で10/10完成画面を維持できません。");

    await page.locator('[data-panel="field-guide"]').click();
    await page.locator("[data-participation-ledger-next]").click();
    const afterAdvance = await readProgress(page);
    assert(afterAdvance.stamps.participationCount === 10, "次の台帳へ進む操作で参加回数が変わりました。");
    assert(afterAdvance.display.participationLedgerCycleIndex === 1, "本人の操作で次の台帳へ進みません。");
    assert(JSON.stringify(afterAdvance.earned) === beforeDuplicateRewards, "次の台帳へ進む操作で獲得記録が変わりました。");

    await page.locator("[data-participation-ledger-previous]").click();
    const afterPastView = await readProgress(page);
    assert(JSON.stringify(afterPastView) === JSON.stringify(afterAdvance), "過去台帳の閲覧で保存状態が変わりました。");
    assert(await page.locator("[data-participation-ledger-grid] img").count() === 10, "過去台帳が10/10で表示されません。");
    assert(await page.locator("[data-participation-ledger-fairy]").evaluate((element) => !element.hidden), "過去台帳の妖精が表示されません。");

    const keys = await page.evaluate(() => Object.keys(localStorage));
    assert(!keys.some((key) => /landscape|treasure|scene/i.test(key)), "景色・宝箱用の保存項目が追加されています。");
    const qrIds = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "[]"), qrAppliedKey);
    assert(qrIds.length === 1, "受付QRの重複防止IDが正しく保存されていません。");
    assert(errors.length === 0, `画面エラー: ${errors.join(" / ")}`);

    console.log("PASS: fixed profile results; empty landscape slot; today record preserved; rewards, QR duplicate guard and ledger state unchanged.");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
