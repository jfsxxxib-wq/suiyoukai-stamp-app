import {readFileSync} from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const html=readFileSync(new URL('index.html',import.meta.url),'utf8');
const first=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const marker="document.addEventListener('click',e=>{";const start=first.indexOf(marker)+marker.length;const end=first.indexOf('});const meetingDates',start);assert.ok(start>=marker.length&&end>start);
const views=[{id:'home',hidden:false},{id:'upcoming-schedule',hidden:true},{id:'flower-handoff',hidden:true}];
const reject=()=>{throw Error('Schedule navigation must not touch data or authentication');};
const ctx={document:{querySelectorAll:s=>{assert.equal(s,'.view');return views;},getElementById:id=>views.find(v=>v.id===id)},window:{scrollTo(){}},localStorage:{getItem:reject,setItem:reject,removeItem:reject},sessionStorage:{getItem:reject,setItem:reject},fetch:reject,setScheduleOpen:reject};
const handle=vm.runInNewContext('(e=>{'+first.slice(start,end)+'})',ctx);
const scheduleEvent={target:{closest:s=>s==='[data-schedule-toggle]'?{}:null}};
const backEvent={target:{closest:s=>s==='[data-go]'?{disabled:false,dataset:{go:'home'}}:null}};
for(let i=0;i<3;i++){handle(scheduleEvent);assert.equal(views[1].hidden,false);assert.equal(views[0].hidden,true);handle(backEvent);assert.equal(views[0].hidden,false);assert.equal(views[1].hidden,true);}
assert.ok(html.includes('2026-09-23T12:30:00+09:00'));assert.ok(html.includes('2026-09-26T13:00:00+09:00'));assert.ok(html.includes('三鷹洪道場'));assert.ok(html.includes('常石隆志六段'));
console.log('PASS: three schedule round trips, supplied event details, no storage or network access from navigation.');
