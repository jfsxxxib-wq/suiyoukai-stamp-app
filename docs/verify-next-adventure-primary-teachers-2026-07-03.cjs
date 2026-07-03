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

const saveProgress = async (page, teacherCounts) => {
  await page.evaluate(([key, counts]) => {
    localStorage.setItem(key, JSON.stringify({
      schemaVersion: 2,
      stamps: {
        participationCount: 999,
        lastParticipationStampDate: "",
        teacherLessonCounts: counts,
        teacherCircleRounds: 0,
      },
      earned: { fairies: [], medals: [], titles: [], companions: [] },
      gameRecords: [],
      operationHistory: [],
    }));
  }, [progressKey, teacherCounts]);
  await page.reload({ waitUntil: "load" });
};

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });

  try {
    await page.goto(appUrl, { waitUntil: "load" });

    const ruleIds = await page.evaluate(() => ({
      teacherCircleIds: window.stampRules.teacherCircle.teacherIds,
      extraTeacherCircleIds: window.stampRules.extraTeacherCircle.teacherIds,
    }));
    assert(
      JSON.stringify(ruleIds.teacherCircleIds) === JSON.stringify(primaryTeacherIds),
      `先生の輪の対象が基本5人ではありません: ${JSON.stringify(ruleIds.teacherCircleIds)}`
    );
    assert(
      JSON.stringify(ruleIds.extraTeacherCircleIds) === JSON.stringify(extraTeacherIds),
      `新しい先生の輪の対象が追加先生A-Eではありません: ${JSON.stringify(ruleIds.extraTeacherCircleIds)}`
    );

    await saveProgress(page, Object.fromEntries([
      ...primaryTeacherIds.map((teacherId) => [teacherId, 1]),
      ...extraTeacherIds.map((teacherId) => [teacherId, 4]),
    ]));

    const primaryPhase = await page.locator("[data-next-adventure-button]").evaluate((button) => ({
      type: button.dataset.adventureType,
      teacherId: button.dataset.nextAdventureTeacher,
      title: button.querySelector("[data-next-adventure-title]")?.textContent ?? "",
    }));

    assert(primaryPhase.type === "teacher", `基本5人の途中で先生案内ではありません: ${primaryPhase.type}`);
    assert(primaryTeacherIds.includes(primaryPhase.teacherId), `基本5人の途中で追加先生が案内されています: ${primaryPhase.teacherId}`);

    await saveProgress(page, Object.fromEntries([
      ...primaryTeacherIds.map((teacherId) => [teacherId, 999]),
      ...extraTeacherIds.map((teacherId) => [teacherId, 0]),
    ]));

    const extraPhase = await page.locator("[data-next-adventure-button]").evaluate((button) => ({
      type: button.dataset.adventureType,
      teacherId: button.dataset.nextAdventureTeacher,
      title: button.querySelector("[data-next-adventure-title]")?.textContent ?? "",
    }));

    assert(extraPhase.type === "teacher", `基本5人の全巡完了後に先生案内ではありません: ${extraPhase.type}`);
    assert(extraTeacherIds.includes(extraPhase.teacherId), `基本5人の全巡完了後に追加先生へ進めません: ${extraPhase.teacherId}`);

    console.log("ALL OK: next adventure keeps primary teachers first");
    console.log(JSON.stringify({ ruleIds, primaryPhase, extraPhase }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
