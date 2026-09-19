import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const script = readFileSync(new URL('../public/teacher/teacher.js', import.meta.url), 'utf8');
const periods = readFileSync(new URL('../public/shared/match-periods.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../public/shared/styles.css', import.meta.url), 'utf8');
const server = readFileSync(new URL('../server.mjs', import.meta.url), 'utf8');
const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');

test('phase5-ui-01 共通の表示側分類moduleを読む', () => {
  assert.match(script, /from '\/shared\/match-periods\.js'/);
  assert.match(server, /url\.pathname === '\/shared\/match-periods\.js'/);
  assert.match(server, /public\/shared\/match-periods\.js/);
});

test('phase5-ui-02 今日と過去日だけが同じ区分表示を使う', () => {
  const uses = [...script.matchAll(/groupedMatchSections\(state\.matches\)/g)];
  assert.equal(uses.length, 2);
  assert.match(script, /function todayView\([\s\S]*groupedMatchSections\(state\.matches\)/);
  assert.match(script, /function dateView\([\s\S]*groupedMatchSections\(state\.matches\)/);
});

test('phase5-ui-03 個人記録は午前午後に分けない', () => {
  const participant = script.match(/function participantView\(\)[\s\S]*?\n}\n\nfunction renderActive/)?.[0] ?? '';
  assert.match(participant, /matchList\(state\.matches, \{ history: true \}\)/);
  assert.doesNotMatch(participant, /groupedMatchSections/);
});

test('phase5-ui-04 3区分の文言と実数を持つ', () => {
  assert.match(script, /'午前の対局'/);
  assert.match(script, /'午後の対局'/);
  assert.match(script, /'時刻確認中'/);
  assert.match(script, /periodMatches\.length/);
});

test('phase5-ui-05 0局区分を作らず通し番号を維持', () => {
  assert.match(script, /if \(!periodMatches\.length\) continue/);
  assert.match(script, /startIndex \+= periodMatches\.length/);
  assert.match(script, /matchCard\(match, startIndex \+ index/);
});

test('phase5-ui-06 時刻不正値を画面とdatetimeへ出さない', () => {
  assert.match(script, /validTime \? match\.playedAt : '時刻確認中'/);
  assert.match(script, /datetime: validTime \?/);
  assert.doesNotMatch(script, /innerHTML|insertAdjacentHTML|document\.write/);
});

test('phase5-ui-07 見出しをsectionとariaで構造化', () => {
  assert.match(script, /element\('section'.*'aria-labelledby'/);
  assert.match(script, /className: 'match-period-title'/);
  assert.match(styles, /\.match-period-title/);
  assert.match(styles, /\.match-period \+ \.match-period/);
});

test('phase5-ui-08 DBへ時間帯列を追加しない', () => {
  assert.doesNotMatch(schema, /\b(?:period|is_morning|morning|afternoon)\b/i);
  assert.doesNotMatch(periods, /teacher_id|participant_id|source_reference|localStorage|sessionStorage/);
});
