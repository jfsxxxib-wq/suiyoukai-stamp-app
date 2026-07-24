const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { createLocalMobileServer } = require("../local-mobile-server.cjs");

const root = path.resolve(__dirname, "..");
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const publicHostname = "teacher-preview-public.test";

const listen = (server) => new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => resolve(server.address().port));
});

const closeServer = (server) => new Promise((resolve, reject) => {
  server.close((error) => error ? reject(error) : resolve());
});

const addPreviewConfig = async (page) => {
  await page.addInitScript(() => {
    window.SUIYOUKAI_TEACHER_NOTEBOOK_PREVIEW = Object.freeze({
      enabled: true,
    });
  });
};

const addProductionSession = async (page, { valid = true, includePreview = false } = {}) => {
  await page.addInitScript(({ isValid, hasPreview }) => {
    if (hasPreview) {
      window.SUIYOUKAI_TEACHER_NOTEBOOK_PREVIEW = Object.freeze({
        enabled: true,
      });
    }
    window.SUIYOUKAI_TEACHER_SESSION = isValid
      ? {
          teacher: { id: "production-teacher", name: "本番試験先生" },
          getRecords: async () => ([{
            id: "production-record-001",
            teacherId: "production-teacher",
            participantId: "production-participant",
            participantName: "本番セッション試験",
            consentToTeacher: true,
            date: "2026-07-24",
            rank: "",
            handicap: "互先",
            venue: "",
          }]),
        }
      : {
          teacher: { id: "broken-session", name: "不完全なセッション" },
        };
  }, { isValid: valid, hasPreview: includePreview });
};

const expectClosed = async (page, label) => {
  await page.locator("[data-notebook-lock]").waitFor({ state: "visible" });
  assert.equal(await page.locator("[data-notebook-book]").isHidden(), true, `${label}: 手帳が閉じていません。`);
  assert.equal(await page.locator(".preview-ribbon").count(), 0, `${label}: 見本リボンが表示されました。`);
};

const expectPreview = async (page, teacherName = "常石 隆志 六段") => {
  await page.locator("[data-notebook-book]").waitFor({ state: "visible" });
  assert.equal(await page.locator("[data-notebook-lock]").isHidden(), true, "見本表示時に閉鎖画面が残っています。");
  assert.equal(await page.locator("[data-teacher-name]").textContent(), teacherName, "見本の先生名が一致しません。");
  assert.equal(await page.locator(".preview-ribbon").textContent(), "見本データ", "見本リボンが表示されません。");
};

(async () => {
  const html = fs.readFileSync(path.join(root, "teacher-notebook.html"), "utf8");
  assert.equal(
    /SUIYOUKAI_TEACHER_NOTEBOOK_PREVIEW\s*=\s*[^<]*enabled\s*:\s*true/.test(html),
    false,
    "公開HTMLにローカル見本設定が含まれています。"
  );

  const server = createLocalMobileServer({ rootDir: root });
  let browser;
  try {
    const port = await listen(server);
    const localBase = `http://127.0.0.1:${port}`;
    const publicBase = `http://${publicHostname}:${port}`;
    browser = await chromium.launch({
      headless: true,
      executablePath: edgePath,
      args: [
        `--host-resolver-rules=MAP ${publicHostname} 127.0.0.1`,
        "--no-proxy-server",
      ],
    });

    {
      const page = await browser.newPage();
      await page.goto(`${localBase}/teacher-notebook.html`, { waitUntil: "load" });
      await expectClosed(page, "通常URL・設定なし");
      await page.close();
      console.log("OK  通常URL・設定なしは閉鎖画面");
    }

    {
      const page = await browser.newPage();
      await page.goto(`${localBase}/teacher-notebook.html?preview=1`, { waitUntil: "load" });
      await expectClosed(page, "preview指定・設定なし");
      await page.close();
      console.log("OK  preview=1だけでは閉鎖画面");
    }

    {
      const page = await browser.newPage();
      await addPreviewConfig(page);
      await page.goto(`${localBase}/teacher-notebook.html`, { waitUntil: "load" });
      await expectClosed(page, "設定あり・preview指定なし");
      await page.close();
      console.log("OK  設定だけでは閉鎖画面");
    }

    {
      const page = await browser.newPage();
      await addPreviewConfig(page);
      await page.goto(`${localBase}/teacher-notebook.html?preview=1&teacher=tsuneishi`, { waitUntil: "load" });
      await expectPreview(page);
      await page.close();
      console.log("OK  ローカル環境・設定・preview=1で見本表示");
    }

    {
      const page = await browser.newPage();
      await page.goto(`${localBase}/teacher-notebook-preview?preview=1&teacher=tsuneishi`, { waitUntil: "load" });
      await expectPreview(page);
      await page.close();
      console.log("OK  ローカル専用入口が設定を注入");
    }

    {
      const page = await browser.newPage();
      await page.goto(`${localBase}/teacher-notebook-preview?teacher=tsuneishi`, { waitUntil: "load" });
      await expectClosed(page, "専用入口・preview指定なし");
      await page.close();
      console.log("OK  専用入口でもpreview=1なしは閉鎖画面");
    }

    {
      const page = await browser.newPage();
      await page.goto(`${localBase}/teacher-notebook-preview?preview=1&teacher=unknown`, { waitUntil: "load" });
      await expectClosed(page, "不明な先生ID");
      await page.close();
      console.log("OK  不明な先生IDは閉鎖画面");
    }

    {
      const page = await browser.newPage();
      await addProductionSession(page);
      await page.goto(`${localBase}/teacher-notebook.html`, { waitUntil: "load" });
      await page.locator("[data-notebook-book]").waitFor({ state: "visible" });
      assert.equal(await page.locator("[data-teacher-name]").textContent(), "本番試験先生");
      assert.equal(await page.locator(".preview-ribbon").count(), 0);
      await page.close();
      console.log("OK  正常な本番セッションで本番ページ");
    }

    {
      const page = await browser.newPage();
      await addProductionSession(page, { includePreview: true });
      await page.goto(`${localBase}/teacher-notebook.html?preview=1&teacher=tsuneishi`, { waitUntil: "load" });
      await page.locator("[data-notebook-book]").waitFor({ state: "visible" });
      assert.equal(await page.locator("[data-teacher-name]").textContent(), "本番試験先生");
      assert.equal(await page.locator(".preview-ribbon").count(), 0);
      await page.close();
      console.log("OK  本番セッションを見本条件より優先");
    }

    {
      const page = await browser.newPage();
      await addProductionSession(page, { valid: false, includePreview: true });
      await page.goto(`${localBase}/teacher-notebook.html?preview=1&teacher=tsuneishi`, { waitUntil: "load" });
      await expectClosed(page, "不完全な本番セッション");
      await page.close();
      console.log("OK  不完全な本番セッションは見本へ逃げず閉鎖");
    }

    {
      const page = await browser.newPage();
      await addPreviewConfig(page);
      await page.goto(`${publicBase}/teacher-notebook.html?preview=1&teacher=tsuneishi`, { waitUntil: "load" });
      await expectClosed(page, "公開相当ホスト");
      await page.close();
      console.log("OK  公開相当ホストでは設定を注入しても閉鎖");
    }

    console.log("teacher notebook preview access check: OK");
  } finally {
    if (browser) await browser.close();
    if (server.listening) await closeServer(server);
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
