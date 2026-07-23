"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(
  path.join(__dirname, "teacher-sharing-browser-communication-trial-2026-07-22.html"),
  "utf8"
);
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const client = scripts.at(-1)[1];

function element(value = "") {
  const listeners = new Map();
  return {
    value,
    textContent: "",
    disabled: false,
    dataset: {},
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    dispatch(type) {
      return listeners.get(type)?.();
    }
  };
}

function makeTrial(fetchImpl, fastTimeout = false) {
  const ids = [
    "endpoint", "send-button", "payload-preview", "status", "status-title",
    "status-message", "raw-response", "http-status", "content-type",
    "json-status", "result-value", "record-id-value", "stored-value",
    "duplicate-value", "stored-count-value"
  ];
  const elements = Object.fromEntries(ids.map((id) => [id, element()]));
  elements.endpoint.value = "https://script.google.com/macros/s/trial-only-id/exec";

  const context = vm.createContext({
    URL,
    JSON,
    Object,
    Date,
    Number,
    Error,
    AbortController,
    fetch: fetchImpl,
    document: {
      querySelector(selector) {
        return elements[selector.slice(1)];
      }
    },
    window: {
      setTimeout(callback, delay) {
        return setTimeout(callback, fastTimeout && delay === 15000 ? 10 : delay);
      },
      clearTimeout
    }
  });
  vm.runInContext(client, context);
  return {
    elements,
    click: () => elements["send-button"].dispatch("click")
  };
}

async function waitFor(predicate, timeoutMs = 1000) {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > timeoutMs) throw new Error("判定待ちが時間切れになりました。");
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

(async () => {
  {
    let count = 0;
    const trial = makeTrial(async () => {
      count += 1;
      throw new TypeError("simulated network failure");
    });
    await trial.click();
    await waitFor(() => trial.elements["status-title"].textContent === "通信失敗");
    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.equal(count, 1, "通信失敗後に自動再送されました。");
    console.log("OK  通信失敗時は送信1回、自動再送0回");
  }

  {
    let count = 0;
    const trial = makeTrial((_url, options) => {
      count += 1;
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener("abort", () => {
          const error = new Error("aborted");
          error.name = "AbortError";
          reject(error);
        });
      });
    }, true);
    await trial.click();
    await waitFor(() => trial.elements["status-title"].textContent === "15秒でタイムアウト");
    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.equal(count, 1, "タイムアウト後に自動再送されました。");
    console.log("OK  タイムアウト時は送信1回、自動再送0回");
  }

  {
    let count = 0;
    let finish;
    const responsePromise = new Promise((resolve) => { finish = resolve; });
    const trial = makeTrial(() => {
      count += 1;
      return responsePromise;
    });
    const clicks = [trial.click(), trial.click(), trial.click(), trial.click(), trial.click()];
    assert.equal(count, 1, "連続操作で複数回送信されました。");
    assert.equal(trial.elements["send-button"].disabled, true, "送信中にボタンが無効化されていません。");

    finish({
      ok: true,
      status: 200,
      statusText: "OK",
      type: "cors",
      redirected: false,
      url: "https://trial.invalid/endpoint",
      headers: { get: () => "application/json; charset=utf-8" },
      text: async () => JSON.stringify({
        result: "accepted",
        recordId: "trial-record-003",
        stored: true,
        duplicate: false,
        storedCount: 1
      })
    });
    await Promise.all(clicks);
    await waitFor(() => trial.elements["status-title"].textContent === "正常保存");
    assert.equal(count, 1, "応答完了までに複数回送信されました。");
    assert.equal(trial.elements["send-button"].disabled, false, "完了後にボタンが戻っていません。");
    console.log("OK  送信ボタンを5回連続操作しても送信は1回だけ");
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
