(() => {
 'use strict';
 const app=window.suiyoukaiLinkage;if(!app?.applyHistoryRecord)return;
 const portal='https://suiyoukai-portal.c84s4n967v.chatgpt.site';
 const key='suiyoukai-history-access-v1';const incoming=new URLSearchParams(location.hash.slice(1)).get('history-ticket');
 let access={};let current;let layer;let busy=false;
 const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
 function save(){localStorage.setItem(key,JSON.stringify(access));}
 function element(tag,text,className){const e=document.createElement(tag);if(text)e.textContent=text;if(className)e.className=className;return e;}
 async function call(action,item){const r=await fetch(portal+'/api/flower/history/'+action,{method:'POST',mode:'cors',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({ticket:item.ticket,deviceKey:item.deviceKey,appNumber:app.getAppNumber()}),signal:AbortSignal.timeout(30000)});const data=await r.json();if(!r.ok)throw new Error(data.error||'通信を確認して、もう一度お試しください。');return data;}
 function shell(){
  layer=element('section',null,'history-receive-layer');layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','過去の記録を受け取る');
  const css=element('style');css.textContent='.history-receive-layer{position:fixed;inset:0;z-index:6000;overflow:auto;background:#faf8ef;color:#254c43;padding:28px 18px;font:17px/1.75 "Yu Gothic",sans-serif}.history-receive-card{max-width:430px;margin:auto}.history-receive-card h1{font:28px/1.45 "Yu Mincho",serif;margin:12px 0 22px}.history-receive-card h2{font-size:18px;margin:0 0 10px}.history-receive-card p{margin:12px 0}.history-receive-card .history-kicker{font-size:14px;color:#8d773d}.history-receive-card .history-name{font-size:21px;font-weight:bold}.history-records,.history-counts{border-radius:16px;padding:18px;margin:20px 0;background:#fff;border:1px solid #d8dfd7}.history-counts{background:#e7f0e9}.history-day{padding:10px 0;border-bottom:1px solid #e7ebe5}.history-day:last-child{border:0}.history-note{font-size:15px;color:#60746b}.history-action{display:block;width:100%;border:0;border-radius:15px;background:#176b5c;color:#fff;padding:17px 10px;font:700 18px/1.5 sans-serif;margin:18px 0;cursor:pointer}.history-action:disabled{opacity:.65}.history-close{display:block;margin:20px auto;border:0;background:none;color:#176b5c;text-decoration:underline;font:inherit;cursor:pointer}.history-error{color:#9b2424;font-size:16px}';
  layer.append(css);document.body.append(layer);return element('article',null,'history-receive-card');
 }
 function showError(message){const card=shell();card.append(element('h1','記録の受け取りを確認してください'),element('p',message,'history-error'));const close=element('button','花図鑑へ戻る','history-action');close.onclick=()=>layer.remove();card.append(close);layer.append(card);}
 async function receipt(item){for(let attempt=0;attempt<3;attempt++){try{const r=await call('receipt',item);if(r.synced){item.synced=true;save();return true;}}catch{}if(attempt<2)await new Promise(r=>setTimeout(r,1500));}return false;}
 function show(record){
  const plan=window.suiyoukaiHistoryMerge.plan(app.getHistorySnapshot(),record);
  const card=shell();card.append(element('p','水曜会の記録','history-kicker'),element('h1',plan.already?'記録は受け取り済みです':'過去の記録を花図鑑へ'),element('p',record.name+'さん','history-name'));
  const list=element('div',null,'history-records');list.append(element('h2','今回確認した記録'));
  for(const date of record.participationDates){const row=element('div',date.slice(5).replace('-','/')+'　参加 1回','history-day');for(const l of record.lessons.filter(l=>l.date===date))row.append(element('p',l.teacher+'との指導碁 1局','history-note'));list.append(row);}card.append(list);
  const counts=element('div',null,'history-counts');counts.append(element('h2','受け取り後のスタンプ'),element('p','参加　'+plan.after+' 個'));
  for(const l of record.lessons){const n=plan.teachers[l.teacherId]?.after??plan.progress.stamps.teacherLessonCounts[l.teacherId]??0;counts.append(element('p',l.teacher+'　'+n+' 個'));}
  card.append(counts,element('p','今ある花やスタンプを確認し、足りない分だけ補います。過去の記録は、今日の参加には数えません。','history-note'));
  const notice=element('p','','history-error');notice.setAttribute('role','status');const button=element('button',plan.already?'花図鑑を開く':'この内容で受け取る','history-action');button.type='button';
  button.onclick=async()=>{if(busy)return;if(plan.already){layer.remove();app.openHistoryCatalog();return;}busy=true;button.disabled=true;button.textContent='記録を確認しています…';try{
   const claim=await call('claim',current);app.applyHistoryRecord(claim.record);current.applied=true;current.recordId=claim.record.id;save();
   const synced=await receipt(current);card.replaceChildren(element('p','水曜会の記録','history-kicker'),element('h1','記録を受け取りました'),element('p','確認した過去の記録を花図鑑に反映しました。'),element('p',synced?'台帳にも受け取りを記録しました。':'端末への反映は完了しました。台帳への連絡は、次回開いたときにも再確認します。','history-note'));
   const finish=element('button','花図鑑を開く','history-action');finish.onclick=()=>{layer.remove();app.openHistoryCatalog();};card.append(finish);
  }catch(e){notice.textContent=e.message||'保存できませんでした。履歴を消さずに、もう一度お試しください。';button.disabled=false;button.textContent='もう一度受け取る';}finally{busy=false;}};
  const close=element('button','今は受け取らない','history-close');close.onclick=()=>{if(!busy)layer.remove();};card.append(notice,button,close);layer.append(card);
 }
 try{
  access=JSON.parse(localStorage.getItem(key)||'{}');
  if(incoming&&/^[a-f0-9]{64}$/.test(incoming)){history.replaceState(null,'',location.pathname+location.search);current=access[incoming]||{ticket:incoming,deviceKey:random(),synced:false,applied:false};access[incoming]=current;save();call('preview',current).then(data=>show(data.record)).catch(e=>showError(e.message));}
  for(const item of Object.values(access)){if(item.applied&&!item.synced)receipt(item);}
 }catch{if(incoming)showError('このブラウザに記録を保存できません。通常のSafariまたはChromeで開いてください。');}
})();
