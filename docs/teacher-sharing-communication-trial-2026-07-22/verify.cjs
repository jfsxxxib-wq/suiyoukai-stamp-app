const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const client = fs.readFileSync(path.join(root, "trial.js"), "utf8");
const server = fs.readFileSync(path.join(root, "apps-script", "Code.gs"), "utf8");
const combinedCode = `${html}\n${client}\n${server}`;

const checks = [
  ["Apps Script URL is not hard-coded", !/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]{20,}/.test(combinedCode)],
  ["client does not use no-cors", !/mode\s*:\s*["']no-cors["']/.test(client)],
  ["client does not use localStorage", !/localStorage/.test(client)],
  ["client rejects endpoint query strings", /parsed\.search/.test(client)],
  ["both Content-Types are present", /application\/json/.test(client) && /text\/plain;charset=UTF-8/.test(client)],
  ["both sends use the same payload function", (client.match(/body:\s*payloadText\(\)/g) || []).length === 1],
  ["same recordId resend control exists", /id="resend-same"/.test(html) && /resend-same/.test(client)],
  ["safe HTTP metadata fields exist", /detail-http/.test(html) && /detail-response-type/.test(html) && /detail-response-url/.test(html)],
  ["final response URL removes query and hash", /parsed\.origin/.test(client) && /parsed\.pathname/.test(client)],
  ["raw response body is not displayed", !/response\.text\(\)/.test(client)],
  ["server parses e.postData.contents", /e\.postData\.contents/.test(server) && /JSON\.parse\(raw\)/.test(server)],
  ["server returns accepted", /result:\s*["']accepted["']/.test(server)],
  ["storage is test namespace only", /teacherSharingTimeoutTrial20260723:/.test(server) && /pages-gas-trial-/.test(server)],
  ["storedCount filters current namespace", /countRecords_/.test(server) && /startsWith\(prefix\)/.test(server)],
  ["deletion requires preview and token", /prepareConfiguredTrialDeletion/.test(server) && /CLEANUP_CONFIRMATION_TOKEN/.test(server)],
  ["no production identifiers in dummy payload", !/(receptionCode|teacherId|displayName|participantName)/.test(client)]
];

const failed = checks.filter(([, passed]) => !passed);
checks.forEach(([label, passed]) => console.log(`${passed ? "OK" : "NG"}  ${label}`));
if (failed.length) process.exitCode = 1;
