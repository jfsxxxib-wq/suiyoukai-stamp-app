/* oxlint-disable typescript/no-require-imports -- This standalone test intentionally uses CommonJS. */
const assert = require('node:assert/strict');
const { randomBytes, randomUUID } = require('node:crypto');

const baseUrl = process.env.RECEPTION_BASE_URL || 'http://localhost:3000';
const sheetUrl = process.env.MOCK_SHEET_URL || 'http://127.0.0.1:43192';

async function receptionPost(body) {
  const response = await fetch(`${baseUrl}/api/reception`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { response, result: await response.json() };
}

async function sheetRows() {
  const response = await fetch(`${sheetUrl}/rows`);
  return (await response.json()).rows;
}

async function run() {
  await fetch(`${sheetUrl}/reset`, { method: 'POST' });

  const makeResumeToken = () => randomBytes(32).toString('base64url');
  // Local D1 state is intentionally preserved between checks. Use a fresh name
  // for each run so rerunning this isolated test never depends on deleting data.
  const runId = Date.now().toString(36);
  const givenName = `花子${runId}`;

  const firstRequest = {
    action: 'start',
    familyName: '水曜',
    givenName,
    clientRequestId: randomUUID(),
    resumeToken: makeResumeToken(),
  };
  const first = await receptionPost(firstRequest);
  assert.equal(first.response.status, 201);
  assert.match(first.result.reception.receptionCode, /^20260902-\d{3}$/);
  assert.equal((await sheetRows()).length, 1);
  assert.equal((await sheetRows())[0].displayName, `水曜 ${givenName}`);

  const repeated = await receptionPost(firstRequest);
  assert.equal(repeated.response.status, 200);
  assert.equal(repeated.result.reception.receptionCode, first.result.reception.receptionCode);
  assert.equal((await sheetRows()).length, 1, '同じ保存操作は受付帳へ1行だけ保存される');

  const repeatedName = await receptionPost({
    action: 'start',
    familyName: '水曜',
    givenName,
    clientRequestId: randomUUID(),
    resumeToken: makeResumeToken(),
  });
  assert.equal(repeatedName.response.status, 409, '別の保存操作でも同じ姓名は二重登録しない');
  assert.equal((await sheetRows()).length, 1, '同じ姓名は受付帳へ追加しない');

  const surnameOnly = await receptionPost({
    action: 'start',
    familyName: '水曜',
    givenName: '',
    clientRequestId: randomUUID(),
    resumeToken: makeResumeToken(),
  });
  assert.equal(surnameOnly.response.status, 400, '名字だけでは受付番号を発行しない');
  assert.equal((await sheetRows()).length, 1);

  const beforeQr = await fetch(`${baseUrl}/api/reception?token=${firstRequest.resumeToken}`);
  assert.equal(beforeQr.status, 200);
  assert.equal((await beforeQr.json()).reception.status, 'in_progress');

  const completed = await receptionPost({ action: 'complete', token: firstRequest.resumeToken });
  assert.equal(completed.response.status, 200);
  assert.equal(completed.result.reception.status, 'complete');

  const completedAgain = await receptionPost({ action: 'complete', token: firstRequest.resumeToken });
  assert.equal(completedAgain.response.status, 200, '共通参加QRをもう一度読んでも失敗しない');
  assert.equal(completedAgain.result.reception.status, 'complete');
  assert.equal((await sheetRows()).length, 1, '共通参加QRの二重読取でも受付帳は1行のまま');

  const failedRequest = {
    action: 'start',
    familyName: '保存',
    givenName: '失敗確認',
    clientRequestId: randomUUID(),
    resumeToken: makeResumeToken(),
  };
  const failed = await receptionPost(failedRequest);
  assert.equal(failed.response.status, 502);
  assert.equal((await sheetRows()).length, 1);
  const failedLookup = await fetch(`${baseUrl}/api/reception?token=${failedRequest.resumeToken}`);
  assert.equal(failedLookup.status, 404, '保存失敗した受付は完了・受付途中のどちらにも残さない');

  process.stdout.write(JSON.stringify({
    ok: true,
    receptionCode: first.result.reception.receptionCode,
    checks: ['姓名の両方を保存', '名字だけは拒否', '受付番号発行', '同じ保存操作は一度だけ保存', '別の保存操作でも同じ姓名を拒否', '共通参加QRで完了', '参加QRの二重読取防止', '保存失敗時は未完了'],
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
