(() => {
 'use strict';
 function plan(snapshot,record){
  if(!/^history-20260904-\d{2}$/.test(record.id)||!Array.isArray(record.participationDates)||record.participationDates.some(d=>!['2026-08-30','2026-09-02'].includes(d))||new Set(record.participationDates).size!==record.participationDates.length||!Array.isArray(record.lessons)||record.lessons.some(l=>l.date!=='2026-08-30'||!['yuki','matsumoto'].includes(l.teacherId)||l.count!==1))throw new Error('受け取り内容を確認できませんでした。');
  const progress=JSON.parse(JSON.stringify(snapshot.progress));const records=JSON.parse(JSON.stringify(snapshot.records));
  const already=!!snapshot.receipts?.[record.id]?.applied;
  const before=progress.stamps.participationCount||0;const teachers={};
  if(already)return {progress,records,already,before,after:before,teachers};
  // The confirmed counts are historical totals, not increments. Preserve later visits.
  const laterDates=new Set((snapshot.appliedQrIds||[]).filter(x=>/^participation-\d{4}-\d{2}-\d{2}$/.test(x)).map(x=>x.slice(14)).filter(d=>d>'2026-09-02'));
  const last=progress.stamps.lastParticipationStampDate||'';if(last>'2026-09-02')laterDates.add(last);
  progress.stamps.participationCount=Math.max(before,record.participationDates.length+laterDates.size);
  progress.stamps.lastParticipationStampDate=[last,...record.participationDates].sort().at(-1)||'';
  for(const lesson of record.lessons){
   const id=lesson.teacherId;const old=progress.stamps.teacherLessonCounts[id]||0;
   const newer=records.filter(r=>r.teacherId===id&&r.date>'2026-09-02');
   const after=Math.max(old,lesson.count+new Set(newer.map(r=>r.id)).size);
   progress.stamps.teacherLessonCounts[id]=after;teachers[id]={before:old,after};
   if(!records.some(r=>r.teacherId===id&&r.date===lesson.date))records.push({id:`${record.id}-${lesson.date}-${id}`,teacherId:id,date:lesson.date,handicap:'未確認',result:'記録なし',recordedAt:new Date().toISOString()});
  }
  return {progress,records,already:false,before,after:progress.stamps.participationCount,teachers};
 }
 window.suiyoukaiHistoryMerge=Object.freeze({plan});
})();
