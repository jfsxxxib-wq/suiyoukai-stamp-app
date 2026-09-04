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
