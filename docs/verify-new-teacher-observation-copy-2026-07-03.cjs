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
const rewardWords = /勲章|称号|達成/;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const textOf = (document, selector) =>
  document.querySelector(selector)?.textContent.replace(/\s+/g, " ").trim() ?? "";

const saveProgress = async (page, teacherCounts, participationCount = 0) => {
  await page.evaluate(([key, counts, participation]) => {
    localStorage.setItem(key, JSON.stringify({
      schemaVersion: 2,
      stamps: {
        participationCount: participation,
        lastParticipationStampDate: "",
        teacherLessonCounts: counts,
        teacherCircleRounds: 0,
      },
      earned: { fairies: [], medals: [], titles: [], companions: [] },
      gameRecords: [],
      operationHistory: [],
    }));
  }, [progressKey, teacherCounts, participationCount]);
  await page.reload({ waitUntil: "load" });
};

const readObservationSurfaces = async (page) => page.evaluate(() => {
  const textOf = (selector) =>
    document.querySelector(selector)?.textContent.replace(/\s+/g, " ").trim() ?? "";
  const extraGroup = document.querySelector(".flower-guide-group-extra");
  const teacherGroup = document.querySelector(".teacher-list-group-extra");
  const nextButton = document.querySelector("[data-next-adventure-button]");
  const circleObservation = document.querySelector(".circle-stamp.is-observation");
  const profileRows = [...document.querySelectorAll("[data-profile-achievement-list] article")]
    .map((row) => row.textContent.replace(/\s+/g, " ").trim());
  const libraryRows = [...document.querySelectorAll("[data-library-achievement-list] article")]
    .map((row) => row.textContent.replace(/\s+/g, " ").trim());
  const extraTeacherLabels = [...document.querySelectorAll(".teacher-list-group-extra .teacher-card small")]
    .map((row) => row.textContent.replace(/\s+/g, " ").trim());

  return {
    fieldGuideExtra: extraGroup?.textContent.replace(/\s+/g, " ").trim() ?? "",
    teacherListExtra: teacherGroup?.textContent.replace(/\s+/g, " ").trim() ?? "",
    circleObservationText: circleObservation?.textContent.replace(/\s+/g, " ").trim() ?? "",
    circleObservationHasMedalIcon: Boolean(circleObservation?.querySelector(".circle-medal")),
    nextAdventure: nextButton?.textContent.replace(/\s+/g, " ").trim() ?? "",
    nextAdventureType: nextButton?.dataset.adventureType ?? "",
    nextAdventureTeacher: nextButton?.dataset.nextAdventureTeacher ?? "",
    nextAdventureCopy: textOf("[data-next-adventure-copy]"),
    profileTitle: textOf("[data-profile-title]"),
    profileMedal: textOf("[data-profile-medal]"),
    libraryTitle: textOf("[data-library-current-title]"),
    librarySummary: textOf("[data-library-summary]"),
    profileRows,
    libraryRows,
    extraTeacherLabels,
  };
});

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });

  try {
    await page.goto(appUrl, { waitUntil: "load" });

    const initialSurfaces = await readObservationSurfaces(page);
    assert(!rewardWords.test(initialSurfaces.fieldGuideExtra), `花図鑑の新しい先生の輪に報酬語が出ています: ${initialSurfaces.fieldGuideExtra}`);
    assert(!rewardWords.test(initialSurfaces.teacherListExtra), `先生一覧の新しい先生の輪に報酬語が出ています: ${initialSurfaces.teacherListExtra}`);
    assert(initialSurfaces.fieldGuideExtra.includes("観察期間"), `花図鑑に観察期間の表示がありません: ${initialSurfaces.fieldGuideExtra}`);
    assert(initialSurfaces.fieldGuideExtra.includes("基本5人の輪とは別"), `花図鑑に基本5人との分離表示がありません: ${initialSurfaces.fieldGuideExtra}`);
    assert(initialSurfaces.teacherListExtra.includes("観察期間"), `先生一覧に観察期間の表示がありません: ${initialSurfaces.teacherListExtra}`);
    assert(initialSurfaces.teacherListExtra.includes("基本5人の輪とは別"), `先生一覧に基本5人との分離表示がありません: ${initialSurfaces.teacherListExtra}`);
    assert(initialSurfaces.circleObservationText.includes("新しい先生の記録"), `観察枠の表示がありません: ${initialSurfaces.circleObservationText}`);
    assert(initialSurfaces.circleObservationText.includes("観察期間"), `観察枠に観察期間の表示がありません: ${initialSurfaces.circleObservationText}`);
    assert(!initialSurfaces.circleObservationHasMedalIcon, "観察枠が勲章アイコン扱いになっています");

    await saveProgress(page, Object.fromEntries([
      ...primaryTeacherIds.map((teacherId) => [teacherId, 999]),
      ...extraTeacherIds.map((teacherId) => [teacherId, 0]),
    ]), 999);
    const extraNextSurfaces = await readObservationSurfaces(page);
    assert(extraNextSurfaces.nextAdventureType === "teacher", `次の冒険が先生案内ではありません: ${extraNextSurfaces.nextAdventureType}`);
    assert(extraTeacherIds.includes(extraNextSurfaces.nextAdventureTeacher), `次の冒険が追加先生を案内していません: ${extraNextSurfaces.nextAdventureTeacher}`);
    assert(
      !rewardWords.test(extraNextSurfaces.nextAdventureCopy),
      `追加先生の次の冒険コピーに報酬語が出ています: ${extraNextSurfaces.nextAdventureCopy}`
    );
    assert(
      extraNextSurfaces.nextAdventureCopy.includes("出会いを記録"),
      `追加先生の次の冒険コピーが観察期間の表現ではありません: ${extraNextSurfaces.nextAdventureCopy}`
    );

    await saveProgress(page, Object.fromEntries([
      ...primaryTeacherIds.map((teacherId) => [teacherId, 0]),
      ...extraTeacherIds.map((teacherId) => [teacherId, 5]),
    ]));
    const extraOnlyRewardSurfaces = await readObservationSurfaces(page);
    assert(
      extraOnlyRewardSurfaces.extraTeacherLabels.every((label) => label.includes("観察期間")),
      `追加先生カードが観察期間表示ではありません: ${JSON.stringify(extraOnlyRewardSurfaces.extraTeacherLabels)}`
    );
    assert(
      extraOnlyRewardSurfaces.profileRows.some((row) => row.includes("先生の輪") && row.includes("未達成")),
      `冒険者カードの達成判定で既存の先生の輪が未達成ではありません: ${JSON.stringify(extraOnlyRewardSurfaces.profileRows)}`
    );
    assert(
      extraOnlyRewardSurfaces.profileRows.some((row) => row.includes("先生の輪") && row.includes("基本5人")),
      `冒険者カードの先生の輪に基本5人の表示がありません: ${JSON.stringify(extraOnlyRewardSurfaces.profileRows)}`
    );
    assert(
      extraOnlyRewardSurfaces.libraryRows.some((row) => row.includes("先生の輪") && row.includes("基本5人")),
      `書庫の先生の輪に基本5人の表示がありません: ${JSON.stringify(extraOnlyRewardSurfaces.libraryRows)}`
    );
    assert(
      !extraOnlyRewardSurfaces.librarySummary.includes("勲章 1"),
      `追加先生だけで書庫に勲章が増えています: ${extraOnlyRewardSurfaces.librarySummary}`
    );

    console.log("ALL OK: new teacher observation copy has no circle reward contradiction");
    console.log(JSON.stringify({ initialSurfaces, extraNextSurfaces, extraOnlyRewardSurfaces }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
