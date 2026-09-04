(() => {
  'use strict';
  const portal = 'https://suiyoukai-portal.c84s4n967v.chatgpt.site';
  const tokenKey = 'suiyoukai-gate-device-v1';
  const pendingKey = 'suiyoukai-gate-pending-v1';
  const app = window.suiyoukaiLinkage;
  if (!app) return;
  const ticket = new URLSearchParams(location.hash.slice(1)).get('gate-ticket');
  let participant = null;
  let pending = null;
  let status = 'checking';
  const random = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
  function publish() {
    window.suiyoukaiGate = Object.freeze({status, participant, portal});
    window.dispatchEvent(new Event('suiyoukai-gate-change'));
  }
  async function call(path, body, token) {
    const response = await fetch(portal + path, {
      method: body ? 'POST' : 'GET', mode: 'cors', credentials: 'omit', cache: 'no-store',
      headers: {...(body ? {'Content-Type':'application/json'} : {}), ...(token ? {Authorization:'Bearer '+token} : {})},
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(35000)
    });
    const data = await response.json();
    if (!response.ok) { const error = new Error(data.error || '登録の確認ができませんでした。'); error.status=response.status; throw error; }
    return data;
  }
  function message(text, retry) {
    let node = document.querySelector('[data-gate-message]');
    if (!node) {
      node = document.createElement('div');node.dataset.gateMessage='';node.setAttribute('role','status');
      node.style.cssText='position:fixed;left:12px;right:12px;top:12px;z-index:2000;padding:16px;background:#fffaf0;color:#315f4e;border:2px solid #90b39f;border-radius:16px;box-shadow:0 3px 14px #0002;font-size:16px;';
      document.body.append(node);
    }
    node.replaceChildren(document.createTextNode(text));
    if (retry) {const button=document.createElement('button');button.type='button';button.textContent='再確認';button.style.marginLeft='12px';button.addEventListener('click',start);node.append(button);}
    const link=document.createElement('a');link.href=portal;link.textContent='水曜会の入口へ';link.style.marginLeft='12px';node.append(link);
  }
  try {
    pending=JSON.parse(sessionStorage.getItem(pendingKey)||'null');
    if (ticket && /^[a-f0-9]{64}$/.test(ticket)) {
      if (pending?.ticket!==ticket)pending={ticket,deviceKey:random()};
      sessionStorage.setItem(pendingKey,JSON.stringify(pending));
      history.replaceState(null,'',location.pathname+location.search);
    }
  } catch {
    if(ticket){history.replaceState(null,'',location.pathname+location.search);message('このブラウザに登録情報を保存できません。通常のSafariまたはChromeで開いてください。',false);}
  }
  async function start() {
    status='checking';publish();
    try {
      let data;
      if(pending?.ticket) {
        message('サイトの登録を確認しています…',false);
        data=await call('/api/flower/redeem',{...pending,appNumber:app.getAppNumber()});
        localStorage.setItem(tokenKey,data.token);
        sessionStorage.removeItem(pendingKey);pending=null;
        // Open the existing catalog; no stamp, flower or game record is modified.
        document.querySelector('[data-panel="field-guide"]')?.click();
      } else {
        const token=localStorage.getItem(tokenKey);
        if(!token){status='unregistered';publish();return;}
        data=await call('/api/flower/session',undefined,token);
      }
      participant=data.participant;status=participant.synced?'registered':'pending';publish();
      if(participant.synced)document.querySelector('[data-gate-message]')?.remove();
      else message('お名前は保存されています。台帳との接続を再確認してください。',true);
    } catch(error) {
      status=error.status===401?'unregistered':'unavailable';publish();
      if(pending)message(error.message==='Failed to fetch'?'通信を確認して、再確認を押してください。':error.message,true);
    }
  }
  start();
})();
