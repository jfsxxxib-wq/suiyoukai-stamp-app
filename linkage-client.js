(() => {
  "use strict";

  const endpoint = "https://script.google.com/macros/s/AKfycby3K8ceNB4AGBlrIDlEuETziSfHjHPAyEH9mfztB9ILDdw2X52bC4SBm_vHNfxCW6Ir/exec";
  const ticket = new URLSearchParams(window.location.search).get("linkage_ticket") || "";
  if (!/^[A-Za-z0-9_-]{24,128}$/.test(ticket)) return;

  const app = window.suiyoukaiLinkage;
  if (!app) return;
  const receptionNumber = new URLSearchParams(window.location.search).get("reception") || "受付で発行した番号";
  const appNumber = app.getAppNumber();
  const displayName = app.getDisplayName();

  const layer = document.createElement("section");
  layer.className = "linkage-connect-layer";
  layer.setAttribute("role", "dialog");
  layer.setAttribute("aria-modal", "true");
  layer.setAttribute("aria-label", "花記録を水曜会につなぐ");
  layer.innerHTML = `
    <article class="linkage-connect-card">
      <div data-linkage-before>
        <button class="linkage-connect-back" type="button" data-linkage-cancel>← 花記録へ戻る</button>
        <div class="linkage-connect-icon" aria-hidden="true">🌸</div>
        <p class="linkage-connect-kicker">花記録アプリ・安全な接続確認</p>
        <h1>この花記録を<br>水曜会につなぎます</h1>
        <p class="linkage-connect-lead">このスマホに保存されている花やスタンプを残したまま、水曜会の受付と結びます。</p>
        <div class="linkage-connect-identity">
          <div><span>つなぐ花記録</span><strong>${escapeText(displayName)}</strong></div>
          <div><span>本日の受付番号</span><strong>${escapeText(receptionNumber)}</strong></div>
        </div>
        <div class="linkage-connect-number">
          <span>この花記録の8桁個人番号</span>
          <div class="linkage-connect-number-box"><strong>•••• ••••</strong><small>端末から自動取得</small></div>
        </div>
        <p class="linkage-connect-privacy">番号は画面のURLには載せません。1回限りの連携券を使い、安全に送ります。</p>
        <button class="linkage-connect-action" type="button" data-linkage-connect>この花記録を接続する</button>
        <button class="linkage-connect-cancel" type="button" data-linkage-cancel>今は接続しない</button>
        <p class="linkage-connect-error" data-linkage-error hidden></p>
        <p class="linkage-connect-safe"><b aria-hidden="true">♢</b><span>現在の花・スタンプ・指導碁記録は消えません。接続後も同じ花記録を使えます。</span></p>
      </div>
      <div class="linkage-connect-complete" data-linkage-complete hidden>
        <div class="linkage-connect-check" aria-hidden="true">✓</div>
        <p class="linkage-connect-kicker">接続できました</p>
        <h2>今までの花記録を<br>そのまま使えます</h2>
        <p class="linkage-connect-complete-copy" data-linkage-complete-copy>受付番号との接続が完了しました。</p>
        <button class="linkage-connect-action" type="button" data-linkage-finish>花記録へ戻る</button>
        <p class="linkage-connect-safe"><b aria-hidden="true">♢</b><span>同じ連携券はもう一度使えないため、重複して記録されません。</span></p>
      </div>
    </article>`;
  document.body.append(layer);

  const connectButton = layer.querySelector("[data-linkage-connect]");
  const errorBox = layer.querySelector("[data-linkage-error]");
  const before = layer.querySelector("[data-linkage-before]");
  const complete = layer.querySelector("[data-linkage-complete]");
  const completeCopy = layer.querySelector("[data-linkage-complete-copy]");

  layer.querySelectorAll("[data-linkage-cancel]").forEach((button) => button.addEventListener("click", closeLayer));
  layer.querySelector("[data-linkage-finish]").addEventListener("click", () => {
    closeLayer();
    app.showTodayRecord();
  });
  connectButton.addEventListener("click", connectFlowerRecord);

  async function connectFlowerRecord() {
    connectButton.disabled = true;
    connectButton.textContent = "接続しています…";
    errorBox.hidden = true;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify({
          action: "linkage_ticket_redeem",
          ticket,
          appNumber,
          displayName,
        }),
      });
      const result = await response.json();
      if (!response.ok || result.result !== "accepted") {
        throw new Error(readableError(result.code));
      }

      const stampResult = result.applyStamp
        ? app.applyParticipationStamp({ id: result.stampId, date: result.stampDate })
        : { ok: true, reason: "connection_only" };
      if (!stampResult.ok) throw new Error("受付との接続はできましたが、参加スタンプの日付を確認できませんでした。管理者へお声がけください。");

      before.hidden = true;
      complete.hidden = false;
      completeCopy.textContent = stampResult.reason === "applied"
        ? "受付番号との接続が完了し、今日の参加スタンプが入りました。"
        : stampResult.reason === "already_applied"
          ? "受付番号との接続が完了しました。今日の参加スタンプはすでに入っています。"
          : "受付番号との接続が完了しました。今までの記録はそのままです。";
      history.replaceState(null, "", `${location.pathname}${location.hash}`);
    } catch (error) {
      errorBox.textContent = error instanceof Error ? error.message : "接続できませんでした。受付で新しい連携券を発行してください。";
      errorBox.hidden = false;
      connectButton.disabled = false;
      connectButton.textContent = "もう一度接続する";
    }
  }

  function closeLayer() {
    history.replaceState(null, "", `${location.pathname}${location.hash}`);
    layer.remove();
  }

  function readableError(code) {
    if (code === "ticket_expired") return "連携券の有効時間が切れました。受付で新しい連携券を発行してください。";
    if (code === "ticket_used") return "この連携券はすでに使用されています。受付で状態を確認してください。";
    if (code === "invalid_app_number") return "この端末の8桁番号を読み取れませんでした。花記録を通常画面から一度開いてください。";
    return "接続できませんでした。受付で新しい連携券を発行してください。";
  }

  function escapeText(value) {
    return String(value || "").replace(/[&<>\"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;",
    })[character]);
  }
})();
