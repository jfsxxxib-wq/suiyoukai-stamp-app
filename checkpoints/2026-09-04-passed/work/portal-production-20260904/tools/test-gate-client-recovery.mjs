import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
const nodes=new Map();
function node(key){if(!nodes.has(key))nodes.set(key,{hidden:false,disabled:false,textContent:'',handlers:{},addEventListener(type,fn){this.handlers[type]=fn;},focus(){}});return nodes.get(key);}
const form=node('[data-gate-form]');
form.elements={familyName:{value:'接続確認'},givenName:{value:'試験専用'}};
form.querySelector=()=>node('submit');
const opens=[node('open1'),node('open2')];
const views=[node('home'),node('flower-handoff'),node('gate-complete')];
views[2].hidden=true;
const storage=new Map();
const posts=[];
const person={familyName:'接続確認',givenName:'試験専用',participantNumber:'12345678',synced:true};
let phase='submit';let reads=0;
const context={document:{querySelector:node,querySelectorAll:s=>s==='[data-gate-open]'?opens:views,getElementById:node},window:{scrollTo(){}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},crypto:webcrypto,AbortSignal,URL,location:{assign(){}},setTimeout:fn=>queueMicrotask(fn),fetch:async(path,options)=>{
 if(options.method==='GET'){
  if(phase==='submit')return Response.json({registered:false});
  reads++;return Response.json({registered:true,participant:{...person,synced:reads>1}});
 }
 posts.push(JSON.parse(options.body));
 return posts.length===1?Response.json({registered:true,participant:{...person,synced:false},error:'保存確認中'},{status:503}):Response.json({registered:true,participant:person});
}};
vm.runInNewContext(fs.readFileSync('public/gate.js','utf8'),context);
await new Promise(r=>setTimeout(r,5));
await form.handlers.submit({preventDefault(){}});
assert.equal(posts.length,2,'One tap automatically recovers after saved-but-unacknowledged response');
assert.deepEqual(posts[0],posts[1],'Retry preserves identity and names');
assert.equal(node('gate-complete').hidden,false);
assert.equal(opens[0].disabled,false);
assert.equal(node('submit').disabled,false);
phase='restore';
await node('[data-gate-retry]').handlers.click();
assert.equal(reads,2,'Returning participant confirmation automatically retries');
assert.equal(form.hidden,true);
assert.equal(node('[data-gate-retry]').hidden,true);
console.log('PASS: one submit recovers from pending ledger save, no duplicate identity, completion enabled; returning registration also recovers automatically.');
