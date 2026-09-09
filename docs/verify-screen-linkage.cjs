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
const encodePayload = (payload) => Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
const withStamp = (payload) => `${appUrl}?stamp=${encodePayload(payload)}`;

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
  fairies: await page.locator("[data-profile-fairy-list] strong, [data-profile-fairy-list] img").evaluateAll((items) =>
    items.map((item) => item.tagName === "IMG" ? item.alt : item.textContent)
  ),
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
    { count: 10, flower: "コスモス", fairy: "コスモスの妖精", achieved: "1/3巡 達成", guide: "1/33" },
    { count: 20, flower: "藤", fairy: "藤の妖精", achieved: "2/3巡 達成", guide: "2/33" },
    { count: 30, flower: "金木犀", fairy: "金木犀の妖精", achieved: "3/3巡 達成", guide: "3/33" },
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
    { count: 5, flower: "蓮", fairy: "菖蒲の妖精", achieved: "5/30妖精 達成", guide: "5/33" },
    { count: 10, flower: "菫", fairy: "蓮の妖精", achieved: "10/30妖精 達成", guide: "10/33" },
    { count: 15, flower: "菫", fairy: "菫の妖精", achieved: "15/30妖精 達成", guide: "15/33" },
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
    await page.goto(withStamp({
      type: "teacher_stamp",
      id: `qr-tsuneishi-2026-06-18-achievement-${scenario.count}`,
      teacherId: "tsuneishi",
      date: "2026-06-18",
      handicap: "記録なし",
      result: "記録なし",
    }), { waitUntil: "load" });
    await openProfile(page);
    const profile = await collectProfile(page);
    const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
    assertIncludes(profile.fairies.join(" / "), scenario.fairy, `先生${scenario.count}回の妖精表示`);
    assertIncludes(JSON.stringify(stored.earned.fairies), scenario.fairy, `先生${scenario.count}回の妖精保存`);
    checks.push({ kind: "先生QR達成保存", count: scenario.count, fairy: scenario.fairy, profile, result: "OK" });
  }

  await seed(page, progress(0, 0));
  await page.goto(withStamp({
    type: "teacher_stamp",
    id: "qr-tsuneishi-2026-06-18-screen-linkage",
    teacherId: "tsuneishi",
    date: "2026-06-18",
    handicap: "2子",
    result: "勝ち",
  }), { waitUntil: "load" });
  await page.locator('[data-panel="field-guide"]').evaluate((button) => button.click());
  await page.locator('[data-teacher="tsuneishi"]').click();

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
  checks.push({ kind: "受付済み対局QR", countAfterSaving, savedRecords, result: "OK" });

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
    { label: "初スタンプ", data: progress(1, 0), speech: "一頁目です", owl: "special-companion-owl-a.png" },
    { label: "初称号", data: progress(10, 0), speech: "書が増えました", owl: "special-companion-owl-a.png" },
    { label: "花の記録", data: progress(20, 0), speech: "花が集まりました", owl: "special-companion-owl-a.png" },
    { label: "勲章", data: progress(30, 0), speech: "証を収めました", owl: "special-companion-owl-a.png" },
    { label: "先生の輪", data: progress(0, 1), speech: "よく学びましたね", owl: "special-companion-owl-b.png" },
    { label: "全達成", data: progress(30, 15), speech: "見事な記録です", owl: "special-companion-owl-b.png", screenshot: "owl-library-complete.png" },
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

