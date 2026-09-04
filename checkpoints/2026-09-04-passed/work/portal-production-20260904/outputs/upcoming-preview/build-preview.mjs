import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../../',import.meta.url);let html=readFileSync(new URL('portal.html',root),'utf8');
const button='<button class="schedule-toggle" type="button" data-schedule-toggle aria-expanded="false">今月の日程を確認 <span>⌄</span></button>';
if(!html.includes(button))throw Error('Expected schedule button missing');
html=html.replace(button,'<button class="schedule-toggle" type="button" data-schedule-toggle>今後の日程を見る <span>›</span></button>');
const old="if(schedule){setScheduleOpen(schedule.getAttribute('aria-expanded')!=='true');return}";
if(!html.includes(old))throw Error('Expected navigation missing');
html=html.replace(old,"if(schedule){document.querySelectorAll('.view').forEach(v=>v.hidden=true);document.getElementById('upcoming-schedule').hidden=false;window.scrollTo(0,0);return}");
const view=`
  <div class="site-shell view" id="upcoming-schedule" hidden><section class="schedule-page">
    <button class="ui-button ghost back-button" type="button" data-go="home">← ポータルへ戻る</button>
    <header class="schedule-page-heading"><p class="eyebrow">水曜会の予定</p><h1>今後の日程</h1><p>2026年9月</p></header>
    <div class="schedule-cards">
      <article class="schedule-event"><header><time datetime="2026-09-23T12:30:00+09:00">9月23日<span>（水）</span></time><strong>12:30 開始</strong></header><div class="schedule-event-copy"><h2>交流戦</h2><p class="schedule-venue"><span>会場</span>三鷹洪道場</p></div></article>
      <article class="schedule-event"><header><time datetime="2026-09-26T13:00:00+09:00">9月26日<span>（土）</span></time><strong>13:00 開始</strong></header><div class="schedule-event-copy"><h2>指導碁＆定例会</h2><p class="schedule-teacher">常石隆志六段</p><p class="schedule-venue"><span>会場</span>囲碁サロン湘南</p></div></article>
    </div>
    <button class="ui-button schedule-back" type="button" data-go="home">← ポータルへ戻る</button>
  </section></div>
`;
const marker='  <div class="site-shell view" id="meeting-admin"';if(!html.includes(marker))throw Error('Expected view insertion missing');html=html.replace(marker,view+'\n'+marker);
const css=`<style>
.schedule-page{max-width:620px;margin:0 auto;padding:12px 0 30px}.schedule-page-heading{margin:20px 0 26px}.schedule-page-heading h1{margin:7px 0 10px;font-size:clamp(30px,6vw,38px);font-weight:500;color:#254c43}.schedule-page-heading>p:last-child{font-size:16px;color:#60796d;margin:0}.schedule-cards{display:grid;gap:20px}.schedule-event{overflow:hidden;border:1px solid #c7d5ca;border-radius:22px;background:#fffdf7;box-shadow:0 8px 22px #31573c0a}.schedule-event header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px;background:#e8f0e8;color:#255e50}.schedule-event time{font-size:27px;font-weight:700;white-space:nowrap}.schedule-event time span{font-size:17px}.schedule-event header>strong{font-size:17px;white-space:nowrap}.schedule-event-copy{padding:23px 22px 25px}.schedule-event h2{font-size:25px;margin:0 0 15px;color:#254c43}.schedule-teacher{font-size:19px;margin:0 0 20px;color:#345c50}.schedule-venue{font-size:18px;margin:0;line-height:1.8;overflow-wrap:anywhere}.schedule-venue span{display:block;color:#718277;font-size:14px;margin-bottom:3px}.schedule-back{width:100%;margin-top:28px;min-height:54px;font-size:17px}@media(max-width:370px){.schedule-event header{align-items:flex-start;flex-direction:column;gap:7px}.schedule-event time{font-size:26px}}
</style>`;
html=html.replace('</head>',css+'</head>');
writeFileSync(new URL('index.html',import.meta.url),html);console.log('Local schedule preview prepared with two supplied events. Production unchanged.');
