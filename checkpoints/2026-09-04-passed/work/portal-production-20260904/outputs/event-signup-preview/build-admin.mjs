import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
let html=readFileSync(new URL('index.html',import.meta.url),'utf8');
const style=`.poster-admin-card{padding:22px;border:1px solid #bcd0c5;border-radius:20px;background:#fffdf7}.poster-admin-card h2{margin:0 0 8px;font-family:'Yu Mincho',serif;font-size:23px;color:#234d40}.poster-upload{display:block;margin:20px 0;padding:16px;background:#edf4ee;border-radius:14px}.poster-upload strong{display:block;margin-bottom:8px}.poster-upload input{width:100%;font:inherit;font-size:16px}.poster-upload small{display:block;margin-top:9px;line-height:1.6;font-size:14px}.poster-admin-image{width:100%;height:200px;object-fit:contain;background:#f0ede4;border-radius:12px}.poster-admin-step{font-size:16px;font-weight:bold;color:#2b5546;margin:20px 0 10px}.mock-primary:disabled{opacity:.45;cursor:default}.preview-note button{display:inline-block;border:1px solid #ad9147;border-radius:8px;padding:5px 9px;margin:5px 4px;background:#fffdf5;color:#5e4c23;font:inherit;cursor:pointer}.admin-feedback{font-size:15px;color:#28513f;line-height:1.6;margin:0;text-align:center;padding:0 12px}.admin-error{color:#9b3c2f;font-size:16px;line-height:1.6}.poster-scroll.is-zoomed .poster-large{width:var(--poster-original-width,904px)}`;
const admin=`<main class="mock-shell mock-view" id="poster-admin" hidden><button class="mock-back" data-go="events">← イベントの表示を見る</button><header class="mock-heading"><h1 tabindex="-1">ポスターを差し替える</h1></header><section class="poster-admin-card"><p class="mock-subtle">管理画面の未公開見本</p><h2>9/26 指導碁＆定例会</h2><p class="event-place">13:00 · 囲碁サロン湘南</p><p class="mock-subtle">画像を選び、表示を確認してから差し替えます。この見本では本番に保存されず、ページを読み直すと元に戻ります。</p><label class="poster-upload"><strong>1. 画像を選ぶ</strong><input type="file" id="poster-file" accept="image/jpeg,image/png,image/webp"><small>JPEG・PNG・WebP、10MBまで。スマートフォンの写真からも選べます。</small></label><p id="poster-error" class="admin-error" role="alert"></p><p class="poster-admin-step">2. 選んだ画像を確認する</p><img class="poster-admin-image" id="pending-image" src="poster-sample.jpg" alt="現在の表示確認用画像"><p class="mock-subtle" id="pending-name" aria-live="polite">現在は「囲碁の時間」の表示確認用画像です。</p><button type="button" class="mock-primary" id="apply-poster" disabled>3. 見本に反映して確認する</button><p class="mock-subtle">画像を選ぶだけでは、イベントの表示は変わりません。</p></section></main>`;
const logic=`
let activePosterUrl=null,pendingPoster=null,choiceNumber=0;
const picker=document.getElementById('poster-file'),applyPoster=document.getElementById('apply-poster'),posterError=document.getElementById('poster-error');
picker.addEventListener('change',async()=>{
 const version=++choiceNumber;
 if(pendingPoster&&pendingPoster.url!==activePosterUrl)URL.revokeObjectURL(pendingPoster.url);
 pendingPoster=null;applyPoster.disabled=true;posterError.textContent='';
 const file=picker.files[0];if(!file)return;
 const fail=message=>{posterError.textContent=message;document.getElementById('pending-image').src=activePosterUrl||'poster-sample.jpg';document.getElementById('pending-name').textContent='画像は反映していません。別の画像を選んでください。';};
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)){fail('JPEG・PNG・WebPの画像を選んでください。');return;}
 if(file.size>10*1024*1024){fail('10MB以下の画像を選んでください。');return;}
 const url=URL.createObjectURL(file),probe=new Image();
 document.getElementById('pending-name').textContent='画像を確認しています…';
 try{probe.src=url;await probe.decode();if(version!==choiceNumber){URL.revokeObjectURL(url);return;}if(!probe.naturalWidth||!probe.naturalHeight)throw Error('empty');
 pendingPoster={url,width:probe.naturalWidth,height:probe.naturalHeight};document.getElementById('pending-image').src=url;document.getElementById('pending-name').textContent=file.name+' · '+probe.naturalWidth+' × '+probe.naturalHeight;applyPoster.disabled=false;
 }catch(e){URL.revokeObjectURL(url);if(version===choiceNumber)fail('画像を読み込めませんでした。別の画像を選んでください。');}
});
applyPoster.addEventListener('click',()=>{
 if(!pendingPoster)return;const old=activePosterUrl;activePosterUrl=pendingPoster.url;
 document.querySelectorAll('.poster-thumb,.poster-large').forEach(img=>{img.src=activePosterUrl;img.width=pendingPoster.width;img.height=pendingPoster.height;img.alt='見本で選んだポスター画像';});
 document.documentElement.style.setProperty('--poster-original-width',Math.max(904,Math.min(2400,pendingPoster.width))+'px');
 if(old&&old!==activePosterUrl)URL.revokeObjectURL(old);
 document.querySelector('.poster-source-note').textContent='この画像は見本内だけの差し替えです。本番には保存されていません。';
 document.getElementById('admin-feedback').textContent='選んだ画像を見本に反映しました。本番には保存していません。';
 applyPoster.disabled=true;show('events');
});
show('poster-admin');`;
new vm.Script(logic);
if(/fetch\(|localStorage|sessionStorage|XMLHttpRequest|sendBeacon|\.cookie/.test(logic))throw Error('No server or persistent storage in preview');
html=html.replace('<title>イベント申込・未公開見本</title>','<title>ポスター差し替え・管理側の未公開見本</title>').replace('</head>',`<style>${style}</style></head>`).replace('未公開の見本 · 申込みは送信されません</p>','未公開の見本 · 本番には保存されません<br><button data-go="poster-admin">管理側の見本</button><button data-go="events">参加者側の見本</button></p><p id="admin-feedback" class="admin-feedback" role="status"></p>').replace('<script>',admin+'<script>').replace("new Set(['home','events','apply','confirm','complete'])","new Set(['home','events','apply','confirm','complete','poster-admin'])").replace('</script>',logic+'</script>');
writeFileSync(new URL('poster-admin.html',import.meta.url),html);console.log('Built separate local-only poster replacement preview. Participant approved preview unchanged.');
