import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
let html=readFileSync(new URL('poster-admin.html',import.meta.url),'utf8');
const fields=`<form id="event-fields" class="mock-form"><label>イベント名<input id="edit-title" value="指導碁＆定例会" maxlength="80" required></label><div class="editor-grid"><label>開催日<input id="edit-date" type="date" value="2026-09-26" required></label><label>開始時刻<input id="edit-time" type="time" value="13:00" required></label></div><label>会場<input id="edit-place" value="囲碁サロン湘南" maxlength="120" required></label><label>指導棋士〈任意〉<input id="edit-teacher" value="常石隆志六段" maxlength="80"></label><label>イベント全体の定員〈名〉<input id="edit-capacity" type="number" value="20" min="1" max="9999" step="1" required inputmode="numeric"></label><p class="mock-subtle">20名は仮の設定です。先生別の予約枠とは別です。</p></form>`;
const review=`<main class="mock-shell mock-view" id="event-review" hidden><button class="mock-back" data-go="poster-admin">← 入力に戻る</button><header class="mock-heading"><h1 tabindex="-1">募集内容の確認</h1></header><section class="poster-admin-card"><h2 id="review-title"></h2><p id="review-date"></p><p id="review-place"></p><p id="review-teacher"></p><img id="review-poster" class="poster-admin-image" src="poster-sample.jpg" alt="選んだポスターの確認"><div class="seat-box"><p>イベント全体の定員：<strong id="review-capacity"></strong></p><small>先生別の予約枠とは別です。</small></div><p class="mock-subtle">この見本では申込者は0名です。受付開始後の表示を試せますが、本番には保存・公開されません。</p><button class="mock-primary" id="start-event" type="button">この内容で受付開始〈見本〉</button></section></main>`;
const js=`
let reviewedEvent=null;
const eventFields=document.getElementById('event-fields');
eventFields.addEventListener('submit',e=>{e.preventDefault();document.getElementById('review-event').click();});
const val=id=>document.getElementById(id).value.trim();
function readEventDraft(){
 for(const id of ['edit-title','edit-place']){const i=document.getElementById(id);i.setCustomValidity(i.value.trim()?'':'入力してください');}
 if(!eventFields.reportValidity())return null;
 if(picker.files.length&&!pendingPoster){posterError.textContent='読み込める画像を選び、画像が表示されてから確認してください。';picker.focus();return null;}
 const date=val('edit-date'),time=val('edit-time'),parts=date.split('-').map(Number),wd='日月火水木金土'[new Date(Date.UTC(parts[0],parts[1]-1,parts[2])).getUTCDay()];
 return {title:val('edit-title'),date,time,place:val('edit-place'),teacher:val('edit-teacher'),capacity:Number(val('edit-capacity')),displayDate:parts[0]+'年'+parts[1]+'月'+parts[2]+'日（'+wd+'）'+time,poster:pendingPoster?{...pendingPoster}:null};
}
eventFields.addEventListener('input',e=>e.target.setCustomValidity?.(''));
document.getElementById('review-event').addEventListener('click',()=>{
 const d=readEventDraft();if(!d)return;reviewedEvent=d;
 document.getElementById('review-title').textContent=d.title;document.getElementById('review-date').textContent=d.displayDate;document.getElementById('review-place').textContent=d.place;document.getElementById('review-teacher').textContent=d.teacher;
 document.getElementById('review-capacity').textContent=d.capacity+'名';document.getElementById('review-poster').src=d.poster?.url||activePosterUrl||'poster-sample.jpg';show('event-review');
});
document.getElementById('start-event').addEventListener('click',()=>{
 const d=reviewedEvent;if(!d)return;
 if(d.poster){pendingPoster=d.poster;applyPoster.disabled=false;applyPoster.click();}
 document.querySelector('#events .signup-event h2').textContent=d.title;
 document.querySelector('#events .event-date').textContent=d.displayDate;
 document.querySelector('#events .signup-event .event-place').textContent=d.place+(d.teacher?'\\n'+d.teacher:'');
 document.querySelector('#events .seat-box strong').textContent=d.capacity+'名';
 document.querySelector('#events .seat-box small').textContent='先生別の予約枠とは別です。見本の申込者は0名です。';
 document.querySelector('#events .mock-details p').textContent=d.displayDate+'から、'+d.place+'で開催します。'+(d.teacher?'指導棋士：'+d.teacher+'。':'');
 for(const id of ['apply','confirm'])document.querySelector('#'+id+' .signup-event h2').textContent=d.title;
 document.querySelector('#apply .event-place').textContent=d.displayDate+'\\n'+d.place;
 document.querySelector('#confirm .mock-facts p:nth-child(1)').textContent=d.displayDate;
 document.querySelector('#confirm .mock-facts p:nth-child(2)').textContent=d.place;
 document.querySelector('#home [data-go="events"] p').textContent=d.title+'の募集表示〈見本〉';
 document.getElementById('admin-feedback').textContent='受付開始の表示を見本内で反映しました。本番には保存・公開していません。';show('events');
});`;
new vm.Script(js);
if(/fetch\(|localStorage|sessionStorage|XMLHttpRequest|sendBeacon|\.cookie/.test(js))throw Error('Preview must not persist or call services');
html=html.replace('<title>ポスター差し替え・管理側の未公開見本</title>','<title>イベント募集を作る・未公開見本</title>').replace('ポスターを差し替える</h1>','イベント募集を作る</h1>').replace('<h2>9/26 指導碁＆定例会</h2><p class="event-place">13:00 · 囲碁サロン湘南</p>','').replace('画像を選び、表示を確認してから差し替えます。','イベント情報とポスターを入力し、確認してから受付開始を試せます。').replace('<label class="poster-upload">',fields+'<label class="poster-upload">').replace('1. 画像を選ぶ','ポスター画像を選ぶ').replace('2. 選んだ画像を確認する','選んだ画像').replace('<button type="button" class="mock-primary" id="apply-poster" disabled>','<button type="button" class="mock-primary" id="apply-poster" hidden disabled>').replace('<p class="mock-subtle">画像を選ぶだけでは、イベントの表示は変わりません。</p>','<p class="mock-subtle">入力だけでは表示は変わりません。画像を選ばず、現在の画像で確認することもできます。</p><button type="button" class="mock-primary" id="review-event">募集内容を確認する</button>').replace("'complete','poster-admin'])","'complete','poster-admin','event-review'])").replace('<script>',review+'<script>').replace('</script>',js+'</script>').replace('</head>','<style>.editor-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.editor-grid input{min-width:0}#events .signup-event .event-place,#apply .event-place{white-space:pre-line}@media(max-width:380px){.editor-grid{grid-template-columns:1fr;gap:0}}</style></head>');
const publishExplanation='<aside class="publish-explanation" aria-label="受付開始で反映される内容"><strong>本番版で予定する動作</strong><p>イベント情報・ポスター・定員を保存し、ポータルに公開して申込みの受付を開始します。</p><p><strong>今は未公開見本です。</strong>このボタンを押しても本番には保存・公開されません。参加スタンプも付きません。</p></aside>';
html=html.replace('<button class="mock-primary" id="start-event"',publishExplanation+'<button class="mock-primary" id="start-event"').replace('</head>','<style>.publish-explanation{margin:18px 0;padding:16px;border:1px solid #d4bc71;border-radius:14px;background:#fff6dc;font-size:16px;line-height:1.7;color:#54451f}.publish-explanation p{margin:9px 0 0}</style></head>');
const combined=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(combined);
if(!combined.includes("'poster-admin','event-review'"))throw Error('Review navigation missing');
writeFileSync(new URL('event-editor.html',import.meta.url),html);console.log('Built event editor preview: fields, confirmation and preview-only start.');
