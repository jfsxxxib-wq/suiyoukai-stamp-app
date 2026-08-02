const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const fixedTeacherDateMessage = "この先生QRは8月30日用ではないか、本日利用できません。QRの日付と日本時間の日付を確認してください。";
const fixedTeacherGenerationMessage = "先生固定QRは2026年8月30日（日本時間）の当日だけ作成できます。今日は作成できません。";
const generalQrErrorPrefix = "QRを開きましたが、先生または日付を読み取れませんでした。";
const storageKeys = [
  "suiyoukai-stamp-progress-v1",
  "suiyoukai-game-records-v1",
  "suiyoukai-operation-history-v1",
  "suiyoukai-stamp-qr-applied-v1",
  "suiyoukai-today-teacher-stamps-v1",
  "suiyoukai-teacher-sharing-outbox-trial-v1",
];

const encodePayload = (payload) => Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
const withStamp = (encoded) => `${appUrl}?stamp=${encoded}`;
const fixedPayload = ({
  date = "2026-08-30",
  teacherId = "tsuneishi",
  id = `teacher-fixed-${date}-${teacherId}`,
  type = "teacher_stamp",
  handicap = "記録なし",
  result = "記録なし",
} = {}) => ({ type, id, teacherId, date, handicap, result });

const installFixedNow = async (page, now) => {
  await page.addInitScript(({ fixedNowText }) => {
    const RealDate = Date;
    window.__SUIYOUKAI_TEST_NOW__ = new RealDate(fixedNowText).getTime();
    class FixedDate extends RealDate {
      constructor(...args) {
        super(...(args.length ? args : [window.__SUIYOUKAI_TEST_NOW__]));
      }

      static now() {
        return window.__SUIYOUKAI_TEST_NOW__;
      }
    }
    window.Date = FixedDate;
  }, { fixedNowText: now });
};

const setFixedNow = (page, now) => page.evaluate((fixedNowText) => {
  window.__SUIYOUKAI_TEST_NOW__ = new Date(fixedNowText).getTime();
}, now);

const snapshotStorage = (page) => page.evaluate((keys) => Object.fromEntries(
  keys.map((key) => [key, localStorage.getItem(key)]),
), storageKeys);

const readState = (page) => page.evaluate((keys) => {
  const parse = (key, fallback) => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  return {
    progress: parse(keys[0], {}),
    gameRecords: parse(keys[1], []),
    history: parse(keys[2], []),
    appliedIds: parse(keys[3], []),
    reflections: parse(keys[4], []),
    outbox: parse(keys[5], []),
  };
}, storageKeys);

let browser;
let checkCount = 0;

const check = (condition, message) => {
  checkCount += 1;
  assert.ok(condition, message);
};

const createPage = async (now) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    timezoneId: "Asia/Tokyo",
  });
  const page = await context.newPage();
  await installFixedNow(page, now);
  await page.addInitScript(() => {
    window.SUIYOUKAI_TEACHER_SHARING_TRIAL = {
      enabled: true,
      submitRecord: async () => ({ result: "verified" }),
    };
  });
  await page.goto(appUrl, { waitUntil: "load" });
  return { context, page };
};

const assertRejected = async ({
  now = "2026-08-30T12:00:00+09:00",
  payload,
  expectedMessagePrefix = generalQrErrorPrefix,
}) => {
  const { context, page } = await createPage(now);
  const before = await snapshotStorage(page);
  await page.goto(withStamp(encodePayload(payload)), { waitUntil: "load" });
  await page.waitForTimeout(450);
  const after = await snapshotStorage(page);
  assert.deepStrictEqual(after, before, "拒否時に保存領域が変化しました");
  check(await page.locator("[data-teacher-sharing-modal]").isHidden(), "拒否時に先生共有モーダルが開きました");
  const message = await page.locator("[data-profile-latest-stamp-copy]").textContent();
  check(message.startsWith(expectedMessagePrefix), `想定外のエラー表示です: ${message}`);
  check(!new URL(page.url()).searchParams.has("stamp"), "拒否後にstampパラメーターが残りました");
  await context.close();
};

(async () => {
  browser = await chromium.launch({ headless: true, executablePath: edgePath });

  {
    const { context, page } = await createPage("2026-08-30T12:00:00+09:00");
    const before = await readState(page);
    const payload = fixedPayload();
    await page.goto(withStamp(encodePayload(payload)), { waitUntil: "load" });
    await page.locator("[data-teacher-sharing-modal]").waitFor({ state: "visible" });
    const afterFirst = await readState(page);
    check(
      afterFirst.progress.stamps.teacherLessonCounts.tsuneishi
        === before.progress.stamps.teacherLessonCounts.tsuneishi + 1,
      "当日の正しい固定QRで先生スタンプが1つ増えませんでした",
    );
    check(afterFirst.gameRecords.length === before.gameRecords.length + 1, "当日の固定QRで対局記録が1件増えませんでした");
    check(afterFirst.history.length === before.history.length + 1, "当日の固定QRで操作履歴が1件増えませんでした");
    check(afterFirst.appliedIds.includes(payload.id), "当日の固定QRが使用済みIDへ追加されませんでした");
    check(afterFirst.reflections.length === before.reflections.length + 1, "先生共有用記録が1件増えませんでした");

    const afterFirstRaw = await snapshotStorage(page);
    await page.goto(withStamp(encodePayload(payload)), { waitUntil: "load" });
    await page.waitForTimeout(450);
    const afterSecondRaw = await snapshotStorage(page);
    assert.deepStrictEqual(afterSecondRaw, afterFirstRaw, "同じ当日固定QRの2回目で保存領域が変化しました");
    check(await page.locator("[data-teacher-sharing-modal]").isHidden(), "重複固定QRで先生共有モーダルが開きました");
    await context.close();
  }

  await assertRejected({
    payload: fixedPayload({ type: "participation_stamp" }),
  });

  for (const field of ["type", "id", "teacherId", "date", "handicap", "result"]) {
    const payload = fixedPayload();
    delete payload[field];
    await assertRejected({ payload });
  }

  for (const [field, values] of Object.entries({
    type: [null, "", "participation_stamp"],
    id: [null, "", "teacher-fixed-"],
    teacherId: [null, "", "not-registered"],
    date: [null, "", "2026/08/30"],
    handicap: [null, "", "互先"],
    result: [null, "", "勝ち"],
  })) {
    for (const value of values) {
      const payload = fixedPayload();
      payload[field] = value;
      await assertRejected({ payload });
    }
  }

  await assertRejected({
    now: "2026-08-29T12:00:00+09:00",
    payload: fixedPayload(),
    expectedMessagePrefix: fixedTeacherDateMessage,
  });
  await assertRejected({
    now: "2026-08-31T12:00:00+09:00",
    payload: fixedPayload(),
    expectedMessagePrefix: fixedTeacherDateMessage,
  });
  await assertRejected({
    now: "2026-08-29T12:00:00+09:00",
    payload: fixedPayload({ date: "2026-08-29" }),
    expectedMessagePrefix: fixedTeacherDateMessage,
  });
  await assertRejected({ payload: fixedPayload({ id: "teacher-fixed-2026-08-29-tsuneishi" }) });
  await assertRejected({ payload: fixedPayload({ id: "teacher-fixed-2026-08-30-yuki" }) });
  await assertRejected({ payload: fixedPayload({ teacherId: "not-registered" }) });
  await assertRejected({ payload: fixedPayload({ handicap: "互先" }) });
  await assertRejected({ payload: fixedPayload({ result: "勝ち" }) });
  await assertRejected({ payload: fixedPayload({ id: "teacher-fixed-" }) });
  await assertRejected({
    payload: fixedPayload({ date: "2026-8-30", id: "teacher-fixed-2026-8-30-tsuneishi" }),
  });

  {
    const { context, page } = await createPage("2026-08-29T12:00:00+09:00");
    let qrServiceRequests = 0;
    await page.route("https://api.qrserver.com/**", async (route) => {
      qrServiceRequests += 1;
      await route.abort();
    });
    await page.evaluate(() => {
      const panel = document.querySelector("[data-admin-fixed-teacher-qr]");
      const list = document.querySelector("[data-admin-fixed-teacher-qr-list]");
      panel.hidden = false;
      list.innerHTML = '<article class="admin-fixed-teacher-qr-item"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="><a href="#old">old</a></article>';
      document.body.classList.add("is-admin-qr-print-preview");
      document.querySelector("[data-admin-fixed-teacher-qr-print]").disabled = false;
      document.querySelector("[data-admin-fixed-teacher-qr-pdf]").disabled = false;
    });
    await page.locator("[data-admin-fixed-teacher-qr-create]").evaluate((button) => button.click());
    await page.waitForTimeout(200);
    check(qrServiceRequests === 0, "イベント日以外の生成拒否でQR画像サービスが呼ばれました");
    check(await page.locator("[data-admin-fixed-teacher-qr-list] img").count() === 0, "生成拒否後にQR画像が残りました");
    check(await page.locator("[data-admin-fixed-teacher-qr-list] a").count() === 0, "生成拒否後に保存・読取り用リンクが残りました");
    check(await page.locator("[data-admin-fixed-teacher-qr-list] .admin-fixed-teacher-qr-item").count() === 0, "生成拒否後に印刷カードが残りました");
    check(await page.locator("[data-admin-fixed-teacher-qr-print]").isDisabled(), "生成拒否後も印刷操作が有効です");
    check(await page.locator("[data-admin-fixed-teacher-qr-pdf]").isDisabled(), "生成拒否後もPDF操作が有効です");
    check(!await page.locator("body").evaluate((body) => body.classList.contains("is-admin-qr-print-preview")), "生成拒否後も印刷表示が残りました");
    check(
      await page.locator("[data-admin-fixed-teacher-qr-list]").textContent() === fixedTeacherGenerationMessage,
      "生成拒否時の案内文が指定どおりではありません",
    );
    await context.close();
  }

  {
    const { context, page } = await createPage("2026-08-30T12:00:00+09:00");
    let qrServiceRequests = 0;
    await page.route("https://api.qrserver.com/**", async (route) => {
      qrServiceRequests += 1;
      await route.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>',
      });
    });
    const registeredTeacherCount = await page.locator("[data-admin-game-record-teacher] option").count();
    await page.locator("[data-admin-fixed-teacher-qr-create]").evaluate((button) => button.click());
    await page.waitForTimeout(300);
    check(registeredTeacherCount > 0, "登録先生一覧を取得できませんでした");
    check(
      await page.locator("[data-admin-fixed-teacher-qr-list] .admin-fixed-teacher-qr-item").count()
        === registeredTeacherCount,
      "8月30日に登録先生全員分の固定QRカードを生成できませんでした",
    );
    check(
      await page.locator("[data-admin-fixed-teacher-qr-list] img").count() === registeredTeacherCount,
      "8月30日に登録先生全員分の固定QR画像を生成できませんでした",
    );
    check(qrServiceRequests === registeredTeacherCount, "8月30日のQR画像サービス呼出し数が登録先生数と一致しません");
    check(!await page.locator("[data-admin-fixed-teacher-qr-print]").isDisabled(), "8月30日に印刷操作が有効になりませんでした");
    check(!await page.locator("[data-admin-fixed-teacher-qr-pdf]").isDisabled(), "8月30日にPDF操作が有効になりませんでした");
    check(
      await page.locator("[data-admin-fixed-teacher-qr-list] small").evaluateAll((labels) =>
        labels.every((label) => label.textContent.includes("2026/08/30"))),
      "8月30日に生成した固定QRの日付表示が正しくありません",
    );
    await context.close();
  }

  {
    const { context, page } = await createPage("2026-08-30T12:00:00+09:00");
    const before = await readState(page);
    const payload = {
      type: "teacher_stamp",
      id: "qr-tsuneishi-2026-08-20-regression",
      teacherId: "tsuneishi",
      date: "2026-08-20",
      handicap: "2子",
      result: "勝ち",
    };
    await page.goto(withStamp(encodePayload(payload)), { waitUntil: "load" });
    const after = await readState(page);
    check(after.gameRecords.length === before.gameRecords.length + 1, "qr-形式の対局内容QRが反映されませんでした");
    const record = after.gameRecords.at(-1);
    check(
      record.date === payload.date && record.handicap === payload.handicap && record.result === payload.result,
      "qr-形式の対局内容QRが選択日または対局内容を保持しませんでした",
    );
    await context.close();
  }

  {
    const { context, page } = await createPage("2026-08-30T12:00:00+09:00");
    const todayPayload = { type: "participation_stamp", id: "participation-2026-08-30", date: "2026-08-30" };
    const before = await readState(page);
    await page.goto(withStamp(encodePayload(todayPayload)), { waitUntil: "load" });
    const afterToday = await readState(page);
    check(
      afterToday.progress.stamps.participationCount === before.progress.stamps.participationCount + 1,
      "受付QRの当日一致処理が反映されませんでした",
    );
    const beforeFuture = await snapshotStorage(page);
    await page.goto(withStamp(encodePayload({
      type: "participation_stamp",
      id: "participation-2026-08-31",
      date: "2026-08-31",
    })), { waitUntil: "load" });
    const afterFuture = await snapshotStorage(page);
    assert.deepStrictEqual(afterFuture, beforeFuture, "未来日の受付QRで保存領域が変化しました");
    check(true, "受付QRの未来日拒否");
    await context.close();
  }

  for (const encoded of ["%%%", Buffer.from("{not-json", "utf8").toString("base64url")]) {
    const { context, page } = await createPage("2026-08-30T12:00:00+09:00");
    const before = await snapshotStorage(page);
    await page.goto(withStamp(encoded), { waitUntil: "load" });
    const after = await snapshotStorage(page);
    assert.deepStrictEqual(after, before, "不正Base64または不正JSONで保存領域が変化しました");
    check(true, "不正Base64または不正JSONの保存不変");
    await context.close();
  }

  for (const [now, shouldApply] of [
    ["2026-08-29T23:59:59+09:00", false],
    ["2026-08-30T00:00:01+09:00", true],
    ["2026-08-30T23:59:59+09:00", true],
    ["2026-08-31T00:00:01+09:00", false],
  ]) {
    const { context, page } = await createPage(now);
    const before = await readState(page);
    await page.goto(withStamp(encodePayload(fixedPayload())), { waitUntil: "load" });
    await page.waitForTimeout(450);
    const after = await readState(page);
    const delta = after.progress.stamps.teacherLessonCounts.tsuneishi
      - before.progress.stamps.teacherLessonCounts.tsuneishi;
    check(delta === (shouldApply ? 1 : 0), `日本時間境界 ${now} の判定が正しくありません`);
    await context.close();
  }

  console.log(`teacher fixed QR date guard: OK (${checkCount} checks)`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await browser?.close();
});
