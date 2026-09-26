(() => {
  const portalOrigin = 'https://suiyoukai-portal.c84s4n967v.chatgpt.site';
  const fragmentPrefix = '#flower-admin=';
  const storageKey = 'suiyoukai-flower-admin-tab-ticket-v1';
  let authorizedUntil = 0;
  let expiryTimer;

  const isAuthorized = () => authorizedUntil > Date.now();
  Object.defineProperty(window, 'FlowerAdminAccess', {
    configurable: false,
    writable: false,
    value: Object.freeze({ isAuthorized, ticket: () => isAuthorized() ? ticket : '' }),
  });

  const clearStoredTicket = () => {
    try { sessionStorage.removeItem(storageKey); } catch { /* Storage can be unavailable. */ }
  };
  const announce = () => window.dispatchEvent(new Event('flower-admin-access-change'));
  const showFailure = () => {
    const tabs = document.querySelector('.info-tabs');
    if (!tabs || document.querySelector('[data-flower-admin-access-note]')) return;
    const note = document.createElement('p');
    note.dataset.flowerAdminAccessNote = '';
    note.setAttribute('role', 'status');
    note.textContent = '管理者の確認ができませんでした。水曜会ポータルの管理者画面から開き直してください。';
    note.style.cssText = 'margin:10px 0;padding:10px 12px;border-radius:12px;background:#fff2ed;color:#794c40;font-size:13px;line-height:1.5';
    tabs.after(note);
  };

  let ticket = '';
  let attempted = false;
  if (window.location.hash.startsWith(fragmentPrefix)) {
    attempted = true;
    try { ticket = decodeURIComponent(window.location.hash.slice(fragmentPrefix.length)); } catch { /* Invalid ticket. */ }
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  } else {
    try { ticket = sessionStorage.getItem(storageKey) || ''; } catch { /* Storage can be unavailable. */ }
  }
  if (!ticket || !/^[A-Za-z0-9_-]{40,400}\.[0-9a-f]{64}$/.test(ticket)) {
    clearStoredTicket();
    if (attempted) showFailure();
    return;
  }

  fetch(`${portalOrigin}/api/flower/admin-tab-session`, {
    method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticket }),
  }).then(async (response) => {
    if (!response.ok) throw new Error('admin_confirmation_required');
    const result = await response.json();
    // The portal has already verified its signed expiry. A device clock can be a few
    // seconds behind the portal, so do not recheck its upper limit on the device.
    if (result.authenticated !== true || !Number.isSafeInteger(result.expiresAt)
      || result.expiresAt <= Date.now()) {
      throw new Error('admin_confirmation_required');
    }
    authorizedUntil = result.expiresAt;
    try { sessionStorage.setItem(storageKey, ticket); } catch { /* This tab remains authorized until expiry. */ }
    announce();
    expiryTimer = window.setTimeout(() => {
      authorizedUntil = 0;
      clearStoredTicket();
      announce();
    }, Math.max(0, authorizedUntil - Date.now()));
  }).catch(() => {
    window.clearTimeout(expiryTimer);
    authorizedUntil = 0;
    clearStoredTicket();
    announce();
    if (attempted) showFailure();
  });
})();
