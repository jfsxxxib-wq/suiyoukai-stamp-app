import {readFileSync} from 'node:fs';import vm from 'node:vm';import {DatabaseSync} from 'node:sqlite';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {api} from '../../work/portal-production-20260904/server/gate.mjs';
const preview=readFileSync('outputs/portal-return-preview/index.html','utf8');
const link=preview.match(/<a class="portal-return-link"[^>]*>/)?.[0];
assert.ok(link.includes('href="https://suiyoukai-portal.c84s4n967v.chatgpt.site"'));assert.ok(link.includes('target="_self"'));assert.ok(!/onclick|ticket|stamp=|registration/.test(link));
const original=readFileSync('work/flower-production-20260904/index.html','utf8');
assert.deepEqual([...preview.matchAll(/<script[\s\S]*?<\/script>/g)].map(x=>x[0]),[...original.matchAll(/<script[\s\S]*?<\/script>/g)].map(x=>x[0]),'No new or changed scripts');
const db=new DatabaseSync(':memory:');db.exec(readFileSync('work/portal-production-20260904/drizzle/0000_friendly_ben_grimm.sql','utf8'));
const token='e'.repeat(64),hash=createHash('sha256').update(token).digest('hex');
db.prepare('INSERT INTO gate_participants(id,number,family,given,request_hash,session_hash,created,version,synced,app_number) VALUES (?,?,?,?,?,?,?,1,1,?)').run('fixture','12345678','確認','用','f'.repeat(64),hash,'2026-09-04T00:00:00Z','87654321');
const env={DB:{prepare:sql=>({bind:(...args)=>({first:async()=>db.prepare(sql).get(...args)||null,run:async()=>db.prepare(sql).run(...args)})})},LEDGER_SECRET:'test',LEDGER_URL:'https://example.invalid'};
const before=JSON.stringify(db.prepare('SELECT * FROM gate_participants').all());let ledgerWrites=0;
globalThis.fetch=async()=>{ledgerWrites++;throw Error('Unexpected ledger request');};
for(let i=0;i<2;i++){const r=await api(new Request('https://portal.invalid/api/registration',{headers:{Cookie:'__Host-suiyoukai='+token}}),env);assert.equal(r.status,200);const p=(await r.json()).participant;assert.equal(p.participantNumber,'12345678');assert.equal(p.synced,true);assert.equal(r.headers.get('Set-Cookie'),null);}
assert.equal(JSON.stringify(db.prepare('SELECT * FROM gate_participants').all()),before);assert.equal(ledgerWrites,0);
for(const registered of [true,false]){
 const nodes=new Map();const node=k=>{if(!nodes.has(k))nodes.set(k,{hidden:false,disabled:false,textContent:'',addEventListener(){}});return nodes.get(k);};node('[data-gate-form]').querySelector=()=>node('submit');
 const requests=[];const ctx={document:{querySelector:node,querySelectorAll:()=>[]},localStorage:{getItem(){throw Error('Unexpected storage read');},setItem(){throw Error('Unexpected storage write');}},AbortSignal,URL,setTimeout,fetch:async(path,opts)=>{requests.push({path,method:opts.method});return Response.json(registered?{registered:true,participant:{familyName:'確認',givenName:'用',participantNumber:'12345678',synced:true}}:{registered:false});}};
 vm.runInNewContext(readFileSync('work/portal-production-20260904/public/gate.js','utf8'),ctx);await new Promise(r=>setTimeout(r,10));
 assert.deepEqual(requests,[{path:'/api/registration',method:'GET'}]);assert.equal(node('[data-gate-form]').hidden,registered);
}
console.log('PASS: direct same-tab link; unchanged app scripts; returning account GET preserves IDs and rows, no ledger write; portal load never submits registration or creates storage keys.');
