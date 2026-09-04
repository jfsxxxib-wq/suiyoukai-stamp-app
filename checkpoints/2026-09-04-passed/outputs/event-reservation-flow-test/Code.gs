// Isolated owner-only experiment. No production IDs, registration, or stamp writes.
const EVENT_BOOK = '1TMuW2zrRlvrc43ia8Au8zwmKHr2pnHZ0o6zkuURMJUU';
const SIGNUP_BOOK = '1Pi8EDp19YysJRNpDBNBTD8nkjwSBDIjGjBuyl8OCNW4';
const EVENT_ID = 'TEST-LAST-SEAT';

function testOperation(p) {
  const entered = Date.now();
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  const acquired = Date.now();
  try {
    const eb = SpreadsheetApp.openById(EVENT_BOOK);
    const sb = SpreadsheetApp.openById(SIGNUP_BOOK);
    if (eb.getName() !== '水曜会 テスト専用 イベント設定' || sb.getName() !== '水曜会 テスト専用 申込一覧') throw Error('test files only');
    const events = eb.getSheetByName('イベント設定'), signups = sb.getSheetByName('申込一覧');
    const event = events.getRange('A2:F2').getValues()[0];
    if(event[0] !== EVENT_ID || event[4] !== 1) throw Error('fixture mismatch');
    const rows = signups.getLastRow() > 1 ? signups.getRange(2,1,signups.getLastRow()-1,7).getValues() : [];
    const active = rows.filter(r => r[1] === EVENT_ID && r[4] === '受付済').length;
    let result;
    if (p.op === 'prepare') {
      if(rows.length) throw Error('Already tested. Existing test history retained.');
      eb.setSpreadsheetTimeZone('Asia/Tokyo'); sb.setSpreadsheetTimeZone('Asia/Tokyo');
      events.getRange('C2').setValue(new Date('2026-09-26T13:00:00+09:00'));
      result={status:'ready',active};
    } else if(p.op === 'snapshot') {
      result={status:event[5],active,rows:rows.map(r=>[r[0],r[1],r[2],String(r[3]),r[4],r[5],String(r[6])])};
    } else if(p.op === 'submit') {
      if(!/^TEST-[ABC]$/.test(p.id) || p.name !== '架空の申込者'+p.id.slice(-1)) throw Error('fictional applicants only');
      const old = rows.find(r=>r[0]===p.id);
      if(old) {
        if(old[1]!==EVENT_ID || old[2]!==p.name) throw Error('id conflict');
        result={status:old[4]==='受付済'?'accepted':'cancelled',id:old[0],replayed:true,active};
      } else if(event[5]!=='受付中') result={status:'paused',active};
      else if(active>=event[4]) result={status:'full',active};
      else {
        Utilities.sleep(1500); // Widen the contested interval for this test only.
        const row=signups.getLastRow()+1;
        signups.getRange(row,1,1,7).setValues([[p.id,EVENT_ID,p.name,new Date(),'受付済','','']]);
        signups.getRange(row,4).setNumberFormat('yyyy/mm/dd hh:mm:ss');
        result={status:'accepted',id:p.id,replayed:false,active:active+1};
      }
    } else if(p.op==='cancel') {
      const i=rows.findIndex(r=>r[0]===p.id && r[1]===EVENT_ID);
      if(i<0) throw Error('unknown test signup');
      if(rows[i][4]==='キャンセル') result={status:'cancelled',replayed:true,active};
      else {
        events.getRange('F2').setValue('再開待ち');
        SpreadsheetApp.flush(); // Stop intake first; partial cancellation fails closed.
        signups.getRange(i+2,5).setValue('キャンセル');
        signups.getRange(i+2,7).setValue(new Date()).setNumberFormat('yyyy/mm/dd hh:mm:ss');
        result={status:'cancelled',active:active-1};
      }
    } else if(p.op==='reopen') {
      if(active>=event[4]) throw Error('no free seat');
      events.getRange('F2').setValue('受付中'); result={status:'reopened',active};
    } else if(p.op==='close') {
      events.getRange('F2').setValue('締切'); result={status:'closed',active};
    } else throw Error('unsupported operation');
    SpreadsheetApp.flush();
    return Object.assign(result,{entered,acquired,completed:Date.now()});
  } finally {lock.releaseLock();}
}

function legacyDoGet_() {
  return HtmlService.createHtmlOutput(`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>水曜会 予約の試験</title><style>body{font:17px sans-serif;line-height:1.6;padding:20px}button{padding:15px}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style><h1>予約の試験（架空データ専用）</h1><p>定員1名。同時申込み・再送・キャンセル後の停止と管理者再開を確認します。</p><button id="start" onclick="run()">試験を1回実行する</button><pre id="log"></pre><script>
const log=document.getElementById('log');
const call=p=>new Promise((ok,no)=>google.script.run.withSuccessHandler(ok).withFailureHandler(no).testOperation(p));
const check=(yes,label)=>{if(!yes)throw Error(label);log.textContent+=label+'：確認済み\\n';};
async function run(){document.getElementById('start').disabled=true;const evidence={};try{
evidence.prepare=await call({op:'prepare'});
evidence.race=await Promise.all(['A','B'].map(x=>call({op:'submit',id:'TEST-'+x,name:'架空の申込者'+x})));
check(evidence.race.filter(x=>x.status==='accepted').length===1&&evidence.race.filter(x=>x.status==='full').length===1,'最後の1枠：1人受付・1人満員');
const [early,late]=[...evidence.race].sort((a,b)=>a.acquired-b.acquired);
check(late.entered<early.completed&&late.acquired>=early.completed,'2件の処理が重なり、保存区間は順番に処理');
const winner=evidence.race.find(x=>x.status==='accepted').id;
evidence.replay=await call({op:'submit',id:winner,name:'架空の申込者'+winner.slice(-1)});
evidence.beforeCancel=await call({op:'snapshot'});
check(evidence.replay.replayed&&evidence.beforeCancel.rows.length===1&&evidence.beforeCancel.active===1,'再送しても申込は1件');
evidence.cancel=await call({op:'cancel',id:winner});
evidence.paused=await call({op:'submit',id:'TEST-C',name:'架空の申込者C'});
check(evidence.paused.status==='paused'&&evidence.paused.active===0,'キャンセル後は空席でも受付停止');
evidence.reopen=await call({op:'reopen'});
evidence.afterReopen=await call({op:'submit',id:'TEST-C',name:'架空の申込者C'});
check(evidence.afterReopen.status==='accepted','管理者再開後に1人受付');
await call({op:'close'});evidence.final=await call({op:'snapshot'});
check(evidence.final.active===1&&evidence.final.rows.length===2&&evidence.final.status==='締切','最終台帳：受付済1件・取消1件。試験受付を締切');
log.textContent+='全項目確認済み\\n';
}catch(e){log.textContent+='未完了：'+e.message+'\\n';try{await call({op:'close'});}catch(_){} }
log.textContent+=JSON.stringify(evidence,null,2);}
</script></html>`);
}

// Owner-only TEST deployment. All targets are isolated fixtures.
const FLOW_ID = 'TEST-FLOW-20260904';
const FLOW_POSTER = '1d1g1ngvWSTfpQTbUcr3qADBlbKSWYsqh';
const FLOW_HASH = '5287dea56c98661124d75b27866a41472e4e33a618e94caad6eb1a194ec9a73e';
const FLOW_EXTRA = ['ポスター画像ID','ポスター画像URL','先生','作成日時','更新日時','ポスターSHA256'];

function flowPoster_() {
  const blob = DriveApp.getFileById(FLOW_POSTER).getBlob();
  const bytes = blob.getBytes();
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bytes).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');
  if(hash !== FLOW_HASH) throw Error('テスト画像が一致しません');
  return {hash, data:'data:image/jpeg;base64,'+Utilities.base64Encode(bytes)};
}

function flowOperation(p) {
  if(!p || !['read','poster','save','submit','cancel','reopen','close'].includes(p.op)) throw Error('操作が不正です');
  if(p.op === 'poster') return flowPoster_();
  const lock=LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const eb=SpreadsheetApp.openById(EVENT_BOOK), sb=SpreadsheetApp.openById(SIGNUP_BOOK);
    if(eb.getName()!=='水曜会 テスト専用 イベント設定'||sb.getName()!=='水曜会 テスト専用 申込一覧') throw Error('テスト台帳以外は操作できません');
    const es=eb.getSheetByName('イベント設定'), ss=sb.getSheetByName('申込一覧');
    const eh=['イベントID','名称','日時（日本時間）','会場','定員','募集状態'];
    const sh=['申込ID','イベントID','氏名','申込日時（日本時間）','状態','枠ID','取消日時（日本時間）'];
    if(JSON.stringify(es.getRange(1,1,1,6).getValues()[0])!==JSON.stringify(eh)||JSON.stringify(ss.getRange(1,1,1,7).getValues()[0])!==JSON.stringify(sh)) throw Error('台帳の列が一致しません');
    let events=es.getLastRow()>1?es.getRange(2,1,es.getLastRow()-1,12).getValues():[];
    let rows=ss.getLastRow()>1?ss.getRange(2,1,ss.getLastRow()-1,7).getValues():[];
    let ei=events.findIndex(r=>r[0]===FLOW_ID), event=events[ei];
    if(events.filter(r=>r[0]===FLOW_ID).length>1) throw Error('イベントIDが重複しています');
    const active=rows.filter(r=>r[1]===FLOW_ID&&r[4]==='受付済').length;
    let replayed=false, outcome='read';
    if(p.op==='save') {
      const f=p.event||{};
      if(f.id!==FLOW_ID||f.title!=='通し確認用イベント〈架空〉'||f.date!=='2026-09-26'||f.time!=='13:00'||f.place!=='確認用の会場'||f.capacity!==3||f.teacher!==''||f.posterId!==FLOW_POSTER) throw Error('今回の架空イベント1件だけ保存できます');
      const fixed=[FLOW_ID,f.title,new Date(f.date+'T'+f.time+':00+09:00'),f.place,f.capacity,'受付中',FLOW_POSTER,'https://drive.google.com/file/d/'+FLOW_POSTER+'/view',f.teacher];
      if(event) {
        if([0,1,2,3,4,6,7,8].some(i=>String(event[i])!==String(fixed[i]))||event[11]!==FLOW_HASH) throw Error('同じIDに別の内容は保存できません');
        replayed=true;
      } else {
        flowPoster_(); // Verify access and exact image before any ledger mutation.
        const extra=es.getRange(1,7,1,6).getValues()[0];
        if(extra.some((v,i)=>v!==''&&v!==FLOW_EXTRA[i])) throw Error('追加列に別のデータがあります');
        es.getRange(1,7,1,6).setValues([FLOW_EXTRA]);
        const n=es.getLastRow()+1, now=new Date();
        es.getRange(n,1,1,12).setValues([[...fixed,now,now,FLOW_HASH]]);
        es.getRange(n,3).setNumberFormat('yyyy/mm/dd hh:mm');
        es.getRange(n,10,1,2).setNumberFormat('yyyy/mm/dd hh:mm:ss');
      }
      outcome='saved';
    } else if(p.op!=='read') {
      if(!event) throw Error('先にイベントを保存してください');
      if(p.op==='submit') {
        if(![FLOW_ID+'-A',FLOW_ID+'-B'].includes(p.id)||p.name!=='架空の申込者'+p.id.slice(-1)) throw Error('架空の申込者だけ受付できます');
        const old=rows.find(r=>r[0]===p.id);
        if(old) {
          if(old[1]!==FLOW_ID||old[2]!==p.name) throw Error('申込IDが一致しません');
          outcome=old[4]==='受付済'?'accepted':'cancelled'; replayed=true;
        } else if(event[5]!=='受付中') outcome='paused';
        else if(active>=Number(event[4])) outcome='full';
        else {
          const n=ss.getLastRow()+1;
          ss.getRange(n,1,1,7).setValues([[p.id,FLOW_ID,p.name,new Date(),'受付済','','']]);
          ss.getRange(n,4).setNumberFormat('yyyy/mm/dd hh:mm:ss'); outcome='accepted';
        }
      } else if(p.op==='cancel') {
        if(p.id!==FLOW_ID+'-A') throw Error('対象外の申込です');
        const ri=rows.findIndex(r=>r[0]===p.id&&r[1]===FLOW_ID);
        if(ri<0) throw Error('申込がありません');
        if(rows[ri][4]==='キャンセル') replayed=true;
        else {
          es.getRange(ei+2,6).setValue('再開待ち'); SpreadsheetApp.flush();
          ss.getRange(ri+2,5).setValue('キャンセル');
          ss.getRange(ri+2,7).setValue(new Date()).setNumberFormat('yyyy/mm/dd hh:mm:ss');
          es.getRange(ei+2,11).setValue(new Date());
        }
        outcome='cancelled';
      } else {
        if(p.op==='reopen'&&active>=Number(event[4])) throw Error('空席がありません');
        es.getRange(ei+2,6).setValue(p.op==='reopen'?'受付中':'締切');
        es.getRange(ei+2,11).setValue(new Date()); outcome=p.op;
      }
    }
    SpreadsheetApp.flush();
    events=es.getLastRow()>1?es.getRange(2,1,es.getLastRow()-1,12).getValues():[];
    rows=ss.getLastRow()>1?ss.getRange(2,1,ss.getLastRow()-1,7).getValues():[];
    event=events.find(r=>r[0]===FLOW_ID);
    const mine=rows.filter(r=>r[1]===FLOW_ID), count=mine.filter(r=>r[4]==='受付済').length;
    return {outcome,replayed,eventCount:events.filter(r=>r[0]===FLOW_ID).length,event:event?{id:event[0],title:event[1],datetime:Utilities.formatDate(new Date(event[2]),'Asia/Tokyo','yyyy-MM-dd HH:mm'),place:event[3],capacity:event[4],state:event[5],posterId:event[6],posterUrl:event[7],teacher:event[8],posterHash:event[11]}:null,active:count,remaining:event?Math.max(0,Number(event[4])-count):0,signups:mine.map(r=>({id:r[0],eventId:r[1],name:r[2],created:String(r[3]),state:r[4],slot:r[5],cancelled:String(r[6])}))};
  } finally {lock.releaseLock();}
}

function doGet(){return HtmlService.createHtmlOutput("<!doctype html><html lang=\"ja\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><base target=\"_top\"><title>水曜会・非公開の台帳接続確認</title><style>\n*{box-sizing:border-box}body{margin:0;background:#f7f5e9;color:#23493f;font:17px/1.7 sans-serif}main{max-width:620px;margin:auto;padding:20px}h1,h2{font-family:serif;font-weight:500}h1{font-size:1.65rem}h2{font-size:1.4rem}button,a{touch-action:manipulation}button,.button{display:block;padding:15px 20px;border:0;border-radius:16px;background:#176b5c;color:white;font-size:1rem;font-weight:bold;width:100%;margin:14px 0;cursor:pointer;text-decoration:none;text-align:center}button:disabled{opacity:.5;cursor:default}.secondary{background:#e4eee8;color:#23493f}a{color:#176b5c}article{padding:22px;border:1px solid #b7d6ce;border-radius:24px;background:#fffdf7;margin:20px 0}.note{background:#edf5f1;padding:16px;border-radius:15px}.notice{background:#fff0cc;padding:12px;border-radius:12px;font-size:.9rem}input{font:inherit;width:100%;padding:12px;border:1px solid #8da99e;border-radius:10px}label{display:block;margin:14px 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:10px}.poster{display:block;margin:auto;max-height:180px;max-width:100%;object-fit:contain}.poster-button{background:#f0eee2;color:#63736b;font-weight:normal}small{display:block}.seats{background:#e8f3ef;padding:16px;border-radius:15px}.seats strong{font-size:1.5rem}[hidden]{display:none!important}#status{white-space:pre-wrap;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.8rem}dialog{width:min(95vw,960px);max-height:93vh;border:0;border-radius:20px;padding:18px;background:#fffdf7}dialog::backdrop{background:#000b}.poster-scroll{overflow:auto;max-height:70vh}.poster-scroll img{display:block;max-width:100%;margin:auto}.poster-scroll.zoom img{width:904px;max-width:none}.nav{display:flex;gap:10px}.nav button{font-size:.85rem}.flow-links a{display:block;padding:8px 0}\n</style></head><body><main>\n<p class=\"notice\">非公開・テスト台帳への接続確認です。架空イベント1件だけを保存します。参加スタンプは付きません。</p>\n<nav class=\"nav\"><button class=\"secondary\" data-view=\"admin\">管理画面</button><button class=\"secondary\" data-view=\"portal\">ポータル入口</button></nav>\n<p id=\"status\" role=\"status\" aria-live=\"polite\">テスト台帳を読み込み中…</p>\n<section id=\"admin\" class=\"view\"><h1>イベント募集を作る</h1><article><form id=\"event-form\">\n<label>イベント名<input id=\"title\" value=\"通し確認用イベント〈架空〉\" required></label>\n<div class=\"pair\"><label>開催日<input id=\"date\" type=\"date\" value=\"2026-09-26\" required></label><label>時刻<input id=\"time\" type=\"time\" value=\"13:00\" required></label></div>\n<label>会場<input id=\"place\" value=\"確認用の会場\" required></label><label>先生（任意）<input id=\"teacher\" value=\"\"></label>\n<label>イベント全体の定員<input id=\"capacity\" type=\"number\" value=\"3\" min=\"1\" required></label>\n<p>ポスター：保存済みのテスト画像を使用</p><img class=\"poster\" alt=\"テスト用ポスター\"><small>『囲碁の時間』の画像です。実際のイベント告知ではありません。</small>\n<button type=\"submit\">募集内容を確認する</button></form></article>\n<button class=\"secondary\" id=\"reload\">保存した内容を読み戻す</button><button class=\"secondary\" id=\"cancel\">架空の申込をキャンセル</button><button class=\"secondary\" id=\"reopen\">管理者として受付を再開</button><button class=\"secondary\" id=\"close\">このイベントの受付を停止</button>\n</section>\n<section id=\"review\" class=\"view\" hidden><h1>受付開始前の確認</h1><article><div id=\"review-values\"></div><p class=\"note\">この操作で、イベント情報・ポスター参照先・定員・募集状態をテスト用「イベント設定」に保存します。この非公開画面のポータルに表示されます。本番への保存・公開は行いません。</p><button id=\"save\">テスト台帳に保存して受付開始</button><button class=\"secondary\" data-view=\"admin\">入力に戻る</button></article></section>\n<section id=\"portal\" class=\"view\" hidden><h1>水曜会ポータル〈非公開確認〉</h1><article><h2>イベントのお知らせ</h2><p id=\"portal-title\">未登録</p><button data-view=\"events\">イベントを見る</button></article><article class=\"flow-links\"><h2>いつもの入口</h2><a href=\"https://suiyoukai-portal.c84s4n967v.chatgpt.site/\" target=\"_blank\" rel=\"noopener\">本番ポータルを開く</a><a href=\"https://jfsxxxib-wq.github.io/suiyoukai-stamp-app/\" target=\"_blank\" rel=\"noopener\">花図鑑を開く</a></article></section>\n<section id=\"events\" class=\"view\" hidden><h1>イベントのお知らせ</h1><article><p class=\"event-date\"></p><h2 class=\"event-title\"></h2><p class=\"event-place\"></p><button class=\"poster-button\" id=\"poster-open\"><img class=\"poster\" alt=\"テスト用ポスター\"><small>タップで大きく見る</small></button><small>テスト画像です。実際の告知ではありません。</small><div class=\"seats\"><b id=\"state\">未登録</b><p>イベント全体：残り <strong id=\"remaining\">—</strong> 名</p><small>先生別の予約枠とは別です。</small></div><button id=\"apply\">申し込む</button><details><summary>詳細を見る</summary><p>台帳接続の確認に使用する架空イベントです。実開催・費用・スタンプ付与はありません。</p></details></article><button class=\"secondary\" data-view=\"portal\">入口へ戻る</button></section>\n<section id=\"confirm\" class=\"view\" hidden><h1>申込内容の確認</h1><article><h2 class=\"event-title\"></h2><p class=\"event-date\"></p><p class=\"event-place\"></p><p>架空の申込者A</p><p class=\"note\">別のテスト用「申込一覧」に予約1件を記録します。参加記録にはなりません。</p><button id=\"submit\">この内容でテスト申込を確定</button><button class=\"secondary\" data-view=\"events\">戻る</button></article></section>\n<section id=\"complete\" class=\"view\" hidden><h1 id=\"complete-title\">テスト申込の結果</h1><article><p id=\"complete-message\"></p><button class=\"secondary\" data-view=\"portal\">入口へ戻る</button></article></section>\n<details><summary>接続確認の記録</summary><button class=\"secondary\" id=\"replay-save\">同じイベントを再送して重複を確認</button><button class=\"secondary\" id=\"replay-submit\">同じ申込を再送して重複を確認</button><button class=\"secondary\" id=\"check-paused\">停止中の新規申込を確認</button><pre id=\"evidence\"></pre></details>\n<dialog id=\"poster-dialog\"><button id=\"poster-close\">閉じる ×</button><button class=\"secondary\" id=\"poster-zoom\">文字を拡大する</button><div class=\"poster-scroll\" id=\"poster-scroll\"><img class=\"poster-full\" alt=\"テスト用ポスターの拡大\"></div></dialog>\n</main><script>\nconst $=id=>document.getElementById(id), EID='TEST-FLOW-20260904', PID='1d1g1ngvWSTfpQTbUcr3qADBlbKSWYsqh';\nlet draft=null,snapshot=null,busy=false;const history=[];\nconst call=p=>new Promise((ok,no)=>google.script.run.withSuccessHandler(ok).withFailureHandler(no).flowOperation(p));\nfunction show(id){document.querySelectorAll('.view').forEach(v=>v.hidden=v.id!==id);window.scrollTo(0,0);}\nfunction render(s){snapshot=s;const e=s.event;$('portal-title').textContent=e?e.title+'・'+e.state:'イベントはまだ保存されていません';document.querySelectorAll('.event-title').forEach(n=>n.textContent=e?e.title:'');document.querySelectorAll('.event-date').forEach(n=>n.textContent=e?e.datetime+'（日本時間）':'');document.querySelectorAll('.event-place').forEach(n=>n.textContent=e?e.place+(e.teacher?'・'+e.teacher:''):'');$('state').textContent=e?e.state:'未登録';$('remaining').textContent=s.remaining;$('apply').disabled=!e||e.state!=='受付中'||s.remaining<1;}\nasync function execute(p){if(busy)return;busy=true;$('status').textContent='テスト台帳と通信中…';document.querySelectorAll('button').forEach(b=>b.disabled=true);try{const s=await call(p);history.push({at:new Date().toISOString(),operation:p.op,...s});render(s);$('evidence').textContent=JSON.stringify(history,null,2);$('status').textContent='台帳確認済み：'+(s.event?s.event.state:'未登録')+'／イベント '+s.eventCount+'件／申込履歴 '+s.signups.length+'件';return s;}catch(e){$('status').textContent='完了していません：'+e.message;throw e;}finally{busy=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);if(snapshot)render(snapshot);}}\nfunction fixture(){return{id:EID,title:$('title').value,date:$('date').value,time:$('time').value,place:$('place').value,teacher:$('teacher').value,capacity:Number($('capacity').value),posterId:PID};}\ndocument.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));\n$('event-form').onsubmit=e=>{e.preventDefault();draft=fixture();$('review-values').textContent=[draft.title,draft.date+' '+draft.time,draft.place,'定員 '+draft.capacity+'名'].join(' ／ ');show('review');};\n$('save').onclick=async()=>{try{await execute({op:'save',event:draft});show('events');}catch(_){}};\n$('reload').onclick=()=>execute({op:'read'}).catch(()=>{});\n$('apply').onclick=()=>show('confirm');\nconst signup=()=>({op:'submit',id:EID+'-A',name:'架空の申込者A'});\n$('submit').onclick=async()=>{try{const s=await execute(signup());$('complete-title').textContent=s.outcome==='accepted'?'テスト申込を保存しました':'申込は受付されていません';$('complete-message').textContent=s.outcome==='accepted'?'申込一覧に予約を記録しました。スタンプは付きません。':'結果：'+s.outcome;show('complete');}catch(_){}};\nfor(const op of ['cancel','reopen','close'])$(op).onclick=()=>execute({op,id:EID+'-A'}).catch(()=>{});\n$('replay-save').onclick=()=>execute({op:'save',event:draft||fixture()}).catch(()=>{});\n$('replay-submit').onclick=()=>execute(signup()).catch(()=>{});\n$('check-paused').onclick=()=>execute({op:'submit',id:EID+'-B',name:'架空の申込者B'}).catch(()=>{});\n$('poster-open').onclick=()=>$('poster-dialog').showModal();$('poster-close').onclick=()=>$('poster-dialog').close();$('poster-zoom').onclick=()=>$('poster-scroll').classList.toggle('zoom');$('poster-dialog').onclose=()=>$('poster-scroll').classList.remove('zoom');\n(async()=>{try{await execute({op:'read'});const p=await call({op:'poster'});document.querySelectorAll('.poster,.poster-full').forEach(i=>i.src=p.data);history.push({operation:'poster',hash:p.hash});$('evidence').textContent=JSON.stringify(history,null,2);}catch(e){$('status').textContent='読み込み未完了：'+e.message;}})();\n</script></body></html>\n").setTitle("水曜会・非公開の台帳接続確認");}
