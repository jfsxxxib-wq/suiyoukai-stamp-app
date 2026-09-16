const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

assert.ok(
  indexHtml.includes("<strong>対局内容を確認してQRを作る</strong>"),
  "対局内容を確認してQRを作る見出しがありません",
);
assert.ok(
  indexHtml.includes("先生・対局日・ハンデ・勝敗を確認し、本人スマホで読み取ってもらいます。"),
  "本人スマホ用QRの説明がありません",
);
assert.ok(
  indexHtml.includes("data-admin-game-record-teacher")
    && indexHtml.includes("data-admin-game-record-date")
    && indexHtml.includes("data-admin-game-record-handicap")
    && indexHtml.includes("data-admin-game-record-result"),
  "QRへ入れる対局内容の入力欄が不足しています",
);
assert.ok(
  indexHtml.includes("data-admin-stamp-qr-create>本人スマホ用QRを作る</button>"),
  "本人スマホ用QRの作成ボタンがありません",
);
assert.ok(!indexHtml.includes("data-admin-fixed-teacher-qr"), "固定QRの画面が残っています");
assert.ok(!indexHtml.includes("先生ごとの固定QR"), "固定QRの案内が残っています");
assert.ok(!indexHtml.includes("今日の先生別QR"), "当日限定の案内が残っています");
assert.ok(!indexHtml.includes("data-admin-combined-apply"), "まとめて直接反映する操作が残っています");
assert.ok(!indexHtml.includes("data-admin-participation-apply"), "参加スタンプを管理端末へ直接反映する操作が残っています");
assert.ok(!indexHtml.includes("data-admin-game-record-apply"), "先生スタンプを管理端末へ直接反映する操作が残っています");
assert.ok(!indexHtml.includes("data-admin-duplicate-teacher-apply"), "同じ条件を管理端末へ直接追加する操作が残っています");
assert.ok(!indexHtml.includes("data-admin-undo-game-record"), "管理端末の直接反映を取り消す操作が残っています");
assert.ok(
  indexHtml.includes("参加者用フォームを開く")
    && indexHtml.includes("参加者用 対局記録フォームを開く"),
  "回答確認用のGoogleフォームリンクが不足しています",
);

assert.ok(!script.includes("createAdminFixedTeacherQrs"), "固定QRの生成処理が残っています");
assert.ok(!script.includes("fixedTeacherQrEventDate"), "8月30日限定の設定が残っています");
assert.ok(!script.includes("applyCombinedAdminOperation"), "まとめて直接反映する処理が残っています");
assert.ok(!script.includes("applyTodayParticipationStampFromAdmin"), "参加スタンプの管理端末直接反映処理が残っています");
assert.ok(!script.includes("applyGameRecordFromAdmin"), "先生スタンプの管理端末直接反映処理が残っています");
assert.ok(!styles.includes(".admin-fixed-teacher-qr"), "固定QR専用の見た目が残っています");
assert.ok(!styles.includes("is-admin-qr-print-preview"), "固定QR印刷表示の見た目が残っています");
assert.ok(!styles.includes(".admin-operation-card"), "まとめて直接反映する画面の見た目が残っています");

const applyStart = script.indexOf("const applyTeacherStampPayload =");
const applyEnd = script.indexOf("const applyStampQrFromLocation =", applyStart);
assert.ok(applyStart >= 0 && applyEnd > applyStart, "先生QRの反映処理を確認できません");
const applySource = script.slice(applyStart, applyEnd);
const retiredGuard = applySource.indexOf('explicitStampId.startsWith("teacher-fixed-")');
const firstMutation = applySource.indexOf("const currentCount =");
assert.ok(retiredGuard >= 0, "以前の固定QRを拒否する処理がありません");
assert.ok(
  applySource.includes('reason: "fixed_teacher_retired"'),
  "以前の固定QRを利用終了として扱っていません",
);
assert.ok(
  retiredGuard < firstMutation,
  "以前の固定QRがスタンプ処理より前に拒否されていません",
);
assert.ok(
  script.includes("先生固定QRの利用は終了しました。管理画面で対局内容を確認し、新しい本人スマホ用QRを作ってください。"),
  "以前の固定QRを読んだ時の案内がありません",
);
assert.ok(
  script.includes('const isRetiredFixedTeacherQr = typeof payload.id === "string" && payload.id.startsWith("teacher-fixed-")'),
  "以前の固定QR IDが別種のQRとして処理される可能性があります",
);
assert.ok(
  script.includes('result.ok && result.reason === "applied" && payload.type === "teacher_stamp"'),
  "本人スマホ用QRから一局のご縁帳確認へ進む処理がありません",
);

const createStart = script.indexOf("const createAdminStampQr =");
const createEnd = script.indexOf("const clearAdminOperationMemory =", createStart);
assert.ok(createStart >= 0 && createEnd > createStart, "本人スマホ用QRの生成処理を確認できません");
const createSource = script.slice(createStart, createEnd);
for (const expected of [
  "teacherId: draft.teacherId",
  "date: draft.date",
  "handicap: draft.handicap",
  "result: draft.result",
]) {
  assert.ok(createSource.includes(expected), `本人スマホ用QRに ${expected} が入りません`);
}
assert.ok(createSource.includes("id: `qr-${Date.now()}-"), "QRごとの重複防止IDがありません");

console.log("teacher fixed QR retirement and detailed QR mode: OK");
