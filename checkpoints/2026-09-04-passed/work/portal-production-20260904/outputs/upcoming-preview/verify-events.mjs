import {readFileSync} from 'node:fs';import assert from 'node:assert/strict';
const root=new URL('../../',import.meta.url);const before=readFileSync(new URL('portal.html',root),'utf8'),after=readFileSync(new URL('index.html',import.meta.url),'utf8');
const scripts=s=>[...s.matchAll(/<script\b[\s\S]*?<\/script>/g)].map(m=>m[0]);assert.deepEqual(scripts(after),scripts(before));
const header=s=>s.slice(s.indexOf('<section class="welcome-panel">'),s.indexOf('<section class="primary-card">'));assert.equal(header(after),header(before));
assert.ok(!after.includes('id="upcoming-schedule"'));assert.equal((after.match(/data-confirmed-event=/g)||[]).length,2);assert.ok(after.indexOf('data-confirmed-event="2026-09-23"')<after.indexOf('data-confirmed-event="2026-09-26"'));
for(const value of ['2026-09-23T12:30:00+09:00','2026-09-26T13:00:00+09:00','三鷹洪道場','囲碁サロン湘南','常石隆志六段'])assert.ok(after.includes(value));
assert.ok(after.includes('data-event-empty hidden'));assert.ok(after.includes('data-go="events"'));assert.ok(after.includes('data-go="home"'));
console.log('PASS: event placement and supplied details; upper meeting area and every script unchanged; no new registration or stamp handlers.');
