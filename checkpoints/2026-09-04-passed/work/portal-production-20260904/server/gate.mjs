const FLOWER_ORIGIN='https://jfsxxxib-wq.github.io';
const encoder=new TextEncoder();
const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
const sha=async s=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(s)));
async function hmac(secret,s){const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(s)));}
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers}});
const present=p=>({participantNumber:p.number,familyName:p.family,givenName:p.given,registeredAt:p.created,synced:p.synced>=p.version});
const cookie=token=>`__Host-suiyoukai=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`;
async function historyApi(path,body,env,respond){
 if(!/^[a-f0-9]{64}$/.test(body.ticket||'')||!/^\d{8}$/.test(body.appNumber||'')||!/^[a-f0-9]{64}$/.test(body.deviceKey||''))return respond({error:'受け取り用リンクを確認してください。'},400);
 const manifest=JSON.parse(env.HISTORY_RECORDS||'{"entries":[]}');
 const ticketHash=await sha(body.ticket);
 const item=manifest.entries.find(e=>e.ticketHash===ticketHash);
 if(!item)return respond({error:'受け取り用リンクが見つかりません。管理者にご確認ください。'},404);
 if(item.appNumber&&item.appNumber!==body.appNumber)return respond({error:'登録されたスマートフォンと番号が違います。いつものSafariまたはChromeで開いてください。'},409);
 const deviceHash=await sha(body.deviceKey);
 let claim=await env.DB.prepare('SELECT * FROM history_claims WHERE id=?').bind(item.id).first();
 if(claim&&(claim.device_hash!==deviceHash||claim.app_number!==body.appNumber))return respond({error:'この記録は別の端末で受け取り手続き済みです。管理者にご確認ください。'},409);
 const payload={id:item.id,name:item.name,participationDates:item.participationDates,lessons:item.lessons,recordIds:item.recordIds};
 if(path.endsWith('/preview'))return respond({record:payload,completed:!!claim?.completed});
 if(path.endsWith('/claim')){
  await env.DB.prepare('INSERT OR IGNORE INTO history_claims(id,device_hash,app_number,synced) VALUES (?,?,?,0)').bind(item.id,deviceHash,body.appNumber).run();
  claim=await env.DB.prepare('SELECT * FROM history_claims WHERE id=?').bind(item.id).first();
  if(claim.device_hash!==deviceHash||claim.app_number!==body.appNumber)return respond({error:'別の端末で手続きが始まりました。管理者にご確認ください。'},409);
  return respond({record:payload});
 }
 if(path.endsWith('/receipt')){
  if(!claim)return respond({error:'先に受け取り内容を確認してください。'},409);
  if(!claim.completed){claim.completed=new Date().toISOString();await env.DB.prepare('UPDATE history_claims SET completed=? WHERE id=?').bind(claim.completed,item.id).run();}
  if(!claim.synced){try{
   const r=await fetch(env.LEDGER_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({secret:env.LEDGER_SECRET,action:'history_receipt',id:item.id,name:item.name,recordIds:item.recordIds,appNumber:body.appNumber,participantNumber:item.participantNumber||'',completed:claim.completed}),signal:AbortSignal.timeout(20000)});
   const ack=await r.json();if(r.ok&&ack.ok&&ack.historyId===item.id){await env.DB.prepare('UPDATE history_claims SET synced=1 WHERE id=?').bind(item.id).run();claim.synced=1;}
  }catch{console.error('history_receipt_sync_pending');}}
  return respond({ok:true,synced:!!claim.synced});
 }
 return respond({error:'not_found'},404);
}
async function bySession(request,env){const token=request.headers.get('Cookie')?.match(/(?:^|;\s*)__Host-suiyoukai=([0-9a-f]{64})(?:;|$)/)?.[1];return token?env.DB.prepare('SELECT * FROM gate_participants WHERE session_hash=?').bind(await sha(token)).first():null;}
async function byDevice(request,env){const token=request.headers.get('Authorization')?.match(/^Bearer ([0-9a-f]{64})$/)?.[1];return token?env.DB.prepare('SELECT p.* FROM gate_devices d JOIN gate_participants p ON p.id=d.participant_id WHERE d.hash=?').bind(await sha(token)).first():null;}
export async function syncParticipant(env,p){
 if(p.synced>=p.version)return true;
 if(!env.LEDGER_URL||!env.LEDGER_SECRET)return false;
 try {
  const response=await fetch(env.LEDGER_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({secret:env.LEDGER_SECRET,action:'registration_upsert',operationId:'gate-'+p.id,participantNumber:p.number,familyName:p.family,givenName:p.given,registeredAt:p.created,appNumber:p.app_number||'',version:p.version}),signal:AbortSignal.timeout(20000)});
  const result=await response.json();if(!response.ok||!result.ok||!Number.isInteger(result.version)||result.version<p.version||result.participantNumber!==p.number)return false;
  await env.DB.prepare('UPDATE gate_participants SET synced=MAX(synced,?) WHERE id=?').bind(p.version,p.id).run();p.synced=p.version;return true;
 }catch(error){console.error('ledger_sync_failed',{kind:error?.name||'Error'});return false;}
}
async function limited(request,env){
 const now=Date.now();const bucket=Math.floor(now/60000);const key=await sha((request.headers.get('CF-Connecting-IP')||'local')+':'+bucket);
 await env.DB.prepare('DELETE FROM gate_rates WHERE expires<?').bind(now).run();
 await env.DB.prepare('DELETE FROM gate_tickets WHERE expires<?').bind(now-86400000).run();
 const r=await env.DB.prepare('INSERT INTO gate_rates (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,now+120000).first();
 return r.count>30;
}
export async function api(request,env){
 const url=new URL(request.url);const path=url.pathname;const origin=request.headers.get('Origin');const flower=path.startsWith('/api/flower/');
 const permitted=flower?origin===FLOWER_ORIGIN:origin===url.origin;
 const cors=flower&&origin===FLOWER_ORIGIN?{'Access-Control-Allow-Origin':FLOWER_ORIGIN,'Vary':'Origin'}:{};
 const respond=(data,status=200,extra={})=>json(data,status,{...cors,...extra});
 if(request.method==='OPTIONS')return permitted?new Response(null,{status:204,headers:{...cors,'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Max-Age':'600'}}):respond({error:'forbidden'},403);
 if(request.method==='POST'&&!permitted)return respond({error:'forbidden'},403);
 if(flower&&!permitted)return respond({error:'forbidden'},403);
 if(!env.DB||!env.LEDGER_SECRET||!env.LEDGER_URL)return respond({error:'接続の準備中です。少し待ってからお試しください。'},503);
 try {
  if(request.method==='POST'&&await limited(request,env))return respond({error:'操作が続いています。1分ほど待ってお試しください。'},429);
  let body={};if(request.method==='POST'){const raw=await request.text();if(raw.length>4096)return respond({error:'invalid_request'},413);try{body=JSON.parse(raw);}catch{return respond({error:'invalid_request'},400);}}
  if(path.startsWith('/api/flower/history/')&&request.method==='POST')return await historyApi(path,body,env,respond);
  if(path==='/api/registration'&&request.method==='GET'){
   const p=await bySession(request,env);if(!p)return respond({registered:false});
   await syncParticipant(env,p);return respond({registered:true,participant:present(p)});
  }
  if(path==='/api/registration'&&request.method==='POST'){
   const names=[body.familyName,body.givenName].map(n=>typeof n==='string'?n.normalize('NFKC').trim():'');
   if(names.some(n=>!n||n.length>30||/[\u0000-\u001f\u007f]/.test(n)))return respond({error:'姓と名をそれぞれ30文字以内で入力してください。'},400);
   if(!/^[0-9a-f]{64}$/.test(body.requestKey||''))return respond({error:'invalid_request'},400);
   const hash=await sha(body.requestKey);const session=await hmac(env.LEDGER_SECRET,'session:'+body.requestKey);
   let p=await bySession(request,env);
   if(p){if(p.family!==names[0]||p.given!==names[1]){await env.DB.prepare('UPDATE gate_participants SET family=?,given=?,version=version+1 WHERE id=?').bind(...names,p.id).run();p=await env.DB.prepare('SELECT * FROM gate_participants WHERE id=?').bind(p.id).first();}}
   else {
    p=await env.DB.prepare('SELECT * FROM gate_participants WHERE request_hash=?').bind(hash).first();
    if(p&&(p.family!==names[0]||p.given!==names[1]))return respond({error:'保存を再確認しています。同じお名前で再試行してください。'},409);
    if(!p){for(let i=0;i<5;i++){
      const number=String(10000000+crypto.getRandomValues(new Uint32Array(1))[0]%90000000);
      const id=crypto.randomUUID();
      await env.DB.prepare('INSERT OR IGNORE INTO gate_participants (id,number,family,given,request_hash,session_hash,created,version,synced) VALUES (?,?,?,?,?,?,?,1,0)').bind(id,number,...names,hash,await sha(session),new Date().toISOString()).run();
      p=await env.DB.prepare('SELECT * FROM gate_participants WHERE request_hash=?').bind(hash).first();if(p)break;
    }}
    if(!p)return respond({error:'番号を発行できませんでした。もう一度お試しください。'},503);
   }
   const ok=await syncParticipant(env,p);const existingSession=await bySession(request,env);
   return respond({registered:true,participant:present(p),error:ok?undefined:'受付を保存しましたが、台帳への記録を確認中です。再確認を押してください。'},ok?200:503,existingSession?{}:{'Set-Cookie':cookie(session)});
  }
  if(path==='/api/handoff'&&request.method==='POST'){
   const p=await bySession(request,env);if(!p)return respond({error:'先にお名前を登録してください。'},401);
   if(!await syncParticipant(env,p))return respond({error:'台帳への記録を確認中です。再確認してください。'},503);
   const ticket=random();await env.DB.prepare('INSERT INTO gate_tickets(hash,participant_id,expires,used) VALUES (?,?,?,0)').bind(await sha(ticket),p.id,Date.now()+900000).run();
   return respond({url:FLOWER_ORIGIN+'/suiyoukai-stamp-app/#gate-ticket='+ticket});
  }
  if(path==='/api/flower/redeem'&&request.method==='POST'){
   if(!/^[0-9a-f]{64}$/.test(body.ticket||'')||!/^\d{8}$/.test(body.appNumber||'')||!/^[0-9a-f]{64}$/.test(body.deviceKey||''))return respond({error:'invalid_ticket'},400);
   const hash=await sha(body.ticket);const token=await hmac(env.LEDGER_SECRET,'device:'+body.ticket+':'+body.deviceKey);
   // A retry from the same device can recover a lost response without consuming twice.
   const old=await env.DB.prepare('SELECT p.* FROM gate_devices d JOIN gate_participants p ON p.id=d.participant_id WHERE d.hash=?').bind(await sha(token)).first();
   if(old){await syncParticipant(env,old);return respond({token,participant:present(old)});}
   const t=await env.DB.prepare('UPDATE gate_tickets SET used=1 WHERE hash=? AND used=0 AND expires>? RETURNING participant_id').bind(hash,Date.now()).first();
   if(!t)return respond({error:'入口からもう一度、花図鑑を開いてください。'},409);
   await env.DB.batch([
    env.DB.prepare('INSERT INTO gate_devices(hash,participant_id,created) VALUES (?,?,?)').bind(await sha(token),t.participant_id,Date.now()),
    env.DB.prepare('UPDATE gate_participants SET app_number=?,version=version+1 WHERE id=?').bind(body.appNumber,t.participant_id)
   ]);
   const p=await env.DB.prepare('SELECT * FROM gate_participants WHERE id=?').bind(t.participant_id).first();await syncParticipant(env,p);
   return respond({token,participant:present(p)});
  }
  if(path==='/api/flower/session'&&request.method==='GET'){
   const p=await byDevice(request,env);if(!p)return respond({error:'登録を確認できませんでした。'},401);
   await syncParticipant(env,p);return respond({participant:present(p)});
  }
  return respond({error:'not_found'},404);
 } catch {return respond({error:'通信を確認して、もう一度お試しください。'},503);}
}
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname.startsWith('/api/'))return api(request,env);
  const response=await env.ASSETS.fetch(request);const headers=new Headers(response.headers);
  headers.set('Referrer-Policy','no-referrer');headers.set('X-Content-Type-Options','nosniff');
  if(url.pathname==='/'||url.pathname.endsWith('.html'))headers.set('Cache-Control','no-cache');
  return new Response(response.body,{status:response.status,headers});
 }
};
