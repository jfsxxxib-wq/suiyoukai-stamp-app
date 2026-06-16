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

const uniqueById = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    if (!item || seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
};

const evaluateParticipationAchievement = (participationCount = 0) => {
  const rule = achievementRules.participation;
  const currentCount = normalizeCount(participationCount);
  const isAchieved = currentCount >= rule.requiredCount;

  return {
    ruleId: rule.id,
    type: "participation",
    label: rule.label,
    currentCount,
    requiredCount: rule.requiredCount,
    isAchieved,
    earnedMedals: isAchieved ? [copyReward(rule.rewards.medal)] : [],
    earnedTitles: isAchieved ? [copyReward(rule.rewards.title)] : [],
  };
};

const evaluateTeacherFairyAchievements = (teacherLessonCounts = {}) => {
  const rule = achievementRules.teacherFairy;
  const teacherResults = rule.targets.map((target) => {
    const currentCount = normalizeCount(teacherLessonCounts[target.teacherId]);
    const isAchieved = currentCount >= rule.requiredCountPerTeacher;

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
      isAchieved,
      earnedFairy: isAchieved
        ? {
            id: target.fairyId,
            name: target.fairyName,
            teacherId: target.teacherId,
            teacherName: target.teacherName,
            flower: target.flower,
            flowerName: target.flowerName,
          }
        : null,
      earnedMedals: isAchieved && target.rewards.medal ? [copyReward(target.rewards.medal)] : [],
      earnedTitles: isAchieved && target.rewards.title ? [copyReward(target.rewards.title)] : [],
    };
  });

  return {
    ruleId: rule.id,
    type: "teacher_fairy",
    label: rule.label,
    requiredCountPerTeacher: rule.requiredCountPerTeacher,
    teachers: teacherResults,
    achievedTeachers: teacherResults.filter((result) => result.isAchieved),
    earnedFairies: teacherResults.map((result) => result.earnedFairy).filter(Boolean),
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

const evaluateAllAchievements = (progress = userProgressTemplate) => {
  const participation = evaluateParticipationAchievement(getProgressParticipationCount(progress));
  const teacherFairy = evaluateTeacherFairyAchievements(getProgressTeacherLessonCounts(progress));
  const teacherCircle = evaluateTeacherCircleAchievements(getProgressTeacherCircleRounds(progress));

  return {
    participation,
    teacherFairy,
    teacherCircle,
    earnedFairies: teacherFairy.earnedFairies,
    earnedMedals: uniqueById([
      ...participation.earnedMedals,
      ...teacherFairy.earnedMedals,
      ...teacherCircle.earnedMedals,
    ]),
    earnedTitles: uniqueById([
      ...participation.earnedTitles,
      ...teacherFairy.earnedTitles,
      ...teacherCircle.earnedTitles,
    ]),
  };
};

window.achievementRules = achievementRules;
window.stampRules = stampRules;
window.teacherStampTargets = teacherStampTargets;
window.reserveFlowers = reserveFlowers;
window.userProgressTemplate = userProgressTemplate;
window.achievementEvaluators = {
  evaluateParticipationAchievement,
  evaluateTeacherFairyAchievements,
  evaluateTeacherCircleAchievements,
  evaluateAllAchievements,
};
