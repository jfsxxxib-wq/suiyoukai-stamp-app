const { chromium } = require("playwright");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const appUrl = pathToFileURL(path.join(root, "index.html")).href;
const progressKey = "suiyoukai-stamp-progress-v1";
const primaryTeacherIds = ["tsuneishi", "yuki", "koike", "yamashiro", "matsumoto"];
const extraTeacherIds = [
  "teacher_extra_01",
  "teacher_extra_02",
  "teacher_extra_03",
  "teacher_extra_04",
  "teacher_extra_05",
];

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
        gameRecords: [],
        operationHistory: [],
      }));
    }, [progressKey, primaryTeacherIds, extraTeacherIds]);
    await page.reload({ waitUntil: "load" });
    await page.locator('[data-panel="field-guide"]').click();
    await page.locator('[data-view="field-guide"]').waitFor({ state: "visible" });

    const teacherCards = page.locator(".teacher-card");
    const teacherCardCount = await teacherCards.count();
    const extraTeacherNames = await page
      .locator(extraTeacherIds.map((teacherId) => `[data-teacher="${teacherId}"] strong`).join(", "))
      .allTextContents();
    const extraFlowerCards = page.locator(
      extraTeacherIds.map((teacherId) => `[data-flower-guide-target="${teacherId}"]`).join(", ")
    );
    const extraFlowerCardCount = await extraFlowerCards.count();
    const extraFlowerImages = await extraFlowerCards.locator("img").evaluateAll((images) =>
      images.map((image) => image.getAttribute("src"))
    );

    await page.locator('[data-teacher="teacher_extra_01"]').scrollIntoViewIfNeeded();
    await page.locator('[data-teacher="teacher_extra_01"]').click();
    await page.locator("[data-teacher-name]").waitFor({ state: "visible" });
    const extraDetailName = await page.locator("[data-teacher-name]").textContent();
    const extraDetailFlower = await page.locator("[data-current-flower-image]").getAttribute("src");
    await page.locator(".back-to-list").click();

    await page.evaluate(() => {
      window.location.hash = "#admin";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    await page.locator('[data-panel="admin"]').click();
    await page.locator("[data-admin-passcode-input]").fill("運営端末で設定したパスコード");
    await page.locator("[data-admin-passcode-button]").click();
    const adminTeacherOptions = await page.locator("[data-admin-game-record-teacher] option").evaluateAll((options) =>
      options.map((option) => ({ value: option.value, label: option.textContent }))
    );

    const progress = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), progressKey);

    assert(teacherCardCount === 10, `先生一覧が10人ではありません: ${teacherCardCount}`);
    assert(extraTeacherNames.length === 5, `追加先生カードが5人ではありません: ${extraTeacherNames.length}`);
    assert(extraFlowerCardCount === 5, `花図鑑の追加先生枠が5つではありません: ${extraFlowerCardCount}`);
    assert(extraFlowerImages.some((src) => src.includes("suzuran-stamp-stage-05-list.png")), "すずらん画像が花図鑑にありません。");
    assert(extraFlowerImages.some((src) => src.includes("shirotsumekusa-stamp-stage-05-list.png")), "白詰草画像が花図鑑にありません。");
    assert(extraFlowerImages.some((src) => src.includes("yamabuki-stamp-stage-05-list.png")), "山吹画像が花図鑑にありません。");
    assert(extraFlowerImages.some((src) => src.includes("kingyosou-stamp-stage-05-list.png")), "金魚草画像が花図鑑にありません。");
    assert(extraFlowerImages.some((src) => src.includes("tsuyukusa-stamp-stage-05-list.png")), "露草画像が花図鑑にありません。");
    assert(extraDetailName.includes("追加先生A"), `追加先生Aの詳細に移動できていません: ${extraDetailName}`);
    assert(extraDetailFlower.includes("suzuran-stamp-stage-05-list.png"), `追加先生Aの詳細花がすずらんではありません: ${extraDetailFlower}`);
    for (const teacherId of extraTeacherIds) {
      assert(adminTeacherOptions.some((option) => option.value === teacherId), `運営押印対象に${teacherId}がありません。`);
    }
    assert(progress.stamps.teacherCircleRounds === 1, `先生の輪が基本5人のまま維持されていません: ${progress.stamps.teacherCircleRounds}`);

    console.log("ALL OK: extra teacher production flow");
    console.log(JSON.stringify({
      teacherCardCount,
      extraTeacherNames,
      extraFlowerCardCount,
      extraFlowerImages,
      extraDetailName,
      adminTeacherOptionCount: adminTeacherOptions.length,
      teacherCircleRounds: progress.stamps.teacherCircleRounds,
    }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

