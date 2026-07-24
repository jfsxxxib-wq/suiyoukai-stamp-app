const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;
const screenshotPath = path.join(root, "output", "safari-use-guide-app-390x844-2026-07-24.png");
const guideSelector = "[data-browser-install-guide]";
const dismissedKey = "suiyoukai-safari-use-guide-dismissed-v1";

const iphoneSafariUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1";

const hiddenEnvironmentUserAgents = {
  "iPhone版Chrome":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) " +
    "AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/138.0.7204.119 Mobile/15E148 Safari/604.1",
  "iPhone版Edge":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) " +
    "AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/138.0 Mobile/15E148 Safari/604.1",
  "iPhone版Firefox":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) " +
    "AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/140.0 Mobile/15E148 Safari/605.1.15",
  Android:
    "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36",
  PC:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
};

const preservedStorage = {
  "suiyoukai-adventurer-name-v1": "テスト参加者",
  "suiyoukai-adventurer-reception-code-v2": "12345678",
  "suiyoukai-stamp-progress-v1": JSON.stringify({
    participation: 1,
    teacherStamps: { onishi: 1 },
  }),
  "suiyoukai-game-records-v1": JSON.stringify([
    { id: "today-record-sentinel", date: "2026-07-24", teacherId: "onishi" },
  ]),
  "suiyoukai-stamp-qr-applied-v1": JSON.stringify(["teacher-sentinel"]),
  "suiyoukai-today-teacher-stamps-v1": JSON.stringify([
    { id: "today-teacher-sentinel", teacherId: "onishi" },
  ]),
};

const withQuery = (query) => {
  const url = new URL(appUrl);
  url.search = query;
  return url.href;
};

const withHash = (hash) => {
  const url = new URL(appUrl);
  url.hash = hash;
  return url.href;
};

const stampUrl = (payload) => {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return withQuery(`?stamp=${encoded}`);
};

const isGuideHidden = (page) => page.locator(guideSelector).evaluate((element) => element.hidden);

let browser;

(async () => {
  const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const scriptSource = fs.readFileSync(path.join(root, "script.js"), "utf8");
  const manifestSource = fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8");

  for (const obsoleteText of [
    "ホーム画面に追加します",
    "ホーム画面の花アイコン",
    "最初にホーム画面へ入れるQR",
    "このQRはホーム画面追加用です",
    "ホーム画面追加用QR",
  ]) {
    assert(
      !indexSource.includes(obsoleteText) && !scriptSource.includes(obsoleteText),
      `旧ホーム画面案内が残っています: ${obsoleteText}`,
    );
  }
  assert(indexSource.includes("Safariで<br>お使いください"));
  assert(indexSource.includes("このまま使う"));
  assert(indexSource.includes("案内を閉じる"));
  assert(scriptSource.includes(`"${dismissedKey}"`));
  assert(manifestSource.includes('"display": "standalone"'), "manifest.webmanifestの表示設定が変わっています");

  browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  });

  const safariContext = await browser.newContext({
    userAgent: iphoneSafariUserAgent,
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  const safariPage = await safariContext.newPage();
  await safariPage.goto(appUrl, { waitUntil: "load" });
  await safariPage.locator(guideSelector).waitFor({ state: "visible" });

  const display = await safariPage.evaluate((selector) => {
    const guide = document.querySelector(selector);
    const card = guide.querySelector(".browser-install-guide-card");
    const heading = guide.querySelector("h1");
    const cardRect = card.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();
    const lineHeight = Number.parseFloat(getComputedStyle(heading).lineHeight);

    return {
      heading: heading.innerText,
      headingLines: Math.round(headingRect.height / lineHeight),
      buttons: [...guide.querySelectorAll("button")].map((button) => button.textContent.trim()),
      card: {
        top: cardRect.top,
        right: cardRect.right,
        bottom: cardRect.bottom,
        left: cardRect.left,
      },
      viewport: { width: window.innerWidth, height: window.innerHeight },
    };
  }, guideSelector);

  assert.equal(display.heading, "Safariで\nお使いください");
  assert.equal(display.headingLines, 2);
  assert.deepEqual(display.buttons, ["このまま使う", "案内を閉じる"]);
  assert(display.card.left >= 0 && display.card.right <= display.viewport.width);
  assert(display.card.top >= 0 && display.card.bottom <= display.viewport.height);

  await safariPage.evaluate((entries) => {
    for (const [key, value] of Object.entries(entries)) {
      localStorage.setItem(key, value);
    }
  }, preservedStorage);
  await safariPage.screenshot({ path: screenshotPath, fullPage: false });

  await safariPage.locator("[data-browser-install-guide-dismiss].is-primary").click();
  assert(await isGuideHidden(safariPage));
  assert.equal(await safariPage.evaluate((key) => localStorage.getItem(key), dismissedKey), "1");
  assert.deepEqual(
    await safariPage.evaluate((keys) => Object.fromEntries(
      keys.map((key) => [key, localStorage.getItem(key)]),
    ), Object.keys(preservedStorage)),
    preservedStorage,
    "既存の名前・受付番号・花・スタンプ・今日の記録が変わっています",
  );

  await safariPage.reload({ waitUntil: "load" });
  assert(await isGuideHidden(safariPage), "再読み込み後に案内が再表示されました");

  const newTabPage = await safariContext.newPage();
  await newTabPage.goto(appUrl, { waitUntil: "load" });
  assert(await isGuideHidden(newTabPage), "新しいタブで案内が再表示されました");

  const installPage = await safariContext.newPage();
  await installPage.goto(withQuery("?install=1"), { waitUntil: "load" });
  assert(await isGuideHidden(installPage), "?install=1が閉じた履歴を無視しました");
  await safariContext.close();

  const secondaryContext = await browser.newContext({
    userAgent: iphoneSafariUserAgent,
    viewport: { width: 390, height: 844 },
  });
  const secondaryPage = await secondaryContext.newPage();
  await secondaryPage.goto(appUrl, { waitUntil: "load" });
  await secondaryPage.locator(guideSelector).waitFor({ state: "visible" });
  await secondaryPage.locator("[data-browser-install-guide-dismiss].is-secondary").click();
  assert(await isGuideHidden(secondaryPage));
  assert.equal(await secondaryPage.evaluate((key) => localStorage.getItem(key), dismissedKey), "1");
  await secondaryContext.close();

  for (const [name, userAgent] of Object.entries(hiddenEnvironmentUserAgents)) {
    const context = await browser.newContext({ userAgent, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(appUrl, { waitUntil: "load" });
    assert(await isGuideHidden(page), `${name}で案内が表示されました`);
    await context.close();
  }

  const standaloneContext = await browser.newContext({
    userAgent: iphoneSafariUserAgent,
    viewport: { width: 390, height: 844 },
  });
  await standaloneContext.addInitScript(() => {
    Object.defineProperty(window.navigator, "standalone", {
      configurable: true,
      value: true,
    });
  });
  const standalonePage = await standaloneContext.newPage();
  await standalonePage.goto(appUrl, { waitUntil: "load" });
  assert(await isGuideHidden(standalonePage), "ホーム画面版で案内が表示されました");
  await standaloneContext.close();

  const excludedRoutes = {
    管理画面: withHash("#admin"),
    受付QR: stampUrl({
      type: "participation_stamp",
      id: "participation-guide-hidden-2026-07-24",
      date: "2026-07-24",
    }),
    先生QR: stampUrl({
      type: "teacher_stamp",
      id: "teacher-guide-hidden-2026-07-24-onishi",
      teacherId: "onishi",
      date: "2026-07-24",
      handicap: "記録なし",
      result: "記録なし",
    }),
  };

  for (const [name, url] of Object.entries(excludedRoutes)) {
    const context = await browser.newContext({
      userAgent: iphoneSafariUserAgent,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "load" });
    assert(await isGuideHidden(page), `${name}で案内が表示されました`);
    await context.close();
  }

  await browser.close();
  browser = null;
  console.log([
    "Safari利用案内の自動試験: OK",
    "- iPhone通常Safari: 初回のみ表示",
    "- 両ボタンの閉じた履歴: 保存",
    "- 再読み込み・新しいタブ・?install=1: 再表示なし",
    "- iPhone版Chrome/Edge/Firefox・Android・PC・ホーム画面版: 非表示",
    "- 管理画面・受付QR・先生QR: 非表示",
    "- 既存保存データ: 変更なし",
    "- 旧ホーム画面案内文: 残存なし",
    screenshotPath,
  ].join("\n"));
})().catch(async (error) => {
  await browser?.close();
  console.error(error);
  process.exitCode = 1;
});
