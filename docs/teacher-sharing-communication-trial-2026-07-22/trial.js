(() => {
  "use strict";

  const DATASETS = Object.freeze({
    normal: Object.freeze({
      schemaVersion: 1,
      testRunId: "pages-gas-trial-20260722-A",
      requestId: "request-001",
      recordId: "trial-record-001",
      deviceId: "trial-device-desktop",
      sentAt: "2026-07-22T10:00:00+09:00"
    }),
    delay: Object.freeze({
      schemaVersion: 1,
      testRunId: "pages-gas-trial-20260722-A",
      requestId: "request-delay-001",
      recordId: "trial-record-delay-001",
      deviceId: "trial-device-desktop",
      sentAt: "2026-07-22T10:05:00+09:00"
    })
  });

  const ALLOWED_RESULTS = new Set(["accepted", "invalid_request", "temporary_error"]);
  const endpointInput = document.querySelector("#endpoint");
  const payloadView = document.querySelector("#payload");
  const resultBox = document.querySelector("#result");
  const resultTitle = document.querySelector("#result-title");
  const resultMessage = document.querySelector("#result-message");
  const resultDetails = document.querySelector("#result-details");
  const jsonResult = document.querySelector("#json-result");
  const buttons = [...document.querySelectorAll("button")];
  let selectedDataset = "normal";
  let lastContentType = "application/json";

  function payloadText() {
    return JSON.stringify(DATASETS[selectedDataset], null, 2);
  }

  function renderPayload() {
    payloadView.textContent = payloadText();
  }

  function safeEndpoint() {
    const raw = endpointInput.value.trim();
    let parsed;
    try {
      parsed = new URL(raw);
    } catch {
      throw new Error("endpoint");
    }
    if (parsed.protocol !== "https:" || parsed.search || parsed.hash) {
      throw new Error("endpoint");
    }
    return parsed.toString();
  }

  function setBusy(busy) {
    buttons.forEach((button) => { button.disabled = busy; });
    endpointInput.disabled = busy;
  }

  function showState(kind, title, message) {
    resultBox.className = `result is-${kind}`;
    resultBox.querySelector(".result-mark").textContent = kind === "success" ? "✓" : kind === "error" ? "!" : "○";
    resultTitle.textContent = title;
    resultMessage.textContent = message;
    if (kind !== "success") {
      resultDetails.hidden = true;
      jsonResult.hidden = true;
    }
  }

  function safeResponseUrl(value) {
    try {
      const parsed = new URL(value);
      return `${parsed.origin}${parsed.pathname}`;
    } catch {
      return "確認できません";
    }
  }

  function showAccepted(data, response) {
    const allowedJson = {
      result: data.result,
      recordId: data.recordId,
      stored: data.stored,
      duplicate: data.duplicate,
      storedCount: data.storedCount
    };
    document.querySelector("#detail-http").textContent = `${response.status} ${response.statusText || "OK"}`;
    document.querySelector("#detail-response-type").textContent = response.type;
    document.querySelector("#detail-result").textContent = data.result;
    document.querySelector("#detail-stored").textContent = data.stored ? "はい" : "いいえ";
    document.querySelector("#detail-duplicate").textContent = data.duplicate ? "あり" : "なし";
    document.querySelector("#detail-count").textContent = String(data.storedCount);
    document.querySelector("#detail-redirected").textContent = response.redirected ? "あり" : "なし";
    document.querySelector("#detail-response-url").textContent = safeResponseUrl(response.url);
    document.querySelector("#detail-json").textContent = JSON.stringify(allowedJson, null, 2);
    resultDetails.hidden = false;
    showState("success", "返却JSONを読み取れました", "許可された結果項目だけを表示しています。");
    resultDetails.hidden = false;
    jsonResult.hidden = false;
  }

  function validateResponse(data) {
    if (!data || typeof data !== "object" || !ALLOWED_RESULTS.has(data.result)) return false;
    if (data.result !== "accepted") return true;
    return typeof data.recordId === "string"
      && typeof data.stored === "boolean"
      && typeof data.duplicate === "boolean"
      && Number.isInteger(data.storedCount)
      && data.storedCount >= 0;
  }

  async function send(contentType, abortEarly = false) {
    lastContentType = contentType;
    let endpoint;
    try {
      endpoint = safeEndpoint();
    } catch {
      showState("error", "試験用URLを確認してください", "HTTPSのデプロイURLを、クエリ文字列なしで入力してください。");
      return;
    }

    if (abortEarly && selectedDataset !== "delay") {
      showState("error", "応答遅延試験を選んでください", "ダミーデータを「応答遅延試験」に切り替えてから実行します。");
      return;
    }

    setBusy(true);
    showState("idle", "送信しています", "試験用のダミー記録だけを送信しています。");
    const controller = new AbortController();
    const timeoutId = abortEarly ? window.setTimeout(() => controller.abort(), 700) : null;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": contentType },
        body: payloadText(),
        signal: controller.signal,
        redirect: "follow",
        cache: "no-store",
        credentials: "omit"
      });
      if (!response.ok || response.type === "opaque") throw new Error("network");
      const data = await response.json();
      if (!validateResponse(data)) throw new Error("response");
      if (data.result === "accepted") {
        showAccepted(data, response);
      } else {
        showState("error", "試験受付が完了しませんでした", "入力形式または一時的な通信状態を確認してください。");
      }
    } catch (error) {
      if (abortEarly && error && error.name === "AbortError") {
        showState("idle", "応答を受け取りませんでした", "保存結果は未確定です。同じrecordIdを再送して確認します。");
      } else {
        showState("error", "通信結果を確認できませんでした", "CORS、接続状態、または試験用デプロイの設定を確認してください。");
      }
    } finally {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      setBusy(false);
    }
  }

  document.querySelectorAll("[data-dataset]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedDataset = button.dataset.dataset;
      document.querySelectorAll("[data-dataset]").forEach((item) => item.classList.toggle("is-selected", item === button));
      renderPayload();
      showState("idle", "ダミーデータを切り替えました", "二つの方式は、表示中の同じJSON文字列を送信します。");
    });
  });

  document.querySelector("#send-json").addEventListener("click", () => send("application/json"));
  document.querySelector("#send-text").addEventListener("click", () => send("text/plain;charset=UTF-8"));
  document.querySelector("#resend-same").addEventListener("click", () => send(lastContentType));
  document.querySelector("#send-abort").addEventListener("click", () => send("text/plain;charset=UTF-8", true));
  renderPayload();
})();
