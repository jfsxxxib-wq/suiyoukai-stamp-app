const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;
const outputDir = path.join(__dirname, "teacher-sharing-trial-check-2026-07-21");
const outboxKey = "suiyoukai-teacher-sharing-outbox-trial-v1";
const receptionKey = "suiyoukai-adventurer-reception-code-v2";
const nameKey = "suiyoukai-adventurer-name-v1";

fs.mkdirSync(outputDir, { recursive: true });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const encodePayload = (payload) => Buffer.from(JSON.stringify(payload), "utf8")
  .toString("base64url");

const stampUrl = (teacherId, id) => `${appUrl}?stamp=${encodePayload({
  type: "teacher_stamp",
  id,
  teacherId,
  date: "2026-07-21",
  handicap: "記録なし",
  result: "記録なし",
})}`;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });

  await page.addInitScript(() => {
    window.SUIYOUKAI_TEACHER_SHARING_TRIAL = {
      enabled: true,
      submitRecord: async () => ({ result: localStorage.getItem("teacher-sharing-test-result") || "verified" }),
    };
  });

  await page.goto(appUrl, { waitUntil: "load" });
  await page.evaluate(([nameStorageKey, receptionStorageKey, sharingOutboxKey]) => {
    localStorage.setItem(nameStorageKey, "みずのしずく");
    localStorage.setItem(receptionStorageKey, "12345678");
    localStorage.removeItem(sharingOutboxKey);
    localStorage.setItem("teacher-sharing-test-result", "verified");
  }, [nameKey, receptionKey, outboxKey]);

  await page.goto(stampUrl("tsuneishi", "teacher-fixed-2026-07-21-tsuneishi"), { waitUntil: "load" });
  await page.locator("[data-teacher-sharing-modal]").waitFor({ state: "visible" });
  assert(await page.locator("[data-teacher-sharing-title]").textContent() === "今日の花が入りました", "花保存成功画面が出ません。");
  const gameRecords = await page.evaluate(() => JSON.parse(localStorage.getItem("suiyoukai-game-records-v1") || "[]"));
  assert(gameRecords.length === 1, "共有確認より先に端末内対局記録が保存されていません。");
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, "01-flower-saved.png"), fullPage: true });

  await page.locator("[data-teacher-sharing-primary]").click();
  await page.locator("[data-teacher-sharing-handicap]").selectOption("3子");
  await page.screenshot({ path: path.join(outputDir, "02-consent.png"), fullPage: true });
  await page.locator("[data-teacher-sharing-primary]").click();
  await page.waitForFunction(() => document.querySelector("[data-teacher-sharing-title]")?.textContent.includes("ご縁帳へ残しました"));
  await page.screenshot({ path: path.join(outputDir, "03-shared.png"), fullPage: true });

  let outbox = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), outboxKey);
  assert(outbox.length === 1, "共有待ち記録が1件になっていません。");
  assert(outbox[0].status === "sent", "送信済みになっていません。");
  assert(outbox[0].receptionCodeAtConsent === "12345678", "同意時点の受付番号が固定保存されていません。");

  await page.locator("[data-teacher-sharing-primary]").click();
  await page.goto(stampUrl("tsuneishi", "teacher-fixed-2026-07-21-tsuneishi"), { waitUntil: "load" });
  assert(await page.locator("[data-teacher-sharing-modal]").isHidden(), "同じ先生QRの再読込で共有画面が再表示されました。");
  const recordsAfterDuplicate = await page.evaluate(() => JSON.parse(localStorage.getItem("suiyoukai-game-records-v1") || "[]"));
  assert(recordsAfterDuplicate.length === 1, "同じ先生QRで端末内対局記録が二重になりました。");

  await page.goto(stampUrl("yuki", "teacher-fixed-2026-07-21-yuki"), { waitUntil: "load" });
  await page.locator("[data-teacher-sharing-modal]").waitFor({ state: "visible" });
  await page.locator("[data-teacher-sharing-primary]").click();
  await page.locator("[data-teacher-sharing-secondary]").click();
  assert(await page.locator("[data-teacher-sharing-title]").textContent() === "花と今日の記録は保存されています", "共有しない結果が表示されません。");
  outbox = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), outboxKey);
  assert(outbox.length === 1, "共有しない一局が共有待ちへ入りました。");

  await page.locator("[data-teacher-sharing-primary]").click();
  await page.evaluate(() => localStorage.setItem("teacher-sharing-test-result", "temporary_error"));
  await page.goto(stampUrl("koike", "teacher-fixed-2026-07-21-koike"), { waitUntil: "load" });
  await page.locator("[data-teacher-sharing-modal]").waitFor({ state: "visible" });
  await page.locator("[data-teacher-sharing-primary]").click();
  await page.locator("[data-teacher-sharing-handicap]").selectOption("分からない");
  await page.locator("[data-teacher-sharing-primary]").click();
  await page.waitForFunction(() => document.querySelector("[data-teacher-sharing-title]")?.textContent === "花と今日の記録は保存されました");
  await page.screenshot({ path: path.join(outputDir, "04-connection-hold.png"), fullPage: true });

  outbox = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), outboxKey);
  const pending = outbox.find((record) => record.teacherId === "koike");
  assert(pending?.status === "pending", "通信失敗記録が端末内保留になっていません。");
  assert(gameRecords.length === 1, "初回の端末内記録確認値が変わりました。");

  await page.evaluate(() => localStorage.setItem("teacher-sharing-test-result", "verified"));
  await page.locator("[data-teacher-sharing-primary]").click();
  await page.waitForFunction(() => document.querySelector("[data-teacher-sharing-title]")?.textContent.includes("ご縁帳へ残しました"));
  outbox = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), outboxKey);
  const retried = outbox.find((record) => record.teacherId === "koike");
  assert(retried?.status === "sent" && retried.retryCount === 2, "本人操作による再送が完了していません。");

  const teacherPage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await teacherPage.addInitScript(() => {
    window.SUIYOUKAI_TEACHER_SESSION = {
      teacher: { id: "tsuneishi", name: "常石 隆志 六段" },
      getRecords: async () => ([{
        id: "share-game-qr-teacher-fixed-2026-07-21-tsuneishi",
        teacherId: "tsuneishi",
        participantId: "trial-participant-1",
        participantName: "みずのしずく",
        consentToTeacher: true,
        date: "2026-07-21",
        rank: "",
        handicap: "3子",
        venue: "",
      }]),
    };
  });
  await teacherPage.goto(pathToFileURL(path.join(root, "teacher-notebook.html")).href, { waitUntil: "load" });
  await teacherPage.locator("[data-open-today]").click();
  await teacherPage.waitForTimeout(700);
  assert(await teacherPage.locator("[data-today-list]").textContent().then((value) => value.includes("みずのしずくさん")), "先生ページに共有記録が表示されません。");
  await teacherPage.screenshot({ path: path.join(outputDir, "05-teacher-card.png"), fullPage: true });

  fs.writeFileSync(path.join(outputDir, "result.json"), JSON.stringify({
    result: "OK",
    checks: [
      "花と今日の記録を共有前に保存",
      "同意画面と置き石必須",
      "同意時点の受付番号を固定",
      "同じ先生QRの二重反映防止",
      "共有しない自由",
      "通信失敗時は端末内保留",
      "本人操作による再送",
      "先生本人ページの最小一局カード",
    ],
  }, null, 2));

  await browser.close();
  console.log("teacher sharing trial check: OK");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
