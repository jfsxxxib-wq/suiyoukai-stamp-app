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
const currentFlowerImage = document.querySelector("[data-current-flower-image]");
const currentFlowerName = document.querySelector("[data-current-flower-name]");
const currentFlowerProgress = document.querySelector("[data-current-flower-progress]");
const currentFlowerStamps = document.querySelector("[data-current-flower-stamps]");
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
const profileToggleButtons = document.querySelectorAll("[data-profile-toggle]");
const profileSpecialCompanions = document.querySelector("[data-profile-special-companions]");
const fairyViewer = document.querySelector("[data-fairy-viewer]");
const fairyViewerImage = document.querySelector("[data-fairy-viewer-image]");
const fairyViewerName = document.querySelector("[data-fairy-viewer-name]");
const fairyViewerStatus = document.querySelector("[data-fairy-viewer-status]");
const fairyViewerQuote = document.querySelector("[data-fairy-viewer-quote]");
const fairyViewerCard = document.querySelector(".fairy-viewer-card");
const fairyViewerCloseButtons = document.querySelectorAll("[data-fairy-viewer-close]");
const profileSpecialCompanionList = document.querySelector("[data-profile-special-companion-list]");
const libraryOwl = document.querySelector("[data-library-owl]");
const libraryOwlViewerButton = document.querySelector("[data-library-owl-viewer]");
const libraryGuide = document.querySelector("[data-library-guide]");
const librarySpeech = document.querySelector("[data-library-speech]");
const libraryCurrentTitle = document.querySelector("[data-library-current-title]");
const librarySummary = document.querySelector("[data-library-summary]");
const libraryTitleCount = document.querySelector("[data-library-title-count]");
const libraryTitleList = document.querySelector("[data-library-title-list]");
const libraryTitleToggle = document.querySelector("[data-library-title-toggle]");
const libraryTitleArtToggle = document.querySelector("[data-library-title-art-toggle]");
const libraryMedalCount = document.querySelector("[data-library-medal-count]");
const libraryMedalList = document.querySelector("[data-library-medal-list]");
const libraryMedalToggle = document.querySelector("[data-library-medal-toggle]");
const libraryMedalArtToggle = document.querySelector("[data-library-medal-art-toggle]");
const libraryAchievementList = document.querySelector("[data-library-achievement-list]");
const libraryJournalRecords = document.querySelector("[data-library-journal-records]");
const libraryJournalPages = document.querySelector("[data-library-journal-pages]");
const libraryJournalPrompt = document.querySelector("[data-library-journal-prompt]");
const libraryJournalToggle = document.querySelector("[data-library-journal-toggle]");
const libraryJournalSkip = document.querySelector("[data-library-journal-skip]");
const libraryJournalNote = document.querySelector("[data-library-journal-note]");
const participationStamp = document.querySelector(".participation-stamp");
const participationFlower = document.querySelector(".participation-stamp .stamp-flower");
const participationFlowerName = document.querySelector("[data-participation-flower-name]");
const participationCount = document.querySelector("[data-participation-count]");
const participationStatus = document.querySelector("[data-participation-status]");
const participationStampButton = document.querySelector("[data-participation-stamp-button]");
const flowerGuideCards = document.querySelectorAll("[data-flower-guide-target]");
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
const adminHistoryList = document.querySelector("[data-admin-history-list]");
const adminBackupSaveButton = document.querySelector("[data-admin-backup-save]");
const adminBackupSelectButton = document.querySelector("[data-admin-backup-select]");
const adminBackupFileInput = document.querySelector("[data-admin-backup-file]");
const adminBackupMessage = document.querySelector("[data-admin-backup-message]");
const adminRestoreConfirm = document.querySelector("[data-admin-restore-confirm]");
const adminRestoreSummary = document.querySelector("[data-admin-restore-summary]");
const adminRestoreInput = document.querySelector("[data-admin-restore-input]");
const adminRestoreCancel = document.querySelector("[data-admin-restore-cancel]");
const adminRestoreConfirmButton = document.querySelector("[data-admin-restore-confirm-button]");
const nextAdventureButton = document.querySelector("[data-next-adventure-button]");
const nextAdventureTitle = document.querySelector("[data-next-adventure-title]");
const nextAdventureCopy = document.querySelector("[data-next-adventure-copy]");
const nextAdventureGuide = document.querySelector("[data-next-adventure-guide]");
const nextAdventureGuideImage = document.querySelector("[data-next-adventure-guide-image]");
const nextAdventureGuideSpeech = document.querySelector("[data-next-adventure-guide-speech]");
const operatorAuthModal = document.querySelector("[data-operator-auth]");
const operatorAuthTitle = document.querySelector("[data-operator-auth-title]");
const operatorAuthSummary = document.querySelector("[data-operator-auth-summary]");
const operatorAuthInput = document.querySelector("[data-operator-auth-input]");
const operatorAuthMessage = document.querySelector("[data-operator-auth-message]");
const operatorAuthConfirm = document.querySelector("[data-operator-auth-confirm]");
const operatorAuthCancelButtons = document.querySelectorAll("[data-operator-auth-cancel]");

let activeTeacherKey = "tsuneishi";
let recordPhase = "ready";
let confirmSaveReadyAt = 0;
let adminDraft = null;
let pendingOperatorAction = null;
let pendingRestoreBackup = null;

const medalAssets = {
  medal_participation_cosmos_full_bloom: "assets/medal-stage-02.png",
  medal_teacher_circle_round_1: "assets/teacher-circle-medal-once.png",
  medal_teacher_circle_round_2: "assets/teacher-circle-medal-twice.png",
  medal_teacher_circle_round_3: "assets/medal-stage-03.png",
  medal_teacher_circle_round_5: "assets/medal-stage-04.png",
};

const getMedalAsset = (medalId) => medalAssets[medalId] ?? null;
let isAdminDraftDirty = false;
let isAdminUnlocked = false;

const progressStorageKey = "suiyoukai-stamp-progress-v1";
const gameRecordsStorageKey = "suiyoukai-game-records-v1";
const operationHistoryStorageKey = "suiyoukai-operation-history-v1";
const backupAppId = "suiyoukai-stamp-adventure";
const backupFormatVersion = 1;
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
    companions: [],
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

const getStoredEarnedCompanions = (progress = {}) =>
  progress.earned?.companions ?? progress.earnedCompanions ?? [];

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
      companions: Array.isArray(getStoredEarnedCompanions(progress)) ? getStoredEarnedCompanions(progress) : template.earned.companions,
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
      companions: [],
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

const sanitizeOperationHistory = (entry = {}) => {
  const target = typeof entry.target === "string" && entry.target
    ? entry.target
    : typeof entry.label === "string" && entry.label
      ? entry.label
      : "";

  if (!target || typeof entry.recordedAt !== "string") {
    return null;
  }

  return {
    id: typeof entry.id === "string" ? entry.id : `operation-${entry.recordedAt}`,
    type: typeof entry.type === "string" ? entry.type : "stamp",
    target,
    before: normalizeProgressCount(entry.before),
    after: normalizeProgressCount(entry.after),
    recordedAt: entry.recordedAt,
  };
};

const loadOperationHistory = () => {
  try {
    const storedHistory = JSON.parse(localStorage.getItem(operationHistoryStorageKey) ?? "[]");
    return Array.isArray(storedHistory) ? storedHistory.map(sanitizeOperationHistory).filter(Boolean).slice(-50) : [];
  } catch {
    return [];
  }
};

let operationHistory = loadOperationHistory();

const saveOperationHistory = () => {
  try {
    localStorage.setItem(operationHistoryStorageKey, JSON.stringify(operationHistory));
  } catch {
    // 履歴を保存できない環境でも、押印そのものは継続します。
  }
};

const appendOperationHistory = ({ type, target, before, after }) => {
  operationHistory.push({
    id: `operation-${Date.now()}-${operationHistory.length}-${type}`,
    type,
    target,
    before: normalizeProgressCount(before),
    after: normalizeProgressCount(after),
    recordedAt: new Date().toISOString(),
  });
  operationHistory = operationHistory.slice(-50);
  saveOperationHistory();
};

const cloneJsonData = (value) => JSON.parse(JSON.stringify(value));

const createBackupData = () => ({
  appId: backupAppId,
  formatVersion: backupFormatVersion,
  savedAt: new Date().toISOString(),
  progress: cloneJsonData(userProgress),
  operationHistory: cloneJsonData(operationHistory),
});

const getBackupFilename = (kind = "backup") => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  const stamp = local.toISOString().slice(0, 19).replace(/[-:T]/g, "");
  return `suiyoukai-${kind}-${stamp}.json`;
};

const downloadBackupData = (backup, kind = "backup") => {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = getBackupFilename(kind);
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

const isValidIsoDate = (value) => typeof value === "string"
  && /^\d{4}-\d{2}-\d{2}T/.test(value)
  && !Number.isNaN(new Date(value).getTime());

const isValidBackupCount = (value) => Number.isFinite(value) && value >= 0;

const validateBackupData = (backup) => {
  if (!backup || typeof backup !== "object" || Array.isArray(backup)) {
    throw new Error("バックアップの内容を読み取れません。");
  }

  if (backup.appId !== backupAppId || backup.formatVersion !== backupFormatVersion) {
    throw new Error("このアプリで作成した対応形式のバックアップではありません。");
  }

  if (!isValidIsoDate(backup.savedAt)) {
    throw new Error("バックアップの保存日時が正しくありません。");
  }

  const progress = backup.progress;
  const stamps = progress?.stamps;
  const earned = progress?.earned;
  const teacherCounts = stamps?.teacherLessonCounts;

  if (!progress || typeof progress !== "object"
    || progress.schemaVersion !== cloneProgressTemplate().schemaVersion
    || !stamps || typeof stamps !== "object"
    || !isValidBackupCount(stamps.participationCount)
    || stamps.participationCount > getParticipationMaxCount()
    || !teacherCounts || typeof teacherCounts !== "object"
    || !isValidBackupCount(stamps.teacherCircleRounds)
    || !earned || typeof earned !== "object") {
    throw new Error("スタンプ記録の形式が壊れています。");
  }

  for (const teacherId of Object.keys(teacherDetails)) {
    if (!isValidBackupCount(teacherCounts[teacherId])
      || teacherCounts[teacherId] > getTeacherMaxCount(teacherDetails[teacherId])) {
      throw new Error("先生ごとのスタンプ記録が正しくありません。");
    }
  }

  if (stamps.teacherCircleRounds !== getTeacherCircleRoundsFromCounts(teacherCounts)) {
    throw new Error("先生の輪の記録が一致しません。");
  }

  for (const rewardType of ["fairies", "medals", "titles", "companions"]) {
    if (!Array.isArray(earned[rewardType])
      || earned[rewardType].some((reward) => !reward || typeof reward.id !== "string" || !reward.id)) {
      throw new Error("獲得済み報酬の形式が壊れています。");
    }
  }

  if (!Array.isArray(backup.operationHistory)
    || backup.operationHistory.some((entry) => !sanitizeOperationHistory(entry) || !isValidIsoDate(entry.recordedAt))) {
    throw new Error("操作履歴の形式が壊れています。");
  }

  return {
    appId: backupAppId,
    formatVersion: backupFormatVersion,
    savedAt: backup.savedAt,
    progress: sanitizeProgress(progress),
    operationHistory: backup.operationHistory.map(sanitizeOperationHistory).slice(-50),
  };
};

const addRestoreSummaryRow = (label, value) => {
  const row = document.createElement("div");
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = value;
  row.append(term, description);
  adminRestoreSummary.append(row);
};

const showRestoreSummary = (backup) => {
  adminRestoreSummary.textContent = "";
  const savedAt = new Date(backup.savedAt);
  const teacherTotal = Object.values(backup.progress.stamps.teacherLessonCounts)
    .reduce((total, count) => total + normalizeProgressCount(count), 0);
  const earned = backup.progress.earned;

  addRestoreSummaryRow("保存日時", savedAt.toLocaleString("ja-JP"));
  addRestoreSummaryRow("参加スタンプ", `${backup.progress.stamps.participationCount}回`);
  addRestoreSummaryRow("先生の記録", `${teacherTotal}回（5人分）`);
  addRestoreSummaryRow(
    "獲得済み",
    `妖精${earned.fairies.length}・勲章${earned.medals.length}・称号${earned.titles.length}・仲間${earned.companions.length}`
  );
  addRestoreSummaryRow("操作履歴", `${backup.operationHistory.length}件`);
  adminRestoreInput.value = "";
  adminRestoreConfirmButton.disabled = true;
  adminRestoreConfirm.hidden = false;
  adminRestoreInput.focus();
};

const closeRestoreConfirmation = () => {
  pendingRestoreBackup = null;
  adminRestoreConfirm.hidden = true;
  adminRestoreSummary.textContent = "";
  adminRestoreInput.value = "";
  adminRestoreConfirmButton.disabled = true;
  adminBackupFileInput.value = "";
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
    teacher.fairy = stampCount >= getTeacherGoal(teacher)
      || userProgress.earned.fairies.some((fairy) => fairy.teacherId === teacherId);
  }
};

const syncProgressRewards = () => {
  const achievementResult = window.achievementEvaluators.evaluateAllAchievements(userProgress);

  userProgress.earned.fairies = achievementResult.earnedFairies;
  userProgress.earned.medals = achievementResult.earnedMedals;
  userProgress.earned.titles = achievementResult.earnedTitles;
  userProgress.earned.companions = achievementResult.earnedCompanions;
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

const renderAdminHistory = () => {
  if (!adminHistoryList) {
    return;
  }

  adminHistoryList.textContent = "";
  const recentHistory = operationHistory.slice(-10).reverse();

  if (recentHistory.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "まだ押印履歴はありません。";
    adminHistoryList.append(empty);
    return;
  }

  for (const entry of recentHistory) {
    const row = document.createElement("article");
    const type = document.createElement("span");
    const target = document.createElement("strong");
    const count = document.createElement("strong");
    const time = document.createElement("time");
    const recordedAt = new Date(entry.recordedAt);
    const typeLabels = {
      participation_stamp: "押印",
      teacher_stamp: "押印",
      stamp: "押印",
      decrement: "減算",
      admin_adjustment: "管理調整",
      restore: "復元",
      reset: "全リセット",
    };

    type.className = "admin-history-type";
    target.className = "admin-history-target";
    count.className = "admin-history-change";
    row.dataset.operationType = entry.type;
    type.textContent = typeLabels[entry.type] ?? "操作";
    target.textContent = entry.target;
    count.textContent = `${entry.before} → ${entry.after}`;
    time.dateTime = entry.recordedAt;
    time.textContent = Number.isNaN(recordedAt.getTime())
      ? "日時不明"
      : recordedAt.toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
    row.append(type, target, count, time);
    adminHistoryList.append(row);
  }
};

const closeOperatorAuth = () => {
  operatorAuthModal.hidden = true;
  operatorAuthInput.value = "";
  operatorAuthMessage.textContent = "認証後、この1件だけを保存して自動で再ロックします。";
  operatorAuthConfirm.disabled = false;
  pendingOperatorAction = null;
};

const openOperatorAuth = ({ title, summary, action }) => {
  pendingOperatorAction = action;
  operatorAuthTitle.textContent = title;
  operatorAuthSummary.textContent = summary;
  operatorAuthInput.value = "";
  operatorAuthMessage.textContent = "認証後、この1件だけを保存して自動で再ロックします。";
  operatorAuthConfirm.disabled = false;
  operatorAuthModal.hidden = false;
  window.setTimeout(() => operatorAuthInput.focus(), 0);
};

const confirmOperatorAction = () => {
  if (operatorAuthInput.value !== adminPasscode) {
    operatorAuthMessage.textContent = "パスコードが違います。押印は保存されていません。";
    operatorAuthInput.select();
    return;
  }

  const action = pendingOperatorAction;

  if (typeof action !== "function") {
    closeOperatorAuth();
    return;
  }

  operatorAuthConfirm.disabled = true;
  closeOperatorAuth();
  action();
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
  closeRestoreConfirmation();
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

const getAdminDraftChanges = () => {
  if (!adminDraft) {
    return [];
  }

  const changes = [];
  const participationBefore = normalizeProgressCount(userProgress.stamps.participationCount);
  const participationAfter = normalizeProgressCount(adminDraft.participationCount);

  if (participationBefore !== participationAfter) {
    changes.push({ target: "参加スタンプ", before: participationBefore, after: participationAfter });
  }

  for (const [teacherId, teacher] of Object.entries(teacherDetails)) {
    const before = normalizeProgressCount(userProgress.stamps.teacherLessonCounts[teacherId]);
    const after = normalizeProgressCount(adminDraft.teacherLessonCounts[teacherId]);

    if (before !== after) {
      changes.push({ target: `${teacher.name} 指導碁スタンプ`, before, after });
    }
  }

  return changes;
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

const fairyQuoteByFlower = {
  cosmos: "はじめての花が咲いたね！",
  fuji: "ゆっくり伸びた時間も、ちゃんと花になるよ。",
  kinmokusei: "小さな香りみたいに、記録はあとから届くよ。",
  lotus: "静かな一手が、水面に輪を広げているよ。",
  sumire: "小さく咲いても、ちゃんと見つけてもらえるよ。",
  botan: "大きく咲く日は、少しずつ近づいているよ。",
  lily: "まっすぐな気持ちが、今日の花を支えているよ。",
  asagao: "朝のひかりみたいに、新しい一局が始まるよ。",
  kikyo: "落ち着いて進めば、次の道しるべが見えてくるよ。",
  nadeshiko: "やさしい強さで、また一歩進めたね。",
  suisen: "足もとの春を、ちゃんと見つけたね。",
  hagi: "風にゆれる日も、旅はちゃんと続いているよ。",
  shakuyaku: "ていねいに重ねた時間が、きれいに咲いたね。",
};

const companionQuoteById = {
  special_companion_french_bulldog_a: "はじめの一歩\nちゃんと見ていたよ。",
  special_companion_french_bulldog_b: "次の冒険も、いっしょに歩こう。",
  special_companion_owl_a: "記録は未来への宝物だよ。",
  special_companion_owl_b: "先生の輪をめぐった旅\nしっかり刻まれているよ。",
};

const getFairyDisplayData = (fairyData = {}, teacher = null) => {
  const flower = fairyData.flower ?? teacher?.flower ?? "cosmos";
  const flowerName = fairyData.flowerName ?? teacher?.flowerName ?? "花";
  const fairyAsset = fairyData.fairyAsset ?? teacher?.fairyAsset;
  const fallbackFairy = fairyAssets[flower] ?? fairyAssets.cosmos;
  const src = fairyAsset ? `assets/${fairyAsset}` : fallbackFairy.src;
  const label = fairyData.name ?? fairyData.fairyName ?? fallbackFairy.label ?? `${flowerName}の妖精達成`;

  const quote = fairyData.quote ?? fairyQuoteByFlower[flower] ?? `${flowerName}の花、きれいに咲いたね。`;

  return { src, label, flower, flowerName, quote };
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

const updateCurrentFlowerCard = (teacher, cycleProgress) => {
  if (!currentFlowerImage || !currentFlowerName || !currentFlowerProgress) {
    return;
  }

  const goal = getTeacherGoal(teacher);
  const flowerName = cycleProgress.cycle.flowerName ?? "花";
  const cycleName = cycleProgress.cycle.cycleName ?? `${cycleProgress.cycleNumber}巡目`;
  const remaining = Math.max(0, goal - cycleProgress.countInCycle);
  const flowerAsset = cycleProgress.cycle.flowerAsset;

  currentFlowerImage.src = flowerAsset ? `assets/${flowerAsset}` : "assets/cosmos-stamp-stage-05-v2.png";
  currentFlowerImage.alt = flowerName;
  currentFlowerImage.closest(".current-flower-card")?.style.setProperty("--current-flower-stamp-image", `url("${currentFlowerImage.src}")`);
  currentFlowerName.textContent = `${flowerName}の花 ${cycleName}`;
  currentFlowerProgress.textContent = remaining === 0
    ? `${goal}/${goal}回 満開です`
    : `${cycleProgress.countInCycle}/${goal}回 あと${remaining}回で満開`;

  if (currentFlowerStamps) {
    currentFlowerStamps.textContent = "";

    for (let index = 1; index <= goal; index += 1) {
      const stamp = document.createElement("i");
      stamp.className = index <= cycleProgress.countInCycle ? "is-filled" : "";
      stamp.setAttribute("aria-hidden", "true");
      currentFlowerStamps.append(stamp);
    }
  }
};

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
  participationStampButton.textContent = currentCount >= cycleProgress.maxCount ? "参加スタンプ達成済み" : "運営確認して参加スタンプを押す";
  participationStampButton.disabled = currentCount >= cycleProgress.maxCount;
};

const getAssetPath = (asset) => {
  if (!asset) {
    return "";
  }

  return asset.startsWith("assets/") ? asset : `assets/${asset}`;
};

const fairyBookBackgrounds = {
  cosmos: "assets/fairy-bg-cosmos.png",
  fuji: "assets/fairy-bg-hydrangea.png",
  kinmokusei: "assets/fairy-bg-meadow.png",
  iris: "assets/fairy-bg-iris.png",
  lotus: "assets/fairy-bg-iris.png",
  sumire: "assets/fairy-bg-hydrangea.png",
  camellia: "assets/fairy-bg-camellia.png",
  botan: "assets/fairy-bg-camellia.png",
  lily: "assets/fairy-bg-meadow.png",
  sunflower: "assets/fairy-bg-meadow.png",
  asagao: "assets/fairy-bg-hydrangea.png",
  kikyo: "assets/fairy-bg-hydrangea.png",
  hydrangea: "assets/fairy-bg-hydrangea.png",
  nadeshiko: "assets/fairy-bg-camellia.png",
  suisen: "assets/fairy-bg-meadow.png",
  sakura: "assets/fairy-bg-camellia.png",
  hagi: "assets/fairy-bg-hydrangea.png",
  shakuyaku: "assets/fairy-bg-camellia.png",
  dahlia: "assets/fairy-bg-camellia.png",
  ume: "assets/fairy-bg-camellia.png",
};

const getFairyBookBackground = (flower) => fairyBookBackgrounds[flower] ?? fairyBookBackgrounds.cosmos;

const openFairyViewer = ({ src, alt, name, status, quote = "", type = "fairy", flower = "", background = "" }) => {
  if (!fairyViewer || !fairyViewerImage || !fairyViewerName || !fairyViewerStatus) {
    return;
  }

  fairyViewerImage.src = src;
  fairyViewerImage.alt = alt;
  fairyViewerName.textContent = name;
  if (fairyViewerQuote) {
    fairyViewerQuote.textContent = quote;
    fairyViewerQuote.hidden = !quote;
  }
  fairyViewerStatus.textContent = status;
  fairyViewer.dataset.viewerType = type;
  fairyViewer.dataset.viewerFlower = flower;
  const flowerDetail = flowerCatalog[flower];
  if (flowerDetail) {
    fairyViewerCard?.style.setProperty("--viewer-flower-color", flowerDetail.flowerColor);
    fairyViewerCard?.style.setProperty("--viewer-flower-accent", flowerDetail.accentColor);
  } else {
    fairyViewerCard?.style.removeProperty("--viewer-flower-color");
    fairyViewerCard?.style.removeProperty("--viewer-flower-accent");
  }
  const bookBackground = background || (type === "title-book" ? getFairyBookBackground(flower) : "");
  if (bookBackground) {
    fairyViewerCard?.style.setProperty("--viewer-book-bg", `url("${bookBackground}")`);
  } else {
    fairyViewerCard?.style.removeProperty("--viewer-book-bg");
  }
  fairyViewerCard?.classList.toggle("is-special-companion", type === "special");
  fairyViewerCard?.classList.toggle("is-medal-viewer", type === "medal");
  fairyViewerCard?.classList.toggle("is-title-book-viewer", type === "title-book");
  fairyViewer.hidden = false;
  document.body.classList.add("is-fairy-viewer-open");
};

const closeFairyViewer = () => {
  if (!fairyViewer) {
    return;
  }

  fairyViewer.hidden = true;
  fairyViewer.dataset.viewerType = "";
  fairyViewer.dataset.viewerFlower = "";
  fairyViewerCard?.classList.remove("is-special-companion", "is-medal-viewer", "is-title-book-viewer");
  fairyViewerCard?.style.removeProperty("--viewer-flower-color");
  fairyViewerCard?.style.removeProperty("--viewer-flower-accent");
  fairyViewerCard?.style.removeProperty("--viewer-book-bg");
  document.body.classList.remove("is-fairy-viewer-open");
};

const getTitleBookDetail = (title, achievementResult) => {
  const participationCycle = achievementResult.participation?.achievedCycles
    ?.find((cycle) => cycle.rewards?.title?.id === title.id);

  if (participationCycle) {
    return {
      flower: participationCycle.flower,
      flowerName: participationCycle.flowerName,
      fairyName: participationCycle.fairyName,
      fairyAsset: participationCycle.fairyAsset,
      condition: `参加スタンプ ${participationCycle.requiredCount}回`,
      message: `${participationCycle.flowerName}の花畑で出会いました。`,
    };
  }

  for (const teacher of achievementResult.teacherFairy?.teachers ?? []) {
    const cycle = teacher.cycles?.find((teacherCycle) => teacherCycle.rewards?.title?.id === title.id);
    if (cycle) {
      return {
        flower: cycle.flower,
        flowerName: cycle.flowerName,
        fairyName: cycle.fairyName,
        fairyAsset: cycle.fairyAsset,
        condition: `${teacher.teacherName} / ${cycle.cycleName}`,
        message: `${cycle.flowerName}の花畑で出会いました。`,
      };
    }
  }

  const latestFairy = achievementResult.earnedFairies?.at(-1);
  return {
    flower: latestFairy?.flower ?? "cosmos",
    flowerName: latestFairy?.flowerName ?? "花",
    fairyName: latestFairy?.name ?? "書庫の妖精",
    fairyAsset: latestFairy?.fairyAsset ?? "fairy-apollon-flower-style.png",
    condition: "旅の記録から収蔵",
    message: "集めた記録が、図鑑の本になりました。",
  };
};

const openTitleBookViewer = (title, achievementResult) => {
  const detail = getTitleBookDetail(title, achievementResult);

  openFairyViewer({
    src: getAssetPath(detail.fairyAsset),
    alt: detail.fairyName,
    name: title.name,
    status: `${detail.flowerName}の図鑑 / ${detail.condition}`,
    quote: detail.message,
    type: "title-book",
    flower: detail.flower,
    background: getFairyBookBackground(detail.flower),
  });
};

const getMedalViewerDetail = (medal, achievementResult) => {
  const participationCycle = achievementResult.participation?.achievedCycles
    ?.find((cycle) => cycle.rewards?.medal?.id === medal.id);

  if (participationCycle) {
    return {
      condition: `参加スタンプ ${participationCycle.requiredCount}回`,
      message: `${participationCycle.flowerName}が満開になった記念です。`,
    };
  }

  const circleMilestone = achievementResult.teacherCircle?.achievedMilestones
    ?.find((milestone) => milestone.earnedMedal?.id === medal.id);

  if (circleMilestone) {
    return {
      condition: `先生の輪 ${circleMilestone.requiredRounds}巡達成`,
      message: `${circleMilestone.requiredRounds}巡分の歩みが、勲章になりました。`,
    };
  }

  return {
    condition: "達成記録から収蔵",
    message: "ここまで歩いた証です。",
  };
};

const openLibraryOwlViewer = () => {
  if (!libraryOwl) {
    return;
  }

  const speech = librarySpeech?.textContent?.replace(/[「」]/g, "") ?? "";
  openFairyViewer({
    src: libraryOwl.getAttribute("src") ?? "assets/special-companion-owl-a.png",
    alt: libraryOwl.alt || "フクロウの書庫番",
    name: libraryOwl.alt || "フクロウの書庫番",
    status: libraryGuide?.textContent ?? "書庫の見守り役",
    quote: speech,
    type: "special",
  });
};

const syncProfileToggleButton = (button, target) => {
  const isCollapsed = target.classList.contains("is-collapsed");
  button.textContent = isCollapsed ? "開く" : "閉じる";
  button.setAttribute("aria-expanded", String(!isCollapsed));
};

const toggleProfileSection = (button) => {
  const target = document.querySelector(`[data-profile-collapsible="${button.dataset.profileToggle}"]`);

  if (!target) {
    return;
  }

  target.classList.toggle("is-collapsed");
  syncProfileToggleButton(button, target);
};

const syncProfileToggleButtons = () => {
  for (const button of profileToggleButtons) {
    const target = document.querySelector(`[data-profile-collapsible="${button.dataset.profileToggle}"]`);

    if (target) {
      syncProfileToggleButton(button, target);
    }
  }
};

const syncLibraryTitleToggle = () => {
  if (!libraryTitleToggle || !libraryTitleList) {
    return;
  }

  const isCollapsed = libraryTitleList.classList.contains("is-collapsed");
  libraryTitleToggle.textContent = isCollapsed ? "開く" : "閉じる";
  libraryTitleToggle.setAttribute("aria-expanded", String(!isCollapsed));
  libraryTitleArtToggle?.setAttribute("aria-expanded", String(!isCollapsed));
  libraryTitleArtToggle?.setAttribute("aria-label", isCollapsed ? "称号の書架を開く" : "称号の書架を閉じる");
};

const toggleLibraryTitleList = () => {
  if (!libraryTitleList) {
    return;
  }

  libraryTitleList.classList.toggle("is-collapsed");
  syncLibraryTitleToggle();
};

const syncLibraryMedalToggle = () => {
  if (!libraryMedalToggle || !libraryMedalList) {
    return;
  }

  const isCollapsed = libraryMedalList.classList.contains("is-collapsed");
  libraryMedalToggle.textContent = isCollapsed ? "開く" : "閉じる";
  libraryMedalToggle.setAttribute("aria-expanded", String(!isCollapsed));
  libraryMedalArtToggle?.setAttribute("aria-expanded", String(!isCollapsed));
  libraryMedalArtToggle?.setAttribute("aria-label", isCollapsed ? "勲章の棚を開く" : "勲章の棚を閉じる");
};

const toggleLibraryMedalList = () => {
  if (!libraryMedalList) {
    return;
  }

  libraryMedalList.classList.toggle("is-collapsed");
  syncLibraryMedalToggle();
};

const syncLibraryJournalToggle = () => {
  if (!libraryJournalToggle || !libraryJournalRecords) {
    return;
  }

  const isCollapsed = libraryJournalRecords.classList.contains("is-collapsed");
  libraryJournalToggle.setAttribute("aria-expanded", String(!isCollapsed));
  libraryJournalToggle.setAttribute("aria-label", isCollapsed ? "冒険日誌を開く" : "冒険日誌を閉じる");
};

const toggleLibraryJournal = () => {
  if (!libraryJournalRecords) {
    return;
  }

  libraryJournalRecords.classList.toggle("is-collapsed");
  libraryJournalPrompt?.closest(".library-journal-prompt")?.classList.toggle("is-collapsed");
  syncLibraryJournalToggle();
};

const createProfileFairyItem = ({ src, alt, nameText, statusText, quoteText = "", categoryText, cycleNames = [], cycleFairies = [] }) => {
  const item = document.createElement("button");
  item.type = "button";
  item.className = "profile-fairy-item";
  item.setAttribute("aria-label", `${nameText}を大きく見る`);

  const image = document.createElement("img");
  image.src = src;
  image.alt = alt;

  const copy = document.createElement("div");
  copy.className = "profile-fairy-copy";

  const name = document.createElement("strong");
  name.textContent = nameText;
  copy.append(name);

  if (categoryText) {
    const category = document.createElement("span");
    category.className = "profile-fairy-meta";
    category.textContent = categoryText;
    copy.append(category);
  }

  if (cycleNames.length > 0) {
    const cycles = document.createElement("div");
    cycles.className = "profile-fairy-cycles";

    const cyclesLabel = document.createElement("span");
    cyclesLabel.className = "profile-fairy-cycles-label";
    cyclesLabel.textContent = "咲いた花";
    cycles.append(cyclesLabel);

    for (const cycleName of cycleNames) {
      const cycle = document.createElement("span");
      cycle.className = "profile-fairy-cycle";
      cycle.textContent = `🌸 ${cycleName}`;
      cycles.append(cycle);
    }

    copy.append(cycles);
  }

  if (cycleFairies.length > 1) {
    const fairyLine = document.createElement("div");
    fairyLine.className = "profile-fairy-cycle-images";

    for (const cycleFairy of cycleFairies) {
      const thumb = document.createElement("img");
      thumb.src = cycleFairy.src;
      thumb.alt = cycleFairy.alt;
      thumb.title = `${cycleFairy.cycleName}の妖精を見る`;
      thumb.dataset.fairyCycleThumb = "";
      thumb.dataset.viewerSrc = cycleFairy.src;
      thumb.dataset.viewerAlt = cycleFairy.alt;
      thumb.dataset.viewerName = cycleFairy.alt;
      thumb.dataset.viewerStatus = `${categoryText ? `${categoryText} / ` : ""}${cycleFairy.cycleName} 達成済み`;
      thumb.dataset.viewerQuote = cycleFairy.quote ?? quoteText;
      fairyLine.append(thumb);
    }

    copy.append(fairyLine);
  }

  if (cycleNames.length === 0) {
    const status = document.createElement("span");
    status.className = "profile-fairy-meta";
    status.textContent = statusText;
    copy.append(status);
  }

  item.append(image, copy);
  item.addEventListener("click", (event) => {
    const thumb = event.target.closest("[data-fairy-cycle-thumb]");

    if (thumb) {
      openFairyViewer({
        src: thumb.dataset.viewerSrc,
        alt: thumb.dataset.viewerAlt,
        name: thumb.dataset.viewerName,
        status: thumb.dataset.viewerStatus,
        quote: thumb.dataset.viewerQuote,
      });
      return;
    }

    openFairyViewer({ src, alt, name: nameText, status: statusText, quote: quoteText });
  });

  return item;
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
    const cycleProgress = getCompletedTeacherCycleProgress(teacher);
    const fairy = getAchievementFairy(teacher, cycleProgress);
    const cycleName = cycleProgress.cycleName ?? `${cycleProgress.cycleNumber}巡目`;
    const statusText = `${teacher.name} 指導碁スタンプ / 咲いた花: ${cycleName}`;

    profileFairyList.append(createProfileFairyItem({
      src: fairy.src,
      alt: fairy.label,
      nameText: fairy.label,
      statusText,
      quoteText: fairy.quote,
      categoryText: `${teacher.name} / 指導碁スタンプ`,
      cycleNames: [cycleName],
      cycleFairies: [{ src: fairy.src, alt: fairy.label, cycleName, quote: fairy.quote }],
    }));
  }
};

const getFairyProfileGroupKey = (earnedFairy) => {
  if (earnedFairy.teacherId) {
    return `teacher:${earnedFairy.teacherId}`;
  }

  if (earnedFairy.teacherName === "参加スタンプ" || earnedFairy.teacherId === null) {
    return "participation";
  }

  return earnedFairy.id ?? earnedFairy.name;
};

const getFairyProfileCycleName = (earnedFairy) =>
  earnedFairy.cycleName ?? (earnedFairy.cycleNumber ? `${earnedFairy.cycleNumber}巡目` : "1巡目");

const getFairyProfileCategoryText = (earnedFairy) => {
  if (earnedFairy.teacherId) {
    return `${earnedFairy.teacherName} / 指導碁スタンプ`;
  }

  if (earnedFairy.teacherName === "参加スタンプ" || earnedFairy.teacherId === null) {
    return "参加スタンプ";
  }

  return earnedFairy.teacherName ?? "獲得記録";
};

const groupEarnedFairiesForProfile = (earnedFairies) => {
  const groups = new Map();

  for (const earnedFairy of earnedFairies) {
    const key = getFairyProfileGroupKey(earnedFairy);
    const cycleNumber = earnedFairy.cycleNumber ?? 1;
    const cycleName = getFairyProfileCycleName(earnedFairy);
    const group = groups.get(key) ?? {
      representative: earnedFairy,
      categoryText: getFairyProfileCategoryText(earnedFairy),
      cycles: new Map(),
    };

    if ((group.representative.cycleNumber ?? 1) > cycleNumber) {
      group.representative = earnedFairy;
    }

    if (!group.cycles.has(cycleNumber)) {
      const teacher = earnedFairy.teacherId ? teacherDetails[earnedFairy.teacherId] : null;
      const fairy = getFairyDisplayData(earnedFairy, teacher);
      group.cycles.set(cycleNumber, {
        cycleName,
        src: fairy.src,
        alt: fairy.label,
        quote: fairy.quote,
      });
    }

    groups.set(key, group);
  }

  return [...groups.values()].map((group) => {
    const cycleFairies = [...group.cycles.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, cycle]) => cycle);

    return {
      ...group,
      cycleFairies,
      cycleNames: cycleFairies.map((cycle) => cycle.cycleName),
    };
  });
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

  const fairyGroups = groupEarnedFairiesForProfile(achievementResult.earnedFairies);

  for (const group of fairyGroups) {
    const earnedFairy = group.representative;
    const teacher = earnedFairy.teacherId ? teacherDetails[earnedFairy.teacherId] : null;
    const fairy = getFairyDisplayData(earnedFairy, teacher);
    const cycleText = group.cycleNames.join(" / ");
    const statusText = `${group.categoryText} / 咲いた花: ${cycleText}`;

    profileFairyList.append(createProfileFairyItem({
      src: fairy.src,
      alt: fairy.label,
      nameText: fairy.label,
      statusText,
      quoteText: fairy.quote,
      categoryText: group.categoryText,
      cycleNames: group.cycleNames,
      cycleFairies: group.cycleFairies,
    }));
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
    const item = document.createElement("button");
    item.type = "button";
    item.className = "profile-special-companion-item";
    item.setAttribute("aria-label", `${companion.name}を大きく見る`);

    const image = document.createElement("img");
    image.src = `assets/${companion.asset}`;
    image.alt = companion.name;

    const copy = document.createElement("div");
    const name = document.createElement("strong");
    const status = document.createElement("small");

    name.textContent = companion.name;
    status.textContent = companion.description;

    copy.append(name, status);
    item.append(image, copy);
    item.addEventListener("click", () => {
      openFairyViewer({
        src: `assets/${companion.asset}`,
        alt: companion.name,
        name: companion.name,
        status: companion.description,
        quote: companionQuoteById[companion.id] ?? "今日の記録も、旅の宝物だよ。",
        type: "special",
      });
    });
    profileSpecialCompanionList.append(item);
  }
};

const renderLibraryCollection = (list, items, emptyMessage, kind, achievementResult) => {
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
    const isInteractiveItem = kind === "title" || kind === "medal";
    const entry = document.createElement(isInteractiveItem ? "button" : "article");
    entry.className = `library-collection-item is-${kind}`;
    if (isInteractiveItem) {
      entry.type = "button";
      entry.setAttribute("aria-label", kind === "title" ? `${item.name}の図鑑を開く` : `${item.name}を大きく見る`);
    }
    if (kind === "medal") {
      entry.classList.add(`is-${item.id.replaceAll("_", "-")}`);
    }
    const medalAsset = kind === "medal" ? getMedalAsset(item.id) : null;
    const mark = document.createElement(medalAsset ? "img" : "span");
    const copy = document.createElement("div");
    const name = document.createElement("strong");
    const status = document.createElement("small");
    if (medalAsset) {
      mark.className = "library-medal-image";
      mark.src = medalAsset;
      mark.alt = "";
    } else {
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = kind === "medal" ? "勲" : "称";
    }
    name.textContent = item.name;
    status.textContent = kind === "medal" ? "勲章棚に収蔵" : "称号の書架に収蔵";
    copy.append(name, status);
    entry.append(mark, copy);
    if (kind === "title") {
      entry.addEventListener("click", () => {
        entry.classList.add("is-opening-book");
        window.setTimeout(() => entry.classList.remove("is-opening-book"), 420);
        window.setTimeout(() => openTitleBookViewer(item, achievementResult), 150);
      });
    }
    if (kind === "medal" && medalAsset) {
      entry.addEventListener("click", () => {
        const medalDetail = getMedalViewerDetail(item, achievementResult);
        openFairyViewer({
          src: medalAsset,
          alt: item.name,
          name: item.name,
          status: medalDetail.condition,
          quote: medalDetail.message,
          type: "medal",
        });
      });
    }
    list.append(entry);
  }

  if (kind === "medal" && items.length % 2 === 1) {
    const emptyCase = document.createElement("article");
    emptyCase.className = "library-collection-item is-medal is-empty-case";
    emptyCase.setAttribute("aria-hidden", "true");
    const mark = document.createElement("span");
    const copy = document.createElement("div");
    const label = document.createElement("strong");
    const status = document.createElement("small");
    label.textContent = "次の展示を準備中";
    status.textContent = "空の展示スペース";
    copy.append(label, status);
    emptyCase.append(mark, copy);
    list.append(emptyCase);
  }
};

const getAdventureJournalRecords = (achievementResult) => {
  const records = [];
  const latestFairy = achievementResult.earnedFairies?.at(-1);
  const latestMedal = achievementResult.earnedMedals?.at(-1);
  const latestTitle = achievementResult.earnedTitles?.at(-1);
  const latestCompanion = achievementResult.earnedCompanions?.at(-1);

  if (latestFairy) {
    records.push(`🌸 ${latestFairy.flowerName ?? "花"}の妖精と出会いました`);
  }
  if (latestMedal) {
    records.push(`🏅 ${latestMedal.name}を収めました`);
  }
  if (latestTitle) {
    records.push(`📖 ${latestTitle.name}の本が増えました`);
  }
  if (latestCompanion) {
    records.push(`🦊 ${latestCompanion.name}が仲間になりました`);
  }
  if (gameRecords.length > 0) {
    records.push(`⚫ 対局記録が${gameRecords.length}局になりました`);
  }

  if (records.length === 0) {
    records.push("最初の記録を準備しています");
  }

  return records.slice(0, 4);
};

const renderAdventureJournalPreview = (achievementResult) => {
  if (!libraryJournalRecords || !libraryJournalPages || !libraryJournalPrompt) {
    return;
  }

  const records = getAdventureJournalRecords(achievementResult);
  const pageCount = Math.max(
    1,
    Math.min(
      99,
      achievementResult.earnedFairies.length
        + achievementResult.earnedMedals.length
        + achievementResult.earnedTitles.length
        + (achievementResult.earnedCompanions?.length ?? 0)
        + gameRecords.length
    )
  );

  libraryJournalRecords.textContent = "";
  for (const record of records) {
    const item = document.createElement("li");
    item.textContent = record;
    libraryJournalRecords.append(item);
  }

  libraryJournalPages.textContent = `${pageCount}頁`;
  libraryJournalPrompt.textContent = pageCount > 1
    ? "今日の思い出、しまっておく？"
    : "最初の思い出、しまっておく？";
};

const setJournalPrompt = (message) => {
  if (libraryJournalPrompt) {
    libraryJournalPrompt.textContent = message;
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
  const totalFlowerAchievements = achievementResult.earnedFairies.length;
  const totalStampCount = getTotalStampCount();

  libraryCurrentTitle.textContent = latestTitle?.name ?? "まだ称号はありません";
  librarySummary.textContent = `称号 ${titles.length}冊・勲章 ${medals.length}点`;
  libraryTitleCount.textContent = `${titles.length}冊`;
  libraryMedalCount.textContent = `${medals.length}点`;

  libraryOwl.src = hasWiseOwl
    ? "assets/special-companion-owl-b.png"
    : "assets/special-companion-owl-a.png";
  libraryOwl.alt = hasWiseOwl ? "達成を知る賢者" : "知恵の見守り役";
  libraryOwlViewerButton?.setAttribute("aria-label", `${libraryOwl.alt}を大きく見る`);
  libraryGuide.textContent = hasWiseOwl
    ? "達成を知る賢者が、積み重ねた旅の証を見守っています。"
    : "知恵の見守り役が、旅の記録を大切に収めています。";

  librarySpeech.textContent = totalFlowerAchievements >= 18
    ? "「見事な記録です」"
    : achievementResult.teacherCircle.currentRounds >= 1
      ? "「よく学びましたね」"
      : medals.length >= 3
        ? "「証を収めました」"
        : totalFlowerAchievements >= 2
          ? "「花が集まりました」"
          : titles.length >= 1
            ? "「書が増えました」"
            : totalStampCount >= 1
              ? "「一頁目です」"
              : "「ようこそ書庫へ。」";

  renderLibraryCollection(libraryTitleList, titles, "まだ収められた称号はありません", "title", achievementResult);
  renderLibraryCollection(libraryMedalList, medals, "まだ収められた勲章はありません", "medal", achievementResult);
  renderAdventureJournalPreview(achievementResult);

  libraryAchievementList.textContent = "";
  for (const record of [
    { label: "花図鑑", value: `${totalFlowerAchievements}/18`, mark: "花", tone: "flower" },
    { label: "先生の輪", value: `${achievementResult.teacherCircle.currentRounds}巡`, mark: "輪", tone: "medal" },
    { label: "特別な仲間", value: `${companions.length}/4`, mark: "仲", tone: "companion" },
    { label: "対局記録", value: `${gameRecords.length}局`, mark: "棋", tone: "record" },
  ]) {
    const row = document.createElement("article");
    row.className = `is-${record.tone}`;
    const mark = document.createElement("i");
    const label = document.createElement("span");
    const value = document.createElement("strong");
    mark.setAttribute("aria-hidden", "true");
    label.textContent = record.label;
    value.textContent = record.value;
    row.append(mark, label, value);
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
    const medalAsset = reward.mark === "勲章" ? getMedalAsset(reward.id) : null;
    badge.className = "badge-chip is-active";
    if (medalAsset) {
      const image = document.createElement("img");
      image.className = "badge-reward-icon";
      image.src = medalAsset;
      image.alt = "";
      badge.append(image);
    }
    badge.append(`${reward.mark}: ${reward.name}`);
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

  const header = document.createElement("div");
  header.className = "profile-section-header";

  const heading = document.createElement("p");
  heading.textContent = "達成判定結果";

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.className = "profile-toggle-button";
  toggleButton.dataset.profileToggle = "achievements";
  toggleButton.setAttribute("aria-expanded", "false");
  toggleButton.setAttribute("aria-controls", "profile-achievement-list");
  toggleButton.textContent = "開く";
  toggleButton.addEventListener("click", () => toggleProfileSection(toggleButton));

  const list = document.createElement("div");
  list.className = "profile-achievement-list is-collapsed";
  list.id = "profile-achievement-list";
  list.dataset.profileAchievementList = "";
  list.dataset.profileCollapsible = "achievements";

  header.append(heading, toggleButton);
  section.append(header, list);
  (profileSpecialCompanions ?? profileFairies).after(section);
  syncProfileToggleButton(toggleButton, list);

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

const getNextAdventure = () => {
  const candidates = [];
  const participationCurrent = normalizeProgressCount(userProgress.stamps.participationCount);
  const participationGoal = getParticipationGoal();

  if (participationCurrent < getParticipationMaxCount()) {
    const cycleIndex = Math.floor(participationCurrent / participationGoal);
    const cycle = participationFlowerCycles[cycleIndex];
    const targetCount = (cycleIndex + 1) * participationGoal;
    const remaining = targetCount - participationCurrent;

    candidates.push({
      type: "participation",
      priority: 2,
      remaining,
      title: `あと${remaining}回で${cycle.flowerName}満開`,
      copy: `参加${targetCount}回で${cycle.fairyName}と出会えます。`,
    });
  }

  for (const [teacherId, teacher] of Object.entries(teacherDetails)) {
    if (teacher.stampCount >= getTeacherMaxCount(teacher)) {
      continue;
    }

    const cycleProgress = getCurrentTeacherCycleProgress(teacher);
    const remaining = getTeacherGoal(teacher) - cycleProgress.countInCycle;

    candidates.push({
      type: "teacher",
      teacherId,
      priority: 1,
      remaining,
      title: `あと${remaining}回で${cycleProgress.cycle.fairyName}`,
      copy: `${teacher.name}との指導碁で${cycleProgress.cycle.cycleName}を達成できます。`,
    });
  }

  const currentCircleRounds = getTeacherCircleRoundsFromCounts(userProgress.stamps.teacherLessonCounts);
  const nextCircleMilestone = (teacherCircleRule.medalMilestones ?? [])
    .map((milestone) => milestone.rounds)
    .find((rounds) => rounds > currentCircleRounds);

  if (nextCircleMilestone) {
    const remaining = Object.keys(teacherDetails).reduce(
      (total, teacherId) => total + Math.max(0, nextCircleMilestone - normalizeProgressCount(userProgress.stamps.teacherLessonCounts[teacherId])),
      0
    );

    candidates.push({
      type: "circle",
      priority: 0,
      remaining,
      title: `あと${remaining}局で先生の輪 ${nextCircleMilestone}巡`,
      copy: `先生5人との記録をそろえると、新しい勲章と称号が開きます。`,
    });
  }

  return candidates.sort((a, b) => a.remaining - b.remaining || a.priority - b.priority)[0] ?? null;
};

const updateNextAdventureGuide = (nextAdventure) => {
  if (!nextAdventureGuide || !nextAdventureGuideImage || !nextAdventureGuideSpeech) {
    return;
  }

  const latestFairy = userProgress.earned.fairies.at(-1) ?? null;
  const guideAsset = latestFairy?.fairyAsset ?? "fairy-apollon-guide.png";
  const speeches = {
    participation: "次の花へ行こう",
    teacher: "先生に会いに行こう",
    circle: "輪をつなぎに行こう",
    complete: "旅を振り返ろう",
  };

  nextAdventureGuide.dataset.guideFairyId = latestFairy?.id ?? "first-guide";
  nextAdventureGuideImage.src = `assets/${guideAsset}`;
  nextAdventureGuideSpeech.textContent = speeches[nextAdventure?.type ?? "complete"];
};

const updateNextAdventure = () => {
  if (!nextAdventureButton || !nextAdventureTitle || !nextAdventureCopy) {
    return;
  }

  const nextAdventure = getNextAdventure();

  if (!nextAdventure) {
    nextAdventureButton.dataset.adventureType = "complete";
    delete nextAdventureButton.dataset.nextAdventureTeacher;
    nextAdventureTitle.textContent = "すべての冒険目標を達成";
    nextAdventureCopy.textContent = "花図鑑とフクロウの書庫で、旅の記録を振り返れます。";
    updateNextAdventureGuide(null);
    return;
  }

  nextAdventureButton.dataset.adventureType = nextAdventure.type;
  if (nextAdventure.teacherId) {
    nextAdventureButton.dataset.nextAdventureTeacher = nextAdventure.teacherId;
  } else {
    delete nextAdventureButton.dataset.nextAdventureTeacher;
  }
  nextAdventureTitle.textContent = nextAdventure.title;
  nextAdventureCopy.textContent = nextAdventure.copy;
  updateNextAdventureGuide(nextAdventure);
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
  const latestMedalAsset = getMedalAsset(latestMedal?.id);
  profileMedal.textContent = latestMedal?.name ?? "まだ勲章なし";
  profileMedalIcon.hidden = !latestMedalAsset;
  if (latestMedalAsset) {
    profileMedalIcon.src = latestMedalAsset;
    profileMedalIcon.alt = latestMedal.name;
  }

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
  updateNextAdventure();
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
  renderAdminHistory();
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
      completeTeacherButton.textContent = "3. 運営確認へ進み妖精スタンプを開く";
      flowMessage.textContent = "巡の最後の1回です。運営認証後、この1件だけを保存して妖精を表示します。";
      return;
    }

    confirmLabel.textContent = "保存する対局記録";
    updateGameRecordConfirmation();
    completeTeacherButton.textContent = "3. 運営確認へ進みスタンプを押す";
    flowMessage.textContent = "対局記録を確認してください。次の運営認証が通った時だけ保存します。";
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
  updateCurrentFlowerCard(teacher, cycleProgress);
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
  appendOperationHistory({
    type: "teacher_stamp",
    target: `${teacher.name} 指導碁スタンプ`,
    before: previousStampCount,
    after: teacher.stampCount,
  });

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

const openTeacherDetailFromCard = (card) => {
  if (!card) {
    return;
  }

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
  teacherDetail.scrollIntoView({ behavior: "smooth", block: "start" });
};

const showFlowerGuideArrival = (targetElement, message) => {
  if (!targetElement) {
    return;
  }

  targetElement.dataset.flowerGuideArrival = message;
  targetElement.classList.remove("is-flower-guide-arrival");
  targetElement.offsetHeight;
  targetElement.classList.add("is-flower-guide-arrival");
  window.setTimeout(() => {
    targetElement.classList.remove("is-flower-guide-arrival");
    delete targetElement.dataset.flowerGuideArrival;
  }, 2600);
};

for (const card of teacherCards) {
  card.addEventListener("click", () => {
    openTeacherDetailFromCard(card);
  });
}

for (const flowerCard of flowerGuideCards) {
  flowerCard.addEventListener("click", () => {
    const target = flowerCard.dataset.flowerGuideTarget;
    const flowerName = flowerCard.querySelector(".flower-guide-name")?.textContent ?? "花";
    const flowerMeta = flowerCard.querySelector(".flower-guide-meta")?.textContent ?? "";

    if (target === "participation") {
      participationStamp?.scrollIntoView({ behavior: "smooth", block: "center" });
      participationStampButton?.focus({ preventScroll: true });
      showFlowerGuideArrival(participationStamp, `${flowerName}の参加スタンプです`);
      return;
    }

    openTeacherDetailFromCard(document.querySelector(`.teacher-card[data-teacher="${target}"]`));
    showFlowerGuideArrival(teacherDetail, `${flowerName}は${flowerMeta}の1巡目の花です`);
  });
}

backToList.addEventListener("click", showTeacherList);

for (const closeButton of achievementCloseButtons) {
  closeButton.addEventListener("click", () => {
    fairyAchievement.hidden = true;
  });
}

for (const closeButton of fairyViewerCloseButtons) {
  closeButton.addEventListener("click", closeFairyViewer);
}

for (const button of profileToggleButtons) {
  button.addEventListener("click", () => toggleProfileSection(button));
}

syncProfileToggleButtons();

libraryTitleToggle?.addEventListener("click", toggleLibraryTitleList);
libraryTitleArtToggle?.addEventListener("click", toggleLibraryTitleList);
syncLibraryTitleToggle();
libraryMedalToggle?.addEventListener("click", toggleLibraryMedalList);
libraryMedalArtToggle?.addEventListener("click", toggleLibraryMedalList);
syncLibraryMedalToggle();
libraryOwlViewerButton?.addEventListener("click", openLibraryOwlViewer);
libraryJournalToggle?.addEventListener("click", toggleLibraryJournal);
syncLibraryJournalToggle();
libraryJournalSkip?.addEventListener("click", () => setJournalPrompt("わかった。今日もちゃんとしまっておくね。"));
libraryJournalNote?.addEventListener("click", () => setJournalPrompt("ひとことだけでも、ちゃんと宝物だよ。"));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && fairyViewer && !fairyViewer.hidden) {
    closeFairyViewer();
  }
});

achievementProfileButton.addEventListener("click", () => {
  fairyAchievement.hidden = true;
  updateProfileCard();
  showPanel("profile");
});

nextAdventureButton.addEventListener("click", () => {
  if (nextAdventureButton.dataset.adventureType === "complete") {
    showPanel("titles");
    return;
  }

  showPanel("field-guide");
  showTeacherList();

  if (nextAdventureButton.dataset.nextAdventureTeacher) {
    document.querySelector(`.teacher-card[data-teacher="${nextAdventureButton.dataset.nextAdventureTeacher}"]`)?.click();
  }
});

adminPasscodeButton.addEventListener("click", unlockAdminPanel);

adminPasscodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    unlockAdminPanel();
  }
});

operatorAuthConfirm.addEventListener("click", confirmOperatorAction);

operatorAuthInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    confirmOperatorAction();
  }
});

for (const cancelButton of operatorAuthCancelButtons) {
  cancelButton.addEventListener("click", closeOperatorAuth);
}

for (const input of [gameRecordDate, gameRecordHandicap, gameRecordResult]) {
  input.addEventListener("input", updateGameRecordConfirmation);
  input.addEventListener("change", updateGameRecordConfirmation);
}

participationStampButton.addEventListener("click", () => {
  const before = normalizeProgressCount(userProgress.stamps.participationCount);
  const after = Math.min(getParticipationMaxCount(), before + 1);

  openOperatorAuth({
    title: "参加スタンプを押印",
    summary: `参加スタンプを ${before}回 → ${after}回 にします。`,
    action: () => {
      addParticipationStamp();
      appendOperationHistory({ type: "participation_stamp", target: "参加スタンプ", before, after });
      syncAdminDraftFromProgress();
      updateParticipationStampCard();
      updateProfileCard();
      updateAdminPanel();
    },
  });
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
    const teacherKey = activeTeacherKey;
    const draft = getGameRecordDraft();
    const nextCount = Math.min(getTeacherMaxCount(teacher), teacher.stampCount + 1);
    openOperatorAuth({
      title: `${teacher.name}の指導碁を押印`,
      summary: `${draft.date}・${draft.handicap}・${draft.result}／スタンプ ${teacher.stampCount}回 → ${nextCount}回`,
      action: () => completeTeacherStamp(teacherKey),
    });
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
  const changes = getAdminDraftChanges();
  applyAdminDraftToProgress();
  for (const change of changes) {
    appendOperationHistory({
      type: change.after < change.before ? "decrement" : "admin_adjustment",
      ...change,
    });
  }
  updateParticipationStampCard();
  renderTeacherDetail(activeTeacherKey);
  updateTeacherCards();
  updateRoundProgress();
  updateProfileCard();
  updateAdminPanel();
  adminNote.textContent = "変更を保存しました。冒険者カード、花図鑑、妖精、勲章、称号を再計算しました。";
  lockAdminPanel();
  adminPasscodeMessage.textContent = "変更を保存し、自動で再ロックしました。";
});

adminBackupSaveButton.addEventListener("click", () => {
  downloadBackupData(createBackupData());
  adminBackupMessage.textContent = isAdminDraftDirty
    ? "保存済みの記録をバックアップしました。未確定の調整は含まれません。"
    : "バックアップを端末へ保存しました。";
});

adminBackupSelectButton.addEventListener("click", () => {
  adminBackupFileInput.value = "";
  adminBackupFileInput.click();
});

adminBackupFileInput.addEventListener("change", async () => {
  const file = adminBackupFileInput.files?.[0];

  if (!file) {
    return;
  }

  pendingRestoreBackup = null;
  adminRestoreConfirm.hidden = true;

  if (file.size > 1024 * 1024) {
    adminBackupMessage.textContent = "ファイルが大きすぎます。水曜会のバックアップを選んでください。";
    adminBackupFileInput.value = "";
    return;
  }

  try {
    const parsed = JSON.parse(await file.text());
    pendingRestoreBackup = validateBackupData(parsed);
    showRestoreSummary(pendingRestoreBackup);
    adminBackupMessage.textContent = "内容を確認し、「復元」と入力してください。まだ上書きされていません。";
  } catch (error) {
    adminBackupMessage.textContent = error instanceof Error
      ? error.message
      : "バックアップを読み取れませんでした。";
    adminBackupFileInput.value = "";
  }
});

adminRestoreInput.addEventListener("input", () => {
  adminRestoreConfirmButton.disabled = adminRestoreInput.value !== "復元";
});

adminRestoreCancel.addEventListener("click", () => {
  closeRestoreConfirmation();
  adminBackupMessage.textContent = "復元は実行されませんでした。";
});

adminRestoreConfirmButton.addEventListener("click", () => {
  if (adminRestoreInput.value !== "復元" || !pendingRestoreBackup) {
    adminRestoreConfirmButton.disabled = true;
    return;
  }

  const restoreBackup = pendingRestoreBackup;
  const beforeRestoreTotal = getTotalStampCount();

  try {
    downloadBackupData(createBackupData(), "before-restore");
    userProgress = sanitizeProgress(restoreBackup.progress);
    operationHistory = restoreBackup.operationHistory.map(sanitizeOperationHistory).filter(Boolean).slice(-50);
    syncTeacherDetailsFromProgress();
    syncProgressRewards();
    saveUserProgress();
    appendOperationHistory({
      type: "restore",
      target: "バックアップ記録",
      before: beforeRestoreTotal,
      after: getTotalStampCount(),
    });
    syncAdminDraftFromProgress();
    updateParticipationStampCard();
    renderTeacherDetail(activeTeacherKey);
    updateTeacherCards();
    updateRoundProgress();
    updateProfileCard();
    updateAdminPanel();
    closeRestoreConfirmation();
    lockAdminPanel();
    adminPasscodeMessage.textContent = "バックアップを復元し、自動で再ロックしました。";
  } catch {
    adminBackupMessage.textContent = "復元前バックアップを保存できなかったため、復元を中止しました。";
  }
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

  const before = getTotalStampCount();
  adminResetConfirm.hidden = true;
  adminResetInput.value = "";
  adminResetConfirmButton.disabled = true;
  resetUserProgress();
  appendOperationHistory({ type: "reset", target: "すべてのスタンプ", before, after: 0 });
  syncAdminDraftFromProgress();
  updateParticipationStampCard();
  renderTeacherDetail(activeTeacherKey);
  updateTeacherCards();
  updateRoundProgress();
  updateProfileCard();
  updateAdminPanel();
  showPanel("admin");
  lockAdminPanel();
  adminPasscodeMessage.textContent = "記録をリセットし、自動で再ロックしました。";
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
