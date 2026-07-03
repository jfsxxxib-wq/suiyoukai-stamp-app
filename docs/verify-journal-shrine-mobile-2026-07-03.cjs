const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;
const outputDir = path.join(__dirname, "journal-shrine-mobile-check-2026-07-03");
const rosterKey = "suiyoukai-shrine-roster-v1";
const journalKey = "suiyoukai-library-journal-v1";
const shrineRecordsKey = "suiyoukai-shrine-records-v1";
const teacherProfilesKey = "suiyoukai-teacher-profiles-v1";

fs.mkdirSync(outputDir, { recursive: true });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const text = async (page, selector) =>
  (await page.locator(selector).textContent()).replace(/\s+/g, " ").trim();

const openPanel = async (page, panel) => {
  if (panel === "shrine") {
    if (await page.locator(".close-panel").isVisible()) {
      await page.locator(".close-panel").click();
      await page.waitForTimeout(180);
    }
    await page.locator('[data-map-destination="shrine"]').click();
    await page.waitForTimeout(250);
    if (await page.locator("[data-shrine-intro-skip]").isVisible()) {
      await page.locator("[data-shrine-intro-skip]").click();
    }
    await page.locator('[data-view="shrine"]').waitFor({ state: "visible" });
    return;
  }

  await page.locator(`[data-panel="${panel}"]`).click();
  await page.waitForTimeout(180);
};

const unlockAdmin = async (page) => {
  await page.evaluate(() => {
    window.location.hash = "admin";
  });
  await page.waitForTimeout(120);
  await openPanel(page, "admin");
  await page.locator("[data-admin-passcode-input]").fill("suiyoukai2026");
  await page.locator("[data-admin-passcode-button]").click();
  await page.locator(".admin-card").first().waitFor({ state: "visible" });
};

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const checks = [];
  const errors = [];

  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  try {
    await page.goto(appUrl, { waitUntil: "load" });
    await page.evaluate(([roster, journal, records, profiles]) => {
      localStorage.removeItem(roster);
      localStorage.removeItem(journal);
      localStorage.removeItem(records);
      localStorage.removeItem(profiles);
    }, [rosterKey, journalKey, shrineRecordsKey, teacherProfilesKey]);
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(900);

    const homeLayout = await page.evaluate(() => {
      const shrine = document.querySelector(".map-destination-button.is-shrine")?.getBoundingClientRect();
      const next = document.querySelector(".next-adventure-card")?.getBoundingClientRect()
        ?? document.querySelector("[data-next-adventure-button]")?.getBoundingClientRect();
      const overlaps = shrine && next
        ? !(shrine.right < next.left || shrine.left > next.right || shrine.bottom < next.top || shrine.top > next.bottom)
        : false;
      return {
        viewportWidth: window.innerWidth,
        contentWidth: document.documentElement.scrollWidth,
        shrine: shrine?.toJSON(),
        next: next?.toJSON(),
        overlaps,
      };
    });
    assert(homeLayout.contentWidth <= homeLayout.viewportWidth + 1, "トップ画面がスマホ幅から横にはみ出しています。");
    assert(!homeLayout.overlaps, "探索マップの組み合わせ神社が次の冒険カードに重なっています。");
    checks.push({ name: "探索マップ", result: "OK", layout: homeLayout });

    await openPanel(page, "titles");
    const journalOpen = await page.evaluate(() => ({
      contentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      recordsVisible: !document.querySelector("[data-library-journal-records]")?.classList.contains("is-collapsed"),
      keeperVisible: !document.querySelector("[data-library-journal-keeper-speech]")?.classList.contains("is-collapsed"),
      keeper: document.querySelector(".library-journal-keeper")?.getBoundingClientRect().toJSON(),
      prompt: document.querySelector(".library-journal-prompt")?.getBoundingClientRect().toJSON(),
    }));
    assert(journalOpen.contentWidth <= journalOpen.viewportWidth + 1, "書庫画面がスマホ幅から横にはみ出しています。");
    assert(journalOpen.recordsVisible && journalOpen.keeperVisible, "冒険日誌の初期表示が開いていません。");
    await page.locator("[data-library-journal-toggle]").click();
    const journalClosed = await page.evaluate(() => ({
      recordsCollapsed: document.querySelector("[data-library-journal-records]")?.classList.contains("is-collapsed"),
      promptCollapsed: document.querySelector(".library-journal-prompt")?.classList.contains("is-collapsed"),
      keeperCollapsed: document.querySelector("[data-library-journal-keeper-speech]")?.classList.contains("is-collapsed"),
      label: document.querySelector("[data-library-journal-state]")?.textContent,
    }));
    assert(journalClosed.recordsCollapsed && journalClosed.promptCollapsed && journalClosed.keeperCollapsed, "冒険日誌を閉じた時に記録欄や吹き出しが閉じません。");
    assert(journalClosed.label === "ひらく", "冒険日誌を閉じた時のボタン文言が合いません。");
    await page.locator("[data-library-journal-toggle]").click();
    await page.locator("[data-library-journal-note]").click();
    await page.locator("[data-library-journal-note-input]").fill("水曜会の確認メモ");
    await page.locator("[data-library-journal-note-save]").click();
    const journalText = await text(page, "[data-library-journal-records]");
    assert(journalText.includes("水曜会の確認メモ"), "手入力のひとことが冒険日誌に残りません。");
    checks.push({ name: "冒険日誌", result: "OK", open: journalOpen, closed: journalClosed });

    await openPanel(page, "shrine");
    await page.locator("[data-shrine-quick-name]").fill("点数確認さん");
    await page.locator("[data-shrine-quick-strength-type]").selectOption("point");
    await page.locator("[data-shrine-quick-strength-value]").fill("-5");
    await page.locator("[data-shrine-quick-add]").click();
    const participants = await page.locator("[data-shrine-participants]").inputValue();
    assert(participants.includes("-5点"), "参加者欄にマイナス点が入りません。");

    await page.locator("[data-shrine-roster-toggle]").click();
    await page.locator("[data-shrine-roster-edit-toggle]").click();
    await page.locator("[data-shrine-roster-form-name]").fill("確認 花子さん");
    await page.locator("[data-shrine-roster-form-gender]").selectOption("female");
    await page.locator("[data-shrine-roster-form-strength-type]").selectOption("point");
    await page.locator("[data-shrine-roster-form-strength-value]").fill("-12");
    await page.locator("[data-shrine-roster-save]").click();
    const savedRoster = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "[]"), rosterKey);
    assert(savedRoster.some((person) => person.name === "確認 花子さん" && person.strength?.value === "-12"), "よく来る人の登録内容が保存されません。");
    await page.locator("[data-shrine-roster-search]").fill("花子");
    assert((await page.locator("[data-shrine-roster-row]").count()) === 1, "よく来る人の検索で対象が1人に絞れません。");
    await page.locator("[data-shrine-roster-edit-name]").click();
    assert((await page.locator("[data-shrine-roster-form-name]").inputValue()) === "確認 花子さん", "名簿の名前タップで登録欄に戻りません。");
    await page.locator("[data-shrine-roster-delete]").click();
    const afterDeleteRoster = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "[]"), rosterKey);
    assert(!afterDeleteRoster.some((person) => person.name === "確認 花子さん"), "登録済みの人を消去できません。");
    checks.push({ name: "神社の参加者と名簿", result: "OK" });

    await unlockAdmin(page);
    const profileLayout = await page.evaluate(() => {
      const editor = document.querySelector(".admin-teacher-profile-editor")?.getBoundingClientRect();
      const fields = [...document.querySelectorAll(".admin-teacher-profile-editor textarea")]
        .map((item) => item.getBoundingClientRect().toJSON());
      return {
        contentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        editor: editor?.toJSON(),
        fields,
      };
    });
    assert(profileLayout.contentWidth <= profileLayout.viewportWidth + 1, "先生紹介編集がスマホ幅から横にはみ出しています。");
    await page.locator("[data-admin-teacher-profile-style]").fill("確認用の棋風紹介です。");
    await page.locator("[data-admin-teacher-profile-lesson]").fill("確認用のレッスン紹介です。");
    await page.locator("[data-admin-teacher-profile-note]").fill("確認用のおすすめ紹介です。");
    await page.locator("[data-admin-teacher-profile-save]").click();
    const savedProfiles = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}"), teacherProfilesKey);
    const selectedTeacher = await page.locator("[data-admin-teacher-profile-select]").inputValue();
    assert(savedProfiles[selectedTeacher]?.style === "確認用の棋風紹介です。", "先生紹介の編集内容が保存されません。");
    checks.push({ name: "先生紹介編集", result: "OK", layout: profileLayout });

    const visibleBrokenImages = await page.locator("img").evaluateAll((images) =>
      images
        .filter((image) => image.offsetParent !== null && (!image.complete || image.naturalWidth === 0))
        .map((image) => image.getAttribute("src"))
    );
    assert(visibleBrokenImages.length === 0, `表示中の画像が読み込めません: ${visibleBrokenImages.join(", ")}`);
    assert(errors.length === 0, `画面エラー: ${errors.join(" / ")}`);

    await page.screenshot({ path: path.join(outputDir, "mobile-final.png"), fullPage: true });
    const report = {
      ok: true,
      checkedAt: new Date().toISOString(),
      app: appUrl,
      viewport: "430x932",
      checks,
      errors,
    };
    fs.writeFileSync(path.join(outputDir, "result.json"), JSON.stringify(report, null, 2), "utf8");
    console.log(`ALL OK: ${checks.length} checks`);
    console.log(path.join(outputDir, "result.json"));
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
