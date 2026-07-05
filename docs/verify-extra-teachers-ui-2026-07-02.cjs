const { chromium } = require("playwright");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;
const progressKey = "suiyoukai-stamp-progress-v1";
const primaryTeacherIds = ["tsuneishi", "yuki", "koike", "yamashiro", "matsumoto"];
const extraTeacherIds = ["teacher_extra_01", "teacher_extra_02"];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });

  try {
    await page.goto(appUrl, { waitUntil: "load" });
    await page.evaluate(([key, primaryIds, extraIds]) => {
      localStorage.setItem(key, JSON.stringify({
        schemaVersion: 2,
        stamps: {
          participationCount: 0,
          lastParticipationStampDate: "",
          teacherLessonCounts: Object.fromEntries([
            ...primaryIds.map((teacherId) => [teacherId, 1]),
            ...extraIds.map((teacherId) => [teacherId, 0]),
          ]),
          teacherCircleRounds: 0,
        },
        earned: { fairies: [], medals: [], titles: [], companions: [] },
      }));
    }, [progressKey, primaryTeacherIds, extraTeacherIds]);
    await page.reload({ waitUntil: "load" });

    const teacherCardCount = await page.locator(".teacher-card").count();
    const extraFlowerCardCount = await page.locator(
      '[data-flower-guide-target="teacher_extra_01"], [data-flower-guide-target="teacher_extra_02"]'
    ).count();
    const labels = await page.locator(".teacher-card small").allTextContents();
    const progress = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), progressKey);

    await page.evaluate(() => {
      window.location.hash = "#admin";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    await page.locator('[data-panel="admin"]').click();
    await page.locator("[data-admin-passcode-input]").fill("運営端末で設定したパスコード");
    await page.locator("[data-admin-passcode-button]").click();

    const adminTeacherOptionCount = await page.locator("[data-admin-game-record-teacher] option").count();

    assert(teacherCardCount === 7, `先生一覧が7枠ではありません: ${teacherCardCount}`);
    assert(extraFlowerCardCount === 2, `花図鑑の追加先生枠が2枠ではありません: ${extraFlowerCardCount}`);
    assert(adminTeacherOptionCount === 7, `運営の押印対象が7人ではありません: ${adminTeacherOptionCount}`);
    assert(progress.stamps.teacherCircleRounds === 1, "追加先生0回で基本5人の輪が後退しました。");
    assert(labels.some((label) => label.includes("追加先生枠")), "追加先生枠の表示ラベルがありません。");

    console.log("ALL OK: extra teacher UI checks");
    console.log(JSON.stringify({
      teacherCardCount,
      extraFlowerCardCount,
      adminTeacherOptionCount,
      teacherCircleRounds: progress.stamps.teacherCircleRounds,
    }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

