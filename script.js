(() => {
try {
const tabs = document.querySelectorAll(".info-tab");
const panels = document.querySelectorAll(".panel-view");
const dock = document.querySelector(".info-dock");
const infoPanel = document.querySelector(".info-panel");
const closeButton = document.querySelector(".close-panel");
const teacherCards = document.querySelectorAll(".teacher-card");
const teacherLayout = document.querySelector(".teacher-layout");
const teacherList = document.querySelector(".teacher-list");
const teacherDetail = document.querySelector(".teacher-detail");
const backToList = document.querySelector(".back-to-list");
const completeTeacherButton = document.querySelector(".complete-teacher");
const flowMessage = document.querySelector("[data-flow-message]");
const flowConfirmStep = document.querySelector("[data-flow-step='confirm']");
const flowDoneStep = document.querySelector("[data-flow-step='done']");
const confirmCard = document.querySelector("[data-confirm-card]");
const confirmLabel = document.querySelector("[data-confirm-label]");
const confirmTeacher = document.querySelector("[data-confirm-teacher]");
const confirmEffect = document.querySelector("[data-confirm-effect]");
const gameRecordForm = document.querySelector("[data-game-record-form]");
const gameRecordDate = document.querySelector("[data-game-record-date]");
const gameRecordHandicap = document.querySelector("[data-game-record-handicap]");
const gameRecordResult = document.querySelector("[data-game-record-result]");
const teacherGameRecordList = document.querySelector("[data-teacher-game-record-list]");
const inlineFairyAchievement = document.querySelector("[data-fairy-achievement]");
const fairyAchievement = document.querySelector("[data-achievement-modal]");
const achievementKicker = fairyAchievement.querySelector(".achievement-modal-kicker");
const achievementFairy = fairyAchievement.querySelector("[data-achievement-fairy]");
const achievementTitle = fairyAchievement.querySelector("[data-achievement-title]");
const achievementCopy = fairyAchievement.querySelector("[data-achievement-copy]");
const achievementTeacher = fairyAchievement.querySelector("[data-achievement-teacher]");
const achievementModalClose = fairyAchievement.querySelector(".achievement-modal-close");
const achievementCloseButtons = document.querySelectorAll("[data-achievement-close]");
const achievementProfileButton = document.querySelector("[data-achievement-profile]");
const cardStampCurrent = document.querySelector("[data-card-stamp-current]");
const cardStampGoal = document.querySelector("[data-card-stamp-goal]");
const teacherStampRule = document.querySelector("[data-teacher-stamp]")?.parentElement;
const profileTitle = document.querySelector("[data-profile-title]");
const profileRank = document.querySelector("[data-profile-rank]");
const profileMedal = document.querySelector("[data-profile-medal]");
const profileMedalIcon = document.querySelector("[data-profile-medal-icon]");
const totalStamps = document.querySelector("[data-total-stamps]");
const profileGuideProgress = document.querySelector("[data-profile-guide-progress]");
const profileGuideProgressTrack = document.querySelector("[data-profile-guide-progress-track]");
const circleBadge = document.querySelector("[data-circle-badge]");
const profileBadges = document.querySelector(".profile-badges");
const profileFairyList = document.querySelector("[data-profile-fairy-list]");
const profileFairies = document.querySelector("[data-profile-fairies]");
const profileSpecialCompanionList = document.querySelector("[data-profile-special-companion-list]");
const libraryOwl = document.querySelector("[data-library-owl]");
const libraryGuide = document.querySelector("[data-library-guide]");
const librarySpeech = document.querySelector("[data-library-speech]");
const libraryCurrentTitle = document.querySelector("[data-library-current-title]");
const librarySummary = document.querySelector("[data-library-summary]");
const libraryTitleCount = document.querySelector("[data-library-title-count]");
const libraryTitleList = document.querySelector("[data-library-title-list]");
const libraryMedalCount = document.querySelector("[data-library-medal-count]");
const libraryMedalList = document.querySelector("[data-library-medal-list]");
const libraryAchievementList = document.querySelector("[data-library-achievement-list]");
const participationFlower = document.querySelector(".participation-stamp .stamp-flower");
const participationFlowerName = document.querySelector("[data-participation-flower-name]");
const participationCount = document.querySelector("[data-participation-count]");
const participationStatus = document.querySelector("[data-participation-status]");
const participationStampButton = document.querySelector("[data-participation-stamp-button]");
const circleStamp = document.querySelector("[data-circle-stamp='first']");
const circleStatus = document.querySelector("[data-circle-status]");
const roundSummary = document.querySelector("[data-round-summary]");
const roundRemaining = document.querySelector("[data-round-remaining]");
const adminStampButton = document.querySelector(".admin-stamp-button");
const adminLockCard = document.querySelector("[data-admin-lock-card]");
const adminPasscodeInput = document.querySelector("[data-admin-passcode-input]");
const adminPasscodeButton = document.querySelector("[data-admin-passcode-button]");
const adminPasscodeMessage = document.querySelector("[data-admin-passcode-message]");
const adminCard = document.querySelector(".admin-card");
const adminSaveButton = document.querySelector("[data-admin-save-button]");
const adminDraftState = document.querySelector("[data-admin-draft-state]");
const adminAdjustmentList = document.querySelector("[data-admin-adjustment-list]");
const adminResetButton = document.querySelector("[data-admin-reset-button]");
const adminResetConfirm = document.querySelector("[data-admin-reset-confirm]");
const adminResetInput = document.querySelector("[data-admin-reset-input]");
const adminResetCancel = document.querySelector("[data-admin-reset-cancel]");
const adminResetConfirmButton = document.querySelector("[data-admin-reset-confirm-button]");
const adminState = document.querySelector("[data-admin-state]");
const adminSummary = document.querySelector("[data-admin-summary]");
const adminTeacher = document.querySelector("[data-admin-teacher]");
const adminParticipation = document.querySelector("[data-admin-participation]");
const adminNote = document.querySelector("[data-admin-note]");
const adminResult = document.querySelector("[data-admin-result]");

let activeTeacherKey = "tsuneishi";
let recordPhase = "ready";
let confirmSaveReadyAt = 0;
let adminDraft = null;
let isAdminDraftDirty = false;
let isAdminUnlocked = false;

const progressStorageKey = "suiyoukai-stamp-progress-v1";
const gameRecordsStorageKey = "suiyoukai-game-records-v1";
const adminPasscode = "suiyoukai2026";
const ruleTargets = window.teacherStampTargets ?? [];
const participationRule = window.stampRules?.participation ?? {};
const teacherLessonRule = window.stampRules?.teacherLesson ?? {};
const teacherCircleRule = window.stampRules?.teacherCircle ?? {};
const teacherTargetById = Object.fromEntries(ruleTargets.map((target) => [target.teacherId, target]));

const getTeacherTarget = (teacherKey) => teacherTargetById[teacherKey];
const getParticipationGoal = () => participationRule.maxCount ?? 10;
const getTeacherGoal = (teacher) => teacher.stampGoal ?? teacherLessonRule.maxCountPerTeacher ?? 5;
const getTeacherMaxCount = (teacher) => getTeacherGoal(teacher) * (teacher.flowerCycles?.length ?? 1);
const getParticipationMaxCount = () => getParticipationGoal() * participationFlowerCycles.length;
const getTeacherCircleRequiredCount = () =>
  teacherCircleRule.requiredTeachersPerRound ?? ruleTargets.length ?? Object.keys(teacherDetails).length;
const clampProgressCount = (count, maxCount) =>
  Math.min(Math.max(0, Number(count) || 0), maxCount);

const flowerCatalog = {
  cosmos: {
    flower: "cosmos",
    flowerName: "コスモス",
    flowerAsset: "cosmos-stamp-stage-05-v2.png",
    fairyId: "fairy_cosmos",
    fairyName: "コスモスの妖精",
    fairyAsset: "fairy-apollon-flower-style.png",
    flowerColor: "#d86a83",
    accentColor: "#f4c06a",
  },
  fuji: {
    flower: "fuji",
    flowerName: "藤",
    flowerAsset: "fuji-stamp-stage-05-list.png",
    fairyId: "fairy_fuji",
    fairyName: "藤の妖精",
    fairyAsset: "fairy-evolution-stage-01.png",
    flowerColor: "#8c78c8",
    accentColor: "#d8c9f5",
  },
  kinmokusei: {
    flower: "kinmokusei",
    flowerName: "金木犀",
    flowerAsset: "kinmokusei-stamp-stage-05-list.png",
    fairyId: "fairy_kinmokusei",
    fairyName: "金木犀の妖精",
    fairyAsset: "fairy-evolution-stage-02.png",
    flowerColor: "#e2a12f",
    accentColor: "#f7d46f",
  },
  lotus: {
    flower: "lotus",
    flowerName: "蓮",
    flowerAsset: "lotus-stamp-stage-05-list.png",
    fairyId: "fairy_lotus",
    fairyName: "蓮の妖精",
    fairyAsset: "fairy-evolution-stage-03.png",
    flowerColor: "#d77fa8",
    accentColor: "#f1cad7",
  },
  sumire: {
    flower: "sumire",
    flowerName: "菫",
    flowerAsset: "sumire-stamp-stage-05-list.png",
    fairyId: "fairy_sumire",
    fairyName: "菫の妖精",
    fairyAsset: "fairy-evolution-stage-04.png",
    flowerColor: "#6e62ad",
    accentColor: "#b9aadf",
  },
  botan: {
    flower: "botan",
    flowerName: "牡丹",
    flowerAsset: "botan-stamp-stage-05-list.png",
    fairyId: "fairy_botan",
    fairyName: "牡丹の妖精",
    fairyAsset: "fairy-evolution-stage-01.png",
    flowerColor: "#c84f76",
    accentColor: "#f0a1b6",
  },
  lily: {
    flower: "lily",
    flowerName: "百合",
    flowerAsset: "lily-stamp-stage-05-list.png",
    fairyId: "fairy_lily",
    fairyName: "百合の妖精",
    fairyAsset: "fairy-evolution-stage-02.png",
    flowerColor: "#f3e6bd",
    accentColor: "#c78a49",
  },
  asagao: {
    flower: "asagao",
    flowerName: "朝顔",
    flowerAsset: "asagao-stamp-stage-05-list.png",
    fairyId: "fairy_asagao",
    fairyName: "朝顔の妖精",
    fairyAsset: "fairy-evolution-stage-03.png",
    flowerColor: "#5f8bd5",
    accentColor: "#b6d2f3",
  },
  kikyo: {
    flower: "kikyo",
    flowerName: "桔梗",
    flowerAsset: "kikyo-stamp-stage-05-list.png",
    fairyId: "fairy_kikyo",
    fairyName: "桔梗の妖精",
    fairyAsset: "fairy-evolution-stage-04.png",
    flowerColor: "#5860b5",
    accentColor: "#9aa3df",
  },
  nadeshiko: {
    flower: "nadeshiko",
    flowerName: "撫子",
    flowerAsset: "nadeshiko-stamp-stage-05-list.png",
    fairyId: "fairy_nadeshiko",
    fairyName: "撫子の妖精",
    fairyAsset: "fairy-evolution-stage-01.png",
    flowerColor: "#e57d98",
    accentColor: "#f6c1d0",
  },
  suisen: {
    flower: "suisen",
    flowerName: "水仙",
    flowerAsset: "suisen-stamp-stage-05-list.png",
    fairyId: "fairy_suisen",
    fairyName: "水仙の妖精",
    fairyAsset: "fairy-evolution-stage-02.png",
    flowerColor: "#fff2b6",
    accentColor: "#e6b53e",
  },
  hagi: {
    flower: "hagi",
    flowerName: "萩",
    flowerAsset: "hagi-stamp-stage-05-list.png",
    fairyId: "fairy_hagi",
    fairyName: "萩の妖精",
    fairyAsset: "fairy-evolution-stage-03.png",
    flowerColor: "#b45f99",
    accentColor: "#dca8ce",
  },
  shakuyaku: {
    flower: "shakuyaku",
    flowerName: "芍薬",
    flowerAsset: "shakuyaku-stamp-stage-05-list.png",
    fairyId: "fairy_shakuyaku",
    fairyName: "芍薬の妖精",
    fairyAsset: "fairy-evolution-stage-04.png",
    flowerColor: "#d85f86",
    accentColor: "#f2b4ca",
  },
};

const createCycleFlower = (cycleNumber, flowerKey) => ({
  cycleNumber,
  cycleName: `${cycleNumber}巡目`,
  ...flowerCatalog[flowerKey],
});

const participationFlowerCycles = [
  createCycleFlower(1, "cosmos"),
  createCycleFlower(2, "fuji"),
  createCycleFlower(3, "kinmokusei"),
];

const teacherCycleFlowerAssignments = {
  tsuneishi: ["iris", "lotus", "sumire"],
  yuki: ["camellia", "botan", "lily"],
  koike: ["sunflower", "asagao", "kikyo"],
  yamashiro: ["hydrangea", "nadeshiko", "suisen"],
  matsumoto: ["sakura", "hagi", "shakuyaku"],
};

const getCycleProgress = (count, perCycleGoal, cycles) => {
  const maxCount = perCycleGoal * cycles.length;
  const currentCount = clampProgressCount(count, maxCount);

  if (currentCount >= maxCount) {
    return {
      cycleIndex: cycles.length - 1,
      cycleNumber: cycles.length,
      countInCycle: perCycleGoal,
      maxCount,
      cycle: cycles.at(-1),
    };
  }

  const cycleIndex = Math.floor(currentCount / perCycleGoal);

  return {
    cycleIndex,
    cycleNumber: cycleIndex + 1,
    countInCycle: currentCount % perCycleGoal,
    maxCount,
    cycle: cycles[cycleIndex],
  };
};

const getFlowerVisualBackground = (flower = {}) => {
  const main = flower.flowerColor ?? "#d86a83";
  const accent = flower.accentColor ?? "#f4c06a";

  return `
    radial-gradient(circle at 50% 52%, rgba(255, 250, 240, 0.94) 0 11%, transparent 12%),
    radial-gradient(circle at 32% 42%, ${main} 0 22%, transparent 23%),
    radial-gradient(circle at 68% 42%, ${main} 0 22%, transparent 23%),
    radial-gradient(circle at 50% 24%, ${accent} 0 22%, transparent 23%),
    radial-gradient(circle at 43% 72%, ${main} 0 19%, transparent 20%),
    radial-gradient(circle at 58% 72%, ${accent} 0 19%, transparent 20%),
    rgba(255, 250, 240, 0.82)
  `;
};

const applyFlowerVisual = (element, flower = {}) => {
  if (!element) {
    return;
  }

  if (flower.flowerAsset) {
    element.style.background = "";
    element.style.backgroundImage = `url("assets/${flower.flowerAsset}")`;
  } else {
    element.style.backgroundImage = "";
    element.style.background = getFlowerVisualBackground(flower);
  }
};

const applyFlowerVariables = (element, flower = {}) => {
  if (!element) {
    return;
  }

  element.style.setProperty("--flower-main", flower.flowerColor ?? "#d86a83");
  element.style.setProperty("--flower-accent", flower.accentColor ?? "#f4c06a");
};

const fairyAssets = {
  cosmos: {
    src: "assets/fairy-apollon-flower-style.png",
    label: "コスモスの妖精スタンプ達成",
  },
  camellia: {
    src: "assets/fairy-companion-camellia-v2.png",
    label: "椿の妖精スタンプ達成",
  },
  sunflower: {
    src: "assets/fairy-companion-sunflower-v2.png",
    label: "ひまわりの妖精スタンプ達成",
  },
  hydrangea: {
    src: "assets/fairy-companion-hydrangea-v2.png",
    label: "紫陽花の妖精スタンプ達成",
  },
  sakura: {
    src: "assets/fairy-companion-sakura-v2.png",
    label: "桜の妖精スタンプ達成",
  },
};

fairyAssets.iris = {
  src: "assets/fairy-companion-iris-v2.png",
  label: "菖蒲の妖精達成",
};

fairyAssets.dahlia = {
  src: "assets/fairy-companion-dahlia-v2.png",
  label: "ダリアの妖精達成",
};

fairyAssets.ume = {
  src: "assets/fairy-evolution-stage-03.png",
  label: "梅の妖精達成",
};

const teacherDetails = {
  tsuneishi: {
    name: "常石 隆志 六段",
    guide: "花を育てる案内人",
    stampCount: 3,
    fairy: false,
    photo: "akari",
    flower: "iris",
    initial: "常",
    completedFirstRound: true,
    style: "読みの筋道をやさしく整える",
    lesson: "一手の意味をたどりながら、花を育てるように進む指導",
    note: "落ち着いて考えたい冒険者へ",
  },
  yuki: {
    name: "結城 聡 九段",
    guide: "読みをほどく案内人",
    stampCount: 1,
    fairy: false,
    photo: "yuki",
    flower: "camellia",
    initial: "結",
    completedFirstRound: true,
    style: "複雑な局面をほどき、筋道を見つける",
    lesson: "読みの迷路を一緒に整理しながら、次の一手へ進む指導",
    note: "落ち着いて読みを積み重ねたい冒険者へ",
  },
  koike: {
    name: "小池 芳弘 七段",
    guide: "一手を照らす案内人",
    stampCount: 4,
    fairy: false,
    photo: "koike",
    flower: "sunflower",
    initial: "小",
    completedFirstRound: true,
    style: "局面の急所を明るく照らす",
    lesson: "形の意味を確かめながら、迷いやすい一手を見つける指導",
    note: "一手ずつ納得して進みたい冒険者へ",
  },
  yamashiro: {
    name: "山城 宏 九段",
    guide: "読みを導く庭師",
    stampCount: 2,
    fairy: false,
    photo: "yamashiro",
    flower: "hydrangea",
    initial: "山",
    completedFirstRound: true,
    style: "局面を広く見て、道筋を静かに示す",
    lesson: "読みの枝分かれを整理しながら、次の一手を見つける指導",
    note: "じっくり読みを深めたい冒険者へ",
  },
  matsumoto: {
    name: "松本 武久 八段",
    guide: "一局の流れを見る案内人",
    stampCount: 0,
    fairy: false,
    photo: "matsumoto",
    flower: "sakura",
    initial: "松",
    completedFirstRound: false,
    style: "一局の流れを見ながら、次の芽を見つける",
    lesson: "序盤から中盤のつながりをたどり、形が育つ手を探す指導",
    note: "全体の流れをつかみたい冒険者へ",
  },
};

for (const [teacherKey, teacher] of Object.entries(teacherDetails)) {
  const target = getTeacherTarget(teacherKey);

  if (!target) {
    continue;
  }

  teacher.name = target.teacherName;
  teacher.flower = target.flower;
  teacher.flowerName = target.flowerName;
  teacher.flowerAsset = target.flowerAsset;
  teacher.fairyId = target.fairyId;
  teacher.fairyAsset = target.fairyAsset;
  teacher.stampGoal = target.stampGoal ?? teacherLessonRule.maxCountPerTeacher;
  teacher.flowerCycles = (teacherCycleFlowerAssignments[teacherKey] ?? [teacher.flower]).map((flowerKey, index) => {
    if (index === 0) {
      return {
        cycleNumber: 1,
        cycleName: "1巡目",
        flower: teacher.flower,
        flowerName: teacher.flowerName,
        flowerAsset: teacher.flowerAsset,
        fairyId: teacher.fairyId,
        fairyName: target.fairyName,
        fairyAsset: teacher.fairyAsset,
      };
    }

    return createCycleFlower(index + 1, flowerKey);
  });
}

const cloneProgressTemplate = () => JSON.parse(JSON.stringify(window.userProgressTemplate ?? {
  schemaVersion: 2,
  stamps: {
    participationCount: 0,
    teacherLessonCounts: {},
    teacherCircleRounds: 0,
  },
  earned: {
    fairies: [],
    medals: [],
    titles: [],
  },
}));

const normalizeProgressCount = (count) => Math.max(0, Number(count) || 0);

const getStoredParticipationCount = (progress = {}) =>
  progress.stamps?.participationCount ?? progress.participationCount ?? 0;

const getStoredTeacherLessonCounts = (progress = {}) =>
  progress.stamps?.teacherLessonCounts ?? progress.teacherLessonCounts ?? {};

const getStoredEarnedFairies = (progress = {}) =>
  progress.earned?.fairies ?? progress.earnedFairies ?? [];

const getStoredEarnedMedals = (progress = {}) =>
  progress.earned?.medals ?? progress.earnedMedals ?? [];

const getStoredEarnedTitles = (progress = {}) =>
  progress.earned?.titles ?? progress.earnedTitles ?? [];

const getTeacherCircleRoundsFromCounts = (teacherLessonCounts = {}) => {
  const teacherIds = ruleTargets.length > 0
    ? ruleTargets.map((target) => target.teacherId)
    : Object.keys(teacherDetails);

  if (teacherIds.length === 0) {
    return 0;
  }

  return Math.min(...teacherIds.map((teacherId) => normalizeProgressCount(teacherLessonCounts[teacherId])));
};

const createInitialProgressFromTeacherDetails = () => {
  const progress = cloneProgressTemplate();

  progress.stamps.teacherLessonCounts = {
    ...progress.stamps.teacherLessonCounts,
    ...Object.fromEntries(
      Object.entries(teacherDetails).map(([teacherId, teacher]) => [teacherId, normalizeProgressCount(teacher.stampCount)])
    ),
  };
  progress.stamps.teacherCircleRounds = getTeacherCircleRoundsFromCounts(progress.stamps.teacherLessonCounts);

  return progress;
};

const sanitizeProgress = (progress = {}) => {
  const template = createInitialProgressFromTeacherDetails();
  const teacherLessonCounts = { ...template.stamps.teacherLessonCounts };
  const storedTeacherLessonCounts = getStoredTeacherLessonCounts(progress);

  for (const teacherId of Object.keys(teacherLessonCounts)) {
    const teacher = teacherDetails[teacherId];
    teacherLessonCounts[teacherId] = clampProgressCount(
      storedTeacherLessonCounts[teacherId] ?? teacherLessonCounts[teacherId],
      getTeacherMaxCount(teacher)
    );
  }

  return {
    schemaVersion: template.schemaVersion,
    stamps: {
      participationCount: clampProgressCount(
        getStoredParticipationCount(progress) ?? template.stamps.participationCount,
        getParticipationMaxCount()
      ),
      teacherLessonCounts,
      teacherCircleRounds: getTeacherCircleRoundsFromCounts(teacherLessonCounts),
    },
    earned: {
      fairies: Array.isArray(getStoredEarnedFairies(progress)) ? getStoredEarnedFairies(progress) : template.earned.fairies,
      medals: Array.isArray(getStoredEarnedMedals(progress)) ? getStoredEarnedMedals(progress) : template.earned.medals,
      titles: Array.isArray(getStoredEarnedTitles(progress)) ? getStoredEarnedTitles(progress) : template.earned.titles,
    },
  };
};

const createResetProgress = () => {
  const template = cloneProgressTemplate();
  const teacherLessonCounts = Object.fromEntries(
    Object.keys(template.stamps.teacherLessonCounts).map((teacherId) => [teacherId, 0])
  );

  return {
    schemaVersion: template.schemaVersion,
    stamps: {
      participationCount: 0,
      teacherLessonCounts,
      teacherCircleRounds: 0,
    },
    earned: {
      fairies: [],
      medals: [],
      titles: [],
    },
  };
};

const loadUserProgress = () => {
  try {
    const storedProgress = localStorage.getItem(progressStorageKey);

    if (!storedProgress) {
      return sanitizeProgress();
    }

    return sanitizeProgress(JSON.parse(storedProgress));
  } catch {
    return sanitizeProgress();
  }
};

let userProgress = loadUserProgress();

const sanitizeGameRecord = (record = {}) => {
  const teacherId = typeof record.teacherId === "string" ? record.teacherId : "";
  const date = typeof record.date === "string" ? record.date : "";

  if (!teacherDetails[teacherId] || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  return {
    id: typeof record.id === "string" ? record.id : `game-${teacherId}-${date}`,
    teacherId,
    date,
    handicap: typeof record.handicap === "string" && record.handicap ? record.handicap : "互先",
    result: typeof record.result === "string" && record.result ? record.result : "記録なし",
    recordedAt: typeof record.recordedAt === "string" ? record.recordedAt : "",
  };
};

const loadGameRecords = () => {
  try {
    const storedRecords = JSON.parse(localStorage.getItem(gameRecordsStorageKey) ?? "[]");
    return Array.isArray(storedRecords) ? storedRecords.map(sanitizeGameRecord).filter(Boolean) : [];
  } catch {
    return [];
  }
};

let gameRecords = loadGameRecords();

const saveGameRecords = () => {
  try {
    localStorage.setItem(gameRecordsStorageKey, JSON.stringify(gameRecords));
  } catch {
    // 対局記録は保存できない環境でも、この画面を開いている間は保持します。
  }
};

const getTodayForInput = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const getGameRecordDraft = () => ({
  date: gameRecordDate?.value || getTodayForInput(),
  handicap: gameRecordHandicap?.value || "互先",
  result: gameRecordResult?.value || "記録なし",
});

const updateGameRecordConfirmation = () => {
  if (!confirmEffect || recordPhase !== "confirm") {
    return;
  }

  const draft = getGameRecordDraft();
  confirmEffect.textContent = `${draft.date}・${draft.handicap}・${draft.result}`;
};

const addGameRecord = (teacherId) => {
  const draft = getGameRecordDraft();
  const record = {
    id: `game-${Date.now()}-${teacherId}`,
    teacherId,
    date: draft.date,
    handicap: draft.handicap,
    result: draft.result,
    recordedAt: new Date().toISOString(),
  };

  gameRecords.push(record);
  saveGameRecords();
  return record;
};

const renderTeacherGameRecords = (teacherId) => {
  if (!teacherGameRecordList) {
    return;
  }

  const records = gameRecords
    .filter((record) => record.teacherId === teacherId)
    .sort((a, b) => `${b.date}${b.recordedAt}`.localeCompare(`${a.date}${a.recordedAt}`));

  teacherGameRecordList.textContent = "";
  if (records.length === 0) {
    const empty = document.createElement("p");
    empty.className = "game-record-empty";
    empty.textContent = "まだ対局記録はありません";
    teacherGameRecordList.append(empty);
    return;
  }

  for (const record of records) {
    const item = document.createElement("article");
    item.className = "teacher-game-record-item";
    const date = document.createElement("time");
    const details = document.createElement("span");
    date.dateTime = record.date;
    date.textContent = record.date.replaceAll("-", "/");
    details.textContent = `${record.handicap}・${record.result}`;
    item.append(date, details);
    teacherGameRecordList.append(item);
  }
};

const syncTeacherDetailsFromProgress = () => {
  for (const [teacherId, teacher] of Object.entries(teacherDetails)) {
    const stampCount = clampProgressCount(userProgress.stamps.teacherLessonCounts[teacherId], getTeacherMaxCount(teacher));

    teacher.stampCount = stampCount;
    teacher.completedFirstRound = stampCount > 0;
    teacher.fairy = stampCount >= getTeacherGoal(teacher);
  }
};

const syncProgressRewards = () => {
  const achievementResult = window.achievementEvaluators.evaluateAllAchievements(userProgress);

  userProgress.earned.fairies = achievementResult.earnedFairies;
  userProgress.earned.medals = achievementResult.earnedMedals;
  userProgress.earned.titles = achievementResult.earnedTitles;
};

const saveUserProgress = () => {
  try {
    localStorage.setItem(progressStorageKey, JSON.stringify(userProgress));
  } catch {
    // The app can still be used as an in-memory stamp card when storage is unavailable.
  }
};

const updateProgressFromTeacherDetails = () => {
  userProgress.stamps.teacherLessonCounts = {
    ...userProgress.stamps.teacherLessonCounts,
    ...Object.fromEntries(
      Object.entries(teacherDetails).map(([teacherId, teacher]) => [teacherId, normalizeProgressCount(teacher.stampCount)])
    ),
  };
  userProgress.stamps.teacherCircleRounds = getTeacherCircleRoundsFromCounts(userProgress.stamps.teacherLessonCounts);
  syncProgressRewards();
  saveUserProgress();
};

const createAdminDraftFromProgress = () => ({
  participationCount: clampProgressCount(userProgress.stamps.participationCount, getParticipationMaxCount()),
  teacherLessonCounts: Object.fromEntries(
    Object.entries(teacherDetails).map(([teacherId, teacher]) => [
      teacherId,
      clampProgressCount(userProgress.stamps.teacherLessonCounts[teacherId], getTeacherMaxCount(teacher)),
    ])
  ),
});

const syncAdminDraftFromProgress = () => {
  adminDraft = createAdminDraftFromProgress();
  isAdminDraftDirty = false;
};

const getAdminDraftTeacherCircleRounds = () =>
  getTeacherCircleRoundsFromCounts(adminDraft?.teacherLessonCounts ?? {});

const isAdminDraftDifferentFromProgress = () => {
  if (!adminDraft) {
    return false;
  }

  if (adminDraft.participationCount !== clampProgressCount(userProgress.stamps.participationCount, getParticipationMaxCount())) {
    return true;
  }

  return Object.entries(teacherDetails).some(([teacherId, teacher]) => {
    const savedCount = clampProgressCount(userProgress.stamps.teacherLessonCounts[teacherId], getTeacherMaxCount(teacher));
    const draftCount = clampProgressCount(adminDraft.teacherLessonCounts[teacherId], getTeacherMaxCount(teacher));

    return savedCount !== draftCount;
  });
};

const setAdminDraftDirty = (isDirty = true) => {
  isAdminDraftDirty = isDirty;

  if (adminDraftState) {
    adminDraftState.textContent = isDirty ? "未保存" : "保存済み";
  }

  if (adminSaveButton) {
    adminSaveButton.disabled = !isDirty;
  }
};

const updateAdminLockState = () => {
  if (!adminLockCard || !adminCard) {
    return;
  }

  adminLockCard.hidden = isAdminUnlocked;
  adminCard.hidden = !isAdminUnlocked;

  if (!isAdminUnlocked && adminPasscodeInput) {
    adminPasscodeInput.value = "";
  }
};

const lockAdminPanel = () => {
  isAdminUnlocked = false;
  adminPasscodeMessage.textContent = "運営用の調整画面はロックされています。";
  updateAdminLockState();
};

const unlockAdminPanel = () => {
  if (adminPasscodeInput.value !== adminPasscode) {
    adminPasscodeMessage.textContent = "パスコードが違います。";
    adminPasscodeInput.select();
    return;
  }

  isAdminUnlocked = true;
  adminPasscodeMessage.textContent = "解除しました。";
  updateAdminLockState();
  updateAdminPanel();
};

const setAdminDraftCount = (type, id, nextCount) => {
  if (!adminDraft) {
    syncAdminDraftFromProgress();
  }

  if (type === "participation") {
    adminDraft.participationCount = clampProgressCount(nextCount, getParticipationMaxCount());
  } else {
    const teacher = teacherDetails[id];
    adminDraft.teacherLessonCounts[id] = clampProgressCount(nextCount, getTeacherMaxCount(teacher));
  }

  setAdminDraftDirty(isAdminDraftDifferentFromProgress());
  renderAdminAdjustments();
};

const addParticipationStamp = () => {
  userProgress.stamps.participationCount = clampProgressCount(
    normalizeProgressCount(userProgress.stamps.participationCount) + 1,
    getParticipationMaxCount()
  );
  syncProgressRewards();
  saveUserProgress();
};

const applyAdminDraftToProgress = () => {
  if (!adminDraft) {
    return;
  }

  userProgress.stamps.participationCount = clampProgressCount(adminDraft.participationCount, getParticipationMaxCount());
  userProgress.stamps.teacherLessonCounts = Object.fromEntries(
    Object.entries(teacherDetails).map(([teacherId, teacher]) => [
      teacherId,
      clampProgressCount(adminDraft.teacherLessonCounts[teacherId], getTeacherMaxCount(teacher)),
    ])
  );
  userProgress.stamps.teacherCircleRounds = getTeacherCircleRoundsFromCounts(userProgress.stamps.teacherLessonCounts);
  syncTeacherDetailsFromProgress();
  syncProgressRewards();
  saveUserProgress();
  syncAdminDraftFromProgress();
};

const resetUserProgress = () => {
  userProgress = sanitizeProgress(createResetProgress());
  syncTeacherDetailsFromProgress();
  syncProgressRewards();
  saveUserProgress();
};

syncTeacherDetailsFromProgress();
syncProgressRewards();
saveUserProgress();
syncAdminDraftFromProgress();

const showPanel = (target) => {
  if (target !== "admin" && isAdminUnlocked) {
    lockAdminPanel();
  }

  dock.classList.remove("is-collapsed");
  infoPanel.hidden = false;

  for (const item of tabs) {
    const isSelected = item.dataset.panel === target;
    item.classList.toggle("is-active", isSelected);
    item.setAttribute("aria-pressed", String(isSelected));
  }

  for (const panel of panels) {
    const isVisible = panel.dataset.view === target;
    panel.classList.toggle("is-active", isVisible);
    panel.hidden = !isVisible;
  }

  if (target !== "field-guide") {
    dock.classList.remove("is-detail-open");
  }
};

const getCompletedFirstRoundCount = () =>
  Object.values(teacherDetails).filter((teacher) => teacher.completedFirstRound).length;

const hasFirstRoundMedal = () => getCompletedFirstRoundCount() >= getTeacherCircleRequiredCount();

const getTeacherStampText = (teacher) => {
  const goal = getTeacherGoal(teacher);
  const cycleProgress = getCycleProgress(teacher.stampCount, goal, teacher.flowerCycles);
  const flowerName = cycleProgress.cycle.flowerName ?? "花";

  if (teacher.stampCount < goal) {
    return `妖精まで ${cycleProgress.countInCycle}/${goal}`;
  }

  if (teacher.stampCount >= cycleProgress.maxCount) {
    return `${flowerName} ${goal}/${goal}`;
  }

  return `${cycleProgress.cycleNumber}巡目 ${flowerName} ${cycleProgress.countInCycle}/${goal}`;
};

const updateTeacherStampRuleNote = (teacher) => {
  if (!teacherStampRule) {
    return;
  }

  const stampText = teacherStampRule.querySelector("[data-teacher-stamp]");
  const note = document.createElement("span");
  note.dataset.teacherStampRule = "";
  note.textContent = `1巡目の${teacher.flowerName ?? "花"}は${getTeacherGoal(teacher)}回で妖精達成。2巡目以降は花が変わります。`;

  teacherStampRule.textContent = "";
  teacherStampRule.append(stampText);
  teacherStampRule.append(document.createElement("br"));
  teacherStampRule.append(note);
};

const getFairyDisplayData = (fairyData = {}, teacher = null) => {
  const flower = fairyData.flower ?? teacher?.flower ?? "cosmos";
  const flowerName = fairyData.flowerName ?? teacher?.flowerName ?? "花";
  const fairyAsset = fairyData.fairyAsset ?? teacher?.fairyAsset;
  const fallbackFairy = fairyAssets[flower] ?? fairyAssets.cosmos;
  const src = fairyAsset ? `assets/${fairyAsset}` : fallbackFairy.src;
  const label = fairyData.name ?? fairyData.fairyName ?? fallbackFairy.label ?? `${flowerName}の妖精達成`;

  return { src, label, flower, flowerName };
};

const getCompletedTeacherCycleProgress = (teacher) => {
  const goal = getTeacherGoal(teacher);
  const maxCount = getTeacherMaxCount(teacher);
  const currentCount = clampProgressCount(teacher.stampCount, maxCount);
  const completedCycleIndex = currentCount > 0 && currentCount % goal === 0
    ? Math.min(Math.floor(currentCount / goal) - 1, teacher.flowerCycles.length - 1)
    : getCycleProgress(currentCount, goal, teacher.flowerCycles).cycleIndex;
  const cycle = teacher.flowerCycles[completedCycleIndex];

  return {
    cycleIndex: completedCycleIndex,
    cycleNumber: completedCycleIndex + 1,
    cycleName: cycle.cycleName ?? `${completedCycleIndex + 1}巡目`,
    requiredCount: goal * (completedCycleIndex + 1),
    countInCycle: currentCount % goal === 0 ? goal : currentCount % goal,
    cycle,
  };
};

const getAchievementFairy = (teacher, cycleProgress = getCompletedTeacherCycleProgress(teacher)) =>
  getFairyDisplayData({
    name: cycleProgress.cycle.fairyName ?? `${cycleProgress.cycle.flowerName ?? "花"}の妖精達成`,
    flower: cycleProgress.cycle.flower,
    flowerName: cycleProgress.cycle.flowerName,
    fairyAsset: cycleProgress.cycle.fairyAsset,
  }, teacher);

const getCurrentTeacherCycleProgress = (teacher) =>
  getCycleProgress(teacher.stampCount, getTeacherGoal(teacher), teacher.flowerCycles);

const getTotalTeacherStampCount = () =>
  Object.values(teacherDetails).reduce((total, teacher) => total + teacher.stampCount, 0);

const getTotalStampCount = () => userProgress.stamps.participationCount + getTotalTeacherStampCount();

const getEarnedFairyTeachers = () =>
  Object.values(teacherDetails).filter((teacher) => teacher.fairy || teacher.stampCount >= getTeacherGoal(teacher));

const getCurrentProgressForEvaluation = () => userProgress;

const getCurrentAchievementResult = () =>
  window.achievementEvaluators.evaluateAllAchievements(getCurrentProgressForEvaluation());

const updateParticipationStampCard = () => {
  if (!participationCount || !participationStatus || !participationStampButton) {
    return;
  }

  const currentCount = normalizeProgressCount(userProgress.stamps.participationCount);
  const goal = getParticipationGoal();
  const cycleProgress = getCycleProgress(currentCount, goal, participationFlowerCycles);
  const isFirstAchievementAchieved = currentCount >= goal;

  if (participationFlowerName) {
    participationFlowerName.textContent = cycleProgress.cycle.flowerName;
  }

  applyFlowerVisual(participationFlower, cycleProgress.cycle);

  participationCount.textContent = `${cycleProgress.countInCycle}/${goal}回`;
  participationStatus.textContent = isFirstAchievementAchieved
    ? `${cycleProgress.cycleNumber}巡目 ${cycleProgress.cycle.flowerName}`
    : `あと${Math.max(0, goal - cycleProgress.countInCycle)}回`;
  participationStampButton.textContent = currentCount >= cycleProgress.maxCount ? "参加スタンプ達成済み" : "参加スタンプを押す";
  participationStampButton.disabled = currentCount >= cycleProgress.maxCount;
};

const renderProfileFairies = () => {
  if (!profileFairyList) {
    return;
  }

  const earnedFairies = getEarnedFairyTeachers();
  profileFairyList.textContent = "";

  if (earnedFairies.length === 0) {
    const empty = document.createElement("span");
    empty.className = "profile-empty";
    empty.textContent = "まだ妖精達成はありません";
    profileFairyList.append(empty);
    return;
  }

  for (const teacher of earnedFairies) {
    const fairy = getAchievementFairy(teacher);
    const item = document.createElement("article");
    item.className = "profile-fairy-item";

    const image = document.createElement("img");
    image.src = fairy.src;
    image.alt = fairy.label;

    const copy = document.createElement("div");
    const name = document.createElement("strong");
    const status = document.createElement("span");

    name.textContent = fairy.label;
    status.textContent = `${teacher.name} ${getTeacherGoal(teacher)}/${getTeacherGoal(teacher)}`;

    copy.append(name, status);
    item.append(image, copy);
    profileFairyList.append(item);
  }
};

const renderProfileFairiesFromResult = (achievementResult) => {
  if (!profileFairyList) {
    return;
  }

  profileFairyList.textContent = "";

  if (achievementResult.earnedFairies.length === 0) {
    const empty = document.createElement("span");
    empty.className = "profile-empty";
    empty.textContent = "まだ妖精達成はありません";
    profileFairyList.append(empty);
    return;
  }

  for (const earnedFairy of achievementResult.earnedFairies) {
    const teacher = earnedFairy.teacherId ? teacherDetails[earnedFairy.teacherId] : null;
    const fairy = getFairyDisplayData(earnedFairy, teacher);
    const item = document.createElement("article");
    item.className = "profile-fairy-item";

    const image = document.createElement("img");
    image.src = fairy.src;
    image.alt = earnedFairy.name;

    const copy = document.createElement("div");
    const name = document.createElement("strong");
    const status = document.createElement("span");

    name.textContent = earnedFairy.name;
    status.textContent = `${earnedFairy.teacherName} ${earnedFairy.cycleName ?? ""} 達成済み`;

    copy.append(name, status);
    item.append(image, copy);
    profileFairyList.append(item);
  }
};

const renderProfileSpecialCompanions = (achievementResult) => {
  if (!profileSpecialCompanionList) {
    return;
  }

  const earnedCompanions = achievementResult.earnedCompanions ?? [];
  profileSpecialCompanionList.textContent = "";

  if (earnedCompanions.length === 0) {
    const empty = document.createElement("span");
    empty.className = "profile-empty";
    empty.textContent = "まだ特別な仲間はいません";
    profileSpecialCompanionList.append(empty);
    return;
  }

  for (const companion of earnedCompanions) {
    const item = document.createElement("article");
    item.className = "profile-special-companion-item";

    const image = document.createElement("img");
    image.src = `assets/${companion.asset}`;
    image.alt = companion.name;

    const copy = document.createElement("div");
    const name = document.createElement("strong");
    const character = document.createElement("span");
    const status = document.createElement("small");

    name.textContent = companion.name;
    character.textContent = companion.character;
    status.textContent = companion.description;

    copy.append(name, character, status);
    item.append(image, copy);
    profileSpecialCompanionList.append(item);
  }
};

const renderLibraryCollection = (list, items, emptyMessage, kind) => {
  if (!list) {
    return;
  }

  list.textContent = "";
  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "library-empty";
    empty.textContent = emptyMessage;
    list.append(empty);
    return;
  }

  for (const item of items) {
    const entry = document.createElement("article");
    entry.className = `library-collection-item is-${kind}`;
    const mark = document.createElement("span");
    const copy = document.createElement("div");
    const name = document.createElement("strong");
    const status = document.createElement("small");
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = kind === "medal" ? "勲" : "称";
    name.textContent = item.name;
    status.textContent = kind === "medal" ? "勲章棚に収蔵" : "称号の書架に収蔵";
    copy.append(name, status);
    entry.append(mark, copy);
    list.append(entry);
  }
};

const renderOwlLibrary = (achievementResult) => {
  if (!libraryCurrentTitle) {
    return;
  }

  const titles = achievementResult.earnedTitles ?? [];
  const medals = achievementResult.earnedMedals ?? [];
  const companions = achievementResult.earnedCompanions ?? [];
  const latestTitle = titles.at(-1);
  const hasWiseOwl = companions.some((companion) => companion.id === "special_companion_owl_b");
  const teacherFairyCount = achievementResult.teacherFairy.earnedFairies.length;
  const participationCount = achievementResult.participation.achievedCycles?.length ?? 0;
  const totalFlowerAchievements = teacherFairyCount + participationCount;
  const totalStampCount = getTotalStampCount();

  libraryCurrentTitle.textContent = latestTitle?.name ?? "まだ称号はありません";
  librarySummary.textContent = `称号 ${titles.length}冊・勲章 ${medals.length}点`;
  libraryTitleCount.textContent = `${titles.length}冊`;
  libraryMedalCount.textContent = `${medals.length}点`;

  libraryOwl.src = hasWiseOwl
    ? "assets/special-companion-owl-b.png"
    : "assets/special-companion-owl-a.png";
  libraryOwl.alt = hasWiseOwl ? "達成を知る賢者" : "知恵の見守り役";
  libraryGuide.textContent = hasWiseOwl
    ? "達成を知る賢者が、積み重ねた旅の証を見守っています。"
    : "知恵の見守り役が、旅の記録を大切に収めています。";

  librarySpeech.textContent = totalFlowerAchievements >= 18
    ? "「立派な冒険記録になりました。」"
    : achievementResult.teacherCircle.currentRounds >= 1
      ? "「よく学び、よく歩みましたね。」"
      : medals.length >= 3
        ? "「旅の証を大切に収めました。」"
        : totalFlowerAchievements >= 2
          ? "「花の記録が集まっています。」"
          : titles.length >= 1
            ? "「新しい書が加わりました。」"
            : totalStampCount >= 1
              ? "「旅の最初の一頁ですね。」"
              : "「ようこそ書庫へ。」";

  renderLibraryCollection(libraryTitleList, titles, "まだ収められた称号はありません", "title");
  renderLibraryCollection(libraryMedalList, medals, "まだ収められた勲章はありません", "medal");

  libraryAchievementList.textContent = "";
  for (const record of [
    { label: "花と妖精", value: `${totalFlowerAchievements}/18` },
    { label: "先生の輪", value: `${achievementResult.teacherCircle.currentRounds}巡` },
    { label: "特別な仲間", value: `${companions.length}/4` },
    { label: "対局記録", value: `${gameRecords.length}局` },
  ]) {
    const row = document.createElement("article");
    const label = document.createElement("span");
    const value = document.createElement("strong");
    label.textContent = record.label;
    value.textContent = record.value;
    row.append(label, value);
    libraryAchievementList.append(row);
  }
};

const renderProfileRewardBadges = (achievementResult) => {
  if (!profileBadges) {
    return;
  }

  profileBadges.textContent = "";

  const rewards = [
    ...achievementResult.earnedMedals.map((reward) => ({ ...reward, mark: "勲章" })),
    ...achievementResult.earnedTitles.map((reward) => ({ ...reward, mark: "称号" })),
  ];

  if (rewards.length === 0) {
    const empty = document.createElement("span");
    empty.className = "badge-chip is-locked";
    empty.textContent = "まだ獲得なし";
    profileBadges.append(empty);
    return;
  }

  for (const reward of rewards) {
    const badge = document.createElement("span");
    badge.className = "badge-chip is-active";
    badge.textContent = `${reward.mark}: ${reward.name}`;
    profileBadges.append(badge);
  }
};

const ensureProfileAchievementResults = () => {
  if (!profileFairies || document.querySelector("[data-profile-achievement-results]")) {
    return document.querySelector("[data-profile-achievement-results]");
  }

  const section = document.createElement("section");
  section.className = "profile-achievement-results";
  section.dataset.profileAchievementResults = "";
  section.setAttribute("aria-label", "達成判定結果");

  const heading = document.createElement("p");
  heading.textContent = "達成判定結果";

  const list = document.createElement("div");
  list.className = "profile-achievement-list";
  list.dataset.profileAchievementList = "";

  section.append(heading, list);
  profileFairies.after(section);

  return section;
};

const renderProfileAchievementResults = (achievementResult) => {
  const section = ensureProfileAchievementResults();

  if (!section) {
    return;
  }

  const list = section.querySelector("[data-profile-achievement-list]");
  const teacherFairyCount = achievementResult.teacherFairy.earnedFairies.length;
  const teacherTotal = achievementResult.teacherFairy.teachers.length;
  const teacherCycleTotal = achievementResult.teacherFairy.teachers.reduce(
    (total, teacher) => total + (teacher.cycleCount ?? 1),
    0
  );
  const participationCycleCount = achievementResult.participation.achievedCycles?.length ?? 0;
  const participationCycleTotal = achievementResult.participation.cycleCount ?? 1;
  const circleRounds = achievementResult.teacherCircle.currentRounds;
  const specialCompanionCount = achievementResult.earnedCompanions?.length ?? 0;

  const rows = [
    {
      label: "参加スタンプ",
      status: `${participationCycleCount}/${participationCycleTotal}巡 達成`,
      count: `${achievementResult.participation.currentCount}/${achievementResult.participation.maxCount ?? achievementResult.participation.requiredCount}回`,
    },
    {
      label: "先生ごとの妖精達成",
      status: `${teacherFairyCount}/${teacherCycleTotal}妖精 達成`,
      count: `先生${teacherTotal}人 × 3巡`,
    },
    {
      label: "先生の輪",
      status: circleRounds > 0 ? `${circleRounds}巡 達成済み` : "未達成",
      count: "先生5人を各1回",
    },
    {
      label: "特別な仲間",
      status: `${specialCompanionCount}/4仲間 達成`,
      count: "現在の保存記録から判定",
    },
  ];

  list.textContent = "";

  for (const row of rows) {
    const item = document.createElement("article");
    const label = document.createElement("strong");
    const status = document.createElement("span");
    const count = document.createElement("small");

    label.textContent = row.label;
    status.textContent = row.status;
    count.textContent = row.count;

    item.append(label, status, count);
    list.append(item);
  }
};

let updateRoundProgress = () => {
  const completedCount = getCompletedFirstRoundCount();
  const totalCount = getTeacherCircleRequiredCount();
  const remainingCount = Math.max(0, totalCount - completedCount);
  const percent = `${(Math.min(completedCount, totalCount) / totalCount) * 100}%`;

  roundSummary.textContent = remainingCount === 0 ? "一巡目の輪を達成" : `あと${remainingCount}人で勲章`;
  roundRemaining.textContent = remainingCount === 0 ? "達成済み" : `あと${remainingCount}人`;
  circleStatus.textContent = remainingCount === 0 ? `${totalCount}/${totalCount}人 達成` : `${completedCount}/${totalCount}人 達成中`;
  circleStatus.dataset.status = circleStatus.textContent;
  circleStatus.style.setProperty("--round-progress", percent);
};

updateRoundProgress = () => {
  const completedCount = getCompletedFirstRoundCount();
  const totalCount = getTeacherCircleRequiredCount();
  const remainingCount = Math.max(0, totalCount - completedCount);
  const percent = `${(Math.min(completedCount, totalCount) / totalCount) * 100}%`;

  roundSummary.textContent = remainingCount === 0 ? "先生の輪 一巡達成" : `あと${remainingCount}人で一巡`;
  roundRemaining.textContent = remainingCount === 0 ? "一巡達成" : `あと${remainingCount}人`;
  circleStatus.textContent = remainingCount === 0 ? `${totalCount}/${totalCount}人 一巡達成` : `${completedCount}/${totalCount}人 達成中`;
  circleStatus.dataset.status = circleStatus.textContent;
  circleStatus.style.setProperty("--round-progress", percent);
};

let updateTeacherCards = () => {
  for (const card of teacherCards) {
    const teacher = teacherDetails[card.dataset.teacher];
    const label = card.querySelector("small");

    card.classList.toggle("is-recorded", teacher.completedFirstRound);
    card.classList.toggle("next-teacher", !teacher.completedFirstRound);

    label.textContent = teacher.completedFirstRound
      ? `記録済み・${teacher.guide}`
      : `未記録・${teacher.guide}`;
  }
};

updateTeacherCards = () => {
  for (const card of teacherCards) {
    const teacher = teacherDetails[card.dataset.teacher];
    const name = card.querySelector("strong");
    const label = card.querySelector("small");
    const flower = card.querySelector(".teacher-flower");

    if (!teacher || !label || !name) {
      continue;
    }

    const cycleProgress = getCurrentTeacherCycleProgress(teacher);
    name.textContent = teacher.name;
    card.classList.toggle("is-recorded", teacher.completedFirstRound);
    card.classList.toggle("next-teacher", !teacher.completedFirstRound);

    applyFlowerVisual(flower, cycleProgress.cycle);

    label.textContent = teacher.completedFirstRound
      ? `先生の輪 済・${getTeacherStampText(teacher)}`
      : `先生の輪 未・${getTeacherStampText(teacher)}`;
  }
};

const updateProfileCard = () => {
  const achievementResult = getCurrentAchievementResult();
  const hasCircle = achievementResult.teacherCircle.currentRounds > 0;
  const earnedFairies = achievementResult.earnedFairies;
  const flowerTotal = participationFlowerCycles.length
    + Object.values(teacherDetails).reduce((total, teacher) => total + (teacher.flowerCycles?.length ?? 1), 0);
  const achievedFlowerCount = Math.min(earnedFairies.length, flowerTotal);
  const latestTitle = achievementResult.earnedTitles.at(-1);
  const latestMedal = achievementResult.earnedMedals.at(-1);

  totalStamps.textContent = `スタンプ ${getTotalStampCount()}`;
  if (profileGuideProgress) {
    profileGuideProgress.textContent = `${achievedFlowerCount}/${flowerTotal}`;
  }
  if (profileGuideProgressTrack) {
    profileGuideProgressTrack.style.width = `${flowerTotal > 0 ? (achievedFlowerCount / flowerTotal) * 100 : 0}%`;
  }
  profileTitle.textContent = latestTitle?.name ?? (earnedFairies.length > 0 ? "妖精と出会った旅人" : "花を集める旅人");
  profileRank.textContent = hasCircle ? "探訪冒険者" : "初級冒険者";
  profileMedal.textContent = latestMedal?.name ?? "コスモスの友";
  profileMedalIcon.textContent = hasCircle ? "🥉" : "🎖️";

  circleBadge.textContent = hasCircle ? "🥉 一巡目の輪（仮）" : "🥉 一巡目の輪";
  circleBadge.classList.toggle("is-locked", !hasCircle);
  circleBadge.classList.toggle("is-active", hasCircle);
  circleStamp.classList.toggle("is-next", !hasCircle);
  circleStamp.classList.toggle("is-complete", hasCircle);

  renderProfileRewardBadges(achievementResult);
  renderProfileFairiesFromResult(achievementResult);
  renderProfileSpecialCompanions(achievementResult);
  renderProfileAchievementResults(achievementResult);
  renderOwlLibrary(achievementResult);
};

const createAdminAdjustmentRow = ({ type, id, label, subLabel, value, maxCount }) => {
  const row = document.createElement("article");
  row.className = "admin-adjustment-row";

  const copy = document.createElement("div");
  copy.className = "admin-adjustment-copy";

  const name = document.createElement("strong");
  name.textContent = label;

  const note = document.createElement("span");
  note.textContent = subLabel;

  copy.append(name, note);

  const controls = document.createElement("div");
  controls.className = "admin-adjustment-controls";

  const minus = document.createElement("button");
  minus.type = "button";
  minus.className = "admin-count-button";
  minus.dataset.adminAdjust = "minus";
  minus.dataset.adminType = type;
  minus.dataset.adminId = id;
  minus.textContent = "-";
  minus.disabled = value <= 0;

  const count = document.createElement("span");
  count.className = "admin-adjustment-count";
  count.textContent = `${value}/${maxCount}`;

  const plus = document.createElement("button");
  plus.type = "button";
  plus.className = "admin-count-button";
  plus.dataset.adminAdjust = "plus";
  plus.dataset.adminType = type;
  plus.dataset.adminId = id;
  plus.textContent = "+";
  plus.disabled = value >= maxCount;

  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "admin-item-reset-button";
  reset.dataset.adminAdjust = "reset";
  reset.dataset.adminType = type;
  reset.dataset.adminId = id;
  reset.textContent = "リセット";
  reset.disabled = value <= 0;

  controls.append(minus, count, plus, reset);
  row.append(copy, controls);

  return row;
};

const renderAdminAdjustments = () => {
  if (!adminAdjustmentList) {
    return;
  }

  if (!adminDraft) {
    syncAdminDraftFromProgress();
  }

  adminAdjustmentList.textContent = "";
  adminAdjustmentList.append(
    createAdminAdjustmentRow({
      type: "participation",
      id: "participation",
      label: "参加スタンプ",
      subLabel: "コスモス満開",
      value: adminDraft.participationCount,
      maxCount: getParticipationMaxCount(),
    })
  );

  for (const [teacherId, teacher] of Object.entries(teacherDetails)) {
    adminAdjustmentList.append(
      createAdminAdjustmentRow({
        type: "teacher",
        id: teacherId,
        label: teacher.name,
        subLabel: `${teacher.flowerName ?? "花"}から始まる花巡り`,
        value: adminDraft.teacherLessonCounts[teacherId] ?? 0,
        maxCount: getTeacherMaxCount(teacher),
      })
    );
  }

  setAdminDraftDirty(isAdminDraftDifferentFromProgress());
};

const updateAdminPanel = () => {
  if (!adminDraft) {
    syncAdminDraftFromProgress();
  }

  setAdminDraftDirty(isAdminDraftDifferentFromProgress());

  const completedCount = Object.values(adminDraft.teacherLessonCounts).filter((count) => count > 0).length;
  const totalCount = getTeacherCircleRequiredCount();
  const remainingCount = Math.max(0, totalCount - completedCount);
  const nextTeacher = Object.entries(teacherDetails).find(([teacherId]) => normalizeProgressCount(adminDraft.teacherLessonCounts[teacherId]) === 0);
  const currentParticipationCount = normalizeProgressCount(adminDraft.participationCount);
  const draftCircleRounds = getAdminDraftTeacherCircleRounds();

  adminParticipation.textContent = `参加スタンプ ${currentParticipationCount}回`;
  adminTeacher.textContent = nextTeacher?.[1].name ?? "全員一巡済み";
  adminState.textContent = isAdminDraftDirty ? "未保存" : "保存済み";
  adminSummary.textContent = draftCircleRounds > 0
    ? "先生の輪 一巡判定: 達成"
    : `先生の輪 一巡判定: あと${remainingCount}人`;
  adminResult.textContent = isAdminDraftDirty
    ? "未保存の変更があります。確定して保存してください"
    : "保存済みの記録を表示しています。";
  adminNote.textContent = "＋/−と項目リセットは下書きです。確定して保存を押すまで記録は変わりません。";
  adminStampButton.textContent = "確定して保存";
  adminStampButton.disabled = !isAdminDraftDirty;
  renderAdminAdjustments();
};

const isTeacherCycleAchievementCount = (count, teacher) => {
  const goal = getTeacherGoal(teacher);
  const maxCount = getTeacherMaxCount(teacher);
  const currentCount = clampProgressCount(count, maxCount);

  return currentCount > 0 && currentCount % goal === 0;
};

const setRecordPhase = (phase, teacher) => {
  recordPhase = phase;
  teacherDetail.dataset.recordPhase = phase;

  flowConfirmStep.classList.toggle("is-active", phase === "confirm");
  flowConfirmStep.classList.toggle("is-complete", phase === "done" || phase === "achievement");
  flowDoneStep.classList.toggle("is-complete", phase === "done" || phase === "achievement");
  inlineFairyAchievement.hidden = true;
  fairyAchievement.hidden = phase !== "achievement";
  gameRecordForm.hidden = phase !== "confirm";
  confirmCard.hidden = teacher.stampCount >= getTeacherMaxCount(teacher) && phase !== "done";
  confirmCard.classList.toggle("is-achievement-preview", phase === "confirm" && isTeacherCycleAchievementCount(teacher.stampCount + 1, teacher));

  if (teacher.stampCount >= getTeacherMaxCount(teacher) && phase !== "done" && phase !== "achievement") {
    completeTeacherButton.textContent = "全ての花スタンプ達成済み";
    completeTeacherButton.disabled = true;
    flowMessage.textContent = "この先生の花スタンプはすべて達成済みです。";
    return;
  }

  completeTeacherButton.disabled = false;

  if (phase === "confirm") {
    if (!gameRecordDate.value) {
      gameRecordDate.value = getTodayForInput();
    }
    confirmSaveReadyAt = Date.now() + 700;
    completeTeacherButton.disabled = true;
    window.setTimeout(() => {
      if (recordPhase === "confirm") {
        completeTeacherButton.disabled = false;
      }
    }, 700);

    if (isTeacherCycleAchievementCount(teacher.stampCount + 1, teacher)) {
      const nextCount = teacher.stampCount + 1;
      const nextCycleNumber = Math.ceil(nextCount / getTeacherGoal(teacher));

      confirmLabel.textContent = `${nextCycleNumber}巡目の達成確認`;
      updateGameRecordConfirmation();
      completeTeacherButton.textContent = "3. 対局記録を保存して妖精スタンプを開く";
      flowMessage.textContent = "巡の最後の1回です。反映後に妖精・達成文字・花びら演出が表示されます。";
      return;
    }

    confirmLabel.textContent = "保存する対局記録";
    updateGameRecordConfirmation();
    completeTeacherButton.textContent = "3. 対局記録を保存してスタンプを押す";
    flowMessage.textContent = "対局記録を確認してください。このボタンを押した時だけ記録保存とスタンプ反映を行います。";
    return;
  }

  if (phase === "done") {
    confirmEffect.textContent = "指導後スタンプを反映しました。";
    completeTeacherButton.textContent = "冒険者カードを見る";
    flowMessage.textContent = hasFirstRoundMedal()
      ? "一巡目の輪を達成しました。冒険者カードに新しい勲章が反映されています。"
      : "スタンプを反映しました。続けて未記録の先生を選べます。";
    return;
  }

  if (phase === "achievement") {
    const completedCycle = getCompletedTeacherCycleProgress(teacher);
    const achievementFairyData = getAchievementFairy(teacher, completedCycle);

    fairyAchievement.dataset.flower = completedCycle.cycle.flower;
    achievementKicker.textContent = `${completedCycle.cycleNumber}巡目 達成`;
    achievementModalClose.textContent = "×";
    achievementModalClose.setAttribute("aria-label", "閉じる");
    achievementFairy.src = achievementFairyData.src;
    achievementFairy.alt = achievementFairyData.label;
    achievementTitle.textContent = achievementFairyData.label;
    achievementTeacher.textContent = teacher.name;
    achievementCopy.textContent = `${teacher.name}の${completedCycle.cycleName ?? `${completedCycle.cycleNumber}巡目`}が達成になりました。妖精達成を冒険者カードへ保存しました。`;
    achievementProfileButton.textContent = "冒険者カードを見る";
    confirmEffect.textContent = `${completedCycle.cycleNumber}巡目の指導碁スタンプを保存しました。`;
    completeTeacherButton.textContent = "冒険者カードを見る";
    flowMessage.textContent = "妖精達成を保存しました。冒険者カードで確認できます。";
    return;

    const fairy = fairyAssets[teacher.flower] ?? fairyAssets.cosmos;

    achievementFairy.src = fairy.src;
    achievementFairy.alt = fairy.label;
    achievementTitle.textContent = fairy.label;
    achievementTeacher.textContent = teacher.name;
    achievementCopy.textContent = `${teacher.name}の指導碁スタンプが${getTeacherGoal(teacher)}/${getTeacherGoal(teacher)}になり、妖精があらわれました。`;
    confirmEffect.textContent = "5回目の指導後スタンプを反映しました。";
    completeTeacherButton.textContent = "冒険者カードを見る";
    flowMessage.textContent = "妖精スタンプを達成しました。花びらの演出が終わったら、冒険者カードへ進めます。";
    return;
  }

  completeTeacherButton.textContent = "2. 対局記録を入力";
  flowMessage.textContent = "対局日・ハンデ・勝敗を入力してから、別の確定ボタンで保存します。";
};

const renderTeacherDetail = (teacherKey) => {
  const teacher = teacherDetails[teacherKey];
  const cycleProgress = getCurrentTeacherCycleProgress(teacher);
  const isAllCyclesComplete = teacher.stampCount >= getTeacherMaxCount(teacher);

  activeTeacherKey = teacherKey;
  document.querySelector("[data-teacher-name]").textContent = teacher.name;
  document.querySelector("[data-teacher-card-name]").textContent = teacher.name;
  document.querySelector("[data-teacher-stamp]").textContent = getTeacherStampText(teacher);
  updateTeacherStampRuleNote(teacher);
  cardStampCurrent.textContent = String(cycleProgress.countInCycle);
  cardStampGoal.textContent = String(getTeacherGoal(teacher));
  const photoCard = document.querySelector(".teacher-photo-card");
  photoCard.dataset.bloomCount = String(cycleProgress.countInCycle);
  photoCard.dataset.fairy = String(teacher.fairy);
  photoCard.dataset.flower = cycleProgress.cycle.flower;
  applyFlowerVariables(photoCard, cycleProgress.cycle);
  document.querySelector("[data-teacher-photo]").dataset.teacherPhoto = teacher.photo;
  document.querySelector("[data-photo-initial]").textContent = teacher.initial;
  document.querySelector("[data-teacher-style]").textContent = teacher.style;
  document.querySelector("[data-teacher-lesson]").textContent = teacher.lesson;
  document.querySelector("[data-teacher-note]").textContent = teacher.note;
  renderTeacherGameRecords(teacherKey);
  const isCycleAchievementPreview = !isAllCyclesComplete && isTeacherCycleAchievementCount(teacher.stampCount + 1, teacher);
  const nextCycleNumber = Math.ceil((teacher.stampCount + 1) / getTeacherGoal(teacher));
  confirmLabel.textContent = isAllCyclesComplete
    ? `全${teacher.flowerCycles.length}巡達成`
    : isCycleAchievementPreview
      ? `${nextCycleNumber}巡目の達成確認`
      : "これから記録する内容";
  confirmTeacher.textContent = teacher.name;
  confirmEffect.textContent = isAllCyclesComplete
    ? "この先生の花スタンプはすべて達成済みです。"
    : isCycleAchievementPreview
      ? "指導後スタンプを1つ追加すると、この巡の妖精スタンプが開きます。"
      : `${cycleProgress.cycle.flowerName}のスタンプを1つ追加します。`;

  setRecordPhase("ready", teacher);
};

const completeTeacherStamp = (teacherKey) => {
  const teacher = teacherDetails[teacherKey];
  const previousStampCount = teacher.stampCount;
  const savedGameRecord = addGameRecord(teacherKey);

  teacher.completedFirstRound = true;
  teacher.stampCount = Math.min(getTeacherMaxCount(teacher), teacher.stampCount + 1);
  teacher.fairy = teacher.stampCount >= getTeacherGoal(teacher);
  updateProgressFromTeacherDetails();
  syncAdminDraftFromProgress();

  renderTeacherDetail(teacherKey);
  updateParticipationStampCard();
  updateTeacherCards();
  updateRoundProgress();
  updateProfileCard();
  updateAdminPanel();
  renderTeacherGameRecords(teacherKey);
  confirmEffect.textContent = `${savedGameRecord.date}・${savedGameRecord.handicap}・${savedGameRecord.result}を保存しました。`;
  setRecordPhase(
    !isTeacherCycleAchievementCount(previousStampCount, teacher) && isTeacherCycleAchievementCount(teacher.stampCount, teacher)
      ? "achievement"
      : "done",
    teacher
  );
};

const showTeacherList = () => {
  teacherLayout.dataset.teacherMode = "list";
  dock.classList.remove("is-detail-open");
  teacherDetail.classList.remove("is-active");
  teacherDetail.hidden = true;
  teacherList.classList.add("is-active");
  teacherList.hidden = false;
};

for (const tab of tabs) {
  tab.addEventListener("click", () => {
    const target = tab.dataset.panel;

    showPanel(target);

    if (target === "field-guide") {
      showTeacherList();
    }

    if (target === "admin") {
      updateAdminLockState();
    }
  });
}

closeButton.addEventListener("click", () => {
  if (isAdminUnlocked) {
    lockAdminPanel();
  }

  dock.classList.add("is-collapsed");
  dock.classList.remove("is-detail-open");
  infoPanel.hidden = true;

  for (const tab of tabs) {
    tab.classList.remove("is-active");
    tab.setAttribute("aria-pressed", "false");
  }

  for (const panel of panels) {
    panel.classList.remove("is-active");
    panel.hidden = true;
  }
});

for (const card of teacherCards) {
  card.addEventListener("click", () => {
    for (const item of teacherCards) {
      const isSelected = item === card;
      item.classList.toggle("is-selected", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    }

    renderTeacherDetail(card.dataset.teacher);

    teacherLayout.dataset.teacherMode = "detail";
    dock.classList.add("is-detail-open");
    teacherList.classList.remove("is-active");
    teacherList.hidden = true;
    teacherDetail.classList.add("is-active");
    teacherDetail.hidden = false;
  });
}

backToList.addEventListener("click", showTeacherList);

for (const closeButton of achievementCloseButtons) {
  closeButton.addEventListener("click", () => {
    fairyAchievement.hidden = true;
  });
}

achievementProfileButton.addEventListener("click", () => {
  fairyAchievement.hidden = true;
  updateProfileCard();
  showPanel("profile");
});

adminPasscodeButton.addEventListener("click", unlockAdminPanel);

adminPasscodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    unlockAdminPanel();
  }
});

for (const input of [gameRecordDate, gameRecordHandicap, gameRecordResult]) {
  input.addEventListener("input", updateGameRecordConfirmation);
  input.addEventListener("change", updateGameRecordConfirmation);
}

participationStampButton.addEventListener("click", () => {
  addParticipationStamp();
  syncAdminDraftFromProgress();
  updateParticipationStampCard();
  updateProfileCard();
  updateAdminPanel();
});

completeTeacherButton.addEventListener("click", () => {
  const teacher = teacherDetails[activeTeacherKey];

  if (recordPhase === "done" || recordPhase === "achievement") {
    updateProfileCard();
    showPanel("profile");
    return;
  }

  if (recordPhase === "confirm") {
    if (Date.now() < confirmSaveReadyAt) {
      return;
    }
    completeTeacherStamp(activeTeacherKey);
    return;
  }

  setRecordPhase("confirm", teacher);
});

adminAdjustmentList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-admin-adjust]");

  if (!button) {
    return;
  }

  const type = button.dataset.adminType;
  const id = button.dataset.adminId;
  const currentValue = type === "participation"
    ? adminDraft.participationCount
    : adminDraft.teacherLessonCounts[id];
  const nextValue = button.dataset.adminAdjust === "plus"
    ? currentValue + 1
    : button.dataset.adminAdjust === "minus"
      ? currentValue - 1
      : 0;

  setAdminDraftCount(type, id, nextValue);
  updateAdminPanel();
});

adminStampButton.addEventListener("click", () => {
  applyAdminDraftToProgress();
  updateParticipationStampCard();
  renderTeacherDetail(activeTeacherKey);
  updateTeacherCards();
  updateRoundProgress();
  updateProfileCard();
  updateAdminPanel();
  adminNote.textContent = "変更を保存しました。冒険者カード、花図鑑、妖精、勲章、称号を再計算しました。";
});

adminResetButton.addEventListener("click", () => {
  adminResetConfirm.hidden = false;
  adminResetInput.value = "";
  adminResetConfirmButton.disabled = true;
  adminNote.textContent = "リセットする場合は、確認欄に「リセット」と入力してください。";
  adminResetInput.focus();
});

adminResetInput.addEventListener("input", () => {
  adminResetConfirmButton.disabled = adminResetInput.value !== "リセット";
});

adminResetCancel.addEventListener("click", () => {
  adminResetConfirm.hidden = true;
  adminResetInput.value = "";
  adminResetConfirmButton.disabled = true;
  adminNote.textContent = "リセットは実行されませんでした。";
});

adminResetConfirmButton.addEventListener("click", () => {
  if (adminResetInput.value !== "リセット") {
    adminResetConfirmButton.disabled = true;
    return;
  }

  adminResetConfirm.hidden = true;
  adminResetInput.value = "";
  adminResetConfirmButton.disabled = true;
  resetUserProgress();
  syncAdminDraftFromProgress();
  updateParticipationStampCard();
  renderTeacherDetail(activeTeacherKey);
  updateTeacherCards();
  updateRoundProgress();
  updateProfileCard();
  updateAdminPanel();
  showPanel("admin");
});

updateParticipationStampCard();
updateTeacherCards();
updateRoundProgress();
updateProfileCard();
updateAdminPanel();
updateAdminLockState();

const appLoadStatus = document.querySelector("[data-app-load-status]");
if (appLoadStatus) {
  appLoadStatus.textContent = "画面の操作を読み込みました。";
  window.setTimeout(() => {
    appLoadStatus.hidden = true;
  }, 700);
}
} catch (error) {
  const appLoadStatus = document.querySelector("[data-app-load-status]");
  if (appLoadStatus) {
    appLoadStatus.hidden = false;
    appLoadStatus.textContent = `画面の操作が止まりました。Codexにこの表示を見せてください: ${error.message}`;
  }
  throw error;
}
})();
