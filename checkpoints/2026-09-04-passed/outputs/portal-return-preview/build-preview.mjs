import {readFileSync,writeFileSync} from 'node:fs';
const source=readFileSync('work/flower-production-20260904/index.html','utf8');
const css=`
    <style>
      .info-dock { grid-template-rows:auto auto 1fr; }
      .info-dock.is-collapsed { transform:rotate(-0.5deg); }
      .portal-return-link { display:flex; align-items:center; justify-content:center; gap:10px; min-height:48px; box-sizing:border-box; margin:10px 0 0; padding:12px 16px; border:1px solid #87a294; border-radius:12px; background:#fffdf5; color:#285b4c; font-size:16px; font-weight:700; line-height:1.5; text-decoration:none; box-shadow:0 3px 10px #244d3810; }
      .portal-return-link:hover { background:#edf4ed; }
      .portal-return-link:focus-visible { outline:3px solid #285b4c; outline-offset:3px; }
    </style>
`;
const button=`        <a class="portal-return-link" href="https://suiyoukai-portal.c84s4n967v.chatgpt.site" target="_self" rel="noreferrer"><span aria-hidden="true">←</span> 水曜会ポータルへ戻る</a>\n\n`;
const html=source.replace('  </head>',css+'  </head>').replace('        <section class="info-panel"',button+'        <section class="info-panel"');
if(html===source||!html.includes('class="portal-return-link"'))throw Error('Insertion failed');
writeFileSync('outputs/portal-return-preview/index.html',html);
console.log('Created isolated preview only; app source unchanged.');
