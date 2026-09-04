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

function doGet() {
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
