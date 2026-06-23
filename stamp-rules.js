const achievementRules = {
  participation: {
    id: "participation_cosmos",
    label: "参加スタンプ",
    progressKey: "participationCount",
    countUnit: "回",
    requiredCount: 10,
    flower: "cosmos",
    flowerName: "コスモス",
    achievementName: "コスモス満開",
    description: "参加スタンプを10回集めると、コスモスが満開になる。",
    rewards: {
      medal: {
        id: "medal_participation_cosmos_full_bloom",
        name: "コスモス満開勲章",
      },
      title: {
        id: "title_cosmos_full_bloom_friend",
        name: "コスモス満開の友",
      },
    },
  },

  teacherFairy: {
    id: "teacher_fairy",
    label: "先生ごとの妖精達成",
    progressKey: "teacherLessonCounts",
    countUnit: "回",
    requiredCountPerTeacher: 5,
    achievementName: "妖精達成",
    description: "同じ先生の指導碁スタンプを5回集めると、その先生に対応する妖精を達成する。",
    targets: [
      {
        teacherId: "tsuneishi",
        teacherName: "常石 隆志 六段",
        flower: "iris",
        flowerName: "菖蒲",
        fairyId: "fairy_iris",
        fairyName: "菖蒲の妖精",
        rewards: {
          medal: null,
          title: {
            id: "title_iris_fairy_friend",
            name: "菖蒲の妖精と出会った人",
          },
        },
      },
      {
        teacherId: "yuki",
        teacherName: "結城 聡 九段",
        flower: "camellia",
        flowerName: "椿",
        fairyId: "fairy_camellia",
        fairyName: "椿の妖精",
        rewards: {
          medal: null,
          title: {
            id: "title_camellia_fairy_friend",
            name: "椿の妖精と出会った人",
          },
        },
      },
      {
        teacherId: "koike",
        teacherName: "小池 芳弘 七段",
        flower: "sunflower",
        flowerName: "ひまわり",
        fairyId: "fairy_sunflower",
        fairyName: "ひまわりの妖精",
        rewards: {
          medal: null,
          title: {
            id: "title_sunflower_fairy_friend",
            name: "ひまわりの妖精と出会った人",
          },
        },
      },
      {
        teacherId: "yamashiro",
        teacherName: "山城 宏 九段",
        flower: "hydrangea",
        flowerName: "紫陽花",
        fairyId: "fairy_hydrangea",
        fairyName: "紫陽花の妖精",
        rewards: {
          medal: null,
          title: {
            id: "title_hydrangea_fairy_friend",
            name: "紫陽花の妖精と出会った人",
          },
        },
      },
      {
        teacherId: "matsumoto",
        teacherName: "松本 武久 八段",
        flower: "sakura",
        flowerName: "桜",
        fairyId: "fairy_sakura",
        fairyName: "桜の妖精",
        rewards: {
          medal: null,
          title: {
            id: "title_sakura_fairy_friend",
            name: "桜の妖精と出会った人",
          },
        },
      },
    ],
  },

  teacherCircle: {
    id: "teacher_circle",
    label: "先生の輪",
    progressKey: "teacherCircleRounds",
    countUnit: "巡",
    requiredTeachersPerRound: 5,
    description: "先生5人から各1回ずつ指導碁を受けると、先生の輪が1巡する。",
    milestones: [
      {
        requiredRounds: 1,
        achievementName: "先生の輪 一巡",
        rewards: {
          medal: {
            id: "medal_teacher_circle_round_1",
            name: "先生の輪 一巡勲章",
          },
          title: {
            id: "title_teacher_circle_round_1",
            name: "先生の輪をひらいた旅人",
          },
        },
      },
      {
        requiredRounds: 2,
        achievementName: "先生の輪 二巡",
        rewards: {
          medal: {
            id: "medal_teacher_circle_round_2",
            name: "先生の輪 二巡勲章",
          },
          title: {
            id: "title_teacher_circle_round_2",
            name: "先生の輪をめぐる旅人",
          },
        },
      },
      {
        requiredRounds: 3,
        achievementName: "先生の輪 三巡",
        rewards: {
          medal: {
            id: "medal_teacher_circle_round_3",
            name: "先生の輪 三巡勲章",
          },
          title: {
            id: "title_teacher_circle_round_3",
            name: "先生の輪を深める旅人",
          },
        },
      },
      {
        requiredRounds: 5,
        achievementName: "先生の輪 五巡",
        rewards: {
          medal: {
            id: "medal_teacher_circle_round_5",
            name: "先生の輪 五巡勲章",
          },
          title: {
            id: "title_teacher_circle_round_5",
            name: "先生の輪の案内人",
          },
        },
      },
    ],
  },
};

const specialCompanionRules = [
  {
    id: "special_companion_french_bulldog_a",
    character: "フレンチブルドッグA",
    name: "はじめの一歩",
    description: "初スタンプ獲得",
    asset: "special-companion-french-bulldog-a.png",
    condition: "first_stamp",
  },
  {
    id: "special_companion_french_bulldog_b",
    character: "フレンチブルドッグB",
    name: "挑戦する冒険者",
    description: "参加スタンプ1回＋指導碁スタンプ1回",
    asset: "special-companion-french-bulldog-b.png",
    condition: "participation_and_lesson",
  },
  {
    id: "special_companion_owl_a",
    character: "フクロウA",
    name: "知恵の見守り役",
    description: "初めて称号または勲章を獲得",
    asset: "special-companion-owl-a.png",
    condition: "first_reward",
  },
  {
    id: "special_companion_owl_b",
    character: "フクロウB",
    name: "達成を知る賢者",
    description: "先生の輪 一巡達成",
    asset: "special-companion-owl-b.png",
    condition: "teacher_circle_round_one",
  },
];

const stampRules = {
  participation: {
    id: achievementRules.participation.id,
    name: achievementRules.participation.label,
    flower: achievementRules.participation.flower,
    flowerName: achievementRules.participation.flowerName,
    unit: achievementRules.participation.countUnit,
    maxCount: achievementRules.participation.requiredCount,
    achievementName: achievementRules.participation.achievementName,
    description: achievementRules.participation.description,
    rewards: achievementRules.participation.rewards,
  },

  teacherLesson: {
    id: achievementRules.teacherFairy.id,
    name: achievementRules.teacherFairy.label,
    unit: achievementRules.teacherFairy.countUnit,
    maxCountPerTeacher: achievementRules.teacherFairy.requiredCountPerTeacher,
    achievementName: achievementRules.teacherFairy.achievementName,
    description: achievementRules.teacherFairy.description,
  },

  teacherCircle: {
    id: achievementRules.teacherCircle.id,
    name: achievementRules.teacherCircle.label,
    unit: achievementRules.teacherCircle.countUnit,
    requiredTeachersPerRound: achievementRules.teacherCircle.requiredTeachersPerRound,
    description: achievementRules.teacherCircle.description,
    medalMilestones: achievementRules.teacherCircle.milestones.map((milestone) => ({
      rounds: milestone.requiredRounds,
      medalId: milestone.rewards.medal.id,
      name: milestone.rewards.medal.name,
      titleId: milestone.rewards.title.id,
      titleName: milestone.rewards.title.name,
    })),
  },
};

const teacherStampTargets = achievementRules.teacherFairy.targets.map((target) => ({
  teacherId: target.teacherId,
  teacherName: target.teacherName,
  flower: target.flower,
  flowerName: target.flowerName,
  flowerAsset: `${target.flower}-stamp-stage-05-list.png`,
  fairyId: target.fairyId,
  fairyName: target.fairyName,
  fairyAsset: `fairy-companion-${target.flower}-v2.png`,
  stampGoal: achievementRules.teacherFairy.requiredCountPerTeacher,
  rewards: target.rewards,
}));

const flowerCatalog = {
  cosmos: {
    flower: "cosmos",
    flowerName: "コスモス",
    flowerAsset: "cosmos-stamp-stage-05-v2.png",
    fairyId: "fairy_cosmos",
    fairyName: "コスモスの妖精",
    fairyAsset: "fairy-apollon-flower-style.png",
  },
  fuji: {
    flower: "fuji",
    flowerName: "藤",
    flowerAsset: "fuji-stamp-stage-05-list.png",
    fairyId: "fairy_fuji",
    fairyName: "藤の妖精",
    fairyAsset: "fairy-companion-fuji-lion.png",
  },
  kinmokusei: {
    flower: "kinmokusei",
    flowerName: "金木犀",
    flowerAsset: "kinmokusei-stamp-stage-05-list.png",
    fairyId: "fairy_kinmokusei",
    fairyName: "金木犀の妖精",
    fairyAsset: "fairy-companion-kinmokusei-elephant.png",
  },
  lotus: {
    flower: "lotus",
    flowerName: "蓮",
    flowerAsset: "lotus-stamp-stage-05-list.png",
    fairyId: "fairy_lotus",
    fairyName: "蓮の妖精",
    fairyAsset: "fairy-evolution-stage-03.png",
  },
  sumire: {
    flower: "sumire",
    flowerName: "菫",
    flowerAsset: "sumire-stamp-stage-05-list.png",
    fairyId: "fairy_sumire",
    fairyName: "菫の妖精",
    fairyAsset: "fairy-companion-sumire-rabbit.png",
  },
  botan: {
    flower: "botan",
    flowerName: "牡丹",
    flowerAsset: "botan-stamp-stage-05-list.png",
    fairyId: "fairy_botan",
    fairyName: "牡丹の妖精",
    fairyAsset: "fairy-evolution-stage-01.png",
  },
  lily: {
    flower: "lily",
    flowerName: "百合",
    flowerAsset: "lily-stamp-stage-05-list.png",
    fairyId: "fairy_lily",
    fairyName: "百合の妖精",
    fairyAsset: "fairy-companion-lily-white-fox.png",
  },
  asagao: {
    flower: "asagao",
    flowerName: "朝顔",
    flowerAsset: "asagao-stamp-stage-05-list.png",
    fairyId: "fairy_asagao",
    fairyName: "朝顔の妖精",
    fairyAsset: "fairy-evolution-stage-03.png",
  },
  kikyo: {
    flower: "kikyo",
    flowerName: "桔梗",
    flowerAsset: "kikyo-stamp-stage-05-list.png",
    fairyId: "fairy_kikyo",
    fairyName: "桔梗の妖精",
    fairyAsset: "fairy-companion-kikyo-red-squirrel.png",
  },
  nadeshiko: {
    flower: "nadeshiko",
    flowerName: "撫子",
    flowerAsset: "nadeshiko-stamp-stage-05-list.png",
    fairyId: "fairy_nadeshiko",
    fairyName: "撫子の妖精",
    fairyAsset: "fairy-evolution-stage-01.png",
  },
  suisen: {
    flower: "suisen",
    flowerName: "水仙",
    flowerAsset: "suisen-stamp-stage-05-list.png",
    fairyId: "fairy_suisen",
    fairyName: "水仙の妖精",
    fairyAsset: "fairy-companion-suisen-red-panda.png",
  },
  hagi: {
    flower: "hagi",
    flowerName: "萩",
    flowerAsset: "hagi-stamp-stage-05-list.png",
    fairyId: "fairy_hagi",
    fairyName: "萩の妖精",
    fairyAsset: "fairy-evolution-stage-03.png",
  },
  shakuyaku: {
    flower: "shakuyaku",
    flowerName: "芍薬",
    flowerAsset: "shakuyaku-stamp-stage-05-list.png",
    fairyId: "fairy_shakuyaku",
    fairyName: "芍薬の妖精",
    fairyAsset: "fairy-companion-shakuyaku-java-sparrow.png",
  },
};

const createCycleFlower = (cycleNumber, flowerKey) => ({
  cycleNumber,
  cycleName: `${cycleNumber}巡目`,
  ...flowerCatalog[flowerKey],
});

const teacherCycleFlowerAssignments = {
  tsuneishi: ["iris", "lotus", "sumire"],
  yuki: ["camellia", "botan", "lily"],
  koike: ["sunflower", "asagao", "kikyo"],
  yamashiro: ["hydrangea", "nadeshiko", "suisen"],
  matsumoto: ["sakura", "hagi", "shakuyaku"],
};

const participationStampCycles = [
  {
    ...createCycleFlower(1, "cosmos"),
    requiredCount: achievementRules.participation.requiredCount,
    rewards: achievementRules.participation.rewards,
  },
  {
    ...createCycleFlower(2, "fuji"),
    requiredCount: achievementRules.participation.requiredCount * 2,
    rewards: {
      medal: {
        id: "medal_participation_fuji_full_bloom",
        name: "藤満開勲章",
      },
      title: {
        id: "title_fuji_full_bloom_friend",
        name: "藤満開の友",
      },
    },
  },
  {
    ...createCycleFlower(3, "kinmokusei"),
    requiredCount: achievementRules.participation.requiredCount * 3,
    rewards: {
      medal: {
        id: "medal_participation_kinmokusei_full_bloom",
        name: "金木犀満開勲章",
      },
      title: {
        id: "title_kinmokusei_full_bloom_friend",
        name: "金木犀満開の友",
      },
    },
  },
];

const getTeacherFairyCycles = (target) =>
  (teacherCycleFlowerAssignments[target.teacherId] ?? [target.flower]).map((flowerKey, index) => {
    const cycle = index === 0
      ? {
          cycleNumber: 1,
          cycleName: "1巡目",
          flower: target.flower,
          flowerName: target.flowerName,
          flowerAsset: `${target.flower}-stamp-stage-05-list.png`,
          fairyId: target.fairyId,
          fairyName: target.fairyName,
          fairyAsset: `fairy-companion-${target.flower}-v2.png`,
        }
      : createCycleFlower(index + 1, flowerKey);

    return {
      cycleNumber: cycle.cycleNumber,
      cycleName: cycle.cycleName,
      requiredCount: achievementRules.teacherFairy.requiredCountPerTeacher * cycle.cycleNumber,
      flower: cycle.flower,
      flowerName: cycle.flowerName,
      flowerAsset: cycle.flowerAsset,
      fairyId: `${cycle.fairyId}_${cycle.cycleNumber}`,
      fairyName: cycle.cycleNumber === 1 ? cycle.fairyName : `${cycle.cycleName} ${cycle.fairyName}`,
      fairyAsset: cycle.fairyAsset,
      rewards: cycle.cycleNumber === 1
        ? target.rewards
        : {
            medal: null,
            title: {
              id: `title_${target.teacherId}_${cycle.flower}_fairy_cycle_${cycle.cycleNumber}`,
              name: `${target.teacherName} ${cycle.cycleName} ${cycle.flowerName}の妖精と出会った人`,
            },
          },
    };
  });

const reserveFlowers = [
  {
    flower: "dahlia",
    flowerName: "ダリア",
    asset: "dahlia-stamp-stage-05-list.png",
  },
  {
    flower: "ume",
    flowerName: "梅",
    asset: "ume-stamp-reserve.png",
  },
];

const userProgressTemplate = {
  schemaVersion: 2,

  stamps: {
    participationCount: 0,

    teacherLessonCounts: {
      tsuneishi: 0,
      yuki: 0,
      koike: 0,
      yamashiro: 0,
      matsumoto: 0,
    },

    teacherCircleRounds: 0,
  },

  earned: {
    fairies: [],
    medals: [],
    titles: [],
    companions: [],
  },
};

const normalizeCount = (count) => Math.max(0, Number(count) || 0);

const copyReward = (reward) => (reward ? { ...reward } : null);

const getProgressParticipationCount = (progress = userProgressTemplate) =>
  progress.stamps?.participationCount ?? progress.participationCount ?? 0;

const getProgressTeacherLessonCounts = (progress = userProgressTemplate) =>
  progress.stamps?.teacherLessonCounts ?? progress.teacherLessonCounts ?? {};

const getProgressTeacherCircleRounds = (progress = userProgressTemplate) =>
  progress.stamps?.teacherCircleRounds ?? progress.teacherCircleRounds ?? 0;

const getProgressEarnedRewards = (progress = userProgressTemplate, rewardType) => {
  const storedRewards = progress.earned?.[rewardType] ?? progress[`earned${rewardType[0].toUpperCase()}${rewardType.slice(1)}`];
  return Array.isArray(storedRewards) ? storedRewards : [];
};

const getRewardUniqueKey = (item) => {
  if (!item) {
    return "";
  }

  if (item.type === "special_companion" || item.condition || item.asset) {
    return item.id;
  }

  if (item.teacherId) {
    return `teacher:${item.teacherId}:cycle:${item.cycleNumber ?? 1}`;
  }

  if (item.teacherName === "参加スタンプ" || item.teacherId === null) {
    return `participation:cycle:${item.cycleNumber ?? 1}`;
  }

  return item.id;
};

const uniqueById = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    const key = getRewardUniqueKey(item);

    if (!item || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const evaluateParticipationAchievement = (participationCount = 0) => {
  const rule = achievementRules.participation;
  const currentCount = normalizeCount(participationCount);
  const achievedCycles = participationStampCycles.filter((cycle) => currentCount >= cycle.requiredCount);
  const isAchieved = achievedCycles.length > 0;

  return {
    ruleId: rule.id,
    type: "participation",
    label: rule.label,
    currentCount,
    requiredCount: rule.requiredCount,
    maxCount: participationStampCycles.at(-1).requiredCount,
    cycleCount: participationStampCycles.length,
    isAchieved,
    achievedCycles: achievedCycles.map((cycle) => ({
      ...cycle,
      isAchieved: true,
    })),
    earnedFairies: achievedCycles.map((cycle) => ({
      id: cycle.fairyId,
      name: cycle.fairyName,
      teacherId: null,
      teacherName: "参加スタンプ",
      cycleNumber: cycle.cycleNumber,
      cycleName: cycle.cycleName,
      requiredCount: cycle.requiredCount,
      flower: cycle.flower,
      flowerName: cycle.flowerName,
      fairyAsset: cycle.fairyAsset,
    })),
    earnedMedals: uniqueById(achievedCycles.map((cycle) => copyReward(cycle.rewards.medal))),
    earnedTitles: uniqueById(achievedCycles.map((cycle) => copyReward(cycle.rewards.title))),
  };
};

const evaluateTeacherFairyAchievements = (teacherLessonCounts = {}) => {
  const rule = achievementRules.teacherFairy;
  const teacherResults = rule.targets.map((target) => {
    const currentCount = normalizeCount(teacherLessonCounts[target.teacherId]);
    const cycles = getTeacherFairyCycles(target);
    const achievedCycles = cycles.filter((cycle) => currentCount >= cycle.requiredCount);
    const firstCycle = cycles[0];
    const isAchieved = currentCount >= firstCycle.requiredCount;

    return {
      ruleId: rule.id,
      type: "teacher_fairy",
      teacherId: target.teacherId,
      teacherName: target.teacherName,
      flower: target.flower,
      flowerName: target.flowerName,
      fairyId: target.fairyId,
      fairyName: target.fairyName,
      currentCount,
      requiredCount: rule.requiredCountPerTeacher,
      maxCount: cycles.at(-1).requiredCount,
      cycleCount: cycles.length,
      isAchieved,
      cycles: cycles.map((cycle) => ({
        ...cycle,
        isAchieved: currentCount >= cycle.requiredCount,
      })),
      achievedCycles,
      earnedFairy: isAchieved
        ? {
            id: firstCycle.fairyId,
            name: firstCycle.fairyName,
            teacherId: target.teacherId,
            teacherName: target.teacherName,
            cycleNumber: firstCycle.cycleNumber,
            cycleName: firstCycle.cycleName,
            requiredCount: firstCycle.requiredCount,
            flower: firstCycle.flower,
            flowerName: firstCycle.flowerName,
            fairyAsset: firstCycle.fairyAsset,
          }
        : null,
      earnedFairies: achievedCycles.map((cycle) => ({
        id: cycle.fairyId,
        name: cycle.fairyName,
        teacherId: target.teacherId,
        teacherName: target.teacherName,
        cycleNumber: cycle.cycleNumber,
        cycleName: cycle.cycleName,
        requiredCount: cycle.requiredCount,
        flower: cycle.flower,
        flowerName: cycle.flowerName,
        fairyAsset: cycle.fairyAsset,
      })),
      earnedMedals: uniqueById(achievedCycles.flatMap((cycle) => cycle.rewards.medal ? [copyReward(cycle.rewards.medal)] : [])),
      earnedTitles: uniqueById(achievedCycles.flatMap((cycle) => cycle.rewards.title ? [copyReward(cycle.rewards.title)] : [])),
    };
  });

  return {
    ruleId: rule.id,
    type: "teacher_fairy",
    label: rule.label,
    requiredCountPerTeacher: rule.requiredCountPerTeacher,
    teachers: teacherResults,
    achievedTeachers: teacherResults.filter((result) => result.isAchieved),
    earnedFairies: teacherResults.flatMap((result) => result.earnedFairies),
    earnedMedals: uniqueById(teacherResults.flatMap((result) => result.earnedMedals)),
    earnedTitles: uniqueById(teacherResults.flatMap((result) => result.earnedTitles)),
  };
};

const evaluateTeacherCircleAchievements = (teacherCircleRounds = 0) => {
  const rule = achievementRules.teacherCircle;
  const currentRounds = normalizeCount(teacherCircleRounds);
  const achievedMilestones = rule.milestones.filter((milestone) => currentRounds >= milestone.requiredRounds);

  return {
    ruleId: rule.id,
    type: "teacher_circle",
    label: rule.label,
    currentRounds,
    requiredTeachersPerRound: rule.requiredTeachersPerRound,
    achievedMilestones: achievedMilestones.map((milestone) => ({
      requiredRounds: milestone.requiredRounds,
      achievementName: milestone.achievementName,
      isAchieved: true,
      earnedMedal: copyReward(milestone.rewards.medal),
      earnedTitle: copyReward(milestone.rewards.title),
    })),
    earnedMedals: uniqueById(achievedMilestones.map((milestone) => copyReward(milestone.rewards.medal))),
    earnedTitles: uniqueById(achievedMilestones.map((milestone) => copyReward(milestone.rewards.title))),
  };
};

const evaluateSpecialCompanionAchievements = (progress = userProgressTemplate, achievementState = {}) => {
  const participationCount = normalizeCount(getProgressParticipationCount(progress));
  const teacherLessonCounts = getProgressTeacherLessonCounts(progress);
  const totalTeacherStamps = Object.values(teacherLessonCounts).reduce(
    (total, count) => total + normalizeCount(count),
    0
  );
  const hasReward = (achievementState.earnedMedals?.length ?? 0) > 0
    || (achievementState.earnedTitles?.length ?? 0) > 0;
  const teacherCircleRounds = normalizeCount(achievementState.teacherCircle?.currentRounds);

  const companions = specialCompanionRules.map((companion) => {
    const isAchieved = companion.condition === "first_stamp"
      ? participationCount + totalTeacherStamps >= 1
      : companion.condition === "participation_and_lesson"
        ? participationCount >= 1 && totalTeacherStamps >= 1
        : companion.condition === "first_reward"
          ? hasReward
          : companion.condition === "teacher_circle_round_one"
            ? teacherCircleRounds >= 1
            : false;

    return { ...companion, isAchieved };
  });

  return {
    ruleId: "special_companions",
    type: "special_companion",
    label: "特別な仲間スタンプ",
    companions,
    earnedCompanions: companions.filter((companion) => companion.isAchieved),
  };
};

const evaluateAllAchievements = (progress = userProgressTemplate) => {
  const participation = evaluateParticipationAchievement(getProgressParticipationCount(progress));
  const teacherFairy = evaluateTeacherFairyAchievements(getProgressTeacherLessonCounts(progress));
  const teacherCircle = evaluateTeacherCircleAchievements(getProgressTeacherCircleRounds(progress));
  const earnedMedals = uniqueById([
    ...getProgressEarnedRewards(progress, "medals"),
    ...participation.earnedMedals,
    ...teacherFairy.earnedMedals,
    ...teacherCircle.earnedMedals,
  ]);
  const earnedTitles = uniqueById([
    ...getProgressEarnedRewards(progress, "titles"),
    ...participation.earnedTitles,
    ...teacherFairy.earnedTitles,
    ...teacherCircle.earnedTitles,
  ]);
  const currentSpecialCompanions = evaluateSpecialCompanionAchievements(progress, {
    earnedMedals,
    earnedTitles,
    teacherCircle,
  });
  const earnedCompanions = uniqueById([
    ...getProgressEarnedRewards(progress, "companions"),
    ...currentSpecialCompanions.earnedCompanions,
  ]);
  const specialCompanions = {
    ...currentSpecialCompanions,
    earnedCompanions,
  };
  const earnedFairies = uniqueById([
    ...getProgressEarnedRewards(progress, "fairies"),
    ...participation.earnedFairies,
    ...teacherFairy.earnedFairies,
  ]);

  return {
    participation,
    teacherFairy,
    teacherCircle,
    specialCompanions,
    earnedFairies,
    earnedMedals,
    earnedTitles,
    earnedCompanions,
  };
};

window.achievementRules = achievementRules;
window.specialCompanionRules = specialCompanionRules;
window.stampRules = stampRules;
window.teacherStampTargets = teacherStampTargets;
window.flowerCatalog = flowerCatalog;
window.teacherCycleFlowerAssignments = teacherCycleFlowerAssignments;
window.participationStampCycles = participationStampCycles;
window.reserveFlowers = reserveFlowers;
window.userProgressTemplate = userProgressTemplate;
window.achievementEvaluators = {
  evaluateParticipationAchievement,
  evaluateTeacherFairyAchievements,
  evaluateTeacherCircleAchievements,
  evaluateSpecialCompanionAchievements,
  evaluateAllAchievements,
};
