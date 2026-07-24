const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;
const screenshotPath = path.join(root, "output", "teacher-sharing-timeout-mobile-390x844-2026-07-24.png");
const outboxKey = "suiyoukai-teacher-sharing-outbox-trial-v1";
const receptionKey = "suiyoukai-adventurer-reception-code-v2";
const nameKey = "suiyoukai-adventurer-name-v1";

const encodePayload = (payload) => Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
const stampUrl = (teacherId, id) => `${appUrl}?stamp=${encodePayload({
  type: "teacher_stamp",
  id,
  teacherId,
  date: "2026-07-24",
  handicap: "記録なし",
  result: "記録なし",
})}`;

let browser;

(async () => {
  browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });

  await page.addInitScript(() => {
    window.__teacherSharingSendCount = 0;
    window.__todayRecordScrollCount = 0;
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (...args) {
      window.__todayRecordScrollCount += 1;
      return originalScrollIntoView?.apply(this, args);
    };
    window.SUIYOUKAI_TEACHER_SHARING_TRIAL = {
      enabled: true,
      testTimeoutMs: 30,
      submitRecord: () => {
        window.__teacherSharingSendCount += 1;
        return new Promise(() => {});
      },
    };
  });

  await page.goto(appUrl, { waitUntil: "load" });
  await page.evaluate(([nameStorageKey, receptionStorageKey, sharingOutboxKey]) => {
    localStorage.setItem(nameStorageKey, "みずのしずく");
    localStorage.setItem(receptionStorageKey, "12345678");
    localStorage.removeItem(sharingOutboxKey);
  }, [nameKey, receptionKey, outboxKey]);

  await page.goto(stampUrl("koike", "teacher-fixed-timeout-display-2026-07-24-koike"), { waitUntil: "load" });
  await page.locator("[data-teacher-sharing-modal]").waitFor({ state: "visible" });
  await page.locator("[data-teacher-sharing-primary]").click();
  await page.locator("[data-teacher-sharing-handicap]").selectOption("分からない");
  await page.locator("[data-teacher-sharing-primary]").click();
  await page.waitForFunction(() => (
    document.querySelector("[data-teacher-sharing-title]")?.textContent.replace(/\s+/g, "") ===
    "送信結果を確認できませんでした"
  ));

  const timeoutDisplay = await page.evaluate(() => ({
    titleLines: [...document.querySelectorAll(".teacher-sharing-title-line")].map((element) => element.textContent),
    safeLines: [...document.querySelectorAll(".teacher-sharing-safe-line")].map((element) => element.textContent),
    safeWhiteSpace: [...document.querySelectorAll(".teacher-sharing-safe-line")]
      .map((element) => getComputedStyle(element).whiteSpace),
    messageLines: [...document.querySelectorAll(".teacher-sharing-message-line")].map((element) => element.textContent),
    buttons: [...document.querySelectorAll("[data-teacher-sharing-actions] button")].map((button) => ({
      text: button.textContent,
      background: getComputedStyle(button).backgroundColor,
    })),
    sendCount: window.__teacherSharingSendCount,
  }));

  assert.deepEqual(timeoutDisplay.titleLines, ["送信結果を", "確認できませんでした"]);
  assert.deepEqual(timeoutDisplay.safeLines, ["花と今日の記録は、", "スマホに保存されています。"]);
  assert.deepEqual(timeoutDisplay.safeWhiteSpace, ["nowrap", "nowrap"]);
  assert.deepEqual(timeoutDisplay.messageLines, [
    "ご縁帳には保存済みの可能性があります。",
    "重複を防ぐため、自動再送はしていません。",
    "必要な場合は、運営にご確認ください。",
  ]);
  assert.deepEqual(timeoutDisplay.buttons.map((button) => button.text), ["今日の記録を見る", "閉じる"]);
  assert.notEqual(timeoutDisplay.buttons[0].background, timeoutDisplay.buttons[1].background);
  assert.equal(timeoutDisplay.sendCount, 1);

  const outbox = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), outboxKey);
  const pending = outbox.find((record) => record.teacherId === "koike");
  assert.equal(pending?.status, "pending");
  assert.equal(pending?.retryCount, 1);

  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => window.__teacherSharingSendCount), 1, "タイムアウト後に自動再送されました。");
  await page.screenshot({ path: screenshotPath, fullPage: false });

  const beforeTodayRecord = await page.evaluate(() => window.__todayRecordScrollCount);
  await page.locator("[data-teacher-sharing-primary]").click();
  await page.waitForTimeout(700);
  assert(await page.locator("[data-teacher-sharing-modal]").isHidden());
  assert(
    await page.evaluate(() => window.__todayRecordScrollCount) > beforeTodayRecord,
    "「今日の記録を見る」で今日の記録へ移動しませんでした。",
  );

  await page.goto(stampUrl("yuki", "teacher-fixed-timeout-display-2026-07-24-yuki"), { waitUntil: "load" });
  await page.locator("[data-teacher-sharing-modal]").waitFor({ state: "visible" });
  await page.locator("[data-teacher-sharing-primary]").click();
  await page.locator("[data-teacher-sharing-handicap]").selectOption("分からない");
  await page.locator("[data-teacher-sharing-primary]").click();
  await page.waitForFunction(() => document.querySelectorAll(".teacher-sharing-title-line").length === 2);
  await page.waitForTimeout(700);
  const beforeClose = await page.evaluate(() => window.__todayRecordScrollCount);
  await page.locator("[data-teacher-sharing-secondary]").click();
  await page.waitForTimeout(700);
  assert(await page.locator("[data-teacher-sharing-modal]").isHidden());
  assert.equal(
    await page.evaluate(() => window.__todayRecordScrollCount),
    beforeClose,
    "「閉じる」で今日の記録への移動が起きました。",
  );
  assert.equal(await page.evaluate(() => window.__teacherSharingSendCount), 1);

  await browser.close();
  browser = null;
  console.log(`teacher sharing timeout display check: OK\n${screenshotPath}`);
})().catch(async (error) => {
  await browser?.close();
  console.error(error);
  process.exitCode = 1;
});
