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
const circleBadge = document.querySelector("[data-circle-badge]");
const profileBadges = document.querySelector(".profile-badges");
const profileFairyList = document.querySelector("[data-profile-fairy-list]");
const profileFairies = document.querySelector("[data-profile-fairies]");
const circleStamp = document.querySelector("[data-circle-stamp='first']");
const circleStatus = document.querySelector("[data-circle-status]");
const roundSummary = document.querySelector("[data-round-summary]");
const roundRemaining = document.querySelector("[data-round-remaining]");
const adminStampButton = document.querySelector(".admin-stamp-button");
const adminState = document.querySelector("[data-admin-state]");
const adminSummary = document.querySelector("[data-admin-summary]");
const adminTeacher = document.querySelector("[data-admin-teacher]");
const adminNote = document.querySelector("[data-admin-note]");
const adminResult = document.querySelector("[data-admin-result]");

let activeTeacherKey = "tsuneishi";
let recordPhase = "ready";

const ruleTargets = window.teacherStampTargets ?? [];
const teacherLessonRule = window.stampRules?.teacherLesson ?? {};
const teacherCircleRule = window.stampRules?.teacherCircle ?? {};
const teacherTargetById = Object.fromEntries(ruleTargets.map((target) => [target.teacherId, target]));

const getTeacherTarget = (teacherKey) => teacherTargetById[teacherKey];
const getTeacherGoal = (teacher) => teacher.stampGoal ?? teacherLessonRule.maxCountPerTeacher ?? 5;
const getTeacherCircleRequiredCount = () =>
  teacherCircleRule.requiredTeachersPerRound ?? ruleTargets.length ?? Object.keys(teacherDetails).length;

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
}

const showPanel = (target) => {
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

let getTeacherStampText = (teacher) => {
  if (teacher.fairy || teacher.stampCount >= 5) {
    return "妖精スタンプ出現";
  }

  if (teacher.stampCount === 0) {
    return "指導後スタンプ 0/5";
  }

  return `妖精まで ${teacher.stampCount}/5`;
};

getTeacherStampText = (teacher) => {
  const goal = getTeacherGoal(teacher);

  if (teacher.fairy || teacher.stampCount >= goal) {
    return `${teacher.flowerName ?? "花"}の妖精達成`;
  }

  if (teacher.stampCount === 0) {
    return `妖精まで 0/${goal}`;
  }

  return `妖精まで ${teacher.stampCount}/${goal}`;
};

const updateTeacherStampRuleNote = (teacher) => {
  if (!teacherStampRule) {
    return;
  }

  const stampText = teacherStampRule.querySelector("[data-teacher-stamp]");
  const note = document.createElement("span");
  note.dataset.teacherStampRule = "";
  note.textContent = `${teacher.flowerName ?? "花"}の妖精達成は${getTeacherGoal(teacher)}回。先生の輪の一巡判定とは別に管理します。`;

  teacherStampRule.textContent = "";
  teacherStampRule.append(stampText);
  teacherStampRule.append(document.createElement("br"));
  teacherStampRule.append(note);
};

const getAchievementFairy = (teacher) => {
  const src = teacher.fairyAsset ? `assets/${teacher.fairyAsset}` : (fairyAssets[teacher.flower]?.src ?? fairyAssets.cosmos.src);
  const flowerName = teacher.flowerName ?? "花";
  const label = `${flowerName}の妖精達成`;

  return { src, label };
};

const getTotalTeacherStampCount = () =>
  Object.values(teacherDetails).reduce((total, teacher) => total + teacher.stampCount, 0);

const getEarnedFairyTeachers = () =>
  Object.values(teacherDetails).filter((teacher) => teacher.fairy || teacher.stampCount >= getTeacherGoal(teacher));

const getCurrentProgressForEvaluation = () => {
  const requiredTeachers = getTeacherCircleRequiredCount();
  const teacherLessonCounts = Object.fromEntries(
    Object.entries(teacherDetails).map(([teacherId, teacher]) => [teacherId, teacher.stampCount])
  );

  return {
    participationCount: window.userProgressTemplate?.participationCount ?? 0,
    teacherLessonCounts,
    teacherCircleRounds: getCompletedFirstRoundCount() >= requiredTeachers ? 1 : 0,
  };
};

const getCurrentAchievementResult = () =>
  window.achievementEvaluators.evaluateAllAchievements(getCurrentProgressForEvaluation());

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
    const teacher = teacherDetails[earnedFairy.teacherId];
    const fairy = getAchievementFairy(teacher);
    const item = document.createElement("article");
    item.className = "profile-fairy-item";

    const image = document.createElement("img");
    image.src = fairy.src;
    image.alt = earnedFairy.name;

    const copy = document.createElement("div");
    const name = document.createElement("strong");
    const status = document.createElement("span");

    name.textContent = earnedFairy.name;
    status.textContent = `${earnedFairy.teacherName} 達成済み`;

    copy.append(name, status);
    item.append(image, copy);
    profileFairyList.append(item);
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
  const teacherFairyCount = achievementResult.teacherFairy.achievedTeachers.length;
  const teacherTotal = achievementResult.teacherFairy.teachers.length;
  const circleRounds = achievementResult.teacherCircle.currentRounds;

  const rows = [
    {
      label: "参加スタンプ",
      status: achievementResult.participation.isAchieved ? "達成済み" : "未達成",
      count: `${achievementResult.participation.currentCount}/${achievementResult.participation.requiredCount}回`,
    },
    {
      label: "先生ごとの妖精達成",
      status: `${teacherFairyCount}/${teacherTotal}人 達成`,
      count: "各先生 5回",
    },
    {
      label: "先生の輪",
      status: circleRounds > 0 ? `${circleRounds}巡 達成済み` : "未達成",
      count: "先生5人を各1回",
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

    name.textContent = teacher.name;
    card.classList.toggle("is-recorded", teacher.completedFirstRound);
    card.classList.toggle("next-teacher", !teacher.completedFirstRound);

    if (flower && teacher.flowerAsset) {
      flower.style.backgroundImage = `url("assets/${teacher.flowerAsset}")`;
    }

    label.textContent = teacher.completedFirstRound
      ? `先生の輪 済・${getTeacherStampText(teacher)}`
      : `先生の輪 未・${getTeacherStampText(teacher)}`;
  }
};

let updateProfileCard = () => {
  if (!hasFirstRoundMedal()) {
    return;
  }

  profileTitle.textContent = "先生の輪をひらいた旅人";
  profileRank.textContent = "探訪冒険者";
  profileMedal.textContent = "一巡目の輪";
  profileMedalIcon.textContent = "🥉";
  totalStamps.textContent = "スタンプ 8";
  circleBadge.classList.remove("is-locked");
  circleBadge.classList.add("is-active");
  circleStamp.classList.remove("is-next");
  circleStamp.classList.add("is-complete");
};

let updateAdminPanel = () => {
  const remainingCount = Object.keys(teacherDetails).length - getCompletedFirstRoundCount();
  const nextTeacher = Object.values(teacherDetails).find((teacher) => !teacher.completedFirstRound);

  adminTeacher.textContent = nextTeacher?.name ?? "全員記録済み";
  adminState.textContent = remainingCount === 0 ? "反映済み" : "確認中";
  adminSummary.textContent = remainingCount === 0 ? "一巡目の輪を達成済み" : `一巡目の輪まであと${remainingCount}人`;
  adminResult.textContent = remainingCount === 0
    ? "一巡目の輪を達成済み → 冒険者カード更新済み"
    : "一巡目の輪を達成 → 冒険者カード更新";
  adminNote.textContent = remainingCount === 0
    ? "利用者画面の冒険者カードに、称号・ランク・勲章が反映されました。"
    : "押すと利用者側の冒険者カードに勲章が反映されます。";
  adminStampButton.textContent = remainingCount === 0 ? "スタンプ反映済み" : "運営としてスタンプを押す";
  adminStampButton.disabled = remainingCount === 0;
};

updateProfileCard = () => {
  const hasCircle = hasFirstRoundMedal();
  const earnedFairies = getEarnedFairyTeachers();

  totalStamps.textContent = `スタンプ ${getTotalTeacherStampCount()}`;
  profileTitle.textContent = hasCircle ? "先生の輪をひらいた旅人" : "花を集める旅人";
  profileRank.textContent = hasCircle ? "探訪冒険者" : "初級冒険者";
  profileMedal.textContent = hasCircle ? "一巡目の輪（仮）" : "コスモスの友";
  profileMedalIcon.textContent = hasCircle ? "🥉" : "🎖️";

  circleBadge.textContent = hasCircle ? "🥉 一巡目の輪（仮）" : "🥉 一巡目の輪";
  circleBadge.classList.toggle("is-locked", !hasCircle);
  circleBadge.classList.toggle("is-active", hasCircle);
  circleStamp.classList.toggle("is-next", !hasCircle);
  circleStamp.classList.toggle("is-complete", hasCircle);

  if (earnedFairies.length > 0) {
    profileTitle.textContent = hasCircle ? "先生の輪と妖精を集める旅人" : "妖精と出会った旅人";
  }

  renderProfileFairies();
};

updateProfileCard = () => {
  const achievementResult = getCurrentAchievementResult();
  const hasCircle = achievementResult.teacherCircle.currentRounds > 0;
  const earnedFairies = achievementResult.earnedFairies;
  const latestTitle = achievementResult.earnedTitles.at(-1);
  const latestMedal = achievementResult.earnedMedals.at(-1);

  totalStamps.textContent = `スタンプ ${getTotalTeacherStampCount()}`;
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
  renderProfileAchievementResults(achievementResult);
};

updateAdminPanel = () => {
  const completedCount = getCompletedFirstRoundCount();
  const totalCount = getTeacherCircleRequiredCount();
  const remainingCount = Math.max(0, totalCount - completedCount);
  const nextTeacher = Object.values(teacherDetails).find((teacher) => !teacher.completedFirstRound);

  adminTeacher.textContent = nextTeacher?.name ?? "全員一巡済み";
  adminState.textContent = "表示確認";
  adminSummary.textContent = remainingCount === 0
    ? "先生の輪 一巡判定: 達成"
    : `先生の輪 一巡判定: あと${remainingCount}人`;
  adminResult.textContent = remainingCount === 0
    ? "表示上は一巡達成。保存や勲章付与はまだ行いません。"
    : "先生ごとの5回達成とは別に、一巡判定だけを確認します。";
  adminNote.textContent = "今回は表示確認のみです。保存処理・勲章付与はまだ未実装です。";
  adminStampButton.textContent = "表示確認中";
  adminStampButton.disabled = true;
};

updateAdminPanel = () => {
  const completedCount = getCompletedFirstRoundCount();
  const totalCount = getTeacherCircleRequiredCount();
  const remainingCount = Math.max(0, totalCount - completedCount);
  const nextTeacher = Object.entries(teacherDetails).find(([, teacher]) => !teacher.completedFirstRound);

  adminTeacher.textContent = nextTeacher?.[1].name ?? "全員一巡済み";
  adminState.textContent = "仮反映";
  adminSummary.textContent = remainingCount === 0
    ? "先生の輪 一巡判定: 達成"
    : `先生の輪 一巡判定: あと${remainingCount}人`;
  adminResult.textContent = remainingCount === 0
    ? "画面上は一巡達成です。保存と勲章付与はまだ行いません。"
    : "押すと次の先生を画面上だけで1回分反映します。";
  adminNote.textContent = "仮反映のみです。ページを再読み込みすると元に戻ります。";
  adminStampButton.textContent = remainingCount === 0 ? "一巡達成を確認済み" : "仮スタンプを押す";
  adminStampButton.disabled = remainingCount === 0;
};

const setRecordPhase = (phase, teacher) => {
  recordPhase = phase;
  teacherDetail.dataset.recordPhase = phase;

  flowConfirmStep.classList.toggle("is-active", phase === "confirm");
  flowConfirmStep.classList.toggle("is-complete", phase === "done" || phase === "achievement");
  flowDoneStep.classList.toggle("is-complete", phase === "done" || phase === "achievement");
  inlineFairyAchievement.hidden = true;
  fairyAchievement.hidden = phase !== "achievement";
  confirmCard.hidden = teacher.stampCount >= getTeacherGoal(teacher) && phase !== "done";
  confirmCard.classList.toggle("is-achievement-preview", phase === "confirm" && teacher.stampCount === getTeacherGoal(teacher) - 1);

  if (teacher.stampCount >= getTeacherGoal(teacher) && phase !== "done" && phase !== "achievement") {
    completeTeacherButton.textContent = "妖精スタンプ達成済み";
    completeTeacherButton.disabled = true;
    flowMessage.textContent = "この先生の妖精スタンプは達成済みです。";
    return;
  }

  completeTeacherButton.disabled = false;

  if (phase === "confirm") {
    if (teacher.stampCount === getTeacherGoal(teacher) - 1) {
      confirmLabel.textContent = "5回目の達成確認";
      confirmEffect.textContent = "この内容で記録すると、妖精スタンプ達成画面が開きます。";
      completeTeacherButton.textContent = "3. 妖精スタンプを開く";
      flowMessage.textContent = "5回目の反映後だけ、妖精・達成文字・花びら演出が表示されます。";
      return;
    }

    confirmLabel.textContent = "これから記録する内容";
    completeTeacherButton.textContent = "3. この内容で記録する";
    flowMessage.textContent = "内容を確認してから反映します。反映後は先生一覧と冒険者カードが更新されます。";
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
    const achievementFairyData = getAchievementFairy(teacher);

    fairyAchievement.dataset.flower = teacher.flower;
    achievementKicker.textContent = `${getTeacherGoal(teacher)}回達成`;
    achievementModalClose.textContent = "×";
    achievementModalClose.setAttribute("aria-label", "閉じる");
    achievementFairy.src = achievementFairyData.src;
    achievementFairy.alt = achievementFairyData.label;
    achievementTitle.textContent = achievementFairyData.label;
    achievementTeacher.textContent = teacher.name;
    achievementCopy.textContent = `${teacher.name}の指導碁スタンプが${getTeacherGoal(teacher)}/${getTeacherGoal(teacher)}になりました。先生カードとは別の画面で、妖精と花びらの達成演出を表示しています。`;
    achievementProfileButton.textContent = "冒険者カードを見る";
    confirmEffect.textContent = `${getTeacherGoal(teacher)}回目の指導碁スタンプを仮反映しました。`;
    completeTeacherButton.textContent = "冒険者カードを見る";
    flowMessage.textContent = "妖精達成モーダルを表示しました。保存処理と勲章付与はまだ行いません。";
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

  completeTeacherButton.textContent = "2. 記録内容を確認";
  flowMessage.textContent = "誤って押さないように、次の画面で記録内容を確認してから反映します。";
};

const renderTeacherDetail = (teacherKey) => {
  const teacher = teacherDetails[teacherKey];

  activeTeacherKey = teacherKey;
  document.querySelector("[data-teacher-name]").textContent = teacher.name;
  document.querySelector("[data-teacher-card-name]").textContent = teacher.name;
  document.querySelector("[data-teacher-stamp]").textContent = getTeacherStampText(teacher);
  updateTeacherStampRuleNote(teacher);
  cardStampCurrent.textContent = String(teacher.stampCount);
  cardStampGoal.textContent = String(getTeacherGoal(teacher));
  document.querySelector(".teacher-photo-card").dataset.bloomCount = String(teacher.stampCount);
  document.querySelector(".teacher-photo-card").dataset.fairy = String(teacher.fairy);
  document.querySelector(".teacher-photo-card").dataset.flower = teacher.flower;
  document.querySelector("[data-teacher-photo]").dataset.teacherPhoto = teacher.photo;
  document.querySelector("[data-photo-initial]").textContent = teacher.initial;
  document.querySelector("[data-teacher-style]").textContent = teacher.style;
  document.querySelector("[data-teacher-lesson]").textContent = teacher.lesson;
  document.querySelector("[data-teacher-note]").textContent = teacher.note;
  confirmLabel.textContent = teacher.stampCount === getTeacherGoal(teacher) - 1 ? `${getTeacherGoal(teacher)}回目の達成確認` : "これから記録する内容";
  confirmTeacher.textContent = teacher.name;
  confirmEffect.textContent = teacher.stampCount === getTeacherGoal(teacher) - 1
    ? "指導後スタンプを1つ追加すると、妖精スタンプが開きます。"
    : "指導後スタンプを1つ追加します。";

  setRecordPhase("ready", teacher);
};

const completeTeacherStamp = (teacherKey) => {
  const teacher = teacherDetails[teacherKey];
  const previousStampCount = teacher.stampCount;

  teacher.completedFirstRound = true;
  teacher.stampCount = Math.min(getTeacherGoal(teacher), teacher.stampCount + 1);
  teacher.fairy = teacher.stampCount >= getTeacherGoal(teacher);

  renderTeacherDetail(teacherKey);
  updateTeacherCards();
  updateRoundProgress();
  updateProfileCard();
  updateAdminPanel();
  setRecordPhase(previousStampCount < getTeacherGoal(teacher) && teacher.stampCount === getTeacherGoal(teacher) ? "achievement" : "done", teacher);
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
  });
}

closeButton.addEventListener("click", () => {
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

completeTeacherButton.addEventListener("click", () => {
  const teacher = teacherDetails[activeTeacherKey];

  if (recordPhase === "done" || recordPhase === "achievement") {
    updateProfileCard();
    showPanel("profile");
    return;
  }

  if (recordPhase === "confirm") {
    completeTeacherStamp(activeTeacherKey);
    return;
  }

  setRecordPhase("confirm", teacher);
});

adminStampButton.addEventListener("click", () => {
  const nextTeacherKey = Object.keys(teacherDetails).find((teacherKey) => !teacherDetails[teacherKey].completedFirstRound);

  if (!nextTeacherKey) {
    return;
  }

  completeTeacherStamp(nextTeacherKey);
  showPanel("admin");
});

updateTeacherCards();
updateRoundProgress();
updateProfileCard();
updateAdminPanel();
