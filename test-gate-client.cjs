const vm = require("node:vm");
const fs = require("node:fs");
const assert = require("node:assert/strict");

const code = fs.readFileSync(`${__dirname}/gate-client.js`, "utf8");
const html = fs.readFileSync(`${__dirname}/index.html`, "utf8");
assert.match(html, /gate-client\.js\?v=20260917-notice-01/);
const waitForStart = () => new Promise((resolve) => setTimeout(resolve, 30));
const storage = (map) => ({
  getItem: (key) => map.get(key) || null,
  setItem: (key, value) => map.set(key, value),
  removeItem: (key) => map.delete(key),
});

const runGateClient = async ({
  hash = "",
  token = "",
  staleNotice = false,
  fetchImpl,
} = {}) => {
  const localData = new Map([
    ["suiyoukai-stamp-progress-v1", '{"stamps":{"participationCount":7}}'],
    ["suiyoukai-game-records-v1", '[{"date":"2026-09-02","teacher":"existing"}]'],
  ]);
  if (token) localData.set("suiyoukai-gate-device-v1", token);

  let opened = 0;
  let hashRemoved = false;
  let gateMessage = null;
  let latestMessage = null;

  const element = (tag = "div") => ({
    tag,
    dataset: {},
    style: {},
    children: [],
    removed: false,
    setAttribute() {},
    addEventListener(type, listener) {
      if (type === "click") this.click = listener;
    },
    append(...items) {
      this.children.push(...items);
    },
    replaceChildren(...items) {
      this.children = [...items];
      latestMessage = items[0] || null;
    },
    remove() {
      this.removed = true;
      if (gateMessage === this) gateMessage = null;
    },
  });

  if (staleNotice) {
    gateMessage = element();
    gateMessage.replaceChildren("古いお知らせ");
  }

  const window = {
    suiyoukaiLinkage: { getAppNumber: () => "12345678" },
    dispatchEvent() {},
  };
  const document = {
    querySelector(selector) {
      if (selector === '[data-panel="field-guide"]') return { click: () => opened++ };
      if (selector === "[data-gate-message]") return gateMessage;
      return null;
    },
    createElement(tag) {
      return element(tag);
    },
    createTextNode(text) {
      return text;
    },
    body: {
      append(node) {
        gateMessage = node;
      },
    },
  };

  const context = {
    window,
    location: { hash, pathname: "/suiyoukai-stamp-app/", search: "" },
    history: { replaceState() { hashRemoved = true; } },
    sessionStorage: storage(new Map()),
    localStorage: storage(localData),
    crypto: require("node:crypto").webcrypto,
    URLSearchParams,
    AbortSignal,
    Event,
    document,
    fetch: fetchImpl,
  };

  vm.runInNewContext(code, context);
  await waitForStart();
  return { window, localData, getGateMessage: () => gateMessage, latestMessage, opened, hashRemoved };
};

(async () => {
  const ticket = "a".repeat(64);
  const redeemed = await runGateClient({
    hash: `#gate-ticket=${ticket}`,
    fetchImpl: async (url, options) => {
      assert.match(url, /\/api\/flower\/redeem$/);
      assert.equal(JSON.parse(options.body).appNumber, "12345678");
      assert.equal(options.credentials, "omit");
      return Response.json({
        token: "b".repeat(64),
        participant: {
          participantNumber: "87654321",
          familyName: "接続",
          givenName: "確認",
          synced: false,
        },
      });
    },
  });
  assert.equal(redeemed.hashRemoved, true);
  assert.equal(redeemed.opened, 1);
  assert.equal(redeemed.window.suiyoukaiGate.status, "registered");
  assert.equal(redeemed.getGateMessage(), null);
  assert.equal(redeemed.localData.get("suiyoukai-gate-device-v1"), "b".repeat(64));
  assert.equal(redeemed.localData.get("suiyoukai-stamp-progress-v1"), '{"stamps":{"participationCount":7}}');
  assert.equal(redeemed.localData.get("suiyoukai-game-records-v1"), '[{"date":"2026-09-02","teacher":"existing"}]');

  const session = await runGateClient({
    token: "c".repeat(64),
    staleNotice: true,
    fetchImpl: async (url, options) => {
      assert.match(url, /\/api\/flower\/session$/);
      assert.equal(options.headers.Authorization, `Bearer ${"c".repeat(64)}`);
      return Response.json({ participant: { participantNumber: "87654321", synced: false } });
    },
  });
  assert.equal(session.window.suiyoukaiGate.status, "registered");
  assert.equal(session.getGateMessage(), null);

  const unavailable = await runGateClient({
    token: "d".repeat(64),
    fetchImpl: async () => {
      throw new TypeError("Failed to fetch");
    },
  });
  assert.equal(unavailable.window.suiyoukaiGate.status, "unavailable");
  assert.equal(unavailable.latestMessage, "通信を確認して、再確認を押してください。");
  assert.equal(
    unavailable.getGateMessage().children.some((child) => child?.tag === "button" && child.textContent === "再確認"),
    true,
  );

  const noToken = await runGateClient({
    staleNotice: true,
    fetchImpl: async () => assert.fail("トークンなしでは通信しません"),
  });
  assert.equal(noToken.window.suiyoukaiGate.status, "unregistered");
  assert.equal(noToken.getGateMessage(), null);

  console.log("PASS: successful reception clears the notice even when sheet sync is pending; errors keep retry guidance; stamps and records stay unchanged.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
