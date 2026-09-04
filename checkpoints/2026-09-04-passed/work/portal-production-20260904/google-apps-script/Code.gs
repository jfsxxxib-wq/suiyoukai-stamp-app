// Dedicated to the official ledger. This is a verifier, not the secret itself.
const LEDGER_ID = '1a6J-hoyw3fvKOVOJ_GpbGN1l-_EqqAoScSkaqqsiR-8';
const SECRET_HASH = 'fdb91057bd7e01ac320c50ef8784221e4921f1f40a1db6e452e19c0109b6375d';
const EXTRA_HEADERS = ['初回登録日時', '姓', '名', '参加者番号', '登録状態'];
function setupLedger() {
  const sheet = SpreadsheetApp.openById(LEDGER_ID).getSheetByName('正式受付台帳');
  if (!sheet || sheet.getRange('A4').getDisplayValue() !== '受付番号') throw new Error('ledger_mismatch');
  const existing = sheet.getRange('L4:P4').getDisplayValues()[0];
  if (existing.some((v,i)=>v && v !== EXTRA_HEADERS[i])) throw new Error('header_conflict');
  sheet.getRange('L4:P4').setValues([EXTRA_HEADERS]).setFontWeight('bold').setBackground('#176b5c').setFontColor('#ffffff');
  sheet.setColumnWidth(12, 180);sheet.setColumnWidths(13,2,110);sheet.setColumnWidth(15,130);sheet.setColumnWidth(16,120);
  SpreadsheetApp.flush();
}
function doGet() { return output({ok:true,service:'suiyoukai-official-registration',version:1}); }
function doPost(event) {
  try {
    if (!event || !event.postData || event.postData.contents.length>8192) return output({ok:false,error:'invalid_request'});
    const p=JSON.parse(event.postData.contents);
    const digest=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(p.secret||''),Utilities.Charset.UTF_8).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');
    if(digest!==SECRET_HASH)return output({ok:false,error:'unauthorized'});
    if(p.action==='history_receipt')return historyReceipt(p);
    if(p.action==='health')return output({ok:true,ledgerId:LEDGER_ID,headersReady:SpreadsheetApp.openById(LEDGER_ID).getSheetByName('正式受付台帳').getRange('L4:P4').getDisplayValues()[0].join('|')===EXTRA_HEADERS.join('|')});
    if(p.action!=='registration_upsert')return output({ok:false,error:'invalid_action'});
    if(!/^\d{8}$/.test(p.participantNumber)||!/^gate-[0-9a-f-]{36}$/.test(p.operationId)||!Number.isInteger(p.version)||p.version<1)return output({ok:false,error:'invalid_id'});
    const names=[p.familyName,p.givenName];
    if(names.some(n=>typeof n!=='string'||!n.trim()||n.length>30||/[\u0000-\u001f\u007f]/.test(n)))return output({ok:false,error:'invalid_name'});
    if(p.appNumber&&!/^\d{8}$/.test(p.appNumber))return output({ok:false,error:'invalid_app_number'});
    const date=new Date(p.registeredAt);if(isNaN(date.getTime()))return output({ok:false,error:'invalid_date'});
    const lock=LockService.getScriptLock();lock.waitLock(20000);
    try {
      const sheet=SpreadsheetApp.openById(LEDGER_ID).getSheetByName('正式受付台帳');
      if(sheet.getRange('L4:P4').getDisplayValues()[0].join('|')!==EXTRA_HEADERS.join('|'))return output({ok:false,error:'headers_not_ready'});
      const rows=sheet.getLastRow()>4?sheet.getRange(5,1,sheet.getLastRow()-4,16).getDisplayValues():[];
      const index=rows.findIndex(r=>r[10]===p.operationId);
      const rowNumber=index<0?Math.max(5,sheet.getLastRow()+1):index+5;
      const props=PropertiesService.getScriptProperties();const versionKey='v_'+p.operationId;
      const currentVersion=Number(props.getProperty(versionKey)||0);
      if(currentVersion>p.version)return output({ok:true,version:currentVersion});
      if(index>=0&&rows[index][14]!==p.participantNumber)return output({ok:false,error:'identity_conflict'});
      // Preserve A:B participation fields and all historical rows. Registration is not attendance.
      if(index<0){sheet.getRange(rowNumber,1,1,16).setNumberFormat('@');sheet.getRange(rowNumber,8,1,4).setValues([['未連携','対象外','サイト初回登録',p.operationId]]);}
      sheet.getRange(rowNumber,3).setValue(asText(p.familyName+' '+p.givenName));
      sheet.getRange(rowNumber,4).setNumberFormat('@').setValue(p.appNumber||'');
      sheet.getRange(rowNumber,8).setValue(p.appNumber?'連携済み':'未連携');
      sheet.getRange(rowNumber,12,1,5).setValues([[Utilities.formatDate(date,'Asia/Tokyo','yyyy/MM/dd HH:mm:ss'),asText(p.familyName),asText(p.givenName),p.participantNumber,'登録済み']]);
      SpreadsheetApp.flush();props.setProperty(versionKey,String(p.version));
      return output({ok:true,version:p.version,participantNumber:p.participantNumber});
    } finally {lock.releaseLock();}
  } catch(e) {return output({ok:false,error:'save_failed'});}
}
function asText(value){return /^[=+\-@]/.test(value)?"'"+value:value;}
function output(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function historyReceipt(p){
 if(!/^history-20260904-\d{2}$/.test(p.id)||!/^\d{8}$/.test(p.appNumber)||!Array.isArray(p.recordIds)||p.recordIds.length<1||p.recordIds.length>5||p.recordIds.some(id=>!String(id).startsWith(p.id+'-')))return output({ok:false,error:'invalid_history'});
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const book=SpreadsheetApp.openById('1JWLM-Xcc-gI8Sf57qlKq40MZ2vWYjx6QGTyAS_je6n4');
  const details=book.getSheetByName('記録明細'),summary=book.getSheetByName('参加者別集計');
  const rows=details.getRange(5,1,details.getLastRow()-4,9).getDisplayValues();
  const indices=p.recordIds.map(id=>rows.findIndex(r=>r[8]===id&&r[1]===p.name));
  const summaryRows=summary.getRange('A5:H14').getDisplayValues();const person=summaryRows.findIndex(r=>r[0]===p.name);
  if(indices.some(i=>i<0)||person<0)return output({ok:false,error:'history_not_found'});
  if(indices.some(i=>rows[i][5]&&rows[i][5]!==p.appNumber))return output({ok:false,error:'history_identity_conflict'});
  for(const i of indices){details.getRange(i+5,6).setNumberFormat('@').setValue(p.appNumber);if(/^\d{8}$/.test(p.participantNumber||''))details.getRange(i+5,7).setNumberFormat('@').setValue(p.participantNumber);details.getRange(i+5,8).setValue('反映済み');}
  summary.getRange(person+5,6).setNumberFormat('@').setValue(p.appNumber);if(/^\d{8}$/.test(p.participantNumber||''))summary.getRange(person+5,7).setNumberFormat('@').setValue(p.participantNumber);summary.getRange(person+5,8).setValue('反映済み');
  SpreadsheetApp.flush();return output({ok:true,historyId:p.id});
 }finally{lock.releaseLock();}
}
