const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;
const outputDir = path.join(__dirname, "screen-linkage-check-2026-06-18");
const storageKey = "suiyoukai-stamp-progress-v1";
const gameRecordsStorageKey = "suiyoukai-game-records-v1";
const teacherIds = ["tsuneishi", "yuki", "koike", "yamashiro", "matsumoto"];

fs.mkdirSync(outputDir, { recursive: true });

const progress = (participationCount, teacherCount = 0) => ({
  schemaVersion: 2,
  stamps: {
    participationCount,
    teacherLessonCounts: Object.fromEntries(teacherIds.map((id) => [id, teacherCount])),
    teacherCircleRounds: teacherCount,
  },
  earned: { fairies: [], medals: [], titles: [] },
});

const text = async (page, selector) =>
  page.locator(selector).first().evaluate((node) => node.textContent.replace(/\s+/g, " ").trim());

const seed = async (page, value) => {
  await page.goto(appUrl, { waitUntil: "load" });
  await page.evaluate(([key, recordsKey, data]) => {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.removeItem(recordsKey);
  }, [storageKey, gameRecordsStorageKey, value]);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(850);
};

const authenticateOperator = async (page) => {
  await page.locator("[data-operator-auth]").waitFor({ state: "visible" });
  await page.locator("[data-operator-auth-input]").fill("suiyoukai2026");
  await page.locator("[data-operator-auth-confirm]").click();
};

const openProfile = async (page) => {
  await page.locator('[data-panel="profile"]').evaluate((button) => button.click());
  await page.waitForTimeout(120);
};

const openLibrary = async (page) => {
  await page.locator('[data-panel="titles"]').evaluate((button) => button.click());
  await page.waitForTimeout(120);
};

const collectProfile = async (page) => ({
  total: await text(page, "[data-total-stamps]"),
  guideProgress: await text(page, "[data-profile-guide-progress]"),
  title: await text(page, "[data-profile-title]"),
  fairies: await page.locator("[data-profile-fairy-list] strong").allTextContents(),
  companions: await page.locator("[data-profile-special-companion-list] strong").allTextContents(),
  results: await page.locator("[data-profile-achievement-list] article").evaluateAll((items) =>
    items.map((item) => item.textContent.replace(/\s+/g, " ").trim())
  ),
});

const assertIncludes = (actual, expected, label) => {
  if (!String(actual).includes(expected)) {
    throw new Error(`${label}: 「${expected}」が見つかりません。実際: ${actual}`);
  }
};

const assertNames = (actual, expected, label) => {
  const actualNames = [...actual].sort();
  const expectedNames = [...expected].sort();
  if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
    throw new Error(`${label}: 期待 ${expectedNames.join(" / ")}、実際 ${actualNames.join(" / ")}`);
  }
};

(async () => {
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const runtimeErrors = [];

page.on("pageerror", (error) => runtimeErrors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") runtimeErrors.push(message.text());
});

const checks = [];

try {
  for (const scenario of [
    { count: 10, flower: "藤", fairy: "コスモスの妖精", achieved: "1/3巡 達成", guide: "1/18" },
    { count: 20, flower: "金木犀", fairy: "藤の妖精", achieved: "2/3巡 達成", guide: "2/18" },
    { count: 30, flower: "金木犀", fairy: "金木犀の妖精", achieved: "3/3巡 達成", guide: "3/18" },
  ]) {
    await seed(page, progress(scenario.count));
    const flower = await text(page, "[data-participation-flower-name]");
    const status = await text(page, "[data-participation-status]");
    await openProfile(page);
    const profile = await collectProfile(page);

    assertIncludes(flower, scenario.flower, `参加${scenario.count}回の花`);
    assertIncludes(profile.fairies.join(" / "), scenario.fairy, `参加${scenario.count}回の妖精`);
    assertIncludes(profile.results.join(" / "), scenario.achieved, `参加${scenario.count}回の達成数`);
    assertIncludes(profile.guideProgress, scenario.guide, `参加${scenario.count}回の花図鑑達成率`);

    const file = `participation-${scenario.count}.png`;
    await page.screenshot({ path: path.join(outputDir, file), fullPage: true });
    checks.push({ kind: "参加", count: scenario.count, flower, status, profile, screenshot: file, result: "OK" });
  }

  for (const scenario of [
    { count: 5, flower: "蓮", fairy: "菖蒲の妖精", achieved: "5/15妖精 達成", guide: "5/18" },
    { count: 10, flower: "菫", fairy: "蓮の妖精", achieved: "10/15妖精 達成", guide: "10/18" },
    { count: 15, flower: "菫", fairy: "菫の妖精", achieved: "15/15妖精 達成", guide: "15/18" },
  ]) {
    await seed(page, progress(0, scenario.count));
    await page.locator('[data-panel="field-guide"]').evaluate((button) => button.click());
    await page.locator('[data-teacher="tsuneishi"]').click();
    const detail = await text(page, ".teacher-detail");
    assertIncludes(detail, scenario.flower, `先生${scenario.count}回の花`);

    await openProfile(page);
    const profile = await collectProfile(page);
    assertIncludes(profile.fairies.join(" / "), scenario.fairy, `先生${scenario.count}回の妖精`);
    assertIncludes(profile.results.join(" / "), scenario.achieved, `先生${scenario.count}回の達成数`);
    assertIncludes(profile.guideProgress, scenario.guide, `先生${scenario.count}回の花図鑑達成率`);
    if (scenario.count === 15 && detail.includes("4巡目")) {
      throw new Error("全3巡達成後に4巡目が表示されています。");
    }

    const file = `teacher-${scenario.count}.png`;
    await page.screenshot({ path: path.join(outputDir, file), fullPage: true });
    checks.push({ kind: "先生全員", count: scenario.count, flower: scenario.flower, detail, profile, screenshot: file, result: "OK" });
  }

  for (const scenario of [
    { before: 4, count: 5, fairy: "菖蒲" },
    { before: 9, count: 10, fairy: "蓮" },
    { before: 14, count: 15, fairy: "菫" },
  ]) {
    const data = progress(0, 0);
    data.stamps.teacherLessonCounts.tsuneishi = scenario.before;
    await seed(page, data);
    await page.locator('[data-panel="field-guide"]').evaluate((button) => button.click());
    await page.locator('[data-teacher="tsuneishi"]').click();
    await page.locator(".complete-teacher").click();
    await page.locator(".complete-teacher").click();
    await authenticateOperator(page);
    await page.locator("[data-achievement-modal]").waitFor({ state: "visible" });

    const modal = await text(page, "[data-achievement-modal] .achievement-modal-card");
    const imageLoaded = await page.locator("[data-achievement-modal] [data-achievement-fairy]").evaluate((image) => image.complete && image.naturalWidth > 0);
    assertIncludes(modal, scenario.fairy, `先生${scenario.count}回の達成画面`);
    if (!imageLoaded) throw new Error(`先生${scenario.count}回の達成画像が読み込めません。`);
    checks.push({ kind: "達成画面", count: scenario.count, modal, imageLoaded, result: "OK" });
  }

  await seed(page, progress(0, 0));
  await page.locator('[data-panel="field-guide"]').evaluate((button) => button.click());
  await page.locator('[data-teacher="tsuneishi"]').click();
  const recordButton = page.locator(".complete-teacher");
  await recordButton.dblclick();
  await page.waitForTimeout(150);

  const countAfterOpening = await text(page, "[data-card-stamp-current]");
  const storedAfterOpening = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
  const recordFormVisible = await page.locator("[data-game-record-form]").isVisible();
  if (countAfterOpening !== "0" || storedAfterOpening.stamps.teacherLessonCounts.tsuneishi !== 0 || !recordFormVisible) {
    throw new Error("対局記録を開いただけでスタンプ数が変わりました。");
  }

  await page.locator("[data-game-record-date]").fill("2026-06-18");
  await page.locator("[data-game-record-handicap]").selectOption("2子");
  await page.locator("[data-game-record-result]").selectOption("勝ち");
  await page.locator(".teacher-detail").screenshot({ path: path.join(outputDir, "game-record-input.png") });
  await page.waitForTimeout(750);
  await recordButton.click();
  await page.locator("[data-operator-auth]").waitFor({ state: "visible" });
  await page.locator("[data-operator-auth-input]").fill("wrong-code");
  await page.locator("[data-operator-auth-confirm]").click();
  const storedAfterWrongPasscode = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
  if (storedAfterWrongPasscode.stamps.teacherLessonCounts.tsuneishi !== 0) {
    throw new Error("誤った運営パスコードで指導碁スタンプが保存されました。");
  }
  await authenticateOperator(page);

  const countAfterSaving = await text(page, "[data-card-stamp-current]");
  const savedRecords = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), gameRecordsStorageKey);
  const historyText = await text(page, "[data-teacher-game-record-list]");
  if (countAfterSaving !== "1" || savedRecords.length !== 1) {
    throw new Error("最終確定後のスタンプ加算または対局記録保存が正しくありません。");
  }
  assertIncludes(historyText, "2026/06/18", "対局記録の日付");
  assertIncludes(historyText, "2子・勝ち", "対局記録の内容");

  await page.reload({ waitUntil: "load" });
  await page.locator('[data-panel="field-guide"]').evaluate((button) => button.click());
  await page.locator('[data-teacher="tsuneishi"]').click();
  const historyAfterReload = await text(page, "[data-teacher-game-record-list]");
  assertIncludes(historyAfterReload, "2子・勝ち", "再読み込み後の対局記録");
  await page.locator(".teacher-detail").screenshot({ path: path.join(outputDir, "game-record-saved.png") });
  checks.push({ kind: "対局記録", countAfterOpening, countAfterSaving, savedRecords, result: "OK" });

  await seed(page, progress(9, 0));
  const nextAdventure = await text(page, "[data-next-adventure-button]");
  assertIncludes(nextAdventure, "あと1回でコスモス満開", "次の冒険");
  checks.push({ kind: "次の冒険", nextAdventure, result: "OK" });

  for (const scenario of [
    { label: "記録なし", data: progress(0, 0), expected: [] },
    { label: "初スタンプ", data: progress(1, 0), expected: ["はじめの一歩"] },
    {
      label: "参加1回＋指導碁1回",
      data: { ...progress(1, 0), stamps: { ...progress(1, 0).stamps, teacherLessonCounts: { tsuneishi: 1, yuki: 0, koike: 0, yamashiro: 0, matsumoto: 0 } } },
      expected: ["はじめの一歩", "挑戦する冒険者"],
    },
    { label: "初称号・初勲章", data: progress(10, 0), expected: ["はじめの一歩", "知恵の見守り役"] },
    { label: "先生の輪 一巡", data: progress(0, 1), expected: ["はじめの一歩", "知恵の見守り役", "達成を知る賢者"] },
    {
      label: "古い保存形式",
      data: { participationCount: 1, teacherLessonCounts: { tsuneishi: 1, yuki: 0, koike: 0, yamashiro: 0, matsumoto: 0 } },
      expected: ["はじめの一歩", "挑戦する冒険者"],
    },
    { label: "4仲間すべて", data: progress(10, 1), expected: ["はじめの一歩", "挑戦する冒険者", "知恵の見守り役", "達成を知る賢者"], screenshot: "special-companions-all.png" },
  ]) {
    await seed(page, scenario.data);
    await openProfile(page);
    const profile = await collectProfile(page);
    assertNames(profile.companions, scenario.expected, `特別な仲間 ${scenario.label}`);

    const brokenCompanionImages = await page.locator("[data-profile-special-companion-list] img").evaluateAll((images) =>
      images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src)
    );
    if (brokenCompanionImages.length) {
      throw new Error(`特別な仲間 ${scenario.label} の画像が読み込めません。`);
    }
    if (scenario.screenshot) {
      await page.screenshot({ path: path.join(outputDir, scenario.screenshot), fullPage: true });
    }
    checks.push({ kind: "特別な仲間", label: scenario.label, companions: profile.companions, result: "OK" });
  }

  for (const scenario of [
    { label: "記録なし", data: progress(0, 0), speech: "ようこそ書庫へ。", owl: "special-companion-owl-a.png", screenshot: "owl-library-empty.png" },
    { label: "初スタンプ", data: progress(1, 0), speech: "旅の最初の一頁ですね。", owl: "special-companion-owl-a.png" },
    { label: "初称号", data: progress(10, 0), speech: "新しい書が加わりました。", owl: "special-companion-owl-a.png" },
    { label: "花の記録", data: progress(20, 0), speech: "花の記録が集まっています。", owl: "special-companion-owl-a.png" },
    { label: "勲章", data: progress(30, 0), speech: "旅の証を大切に収めました。", owl: "special-companion-owl-a.png" },
    { label: "先生の輪", data: progress(0, 1), speech: "よく学び、よく歩みましたね。", owl: "special-companion-owl-b.png" },
    { label: "全達成", data: progress(30, 15), speech: "立派な冒険記録になりました。", owl: "special-companion-owl-b.png", screenshot: "owl-library-complete.png" },
  ]) {
    await seed(page, scenario.data);
    await openLibrary(page);
    const speech = await text(page, "[data-library-speech]");
    const owlSource = await page.locator("[data-library-owl]").getAttribute("src");
    assertIncludes(speech, scenario.speech, `書庫 ${scenario.label} のセリフ`);
    assertIncludes(owlSource, scenario.owl, `書庫 ${scenario.label} の案内役`);
    if (scenario.screenshot) {
      await page.locator("[data-view='titles']").screenshot({ path: path.join(outputDir, scenario.screenshot) });
    }
    checks.push({ kind: "フクロウの書庫", label: scenario.label, speech, owlSource, result: "OK" });
  }

  const brokenImages = await page.locator("img").evaluateAll((images) =>
    images.filter((image) => image.offsetParent !== null && (!image.complete || image.naturalWidth === 0)).map((image) => image.src)
  );
  if (brokenImages.length) throw new Error(`表示中の画像が読み込めません: ${brokenImages.join(", ")}`);
  if (runtimeErrors.length) throw new Error(`画面エラー: ${runtimeErrors.join(" / ")}`);

  const report = {
    checkedAt: new Date().toISOString(),
    app: appUrl,
    viewport: "430x932",
    checks,
    brokenImages,
    runtimeErrors,
    result: "ALL OK",
  };
  fs.writeFileSync(path.join(outputDir, "result.json"), JSON.stringify(report, null, 2), "utf8");
  console.log(`ALL OK: ${checks.length} checks`);
  console.log(path.join(outputDir, "result.json"));
} finally {
  await context.close();
  await browser.close();
}
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
