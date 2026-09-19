import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const script = readFileSync(new URL('../public/teacher/teacher.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../public/shared/styles.css', import.meta.url), 'utf8');

test('phase4-ui-01 今日・過去・個人の遷移を持つ', () => {
  assert.match(script, /function openToday\(/);
  assert.match(script, /function openDates\(/);
  assert.match(script, /function openDate\(/);
  assert.match(script, /function openParticipant\(/);
  assert.match(script, /function returnFromParticipant\(/);
});

test('phase4-ui-02 同一match IDをDOM属性へ保持', () => {
  assert.match(script, /'data-match-id': match\.matchId/);
  assert.doesNotMatch(script, /match\.participantDisplayName\s*===/);
});

test('phase4-ui-03 一覧の必要情報を省略しない', () => {
  for (const field of ['playedAt', 'participantDisplayName', 'participantDisplayRank', 'handicapText', 'resultCode']) {
    assert.match(script, new RegExp(`match\\.${field}`));
  }
});

test('phase4-ui-04 未知の結果を安全な文言へ落とす', () => {
  assert.match(script, /記録確認中/);
  assert.match(script, /resultLabels\[code\] \?\?/);
});

test('phase4-ui-05 個人記録は1局時に手合の歩みを出さない', () => {
  assert.match(script, /if \(count >= 2\)/);
  assert.match(script, /手合の歩み/);
  assert.match(script, /先生とのご縁/);
});

test('phase4-ui-06 認証エラーで取得済み記録を消す', () => {
  assert.match(script, /function handleRecordError/);
  assert.match(script, /clearRecordData\(\{ resetNavigation: false \}\)/);
  assert.match(script, /SESSION_LOCKED/);
  assert.match(script, /state\.authState = 'unlock_required'/);
});

test('phase4-ui-07 再認証後は元の表示方向をAPIから再取得', () => {
  assert.match(script, /state\.authState === 'active' && !state\.recordsInitialized/);
  assert.match(script, /await resumeRecordsView\(\)/);
  assert.match(script, /state\.recordsView === 'participant' && state\.selectedParticipantId/);
});

test('phase4-ui-08 DB由来文字列をHTMLとして解釈しない', () => {
  assert.doesNotMatch(script, /innerHTML|insertAdjacentHTML|document\.write/);
  assert.match(script, /node\.textContent = text/);
});

test('phase4-ui-09 browser永続保存とconsole出力を使わない', () => {
  assert.doesNotMatch(script, /localStorage|sessionStorage|indexedDB|console\./);
});

test('phase4-ui-10 mobile向けカードと44px以上の操作を持つ', () => {
  const matchNameRule = styles.match(/\.match-name\s*\{([^}]*)\}/)?.[1] ?? '';

  assert.match(styles, /\.match-card/);
  assert.match(styles, /\.match-name/);
  assert.match(matchNameRule, /min-height:\s*44px/);
  assert.match(matchNameRule, /padding:\s*6px 0/);
  assert.match(styles, /@media \(max-width: 680px\)/);
});
