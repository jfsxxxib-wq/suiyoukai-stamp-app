// Run manually with {url,secret} as one JSON line on stdin. Never persist credentials.
import readline from 'node:readline';
import assert from 'node:assert/strict';
const rl=readline.createInterface({input:process.stdin});
const input=await new Promise(resolve=>rl.once('line',resolve));rl.close();
const {url,secret}=JSON.parse(input);
assert.ok(url.startsWith('https://script.google.com/macros/s/'));
const post=async payload=>{const response=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...payload,secret}),signal:AbortSignal.timeout(45000)});assert.ok(response.ok);return response.json();};
const health=await post({action:'health'});console.log(JSON.stringify({phase:'health',...health}));assert.equal(health.ok,true);assert.equal(health.headersReady,true);assert.equal(health.ledgerId,'1a6J-hoyw3fvKOVOJ_GpbGN1l-_EqqAoScSkaqqsiR-8');
const operationId='gate-'+crypto.randomUUID();
const sample={action:'registration_upsert',operationId,participantNumber:'90000001',familyName:'接続確認',givenName:'試験専用',registeredAt:new Date().toISOString(),version:1};
console.log(JSON.stringify({operationId,phase:'before_write'}));
for(const payload of [sample,sample,{...sample,appNumber:'90000002',version:2}]){const result=await post(payload);assert.equal(result.ok,true);assert.equal(result.version,payload.version);}
console.log(JSON.stringify({operationId,phase:'verified',expectedRows:1,participantNumber:'90000001',appNumber:'90000002',cleanup:'Remove only the new row whose K operation ID matches this test.'}));
