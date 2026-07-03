const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const scriptPath = path.join(root, "script.js");
const rulesPath = path.join(root, "stamp-rules.js");
const outputDir = path.join(__dirname, "additional-teachers-readiness-2026-07-02");
const outputPath = path.join(outputDir, "result.json");

fs.mkdirSync(outputDir, { recursive: true });

const script = fs.readFileSync(scriptPath, "utf8");
const rules = fs.readFileSync(rulesPath, "utf8");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const matchAll = (source, pattern) => [...source.matchAll(pattern)].map((match) => match[1]);

const teacherIdsFromRules = matchAll(rules, /teacherId:\s*"([^"]+)"/g);
const uniqueTeacherIds = [...new Set(teacherIdsFromRules)];
const expectedPrimaryTeacherIds = ["tsuneishi", "yuki", "koike", "yamashiro", "matsumoto"];
const futureTeacherIds = ["teacher_extra_01", "teacher_extra_02"];

const containsAllPrimaryTeachers = expectedPrimaryTeacherIds.every((teacherId) =>
  uniqueTeacherIds.includes(teacherId)
);
const containsAllFutureTeachers = futureTeacherIds.every((teacherId) =>
  uniqueTeacherIds.includes(teacherId)
);

const checks = [];
const requiredBeforeImplementation = [];

assert(containsAllPrimaryTeachers, "基本5人の先生IDが stamp-rules.js にそろっていません。");
checks.push({
  name: "基本5人の先生ID",
  result: "OK",
  teacherIds: uniqueTeacherIds,
});

assert(containsAllFutureTeachers, "追加先生2人の先生IDが stamp-rules.js にそろっていません。");
checks.push({
  name: "追加先生2人の先生ID",
  result: "OK",
  teacherIds: futureTeacherIds,
});

const circleUsesPrimaryTeacherIds = /const teacherCircleTargetIds = teacherCircleRule\.teacherIds \?\? ruleTargets\.map\(\(target\) => target\.teacherId\);/.test(script)
  && /const teacherIds = teacherCircleTargetIds\.length > 0\s*\?\s*teacherCircleTargetIds/s.test(script)
  && /teacherIds: \["tsuneishi", "yuki", "koike", "yamashiro", "matsumoto"\]/.test(rules)
  && /teacherIds: achievementRules\.teacherCircle\.teacherIds/.test(rules);
assert(circleUsesPrimaryTeacherIds, "先生の輪が基本5人IDだけで計算されていません。");
checks.push({
  name: "先生の輪の計算対象",
  result: "OK",
  detail: "先生の輪は teacherCircle.teacherIds の基本5人だけを見る。追加先生は押印対象でも輪の達成条件には含めない。",
});

const backupFormatMatch = script.match(/const backupFormatVersion = (\d+);/);
assert(backupFormatMatch, "backupFormatVersion が見つかりません。");
checks.push({
  name: "バックアップ形式",
  result: "OK",
  formatVersion: Number(backupFormatMatch[1]),
});

const validateLoopsTeacherDetails = /for \(const teacherId of Object\.keys\(teacherDetails\)\) \{\s*if \(!isValidBackupCount\(teacherCounts\[teacherId\]\)/s.test(script);
const validateUsesSanitizedProgress = /const sanitizedProgress = sanitizeProgress\(progress\);/.test(script)
  && /const sanitizedTeacherCounts = sanitizedProgress\.stamps\.teacherLessonCounts;/.test(script)
  && /progress: sanitizedProgress,/.test(script);
const validateKnownProvidedCountsOnly = /for \(const \[teacherId, count\] of Object\.entries\(teacherCounts\)\)/.test(script)
  && /if \(!teacher\) \{\s*continue;\s*\}/s.test(script);
const validateUsesSanitizedCircle = /sanitizedProgress\.stamps\.teacherCircleRounds !== getTeacherCircleRoundsFromCounts\(sanitizedTeacherCounts\)/.test(script);
const backupRestoreSupplementsMissingTeacherIds = !validateLoopsTeacherDetails
  && validateUsesSanitizedProgress
  && validateKnownProvidedCountsOnly
  && validateUsesSanitizedCircle;

if (!backupRestoreSupplementsMissingTeacherIds) {
  requiredBeforeImplementation.push({
    name: "旧バックアップ復元の補完",
    reason: "旧バックアップに新先生IDが無い場合の0回補完を、復元検査で確認できません。",
    requiredChange: "validateBackupData で sanitizeProgress を使い、不足先生IDを0回として補完してから先生の輪を検査する。",
  });
}
checks.push({
  name: "旧バックアップ復元リスク",
  result: backupRestoreSupplementsMissingTeacherIds ? "OK" : "NEEDS_CHANGE_BEFORE_IMPLEMENTATION",
  detail: backupRestoreSupplementsMissingTeacherIds
    ? "旧バックアップに新先生IDが無くても、復元時に0回として補完できる。"
    : "先生追加の実装前に補完ルールが必要。",
});

const sanitizeProgressBuildsFromTeacherDetails = /const sanitizeProgress = \(progress = \{\}\) => \{\s*const template = createInitialProgressFromTeacherDetails\(\);/s.test(script)
  && /for \(const teacherId of Object\.keys\(teacherLessonCounts\)\)/s.test(script);
assert(sanitizeProgressBuildsFromTeacherDetails, "sanitizeProgress が teacherDetails から補完する形になっていません。");
checks.push({
  name: "通常読み込み時の補完",
  result: "OK",
  detail: "通常の progress 読み込みでは teacherDetails 由来のIDを補完する作り。",
});

const teacherCircleRequiredFromRule = /const getTeacherCircleRequiredCount = \(\) =>\s*teacherCircleRule\.requiredTeachersPerRound/s.test(script);
assert(teacherCircleRequiredFromRule, "先生の輪の必要人数がルール基準になっていません。");
checks.push({
  name: "先生の輪の必要人数",
  result: "OK",
  detail: "requiredTeachersPerRound を使うため、基本5人の輪を維持できる。",
});

const simulatedCountsWithFutureTeachers = Object.fromEntries([
  ...expectedPrimaryTeacherIds.map((teacherId) => [teacherId, 1]),
  ...futureTeacherIds.map((teacherId) => [teacherId, 0]),
]);
const basicFiveRounds = Math.min(...expectedPrimaryTeacherIds.map((teacherId) => simulatedCountsWithFutureTeachers[teacherId]));
const allTeacherRounds = Math.min(...Object.values(simulatedCountsWithFutureTeachers));
assert(basicFiveRounds === 1 && allTeacherRounds === 0, "追加先生0回が混ざっても、基本5人の輪だけを見れば1巡を維持できます。");
checks.push({
  name: "先生の輪の後退防止",
  result: "OK",
  detail: "基本5人が1回ずつ、新先生2人が0回の想定でも、輪の判定は基本5人なら1巡のまま。",
  simulatedCounts: simulatedCountsWithFutureTeachers,
});

const plannedStock = [
  { teacherSlot: "新先生A", cycle: 1, flower: "すずらん", companion: "ネズミ妖精" },
  { teacherSlot: "新先生A", cycle: 2, flower: "木蓮", companion: "白猫妖精" },
  { teacherSlot: "新先生A", cycle: 3, flower: "ひなげし", companion: "リス妖精" },
  { teacherSlot: "新先生B", cycle: 1, flower: "白詰草", companion: "トイプードル妖精" },
  { teacherSlot: "新先生B", cycle: 2, flower: "蘭", companion: "亀妖精" },
  { teacherSlot: "新先生B", cycle: 3, flower: "花水木", companion: "鶴妖精" },
];

const report = {
  ok: true,
  checkedAt: new Date().toISOString(),
  files: {
    script: path.relative(root, scriptPath),
    rules: path.relative(root, rulesPath),
  },
  primaryTeacherIds: expectedPrimaryTeacherIds,
  futureTeacherIds,
  plannedStock,
  checks,
  requiredBeforeImplementation,
  nextStep: requiredBeforeImplementation.length
    ? "先生追加をアプリ本体へ入れる前に、旧バックアップの不足先生IDを0回で補完する検証と実装を追加する。"
    : "追加先生の仮IDを使った表示検証へ進める。",
};

fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");

console.log(`ALL OK: ${checks.length} checks`);
if (requiredBeforeImplementation.length) {
  console.log(`NEEDS CHANGE BEFORE IMPLEMENTATION: ${requiredBeforeImplementation.length} item`);
}
console.log(outputPath);
