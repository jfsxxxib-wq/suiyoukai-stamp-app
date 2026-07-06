(() => {
try {
const tabs = document.querySelectorAll(".info-tab");
const panels = document.querySelectorAll(".panel-view");
const dock = document.querySelector(".info-dock");
const infoPanel = document.querySelector(".info-panel");
const infoTabs = document.querySelector(".info-tabs");
const closeButton = document.querySelector(".close-panel");
const guidebookButton = document.querySelector(".guidebook-button");
const adminTab = document.querySelector(".admin-tab");
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
const teacherEventFirstNote = document.querySelector("[data-teacher-event-first-note]");
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
const adventurerName = document.querySelector("[data-adventurer-name]");
const adventurerNameEdit = document.querySelector("[data-adventurer-name-edit]");
const adventurerNameForm = document.querySelector("[data-adventurer-name-form]");
const adventurerNameInput = document.querySelector("[data-adventurer-name-input]");
const adventurerNameMessage = document.querySelector("[data-adventurer-name-message]");
const adventurerNameHint = document.querySelector("[data-adventurer-name-hint]");
const adventurerReceptionCode = document.querySelector("[data-adventurer-reception-code]");
const browserStorageWarning = document.querySelector("[data-browser-storage-warning]");
const profileLatestStamp = document.querySelector("[data-profile-latest-stamp]");
const profileLatestStampCopy = document.querySelector("[data-profile-latest-stamp-copy]");
const profileLatestTeacherFlowers = document.querySelectorAll("[data-profile-latest-teacher-flower]");
const profileTodayParticipationMark = document.querySelector("[data-profile-today-participation-mark]");
const profileTodayGameRecords = document.querySelector("[data-profile-today-game-records]");
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
const libraryJournalState = document.querySelector("[data-library-journal-state]");
const libraryJournalPrompt = document.querySelector("[data-library-journal-prompt]");
const libraryJournalKeeperSpeech = document.querySelector("[data-library-journal-keeper-speech]");
const libraryJournalKeeperViewerButton = document.querySelector("[data-library-journal-keeper-viewer]");
const libraryJournalToggle = document.querySelector("[data-library-journal-toggle]");
const libraryJournalSkip = document.querySelector("[data-library-journal-skip]");
const libraryJournalNote = document.querySelector("[data-library-journal-note]");
const libraryJournalNoteForm = document.querySelector("[data-library-journal-note-form]");
const libraryJournalNoteInput = document.querySelector("[data-library-journal-note-input]");
const libraryJournalNoteSave = document.querySelector("[data-library-journal-note-save]");
const participationStamp = document.querySelector(".participation-stamp");
const participationFlower = document.querySelector(".participation-stamp .stamp-flower");
const participationFlowerName = document.querySelector("[data-participation-flower-name]");
const participationReceptionCode = document.querySelector("[data-participation-reception-code]");
const participationCount = document.querySelector("[data-participation-count]");
const participationStatus = document.querySelector("[data-participation-status]");
const participationStampButton = document.querySelector("[data-participation-stamp-button]");
const participationStampGuide = document.querySelector("[data-participation-stamp-guide]");
const participationStartSheet = document.querySelector("[data-participation-start-sheet]");
const participationStartCloseButtons = document.querySelectorAll("[data-participation-start-close]");
const participationStartFlower = document.querySelector("[data-participation-start-flower]");
const participationStartFlowerName = document.querySelector("[data-participation-start-flower-name]");
const participationStartReceptionCode = document.querySelector("[data-participation-start-reception-code]");
const participationStartCount = document.querySelector("[data-participation-start-count]");
const participationStartStatus = document.querySelector("[data-participation-start-status]");
const participationStartFormButton = document.querySelector("[data-participation-start-form]");
const participationStartGuide = document.querySelector("[data-participation-start-guide]");
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
const adminIdentityCode = document.querySelector("[data-admin-identity-code]");
const adminIdentityDisplayName = document.querySelector("[data-admin-identity-display-name]");
const adminIdentityRealName = document.querySelector("[data-admin-identity-real-name]");
const adminIdentityNote = document.querySelector("[data-admin-identity-note]");
const adminParticipantName = document.querySelector("[data-admin-participant-name]");
const adminTeacher = document.querySelector("[data-admin-teacher]");
const adminParticipation = document.querySelector("[data-admin-participation]");
const adminNote = document.querySelector("[data-admin-note]");
const adminResult = document.querySelector("[data-admin-result]");
const adminCombinedApply = document.querySelector("[data-admin-combined-apply]");
const adminDuplicateTeacherApply = document.querySelector("[data-admin-duplicate-teacher-apply]");
const adminCombinedMessage = document.querySelector("[data-admin-combined-message]");
const adminHistoryList = document.querySelector("[data-admin-history-list]");
const adminTroubleToggle = document.querySelector("[data-admin-trouble-toggle]");
const adminTroublePanel = document.querySelector("[data-admin-trouble-panel]");
const adminSettingsToggle = document.querySelector("[data-admin-settings-toggle]");
const adminSettingsPanel = document.querySelector("[data-admin-settings-panel]");
const adminBackupSaveButton = document.querySelector("[data-admin-backup-save]");
const adminBackupSelectButton = document.querySelector("[data-admin-backup-select]");
const adminBackupFileInput = document.querySelector("[data-admin-backup-file]");
const adminBackupMessage = document.querySelector("[data-admin-backup-message]");
const adminRestoreConfirm = document.querySelector("[data-admin-restore-confirm]");
const adminRestoreSummary = document.querySelector("[data-admin-restore-summary]");
const adminRestoreInput = document.querySelector("[data-admin-restore-input]");
const adminRestoreCancel = document.querySelector("[data-admin-restore-cancel]");
const adminRestoreConfirmButton = document.querySelector("[data-admin-restore-confirm-button]");
const adminParticipationDate = document.querySelector("[data-admin-participation-date]");
const adminParticipationName = document.querySelector("[data-admin-participation-name]");
const adminParticipationApply = document.querySelector("[data-admin-participation-apply]");
const adminParticipationMessage = document.querySelector("[data-admin-participation-message]");
const adminParticipationQrCreateButton = document.querySelector("[data-admin-participation-qr-create]");
const adminParticipationQr = document.querySelector("[data-admin-participation-qr]");
const adminParticipationQrImage = document.querySelector("[data-admin-participation-qr-image]");
const adminParticipationQrLink = document.querySelector("[data-admin-participation-qr-link]");
const adminParticipationQrMessage = document.querySelector("[data-admin-participation-qr-message]");
const adminGameRecordDateLabel = document.querySelector("[data-admin-game-record-date-label]");
const adminGameRecordTeacher = document.querySelector("[data-admin-game-record-teacher]");
const adminGameRecordDate = document.querySelector("[data-admin-game-record-date]");
const adminGameRecordHandicap = document.querySelector("[data-admin-game-record-handicap]");
const adminGameRecordResult = document.querySelector("[data-admin-game-record-result]");
const adminGameRecordApply = document.querySelector("[data-admin-game-record-apply]");
const adminGameRecordMessage = document.querySelector("[data-admin-game-record-message]");
const adminShowProfileButton = document.querySelector("[data-admin-show-profile]");
const adminUndoGameRecordButton = document.querySelector("[data-admin-undo-game-record]");
const adminStampQrCreateButton = document.querySelector("[data-admin-stamp-qr-create]");
const adminStampQr = document.querySelector("[data-admin-stamp-qr]");
const adminStampQrImage = document.querySelector("[data-admin-stamp-qr-image]");
const adminStampQrLink = document.querySelector("[data-admin-stamp-qr-link]");
const adminStampQrMessage = document.querySelector("[data-admin-stamp-qr-message]");
const adminFixedTeacherQrCreateButton = document.querySelector("[data-admin-fixed-teacher-qr-create]");
const adminFixedTeacherQr = document.querySelector("[data-admin-fixed-teacher-qr]");
const adminFixedTeacherQrList = document.querySelector("[data-admin-fixed-teacher-qr-list]");
const adminFixedTeacherQrPrintButton = document.querySelector("[data-admin-fixed-teacher-qr-print]");
const adminFixedTeacherQrPdfButton = document.querySelector("[data-admin-fixed-teacher-qr-pdf]");
const adminFixedTeacherQrPreviewCloseButton = document.querySelector("[data-admin-fixed-teacher-qr-preview-close]");
const adminTeacherProfileSelect = document.querySelector("[data-admin-teacher-profile-select]");
const adminTeacherProfileStyle = document.querySelector("[data-admin-teacher-profile-style]");
const adminTeacherProfileLesson = document.querySelector("[data-admin-teacher-profile-lesson]");
const adminTeacherProfileNote = document.querySelector("[data-admin-teacher-profile-note]");
const adminTeacherProfileSave = document.querySelector("[data-admin-teacher-profile-save]");
const adminTeacherProfileReset = document.querySelector("[data-admin-teacher-profile-reset]");
const adminTeacherProfileState = document.querySelector("[data-admin-teacher-profile-state]");
const adminTeacherProfileMessage = document.querySelector("[data-admin-teacher-profile-message]");
const nextAdventureButton = document.querySelector("[data-next-adventure-button]");
const nextAdventureTitle = document.querySelector("[data-next-adventure-title]");
const nextAdventureCopy = document.querySelector("[data-next-adventure-copy]");
const nextAdventureGuide = document.querySelector("[data-next-adventure-guide]");
const nextAdventureGuideImage = document.querySelector("[data-next-adventure-guide-image]");
const nextAdventureGuideSpeech = document.querySelector("[data-next-adventure-guide-speech]");
const mapDestinationButtons = document.querySelectorAll("[data-map-destination]");
const shrineIntro = document.querySelector("[data-shrine-intro]");
const shrineIntroCaption = document.querySelector("[data-shrine-intro-caption]");
const shrineIntroSkip = document.querySelector("[data-shrine-intro-skip]");
const shrineTeacherList = document.querySelector("[data-shrine-teachers]");
const shrineActiveTeacherList = document.querySelector("[data-shrine-active-teachers]");
const shrineTeacherCount = document.querySelector("[data-shrine-teacher-count]");
const shrineTeacherEditorToggle = document.querySelector("[data-shrine-teacher-editor-toggle]");
const shrineRoundCount = document.querySelector("[data-shrine-round-count]");
const shrineModeButtons = document.querySelectorAll("[data-shrine-mode]");
const shrinePathModeButtons = document.querySelectorAll("[data-shrine-path-mode]");
const shrinePathResultButton = document.querySelector("[data-shrine-path-result]");
const shrineCollapsibleButtons = document.querySelectorAll("[data-shrine-collapsible-toggle]");
const shrineModeKicker = document.querySelector("[data-shrine-mode-kicker]");
const shrineModeTitle = document.querySelector("[data-shrine-mode-title]");
const shrineModeCopy = document.querySelector("[data-shrine-mode-copy]");
const shrineFoxSpeech = document.querySelector("[data-shrine-fox-speech]");
const shrineOtterSpeech = document.querySelector("[data-shrine-otter-speech]");
const shrineLessonOnlyItems = document.querySelectorAll("[data-shrine-lesson-only]");
const shrineAmateurOnlyItems = document.querySelectorAll("[data-shrine-amateur-only]");
const shrinePairgoOnlyItems = document.querySelectorAll("[data-shrine-pairgo-only]");
const shrineNumberEntryCard = document.querySelector(".shrine-number-entry");
const shrineParticipantCard = document.querySelector("[data-shrine-participant-card]");
const shrineParticipants = document.querySelector("[data-shrine-participants]");
const shrineGroupSize = document.querySelector("[data-shrine-group-size]");
const shrineFixedGroups = document.querySelector("[data-shrine-fixed-groups]");
const shrineMixedGenderPairs = document.querySelector("[data-shrine-mixed-gender-pairs]");
const shrineCloseStrengthPairs = document.querySelector("[data-shrine-close-strength-pairs]");
const shrineBalancedTeamStrength = document.querySelector("[data-shrine-balanced-team-strength]");
const shrineMatchMethod = document.querySelector("[data-shrine-match-method]");
const shrineMatchMethodShortcut = document.querySelector("[data-shrine-match-method-shortcut]");
const shrineNumberCount = document.querySelector("[data-shrine-number-count]");
const shrineNumberApply = document.querySelector("[data-shrine-number-apply]");
const shrineNumberMessage = document.querySelector("[data-shrine-number-message]");
const shrineQuickName = document.querySelector("[data-shrine-quick-name]");
const shrineQuickGender = document.querySelector("[data-shrine-quick-gender]");
const shrineQuickStrengthType = document.querySelector("[data-shrine-quick-strength-type]");
const shrineQuickStrengthValue = document.querySelector("[data-shrine-quick-strength-value]");
const shrineQuickAdd = document.querySelector("[data-shrine-quick-add]");
const shrineQuickMessage = document.querySelector("[data-shrine-quick-message]");
const shrineQuickAddPanel = document.querySelector(".shrine-participant-quick-add");
const shrineSampleButton = document.querySelector("[data-shrine-sample]");
const shrineResetButton = document.querySelector("[data-shrine-reset]");
const shrineRosterToggle = document.querySelector("[data-shrine-roster-toggle]");
const shrineRosterPanel = document.querySelector("[data-shrine-roster-panel]");
const shrineRosterList = document.querySelector("[data-shrine-roster-list]");
const shrineRosterSearch = document.querySelector("[data-shrine-roster-search]");
const shrineRosterApply = document.querySelector("[data-shrine-roster-apply]");
const shrineRosterEditToggle = document.querySelector("[data-shrine-roster-edit-toggle]");
const shrineRosterEditor = document.querySelector("[data-shrine-roster-editor]");
const shrineRosterEditorText = document.querySelector("[data-shrine-roster-editor-text]");
const shrineRosterFormName = document.querySelector("[data-shrine-roster-form-name]");
const shrineRosterFormGender = document.querySelector("[data-shrine-roster-form-gender]");
const shrineRosterFormStrengthType = document.querySelector("[data-shrine-roster-form-strength-type]");
const shrineRosterFormStrengthValue = document.querySelector("[data-shrine-roster-form-strength-value]");
const shrineRosterSave = document.querySelector("[data-shrine-roster-save]");
const shrineRosterDelete = document.querySelector("[data-shrine-roster-delete]");
const shrineRosterMessage = document.querySelector("[data-shrine-roster-message]");
const shrineGenerateButton = document.querySelector("[data-shrine-generate]");
const shrineResult = document.querySelector("[data-shrine-result]");
const shrineRecordSave = document.querySelector("[data-shrine-record-save]");
const shrineRecordClear = document.querySelector("[data-shrine-record-clear]");
const shrineRecordList = document.querySelector("[data-shrine-record-list]");
const shrineRecordMessage = document.querySelector("[data-shrine-record-message]");
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
let latestTeacherStampReflection = null;
let todayTeacherStampReflections = [];
let adminGameRecordApplyCooldownUntil = 0;
let adminDuplicateTeacherApplyCooldownUntil = 0;
let pendingOperatorAction = null;
let pendingRestoreBackup = null;
let isShrineIntroPlaying = false;
let shrineIntroTimerIds = [];

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
const pendingGameRecordsStorageKey = "suiyoukai-pending-game-records-v2";
const operationHistoryStorageKey = "suiyoukai-operation-history-v1";
const stampQrAppliedStorageKey = "suiyoukai-stamp-qr-applied-v1";
const todayTeacherStampReflectionStorageKey = "suiyoukai-today-teacher-stamps-v1";
const teacherProfileStorageKey = "suiyoukai-teacher-profiles-v1";
const adminPasscodeStorageKey = "suiyoukai-admin-passcode-local-v1";
const adventurerNameStorageKey = "suiyoukai-adventurer-name-v1";
const adventurerReceptionCodeStorageKey = "suiyoukai-adventurer-reception-code-v2";
const adminIdentityCodeStorageKey = "suiyoukai-admin-identity-code-v1";
const adminIdentityDisplayNameStorageKey = "suiyoukai-admin-identity-display-name-v1";
const adminIdentityRealNameStorageKey = "suiyoukai-admin-identity-real-name-v1";
const adminCombinedAppliedKeysStorageKey = "suiyoukai-admin-combined-applied-keys-v1";
const participationFormOpenedStorageKey = "suiyoukai-participation-form-opened-v1";
const defaultAdventurerName = "みずの しずく";
const backupAppId = "suiyoukai-stamp-adventure";
const backupFormatVersion = 1;
const externalGameRecordFormEnabled = true;
const participationFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdEqwXBhF3jDi-YUizfnNnLDfTzD7QJTK469-xwQwA21Gl_rA/viewform?usp=publish-editor";
const shrineTodayTeacherStorageKey = "suiyoukai-shrine-today-teachers-v1";
const shrineRosterStorageKey = "suiyoukai-shrine-roster-v1";
const shrineRecordStorageKey = "suiyoukai-shrine-records-v1";
const libraryJournalStorageKey = "suiyoukai-library-journal-v1";
const ruleTargets = window.teacherStampTargets ?? [];
const participationRule = window.stampRules?.participation ?? {};
const teacherLessonRule = window.stampRules?.teacherLesson ?? {};
const teacherCircleRule = window.stampRules?.teacherCircle ?? {};
const extraTeacherCircleRule = window.stampRules?.extraTeacherCircle ?? {};
const teacherTargetById = Object.fromEntries(ruleTargets.map((target) => [target.teacherId, target]));
const teacherCircleTargetIds = teacherCircleRule.teacherIds ?? ruleTargets.map((target) => target.teacherId);
const extraTeacherCircleTargetIds = extraTeacherCircleRule.teacherIds ?? [
  "teacher_extra_01",
  "teacher_extra_02",
  "teacher_extra_03",
  "teacher_extra_04",
  "teacher_extra_05",
];

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
  suzuran: {
    flower: "suzuran",
    flowerName: "すずらん",
    flowerAsset: "suzuran-stamp-stage-05-list.png",
    fairyId: "fairy_suzuran_mouse",
    fairyName: "すずらんのネズミ妖精",
    fairyAsset: "fairy-companion-suzuran-mouse.png",
    flowerColor: "#f0f7df",
    accentColor: "#8fb985",
  },
  mokuren: {
    flower: "mokuren",
    flowerName: "木蓮",
    flowerAsset: "mokuren-stamp-stage-05-list.png",
    fairyId: "fairy_mokuren_white_cat",
    fairyName: "木蓮の白猫妖精",
    fairyAsset: "fairy-companion-mokuren-white-cat.png",
    flowerColor: "#f5e7ef",
    accentColor: "#b985a7",
  },
  hinageshi: {
    flower: "hinageshi",
    flowerName: "ひなげし",
    flowerAsset: "hinageshi-stamp-stage-05-list.png",
    fairyId: "fairy_hinageshi_squirrel",
    fairyName: "ひなげしのリス妖精",
    fairyAsset: "fairy-companion-hinageshi-squirrel.png",
    flowerColor: "#f1a1a7",
    accentColor: "#d85f65",
  },
  shirotsumekusa: {
    flower: "shirotsumekusa",
    flowerName: "白詰草",
    flowerAsset: "shirotsumekusa-stamp-stage-05-list.png",
    fairyId: "fairy_shirotsumekusa_toy_poodle",
    fairyName: "白詰草のトイプードル妖精",
    fairyAsset: "fairy-companion-shirotsumekusa-toy-poodle.png",
    flowerColor: "#ecf4de",
    accentColor: "#78a768",
  },
  ran: {
    flower: "ran",
    flowerName: "蘭",
    flowerAsset: "ran-stamp-stage-05-list.png",
    fairyId: "fairy_ran_turtle",
    fairyName: "蘭の亀妖精",
    fairyAsset: "fairy-companion-ran-turtle.png",
    flowerColor: "#ddc7ef",
    accentColor: "#8e66ba",
  },
  hanamizuki: {
    flower: "hanamizuki",
    flowerName: "花水木",
    flowerAsset: "hanamizuki-stamp-stage-05-list.png",
    fairyId: "fairy_hanamizuki_crane",
    fairyName: "花水木の鶴妖精",
    fairyAsset: "fairy-companion-hanamizuki-crane.png",
    flowerColor: "#f3dce0",
    accentColor: "#c66b7c",
  },
  yamabuki: {
    flower: "yamabuki",
    flowerName: "山吹",
    flowerAsset: "yamabuki-stamp-stage-05-list.png",
    fairyId: "fairy_yamabuki_shiba",
    fairyName: "山吹の柴犬妖精",
    fairyAsset: "fairy-companion-yamabuki-shiba.png",
    flowerColor: "#e6b23f",
    accentColor: "#f6d98b",
  },
  rindou: {
    flower: "rindou",
    flowerName: "りんどう",
    flowerAsset: "rindou-stamp-stage-05-list.png",
    fairyId: "fairy_rindou_bluebird",
    fairyName: "りんどうの青い鳥妖精",
    fairyAsset: "fairy-companion-rindou-bluebird.png",
    flowerColor: "#566bb7",
    accentColor: "#9fb0e5",
  },
  tsukimisou: {
    flower: "tsukimisou",
    flowerName: "月見草",
    flowerAsset: "tsukimisou-stamp-stage-05-list.png",
    fairyId: "fairy_tsukimisou_dormouse",
    fairyName: "月見草のヤマネ妖精",
    fairyAsset: "fairy-companion-tsukimisou-dormouse.png",
    flowerColor: "#f4e28a",
    accentColor: "#d7b84e",
  },
  kingyosou: {
    flower: "kingyosou",
    flowerName: "金魚草",
    flowerAsset: "kingyosou-stamp-stage-05-list.png",
    fairyId: "fairy_kingyosou_rabbit",
    fairyName: "金魚草のうさぎ妖精",
    fairyAsset: "fairy-companion-kingyosou-rabbit.png",
    flowerColor: "#e57b74",
    accentColor: "#f2b37e",
  },
  fujibakama: {
    flower: "fujibakama",
    flowerName: "藤袴",
    flowerAsset: "fujibakama-stamp-stage-05-list.png",
    fairyId: "fairy_fujibakama_hedgehog",
    fairyName: "藤袴のハリネズミ妖精",
    fairyAsset: "fairy-companion-fujibakama-hedgehog.png",
    flowerColor: "#b982c0",
    accentColor: "#e2bfdc",
  },
  fuyou: {
    flower: "fuyou",
    flowerName: "芙蓉",
    flowerAsset: "fuyou-stamp-stage-05-list.png",
    fairyId: "fairy_fuyou_white_goat",
    fairyName: "芙蓉の白山羊妖精",
    fairyAsset: "fairy-companion-fuyou-white-goat.png",
    flowerColor: "#e7a2b8",
    accentColor: "#f3d5df",
  },
  tsuyukusa: {
    flower: "tsuyukusa",
    flowerName: "露草",
    flowerAsset: "tsuyukusa-stamp-stage-05-list.png",
    fairyId: "fairy_tsuyukusa_otter",
    fairyName: "露草のカワウソ妖精",
    fairyAsset: "fairy-companion-tsuyukusa-otter.png",
    flowerColor: "#3f7fc5",
    accentColor: "#90c5ea",
  },
  kinsenka: {
    flower: "kinsenka",
    flowerName: "金盞花",
    flowerAsset: "kinsenka-stamp-stage-05-list.png",
    fairyId: "fairy_kinsenka_hamster",
    fairyName: "金盞花のハムスター妖精",
    fairyAsset: "fairy-companion-kinsenka-hamster.png",
    flowerColor: "#e19a35",
    accentColor: "#f4c96d",
  },
  nanten: {
    flower: "nanten",
    flowerName: "南天",
    flowerAsset: "nanten-stamp-stage-05-list.png",
    fairyId: "fairy_nanten_tanuki",
    fairyName: "南天のたぬき妖精",
    fairyAsset: "fairy-companion-nanten-tanuki.png",
    flowerColor: "#b9434a",
    accentColor: "#e4a24c",
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
  teacher_extra_01: ["suzuran", "mokuren", "hinageshi"],
  teacher_extra_02: ["shirotsumekusa", "ran", "hanamizuki"],
  teacher_extra_03: ["yamabuki", "rindou", "tsukimisou"],
  teacher_extra_04: ["kingyosou", "fujibakama", "fuyou"],
  teacher_extra_05: ["tsuyukusa", "kinsenka", "nanten"],
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
  teacher_extra_01: {
    name: "追加先生A",
    guide: "新しい花をひらく案内人",
    stampCount: 0,
    fairy: false,
    photo: "extra-a",
    flower: "suzuran",
    initial: "追A",
    completedFirstRound: false,
    style: "やさしく局面を整え、新しい気づきを見つける",
    lesson: "すずらんから始まる花巡りを、冒険者の歩幅に合わせて進める指導",
    note: "新しい先生枠を試したい冒険者へ",
  },
  teacher_extra_02: {
    name: "追加先生B",
    guide: "新しい道を照らす案内人",
    stampCount: 0,
    fairy: false,
    photo: "extra-b",
    flower: "shirotsumekusa",
    initial: "追B",
    completedFirstRound: false,
    style: "小さな発見を拾いながら、次の一手へつなげる",
    lesson: "白詰草から始まる花巡りを、落ち着いて積み重ねる指導",
    note: "新しい相性を探したい冒険者へ",
  },
  teacher_extra_03: {
    name: "追加先生C",
    guide: "新しい先生の輪をつなぐ案内人",
    stampCount: 0,
    fairy: false,
    photo: "extra-c",
    flower: "yamabuki",
    initial: "追C",
    completedFirstRound: false,
    style: "明るい入口から、読みの道筋を一緒に見つける",
    lesson: "山吹から始まる花巡りを、初めて会う人にもわかりやすく支える指導",
    note: "新しい先生の輪を育てる冒険者へ",
  },
  teacher_extra_04: {
    name: "追加先生D",
    guide: "新しい花を咲かせる案内人",
    stampCount: 0,
    fairy: false,
    photo: "extra-d",
    flower: "kingyosou",
    initial: "追D",
    completedFirstRound: false,
    style: "一手の表情を見ながら、次の発見へそっと導く",
    lesson: "金魚草から始まる花巡りを、楽しく続けられるように整える指導",
    note: "新しい出会いを記録したい冒険者へ",
  },
  teacher_extra_05: {
    name: "追加先生E",
    guide: "新しい輪を見守る案内人",
    stampCount: 0,
    fairy: false,
    photo: "extra-e",
    flower: "tsuyukusa",
    initial: "追E",
    completedFirstRound: false,
    style: "静かな発見を拾い上げ、次の一手につなげる",
    lesson: "露草から始まる花巡りを、一人ひとりの歩幅に合わせて進める指導",
    note: "これから広がる先生の輪を楽しみたい冒険者へ",
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

const teacherProfileFields = ["style", "lesson", "note"];

const sanitizeTeacherProfileOverrides = (stored = {}) => {
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(stored)
      .filter(([teacherId]) => Boolean(teacherDetails[teacherId]))
      .map(([teacherId, profile]) => {
        const cleanProfile = {};

        if (profile && typeof profile === "object" && !Array.isArray(profile)) {
          for (const field of teacherProfileFields) {
            if (typeof profile[field] === "string") {
              const text = profile[field].trim().slice(0, 120);

              if (text && text !== teacherDetails[teacherId][field]) {
                cleanProfile[field] = text;
              }
            }
          }
        }

        return [teacherId, cleanProfile];
      })
      .filter(([, profile]) => Object.keys(profile).length > 0)
  );
};

const loadTeacherProfileOverrides = () => {
  try {
    return sanitizeTeacherProfileOverrides(JSON.parse(localStorage.getItem(teacherProfileStorageKey) ?? "{}"));
  } catch {
    return {};
  }
};

let teacherProfileOverrides = loadTeacherProfileOverrides();

const saveTeacherProfileOverrides = () => {
  try {
    localStorage.setItem(teacherProfileStorageKey, JSON.stringify(teacherProfileOverrides));
  } catch {
    // 紹介文を保存できない環境でも、表示中の画面はそのまま使えます。
  }
};

const getTeacherProfile = (teacherId) => ({
  ...teacherDetails[teacherId],
  ...(teacherProfileOverrides[teacherId] ?? {}),
});

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

const getStoredLastParticipationStampDate = (progress = {}) =>
  progress.stamps?.lastParticipationStampDate ?? progress.lastParticipationStampDate ?? "";

const sanitizeStampDate = (value) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";

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
  const teacherIds = teacherCircleTargetIds.length > 0
    ? teacherCircleTargetIds
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
      Object.keys(teacherDetails).map((teacherId) => [teacherId, 0])
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
      lastParticipationStampDate: sanitizeStampDate(getStoredLastParticipationStampDate(progress)),
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
      lastParticipationStampDate: "",
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

const normalizeAdventurerName = (value) => String(value ?? "").trim().replace(/\s+/g, " ").slice(0, 20);

const loadAdventurerName = () => {
  try {
    return normalizeAdventurerName(localStorage.getItem(adventurerNameStorageKey)) || defaultAdventurerName;
  } catch {
    return defaultAdventurerName;
  }
};

const saveAdventurerName = (value) => {
  const normalizedName = normalizeAdventurerName(value);

  try {
    if (normalizedName) {
      localStorage.setItem(adventurerNameStorageKey, normalizedName);
    } else {
      localStorage.removeItem(adventurerNameStorageKey);
    }
  } catch {
    // 名前はこの端末だけの表示用です。保存できない時は表示だけ更新します。
  }

  return normalizedName || defaultAdventurerName;
};

const normalizeAdminIdentityName = (value) => String(value ?? "").trim().replace(/\s+/g, " ").slice(0, 30);

const normalizeAdminIdentityCode = (value) => String(value ?? "").replace(/\D/g, "").slice(0, 8);
const adminIdentityBlankCodeValue = "__blank__";
const adminIdentityBlankNameValue = "__blank__";

const loadAdminIdentityCode = () => {
  try {
    const storedCode = localStorage.getItem(adminIdentityCodeStorageKey);
    if (storedCode === adminIdentityBlankCodeValue) {
      return "";
    }

    const normalizedCode = normalizeAdminIdentityCode(storedCode);
    if (normalizedCode) {
      return normalizedCode;
    }

    const hasCustomIdentity =
      normalizeAdminIdentityName(localStorage.getItem(adminIdentityDisplayNameStorageKey)) ||
      normalizeAdminIdentityName(localStorage.getItem(adminIdentityRealNameStorageKey));

    return hasCustomIdentity ? "" : loadReceptionCode();
  } catch {
    return loadReceptionCode();
  }
};

const saveAdminIdentityCode = (value) => {
  const normalizedCode = normalizeAdminIdentityCode(value);

  try {
    if (normalizedCode) {
      localStorage.setItem(adminIdentityCodeStorageKey, normalizedCode);
    } else {
      localStorage.setItem(adminIdentityCodeStorageKey, adminIdentityBlankCodeValue);
    }
  } catch {
    // Identity notes are only a local operation aid.
  }

  return normalizedCode;
};

const loadAdminIdentityDisplayName = () => {
  try {
    const storedName = localStorage.getItem(adminIdentityDisplayNameStorageKey);
    if (storedName === adminIdentityBlankNameValue) {
      return "";
    }

    const normalizedName = normalizeAdminIdentityName(storedName);
    if (normalizedName) {
      return normalizedName;
    }

    const hasCustomIdentity =
      normalizeAdminIdentityCode(localStorage.getItem(adminIdentityCodeStorageKey)) ||
      normalizeAdminIdentityName(localStorage.getItem(adminIdentityRealNameStorageKey));

    return hasCustomIdentity ? "" : loadAdventurerName();
  } catch {
    return loadAdventurerName();
  }
};

const saveAdminIdentityDisplayName = (value) => {
  const normalizedName = normalizeAdminIdentityName(value);

  try {
    if (normalizedName) {
      localStorage.setItem(adminIdentityDisplayNameStorageKey, normalizedName);
    } else {
      localStorage.setItem(adminIdentityDisplayNameStorageKey, adminIdentityBlankNameValue);
    }
  } catch {
    // Identity notes are only a local operation aid.
  }

  return normalizedName;
};

const loadAdminIdentityRealName = () => {
  try {
    return normalizeAdminIdentityName(localStorage.getItem(adminIdentityRealNameStorageKey));
  } catch {
    return "";
  }
};

const saveAdminIdentityRealName = (value) => {
  const normalizedName = normalizeAdminIdentityName(value);

  try {
    if (normalizedName) {
      localStorage.setItem(adminIdentityRealNameStorageKey, normalizedName);
    } else {
      localStorage.removeItem(adminIdentityRealNameStorageKey);
    }
  } catch {
    // Identity notes are only a local operation aid.
  }

  return normalizedName;
};

const updateAdminIdentityCard = () => {
  const displayName = loadAdminIdentityDisplayName();
  const receptionCode = loadAdminIdentityCode();
  const receptionLabel = receptionCode || "未入力";
  const realName = loadAdminIdentityRealName();
  const participantLabel = realName
    ? `${displayName || "名前未入力"} / ${realName}`
    : displayName || "未入力";

  if (adminIdentityCode && document.activeElement !== adminIdentityCode) {
    adminIdentityCode.value = receptionCode;
  }
  if (adminIdentityDisplayName && document.activeElement !== adminIdentityDisplayName) {
    adminIdentityDisplayName.value = displayName;
  }
  if (adminParticipantName) {
    adminParticipantName.textContent = participantLabel;
  }
  if (adminParticipationName && document.activeElement !== adminParticipationName) {
    adminParticipationName.value = participantLabel;
  }
  if (adminIdentityRealName && document.activeElement !== adminIdentityRealName) {
    adminIdentityRealName.value = realName;
  }
  if (adminIdentityNote) {
    adminIdentityNote.textContent = realName
      ? `受付番号 ${receptionCode} / ${displayName} / ${realName} の記録を操作します。`
      : `受付番号 ${receptionCode} / ${displayName} の記録を操作します。本名が必要な時だけ入力してください。`;
  }
};

const updateAdminIdentityNoteText = () => {
  if (!adminIdentityNote) {
    return;
  }

  const displayName = loadAdminIdentityDisplayName();
  const receptionLabel = loadAdminIdentityCode() || "未入力";
  const realName = loadAdminIdentityRealName();

  if (!displayName && !realName && receptionLabel === "未入力") {
    adminIdentityNote.textContent = "操作対象が未入力です。受付番号、画面名、本名・確認名のどれかを入れてください。";
    return;
  }

  const displayLabel = displayName || "名前未入力";
  adminIdentityNote.textContent = realName
    ? `受付番号 ${receptionLabel} / ${displayLabel} / ${realName} の記録を操作します。`
    : `受付番号 ${receptionLabel} / ${displayLabel} の記録を操作します。本名が必要な時だけ入力してください。`;
};

const createReceptionCode = () => {
  const array = new Uint32Array(1);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    array[0] = Math.floor(Math.random() * 90000000);
  }

  return String(10000000 + (array[0] % 90000000));
};

const loadReceptionCode = () => {
  try {
    const storedCode = localStorage.getItem(adventurerReceptionCodeStorageKey);
    if (/^\d{8}$/.test(storedCode ?? "")) {
      return storedCode;
    }

    const code = createReceptionCode();
    localStorage.setItem(adventurerReceptionCodeStorageKey, code);
    return code;
  } catch {
    return "00000000";
  }
};

const renderAdventurerName = () => {
  const name = loadAdventurerName();
  const isDefaultName = name === defaultAdventurerName;

  if (adventurerName) {
    adventurerName.textContent = name;
    adventurerName.classList.toggle("is-default", isDefaultName);
  }
  if (adventurerNameInput && document.activeElement !== adventurerNameInput) {
    adventurerNameInput.value = isDefaultName ? "" : name;
  }
  if (adventurerNameEdit) {
    adventurerNameEdit.textContent = isDefaultName ? "名前を入れる" : "名前を変える";
  }
  if (adventurerNameHint) {
    adventurerNameHint.textContent = isDefaultName
      ? "見本の名前です。好きな名前に変えられます。"
      : "この名前はいつでも変えられます。記録は消えません。";
  }
  if (adventurerReceptionCode) {
    const receptionCode = loadReceptionCode();
    adventurerReceptionCode.textContent = receptionCode;
    if (participationReceptionCode) {
      participationReceptionCode.textContent = receptionCode;
    }
  }
};

const isEdgeOnIos = () => /EdgiOS/i.test(navigator.userAgent);

const updateBrowserStorageWarning = () => {
  if (!browserStorageWarning) {
    return;
  }

  browserStorageWarning.hidden = !isEdgeOnIos();
};

const getTodayGameRecords = () => {
  const today = getTodayForInput();

  return gameRecords
    .filter((record) => record.date === today && teacherDetails[record.teacherId])
    .filter((record) => record.handicap !== "記録なし" || record.result !== "記録なし")
    .sort((a, b) => `${a.recordedAt || ""}${a.id}`.localeCompare(`${b.recordedAt || ""}${b.id}`))
    .slice(-3);
};

const formatGameRecordDateLabel = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const createTodayGameRecordCard = (record) => {
  const teacher = teacherDetails[record.teacherId];
  const article = document.createElement("article");
  const heading = document.createElement("strong");
  const details = document.createElement("dl");
  const flowerLine = document.createElement("p");
  const companionLine = document.createElement("p");

  article.className = "profile-today-game-record-card";
  heading.textContent = "今日の指導碁";
  flowerLine.className = "profile-today-game-record-flower-line";
  flowerLine.textContent = "今日の花が咲きました。";
  companionLine.className = "profile-today-game-record-companion";
  companionLine.textContent = `ハリネズミ: 今日は${teacher.name}との一局を、大切にしまっておきます。`;

  const rows = [
    ["先生", teacher.name],
    ["日付", formatGameRecordDateLabel(record.date)],
    ["ハンデ", record.handicap === "記録なし" ? "未記録" : record.handicap],
    ["結果", record.result === "記録なし" ? "未記録" : record.result],
  ];

  for (const [label, value] of rows) {
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    details.append(term, description);
  }

  article.append(heading, details, flowerLine, companionLine);
  return article;
};

const renderProfileTodayGameRecords = () => {
  if (!profileTodayGameRecords) {
    return;
  }

  const records = getTodayGameRecords();
  profileTodayGameRecords.textContent = "";
  profileTodayGameRecords.hidden = records.length === 0;

  for (const record of records) {
    profileTodayGameRecords.append(createTodayGameRecordCard(record));
  }
};

const sanitizeLibraryJournalEntry = (entry = {}) => {
  const text = typeof entry.text === "string" ? entry.text.trim() : "";
  const createdAt = typeof entry.createdAt === "string" ? entry.createdAt : "";

  if (!text) {
    return null;
  }

  return {
    id: typeof entry.id === "string" && entry.id ? entry.id : `journal-${Date.now()}`,
    text: text.slice(0, 80),
    source: typeof entry.source === "string" && entry.source ? entry.source : "manual",
    createdAt,
  };
};

const loadLibraryJournalEntries = () => {
  try {
    const storedEntries = JSON.parse(localStorage.getItem(libraryJournalStorageKey) ?? "[]");
    return Array.isArray(storedEntries)
      ? storedEntries.map(sanitizeLibraryJournalEntry).filter(Boolean).slice(0, 12)
      : [];
  } catch {
    return [];
  }
};

let libraryJournalEntries = loadLibraryJournalEntries();

const saveLibraryJournalEntries = () => {
  try {
    localStorage.setItem(libraryJournalStorageKey, JSON.stringify(libraryJournalEntries.slice(0, 12)));
  } catch {
    // 思い出メモを保存できない環境でも、他の記録はそのまま使えます。
  }
};

const addLibraryJournalEntry = ({ text, source = "manual" }) => {
  const entry = sanitizeLibraryJournalEntry({
    id: `journal-${Date.now()}-${libraryJournalEntries.length}`,
    text,
    source,
    createdAt: new Date().toISOString(),
  });

  if (!entry) {
    return null;
  }

  libraryJournalEntries = [
    entry,
    ...libraryJournalEntries.filter((item) => item.text !== entry.text),
  ].slice(0, 12);
  saveLibraryJournalEntries();
  return entry;
};

const loadPendingGameRecords = () => {
  try {
    const storedRecords = JSON.parse(localStorage.getItem(pendingGameRecordsStorageKey) ?? "[]");
    return Array.isArray(storedRecords) ? storedRecords.map(sanitizeGameRecord).filter(Boolean) : [];
  } catch {
    return [];
  }
};

let pendingGameRecords = loadPendingGameRecords();

const savePendingGameRecords = () => {
  try {
    localStorage.setItem(pendingGameRecordsStorageKey, JSON.stringify(pendingGameRecords));
  } catch {
    // 確認待ちの記録は保存できない環境でも、この画面を開いている間は保持します。
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

const loadAppliedStampQrIds = () => {
  try {
    const storedIds = JSON.parse(localStorage.getItem(stampQrAppliedStorageKey) ?? "[]");
    return new Set(Array.isArray(storedIds) ? storedIds.filter((id) => typeof id === "string") : []);
  } catch {
    return new Set();
  }
};

let appliedStampQrIds = loadAppliedStampQrIds();

const saveAppliedStampQrIds = () => {
  try {
    localStorage.setItem(stampQrAppliedStorageKey, JSON.stringify([...appliedStampQrIds].slice(-200)));
  } catch {
    // QRの二重読み取り防止は保存できない環境でも、開いている間は保持します。
  }
};

const qrHandicapValues = ["記録なし", "互先", "先", "先逆コミ6.5目", "2子", "3子", "4子", "5子", "6子", "7子", "8子", "9子"];
const qrResultValues = ["記録なし", "勝ち", "負け", "持碁"];

const encodeQrValue = (value, values) => Math.max(0, values.indexOf(value));

const decodeQrValue = (value, values) => values[Number(value)] ?? values[0];

const encodeStampPayload = (payload) => {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const decodeStampPayload = (encodedPayload) => {
  const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
};

const normalizeQrDate = (value) => {
  if (typeof value !== "string") {
    return getTodayForInput();
  }

  const normalized = value.trim().replace(/\//g, "-");
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(normalized)) {
    const [year, month, day] = normalized.split("-");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return getTodayForInput();
};

const mobilePreviewOrigin = "http://192.168.128.168:4184";

const getStampQrBaseUrl = () => {
  const isLocalOnlyHost = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
  const origin = isLocalOnlyHost ? mobilePreviewOrigin : window.location.origin;

  return `${origin}${window.location.pathname}`;
};

const createStampApplyUrl = (payload) => {
  const normalizedPayload = {
    ...payload,
    type: payload.type ?? "teacher_stamp",
    date: normalizeQrDate(payload.date),
  };
  const stampData = encodeStampPayload(normalizedPayload);

  return `${getStampQrBaseUrl()}?stamp=${stampData}`;
};

const createQrGeneratorPolynomial = (degree) => {
  const exp = new Array(512);
  const log = new Array(256).fill(0);
  let value = 1;

  for (let index = 0; index < 255; index += 1) {
    exp[index] = value;
    log[value] = index;
    value <<= 1;
    if (value & 0x100) {
      value ^= 0x11d;
    }
  }
  for (let index = 255; index < 512; index += 1) {
    exp[index] = exp[index - 255];
  }

  const multiply = (left, right) => (left === 0 || right === 0 ? 0 : exp[log[left] + log[right]]);
  let polynomial = [1];
  for (let index = 0; index < degree; index += 1) {
    const next = new Array(polynomial.length + 1).fill(0);
    for (let term = 0; term < polynomial.length; term += 1) {
      next[term] ^= polynomial[term];
      next[term + 1] ^= multiply(polynomial[term], exp[index]);
    }
    polynomial = next;
  }

  return { polynomial, multiply };
};

const createQrErrorCorrection = (dataCodewords, degree) => {
  const { polynomial, multiply } = createQrGeneratorPolynomial(degree);
  const remainder = new Array(degree).fill(0);

  for (const codeword of dataCodewords) {
    const factor = codeword ^ remainder.shift();
    remainder.push(0);
    for (let index = 0; index < degree; index += 1) {
      remainder[index] ^= multiply(polynomial[index + 1], factor);
    }
  }

  return remainder;
};

const createQrFormatBits = (mask) => {
  let data = (1 << 3) | mask;
  let bits = data << 10;
  const generator = 0x537;

  for (let shift = 14; shift >= 10; shift -= 1) {
    if ((bits >> shift) & 1) {
      bits ^= generator << (shift - 10);
    }
  }

  return ((data << 10) | bits) ^ 0x5412;
};

const createQrCodeDataUrl = (text) => {
  const version = 5;
  const size = 17 + version * 4;
  const dataCodewordCount = 108;
  const errorCodewordCount = 26;
  const modules = Array.from({ length: size }, () => new Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => new Array(size).fill(false));
  const setModule = (row, col, dark, isReserved = true) => {
    if (row < 0 || col < 0 || row >= size || col >= size) {
      return;
    }
    modules[row][col] = dark;
    reserved[row][col] = isReserved;
  };
  const drawFinder = (row, col) => {
    for (let dy = -1; dy <= 7; dy += 1) {
      for (let dx = -1; dx <= 7; dx += 1) {
        const y = row + dy;
        const x = col + dx;
        const inFinder = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
        const dark = inFinder && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
        setModule(y, x, dark);
      }
    }
  };
  const drawAlignment = (centerRow, centerCol) => {
    for (let dy = -2; dy <= 2; dy += 1) {
      for (let dx = -2; dx <= 2; dx += 1) {
        const distance = Math.max(Math.abs(dx), Math.abs(dy));
        setModule(centerRow + dy, centerCol + dx, distance !== 1);
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);
  drawAlignment(30, 30);
  for (let index = 8; index < size - 8; index += 1) {
    setModule(6, index, index % 2 === 0);
    setModule(index, 6, index % 2 === 0);
  }
  setModule((4 * version) + 9, 8, true);

  const bytes = [...text].map((char) => char.charCodeAt(0));
  const bits = [0, 1, 0, 0];
  for (let bit = 7; bit >= 0; bit -= 1) {
    bits.push((bytes.length >> bit) & 1);
  }
  for (const byte of bytes) {
    for (let bit = 7; bit >= 0; bit -= 1) {
      bits.push((byte >> bit) & 1);
    }
  }
  const capacityBits = dataCodewordCount * 8;
  for (let index = 0; index < 4 && bits.length < capacityBits; index += 1) {
    bits.push(0);
  }
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }
  const dataCodewords = [];
  for (let index = 0; index < bits.length; index += 8) {
    dataCodewords.push(Number.parseInt(bits.slice(index, index + 8).join(""), 2));
  }
  for (let pad = 0; dataCodewords.length < dataCodewordCount; pad += 1) {
    dataCodewords.push(pad % 2 === 0 ? 0xec : 0x11);
  }
  const allCodewords = [...dataCodewords, ...createQrErrorCorrection(dataCodewords, errorCodewordCount)];
  const allBits = allCodewords.flatMap((codeword) => {
    const codewordBits = [];
    for (let bit = 7; bit >= 0; bit -= 1) {
      codewordBits.push((codeword >> bit) & 1);
    }
    return codewordBits;
  });

  let bitIndex = 0;
  let upward = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) {
      col -= 1;
    }
    for (let rowStep = 0; rowStep < size; rowStep += 1) {
      const row = upward ? size - 1 - rowStep : rowStep;
      for (let offset = 0; offset < 2; offset += 1) {
        const x = col - offset;
        if (reserved[row][x]) {
          continue;
        }
        const mask = (row + x) % 2 === 0;
        modules[row][x] = Boolean((allBits[bitIndex] ?? 0) ^ mask);
        bitIndex += 1;
      }
    }
    upward = !upward;
  }

  const formatBits = createQrFormatBits(0);
  for (let index = 0; index <= 5; index += 1) {
    setModule(8, index, Boolean((formatBits >> index) & 1));
  }
  setModule(8, 7, Boolean((formatBits >> 6) & 1));
  setModule(8, 8, Boolean((formatBits >> 7) & 1));
  setModule(7, 8, Boolean((formatBits >> 8) & 1));
  for (let index = 9; index < 15; index += 1) {
    setModule(14 - index, 8, Boolean((formatBits >> index) & 1));
  }
  for (let index = 0; index < 8; index += 1) {
    setModule(size - 1 - index, 8, Boolean((formatBits >> index) & 1));
  }
  for (let index = 8; index < 15; index += 1) {
    setModule(8, size - 15 + index, Boolean((formatBits >> index) & 1));
  }

  const quiet = 4;
  const viewBoxSize = size + quiet * 2;
  const darkModules = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (modules[row][col]) {
        darkModules.push(`<rect x="${col + quiet}" y="${row + quiet}" width="1" height="1"/>`);
      }
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><g fill="#111">${darkModules.join("")}</g></svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const getStampPayloadFromLocation = () => {
  const hash = window.location.hash || "";
  const searchParams = new URLSearchParams(window.location.search);
  const queryStamp = searchParams.get("stamp");
  const encodedValue = queryStamp || hash.match(/^#apply-stamp=([^&]+)/)?.[1] || "";

  if (encodedValue) {
    try {
      const payload = decodeStampPayload(encodedValue);

      return {
        type: payload.type,
        id: payload.id,
        teacherId: payload.teacherId,
        date: normalizeQrDate(payload.date),
        handicap: typeof payload.handicap === "string" ? payload.handicap : "互先",
        result: typeof payload.result === "string" ? payload.result : "記録なし",
      };
    } catch {
      return null;
    }
  }

  const compactValue = hash.match(/^#s=([^&]+)/)?.[1] || "";
  if (compactValue) {
    const [id, teacherId, date, handicapCode, resultCode] = compactValue.split(".").map(decodeURIComponent);

    return {
      type: "teacher_stamp",
      id,
      teacherId,
      date: normalizeQrDate(date),
      handicap: decodeQrValue(handicapCode, qrHandicapValues),
      result: decodeQrValue(resultCode, qrResultValues),
    };
  }

  return null;
};

const buildTeacherStampReflection = ({ gameRecordId, teacherId, before, after }) => {
  const teacher = teacherDetails[teacherId];

  return {
    gameRecordId,
    teacherId,
    teacherName: teacher.name,
    flowerName: teacher.flowerName ?? "花",
    flowerAsset: teacher.flowerAsset ?? "cosmos-stamp-stage-05-v2.png",
    before,
    after,
    goal: getTeacherGoal(teacher),
  };
};

const sanitizeTodayTeacherStampReflection = (reflection = {}) => {
  const teacherId = typeof reflection.teacherId === "string" ? reflection.teacherId : "";
  const date = normalizeQrDate(reflection.date);
  const teacher = teacherDetails[teacherId];

  if (!teacher || date !== getTodayForInput()) {
    return null;
  }

  return buildTeacherStampReflection({
    gameRecordId: typeof reflection.gameRecordId === "string" ? reflection.gameRecordId : `game-today-${teacherId}-${date}`,
    teacherId,
    before: normalizeProgressCount(reflection.before),
    after: normalizeProgressCount(reflection.after),
  });
};

const loadTodayTeacherStampReflections = () => {
  try {
    const storedReflections = JSON.parse(localStorage.getItem(todayTeacherStampReflectionStorageKey) ?? "[]");
    const fromStorage = Array.isArray(storedReflections)
      ? storedReflections.map(sanitizeTodayTeacherStampReflection).filter(Boolean).slice(-3)
      : [];
    const today = getTodayForInput();
    const fromGameRecords = gameRecords
      .filter((record) => record.date === today && teacherDetails[record.teacherId])
      .slice(-3)
      .map((record) => {
        const after = normalizeProgressCount(userProgress.stamps.teacherLessonCounts[record.teacherId]);

        return buildTeacherStampReflection({
          gameRecordId: record.id,
          teacherId: record.teacherId,
          before: Math.max(0, after - 1),
          after,
        });
      });
    const mergedById = new Map();

    for (const reflection of [...fromGameRecords, ...fromStorage]) {
      mergedById.set(reflection.gameRecordId, reflection);
    }

    return [...mergedById.values()].slice(-3);
  } catch {
    return [];
  }
};

const saveTodayTeacherStampReflections = () => {
  try {
    const today = getTodayForInput();
    const storedReflections = todayTeacherStampReflections.map((reflection) => ({
      gameRecordId: reflection.gameRecordId,
      teacherId: reflection.teacherId,
      before: reflection.before,
      after: reflection.after,
      date: today,
    }));
    localStorage.setItem(todayTeacherStampReflectionStorageKey, JSON.stringify(storedReflections.slice(-3)));
  } catch {
    // 今日の表示用メモは保存できない環境でも、開いている間は保持します。
  }
};

todayTeacherStampReflections = loadTodayTeacherStampReflections();
latestTeacherStampReflection = todayTeacherStampReflections.at(-1) ?? null;

const scrollProfileTodayRecordIntoView = () => {
  if (!profileLatestStamp) {
    return;
  }

  const scroll = () => {
    profileLatestStamp.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  window.setTimeout(scroll, 0);
  window.setTimeout(scroll, 180);
  window.setTimeout(scroll, 600);
};

const showProfileTodayRecord = () => {
  showPanel("profile");
  scrollProfileTodayRecordIntoView();
};

const applyParticipationStampPayload = (payload = {}) => {
  const recordDate = normalizeQrDate(payload.date);
  const stampId = typeof payload.id === "string" && payload.id
    ? payload.id
    : `participation-${recordDate}`;
  const today = getTodayForInput();
  const before = normalizeProgressCount(userProgress.stamps.participationCount);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(recordDate) || recordDate !== today) {
    return { ok: false, reason: "invalid", payload: { ...payload, date: recordDate } };
  }

  if (userProgress.stamps.lastParticipationStampDate === recordDate || appliedStampQrIds.has(stampId)) {
    updateParticipationStampCard();
    updateProfileCard();
    showProfileTodayRecord();
    return { ok: true, reason: "already_applied" };
  }

  if (before >= getParticipationMaxCount()) {
    return { ok: false, reason: "max" };
  }

  addParticipationStamp();
  appliedStampQrIds.add(stampId);
  saveAppliedStampQrIds();
  appendOperationHistory({
    type: "participation_stamp",
    target: "受付QR 参加スタンプ",
    before,
    after: normalizeProgressCount(userProgress.stamps.participationCount),
  });
  syncAdminDraftFromProgress();
  updateParticipationStampCard();
  updateTeacherCards();
  updateRoundProgress();
  updateProfileCard();
  updateAdminPanel();
  showProfileTodayRecord();
  return { ok: true, reason: "applied" };
};

const refreshAfterTeacherStampChange = (teacherId) => {
  userProgress.stamps.teacherCircleRounds = getTeacherCircleRoundsFromCounts(userProgress.stamps.teacherLessonCounts);
  syncTeacherDetailsFromProgress();
  syncProgressRewards();
  saveUserProgress();
  syncAdminDraftFromProgress();
  renderTeacherGameRecords(teacherId);
  updateParticipationStampCard();
  updateTeacherCards();
  updateRoundProgress();
  updateProfileCard();
  updateAdminPanel();
};

const applyTeacherStampPayload = (payload = {}) => {
  const recordDate = normalizeQrDate(payload.date);
  const teacherId = typeof payload.teacherId === "string" ? payload.teacherId : "";
  const handicap = typeof payload.handicap === "string" && payload.handicap ? payload.handicap : "互先";
  const result = typeof payload.result === "string" && payload.result ? payload.result : "記録なし";
  const stampId = typeof payload.id === "string" && payload.id
    ? payload.id
    : `qr-${teacherId}-${recordDate}-${encodeQrValue(handicap, qrHandicapValues)}-${encodeQrValue(result, qrResultValues)}`;
  const teacher = teacherDetails[teacherId];

  if (!teacher || !/^\d{4}-\d{2}-\d{2}$/.test(recordDate)) {
    return { ok: false, reason: "invalid", payload: { ...payload, teacherId, date: recordDate } };
  }

  const currentCount = normalizeProgressCount(userProgress.stamps.teacherLessonCounts[teacherId]);
  if (appliedStampQrIds.has(stampId)) {
    if (!latestTeacherStampReflection && todayTeacherStampReflections.length === 0) {
      todayTeacherStampReflections = loadTodayTeacherStampReflections();
      latestTeacherStampReflection = todayTeacherStampReflections.at(-1) ?? null;
    }
    updateProfileCard();
    showProfileTodayRecord();
    return { ok: true, reason: "already_applied" };
  }

  if (currentCount >= getTeacherMaxCount(teacher)) {
    return { ok: false, reason: "max" };
  }

  const gameRecordId = `game-qr-${stampId}`;
  const before = currentCount;
  userProgress.stamps.teacherLessonCounts[teacherId] = clampProgressCount(before + 1, getTeacherMaxCount(teacher));
  const after = normalizeProgressCount(userProgress.stamps.teacherLessonCounts[teacherId]);

  gameRecords.push({
    id: gameRecordId,
    teacherId,
    date: recordDate,
    handicap,
    result,
    recordedAt: new Date().toISOString(),
  });
  saveGameRecords();

  latestTeacherStampReflection = buildTeacherStampReflection({
    gameRecordId,
    teacherId,
    before,
    after,
  });
  todayTeacherStampReflections = [...todayTeacherStampReflections, latestTeacherStampReflection].slice(-3);
  saveTodayTeacherStampReflections();
  appliedStampQrIds.add(stampId);
  saveAppliedStampQrIds();
  appendOperationHistory({
    type: "teacher_stamp",
    target: `${teacher.name} QR反映`,
    before,
    after,
  });
  refreshAfterTeacherStampChange(teacherId);
  showProfileTodayRecord();
  return { ok: true, reason: "applied" };
};

const applyStampQrFromLocation = () => {
  const payload = getStampPayloadFromLocation();
  if (!payload) {
    return false;
  }

  const result = payload.type === "participation_stamp"
    ? applyParticipationStampPayload(payload)
    : applyTeacherStampPayload(payload);
  if (window.history?.replaceState) {
    window.history.replaceState(null, "", getStampQrBaseUrl());
  }

  if (!result.ok) {
    showPanel("profile");
    latestTeacherStampReflection = null;
    todayTeacherStampReflections = [];
    if (profileLatestStamp) {
      profileLatestStamp.hidden = false;
    }
    if (profileLatestStampCopy) {
      profileLatestStampCopy.textContent = result.reason === "max"
        ? "この先生のスタンプはすでに達成済みです。"
        : result.reason === "invalid"
          ? `QRを開きましたが、先生または日付を読み取れませんでした。先生:${result.payload?.teacherId ?? "不明"} 日付:${result.payload?.date ?? "不明"}`
          : "QRを開きましたが、先生スタンプを反映できませんでした。新しいQRを作り直してください。";
    }
    scrollProfileTodayRecordIntoView();
  }

  return result.ok;
};

const cloneJsonData = (value) => JSON.parse(JSON.stringify(value));

const createBackupData = () => ({
  appId: backupAppId,
  formatVersion: backupFormatVersion,
  savedAt: new Date().toISOString(),
  progress: cloneJsonData(userProgress),
  operationHistory: cloneJsonData(operationHistory),
  teacherProfiles: cloneJsonData(teacherProfileOverrides),
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

  const sanitizedProgress = sanitizeProgress(progress);
  const sanitizedTeacherCounts = sanitizedProgress.stamps.teacherLessonCounts;

  for (const [teacherId, count] of Object.entries(teacherCounts)) {
    const teacher = teacherDetails[teacherId];

    if (!teacher) {
      continue;
    }

    if (!isValidBackupCount(count) || count > getTeacherMaxCount(teacher)) {
      throw new Error("先生ごとのスタンプ記録が正しくありません。");
    }
  }

  if (sanitizedProgress.stamps.teacherCircleRounds !== getTeacherCircleRoundsFromCounts(sanitizedTeacherCounts)) {
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
    progress: sanitizedProgress,
    operationHistory: backup.operationHistory.map(sanitizeOperationHistory).slice(-50),
    teacherProfiles: sanitizeTeacherProfileOverrides(backup.teacherProfiles ?? {}),
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

const addPendingGameRecord = (teacherId) => {
  const draft = getGameRecordDraft();
  const record = {
    id: `pending-game-${Date.now()}-${teacherId}`,
    teacherId,
    date: draft.date,
    handicap: draft.handicap,
    result: draft.result,
    recordedAt: new Date().toISOString(),
  };

  pendingGameRecords = pendingGameRecords.filter((item) => item.id !== record.id);
  pendingGameRecords.push(record);
  savePendingGameRecords();
  return record;
};

const renderTeacherGameRecords = (teacherId) => {
  if (!teacherGameRecordList) {
    return;
  }

  const records = gameRecords
    .filter((record) => record.teacherId === teacherId)
    .sort((a, b) => `${b.date}${b.recordedAt}`.localeCompare(`${a.date}${a.recordedAt}`));
  const pendingRecords = pendingGameRecords
    .filter((record) => record.teacherId === teacherId)
    .sort((a, b) => `${b.date}${b.recordedAt}`.localeCompare(`${a.date}${a.recordedAt}`));

  teacherGameRecordList.textContent = "";
  if (records.length === 0 && pendingRecords.length === 0) {
    const empty = document.createElement("p");
    empty.className = "game-record-empty";
    empty.textContent = "まだ対局記録はありません";
    teacherGameRecordList.append(empty);
    return;
  }

  for (const record of pendingRecords) {
    const item = document.createElement("article");
    item.className = "teacher-game-record-item is-pending";
    const date = document.createElement("time");
    const details = document.createElement("span");
    const status = document.createElement("small");
    date.dateTime = record.date;
    date.textContent = record.date.replaceAll("-", "/");
    details.textContent = `${record.handicap}・${record.result}`;
    status.textContent = "運営確認待ち";
    item.append(date, details, status);
    teacherGameRecordList.append(item);
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

const getConfiguredAdminPasscode = () => {
  try {
    return window.localStorage.getItem(adminPasscodeStorageKey) || "";
  } catch {
    return "";
  }
};

const isAdminPasscodeConfigured = () => getConfiguredAdminPasscode().length > 0;

const setConfiguredAdminPasscode = (passcode) => {
  window.localStorage.setItem(adminPasscodeStorageKey, passcode);
};

const isValidNewAdminPasscode = (passcode) => passcode.length >= 8;

const matchesConfiguredAdminPasscode = (passcode) =>
  isAdminPasscodeConfigured() && passcode === getConfiguredAdminPasscode();

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
  if (!matchesConfiguredAdminPasscode(operatorAuthInput.value)) {
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
  adminPasscodeMessage.textContent = isAdminPasscodeConfigured()
    ? "運営用の調整画面はロックされています。"
    : "公開用コードにはパスコードを入れていません。初回だけ、この運営端末でパスコードを設定します。";
  updateAdminLockState();
};

const unlockAdminPanel = () => {
  const enteredPasscode = adminPasscodeInput.value.trim();

  if (!isAdminPasscodeConfigured()) {
    if (!isValidNewAdminPasscode(enteredPasscode)) {
      adminPasscodeMessage.textContent = "初回設定です。8文字以上の運営用パスコードを入力してください。";
      adminPasscodeInput.select();
      return;
    }

    setConfiguredAdminPasscode(enteredPasscode);
    isAdminUnlocked = true;
    adminPasscodeMessage.textContent = "この端末に運営用パスコードを設定しました。";
    updateAdminLockState();
    updateAdminPanel();
    return;
  }

  if (!matchesConfiguredAdminPasscode(enteredPasscode)) {
    adminPasscodeMessage.textContent = "パスコードが違います。";
    adminPasscodeInput.select();
    return;
  }

  isAdminUnlocked = true;
  adminPasscodeMessage.textContent = "解除しました。";
  updateAdminLockState();
  updateAdminPanel();
};

const setAdminTroublePanelExpanded = (isExpanded) => {
  if (!adminTroubleToggle || !adminTroublePanel) {
    return;
  }

  adminTroublePanel.hidden = !isExpanded;
  adminTroubleToggle.textContent = isExpanded ? "閉じる" : "開く";
  adminTroubleToggle.setAttribute("aria-expanded", String(isExpanded));
};

const setAdminSettingsPanelExpanded = (isExpanded) => {
  if (!adminSettingsToggle || !adminSettingsPanel) {
    return;
  }

  adminSettingsPanel.hidden = !isExpanded;
  adminSettingsToggle.textContent = isExpanded ? "閉じる" : "開く";
  adminSettingsToggle.setAttribute("aria-expanded", String(isExpanded));
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
  userProgress.stamps.lastParticipationStampDate = getTodayForInput();
  syncProgressRewards();
  saveUserProgress();
};

const populateAdminGameRecordTeachers = () => {
  if (!adminGameRecordTeacher) {
    return;
  }

  adminGameRecordTeacher.textContent = "";
  for (const [teacherId, teacher] of Object.entries(teacherDetails)) {
    const option = document.createElement("option");
    option.value = teacherId;
    option.textContent = teacher.name;
    adminGameRecordTeacher.append(option);
  }
};

const populateAdminTeacherProfileEditor = () => {
  if (!adminTeacherProfileSelect) {
    return;
  }

  adminTeacherProfileSelect.textContent = "";
  for (const [teacherId, teacher] of Object.entries(teacherDetails)) {
    const option = document.createElement("option");
    option.value = teacherId;
    option.textContent = teacher.name;
    adminTeacherProfileSelect.append(option);
  }

  if (teacherDetails[activeTeacherKey]) {
    adminTeacherProfileSelect.value = activeTeacherKey;
  }
};

const syncAdminTeacherProfileEditor = () => {
  if (!adminTeacherProfileSelect || !adminTeacherProfileStyle || !adminTeacherProfileLesson || !adminTeacherProfileNote) {
    return;
  }

  const teacherId = adminTeacherProfileSelect.value || activeTeacherKey;
  const profile = getTeacherProfile(teacherId);

  if (!profile) {
    return;
  }

  adminTeacherProfileStyle.value = profile.style;
  adminTeacherProfileLesson.value = profile.lesson;
  adminTeacherProfileNote.value = profile.note;

  if (adminTeacherProfileState) {
    adminTeacherProfileState.textContent = teacherProfileOverrides[teacherId] ? "変更あり" : "初期文";
  }

  if (adminTeacherProfileMessage) {
    adminTeacherProfileMessage.textContent = "花図鑑の先生紹介に反映されます。";
  }
};

const markAdminTeacherProfileDirty = () => {
  if (adminTeacherProfileState) {
    adminTeacherProfileState.textContent = "未保存";
  }

  if (adminTeacherProfileMessage) {
    adminTeacherProfileMessage.textContent = "保存すると花図鑑の紹介欄に反映されます。";
  }
};

const saveAdminTeacherProfileEditor = () => {
  if (!adminTeacherProfileSelect || !adminTeacherProfileStyle || !adminTeacherProfileLesson || !adminTeacherProfileNote) {
    return;
  }

  const teacherId = adminTeacherProfileSelect.value;
  const teacher = teacherDetails[teacherId];

  if (!teacher) {
    return;
  }

  const nextProfile = {};
  for (const [field, element] of [
    ["style", adminTeacherProfileStyle],
    ["lesson", adminTeacherProfileLesson],
    ["note", adminTeacherProfileNote],
  ]) {
    const text = element.value.trim().slice(0, 120) || teacher[field];

    element.value = text;
    if (text !== teacher[field]) {
      nextProfile[field] = text;
    }
  }

  if (Object.keys(nextProfile).length > 0) {
    teacherProfileOverrides[teacherId] = nextProfile;
  } else {
    delete teacherProfileOverrides[teacherId];
  }

  saveTeacherProfileOverrides();

  if (teacherId === activeTeacherKey) {
    renderTeacherDetail(activeTeacherKey);
  }

  syncAdminTeacherProfileEditor();
  if (adminTeacherProfileState) {
    adminTeacherProfileState.textContent = "保存済み";
  }
  if (adminTeacherProfileMessage) {
    adminTeacherProfileMessage.textContent = `${teacher.name} の紹介文を保存しました。`;
  }
};

const resetAdminTeacherProfileEditor = () => {
  if (!adminTeacherProfileSelect) {
    return;
  }

  const teacherId = adminTeacherProfileSelect.value;
  const teacher = teacherDetails[teacherId];

  if (!teacher) {
    return;
  }

  delete teacherProfileOverrides[teacherId];
  saveTeacherProfileOverrides();

  if (teacherId === activeTeacherKey) {
    renderTeacherDetail(activeTeacherKey);
  }

  syncAdminTeacherProfileEditor();
  if (adminTeacherProfileState) {
    adminTeacherProfileState.textContent = "初期文";
  }
  if (adminTeacherProfileMessage) {
    adminTeacherProfileMessage.textContent = `${teacher.name} の紹介文を初期文に戻しました。`;
  }
};

const loadShrineTodayTeacherSettings = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(shrineTodayTeacherStorageKey) ?? "{}");
    return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  } catch {
    return {};
  }
};

let shrineTodayTeacherSettings = loadShrineTodayTeacherSettings();

const saveShrineTodayTeacherSettings = () => {
  if (!shrineTeacherList) {
    return;
  }

  shrineTodayTeacherSettings = Object.fromEntries(
    Object.keys(teacherDetails).map((teacherId) => {
      const input = shrineTeacherList.querySelector(`[data-shrine-teacher="${teacherId}"]`);
      const boardInput = shrineTeacherList.querySelector(`[data-shrine-teacher-boards="${teacherId}"]`);

      return [teacherId, {
        active: Boolean(input?.checked),
        boards: Math.max(1, Math.min(6, Number(boardInput?.value) || 3)),
      }];
    })
  );

  try {
    localStorage.setItem(shrineTodayTeacherStorageKey, JSON.stringify(shrineTodayTeacherSettings));
  } catch {
    // 当日の先生選択が保存できない環境でも、画面上の選択はそのまま使えます。
  }
};

const renderShrineTeachers = () => {
  if (!shrineTeacherList) {
    return;
  }

  shrineTeacherList.textContent = "";
  for (const [teacherId, teacher] of Object.entries(teacherDetails)) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    const copy = document.createElement("span");
    const name = document.createElement("strong");
    const guide = document.createElement("small");
    const boardControl = document.createElement("span");
    const boardLabel = document.createElement("span");
    const boardSelect = document.createElement("select");

    input.type = "checkbox";
    input.value = teacherId;
    input.checked = shrineTodayTeacherSettings[teacherId]?.active ?? true;
    input.dataset.shrineTeacher = teacherId;
    boardControl.className = "shrine-board-count";
    boardLabel.textContent = "面数";
    boardLabel.className = "shrine-board-label";
    boardSelect.dataset.shrineTeacherBoards = teacherId;
    boardSelect.setAttribute("aria-label", `${teacher.name} の面数`);
    for (let count = 1; count <= 6; count += 1) {
      const option = document.createElement("option");
      option.value = String(count);
      option.textContent = `${count}面`;
      option.selected = count === (shrineTodayTeacherSettings[teacherId]?.boards ?? 3);
      boardSelect.append(option);
    }
    name.textContent = teacher.name;
    guide.textContent = teacher.guide;
    copy.append(name, guide);
    boardControl.append(boardLabel, boardSelect);
    label.append(input, copy, boardControl);
    shrineTeacherList.append(label);
  }

  updateShrineTeacherCount();
};

const defaultShrineRoster = [
  "佐藤さん",
  "鈴木さん",
  "田中さん",
  "高橋さん",
  "伊藤さん",
  "山本さん",
  "中村さん",
  "小林さん",
  "加藤さん",
  "吉田さん",
  "山田さん",
  "渡辺さん",
  "青木さん",
  "石井さん",
  "上田さん",
  "遠藤さん",
  "岡田さん",
];

const shrineGenderLabel = {
  male: "男",
  female: "女",
};

const normalizeShrineGender = (value) => {
  const text = String(value ?? "").trim();
  if (["男", "男性", "男子", "male", "m"].includes(text.toLowerCase())) {
    return "male";
  }
  if (["女", "女性", "女子", "female", "f"].includes(text.toLowerCase())) {
    return "female";
  }
  return "";
};

const parseShrineStrength = (value) => {
  const text = String(value ?? "").trim();
  if (!text) {
    return { type: "", value: "", score: null };
  }

  const japaneseNumberMap = {
    初: 1,
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
  };
  const parseJapaneseNumber = (numberText) => {
    if (!numberText) {
      return null;
    }
    if (japaneseNumberMap[numberText] !== undefined) {
      return japaneseNumberMap[numberText];
    }
    const tenParts = numberText.split("十");
    if (tenParts.length === 2) {
      const tens = tenParts[0] ? japaneseNumberMap[tenParts[0]] : 1;
      const ones = tenParts[1] ? japaneseNumberMap[tenParts[1]] : 0;
      return tens && ones !== undefined ? tens * 10 + ones : null;
    }
    return null;
  };

  const pointMatch = text.match(/^(-?\d+(?:\.\d+)?)\s*(?:点|pt|point|points)?$/i);
  if (pointMatch) {
    const point = Number(pointMatch[1]);
    return { type: "point", value: String(point), score: point };
  }

  const danMatch = text.match(/^(\d+|初|[一二三四五六七八九十]+)\s*段$/);
  if (danMatch) {
    const rawDan = /^\d+$/.test(danMatch[1]) ? Number(danMatch[1]) : parseJapaneseNumber(danMatch[1]);
    const dan = Math.max(1, Math.min(9, Number(rawDan) || 1));
    return { type: "dan", value: String(dan), score: 1000 + dan * 100 };
  }

  const kyuMatch = text.match(/^(\d+|[一二三四五六七八九十]+)\s*級$/);
  if (kyuMatch) {
    const rawKyu = /^\d+$/.test(kyuMatch[1]) ? Number(kyuMatch[1]) : parseJapaneseNumber(kyuMatch[1]);
    const kyu = Math.max(1, Math.min(30, Number(rawKyu) || 1));
    return { type: "kyu", value: String(kyu), score: 1000 - kyu * 40 };
  }

  return { type: "", value: "", score: null };
};

const normalizeShrineStrength = (strength = {}) => {
  if (typeof strength === "string" || typeof strength === "number") {
    return parseShrineStrength(strength);
  }

  const type = String(strength.type ?? "").trim();
  const value = String(strength.value ?? "").trim();
  if (!type || !value) {
    return parseShrineStrength("");
  }
  if (type === "point") {
    return parseShrineStrength(`${value}点`);
  }
  if (type === "dan") {
    return parseShrineStrength(`${value}段`);
  }
  if (type === "kyu") {
    return parseShrineStrength(`${value}級`);
  }
  return parseShrineStrength("");
};

const formatShrineStrength = (strength = {}) => {
  const normalized = normalizeShrineStrength(strength);
  if (!normalized.type || !normalized.value) {
    return "";
  }
  if (normalized.type === "point") {
    return `${normalized.value}点`;
  }
  if (normalized.type === "dan") {
    return `${normalized.value}段`;
  }
  if (normalized.type === "kyu") {
    return `${normalized.value}級`;
  }
  return "";
};

const parseShrinePersonLine = (value) => {
  const text = String(value ?? "").trim();
  const tokens = text.split(/[\s　]+/).filter(Boolean);
  let gender = "";
  let strength = parseShrineStrength("");
  const nameTokens = [];

  for (const token of tokens) {
    const tokenGender = normalizeShrineGender(token);
    const tokenStrength = parseShrineStrength(token);
    if (tokenGender && !gender) {
      gender = tokenGender;
    } else if (tokenStrength.type && !strength.type) {
      strength = tokenStrength;
    } else {
      nameTokens.push(token);
    }
  }

  const name = nameTokens.join(" ").trim();

  return { name, gender, strength };
};

const formatShrinePersonLine = (person) => {
  const name = String(person?.name ?? "").trim();
  const gender = normalizeShrineGender(person?.gender);
  const strengthText = formatShrineStrength(person?.strength);
  return [name, gender ? shrineGenderLabel[gender] : "", strengthText].filter(Boolean).join(" ");
};

const normalizeRosterNames = (value) => {
  const rawItems = Array.isArray(value)
    ? value
    : String(value ?? "").split(/\r?\n|、|,/);
  const seen = new Set();
  const entries = [];

  for (const item of rawItems) {
    const person = typeof item === "object" && item !== null
      ? {
          name: String(item.name ?? "").trim(),
          gender: normalizeShrineGender(item.gender),
          strength: normalizeShrineStrength(item.strength),
        }
      : parseShrinePersonLine(item);

    if (!person.name || seen.has(person.name)) {
      continue;
    }

    seen.add(person.name);
    entries.push({
      name: person.name,
      gender: normalizeShrineGender(person.gender),
      strength: normalizeShrineStrength(person.strength),
    });
  }

  return entries;
};

const loadShrineRoster = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(shrineRosterStorageKey) ?? "[]");
    const names = normalizeRosterNames(stored);
    return names.length > 0 ? names : normalizeRosterNames(defaultShrineRoster);
  } catch {
    return normalizeRosterNames(defaultShrineRoster);
  }
};

let shrineRosterNames = loadShrineRoster();
let editingShrineRosterName = "";
let lastSavedShrineRosterName = "";

const saveShrineRoster = () => {
  try {
    localStorage.setItem(shrineRosterStorageKey, JSON.stringify(shrineRosterNames));
  } catch {
    // 名簿保存が使えない環境でも、当日の入力だけで使えるようにします。
  }
};

const setRosterStrengthValueMode = (input, type) => {
  if (!input) {
    return;
  }

  if (type === "point") {
    input.type = "text";
    input.removeAttribute("min");
    input.removeAttribute("step");
    input.inputMode = "text";
    input.pattern = "-?[0-9]*";
    input.placeholder = "0";
    return;
  }

  input.type = "text";
  input.min = "1";
  input.step = "1";
  input.inputMode = "numeric";
  input.pattern = "[0-9]*";
  input.placeholder = "数字";
};

const clearShrineRosterForm = () => {
  editingShrineRosterName = "";
  if (shrineRosterFormName) {
    shrineRosterFormName.value = "";
  }
  if (shrineRosterFormGender) {
    shrineRosterFormGender.value = "";
  }
  if (shrineRosterFormStrengthType) {
    shrineRosterFormStrengthType.value = "";
  }
  if (shrineRosterFormStrengthValue) {
    shrineRosterFormStrengthValue.value = "";
    setRosterStrengthValueMode(shrineRosterFormStrengthValue, "");
  }
};

const fillShrineRosterForm = (person = {}) => {
  const strength = normalizeShrineStrength(person.strength);
  editingShrineRosterName = String(person.name ?? "").trim();
  if (shrineRosterFormName) {
    shrineRosterFormName.value = editingShrineRosterName;
  }
  if (shrineRosterFormGender) {
    shrineRosterFormGender.value = normalizeShrineGender(person.gender);
  }
  if (shrineRosterFormStrengthType) {
    shrineRosterFormStrengthType.value = strength.type;
  }
  if (shrineRosterFormStrengthValue) {
    setRosterStrengthValueMode(shrineRosterFormStrengthValue, strength.type);
    shrineRosterFormStrengthValue.value = strength.value;
  }
};

const renderShrineRoster = () => {
  if (!shrineRosterList) {
    return;
  }

  const query = shrineRosterSearch?.value.trim().toLowerCase() ?? "";
  const selectedNames = new Set([...shrineRosterList.querySelectorAll("[data-shrine-roster-name]:checked")]
    .map((input) => input.dataset.shrineRosterName)
    .filter(Boolean));
  shrineRosterList.textContent = "";
  const visibleRosterNames = query
    ? shrineRosterNames.filter((person) => {
        const text = [
          person.name,
          normalizeShrineGender(person.gender) ? shrineGenderLabel[normalizeShrineGender(person.gender)] : "未設定",
          formatShrineStrength(person.strength) || "棋力未設定",
        ].join(" ").toLowerCase();
        return text.includes(query) || selectedNames.has(person.name);
      })
    : shrineRosterNames;

  for (const person of visibleRosterNames) {
    const row = document.createElement("div");
    const checkbox = document.createElement("input");
    const editButton = document.createElement("button");
    const name = document.createElement("strong");
    const meta = document.createElement("small");

    checkbox.type = "checkbox";
    checkbox.value = formatShrinePersonLine(person);
    checkbox.dataset.shrineRosterName = person.name;
    checkbox.checked = selectedNames.has(person.name);
    editButton.type = "button";
    editButton.dataset.shrineRosterEditName = person.name;
    name.textContent = person.name;
    meta.textContent = [
      normalizeShrineGender(person.gender) ? shrineGenderLabel[normalizeShrineGender(person.gender)] : "未設定",
      formatShrineStrength(person.strength) || "棋力未設定",
    ].join("・");
    editButton.append(name, meta);
    row.className = "shrine-roster-row";
    row.dataset.shrineRosterRow = person.name;
    row.append(checkbox, editButton);
    shrineRosterList.append(row);
  }
  return;

  if (shrineRosterEditorText) {
    shrineRosterEditorText.value = shrineRosterNames.map(formatShrinePersonLine).join("\n");
  }

  const updateStrengthValueInput = (input, type) => {
    if (type === "point") {
      input.type = "text";
      input.removeAttribute("min");
      input.removeAttribute("step");
      input.inputMode = "text";
      input.pattern = "-?[0-9]*";
      input.placeholder = "0";
      return;
    }

    input.type = "text";
    input.min = "1";
    input.step = "1";
    input.inputMode = "numeric";
    input.pattern = "[0-9]*";
    input.placeholder = "値";
  };

  for (const person of shrineRosterNames) {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    const nameInput = document.createElement("input");
    const genderSelect = document.createElement("select");
    const strengthType = document.createElement("select");
    const strengthValue = document.createElement("input");
    const strength = normalizeShrineStrength(person.strength);
    checkbox.type = "checkbox";
    checkbox.value = formatShrinePersonLine(person);
    checkbox.dataset.shrineRosterName = person.name;
    nameInput.type = "text";
    nameInput.value = person.name;
    nameInput.dataset.shrineRosterFullName = person.name;
    nameInput.setAttribute("aria-label", "フルネーム");
    genderSelect.dataset.shrineRosterGender = person.name;
    genderSelect.setAttribute("aria-label", `${person.name} の男女`);
    for (const [value, labelText] of [
      ["", "未設定"],
      ["female", "女"],
      ["male", "男"],
    ]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = labelText;
      option.selected = person.gender === value;
      genderSelect.append(option);
    }
    strengthType.dataset.shrineRosterStrengthType = person.name;
    strengthType.setAttribute("aria-label", `${person.name} の棋力方式`);
    for (const [value, labelText] of [
      ["", "棋力"],
      ["point", "点"],
      ["dan", "段"],
      ["kyu", "級"],
    ]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = labelText;
      option.selected = strength.type === value;
      strengthType.append(option);
    }
    strengthValue.type = "text";
    updateStrengthValueInput(strengthValue, strength.type);
    strengthValue.value = strength.value;
    strengthValue.dataset.shrineRosterStrengthValue = person.name;
    strengthValue.setAttribute("aria-label", `${person.name} の棋力`);
    label.append(checkbox, nameInput, genderSelect, strengthType, strengthValue);
    shrineRosterList.append(label);
  }
};

const updateShrineRosterStrengthValueInput = (input, type) => {
  if (!input) {
    return;
  }

  if (type === "point") {
    input.type = "text";
    input.removeAttribute("min");
    input.removeAttribute("step");
    input.inputMode = "text";
    input.pattern = "-?[0-9]*";
    input.placeholder = "0";
    return;
  }

  input.type = "text";
  input.min = "1";
  input.step = "1";
  input.inputMode = "numeric";
  input.pattern = "[0-9]*";
  input.placeholder = "値";
};

const setShrineRosterMessage = (message) => {
  if (shrineRosterMessage) {
    shrineRosterMessage.textContent = message;
  }
};

const updateShrineRosterApplyState = () => {
  if (!shrineRosterApply || !shrineRosterList) {
    return;
  }

  const selectedCount = shrineRosterList.querySelectorAll("[data-shrine-roster-name]:checked").length;
  shrineRosterApply.classList.toggle("has-selection", selectedCount > 0);
  shrineRosterApply.textContent = selectedCount > 0
    ? `${selectedCount}人を参加者欄へ入れる`
    : "選んだ人を参加者欄へ入れる";
};

const loadShrineRecords = () => {
  try {
    const records = JSON.parse(localStorage.getItem(shrineRecordStorageKey) ?? "[]");
    return Array.isArray(records) ? records.filter((record) => record?.body).slice(0, 12) : [];
  } catch {
    return [];
  }
};

let shrineRecords = loadShrineRecords();
let shrineMatchSession = null;
let latestPairgoGroups = [];
let shrineAmateurUsesCarriedGroups = false;

const saveShrineRecords = () => {
  try {
    localStorage.setItem(shrineRecordStorageKey, JSON.stringify(shrineRecords.slice(0, 12)));
  } catch {
    if (shrineRecordMessage) {
      shrineRecordMessage.textContent = "この端末では記録を保存できませんでした。";
    }
  }
};

const getShrineModeLabel = (mode = getShrineMode()) => ({
  lesson: "指導碁",
  amateur: "大会対戦",
  pairgo: "ペア・団体づくり",
})[mode] ?? "組み合わせ";

const getShrineRecordPreview = (body = "") => {
  const hiddenLines = new Set([
    "結果を確定",
    "次の回を作る",
    "必要なら、今の組み合わせを残せます。",
    "結果を出すと保存できるようになります。",
  ]);
  const lines = String(body)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !hiddenLines.has(line));

  return lines.slice(0, 3).join(" / ") || "保存した組み合わせです。";
};

const getShrineRecordJournalText = ({ mode, body = "" }) => {
  const text = String(body);
  const championMatch = text.match(/([0-9０-９]+番)[^\n]{0,12}優勝/);

  if (championMatch) {
    return `今日は大会対戦をして、${championMatch[1]}が優勝しました`;
  }

  if (mode === "pairgo") {
    const groupMatch = text.match(/([0-9０-９]+)組/);
    return groupMatch
      ? `今日はペア・団体を${groupMatch[1]}組作りました`
      : "今日はペア・団体づくりをしました";
  }

  if (mode === "amateur") {
    return text.includes("スイス方式")
      ? "今日はスイス方式の大会対戦をしました"
      : "今日は大会対戦をしました";
  }

  return "今日は指導碁の組み合わせを作りました";
};

const renderShrineRecords = () => {
  if (!shrineRecordList) {
    return;
  }

  shrineRecordList.textContent = "";
  if (shrineRecords.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "まだ残した組み合わせはありません。";
    shrineRecordList.append(empty);
    if (shrineRecordClear) {
      shrineRecordClear.disabled = true;
    }
    return;
  }

  if (shrineRecordClear) {
    shrineRecordClear.disabled = false;
  }

  for (const record of shrineRecords) {
    const article = document.createElement("article");
    const heading = document.createElement("div");
    const title = document.createElement("strong");
    const meta = document.createElement("small");
    const preview = document.createElement("p");
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const body = document.createElement("pre");

    article.className = "shrine-record";
    heading.className = "shrine-record-heading";
    title.textContent = record.title || "保存した組み合わせ案";
    meta.textContent = record.createdAt || "";
    preview.className = "shrine-record-preview";
    preview.textContent = getShrineRecordPreview(record.body);
    details.className = "shrine-record-details";
    summary.textContent = "内容を見る";
    body.textContent = record.body;
    heading.append(title, meta);
    details.append(summary, body);
    article.append(heading, preview, details);
    shrineRecordList.append(article);
  }
};

const getShrineResultMarkClass = (mark) => ({
  "〇": "is-win",
  "×": "is-loss",
  "△": "is-draw",
  "休": "is-rest",
  "・": "is-pending",
  "—": "is-pending",
})[mark] ?? "is-pending";

const shrineRecordWaitingMessage = "結果を出すと保存できるようになります。";
const shrineRecordReadyMessage = "必要なら、今の組み合わせを残せます。";

const updateShrineRecordSaveState = () => {
  if (!shrineRecordSave || !shrineResult) {
    return;
  }

  const canSave = Boolean(shrineResult.querySelector(".shrine-round-result"));
  shrineRecordSave.disabled = !canSave;
  if (shrineRecordMessage) {
    shrineRecordMessage.textContent = canSave ? shrineRecordReadyMessage : shrineRecordWaitingMessage;
  }
};

const getShrineParticipantPeople = () => {
  const rawPeople = (shrineParticipants?.value ?? "")
    .split(/\r?\n|、|,/)
    .map(parseShrinePersonLine)
    .filter((person) => person.name);
  const seen = new Set();
  const people = [];

  for (const person of rawPeople) {
    if (seen.has(person.name)) {
      continue;
    }
    seen.add(person.name);
    people.push(person);
  }

  return people;
};

const getShrineParticipantNames = () => getShrineParticipantPeople().map((person) => person.name);

const getShrineRawParticipantLines = () => (shrineParticipants?.value ?? "")
  .split(/\r?\n|、|,/)
  .map((name) => name.trim())
  .filter(Boolean);

const getShrinePreferMixedGender = () => Boolean(shrineMixedGenderPairs?.checked);
const getShrinePreferCloseStrength = () => Boolean(shrineCloseStrengthPairs?.checked);
const getShrinePreferBalancedStrength = () => Boolean(shrineBalancedTeamStrength?.checked);

const getShrineGenderLabel = (gender) => shrineGenderLabel[normalizeShrineGender(gender)] ?? "";

const formatShrineMemberName = (person) => {
  const genderLabel = getShrineGenderLabel(person.gender);
  return genderLabel ? `${person.name}（${genderLabel}）` : person.name;
};

const appendShrineParticipants = (names) => {
  if (!shrineParticipants) {
    return [];
  }

  const existingPeople = getShrineParticipantPeople();
  const peopleByName = new Map(existingPeople.map((person) => [person.name, { ...person }]));

  for (const name of names) {
    const person = parseShrinePersonLine(name);
    if (!person.name) {
      continue;
    }

    const existing = peopleByName.get(person.name);
    peopleByName.set(person.name, {
      name: person.name,
      gender: person.gender || existing?.gender || "",
      strength: normalizeShrineStrength(person.strength).type
        ? normalizeShrineStrength(person.strength)
        : normalizeShrineStrength(existing?.strength),
    });
  }

  const mergedLines = [...peopleByName.values()].map(formatShrinePersonLine);
  shrineParticipants.value = mergedLines.join("\n");
  return [...peopleByName.values()].map((person) => person.name);
};

const getSelectedShrineTeachers = () => {
  if (!shrineTeacherList) {
    return [];
  }

  return [...shrineTeacherList.querySelectorAll("[data-shrine-teacher]:checked")]
    .map((input) => {
      const boardsInput = shrineTeacherList.querySelector(`[data-shrine-teacher-boards="${input.value}"]`);
      const boards = Math.max(1, Math.min(12, Number(boardsInput?.value) || 1));

      return {
        id: input.value,
        boards,
        ...teacherDetails[input.value],
      };
    })
    .filter((teacher) => teacher.name);
};

const renderShrineActiveTeachers = (selectedTeachers = getSelectedShrineTeachers()) => {
  if (!shrineActiveTeacherList) {
    return;
  }

  shrineActiveTeacherList.textContent = "";

  if (selectedTeachers.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "今日来ている先生を選んでください。";
    shrineActiveTeacherList.append(empty);
    return;
  }

  for (const teacher of selectedTeachers) {
    const cycleProgress = getCurrentTeacherCycleProgress(teacher);
    const item = document.createElement("article");
    const flower = document.createElement("span");
    const flowerIcon = document.createElement("span");
    const seal = document.createElement("span");
    const copy = document.createElement("span");
    const name = document.createElement("strong");
    const detail = document.createElement("small");
    const boardBadge = document.createElement("em");

    item.className = "shrine-active-teacher-card";
    flower.className = "shrine-active-teacher-flower";
    flowerIcon.className = "shrine-active-teacher-flower-icon";
    seal.className = "shrine-active-teacher-seal";
    seal.setAttribute("aria-hidden", "true");
    boardBadge.className = "shrine-active-teacher-board";
    name.textContent = teacher.name;
    detail.textContent = teacher.guide;
    boardBadge.textContent = `${teacher.boards}面`;
    applyFlowerVariables(item, cycleProgress.cycle);
    applyFlowerVisual(flowerIcon, cycleProgress.cycle);
    flower.append(flowerIcon, seal);
    copy.append(name, detail);
    item.append(flower, copy, boardBadge);
    shrineActiveTeacherList.append(item);
  }
};

const updateShrineTeacherCount = () => {
  if (!shrineTeacherCount) {
    return;
  }

  const selectedTeachers = getSelectedShrineTeachers();
  const totalBoards = selectedTeachers.reduce((total, teacher) => total + teacher.boards, 0);
  shrineTeacherCount.textContent = `${selectedTeachers.length}人・${totalBoards}面`;
  renderShrineActiveTeachers(selectedTeachers);
};

const getShrineRoundCount = () =>
  Math.max(1, Math.min(4, Number(shrineRoundCount?.value) || 1));

const getShrineMode = () =>
  [...shrineModeButtons].find((button) => button.classList.contains("is-active"))?.dataset.shrineMode ?? "lesson";

const shrineModeSpeech = {
  lesson: {
    fox: "今日はどんな\nご縁を結ぶ？",
    otter: "石の準備\nできてるよ！",
  },
  amateur: {
    fox: "よい対戦のご縁を結びましょう。",
    otter: "対戦札を並べておきました！",
  },
  pairgo: {
    fox: "ペアと団体のご縁を整えましょう。",
    otter: "番号札もできてるよ！",
  },
};

const updateShrineGuideSpeech = (mode = getShrineMode()) => {
  const speech = shrineModeSpeech[mode] ?? shrineModeSpeech.lesson;

  if (shrineFoxSpeech) {
    shrineFoxSpeech.textContent = speech.fox;
  }
  if (shrineOtterSpeech) {
    shrineOtterSpeech.textContent = speech.otter;
  }
};

const updateShrineParticipantInputVisibility = (mode = getShrineMode()) => {
  const shouldHideCarriedInputs = mode === "amateur" && shrineAmateurUsesCarriedGroups;

  if (shrineNumberEntryCard) {
    shrineNumberEntryCard.hidden = shouldHideCarriedInputs || mode !== "amateur";
  }
  if (shrineParticipantCard) {
    shrineParticipantCard.hidden = shouldHideCarriedInputs;
  }
  if (shrineQuickAddPanel) {
    shrineQuickAddPanel.hidden = shouldHideCarriedInputs;
  }
};

const getShrineCollapsiblePanel = (button) => {
  const key = button?.dataset.shrineCollapsibleToggle;
  return key ? document.querySelector(`[data-shrine-collapsible="${key}"]`) : null;
};

const getShrineCollapsibleLabel = (key, isOpen) => {
  const labels = {
    "pairgo-settings": isOpen ? "細かい設定を閉じる" : "細かい設定を開く",
    wishes: isOpen ? "希望条件を閉じる" : "希望条件を開く",
  };
  return labels[key] ?? (isOpen ? "閉じる" : "開く");
};

const syncShrineCollapsibleButton = (button) => {
  const panel = getShrineCollapsiblePanel(button);
  const key = button?.dataset.shrineCollapsibleToggle;

  if (!button || !panel || !key) {
    return;
  }

  const isOpen = !panel.hidden;
  button.textContent = getShrineCollapsibleLabel(key, isOpen);
  button.setAttribute("aria-expanded", String(isOpen));
};

const toggleShrineCollapsiblePanel = (button) => {
  const panel = getShrineCollapsiblePanel(button);

  if (!panel) {
    return;
  }

  panel.hidden = !panel.hidden;
  syncShrineCollapsibleButton(button);
};

const updateShrineMode = (mode = getShrineMode()) => {
  const isAmateur = mode === "amateur";
  const isPairgo = mode === "pairgo";

  for (const button of shrineModeButtons) {
    const isSelected = button.dataset.shrineMode === mode;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  }

  for (const button of shrinePathModeButtons) {
    const isSelected = button.dataset.shrinePathMode === mode;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  }

  for (const item of shrineLessonOnlyItems) {
    item.hidden = isAmateur || isPairgo;
  }

  for (const item of shrineAmateurOnlyItems) {
    item.hidden = !isAmateur;
  }

  for (const item of shrinePairgoOnlyItems) {
    item.hidden = !isPairgo;
  }

  if (shrineModeKicker) {
    shrineModeKicker.textContent = isPairgo
      ? "ペア・団体プリセット"
      : isAmateur
        ? "大会対戦プリセット"
        : "水曜会プリセット";
  }
  if (shrineModeTitle) {
    shrineModeTitle.textContent = isPairgo
      ? "ペア・団体を作って番号を付ける"
      : isAmateur
        ? "個人や組番号で大会対戦を作る"
        : "先生ごとの多面打ちで組み合わせ";
  }
  if (shrineModeCopy) {
    shrineModeCopy.textContent = isPairgo
      ? "決まっている組を先に使い、当日の人をペアや団体にして番号を出します。"
      : isAmateur
        ? "個人名やペア・団体番号から、一対一の対戦組み合わせを出します。"
        : "先生ごとに面数と回数を決め、指導碁の組み合わせを出します。";
  }

  updateShrineGuideSpeech(mode);
  updateShrineParticipantInputVisibility(mode);
};

const enterShrinePanel = () => {
  renderShrineTeachers();
  updateShrineGuideSpeech();
  showPanel("shrine");
};

const clearShrineIntroTimers = () => {
  for (const timerId of shrineIntroTimerIds) {
    window.clearTimeout(timerId);
  }
  shrineIntroTimerIds = [];
};

const finishShrineIntro = () => {
  clearShrineIntroTimers();
  enterShrinePanel();
  if (shrineIntro) {
    shrineIntro.classList.remove("is-playing");
    shrineIntro.hidden = true;
  }
  isShrineIntroPlaying = false;
};

const openShrineWithIntro = () => {
  if (isShrineIntroPlaying) {
    return;
  }

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (!shrineIntro || prefersReducedMotion) {
    enterShrinePanel();
    return;
  }

  clearShrineIntroTimers();
  isShrineIntroPlaying = true;
  enterShrinePanel();
  shrineIntro.hidden = false;
  shrineIntro.classList.remove("is-playing");
  shrineIntro.offsetHeight;
  shrineIntro.classList.add("is-playing");
  if (shrineIntroCaption) {
    shrineIntroCaption.textContent = "参道の入口に立ちます";
  }

  const introCaptions = [
    { at: 750, text: "狐の巫女が鳥居へ案内します" },
    { at: 1850, text: "赤い鳥居へ向かって進みます" },
    { at: 2850, text: "二人の狐の間を、ゆっくりくぐります" },
    { at: 4700, text: "神社の奥でラッコが待っています" },
    { at: 6350, text: "ご縁を結ぶ準備ができました" },
    { at: 7400, text: "組み合わせ神社へ入ります" },
  ];

  for (const caption of introCaptions) {
    const timerId = window.setTimeout(() => {
      if (shrineIntroCaption && isShrineIntroPlaying) {
        shrineIntroCaption.textContent = caption.text;
      }
    }, caption.at);
    shrineIntroTimerIds.push(timerId);
  }

  shrineIntroTimerIds.push(window.setTimeout(finishShrineIntro, 8100));
};

const renderLessonShrineResult = (participants, roundCount) => {
  const selectedTeachers = getSelectedShrineTeachers();

  if (selectedTeachers.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "今日来ている先生を1人以上選んでください。";
    shrineResult.append(empty);
    return;
  }

  const maxBoards = Math.max(...selectedTeachers.map((teacher) => teacher.boards));
  const slots = [];
  for (let boardNumber = 1; boardNumber <= maxBoards; boardNumber += 1) {
    for (const teacher of selectedTeachers) {
      if (teacher.boards >= boardNumber) {
        slots.push({ teacher, boardNumber });
      }
    }
  }
  const roundResults = [];
  let totalMatchedCount = 0;
  let totalWaitingCount = 0;

  for (let roundIndex = 0; roundIndex < roundCount; roundIndex += 1) {
    const rotatedParticipants = participants.map((_, index) => participants[(index + roundIndex * slots.length) % participants.length]);
    const matchedCount = Math.min(rotatedParticipants.length, slots.length);
    const waiting = rotatedParticipants.slice(matchedCount);
    const assignments = selectedTeachers.map((teacher) => ({ teacher, participants: [] }));

    for (let index = 0; index < matchedCount; index += 1) {
      const slot = slots[index];
      const group = assignments.find((item) => item.teacher.id === slot.teacher.id);
      group?.participants.push({
        name: rotatedParticipants[index],
        boardNumber: slot.boardNumber,
      });
    }

    roundResults.push({
      roundNumber: roundIndex + 1,
      matchedCount,
      waiting,
      assignments,
    });
    totalMatchedCount += matchedCount;
    totalWaitingCount += waiting.length;
  }

  const heading = document.createElement("div");
  const title = document.createElement("strong");
  const oracle = document.createElement("p");

  heading.className = "shrine-result-heading";
  title.textContent = "今日の組み合わせ";
  oracle.textContent = totalWaitingCount > 0
    ? `${roundCount}回分で${totalMatchedCount}面を組みました。待機が出る回があります。`
    : `${roundCount}回分で${totalMatchedCount}面を組みました。`;
  heading.append(title, oracle);

  shrineResult.append(heading);
  const recordNote = document.createElement("p");
  const recordNoteStart = document.createElement("span");
  const recordNoteText = document.createElement("span");
  const recordNoteEnd = document.createElement("span");
  recordNote.className = "shrine-result-note";
  recordNoteStart.className = "shrine-result-note-flower";
  recordNoteEnd.className = "shrine-result-note-flower";
  recordNoteText.className = "shrine-result-note-text";
  recordNoteStart.textContent = "✿";
  recordNoteText.textContent = "花図鑑へ記入してください";
  recordNoteEnd.textContent = "✿";
  recordNote.append(recordNoteStart, recordNoteText, recordNoteEnd);
  shrineResult.append(recordNote);

  for (const round of roundResults) {
    const roundBlock = document.createElement("article");
    const roundTitle = document.createElement("h3");
    const groups = document.createElement("div");

    roundBlock.className = "shrine-round-result";
    roundTitle.textContent = `${round.roundNumber}回目`;
    groups.className = "shrine-result-groups";

    for (const group of round.assignments.filter((item) => item.participants.length > 0)) {
      const teacherBlock = document.createElement("article");
      const teacherName = document.createElement("strong");
      const teacherMeta = document.createElement("small");
      const list = document.createElement("ol");

      teacherBlock.className = "shrine-teacher-result";
      teacherName.textContent = group.teacher.name;
      teacherMeta.textContent = `${group.participants.length}/${group.teacher.boards}面`;

      for (const participant of group.participants) {
        const item = document.createElement("li");
        const order = document.createElement("span");
        const participantName = document.createElement("strong");
        order.textContent = `${participant.boardNumber}面`;
        participantName.textContent = participant.name;
        item.append(order, participantName);
        list.append(item);
      }

      teacherBlock.append(teacherName, teacherMeta, list);
      groups.append(teacherBlock);
    }

    roundBlock.append(roundTitle, groups);

    if (round.waiting.length > 0) {
      const waitBox = document.createElement("div");
      const waitTitle = document.createElement("strong");
      const waitNames = document.createElement("span");
      waitBox.className = "shrine-waiting";
      waitTitle.textContent = "待機";
      waitNames.textContent = round.waiting.join("、");
      waitBox.append(waitTitle, waitNames);
      roundBlock.append(waitBox);
    }

    shrineResult.append(roundBlock);
  }
};

const createAmateurRound = (names, roundIndex) => {
  const players = names.length % 2 === 0 ? [...names] : [...names, null];
  const fixed = players[0];
  let rotating = players.slice(1);

  for (let index = 0; index < roundIndex; index += 1) {
    rotating = [rotating.at(-1), ...rotating.slice(0, -1)];
  }

  const arranged = [fixed, ...rotating];
  const pairs = [];
  let waiting = null;

  for (let index = 0; index < arranged.length / 2; index += 1) {
    const left = arranged[index];
    const right = arranged[arranged.length - 1 - index];

    if (!left || !right) {
      waiting = left || right;
      continue;
    }

    pairs.push([left, right]);
  }

  return { pairs, waiting };
};

const getShrineMatchMethod = () =>
  shrineMatchMethodShortcut?.value || shrineMatchMethod?.value || "shuffle";

const syncShrineMatchMethodControls = (value = getShrineMatchMethod()) => {
  if (shrineMatchMethod && shrineMatchMethod.value !== value) {
    shrineMatchMethod.value = value;
  }
  if (shrineMatchMethodShortcut && shrineMatchMethodShortcut.value !== value) {
    shrineMatchMethodShortcut.value = value;
  }
};

const setShrineMatchMethod = (value = "shuffle") => {
  syncShrineMatchMethodControls(value);
  shrineMatchSession = null;
};

const getShrineMatchMethodLabel = (method = getShrineMatchMethod()) => ({
  shuffle: "交流戦・遊びイベント",
  tournament: "トーナメント初回",
  swiss: "スイス方式初回",
})[method] ?? "交流戦・遊びイベント";

const getShrineSessionMethodLabel = (method = getShrineMatchMethod()) => ({
  shuffle: "交流戦・遊びイベント",
  tournament: "トーナメント方式",
  swiss: "スイス方式",
})[method] ?? "交流戦・遊びイベント";

const getSwissRoundLimit = (entryCount) =>
  Math.max(1, Math.ceil(Math.log2(Math.max(2, entryCount))));

const getShrineRoundLabel = (roundNumber, method = shrineMatchSession?.method) =>
  method === "swiss" ? `${roundNumber}回戦` : `${roundNumber}回目`;

const canAdvanceShrineMatchSession = () => {
  if (!shrineMatchSession) {
    return false;
  }

  const latestRound = shrineMatchSession.rounds.at(-1);
  if (!latestRound?.pairs.length) {
    return false;
  }

  if (shrineMatchSession.method === "swiss") {
    if (latestRound.pairs.some((pair) => !pair.result)) {
      return false;
    }
    return shrineMatchSession.rounds.length < getSwissRoundLimit(shrineMatchSession.entries.length);
  }

  if (shrineMatchSession.method === "tournament") {
    if (latestRound.pairs.some((pair) => !pair.result)) {
      return false;
    }

    const advancingCount = latestRound.pairs.reduce((total, pair) => {
      if (pair.result === "draw") {
        return total + 2;
      }
      return pair.result ? total + 1 : total;
    }, getShrineRoundWaitingEntries(latestRound).length);

    return advancingCount > 1;
  }

  return true;
};

const normalizeShrineNumber = (value) =>
  Number(String(value).replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0)));

const parseShrineNumberedEntry = (name) => {
  const match = String(name).trim().match(/^(\d+|[０-９]+)\s*番(?:\s*(.*))?$/);
  if (!match) {
    return null;
  }

  return {
    number: normalizeShrineNumber(match[1]),
    entryName: match[2]?.trim() || "ペア・団体・個人",
  };
};

const normalizeShrineEntry = (name, index, assignedNumber = index + 1) => {
  const numberedEntry = parseShrineNumberedEntry(name);
  const entryNumber = numberedEntry?.number || assignedNumber;
  const entryName = numberedEntry?.entryName || name;
  const numberLabel = `${entryNumber}番`;
  const label = numberedEntry && entryName === "ペア・団体・個人"
    ? numberLabel
    : `${numberLabel} ${entryName}`;

  return {
    id: `entry-${entryNumber}-${index + 1}-${name}`,
    number: entryNumber,
    raw: name,
    numberLabel,
    entryName,
    label,
    score: 0,
  };
};

const createShrineEntries = (participants) => {
  const usedNumbers = new Set(participants
    .map(parseShrineNumberedEntry)
    .filter(Boolean)
    .map((entry) => entry.number));
  let nextNumber = 1;

  return participants.map((name, index) => {
    if (parseShrineNumberedEntry(name)) {
      return normalizeShrineEntry(name, index);
    }

    while (usedNumbers.has(nextNumber)) {
      nextNumber += 1;
    }

    const entry = normalizeShrineEntry(name, index, nextNumber);
    usedNumbers.add(nextNumber);
    nextNumber += 1;
    return entry;
  });
};

const createEntryRound = (entries, roundIndex = 0) => {
  const players = entries.length % 2 === 0 ? [...entries] : [...entries, null];
  const fixed = players[0];
  let rotating = players.slice(1);

  for (let index = 0; index < roundIndex; index += 1) {
    rotating = [rotating.at(-1), ...rotating.slice(0, -1)];
  }

  const arranged = [fixed, ...rotating];
  const pairs = [];
  let waiting = null;

  for (let index = 0; index < arranged.length / 2; index += 1) {
    const left = arranged[index];
    const right = arranged[arranged.length - 1 - index];

    if (!left || !right) {
      waiting = left || right;
      continue;
    }

    pairs.push({ left, right, result: "" });
  }

  return { pairs, waiting };
};

const createAdjacentEntryRound = (entries) => {
  const pairs = [];
  let waiting = null;

  for (let index = 0; index < entries.length; index += 2) {
    const left = entries[index];
    const right = entries[index + 1];

    if (!right) {
      waiting = left;
      continue;
    }

    pairs.push({ left, right, result: "" });
  }

  return { pairs, waiting };
};

const getShrineRoundWaitingEntries = (round) => {
  if (Array.isArray(round?.waitingEntries)) {
    return round.waitingEntries.filter(Boolean);
  }
  return round?.waiting ? [round.waiting] : [];
};

const createShrineRound = ({ pairs, waitingEntries = [], advanceSlots = null }) => ({
  pairs,
  waiting: waitingEntries[0] || null,
  waitingEntries,
  ...(advanceSlots ? { advanceSlots } : {}),
});

const isShrinePowerOfTwo = (value) => value > 0 && (value & (value - 1)) === 0;

const createShrineTournamentInitialRound = (entries) => {
  if (entries.length <= 1) {
    return createShrineRound({
      pairs: [],
      waitingEntries: [...entries],
      advanceSlots: entries.length ? [{ type: "waiting", index: 0 }] : [],
    });
  }

  let contestants = [...entries];
  const waitingEntries = [];
  const startsWithWaiting = entries.length % 2 === 1;
  const endsWithWaiting = entries.length > 2
    && entries.length % 2 === 0
    && !isShrinePowerOfTwo(entries.length);

  if (startsWithWaiting) {
    waitingEntries.push(entries[0]);
    contestants = entries.slice(1);
  } else if (endsWithWaiting) {
    waitingEntries.push(entries[0], entries.at(-1));
    contestants = entries.slice(1, -1);
  }

  const pairs = [];
  for (let index = 0; index < contestants.length; index += 2) {
    const left = contestants[index];
    const right = contestants[index + 1];
    if (!right) {
      waitingEntries.push(left);
      continue;
    }
    pairs.push({ left, right, result: "" });
  }

  const advanceSlots = [];
  if (startsWithWaiting || endsWithWaiting) {
    advanceSlots.push({ type: "waiting", index: 0 });
  }
  for (let index = 0; index < pairs.length; index += 1) {
    advanceSlots.push({ type: "pair", index });
  }
  if (endsWithWaiting && waitingEntries[1]) {
    advanceSlots.push({ type: "waiting", index: 1 });
  }

  return createShrineRound({ pairs, waitingEntries, advanceSlots });
};

const createShrineMatchSession = (entries, method) => {
  const sessionEntries = entries.map((entry) => ({ ...entry, score: 0 }));
  const firstRound = method === "tournament"
    ? createShrineTournamentInitialRound(sessionEntries)
    : createEntryRound(sessionEntries, 0);

  return {
    method,
    entries: sessionEntries,
    rounds: [{
      roundNumber: 1,
      ...firstRound,
    }],
    message: "",
  };
};

const renderShrineEntryList = (entries) => {
  const entryBlock = document.createElement("article");
  const entryTitle = document.createElement("h3");
  const entryList = document.createElement("ol");
  const numberOnly = entries.every((entry) => entry.entryName === "ペア・団体・個人");

  entryBlock.className = "shrine-round-result is-entry-list";
  entryTitle.textContent = "出場番号";
  entryList.className = numberOnly ? "shrine-entry-list is-number-only" : "shrine-entry-list";

  for (const entry of entries) {
    const item = document.createElement("li");
    const number = document.createElement("span");
    const name = document.createElement("strong");
    const hasName = entry.entryName !== "ペア・団体・個人";
    item.className = hasName ? "" : "is-number-only";
    number.textContent = entry.numberLabel;
    name.textContent = hasName ? entry.entryName : "";
    item.append(number);
    if (hasName) {
      item.append(name);
    }
    entryList.append(item);
  }

  entryBlock.append(entryTitle, entryList);
  shrineResult.append(entryBlock);
};

const syncVisibleShrineMatchResults = () => {
  if (!shrineMatchSession || !shrineResult) {
    return;
  }

  for (const input of shrineResult.querySelectorAll("[data-shrine-match-result]")) {
    const roundIndex = Number(input.dataset.roundIndex);
    const matchIndex = Number(input.dataset.matchIndex);
    const pair = shrineMatchSession.rounds[roundIndex]?.pairs[matchIndex];
    if (pair) {
      pair.result = input.value;
    }
  }
};

const getShrineEntryRoundMark = (entry, round) => {
  if (getShrineRoundWaitingEntries(round).some((waiting) => waiting.id === entry.id)) {
    return { mark: "休", score: 1 };
  }

  const pair = round.pairs.find((item) => item.left.id === entry.id || item.right.id === entry.id);
  if (!pair) {
    return { mark: "・", score: 0 };
  }
  if (!pair.result) {
    return { mark: "—", score: 0 };
  }
  if (pair.result === "draw") {
    return { mark: "△", score: 0.5 };
  }

  const isLeft = pair.left.id === entry.id;
  const isWin = (pair.result === "left" && isLeft) || (pair.result === "right" && !isLeft);
  return { mark: isWin ? "〇" : "×", score: isWin ? 1 : 0 };
};

const getShrinePairWinner = (pair) => {
  if (!pair?.result || pair.result === "draw") {
    return null;
  }
  return pair.result === "left" ? pair.left : pair.right;
};

const getShrineTournamentAdvancingEntries = (round, { preview = false, applyScores = false } = {}) => {
  const waitingEntries = getShrineRoundWaitingEntries(round);
  const slots = round.advanceSlots || [
    ...round.pairs.map((_, index) => ({ type: "pair", index })),
    ...waitingEntries.map((_, index) => ({ type: "waiting", index })),
  ];
  const entries = [];
  let previewIndex = 1;

  for (const slot of slots) {
    if (slot.type === "waiting") {
      const waiting = waitingEntries[slot.index];
      if (waiting) {
        if (applyScores) {
          waiting.score += 1;
        }
        entries.push(waiting);
      }
      continue;
    }

    const pair = round.pairs[slot.index];
    if (!pair) {
      continue;
    }

    if (pair.result === "left") {
      if (applyScores) {
        pair.left.score += 1;
      }
      entries.push(pair.left);
    } else if (pair.result === "right") {
      if (applyScores) {
        pair.right.score += 1;
      }
      entries.push(pair.right);
    } else if (pair.result === "draw") {
      if (applyScores) {
        pair.left.score += 0.5;
        pair.right.score += 0.5;
      }
      if (shrineMatchSession?.method === "tournament") {
        entries.push(pair.left, pair.right);
      }
    } else if (preview) {
      entries.push(createShrineTournamentPreviewEntry(previewIndex));
      previewIndex += 1;
    }
  }

  return entries;
};

const createShrineTournamentPreviewEntry = (index) => ({
  id: `preview-${index}`,
  numberLabel: "?",
  entryName: "勝者",
});

const getShrineTournamentEntryName = (entry) =>
  entry.entryName === "ペア・団体・個人" ? "" : entry.entryName;

const getShrineTournamentRoundLabel = (roundNumber, finalRoundNumber) =>
  roundNumber === finalRoundNumber ? "決勝戦" : `${roundNumber}回戦`;

const createShrineTournamentMatchElement = (pair, { preview = false, waiting = false, final = false } = {}) => {
  const match = document.createElement("article");
  const winner = getShrinePairWinner(pair);
  const winnerChip = document.createElement("span");

  match.className = [
    "shrine-tournament-match",
    winner ? "has-winner" : "",
    preview ? "is-preview" : "",
    waiting ? "is-waiting" : "",
    final ? "is-final" : "",
  ].filter(Boolean).join(" ");
  winnerChip.className = "shrine-tournament-winner";
  winnerChip.textContent = waiting ? "休" : winner ? winner.numberLabel.replace("番", "") : "?";

  if (waiting) {
    const player = document.createElement("span");
    const number = document.createElement("em");
    const name = document.createElement("strong");
    player.className = "shrine-tournament-player is-winner";
    number.textContent = pair.left.numberLabel.replace("番", "");
    name.textContent = getShrineTournamentEntryName(pair.left);
    player.append(number, name);
    match.append(winnerChip, player);
    return match;
  }

  const branch = document.createElement("span");
  const contenders = document.createElement("div");
  branch.className = "shrine-tournament-branch";
  contenders.className = "shrine-tournament-contenders";

  for (const side of [pair.left, pair.right]) {
    const player = document.createElement("span");
    const number = document.createElement("em");
    const name = document.createElement("strong");
    const isWinner = winner?.id === side.id;
    player.className = [
      "shrine-tournament-player",
      isWinner ? "is-winner" : "",
      winner && !isWinner ? "is-loser" : "",
      side.id?.startsWith("preview-") ? "is-placeholder" : "",
    ].filter(Boolean).join(" ");
    number.textContent = side.numberLabel.replace("番", "");
    name.textContent = getShrineTournamentEntryName(side);
    player.append(number, name);
    contenders.append(player);
  }

  match.append(winnerChip, branch, contenders);
  return match;
};

const renderShrineTournamentPreviewRound = (latestRound, finalRoundNumber) => {
  if (!latestRound || latestRound.pairs.length <= 1) {
    return null;
  }

  const advancing = getShrineTournamentAdvancingEntries(latestRound, { preview: true });

  if (advancing.length <= 1) {
    return null;
  }

  const column = document.createElement("section");
  const heading = document.createElement("strong");
  const matches = document.createElement("div");
  column.className = "shrine-tournament-round is-preview";
  heading.textContent = getShrineTournamentRoundLabel(latestRound.roundNumber + 1, finalRoundNumber);
  matches.className = "shrine-tournament-matches";
  column.append(heading, matches);

  for (let index = 0; index < advancing.length; index += 2) {
    const left = advancing[index];
    const right = advancing[index + 1];
    if (!right) {
      matches.append(createShrineTournamentMatchElement({ left }, { preview: true, waiting: true }));
      continue;
    }
    matches.append(createShrineTournamentMatchElement({ left, right, result: "" }, { preview: true }));
  }

  return column;
};

const createShrineTournamentPreviewRoundFromEntries = (entries, roundNumber) => ({
  roundNumber,
  isPreview: true,
  ...createAdjacentEntryRound(entries),
});

const getShrineTournamentDisplayRounds = () => {
  const rounds = [...shrineMatchSession.rounds];
  let latestRound = rounds.at(-1);
  let guard = 0;

  while (latestRound && guard < 8) {
    const advancing = getShrineTournamentAdvancingEntries(latestRound, { preview: true });
    if (advancing.length <= 1) {
      break;
    }

    const previewRound = createShrineTournamentPreviewRoundFromEntries(advancing, rounds.length + 1);
    rounds.push(previewRound);
    latestRound = previewRound;
    guard += 1;
  }

  return rounds;
};

const appendShrineTournamentSideColumn = (side, round, pairs) => {
  const column = document.createElement("section");
  const heading = document.createElement("strong");
  const matches = document.createElement("div");

  column.className = [
    "shrine-tournament-round",
    "is-large",
    side === "right" ? "is-right-side" : "is-left-side",
    round.isPreview ? "is-preview" : "",
  ].filter(Boolean).join(" ");
  heading.textContent = getShrineTournamentRoundLabel(round.roundNumber, getShrineTournamentDisplayRounds().at(-1)?.roundNumber ?? round.roundNumber);
  matches.className = "shrine-tournament-matches";
  column.append(heading, matches);

  for (const pair of pairs) {
    const match = createShrineTournamentMatchElement(pair, { preview: Boolean(round.isPreview) });
    match.classList.add("is-large", side === "right" ? "is-right-side" : "is-left-side");
    matches.append(match);
  }

  return column;
};

const renderShrineLargeTournamentBracket = () => {
  if (!isShrinePowerOfTwo(shrineMatchSession.entries.length) || shrineMatchSession.entries.length < 8) {
    return null;
  }

  const rounds = getShrineTournamentDisplayRounds();
  const finalRoundNumber = rounds.at(-1)?.roundNumber ?? 1;
  if (!rounds.some((round) => round.pairs.length > 0)) {
    return null;
  }

  const bracket = document.createElement("div");
  bracket.className = "shrine-tournament-bracket is-large is-upright";

  for (const round of [...rounds].reverse()) {
    const column = document.createElement("section");
    const heading = document.createElement("strong");
    const matches = document.createElement("div");

    column.className = [
      "shrine-tournament-round",
      "is-large",
      "is-upright-round",
      round.isPreview ? "is-preview" : "",
    ].filter(Boolean).join(" ");
    heading.textContent = getShrineTournamentRoundLabel(round.roundNumber, finalRoundNumber);
    matches.className = "shrine-tournament-matches";
    column.append(heading, matches);

    for (const pair of round.pairs) {
      const match = createShrineTournamentMatchElement(pair, {
        preview: Boolean(round.isPreview),
        final: round.roundNumber === finalRoundNumber,
      });
      match.classList.add("is-large");
      matches.append(match);
    }

    bracket.append(column);
  }

  return bracket;
};

const renderShrineTournamentBracket = () => {
  if (!shrineMatchSession || shrineMatchSession.method !== "tournament") {
    return null;
  }

  const largeBracket = renderShrineLargeTournamentBracket();
  if (largeBracket) {
    return largeBracket;
  }

  const bracket = document.createElement("div");
  const displayRounds = getShrineTournamentDisplayRounds();
  const finalRoundNumber = displayRounds.at(-1)?.roundNumber ?? shrineMatchSession.rounds.at(-1)?.roundNumber ?? 1;
  bracket.className = "shrine-tournament-bracket";

  for (const round of shrineMatchSession.rounds) {
    const column = document.createElement("section");
    const heading = document.createElement("strong");
    const matches = document.createElement("div");

    column.className = "shrine-tournament-round";
    heading.textContent = getShrineTournamentRoundLabel(round.roundNumber, finalRoundNumber);
    matches.className = "shrine-tournament-matches";
    column.append(heading, matches);

    for (const [index, pair] of round.pairs.entries()) {
      const match = document.createElement("article");
      const winner = getShrinePairWinner(pair);
      const winnerChip = document.createElement("span");
      const branch = document.createElement("span");
      const contenders = document.createElement("div");

      match.className = [
        "shrine-tournament-match",
        winner ? "has-winner" : "",
        round.roundNumber === finalRoundNumber ? "is-final" : "",
      ].filter(Boolean).join(" ");
      winnerChip.className = "shrine-tournament-winner";
      winnerChip.textContent = winner ? winner.numberLabel.replace("番", "") : "?";
      branch.className = "shrine-tournament-branch";
      contenders.className = "shrine-tournament-contenders";

      for (const side of [pair.left, pair.right]) {
        const player = document.createElement("span");
        const number = document.createElement("em");
        const name = document.createElement("strong");
        player.className = winner?.id === side.id
          ? "shrine-tournament-player is-winner"
          : winner
            ? "shrine-tournament-player is-loser"
            : "shrine-tournament-player";
        number.textContent = side.numberLabel.replace("番", "");
        name.textContent = getShrineTournamentEntryName(side);
        player.append(number, name);
        contenders.append(player);
      }

      match.append(winnerChip, branch, contenders);
      matches.append(match);
    }

    const primaryWaiting = round.waiting;
    for (const waitingEntry of getShrineRoundWaitingEntries(round)) {
      const waiting = document.createElement("article");
      const player = document.createElement("span");
      const number = document.createElement("em");
      const name = document.createElement("strong");
      const winnerChip = document.createElement("span");

      round.waiting = waitingEntry;
      waiting.className = "shrine-tournament-match is-waiting";
      player.className = "shrine-tournament-player is-winner";
      number.textContent = round.waiting.numberLabel.replace("番", "");
      name.textContent = getShrineTournamentEntryName(round.waiting);
      winnerChip.className = "shrine-tournament-winner";
      winnerChip.textContent = "休";
      player.append(number, name);
      waiting.append(winnerChip, player);
      matches.append(waiting);
    }
    round.waiting = primaryWaiting;

    bracket.append(column);
  }

  const previewRound = renderShrineTournamentPreviewRound(shrineMatchSession.rounds.at(-1), finalRoundNumber);
  if (previewRound) {
    bracket.append(previewRound);
  }

  return bracket;
};

const renderShrineMatchSummary = () => {
  if (!shrineMatchSession || !shrineResult || shrineMatchSession.method === "shuffle") {
    return;
  }

  const summaryBlock = document.createElement("article");
  const title = document.createElement("h3");
  const lead = document.createElement("p");
  const list = document.createElement("ol");
  const entrySummaries = shrineMatchSession.entries.map((entry) => {
    const roundMarks = shrineMatchSession.rounds.map((round) => getShrineEntryRoundMark(entry, round));
    const score = roundMarks.reduce((total, item) => total + item.score, 0);
    return {
      entry,
      score,
      marks: roundMarks.map((item) => item.mark),
    };
  }).sort((a, b) => b.score - a.score || a.entry.number - b.entry.number);

  summaryBlock.className = "shrine-round-result shrine-match-summary";
  title.textContent = shrineMatchSession.method === "swiss" ? "スイス方式の途中表" : "トーナメント表の結果";
  lead.textContent = shrineMatchSession.method === "swiss"
    ? `${getSwissRoundLimit(shrineMatchSession.entries.length)}回戦まで行います。〇 勝ち / × 負け / △ 引き分け / 休 待機`
    : "勝ち上がりを番号で表示します。結果を入れると次の回へ進めます。";
  list.className = "shrine-match-summary-list";

  const tournamentBracket = renderShrineTournamentBracket();
  if (tournamentBracket) {
    summaryBlock.append(title, lead, tournamentBracket);
  } else {
    summaryBlock.append(title, lead);
  }

  for (const [index, summary] of entrySummaries.entries()) {
    const item = document.createElement("li");
    const rank = document.createElement("span");
    const name = document.createElement("strong");
    const marks = document.createElement("span");
    const score = document.createElement("em");

    rank.textContent = `${index + 1}`;
    name.textContent = summary.entry.label;
    marks.className = "shrine-match-marks";
    for (const mark of summary.marks) {
      const markChip = document.createElement("span");
      markChip.className = `shrine-match-mark ${getShrineResultMarkClass(mark)}`;
      markChip.textContent = mark;
      marks.append(markChip);
    }
    score.textContent = `${summary.score}点`;
    item.append(rank, name, marks, score);
    list.append(item);
  }

  summaryBlock.append(list);
  shrineResult.append(summaryBlock);
};

const renderShrineMatchRound = (round, { interactive = false } = {}) => {
  const roundBlock = document.createElement("article");
  const roundTitle = document.createElement("h3");
  const list = document.createElement("ol");

  roundBlock.className = interactive
    ? "shrine-round-result is-amateur has-results"
    : "shrine-round-result is-amateur";
  const finalRoundNumber = shrineMatchSession?.method === "tournament"
    ? getShrineTournamentDisplayRounds().at(-1)?.roundNumber ?? round.roundNumber
    : round.roundNumber;
  roundTitle.textContent = shrineMatchSession?.method === "tournament"
    ? getShrineTournamentRoundLabel(round.roundNumber, finalRoundNumber)
    : getShrineRoundLabel(round.roundNumber);
  list.className = "shrine-pair-list";

  for (const [index, pair] of round.pairs.entries()) {
    const item = document.createElement("li");
    const order = document.createElement("span");
    const left = document.createElement("strong");
    const versus = document.createElement("small");
    const right = document.createElement("strong");

    order.textContent = `${index + 1}局`;
    left.textContent = pair.left.label;
    versus.textContent = "対";
    right.textContent = pair.right.label;
    item.append(order, left, versus, right);

    if (interactive) {
      const result = document.createElement("select");
      result.dataset.shrineMatchResult = "true";
      result.dataset.roundIndex = String(round.roundNumber - 1);
      result.dataset.matchIndex = String(index);
      result.setAttribute("aria-label", `${getShrineRoundLabel(round.roundNumber)} ${index + 1}局の結果`);
      result.innerHTML = `
        <option value="">結果</option>
        <option value="left">${pair.left.numberLabel}勝ち</option>
        <option value="right">${pair.right.numberLabel}勝ち</option>
        <option value="draw">引き分け</option>
      `;
      result.value = pair.result || "";
      item.append(result);
    } else if (pair.result) {
      const resultText = document.createElement("em");
      resultText.className = "shrine-match-result-text";
      resultText.textContent = ({
        left: `${pair.left.numberLabel}勝ち`,
        right: `${pair.right.numberLabel}勝ち`,
        draw: "引き分け",
      })[pair.result] ?? "";
      item.append(resultText);
    }

    list.append(item);
  }

  roundBlock.append(roundTitle, list);

  const waitingEntries = getShrineRoundWaitingEntries(round);
  if (waitingEntries.length) {
    const waitBox = document.createElement("div");
    const waitTitle = document.createElement("strong");
    const waitNames = document.createElement("span");
    waitBox.className = "shrine-waiting";
    waitTitle.textContent = "待機";
    waitNames.textContent = waitingEntries.map((entry) => entry.label).join("、");
    waitBox.append(waitTitle, waitNames);
    roundBlock.append(waitBox);
  }

  shrineResult.append(roundBlock);
};

const renderShrineMatchSession = () => {
  if (!shrineMatchSession) {
    return;
  }

  const heading = document.createElement("div");
  const title = document.createElement("strong");
  const oracle = document.createElement("p");
  const latestRound = shrineMatchSession.rounds.at(-1);
  const totalPairs = shrineMatchSession.rounds.reduce((total, round) => total + round.pairs.length, 0);
  const canAdvance = canAdvanceShrineMatchSession();

  heading.className = "shrine-result-heading";
  title.textContent = "大会対戦の組み合わせ";
  oracle.textContent = `${getShrineSessionMethodLabel(shrineMatchSession.method)}として${totalPairs}局を組みました。`;
  heading.append(title, oracle);
  shrineResult.append(heading);

  renderShrineEntryList(shrineMatchSession.entries);
  renderShrineMatchSummary();

  for (const round of shrineMatchSession.rounds) {
    renderShrineMatchRound(round, { interactive: round === latestRound && latestRound?.pairs.some((pair) => !pair.result) });
  }

  if (shrineMatchSession.message) {
    const message = document.createElement("p");
    message.textContent = shrineMatchSession.message;
    shrineResult.append(message);
  }

  if (canAdvance) {
    const actions = document.createElement("div");
    const nextButton = document.createElement("button");
    actions.className = "shrine-next-round-actions";
    nextButton.type = "button";
    nextButton.dataset.shrineNextRound = "true";
    nextButton.textContent = shrineMatchSession.method === "swiss"
      ? `${latestRound.roundNumber + 1}回戦を作る`
      : "次の回を作る";
    actions.append(nextButton);
    shrineResult.append(actions);
  } else if (latestRound?.pairs.some((pair) => !pair.result)) {
    const actions = document.createElement("div");
    const nextButton = document.createElement("button");
    actions.className = "shrine-next-round-actions";
    nextButton.type = "button";
    nextButton.dataset.shrineNextRound = "true";
    nextButton.textContent = "結果を確定";
    actions.append(nextButton);
    shrineResult.append(actions);
  } else if (shrineMatchSession.method === "swiss" && !shrineMatchSession.message.includes("終了")) {
    const done = document.createElement("p");
    done.textContent = `${getSwissRoundLimit(shrineMatchSession.entries.length)}回戦まで組みました。スイス方式はここで終了です。`;
    shrineResult.append(done);
  }
};

const renderAmateurShrineResult = (participants) => {
  if (participants.length < 2) {
    const empty = document.createElement("p");
    empty.textContent = "大会対戦には、参加者または組番号を2つ以上入れてください。";
    shrineResult.append(empty);
    return;
  }

  const entries = createShrineEntries(participants);
  const matchMethod = getShrineMatchMethod();
  if (matchMethod !== "shuffle") {
    const currentSignature = participants.join("\n");
    if (
      !shrineMatchSession ||
      shrineMatchSession.method !== matchMethod ||
      shrineMatchSession.signature !== currentSignature
    ) {
      shrineMatchSession = createShrineMatchSession(entries, matchMethod);
      shrineMatchSession.signature = currentSignature;
    }
    renderShrineMatchSession();
    return;
  }

  shrineMatchSession = null;
  const effectiveRoundCount = 1;
  const heading = document.createElement("div");
  const title = document.createElement("strong");
  const oracle = document.createElement("p");
  const totalPairs = Math.floor(entries.length / 2) * effectiveRoundCount;

  heading.className = "shrine-result-heading";
  title.textContent = "大会対戦の組み合わせ";
  oracle.textContent = entries.length % 2 === 0
    ? `${getShrineMatchMethodLabel(matchMethod)}として${totalPairs}局を組みました。`
    : `${getShrineMatchMethodLabel(matchMethod)}として${totalPairs}局を組みました。奇数のため待機があります。`;
  heading.append(title, oracle);
  shrineResult.append(heading);

  renderShrineEntryList(entries);

  for (let roundIndex = 0; roundIndex < effectiveRoundCount; roundIndex += 1) {
    const round = createAmateurRound(entries.map((entry) => entry.label), roundIndex);
    const roundBlock = document.createElement("article");
    const roundTitle = document.createElement("h3");
    const list = document.createElement("ol");

    roundBlock.className = "shrine-round-result is-amateur";
    roundTitle.textContent = matchMethod === "shuffle"
      ? `${roundIndex + 1}回目`
      : "初回組み合わせ";
    list.className = "shrine-pair-list";

    for (const [index, pair] of round.pairs.entries()) {
      const item = document.createElement("li");
      const order = document.createElement("span");
      const left = document.createElement("strong");
      const versus = document.createElement("small");
      const right = document.createElement("strong");
      order.textContent = `${index + 1}局`;
      left.textContent = pair[0];
      versus.textContent = "対";
      right.textContent = pair[1];
      item.append(order, left, versus, right);
      list.append(item);
    }

    roundBlock.append(roundTitle, list);

    if (round.waiting) {
      const waitBox = document.createElement("div");
      const waitTitle = document.createElement("strong");
      const waitNames = document.createElement("span");
      waitBox.className = "shrine-waiting";
      waitTitle.textContent = "待機";
      waitNames.textContent = round.waiting;
      waitBox.append(waitTitle, waitNames);
      roundBlock.append(waitBox);
    }

    shrineResult.append(roundBlock);
  }

};

const applyShrineMatchResultsAndAdvance = () => {
  if (!shrineMatchSession || !shrineResult) {
    return;
  }

  const latestRound = shrineMatchSession.rounds.at(-1);
  if (!latestRound) {
    return;
  }

  const resultInputs = [...shrineResult.querySelectorAll("[data-shrine-match-result]")];
  if (resultInputs.some((input) => !input.value)) {
    shrineMatchSession.message = "すべての対戦結果を選んでから、次の回を作ってください。";
    shrineResult.textContent = "";
    renderShrineMatchSession();
    return;
  }

  for (const input of resultInputs) {
    const matchIndex = Number(input.dataset.matchIndex);
    const pair = latestRound.pairs[matchIndex];
    if (pair) {
      pair.result = input.value;
    }
  }

  if (!canAdvanceShrineMatchSession()) {
    shrineMatchSession.message = shrineMatchSession.method === "swiss"
      ? `${getSwissRoundLimit(shrineMatchSession.entries.length)}回戦まで結果を入れました。スイス方式はここで終了です。`
      : "結果を入れました。";
    shrineResult.textContent = "";
    renderShrineMatchSession();
    return;
  }

  let nextEntries = [];
  if (shrineMatchSession.method === "tournament") {
    nextEntries = getShrineTournamentAdvancingEntries(latestRound, { applyScores: true });
  } else {
    for (const pair of latestRound.pairs) {
      if (pair.result === "left") {
        pair.left.score += 1;
        nextEntries.push(pair.left);
      } else if (pair.result === "right") {
        pair.right.score += 1;
        nextEntries.push(pair.right);
      } else if (pair.result === "draw") {
        pair.left.score += 0.5;
        pair.right.score += 0.5;
      }
    }

    for (const waitingEntry of getShrineRoundWaitingEntries(latestRound)) {
      waitingEntry.score += 1;
      nextEntries.push(waitingEntry);
    }
  }

  if (shrineMatchSession.method === "tournament") {
    if (nextEntries.length <= 1) {
      shrineMatchSession.message = nextEntries[0]
        ? `${nextEntries[0].label} が勝ち残りました。`
        : "次へ進む人がいません。";
      shrineResult.textContent = "";
      renderShrineMatchSession();
      return;
    }

    shrineMatchSession.rounds.push({
      roundNumber: shrineMatchSession.rounds.length + 1,
      ...createAdjacentEntryRound(nextEntries),
    });
    shrineMatchSession.message = "勝った人で次の回を作りました。";
  } else {
    const rankedEntries = [...shrineMatchSession.entries]
      .sort((a, b) => b.score - a.score || a.number - b.number);

    shrineMatchSession.rounds.push({
      roundNumber: shrineMatchSession.rounds.length + 1,
      ...createAdjacentEntryRound(rankedEntries),
    });
    shrineMatchSession.message = latestRound.waiting
      ? "成績が近い人同士で次の回を作りました。待機は1点として扱います。"
      : "成績が近い人同士で次の回を作りました。";
  }

  shrineResult.textContent = "";
  renderShrineMatchSession();
  updateShrineRecordSaveState();
};

const splitShrineGroupLine = (line) =>
  line
    .split(/[、,，・/／\s]+/)
    .map((name) => name.trim())
    .filter(Boolean);

const getShrineGroupSize = () =>
  Math.max(2, Math.min(15, Number(shrineGroupSize?.value) || 2));

const getShrineFixedGroups = () => {
  const seen = new Set();

  return (shrineFixedGroups?.value ?? "")
    .split(/\r?\n/)
    .map((line) => splitShrineGroupLine(line))
    .filter((group) => group.length >= 2)
    .map((group) => group.filter((name) => {
      if (seen.has(name)) {
        return false;
      }
      seen.add(name);
      return true;
    }))
    .filter((group) => group.length >= 2);
};

const arrangePairgoFreeMembers = (freePeople, groupSize) => {
  const strengthScore = (person) => normalizeShrineStrength(person.strength).score;
  const knownStrengthPeople = freePeople.filter((person) => strengthScore(person) !== null);
  const unknownStrengthPeople = freePeople.filter((person) => strengthScore(person) === null);
  const byStrength = [...knownStrengthPeople].sort((a, b) => strengthScore(a) - strengthScore(b));

  if (getShrinePreferBalancedStrength() && groupSize > 2 && knownStrengthPeople.length >= groupSize) {
    const groups = Array.from({ length: Math.ceil(freePeople.length / groupSize) }, () => []);
    const sorted = [...knownStrengthPeople].sort((a, b) => strengthScore(b) - strengthScore(a));
    sorted.forEach((person, index) => {
      const cycle = Math.floor(index / groups.length);
      const offset = index % groups.length;
      const targetIndex = cycle % 2 === 0 ? offset : groups.length - 1 - offset;
      groups[targetIndex].push(person);
    });
    return groups.flat().concat(unknownStrengthPeople).map((person) => person.name);
  }

  const femalePeople = freePeople.filter((person) => person.gender === "female");
  const malePeople = freePeople.filter((person) => person.gender === "male");
  const unknownPeople = freePeople.filter((person) => !person.gender);

  if (!getShrinePreferMixedGender() && getShrinePreferCloseStrength() && groupSize === 2 && knownStrengthPeople.length > 0) {
    return byStrength.concat(unknownStrengthPeople).map((person) => person.name);
  }

  if (!getShrinePreferMixedGender()) {
    return freePeople.map((person) => person.name);
  }

  if (groupSize !== 2) {
    const ordered = getShrinePreferCloseStrength()
      ? [...femalePeople, ...malePeople].sort((a, b) => (strengthScore(a) ?? 0) - (strengthScore(b) ?? 0))
      : [...femalePeople, ...malePeople];
    return [...ordered, ...unknownPeople].map((person) => person.name);
  }

  const arranged = [];
  const femaleQueue = getShrinePreferCloseStrength()
    ? [...femalePeople].sort((a, b) => (strengthScore(a) ?? 0) - (strengthScore(b) ?? 0))
    : [...femalePeople];
  const maleQueue = [...malePeople];

  while (femaleQueue.length > 0 && maleQueue.length > 0) {
    const female = femaleQueue.shift();
    let maleIndex = 0;
    if (getShrinePreferCloseStrength() && strengthScore(female) !== null) {
      let bestDiff = Infinity;
      for (let index = 0; index < maleQueue.length; index += 1) {
        const diff = Math.abs((strengthScore(maleQueue[index]) ?? strengthScore(female)) - strengthScore(female));
        if (diff < bestDiff) {
          bestDiff = diff;
          maleIndex = index;
        }
      }
    }
    const [male] = maleQueue.splice(maleIndex, 1);
    arranged.push(female.name, male.name);
  }

  arranged.push(
    ...femaleQueue.map((person) => person.name),
    ...maleQueue.map((person) => person.name),
    ...unknownPeople.map((person) => person.name)
  );

  return arranged;
};

const createPairgoGroups = (participants) => {
  const groupSize = getShrineGroupSize();
  const fixedGroups = getShrineFixedGroups();
  const fixedMembers = new Set(fixedGroups.flat());
  const freePeople = getShrineParticipantPeople().filter((person) => !fixedMembers.has(person.name));
  const freeMembers = arrangePairgoFreeMembers(freePeople, groupSize);
  const groups = fixedGroups.map((members, index) => ({
    number: index + 1,
    type: "決定済み",
    members,
  }));
  const waiting = [];

  for (let index = 0; index < freeMembers.length; index += groupSize) {
    const members = freeMembers.slice(index, index + groupSize);

    if (members.length < groupSize) {
      waiting.push(...members);
      continue;
    }

    groups.push({
      number: groups.length + 1,
      type: "当日組",
      members,
    });
  }

  return { groupSize, groups, waiting, fixedGroups };
};

const renderPairgoShrineResult = (participants) => {
  const { groupSize, groups, waiting, fixedGroups } = createPairgoGroups(participants);
  latestPairgoGroups = groups;

  if (participants.length < 2 && fixedGroups.length === 0) {
    latestPairgoGroups = [];
    const empty = document.createElement("p");
    empty.textContent = "ペア・団体づくりには、参加者を2人以上入れてください。";
    shrineResult.append(empty);
    return;
  }

  const heading = document.createElement("div");
  const title = document.createElement("strong");
  const oracle = document.createElement("p");

  heading.className = "shrine-result-heading";
  title.textContent = "ペア・団体づくりの結果";
  oracle.textContent = groups.length > 0
    ? `${groups.length}組に番号を付けました。大会対戦タブでは、この番号を参加者として使えます。`
    : `${groupSize}人組を作るには人数が足りません。控えを確認してください。`;
  heading.append(title, oracle);
  shrineResult.append(heading);

  if (getShrinePreferMixedGender()) {
    const genderNote = document.createElement("p");
    genderNote.textContent = "男女の記録がある人は、男女の組を優先して並べました。";
    shrineResult.append(genderNote);
  }
  if (getShrinePreferCloseStrength() || getShrinePreferBalancedStrength()) {
    const strengthNote = document.createElement("p");
    strengthNote.textContent = getShrinePreferBalancedStrength()
      ? "棋力の記録がある人は、全チームの平均棋力が近くなるように並べました。"
      : "棋力の記録がある人は、棋力が近い組を優先しました。";
    shrineResult.append(strengthNote);
  }

  if (groups.length > 0) {
    const roundBlock = document.createElement("article");
    const roundTitle = document.createElement("h3");
    const list = document.createElement("ol");

    roundBlock.className = "shrine-round-result is-pairgo";
    roundTitle.textContent = "出場単位";
    list.className = "shrine-pairgo-list is-groups";

    for (const group of groups) {
      const item = document.createElement("li");
      const order = document.createElement("span");
      const members = document.createElement("strong");
      const type = document.createElement("small");

      order.textContent = `${group.number}番`;
      members.textContent = group.members.join("・");
      type.textContent = group.type;
      item.append(order, members, type);
      list.append(item);
    }

    roundBlock.append(roundTitle, list);
    shrineResult.append(roundBlock);
  }

  if (waiting.length > 0) {
    const waitBox = document.createElement("div");
    const waitTitle = document.createElement("strong");
    const waitNames = document.createElement("span");
    waitBox.className = "shrine-waiting";
    waitTitle.textContent = "控え";
    waitNames.textContent = waiting.join("、");
    waitBox.append(waitTitle, waitNames);
    shrineResult.append(waitBox);
  }

  if (groups.length > 0) {
    const note = document.createElement("p");
    const actions = document.createElement("div");
    const nextButton = document.createElement("button");
    note.textContent = `${groups.map((group) => `${group.number}番`).join("、")} を使って、組同士の代表トーナメントへ進めます。`;
    actions.className = "shrine-next-round-actions";
    nextButton.type = "button";
    nextButton.dataset.shrineUsePairgoGroups = "true";
    nextButton.textContent = "この番号で代表トーナメントへ進む";
    actions.append(nextButton);
    shrineResult.append(note);
    shrineResult.append(actions);
  }
};

const renderShrineResult = () => {
  if (!shrineResult) {
    return;
  }

  const participants = getShrineParticipantNames();
  const roundCount = getShrineRoundCount();
  const mode = getShrineMode();
  shrineResult.textContent = "";

  if (participants.length === 0 && !(mode === "pairgo" && getShrineFixedGroups().length > 0)) {
    const empty = document.createElement("p");
    empty.textContent = "参加者のお名前を入れてください。";
    shrineResult.append(empty);
    updateShrineRecordSaveState();
    return;
  }

  if (mode === "amateur") {
    renderAmateurShrineResult(participants);
    updateShrineRecordSaveState();
    return;
  }

  if (mode === "pairgo") {
    renderPairgoShrineResult(participants);
    updateShrineRecordSaveState();
    return;
  }

  renderLessonShrineResult(participants, roundCount);
  updateShrineRecordSaveState();
};

const carryPairgoGroupsToAmateurParticipants = ({ force = false } = {}) => {
  if (!shrineParticipants || latestPairgoGroups.length === 0) {
    shrineAmateurUsesCarriedGroups = false;
    updateShrineParticipantInputVisibility("amateur");
    return false;
  }

  if (!force && shrineParticipants.value.trim()) {
    shrineAmateurUsesCarriedGroups = false;
    updateShrineParticipantInputVisibility("amateur");
    return false;
  }

  shrineParticipants.value = latestPairgoGroups.map((group) => `${group.number}番`).join("\n");
  setShrineMatchMethod("tournament");
  shrineAmateurUsesCarriedGroups = true;
  updateShrineParticipantInputVisibility("amateur");
  if (shrineNumberMessage) {
    shrineNumberMessage.textContent = `${latestPairgoGroups.length}組を代表トーナメントへ引き継ぎました。`;
  }
  return true;
};

const getAdminGameRecordDraft = () => ({
  teacherId: adminGameRecordTeacher?.value || activeTeacherKey,
  date: adminGameRecordDate?.value || getTodayForInput(),
  handicap: adminGameRecordHandicap?.value || "互先",
  result: adminGameRecordResult?.value || "記録なし",
});

const clearAdminStampQr = () => {
  if (adminStampQr) {
    adminStampQr.hidden = true;
  }
  if (adminStampQrImage) {
    adminStampQrImage.removeAttribute("src");
  }
  if (adminStampQrLink) {
    adminStampQrLink.href = "#";
  }
};

const createQrImageUrl = (applyUrl) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=16&data=${encodeURIComponent(applyUrl)}`;

const createAdminParticipationQr = () => {
  if (!adminParticipationQr || !adminParticipationQrImage || !adminParticipationQrLink || !adminParticipationQrMessage) {
    return;
  }

  const today = getTodayForInput();
  const payload = {
    type: "participation_stamp",
    id: `participation-${today}`,
    date: today,
  };
  const applyUrl = createStampApplyUrl(payload);

  adminParticipationQr.hidden = false;
  adminParticipationQrImage.src = createQrImageUrl(applyUrl);
  adminParticipationQrLink.href = applyUrl;
  adminParticipationQrMessage.textContent = "受付後に本人スマホで読み取ると、今日の参加スタンプが1つ入ります。同じ日にもう一度読んでも二重には増えません。";
};

const createAdminFixedTeacherQrs = () => {
  if (!adminFixedTeacherQr || !adminFixedTeacherQrList) {
    return;
  }

  const today = getTodayForInput();
  adminFixedTeacherQrList.textContent = "";

  for (const [teacherId, teacher] of Object.entries(teacherDetails)) {
    const payload = {
      type: "teacher_stamp",
      id: `teacher-fixed-${today}-${teacherId}`,
      teacherId,
      date: today,
      handicap: "記録なし",
      result: "記録なし",
    };
    const applyUrl = createStampApplyUrl(payload);

    const item = document.createElement("article");
    item.className = "admin-fixed-teacher-qr-item";

    const title = document.createElement("strong");
    title.textContent = teacher.name;

    const label = document.createElement("small");
    label.textContent = `${today.replaceAll("-", "/")} 指導碁スタンプ`;

    const image = document.createElement("img");
    image.src = createQrImageUrl(applyUrl);
    image.alt = `${teacher.name} 先生スタンプQRコード`;

    const link = document.createElement("a");
    link.href = applyUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "読み取り用リンクを開く";

    item.append(title, label, image, link);
    adminFixedTeacherQrList.append(item);
  }

  adminFixedTeacherQr.hidden = false;
};

const setAdminFixedTeacherQrPrintPreview = (isPreview) => {
  document.body.classList.toggle("is-admin-qr-print-preview", isPreview);
  if (adminFixedTeacherQrPrintButton) {
    adminFixedTeacherQrPrintButton.textContent = isPreview ? "印刷画面を開く" : "印刷用に表示する";
  }
  if (adminFixedTeacherQrPreviewCloseButton) {
    adminFixedTeacherQrPreviewCloseButton.hidden = !isPreview;
  }
  if (adminFixedTeacherQrPrintButton) {
    adminFixedTeacherQrPrintButton.textContent = isPreview ? "印刷画面を開く / Ctrl+P" : "印刷用に表示する";
  }
  if (isPreview) {
    adminFixedTeacherQr?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const escapePrintableText = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

const openAdminFixedTeacherQrPdfPage = () => {
  if (!adminFixedTeacherQrList) {
    return;
  }

  if (adminFixedTeacherQrList.children.length === 0) {
    createAdminFixedTeacherQrs();
  }

  const cards = Array.from(adminFixedTeacherQrList.querySelectorAll(".admin-fixed-teacher-qr-item"))
    .map((item) => {
      const title = item.querySelector("strong")?.textContent ?? "";
      const label = item.querySelector("small")?.textContent ?? "";
      const image = item.querySelector("img")?.src ?? "";
      return { title, label, image };
    })
    .filter((card) => card.title && card.image);

  if (cards.length === 0) {
    return;
  }

  const cardsHtml = cards
    .map(
      (card) => `
        <article class="qr-card">
          <h2>${escapePrintableText(card.title)}</h2>
          <p>${escapePrintableText(card.label)}</p>
          <img src="${escapePrintableText(card.image)}" alt="${escapePrintableText(card.title)} QR">
        </article>`,
    )
    .join("");

  const printableHtml = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>今日の先生別QR</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #f8f4e9;
      color: #2f2d28;
      font-family: "Yu Gothic", "Hiragino Sans", Meiryo, sans-serif;
    }
    main {
      max-width: 920px;
      margin: 0 auto;
      padding: 24px;
    }
    h1 {
      margin: 0 0 10px;
      font-size: 26px;
      line-height: 1.3;
      text-align: center;
    }
    .lead {
      margin: 0 auto 18px;
      max-width: 680px;
      color: #5f6956;
      font-size: 14px;
      line-height: 1.8;
      text-align: center;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
      margin: 0 0 18px;
    }
    button {
      min-height: 46px;
      padding: 0 22px;
      border: 1px solid #b8ccb7;
      border-radius: 8px;
      background: #fffdf7;
      color: #357457;
      font: inherit;
      font-weight: 700;
    }
    .print-note {
      display: none;
      margin: -4px auto 18px;
      max-width: 680px;
      color: #6c5d44;
      font-size: 14px;
      line-height: 1.7;
      text-align: center;
    }
    .print-note.is-visible {
      display: block;
    }
    .qr-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }
    .qr-card {
      break-inside: avoid;
      page-break-inside: avoid;
      border: 1px solid #ded6c5;
      border-radius: 8px;
      background: #fffdf7;
      padding: 14px;
      text-align: center;
    }
    .qr-card h2 {
      margin: 0 0 6px;
      font-size: 18px;
      line-height: 1.3;
    }
    .qr-card p {
      margin: 0 0 10px;
      color: #746b5c;
      font-size: 13px;
      font-weight: 700;
    }
    .qr-card img {
      display: block;
      width: min(100%, 58mm);
      margin: 0 auto;
      border-radius: 6px;
      background: #ffffff;
    }
    @media print {
      body { background: #ffffff; }
      main { max-width: none; padding: 8mm; }
      .actions, .lead, .print-note { display: none; }
      h1 { margin-bottom: 8mm; font-size: 20pt; }
      .qr-grid { grid-template-columns: repeat(2, 1fr); gap: 6mm; }
      .qr-card { border-color: #d7d0c2; padding: 5mm; }
      .qr-card img { width: 54mm; }
    }
  </style>
</head>
<body>
  <main>
    <h1>今日の先生別QR</h1>
    <p class="lead">この画面を印刷、またはPDF保存してネットプリントへ共有できます。スマホではブラウザの共有ボタンから保存や送信を選びます。</p>
    <div class="actions">
      <button type="button" onclick="document.querySelector('.print-note')?.classList.add('is-visible'); window.print()">印刷・PDF保存</button>
      <button type="button" onclick="window.close()">このページを閉じる</button>
    </div>
    <p class="print-note">印刷画面が開かない時は、パソコンでは Ctrl+P、スマホではブラウザの共有ボタンやメニューから印刷・PDF保存を選んでください。</p>
    <section class="qr-grid">${cardsHtml}</section>
  </main>
</body>
</html>`;

  const printableUrl = URL.createObjectURL(new Blob([printableHtml], { type: "text/html;charset=utf-8" }));
  const printablePage = window.open(printableUrl, "_blank", "noopener,noreferrer");
  if (!printablePage) {
    URL.revokeObjectURL(printableUrl);
    setAdminFixedTeacherQrPrintPreview(true);
    return;
  }
  window.setTimeout(() => URL.revokeObjectURL(printableUrl), 60000);
};

const createAdminStampQr = () => {
  const draft = getAdminGameRecordDraft();
  const teacher = teacherDetails[draft.teacherId];

  if (!teacher || !adminStampQr || !adminStampQrImage || !adminStampQrLink || !adminStampQrMessage) {
    return;
  }

  const payload = {
    type: "teacher_stamp",
    id: `qr-${Date.now()}-${draft.teacherId}-${Math.random().toString(36).slice(2, 8)}`,
    teacherId: draft.teacherId,
    date: draft.date,
    handicap: draft.handicap,
    result: draft.result,
  };
  const applyUrl = createStampApplyUrl(payload);
  const qrUrl = createQrImageUrl(applyUrl);

  adminStampQr.hidden = false;
  adminStampQrImage.src = qrUrl;
  adminStampQrLink.href = applyUrl;
  adminStampQrMessage.textContent = `${teacher.name} の先生スタンプを本人スマホへ反映します。同じQRをもう一度読んでも二重には増えません。`;
};

const loadAdminCombinedAppliedKeys = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(adminCombinedAppliedKeysStorageKey) || "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : []);
  } catch {
    return new Set();
  }
};

const saveAdminCombinedAppliedKeys = (keys) => {
  try {
    localStorage.setItem(adminCombinedAppliedKeysStorageKey, JSON.stringify([...keys].slice(-80)));
  } catch {
    // Duplicate prevention is a local operation aid.
  }
};

const getAdminTeacherOperationKey = (draft = getAdminGameRecordDraft()) => [
  loadAdminIdentityCode() || "no-code",
  loadAdminIdentityDisplayName(),
  loadAdminIdentityRealName() || "no-real-name",
  draft.teacherId,
  draft.date,
  draft.handicap,
  draft.result,
].join("|");

const isAdminTeacherOperationApplied = (key) => loadAdminCombinedAppliedKeys().has(key);
const getAdminTeacherDuplicateKey = (draft = getAdminGameRecordDraft()) => `${getAdminTeacherOperationKey(draft)}|duplicate|${Date.now()}`;

const markAdminTeacherOperationApplied = (key) => {
  const keys = loadAdminCombinedAppliedKeys();
  keys.add(key);
  saveAdminCombinedAppliedKeys(keys);
};

const removeAdminTeacherOperationApplied = (key) => {
  if (!key) {
    return;
  }

  const keys = loadAdminCombinedAppliedKeys();
  keys.delete(key);
  saveAdminCombinedAppliedKeys(keys);
};

const clearAdminOperationMemory = () => {
  try {
    localStorage.setItem(adminIdentityCodeStorageKey, adminIdentityBlankCodeValue);
    localStorage.setItem(adminIdentityDisplayNameStorageKey, adminIdentityBlankNameValue);
    localStorage.removeItem(adminIdentityRealNameStorageKey);
    localStorage.removeItem(adminCombinedAppliedKeysStorageKey);
  } catch {
    // Clearing operation helpers is best-effort.
  }

  if (adminIdentityCode) {
    adminIdentityCode.value = "";
  }
  if (adminIdentityDisplayName) {
    adminIdentityDisplayName.value = "";
  }
  if (adminIdentityRealName) {
    adminIdentityRealName.value = "";
  }
  if (adminParticipationName) {
    adminParticipationName.value = "";
  }
  if (adminCombinedMessage) {
    adminCombinedMessage.textContent = "参加スタンプと対局内容を確認してから押してください。";
  }
};

const updateAdminGameRecordApply = () => {
  if (!adminGameRecordApply || !adminGameRecordMessage) {
    return;
  }

  if (adminGameRecordDate && !adminGameRecordDate.value) {
    adminGameRecordDate.value = getTodayForInput();
  }

  const today = getTodayForInput();
  const todayLabel = new Date(`${today}T00:00:00`).toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
  const draft = getAdminGameRecordDraft();
  const teacher = teacherDetails[draft.teacherId];
  const currentCount = teacher
    ? normalizeProgressCount(userProgress.stamps.teacherLessonCounts[draft.teacherId])
    : 0;
  const isMaxAchieved = teacher ? currentCount >= getTeacherMaxCount(teacher) : true;
  const isCoolingDown = Date.now() < adminGameRecordApplyCooldownUntil;
  const isAlreadyApplied = teacher ? isAdminTeacherOperationApplied(getAdminTeacherOperationKey(draft)) : false;

  if (adminGameRecordDateLabel) {
    adminGameRecordDateLabel.textContent = `本日 ${todayLabel}`;
  }

  if (adminStampQrCreateButton) {
    adminStampQrCreateButton.disabled = !teacher;
  }
  adminGameRecordApply.disabled = !teacher || isMaxAchieved || isCoolingDown;
  adminGameRecordApply.textContent = isCoolingDown
    ? "確認反映しました"
    : isMaxAchieved
    ? "この先生は達成済み"
    : "この端末で確認反映";
  adminGameRecordMessage.textContent = isMaxAchieved
    ? "この先生の花スタンプはすべて達成済みです。"
    : isCoolingDown
      ? "反映直後です。二重押し防止のため少し待っています。"
      : "本人スマホへ入れる時は、上のQRを作って読み取ってもらいます。";

  if (isAlreadyApplied) {
    adminGameRecordApply.disabled = true;
    adminGameRecordApply.textContent = "この対局は反映済み";
    adminGameRecordMessage.textContent = "この対局内容はすでに反映済みです。";
  }

  if (adminShowProfileButton) {
    adminShowProfileButton.hidden = !latestTeacherStampReflection;
  }
  if (adminUndoGameRecordButton) {
    adminUndoGameRecordButton.hidden = !latestTeacherStampReflection;
  }
};

const updateAdminOperationSummary = () => {
  const today = getTodayForInput();
  const draft = getAdminGameRecordDraft();
  const teacher = teacherDetails[draft.teacherId];
  const participationCount = normalizeProgressCount(userProgress.stamps.participationCount);
  const isStampedToday = userProgress.stamps.lastParticipationStampDate === today;
  const isParticipationMax = participationCount >= getParticipationMaxCount();
  const teacherCount = teacher ? normalizeProgressCount(userProgress.stamps.teacherLessonCounts[draft.teacherId]) : 0;
  const isTeacherMax = teacher ? teacherCount >= getTeacherMaxCount(teacher) : true;
  const teacherOperationKey = teacher ? getAdminTeacherOperationKey(draft) : "";
  const isTeacherAlreadyApplied = teacherOperationKey ? isAdminTeacherOperationApplied(teacherOperationKey) : false;
  const canApplyParticipation = !isStampedToday && !isParticipationMax;
  const canApplyTeacher = Boolean(teacher) && !isTeacherMax && !isTeacherAlreadyApplied;

  if (adminParticipation) {
    adminParticipation.textContent = canApplyParticipation
      ? `今日の参加スタンプを入れる（現在 ${participationCount}/${getParticipationMaxCount()}）`
      : isStampedToday
        ? "今日の参加スタンプは反映済み"
        : `参加スタンプは満了（${participationCount}/${getParticipationMaxCount()}）`;
  }
  if (adminTeacher) {
    adminTeacher.textContent = teacher
      ? `${teacher.name} / ${draft.date} / ${draft.handicap} / ${draft.result}`
      : "先生を選んでください";
  }
  if (adminResult) {
    adminResult.textContent = canApplyTeacher
      ? `先生スタンプ ${teacherCount} → ${teacherCount + 1}`
      : teacher
        ? "この先生の花は満了しています"
        : "対局内容を選んでください";
  }
  if (adminCombinedApply) {
    adminCombinedApply.disabled = !canApplyParticipation && !canApplyTeacher;
  }
  if (adminDuplicateTeacherApply) {
    const canApplyDuplicateTeacher =
      Boolean(teacher) &&
      isTeacherAlreadyApplied &&
      !isTeacherMax &&
      Date.now() >= adminDuplicateTeacherApplyCooldownUntil;
    adminDuplicateTeacherApply.hidden = !canApplyDuplicateTeacher;
    adminDuplicateTeacherApply.disabled = !canApplyDuplicateTeacher;
  }
  if (adminResult && isTeacherAlreadyApplied) {
    adminResult.textContent = "この対局内容は反映済み";
  }
};

const applyGameRecordFromAdmin = ({ allowDuplicate = false } = {}) => {
  const draft = getAdminGameRecordDraft();
  const teacher = teacherDetails[draft.teacherId];

  if (!teacher) {
    updateAdminGameRecordApply();
    return;
  }

  const baseTeacherOperationKey = getAdminTeacherOperationKey(draft);
  const isDuplicateOperation = allowDuplicate && isAdminTeacherOperationApplied(baseTeacherOperationKey);
  const teacherOperationKey = isDuplicateOperation
    ? getAdminTeacherDuplicateKey(draft)
    : baseTeacherOperationKey;
  if (!allowDuplicate && isAdminTeacherOperationApplied(baseTeacherOperationKey)) {
    updateAdminPanel();
    if (adminGameRecordMessage) {
      adminGameRecordMessage.textContent = "この対局内容はすでに反映済みです。";
    }
    if (adminCombinedMessage) {
      adminCombinedMessage.textContent = "同じ対局内容は二重に反映しません。";
    }
    return;
  }

  const before = normalizeProgressCount(userProgress.stamps.teacherLessonCounts[draft.teacherId]);
  if (before >= getTeacherMaxCount(teacher)) {
    updateAdminGameRecordApply();
    return;
  }

  markAdminTeacherOperationApplied(teacherOperationKey);
  const gameRecordId = `game-admin-${Date.now()}-${draft.teacherId}`;
  gameRecords.push({
    id: gameRecordId,
    teacherId: draft.teacherId,
    date: draft.date,
    handicap: draft.handicap,
    result: draft.result,
    recordedAt: new Date().toISOString(),
  });
  saveGameRecords();

  userProgress.stamps.teacherLessonCounts[draft.teacherId] = clampProgressCount(before + 1, getTeacherMaxCount(teacher));
  const after = normalizeProgressCount(userProgress.stamps.teacherLessonCounts[draft.teacherId]);
  latestTeacherStampReflection = {
    gameRecordId,
    teacherId: draft.teacherId,
    teacherName: teacher.name,
    flowerName: teacher.flowerName ?? "花",
    flowerAsset: teacher.flowerAsset ?? "cosmos-stamp-stage-05-v2.png",
    before,
    after,
    goal: getTeacherGoal(teacher),
    adminOperationKey: teacherOperationKey,
  };
  todayTeacherStampReflections = [...todayTeacherStampReflections, latestTeacherStampReflection].slice(-3);
  saveTodayTeacherStampReflections();
  userProgress.stamps.teacherCircleRounds = getTeacherCircleRoundsFromCounts(userProgress.stamps.teacherLessonCounts);
  syncTeacherDetailsFromProgress();
  syncProgressRewards();
  saveUserProgress();
  appendOperationHistory({
    type: "teacher_stamp",
    target: `${teacher.name} 対局記録`,
    before,
    after,
  });
  syncAdminDraftFromProgress();
  markAdminTeacherOperationApplied(teacherOperationKey);
  renderTeacherGameRecords(activeTeacherKey);
  updateParticipationStampCard();
  updateTeacherCards();
  updateRoundProgress();
  updateProfileCard();
  updateAdminPanel();
  adminGameRecordApplyCooldownUntil = Date.now() + 1200;
  updateAdminGameRecordApply();
  window.setTimeout(updateAdminGameRecordApply, 1250);

  if (adminGameRecordMessage) {
    adminGameRecordMessage.textContent = isDuplicateOperation
      ? `${teacher.name} の同じ条件の対局を、もう1局として追加しました。`
      : `${teacher.name} の今日の指導碁を記録しました。参加者には冒険者カードを見せてください。`;
  }
  if (adminShowProfileButton) {
    adminShowProfileButton.hidden = false;
  }
  if (adminUndoGameRecordButton) {
    adminUndoGameRecordButton.hidden = false;
  }
};

const undoLatestGameRecordFromAdmin = () => {
  const reflection = latestTeacherStampReflection;

  if (!reflection?.teacherId) {
    updateAdminGameRecordApply();
    return;
  }

  const teacher = teacherDetails[reflection.teacherId];
  if (!teacher) {
    latestTeacherStampReflection = null;
    todayTeacherStampReflections = [];
    saveTodayTeacherStampReflections();
    updateAdminGameRecordApply();
    updateProfileCard();
    return;
  }

  const before = normalizeProgressCount(userProgress.stamps.teacherLessonCounts[reflection.teacherId]);
  const after = clampProgressCount(reflection.before, getTeacherMaxCount(teacher));
  userProgress.stamps.teacherLessonCounts[reflection.teacherId] = after;
  userProgress.stamps.teacherCircleRounds = getTeacherCircleRoundsFromCounts(userProgress.stamps.teacherLessonCounts);

  if (reflection.gameRecordId) {
    gameRecords = gameRecords.filter((record) => record.id !== reflection.gameRecordId);
    saveGameRecords();
  }

  todayTeacherStampReflections = todayTeacherStampReflections.filter((item) => item.gameRecordId !== reflection.gameRecordId);
  latestTeacherStampReflection = todayTeacherStampReflections.at(-1) ?? null;
  saveTodayTeacherStampReflections();
  removeAdminTeacherOperationApplied(reflection.adminOperationKey);
  adminGameRecordApplyCooldownUntil = 0;
  adminDuplicateTeacherApplyCooldownUntil = 0;
  syncTeacherDetailsFromProgress();
  syncProgressRewards();
  saveUserProgress();
  appendOperationHistory({
    type: "decrement",
    target: `${teacher.name} 先生スタンプ取り消し`,
    before,
    after,
  });
  syncAdminDraftFromProgress();
  renderTeacherGameRecords(activeTeacherKey);
  updateParticipationStampCard();
  updateTeacherCards();
  updateRoundProgress();
  updateProfileCard();
  updateAdminPanel();

  if (adminGameRecordMessage) {
    adminGameRecordMessage.textContent = `${teacher.name} の直前の先生スタンプを取り消しました。`;
  }
  if (adminShowProfileButton) {
    adminShowProfileButton.hidden = !latestTeacherStampReflection;
  }
  if (adminUndoGameRecordButton) {
    adminUndoGameRecordButton.hidden = !latestTeacherStampReflection;
  }
};

const updateAdminParticipationApply = () => {
  if (!adminParticipationDate || !adminParticipationApply || !adminParticipationMessage) {
    return;
  }

  const today = getTodayForInput();
  const todayLabel = new Date(`${today}T00:00:00`).toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
  const isStampedToday = userProgress.stamps.lastParticipationStampDate === today;
  const currentCount = normalizeProgressCount(userProgress.stamps.participationCount);
  const isMaxAchieved = currentCount >= getParticipationMaxCount();

  adminParticipationDate.textContent = `本日 ${todayLabel}`;
  adminParticipationApply.disabled = isStampedToday || isMaxAchieved;
  adminParticipationApply.textContent = isStampedToday
    ? "本日は反映済み"
    : isMaxAchieved
      ? "参加スタンプ達成済み"
      : "今日の参加スタンプを反映";

  if (isStampedToday) {
    adminParticipationMessage.textContent = "今日はすでに参加スタンプを反映しています。";
  } else if (isMaxAchieved) {
    adminParticipationMessage.textContent = "参加スタンプはすべて達成済みです。";
  } else {
    adminParticipationMessage.textContent = "別画面でフォーム回答を確認してから押してください。";
  }
};

const applyTodayParticipationStampFromAdmin = () => {
  if (userProgress.stamps.lastParticipationStampDate === getTodayForInput()) {
    updateAdminParticipationApply();
    return;
  }

  const before = normalizeProgressCount(userProgress.stamps.participationCount);
  if (before >= getParticipationMaxCount()) {
    updateAdminParticipationApply();
    return;
  }

  const participantName = adminParticipationName?.value.trim() || "参加者";
  addParticipationStamp();
  appendOperationHistory({
    type: "participation_stamp",
    target: `${participantName} 参加スタンプ`,
    before,
    after: normalizeProgressCount(userProgress.stamps.participationCount),
  });
  syncAdminDraftFromProgress();
  updateParticipationStampCard();
  updateTeacherCards();
  updateRoundProgress();
  updateProfileCard();
  updateAdminPanel();
  if (adminParticipationMessage) {
    adminParticipationMessage.textContent = `${participantName} さんの本日分を反映しました。`;
  }
};

const applyCombinedAdminOperation = () => {
  if (adminCombinedApply) {
    adminCombinedApply.disabled = true;
  }

  const participantName = adminParticipationName?.value.trim() || loadAdminIdentityDisplayName() || "参加者";
  const appliedItems = [];
  const today = getTodayForInput();
  const beforeParticipation = normalizeProgressCount(userProgress.stamps.participationCount);
  const canApplyParticipation =
    userProgress.stamps.lastParticipationStampDate !== today &&
    beforeParticipation < getParticipationMaxCount();

  if (canApplyParticipation) {
    addParticipationStamp();
    appendOperationHistory({
      type: "participation_stamp",
      target: `${participantName} 参加スタンプ`,
      before: beforeParticipation,
      after: normalizeProgressCount(userProgress.stamps.participationCount),
    });
    appliedItems.push("参加スタンプ");
  }

  const draft = getAdminGameRecordDraft();
  const teacher = teacherDetails[draft.teacherId];
  const beforeTeacher = teacher
    ? normalizeProgressCount(userProgress.stamps.teacherLessonCounts[draft.teacherId])
    : 0;
  const teacherOperationKey = teacher ? getAdminTeacherOperationKey(draft) : "";
  const canApplyTeacher =
    teacher &&
    beforeTeacher < getTeacherMaxCount(teacher) &&
    !isAdminTeacherOperationApplied(teacherOperationKey);

  if (canApplyTeacher) {
    applyGameRecordFromAdmin();
    appliedItems.push(`${teacher.name} の対局`);
  } else if (appliedItems.length > 0) {
    syncAdminDraftFromProgress();
    updateParticipationStampCard();
    updateTeacherCards();
    updateRoundProgress();
    updateProfileCard();
    updateAdminPanel();
  } else {
    updateAdminPanel();
  }

  if (adminCombinedMessage) {
    adminCombinedMessage.textContent = appliedItems.length > 0
      ? `${participantName} に ${appliedItems.join("、")} を反映しました。`
      : `${participantName} に反映できる新しい内容はありません。`;
  }
};

const applyDuplicateTeacherGameFromAdmin = () => {
  if (adminDuplicateTeacherApply) {
    adminDuplicateTeacherApply.disabled = true;
  }

  adminDuplicateTeacherApplyCooldownUntil = Date.now() + 1200;
  applyGameRecordFromAdmin({ allowDuplicate: true });

  if (adminCombinedMessage) {
    const draft = getAdminGameRecordDraft();
    const teacher = teacherDetails[draft.teacherId];
    adminCombinedMessage.textContent = teacher
      ? `${teacher.name} の同じ条件の対局を、もう1局として追加しました。`
      : "追加する対局内容を選んでください。";
  }

  updateAdminOperationSummary();
  window.setTimeout(updateAdminOperationSummary, 1250);
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

  latestTeacherStampReflection = null;
  todayTeacherStampReflections = [];
  saveTodayTeacherStampReflections();
  adminGameRecordApplyCooldownUntil = 0;
  adminDuplicateTeacherApplyCooldownUntil = 0;
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
  latestTeacherStampReflection = null;
  todayTeacherStampReflections = [];
  saveTodayTeacherStampReflections();
  gameRecords = [];
  saveGameRecords();
  pendingGameRecords = [];
  savePendingGameRecords();
  appliedStampQrIds = new Set();
  saveAppliedStampQrIds();
  adminGameRecordApplyCooldownUntil = 0;
  adminDuplicateTeacherApplyCooldownUntil = 0;
  clearAdminOperationMemory();
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
  teacherCircleTargetIds.filter((teacherId) => teacherDetails[teacherId]?.completedFirstRound).length;

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

Object.assign(fairyQuoteByFlower, {
  suzuran: "小さな音も、ちゃんと次の一手につながっているよ。",
  mokuren: "静かな形を守ると、読みの道が見えてくるよ。",
  hinageshi: "今日の記録も、次の花を咲かせる力になるよ。",
  shirotsumekusa: "対局を見守る目が、やさしく道を照らしているよ。",
  ran: "じっくり育てた形は、きっと盤面で支えになるよ。",
  hanamizuki: "羽を広げるように、落ち着いて次へ進もう。",
  yamabuki: "明るい山吹の道から、新しい先生の輪が始まるよ。",
  rindou: "静かな青い花が、次の一手をそっと教えてくれるよ。",
  tsukimisou: "夜の光みたいに、今日の記録もやさしく残っているよ。",
  kingyosou: "楽しい発見をひとつずつ、金魚草の花に集めていこう。",
  fujibakama: "小さな足あとも、ちゃんと次の輪につながっているよ。",
  fuyou: "ふんわり咲いた時間が、新しい出会いを守ってくれるよ。",
  tsuyukusa: "朝のしずくみたいな一手を、きらりと残しておこう。",
  kinsenka: "あたたかい花びらが、がんばった記録を包んでいるよ。",
  nanten: "赤い実のように、よい記録が次の季節へ続いていくよ。",
});

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

const hasParticipationStampToday = () =>
  userProgress.stamps.lastParticipationStampDate === getTodayForInput();

const hasOpenedParticipationForm = () => {
  try {
    return localStorage.getItem(participationFormOpenedStorageKey) === getTodayForInput();
  } catch {
    return false;
  }
};

const markParticipationFormOpened = () => {
  try {
    localStorage.setItem(participationFormOpenedStorageKey, getTodayForInput());
  } catch {
    // The visible guidance remains available even if local storage is blocked.
  }
};

const openParticipationStartSheet = () => {
  updateParticipationStampCard();
  if (participationStartSheet) {
    participationStartSheet.hidden = false;
  }
};

const closeParticipationStartSheet = () => {
  if (participationStartSheet) {
    participationStartSheet.hidden = true;
  }
};

const openParticipationForm = () => {
  const code = loadReceptionCode();
  markParticipationFormOpened();
  closeParticipationStartSheet();
  try {
    navigator.clipboard?.writeText(code)?.catch(() => {});
  } catch {
    // The visible code remains the fallback when clipboard access is unavailable.
  }

  window.open(participationFormUrl, "_blank", "noopener,noreferrer");
};

const updateParticipationStampCard = () => {
  if (!participationCount || !participationStatus || !participationStampButton) {
    return;
  }

  const currentCount = normalizeProgressCount(userProgress.stamps.participationCount);
  const goal = getParticipationGoal();
  const cycleProgress = getCycleProgress(currentCount, goal, participationFlowerCycles);
  const isFirstAchievementAchieved = currentCount >= goal;
  const isMaxAchieved = currentCount >= cycleProgress.maxCount;
  const isStampedToday = hasParticipationStampToday();
  const shouldShowPostFormGuide = hasOpenedParticipationForm() && !isStampedToday;

  if (participationFlowerName) {
    participationFlowerName.textContent = cycleProgress.cycle.flowerName;
  }
  if (participationStartFlowerName) {
    participationStartFlowerName.textContent = cycleProgress.cycle.flowerName;
  }

  applyFlowerVisual(participationFlower, cycleProgress.cycle);
  applyFlowerVisual(participationStartFlower, cycleProgress.cycle);

  participationCount.textContent = `${cycleProgress.countInCycle}/${goal}回`;
  participationStatus.textContent = isStampedToday
    ? "本日は押印済み"
    : isFirstAchievementAchieved
      ? `${cycleProgress.cycleNumber}巡目 ${cycleProgress.cycle.flowerName}`
      : `あと${Math.max(0, goal - cycleProgress.countInCycle)}回`;
  if (participationStartReceptionCode) {
    participationStartReceptionCode.textContent = loadReceptionCode();
  }
  if (participationStartCount) {
    participationStartCount.textContent = participationCount.textContent;
  }
  if (participationStartStatus) {
    participationStartStatus.textContent = participationStatus.textContent;
  }
  participationStampButton.textContent = isMaxAchieved
    ? "参加スタンプ達成済み"
    : "受付番号をコピーして記入へ進む";
  participationStampButton.disabled = isMaxAchieved;
  if (participationStartFormButton) {
    participationStartFormButton.textContent = participationStampButton.textContent;
    participationStartFormButton.disabled = isMaxAchieved;
  }

  if (participationStampGuide) {
    participationStampGuide.textContent = isStampedToday
      ? "今日の花は入っています。次からもホーム画面の花アイコンから開いてください。"
      : shouldShowPostFormGuide
        ? "フォーム送信後は、ホーム画面の花アイコンに戻り、受付で参加QRを読んでください。フォーム記入だけでは花は入りません。"
        : "フォーム記入だけでは花は入りません。送信後、ホーム画面の花アイコンに戻り、受付で参加QRを読んでください。";
    participationStampGuide.classList.toggle("is-urgent", shouldShowPostFormGuide);
    participationStampGuide.classList.toggle("is-complete", isStampedToday);
  }
  if (participationStartGuide) {
    participationStartGuide.textContent = participationStampGuide?.textContent ?? "";
    participationStartGuide.classList.toggle("is-urgent", shouldShowPostFormGuide);
    participationStartGuide.classList.toggle("is-complete", isStampedToday);
  }
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

Object.assign(fairyBookBackgrounds, {
  suzuran: "assets/fairy-bg-meadow.png",
  mokuren: "assets/fairy-bg-camellia.png",
  hinageshi: "assets/fairy-bg-meadow.png",
  shirotsumekusa: "assets/fairy-bg-meadow.png",
  ran: "assets/fairy-bg-iris.png",
  hanamizuki: "assets/fairy-bg-camellia.png",
  yamabuki: "assets/fairy-bg-meadow.png",
  rindou: "assets/fairy-bg-hydrangea.png",
  tsukimisou: "assets/fairy-bg-meadow.png",
  kingyosou: "assets/fairy-bg-camellia.png",
  fujibakama: "assets/fairy-bg-hydrangea.png",
  fuyou: "assets/fairy-bg-camellia.png",
  tsuyukusa: "assets/fairy-bg-hydrangea.png",
  kinsenka: "assets/fairy-bg-meadow.png",
  nanten: "assets/fairy-bg-camellia.png",
});

const getFairyBookBackground = (flower) => fairyBookBackgrounds[flower] ?? fairyBookBackgrounds.cosmos;

const fairyCardFrames = {
  cosmos: "assets/fairy-card-frame-cosmos-v2.png",
  iris: "assets/fairy-card-frame-iris-v2.png",
  lotus: "assets/fairy-card-frame-iris-v2.png",
  sumire: "assets/fairy-card-frame-iris-v2.png",
  camellia: "assets/fairy-card-frame-camellia-v2.png",
  botan: "assets/fairy-card-frame-camellia-v2.png",
  lily: "assets/fairy-card-frame-camellia-v2.png",
  sunflower: "assets/fairy-card-frame-sunflower-v2.png",
  asagao: "assets/fairy-card-frame-sunflower-v2.png",
  kikyo: "assets/fairy-card-frame-sunflower-v2.png",
  hydrangea: "assets/fairy-card-frame-hydrangea-v2.png",
  nadeshiko: "assets/fairy-card-frame-hydrangea-v2.png",
  suisen: "assets/fairy-card-frame-hydrangea-v2.png",
  sakura: "assets/fairy-card-frame-sakura-v2.png",
  hagi: "assets/fairy-card-frame-sakura-v2.png",
  shakuyaku: "assets/fairy-card-frame-sakura-v2.png",
  special_first_step: "assets/fairy-card-frame-special-sprout-v2.png",
  special_next_step: "assets/fairy-card-frame-special-ribbon-v2.png",
  special_wisdom: "assets/fairy-card-frame-special-wisdom-v2.png",
};

Object.assign(fairyCardFrames, {
  suzuran: "assets/fairy-card-frame-special-sprout-v2.png",
  mokuren: "assets/fairy-card-frame-camellia-v2.png",
  hinageshi: "assets/fairy-card-frame-sunflower-v2.png",
  shirotsumekusa: "assets/fairy-card-frame-special-sprout-v2.png",
  ran: "assets/fairy-card-frame-iris-v2.png",
  hanamizuki: "assets/fairy-card-frame-sakura-v2.png",
  yamabuki: "assets/fairy-card-frame-sunflower-v2.png",
  rindou: "assets/fairy-card-frame-iris-v2.png",
  tsukimisou: "assets/fairy-card-frame-special-wisdom-v2.png",
  kingyosou: "assets/fairy-card-frame-camellia-v2.png",
  fujibakama: "assets/fairy-card-frame-hydrangea-v2.png",
  fuyou: "assets/fairy-card-frame-camellia-v2.png",
  tsuyukusa: "assets/fairy-card-frame-hydrangea-v2.png",
  kinsenka: "assets/fairy-card-frame-sunflower-v2.png",
  nanten: "assets/fairy-card-frame-sakura-v2.png",
});

const specialCompanionFrameKeys = {
  special_companion_french_bulldog_a: "special_first_step",
  special_companion_french_bulldog_b: "special_next_step",
  special_companion_owl_a: "special_wisdom",
  special_companion_owl_b: "special_wisdom",
};

const getFairyCardFrame = ({ type = "fairy", flower = "", companionId = "" } = {}) => {
  if (type === "special") {
    return fairyCardFrames[specialCompanionFrameKeys[companionId] ?? "special_first_step"];
  }

  return fairyCardFrames[flower] ?? fairyCardFrames.cosmos;
};

const openFairyViewer = ({ src, alt, name, status, quote = "", type = "fairy", flower = "", background = "", companionId = "" }) => {
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
  const frame = (type === "fairy" || type === "special") ? getFairyCardFrame({ type, flower, companionId }) : "";
  if (frame) {
    fairyViewerCard?.style.setProperty("--viewer-frame", `url("${frame}")`);
  } else {
    fairyViewerCard?.style.removeProperty("--viewer-frame");
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
  fairyViewerCard?.style.removeProperty("--viewer-frame");
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
    companionId: (libraryOwl.getAttribute("src") ?? "").includes("owl-b")
      ? "special_companion_owl_b"
      : "special_companion_owl_a",
  });
};

const openLibraryJournalKeeperViewer = () => {
  openFairyViewer({
    src: "assets/library-journal-hedgehog-with-book.png",
    alt: "冒険日誌の記録係",
    name: "冒険日誌の記録係",
    status: "書庫で思い出をしまう係",
    quote: libraryJournalKeeperSpeech?.textContent ?? "今日の記録も、ちゃんとしまっておくね。",
    type: "special",
    companionId: "special_companion_owl_a",
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
  if (libraryJournalState) {
    libraryJournalState.textContent = isCollapsed ? "ひらく" : "とじる";
  }
};

const libraryJournalKeeperMessages = [
  "思い出が増えてきたね。",
  "今日も記録しておいたよ。",
  "書かなくても大丈夫だよ。",
  "しまっておきたい日だね。",
  "あとでまた読もうね。",
];

let lastLibraryJournalKeeperMessage = "";

const updateLibraryJournalKeeperSpeech = () => {
  if (!libraryJournalKeeperSpeech || libraryJournalKeeperMessages.length === 0) {
    return;
  }

  const candidates = libraryJournalKeeperMessages.filter((message) => message !== lastLibraryJournalKeeperMessage);
  const messages = candidates.length > 0 ? candidates : libraryJournalKeeperMessages;
  const nextMessage = messages[Math.floor(Math.random() * messages.length)];
  lastLibraryJournalKeeperMessage = nextMessage;
  libraryJournalKeeperSpeech.textContent = nextMessage;
};

const toggleLibraryJournal = () => {
  if (!libraryJournalRecords) {
    return;
  }

  libraryJournalRecords.classList.toggle("is-collapsed");
  libraryJournalPrompt?.closest(".library-journal-prompt")?.classList.toggle("is-collapsed");
  libraryJournalKeeperSpeech?.classList.toggle("is-collapsed", libraryJournalRecords.classList.contains("is-collapsed"));
  syncLibraryJournalToggle();
  if (!libraryJournalRecords.classList.contains("is-collapsed")) {
    updateLibraryJournalKeeperSpeech();
  }
};

const createProfileFairyItem = ({ src, alt, nameText, statusText, quoteText = "", flower = "", categoryText, cycleNames = [], cycleFairies = [] }) => {
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
      thumb.dataset.viewerFlower = cycleFairy.flower ?? flower;
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
        flower: thumb.dataset.viewerFlower,
      });
      return;
    }

    openFairyViewer({ src, alt, name: nameText, status: statusText, quote: quoteText, flower });
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
      flower: cycleProgress.cycle.flower,
      categoryText: `${teacher.name} / 指導碁スタンプ`,
      cycleNames: [cycleName],
      cycleFairies: [{ src: fairy.src, alt: fairy.label, cycleName, quote: fairy.quote, flower: cycleProgress.cycle.flower }],
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
        flower: earnedFairy.flower ?? teacher?.flower,
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
      flower: earnedFairy.flower ?? teacher?.flower,
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
        companionId: companion.id,
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

const createAdventureJournalRecord = (text, source = "achievement") => ({
  text,
  source,
});

const getAdventureJournalRecords = (achievementResult) => {
  const records = [];
  const latestFairy = achievementResult.earnedFairies?.at(-1);
  const latestMedal = achievementResult.earnedMedals?.at(-1);
  const latestTitle = achievementResult.earnedTitles?.at(-1);
  const latestCompanion = achievementResult.earnedCompanions?.at(-1);

  if (latestFairy) {
    records.push(createAdventureJournalRecord(`🌸 ${latestFairy.flowerName ?? "花"}の妖精と出会いました`));
  }
  if (latestMedal) {
    records.push(createAdventureJournalRecord(`🏅 ${latestMedal.name}を収めました`));
  }
  if (latestTitle) {
    records.push(createAdventureJournalRecord(`📖 ${latestTitle.name}の本が増えました`));
  }
  if (latestCompanion) {
    records.push(createAdventureJournalRecord(`🦊 ${latestCompanion.name}が仲間になりました`));
  }
  if (gameRecords.length > 0) {
    records.push(createAdventureJournalRecord(`⚫ 対局記録が${gameRecords.length}局になりました`));
  }
  for (const entry of libraryJournalEntries.slice(0, 3)) {
    const mark = entry.source === "shrine" ? "⛩" : "✎";
    records.push(createAdventureJournalRecord(`${mark} ${entry.text}`, entry.source));
  }

  if (records.length === 0) {
    records.push(createAdventureJournalRecord("最初の記録を準備しています"));
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
        + libraryJournalEntries.length
    )
  );

  libraryJournalRecords.textContent = "";
  for (const record of records) {
    const item = document.createElement("li");
    const entry = typeof record === "string" ? createAdventureJournalRecord(record) : record;
    item.className = `is-journal-${entry.source}`;
    item.textContent = entry.text;
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

const handleLibraryJournalNote = () => {
  if (!libraryJournalNoteForm || !libraryJournalNoteInput) {
    setJournalPrompt("ひとこと欄を開けませんでした。");
    return;
  }

  libraryJournalNoteForm.hidden = false;
  libraryJournalNoteInput.focus();
  setJournalPrompt("短いひとことを、ここにしまえます。");
};

const saveLibraryJournalNote = () => {
  const note = libraryJournalNoteInput?.value ?? "";
  const entry = addLibraryJournalEntry({
    text: note,
    source: "manual",
  });

  if (!entry) {
    setJournalPrompt("ひとことを入れると、ここにしまえます。");
    return;
  }

  if (libraryJournalNoteInput) {
    libraryJournalNoteInput.value = "";
  }
  if (libraryJournalNoteForm) {
    libraryJournalNoteForm.hidden = true;
  }
  renderAdventureJournalPreview(getCurrentAchievementResult());
  updateLibraryJournalKeeperSpeech();
  setJournalPrompt("ひとことをしまいました。");
};

const renderOwlLibrary = (achievementResult) => {
  if (!libraryCurrentTitle || !librarySummary || !libraryTitleCount || !libraryMedalCount || !libraryOwl || !libraryGuide || !librarySpeech) {
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
    { label: "先生の輪", value: `基本5人 ${achievementResult.teacherCircle.currentRounds}巡`, mark: "輪", tone: "medal" },
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
      count: "基本5人を各1回",
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

    const isCircleTeacher = teacherCircleTargetIds.includes(card.dataset.teacher);
    const isExtraCircleTeacher = extraTeacherCircleTargetIds.includes(card.dataset.teacher);
    const teacherGroupLabel = isCircleTeacher
      ? "先生の輪"
      : isExtraCircleTeacher
        ? "新しい先生の輪"
        : "追加先生枠";

    applyFlowerVisual(flower, cycleProgress.cycle);

    if (isExtraCircleTeacher) {
      label.textContent = teacher.stampCount > 0
        ? "観察期間・記録済み"
        : "観察期間・未記録";
      continue;
    }

    label.textContent = teacher.completedFirstRound
      ? `${teacherGroupLabel} 済・${getTeacherStampText(teacher)}`
      : `${teacherGroupLabel} 未・${getTeacherStampText(teacher)}`;
  }
};

const getNextAdventure = () => {
  const candidates = [];
  const participationCurrent = normalizeProgressCount(userProgress.stamps.participationCount);
  const participationGoal = getParticipationGoal();
  const currentCircleRounds = getTeacherCircleRoundsFromCounts(userProgress.stamps.teacherLessonCounts);
  const nextCircleMilestone = (teacherCircleRule.medalMilestones ?? [])
    .map((milestone) => milestone.rounds)
    .find((rounds) => rounds > currentCircleRounds);

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
    if (nextCircleMilestone && !teacherCircleTargetIds.includes(teacherId)) {
      continue;
    }

    if (teacher.stampCount >= getTeacherMaxCount(teacher)) {
      continue;
    }

    const cycleProgress = getCurrentTeacherCycleProgress(teacher);
    const remaining = getTeacherGoal(teacher) - cycleProgress.countInCycle;
    const isExtraTeacherCircleTeacher = extraTeacherCircleTargetIds.includes(teacherId);

    candidates.push({
      type: "teacher",
      teacherId,
      priority: 1,
      remaining,
      title: `あと${remaining}回で${cycleProgress.cycle.fairyName}`,
      copy: isExtraTeacherCircleTeacher
        ? `${teacher.name}との指導碁で、新しい先生との出会いを記録できます。`
        : `${teacher.name}との指導碁で${cycleProgress.cycle.cycleName}を達成できます。`,
    });
  }

  if (nextCircleMilestone) {
    const remaining = teacherCircleTargetIds.reduce(
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

  renderAdventurerName();
  totalStamps.textContent = `スタンプ ${getTotalStampCount()}`;
  if (!latestTeacherStampReflection && todayTeacherStampReflections.length === 0) {
    todayTeacherStampReflections = loadTodayTeacherStampReflections();
    latestTeacherStampReflection = todayTeacherStampReflections.at(-1) ?? null;
  }
  const hasTodayParticipationStamp = userProgress.stamps.lastParticipationStampDate === getTodayForInput();
  const hasTodayTeacherStamp = todayTeacherStampReflections.length > 0;
  const hasTodayRecord = hasTodayParticipationStamp || hasTodayTeacherStamp;
  if (profileLatestStamp) {
    profileLatestStamp.hidden = !hasTodayRecord;
  }
  if (profileTodayParticipationMark) {
    profileTodayParticipationMark.textContent = userProgress.stamps.lastParticipationStampDate === getTodayForInput() ? "🌸" : "－";
  }
  if (latestTeacherStampReflection && profileLatestStampCopy) {
    profileLatestStampCopy.textContent = todayTeacherStampReflections.length > 1
      ? `今日の指導碁スタンプが${todayTeacherStampReflections.length}つ入りました。`
      : `先生スタンプが ${latestTeacherStampReflection.before}/${latestTeacherStampReflection.goal} から ${latestTeacherStampReflection.after}/${latestTeacherStampReflection.goal} に増えました。`;
  }
  if (!latestTeacherStampReflection && profileLatestStampCopy) {
    profileLatestStampCopy.textContent = hasTodayParticipationStamp ? "今日の参加スタンプが入りました。" : "";
  }
  renderProfileTodayGameRecords();
  if (profileLatestTeacherFlowers.length > 0) {
    profileLatestTeacherFlowers.forEach((button, index) => {
      const reflection = todayTeacherStampReflections[index];
      button.textContent = "";
      button.classList.toggle("is-empty", !reflection);
      button.dataset.teacherId = reflection?.teacherId ?? "";

      if (!reflection) {
        const slotNumber = document.createElement("span");
        slotNumber.className = "profile-today-record-slot-number";
        slotNumber.textContent = String(index + 1);
        button.append(slotNumber);
        button.setAttribute("aria-label", `${index + 1}つ目の指導碁スタンプ枠`);
        return;
      }

      const image = document.createElement("img");
      image.src = `assets/${reflection.flowerAsset}`;
      image.alt = reflection.flowerName;
      button.append(image);
      button.setAttribute("aria-label", `${reflection.teacherName}の${reflection.flowerName}を花図鑑で見る`);
    });
  }
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

  const completedCount = teacherCircleTargetIds
    .filter((teacherId) => normalizeProgressCount(adminDraft.teacherLessonCounts[teacherId]) > 0)
    .length;
  const totalCount = getTeacherCircleRequiredCount();
  const remainingCount = Math.max(0, totalCount - completedCount);
  const nextTeacherId = teacherCircleTargetIds
    .find((teacherId) => normalizeProgressCount(adminDraft.teacherLessonCounts[teacherId]) === 0);
  const nextTeacher = nextTeacherId ? teacherDetails[nextTeacherId] : null;
  const currentParticipationCount = normalizeProgressCount(adminDraft.participationCount);
  const draftCircleRounds = getAdminDraftTeacherCircleRounds();
  updateAdminIdentityCard();
  updateAdminIdentityNoteText();

  adminParticipation.textContent = `参加スタンプ ${currentParticipationCount}回`;
  adminTeacher.textContent = nextTeacher?.name ?? "基本5人は一巡済み";
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
  updateAdminOperationSummary();
  renderAdminAdjustments();
  renderAdminHistory();
  updateAdminParticipationApply();
  updateAdminGameRecordApply();
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
  flowConfirmStep.classList.toggle("is-complete", phase === "submitted" || phase === "done" || phase === "achievement");
  flowDoneStep.classList.toggle("is-complete", phase === "submitted" || phase === "done" || phase === "achievement");
  inlineFairyAchievement.hidden = true;
  fairyAchievement.hidden = phase !== "achievement";
  gameRecordForm.hidden = phase !== "confirm";
  confirmCard.hidden = teacher.stampCount >= getTeacherMaxCount(teacher) && phase !== "done";
  confirmCard.classList.toggle("is-achievement-preview", phase === "confirm" && isTeacherCycleAchievementCount(teacher.stampCount + 1, teacher));

  if (externalGameRecordFormEnabled && phase !== "done" && phase !== "achievement") {
    gameRecordForm.hidden = true;
    confirmCard.hidden = true;
    completeTeacherButton.hidden = true;
    flowMessage.textContent = teacher.stampCount >= getTeacherMaxCount(teacher)
      ? "この先生の花スタンプはすべて達成済みです。"
      : "先生席のQRで花が入ります。ハンデや勝敗まで残す時だけフォームを使います。";
    return;
  }

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

      confirmLabel.textContent = `${nextCycleNumber}巡目の達成前チェック`;
      updateGameRecordConfirmation();
      completeTeacherButton.textContent = "3. 記録を確認待ちにする";
      flowMessage.textContent = "ここまでは下書きです。反映は運営さんの確認後です。";
      return;
    }

    confirmLabel.textContent = "確認待ちにする対局記録";
    updateGameRecordConfirmation();
    completeTeacherButton.textContent = "3. 記録を確認待ちにする";
    flowMessage.textContent = "ここまでは下書きです。反映は運営さんの確認後です。";
    return;
  }

  if (phase === "done") {
    confirmEffect.textContent = "今日の指導碁を記録しました。";
    completeTeacherButton.textContent = "冒険者カードを見る";
    flowMessage.textContent = hasFirstRoundMedal()
      ? "一巡目の輪を達成しました。冒険者カードに新しい勲章が反映されています。"
      : "花がひとつ育ち、冒険者カードに残りました。";
    return;
  }

  if (phase === "submitted") {
    confirmLabel.textContent = "運営確認待ち";
    updateGameRecordConfirmation();
    confirmEffect.textContent = "運営さんの確認後に、対局記録とスタンプへ反映されます。";
    completeTeacherButton.textContent = "先生一覧に戻る";
    flowMessage.textContent = "対局記録を確認待ちにしました。当日の押印は不要です。";
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
  const profile = getTeacherProfile(teacherKey);
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
  document.querySelector("[data-teacher-style]").textContent = profile.style;
  document.querySelector("[data-teacher-lesson]").textContent = profile.lesson;
  document.querySelector("[data-teacher-note]").textContent = profile.note;
  if (teacherEventFirstNote) {
    teacherEventFirstNote.textContent = teacher.stampCount === 0
      ? `ふだんは先生席のQRで${teacher.name}の花を入れます。ハンデや勝敗まで残す時だけフォームを使います。`
      : `先生席のQRで${teacher.name}の花スタンプが冒険者カードへ残ります。詳しい対局内容は必要な時だけフォームで残します。`;
  }
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

const showParticipationStampEntry = (message = "参加フォームはここからだけ開きます") => {
  showPanel("field-guide");
  showTeacherList();
  showFlowerGuideArrival(participationStamp, message);
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
      showParticipationStampEntry("参加フォームはこの参加スタンプ欄から開きます");
      return;
    }

    openTeacherDetailFromCard(document.querySelector(`.teacher-card[data-teacher="${target}"]`));
    showFlowerGuideArrival(teacherDetail, `${flowerName}は${flowerMeta}の1巡目の花です`);
  });
}

for (const button of mapDestinationButtons) {
  button.addEventListener("click", () => {
    if (button.dataset.mapDestination === "participation") {
      openParticipationStartSheet();
      return;
    }

    openShrineWithIntro();
  });
}

shrineTeacherEditorToggle?.addEventListener("click", () => {
  if (!shrineTeacherList) {
    return;
  }

  const shouldOpen = shrineTeacherList.hidden;
  shrineTeacherList.hidden = !shouldOpen;
  shrineTeacherEditorToggle.setAttribute("aria-expanded", String(shouldOpen));
  shrineTeacherEditorToggle.textContent = shouldOpen ? "閉じる" : "参加先生を選ぶ";
});

shrineTeacherList?.addEventListener("change", () => {
  saveShrineTodayTeacherSettings();
  updateShrineTeacherCount();

  if (shrineResult?.querySelector(".shrine-round-result")) {
    renderShrineResult();
  }
});
shrineRoundCount?.addEventListener("change", () => {
  if (shrineResult?.querySelector(".shrine-round-result")) {
    renderShrineResult();
  }
});

for (const button of shrineModeButtons) {
  button.addEventListener("click", () => {
    shrineMatchSession = null;
    const nextMode = button.dataset.shrineMode;
    if (nextMode !== "amateur" || latestPairgoGroups.length === 0) {
      shrineAmateurUsesCarriedGroups = false;
    }
    updateShrineMode(nextMode);
    const carriedGroups = nextMode === "amateur" && carryPairgoGroupsToAmateurParticipants({ force: true });
    if (carriedGroups) {
      renderShrineResult();
      return;
    }
    if (shrineResult) {
      shrineResult.textContent = "";
      const empty = document.createElement("p");
      empty.textContent = "参加者を入れて「組み合わせを出す」を押してください。";
      shrineResult.append(empty);
      updateShrineRecordSaveState();
    }
  });
}

shrineRosterToggle?.addEventListener("click", () => {
  if (!shrineRosterPanel || !shrineRosterToggle) {
    return;
  }

  const willOpen = shrineRosterPanel.hidden;
  shrineRosterPanel.hidden = !willOpen;
  if (!willOpen) {
    shrineRosterPanel.classList.remove("is-editing");
    if (shrineRosterEditor) {
      shrineRosterEditor.hidden = true;
    }
    shrineRosterEditToggle?.setAttribute("aria-expanded", "false");
  }
  shrineRosterToggle.setAttribute("aria-expanded", String(willOpen));
  shrineRosterToggle.textContent = willOpen ? "よく来る人を閉じる" : "よく来る人を開く";
  shrineRosterEditToggle.textContent = willOpen ? "登録欄を閉じる" : "登録する";
  if (willOpen) {
    renderShrineRoster();
    updateShrineRosterApplyState();
    setShrineRosterMessage("来ている人にチェックしてください。");
  }
});

shrineRosterEditToggle?.addEventListener("click", () => {
  if (!shrineRosterEditor || !shrineRosterEditToggle) {
    return;
  }

  const willOpen = shrineRosterEditor.hidden;
  shrineRosterEditor.hidden = !willOpen;
  shrineRosterPanel?.classList.toggle("is-editing", willOpen);
  shrineRosterEditToggle.setAttribute("aria-expanded", String(willOpen));
  shrineRosterEditToggle.textContent = willOpen ? "編集を閉じる" : "名簿を編集";
  if (willOpen) {
    clearShrineRosterForm();
    setShrineRosterMessage("上の欄に入れて登録できます。下の名前をタップすると直せます。");
    shrineRosterFormName?.focus();
  }
  if (willOpen && shrineRosterEditorText) {
    shrineRosterEditorText.value = shrineRosterNames.map(formatShrinePersonLine).join("\n");
  }
});

shrineRosterSave?.addEventListener("click", () => {
  if (shrineRosterFormName) {
    const name = shrineRosterFormName.value.trim();
    if (!name) {
      setShrineRosterMessage("名前を入れてから登録してください。");
      shrineRosterFormName.focus();
      return;
    }

    const nextPerson = {
      name,
      gender: normalizeShrineGender(shrineRosterFormGender?.value),
      strength: normalizeShrineStrength({
        type: shrineRosterFormStrengthType?.value,
        value: shrineRosterFormStrengthValue?.value,
      }),
    };
    lastSavedShrineRosterName = name;
    const withoutCurrent = shrineRosterNames.filter((person) =>
      person.name !== editingShrineRosterName && person.name !== name
    );
    shrineRosterNames = normalizeRosterNames([...withoutCurrent, nextPerson]);
    saveShrineRoster();
    renderShrineRoster();
    clearShrineRosterForm();
    updateShrineRosterApplyState();
    setShrineRosterMessage(`${name} をよく来る人に登録しました。`);
    return;
  }

  shrineRosterNames = normalizeRosterNames(shrineRosterEditorText?.value ?? "");
  saveShrineRoster();
  renderShrineRoster();
  if (shrineRosterEditor) {
    shrineRosterEditor.hidden = true;
  }
  shrineRosterPanel?.classList.remove("is-editing");
  shrineRosterEditToggle?.setAttribute("aria-expanded", "false");
  updateShrineRosterApplyState();
  setShrineRosterMessage(`名簿を${shrineRosterNames.length}人で保存しました。`);
});

shrineRosterSave?.addEventListener("click", () => {
  setShrineRosterMessage(`名簿を${shrineRosterNames.length}人で保存しました。来ている人にチェックしてください。`);
});

shrineRosterDelete?.addEventListener("click", () => {
  if (!editingShrineRosterName) {
    clearShrineRosterForm();
    setShrineRosterMessage("入力欄を空にしました。");
    return;
  }

  const deletedName = editingShrineRosterName;
  shrineRosterNames = shrineRosterNames.filter((person) => person.name !== deletedName);
  saveShrineRoster();
  renderShrineRoster();
  clearShrineRosterForm();
  updateShrineRosterApplyState();
  setShrineRosterMessage(`${deletedName} をよく来る人から消しました。`);
});

shrineRosterSave?.addEventListener("click", () => {
  if (shrineRosterFormName) {
    const savedName = lastSavedShrineRosterName || shrineRosterFormName.value.trim() || "名簿";
    setShrineRosterMessage(`${savedName} を登録しました。来ている人にチェックしてください。`);
  }
});

shrineRosterFormStrengthType?.addEventListener("change", () => {
  setRosterStrengthValueMode(shrineRosterFormStrengthValue, shrineRosterFormStrengthType.value);
});

shrineRosterList?.addEventListener("click", (event) => {
  const button = event.target instanceof HTMLElement
    ? event.target.closest("[data-shrine-roster-edit-name]")
    : null;
  if (!button) {
    return;
  }

  const person = shrineRosterNames.find((item) => item.name === button.dataset.shrineRosterEditName);
  if (!person) {
    return;
  }

  if (shrineRosterEditor) {
    shrineRosterEditor.hidden = false;
  }
  shrineRosterPanel?.classList.add("is-editing");
  shrineRosterEditToggle?.setAttribute("aria-expanded", "true");
  fillShrineRosterForm(person);
  setShrineRosterMessage(`${person.name} の内容を上の欄で直せます。`);
  shrineRosterFormName?.focus();
});

const syncShrineRosterRow = (target) => {
  if (!(target instanceof HTMLElement) || !target.matches("[data-shrine-roster-gender], [data-shrine-roster-strength-type], [data-shrine-roster-strength-value], [data-shrine-roster-full-name]")) {
    return;
  }

  const row = target.closest("label");
  const checkbox = row?.querySelector("[data-shrine-roster-name]");
  const originalName = checkbox?.dataset.shrineRosterName;
  const nameInput = row?.querySelector("[data-shrine-roster-full-name]");
  const genderSelect = row?.querySelector("[data-shrine-roster-gender]");
  const strengthType = row?.querySelector("[data-shrine-roster-strength-type]");
  const strengthValue = row?.querySelector("[data-shrine-roster-strength-value]");
  const nextName = nameInput?.value.trim() || originalName;

  updateShrineRosterStrengthValueInput(strengthValue, strengthType?.value);

  shrineRosterNames = shrineRosterNames.map((person) => person.name === originalName
    ? {
        name: nextName,
        gender: normalizeShrineGender(genderSelect?.value),
        strength: normalizeShrineStrength({
          type: strengthType?.value,
          value: strengthValue?.value,
        }),
      }
    : person);
  saveShrineRoster();

  const updatedPerson = shrineRosterNames.find((person) => person.name === nextName);
  if (checkbox && updatedPerson) {
    checkbox.dataset.shrineRosterName = updatedPerson.name;
    checkbox.value = formatShrinePersonLine(updatedPerson);
  }
  if (nameInput && updatedPerson) {
    nameInput.dataset.shrineRosterFullName = updatedPerson.name;
  }
  const nextGenderSelect = row?.querySelector("[data-shrine-roster-gender]");
  const nextStrengthType = row?.querySelector("[data-shrine-roster-strength-type]");
  const nextStrengthValue = row?.querySelector("[data-shrine-roster-strength-value]");
  if (nextGenderSelect && updatedPerson) {
    nextGenderSelect.dataset.shrineRosterGender = updatedPerson.name;
  }
  if (nextStrengthType && updatedPerson) {
    nextStrengthType.dataset.shrineRosterStrengthType = updatedPerson.name;
  }
  if (nextStrengthValue && updatedPerson) {
    nextStrengthValue.dataset.shrineRosterStrengthValue = updatedPerson.name;
  }
  setShrineRosterMessage("名簿の記録を保存しました。");
};

shrineRosterList?.addEventListener("change", (event) => {
  syncShrineRosterRow(event.target);
  updateShrineRosterApplyState();
});

shrineRosterList?.addEventListener("input", (event) => {
  syncShrineRosterRow(event.target);
});

shrineRosterSearch?.addEventListener("input", () => {
  renderShrineRoster();
  updateShrineRosterApplyState();
});

shrineRosterApply?.addEventListener("click", () => {
  if (!shrineParticipants || !shrineRosterList) {
    return;
  }

  const selectedNames = [...shrineRosterList.querySelectorAll("[data-shrine-roster-name]:checked")]
    .map((input) => input.value);
  const beforeCount = getShrineParticipantNames().length;
  const mergedNames = appendShrineParticipants(selectedNames);
  const addedCount = Math.max(0, mergedNames.length - beforeCount);

  setShrineRosterMessage(selectedNames.length > 0
    ? `${addedCount}人を参加者欄へ足しました。`
    : "来ている人をチェックしてください。");

  if (selectedNames.length > 0) {
    for (const checkbox of shrineRosterList.querySelectorAll("[data-shrine-roster-name]:checked")) {
      checkbox.checked = false;
    }
    updateShrineRosterApplyState();
  }
});

shrineSampleButton?.addEventListener("click", () => {
  if (!shrineParticipants) {
    return;
  }

  const lessonSample = [
    "佐藤さん",
    "鈴木さん",
    "田中さん",
    "高橋さん",
    "伊藤さん",
    "山本さん",
    "中村さん",
    "小林さん",
    "加藤さん",
    "吉田さん",
    "山田さん",
    "渡辺さん",
  ];
  const amateurSample = [
    "1番",
    "2番",
    "3番",
    "4番",
    "5番",
    "6番",
    "青木さん",
    "石井さん",
  ];
  const pairgoSample = [
    "春子さん 女 3級",
    "秋人さん 男 2級",
    "夏美さん 女 1200点",
    "冬馬さん 男 1250点",
    "朝子さん 女 5級",
    "昼夫さん 男 4級",
    "夕子さん 女 1段",
    "夜一さん 男 1段",
    "星乃さん 女 2段",
    "月野さん 1300点",
  ];
  const sampleByMode = {
    amateur: amateurSample,
    pairgo: pairgoSample,
    lesson: lessonSample,
  };

  const mode = getShrineMode();
  if (mode === "pairgo") {
    if (shrineGroupSize) {
      shrineGroupSize.value = "2";
    }
    if (shrineFixedGroups) {
      shrineFixedGroups.value = [
        "春子さん・秋人さん",
        "夏美さん・冬馬さん",
      ].join("\n");
    }
    shrineParticipants.value = [
      "朝子さん 女 5級",
      "昼夫さん 男 4級",
      "夕子さん 女 1段",
      "夜一さん 男 1段",
      "星乃さん 女 2段",
      "月野さん 1300点",
    ].join("\n");
    renderShrineResult();
    return;
  }

  if (shrineFixedGroups) {
    shrineFixedGroups.value = "";
  }
  shrineParticipants.value = (sampleByMode[mode] ?? lessonSample).join("\n");
  renderShrineResult();
});

shrineQuickAdd?.addEventListener("click", () => {
  if (!shrineParticipants || !shrineQuickName) {
    return;
  }

  const name = shrineQuickName.value.trim();
  if (!name) {
    if (shrineQuickMessage) {
      shrineQuickMessage.textContent = "名前を入れてから追加してください。";
    }
    shrineQuickName.focus();
    return;
  }

  const existingNames = new Set(getShrineParticipantPeople().map((person) => person.name));
  if (existingNames.has(name)) {
    if (shrineQuickMessage) {
      shrineQuickMessage.textContent = `${name} はすでに参加者欄に入っています。`;
    }
    return;
  }

  const personLine = formatShrinePersonLine({
    name,
    gender: shrineQuickGender?.value,
    strength: {
      type: shrineQuickStrengthType?.value,
      value: shrineQuickStrengthValue?.value,
    },
  });
  const currentLines = shrineParticipants.value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  shrineParticipants.value = [...currentLines, personLine].join("\n");
  shrineQuickName.value = "";
  if (shrineQuickGender) {
    shrineQuickGender.value = "";
  }
  if (shrineQuickStrengthType) {
    shrineQuickStrengthType.value = "";
  }
  if (shrineQuickStrengthValue) {
    shrineQuickStrengthValue.value = "";
  }
  if (shrineQuickMessage) {
    shrineQuickMessage.textContent = `${name} を参加者欄へ追加しました。`;
  }
  shrineQuickName.focus();
  renderShrineResult();
});

shrineResetButton?.addEventListener("click", () => {
  if (shrineParticipants) {
    shrineParticipants.value = "";
  }
  if (shrineFixedGroups) {
    shrineFixedGroups.value = "";
  }
  if (shrineResult) {
    shrineResult.textContent = "";
    const empty = document.createElement("p");
    empty.textContent = "参加者を入れて「組み合わせを出す」を押してください。";
    shrineResult.append(empty);
  }
  if (shrineNumberMessage) {
    shrineNumberMessage.textContent = "例: 8なら 1番から8番までを入れます。個人戦では個人番号として使えます。";
  }
  if (shrineQuickName) {
    shrineQuickName.value = "";
  }
  if (shrineQuickGender) {
    shrineQuickGender.value = "";
  }
  if (shrineQuickStrengthType) {
    shrineQuickStrengthType.value = "";
  }
  if (shrineQuickStrengthValue) {
    shrineQuickStrengthValue.value = "";
  }
  if (shrineQuickMessage) {
    shrineQuickMessage.textContent = "名前を入れて追加してください。";
  }
  for (const checkbox of shrineRosterList?.querySelectorAll("[data-shrine-roster-name]:checked") ?? []) {
    checkbox.checked = false;
  }
  updateShrineRosterApplyState();
  shrineMatchSession = null;
  latestPairgoGroups = [];
  shrineAmateurUsesCarriedGroups = false;
  updateShrineParticipantInputVisibility();
  setShrineRosterMessage("入力をリセットしました。名簿はそのまま残っています。");
  updateShrineRecordSaveState();
});

shrineGenerateButton?.addEventListener("click", renderShrineResult);
for (const button of shrineCollapsibleButtons) {
  syncShrineCollapsibleButton(button);
  button.addEventListener("click", () => toggleShrineCollapsiblePanel(button));
}
for (const button of shrinePathModeButtons) {
  button.addEventListener("click", () => {
    const nextMode = button.dataset.shrinePathMode;
    if (nextMode !== "amateur" || latestPairgoGroups.length === 0) {
      shrineAmateurUsesCarriedGroups = false;
    }
    updateShrineMode(nextMode);
    if (nextMode === "amateur") {
      carryPairgoGroupsToAmateurParticipants({ force: true });
    }
    renderShrineResult();
  });
}
shrinePathResultButton?.addEventListener("click", () => {
  if (!shrineResult) {
    return;
  }
  syncVisibleShrineMatchResults();
  renderShrineResult();
  shrineResult.scrollIntoView({ behavior: "smooth", block: "start" });
});
shrineResult?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLElement && event.target.matches("[data-shrine-next-round]")) {
    applyShrineMatchResultsAndAdvance();
  }
  if (event.target instanceof HTMLElement && event.target.matches("[data-shrine-use-pairgo-groups]")) {
    shrineMatchSession = null;
    updateShrineMode("amateur");
    carryPairgoGroupsToAmateurParticipants({ force: true });
    renderShrineResult();
  }
});
shrineIntroSkip?.addEventListener("click", () => {
  if (isShrineIntroPlaying) {
    finishShrineIntro();
  }
});
shrineGroupSize?.addEventListener("change", () => {
  if (getShrineMode() === "pairgo") {
    renderShrineResult();
  }
});
shrineFixedGroups?.addEventListener("input", () => {
  if (getShrineMode() === "pairgo") {
    renderShrineResult();
  }
});
const handleShrineMatchMethodChange = (event) => {
  const nextMethod = event.target?.value || getShrineMatchMethod();
  syncShrineMatchMethodControls(nextMethod);
  shrineMatchSession = null;
  if (getShrineMode() === "amateur") {
    renderShrineResult();
  }
};
shrineMatchMethod?.addEventListener("change", handleShrineMatchMethodChange);
shrineMatchMethodShortcut?.addEventListener("change", handleShrineMatchMethodChange);
shrineMixedGenderPairs?.addEventListener("change", () => {
  if (getShrineMode() === "pairgo") {
    renderShrineResult();
  }
});
shrineCloseStrengthPairs?.addEventListener("change", () => {
  if (getShrineMode() === "pairgo") {
    renderShrineResult();
  }
});
shrineBalancedTeamStrength?.addEventListener("change", () => {
  if (getShrineMode() === "pairgo") {
    renderShrineResult();
  }
});
shrineNumberApply?.addEventListener("click", () => {
  if (!shrineParticipants || !shrineNumberCount) {
    return;
  }

  const count = Math.max(2, Math.min(200, Number(shrineNumberCount.value) || 2));
  shrineNumberCount.value = String(count);
  const numberNames = Array.from({ length: count }, (_, index) => `${index + 1}番`);
  const beforeCount = getShrineParticipantNames().length;
  const mergedNames = appendShrineParticipants(numberNames);
  const addedCount = Math.max(0, mergedNames.length - beforeCount);

  if (shrineNumberMessage) {
    shrineNumberMessage.textContent = addedCount > 0
      ? `1番から${count}番までを参加者欄へ足しました。名前と番号の両方を使えます。`
      : `1番から${count}番までは、すでに参加者欄に入っています。`;
  }

  renderShrineResult();
});

shrineRecordSave?.addEventListener("click", () => {
  if (!shrineResult?.querySelector(".shrine-round-result")) {
    updateShrineRecordSaveState();
    return;
  }

  const mode = getShrineMode();
  const createdAt = new Date().toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const body = shrineResult.innerText.trim();

  shrineRecords = [{
    id: `shrine-${Date.now()}`,
    title: `${getShrineModeLabel(mode)}の組み合わせ`,
    mode,
    createdAt,
    body,
  }, ...shrineRecords].slice(0, 12);
  saveShrineRecords();
  renderShrineRecords();
  addLibraryJournalEntry({
    text: getShrineRecordJournalText({ mode, body }),
    source: "shrine",
  });
  updateProfileCard();
  updateLibraryJournalKeeperSpeech();
  if (shrineRecordMessage) {
    shrineRecordMessage.textContent = "今の組み合わせを書庫の日誌にも残しました。";
  }
});

shrineRecordClear?.addEventListener("click", () => {
  if (shrineRecords.length === 0) {
    renderShrineRecords();
    return;
  }
  if (!window.confirm("保存した組み合わせをすべて空にしますか？")) {
    return;
  }
  shrineRecords = [];
  saveShrineRecords();
  renderShrineRecords();
  if (shrineRecordMessage) {
    shrineRecordMessage.textContent = "保存した組み合わせを空にしました。";
  }
});

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
libraryJournalKeeperViewerButton?.addEventListener("click", openLibraryJournalKeeperViewer);
libraryJournalToggle?.addEventListener("click", toggleLibraryJournal);
syncLibraryJournalToggle();
libraryJournalSkip?.addEventListener("click", () => setJournalPrompt("わかった。今日もちゃんとしまっておくね。"));
libraryJournalNote?.addEventListener("click", handleLibraryJournalNote);
libraryJournalNoteSave?.addEventListener("click", saveLibraryJournalNote);
libraryJournalNoteInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    saveLibraryJournalNote();
  }
});

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

let adminEntryTimer = null;
let adminEntryTapCount = 0;
let adminEntryTapResetTimer = null;
const adminEntryHash = "#admin";

const clearAdminEntryTimer = () => {
  if (!adminEntryTimer) {
    return;
  }

  window.clearTimeout(adminEntryTimer);
  adminEntryTimer = null;
};

const openAdminEntry = () => {
  clearAdminEntryTimer();
  window.clearTimeout(adminEntryTapResetTimer);
  adminEntryTapCount = 0;
  if (adminTab) {
    adminTab.hidden = false;
  }
  infoTabs?.classList.add("is-admin-available");
  lockAdminPanel();
  showPanel("admin");
  adminPasscodeMessage.textContent = isAdminPasscodeConfigured()
    ? "運営用パスコードを入力してください。"
    : "初回設定です。この運営端末で使うパスコードを8文字以上で入力してください。";
  adminPasscodeInput?.focus();
};

const syncAdminDirectEntry = () => {
  if (adminTab) {
    adminTab.hidden = true;
  }
  infoTabs?.classList.remove("is-admin-available");
};

guidebookButton?.addEventListener("pointerdown", () => {
  clearAdminEntryTimer();
  adminEntryTimer = window.setTimeout(openAdminEntry, 1200);
});

for (const eventName of ["pointerup", "pointerleave", "pointercancel", "blur"]) {
  guidebookButton?.addEventListener(eventName, clearAdminEntryTimer);
}

guidebookButton?.addEventListener("click", () => {
  if (window.location.hash === adminEntryHash) {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    return;
  }

  window.clearTimeout(adminEntryTapResetTimer);
  adminEntryTapCount += 1;

  if (adminEntryTapCount >= 3) {
    if (adminTab) {
      adminTab.hidden = false;
      adminTab.focus();
    }
    infoTabs?.classList.add("is-admin-available");
    return;
  }

  adminEntryTapResetTimer = window.setTimeout(() => {
    adminEntryTapCount = 0;
  }, 1800);
});

window.addEventListener("hashchange", syncAdminDirectEntry);
window.addEventListener("hashchange", applyStampQrFromLocation);
syncAdminDirectEntry();

nextAdventureButton.addEventListener("click", () => {
  if (nextAdventureButton.dataset.adventureType === "complete") {
    showPanel("titles");
    return;
  }

  showPanel("field-guide");
  showTeacherList();

  if (nextAdventureButton.dataset.nextAdventureTeacher) {
    document.querySelector(`.teacher-card[data-teacher="${nextAdventureButton.dataset.nextAdventureTeacher}"]`)?.click();
  } else if (nextAdventureButton.dataset.adventureType === "participation") {
    openParticipationStartSheet();
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
  openParticipationForm();
});

participationStartFormButton?.addEventListener("click", () => {
  openParticipationForm();
});

for (const closeButton of participationStartCloseButtons) {
  closeButton.addEventListener("click", closeParticipationStartSheet);
}

adminParticipationApply?.addEventListener("click", applyTodayParticipationStampFromAdmin);
adminParticipationQrCreateButton?.addEventListener("click", createAdminParticipationQr);
adminCombinedApply?.addEventListener("click", applyCombinedAdminOperation);
adminDuplicateTeacherApply?.addEventListener("click", applyDuplicateTeacherGameFromAdmin);
adminGameRecordApply?.addEventListener("click", applyGameRecordFromAdmin);
adminStampQrCreateButton?.addEventListener("click", createAdminStampQr);
adminFixedTeacherQrCreateButton?.addEventListener("click", createAdminFixedTeacherQrs);
adminFixedTeacherQrPrintButton?.addEventListener("click", () => {
  if (!document.body.classList.contains("is-admin-qr-print-preview")) {
    setAdminFixedTeacherQrPrintPreview(true);
    return;
  }

  window.print();
});
adminFixedTeacherQrPdfButton?.addEventListener("click", openAdminFixedTeacherQrPdfPage);
adminFixedTeacherQrPreviewCloseButton?.addEventListener("click", () => {
  setAdminFixedTeacherQrPrintPreview(false);
});
adminUndoGameRecordButton?.addEventListener("click", undoLatestGameRecordFromAdmin);
adminTroubleToggle?.addEventListener("click", () => {
  setAdminTroublePanelExpanded(adminTroublePanel?.hidden === true);
});
adminSettingsToggle?.addEventListener("click", () => {
  setAdminSettingsPanelExpanded(adminSettingsPanel?.hidden === true);
});
adminShowProfileButton?.addEventListener("click", () => {
  showPanel("profile");
  scrollProfileTodayRecordIntoView();
});

for (const input of [adminGameRecordTeacher, adminGameRecordDate, adminGameRecordHandicap, adminGameRecordResult]) {
  input?.addEventListener("input", updateAdminOperationSummary);
  input?.addEventListener("change", updateAdminOperationSummary);
}
for (const profileLatestTeacherFlower of profileLatestTeacherFlowers) {
  profileLatestTeacherFlower.addEventListener("click", () => {
    const teacherId = profileLatestTeacherFlower.dataset.teacherId;
    if (!teacherId) {
      return;
    }

    showPanel("field-guide");
    const teacherCard = document.querySelector(`.teacher-card[data-teacher="${teacherId}"]`);
    if (teacherCard) {
      openTeacherDetailFromCard(teacherCard);
    }
  });
}

adminTeacherProfileSelect?.addEventListener("change", syncAdminTeacherProfileEditor);
adminTeacherProfileSave?.addEventListener("click", saveAdminTeacherProfileEditor);
adminTeacherProfileReset?.addEventListener("click", resetAdminTeacherProfileEditor);

for (const input of [adminGameRecordTeacher, adminGameRecordDate, adminGameRecordHandicap, adminGameRecordResult]) {
  input?.addEventListener("input", () => {
    clearAdminStampQr();
    updateAdminGameRecordApply();
  });
  input?.addEventListener("change", () => {
    clearAdminStampQr();
    updateAdminGameRecordApply();
  });
}

for (const input of [adminTeacherProfileStyle, adminTeacherProfileLesson, adminTeacherProfileNote]) {
  input?.addEventListener("input", markAdminTeacherProfileDirty);
}

completeTeacherButton.addEventListener("click", () => {
  const teacher = teacherDetails[activeTeacherKey];

  if (recordPhase === "submitted") {
    showTeacherList();
    return;
  }

  if (recordPhase === "done" || recordPhase === "achievement") {
    updateProfileCard();
    showPanel("profile");
    return;
  }

  if (recordPhase === "confirm") {
    if (Date.now() < confirmSaveReadyAt) {
      return;
    }
    addPendingGameRecord(activeTeacherKey);
    renderTeacherGameRecords(activeTeacherKey);
    setRecordPhase("submitted", teacher);
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
    teacherProfileOverrides = sanitizeTeacherProfileOverrides(restoreBackup.teacherProfiles ?? {});
    saveTeacherProfileOverrides();
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
    syncAdminTeacherProfileEditor();
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

adventurerNameEdit?.addEventListener("click", () => {
  if (!adventurerNameForm) {
    return;
  }

  const isOpening = adventurerNameForm.hidden;
  adventurerNameForm.hidden = !isOpening;
  if (adventurerNameMessage) {
    adventurerNameMessage.hidden = true;
    adventurerNameMessage.textContent = "";
  }
  if (isOpening) {
    renderAdventurerName();
    adventurerNameInput?.focus();
  }
});

adventurerNameForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = saveAdventurerName(adventurerNameInput?.value);
  renderAdventurerName();
  updateAdminIdentityCard();
  updateAdminIdentityNoteText();
  adventurerNameForm.hidden = true;
  if (adventurerNameMessage) {
    adventurerNameMessage.hidden = false;
    adventurerNameMessage.textContent = name === defaultAdventurerName
      ? "名前を初期表示に戻しました。"
      : "このスマホに名前を保存しました。";
  }
});

adminIdentityRealName?.addEventListener("input", () => {
  saveAdminIdentityRealName(adminIdentityRealName.value);
  updateAdminIdentityCard();
  updateAdminIdentityNoteText();
  updateAdminOperationSummary();
});

adminIdentityCode?.addEventListener("input", () => {
  saveAdminIdentityCode(adminIdentityCode.value);
  updateAdminIdentityCard();
  updateAdminIdentityNoteText();
  updateAdminOperationSummary();
});

adminIdentityDisplayName?.addEventListener("input", () => {
  saveAdminIdentityDisplayName(adminIdentityDisplayName.value);
  updateAdminIdentityCard();
  updateAdminIdentityNoteText();
  updateAdminOperationSummary();
});

updateParticipationStampCard();
updateTeacherCards();
updateRoundProgress();
updateProfileCard();
populateAdminGameRecordTeachers();
populateAdminTeacherProfileEditor();
syncAdminTeacherProfileEditor();
renderShrineTeachers();
renderShrineRoster();
renderShrineRecords();
updateShrineMode();
updateShrineRecordSaveState();
updateLibraryJournalKeeperSpeech();
updateAdminPanel();
updateAdminLockState();
updateBrowserStorageWarning();
applyStampQrFromLocation();

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
