import test from 'node:test';
import assert from 'node:assert/strict';
import { consumeEnrollmentFragment } from '../public/shared/enrollment-url.js';

test('history-01 QR ticketはfragmentから一度だけ取り出して現在履歴から除く', () => {
  const calls = [];
  const ticket = consumeEnrollmentFragment(
    { hash: '#enrollment=FAKE-ONE-TIME', pathname: '/', search: '' },
    { replaceState: (...args) => calls.push(args) },
  );
  assert.equal(ticket, 'FAKE-ONE-TIME');
  assert.deepEqual(calls, [[null, '', '/']]);
});

test('history-02 queryへticketを置かない', () => {
  const calls = [];
  const ticket = consumeEnrollmentFragment(
    { hash: '', pathname: '/', search: '?enrollment=NOT-ACCEPTED' },
    { replaceState: (...args) => calls.push(args) },
  );
  assert.equal(ticket, null);
  assert.deepEqual(calls, []);
});

test('history-03 無関係なfragmentは変更しない', () => {
  const calls = [];
  const ticket = consumeEnrollmentFragment(
    { hash: '#screen=today', pathname: '/', search: '' },
    { replaceState: (...args) => calls.push(args) },
  );
  assert.equal(ticket, null);
  assert.deepEqual(calls, []);
});
