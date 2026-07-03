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

const createCounts = ({ primary = 0, extra = 0 } = {}) => Object.fromEntries([
  ...primaryTeacherIds.map((teacherId) => [teacherId, primary]),
  ...extraTeacherIds.map((teacherId) => [teacherId, extra]),
]);

const saveProgress = async (page, teacherCounts, storedTeacherCircleRounds = 0) => {
  await page.evaluate(([key, counts, circleRounds]) => {
    localStorage.setItem(key, JSON.stringify({
      schemaVersion: 2,
      stamps: {
        participationCount: 0,
        lastParticipationStampDate: "",
        teacherLessonCounts: counts,
        teacherCircleRounds: circleRounds,
      },
      earned: { fairies: [], medals: [], titles: [], companions: [] },
      gameRecords: [],
      operationHistory: [],
    }));
  }, [progressKey, teacherCounts, storedTeacherCircleRounds]);
  await page.reload({ waitUntil: "load" });
  await page.locator("[data-circle-status]").waitFor({ state: "attached" });
};

const readCircleState = async (page) => page.evaluate(() => {
  const achievementRows = [...document.querySelectorAll("[data-profile-achievement-list] article")]
    .map((row) => row.textContent.replace(/\s+/g, " ").trim());

  return {
    circleStatus: document.querySelector("[data-circle-status]")?.textContent.trim() ?? "",
    roundSummary: document.querySelector("[data-round-summary]")?.textContent.trim() ?? "",
    roundRemaining: document.querySelector("[data-round-remaining]")?.textContent.trim() ?? "",
    achievementRows,
    teacherCircleRuleIds: window.stampRules.teacherCircle.teacherIds,
    extraTeacherCircleRuleIds: window.stampRules.extraTeacherCircle.teacherIds,
  };
});

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });

  try {
    await page.goto(appUrl, { waitUntil: "load" });

    const ruleState = await readCircleState(page);
    assert(
      JSON.stringify(ruleState.teacherCircleRuleIds) === JSON.stringify(primaryTeacherIds),
      `既存の先生の輪の対象が変わっています: ${JSON.stringify(ruleState.teacherCircleRuleIds)}`
    );
    assert(
      JSON.stringify(ruleState.extraTeacherCircleRuleIds) === JSON.stringify(extraTeacherIds),
      `新しい先生の輪の対象が変わっています: ${JSON.stringify(ruleState.extraTeacherCircleRuleIds)}`
    );

    await saveProgress(page, createCounts({ primary: 0, extra: 1 }), 999);
    const extraOnlyOne = await readCircleState(page);
    assert(extraOnlyOne.circleStatus === "0/5人 達成中", `追加先生だけで既存の輪が進んでいます: ${extraOnlyOne.circleStatus}`);
    assert(extraOnlyOne.roundSummary === "あと5人で一巡", `追加先生だけで案内が変わっています: ${extraOnlyOne.roundSummary}`);
    assert(
      extraOnlyOne.achievementRows.some((row) => row.includes("先生の輪") && row.includes("未達成")),
      `追加先生だけで達成一覧の先生の輪が未達成ではありません: ${JSON.stringify(extraOnlyOne.achievementRows)}`
    );

    await saveProgress(page, createCounts({ primary: 1, extra: 0 }), 0);
    const primaryOnlyOne = await readCircleState(page);
    assert(primaryOnlyOne.circleStatus === "5/5人 一巡達成", `既存5人で先生の輪が一巡になりません: ${primaryOnlyOne.circleStatus}`);
    assert(primaryOnlyOne.roundSummary === "先生の輪 一巡達成", `既存5人で案内が達成になりません: ${primaryOnlyOne.roundSummary}`);
    assert(
      primaryOnlyOne.achievementRows.some((row) => row.includes("先生の輪") && row.includes("1巡 達成済み")),
      `既存5人で達成一覧の先生の輪が1巡になりません: ${JSON.stringify(primaryOnlyOne.achievementRows)}`
    );

    await saveProgress(page, createCounts({ primary: 0, extra: 5 }), 999);
    const extraOnlyFive = await readCircleState(page);
    assert(extraOnlyFive.circleStatus === "0/5人 達成中", `追加先生5回ずつで既存の輪が進んでいます: ${extraOnlyFive.circleStatus}`);

    console.log("ALL OK: new teacher circle does not mix into primary teacher circle");
    console.log(JSON.stringify({ extraOnlyOne, primaryOnlyOne, extraOnlyFive }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
