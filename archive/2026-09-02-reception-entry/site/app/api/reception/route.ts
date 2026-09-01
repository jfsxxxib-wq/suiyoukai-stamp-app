import { env } from 'cloudflare:workers';

type ReceptionRow = {
  reception_code: string;
  status: 'in_progress' | 'complete';
  resume_token_hash: string;
  client_request_id: string | null;
  display_name: string | null;
  created_at: number;
  updated_at: number;
};

const jsonHeaders = { 'Cache-Control': 'no-store' };
const completedRetentionMs = 7 * 24 * 60 * 60 * 1000;
const eventKey = '20260902';

async function ensureSchema() {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS receptions_20260902 (
      id TEXT PRIMARY KEY NOT NULL,
      reception_code TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL CHECK (status IN ('in_progress', 'complete')),
      resume_token_hash TEXT NOT NULL UNIQUE,
      client_request_id TEXT UNIQUE,
      display_name TEXT UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
  ).run();
  const columns = await env.DB.prepare('PRAGMA table_info(receptions_20260902)').all<{ name: string }>();
  if (!columns.results.some((column) => column.name === 'client_request_id')) {
    await env.DB.prepare('ALTER TABLE receptions_20260902 ADD COLUMN client_request_id TEXT').run();
  }
  if (!columns.results.some((column) => column.name === 'display_name')) {
    await env.DB.prepare('ALTER TABLE receptions_20260902 ADD COLUMN display_name TEXT').run();
  }
  await env.DB.prepare(
    'CREATE UNIQUE INDEX IF NOT EXISTS receptions_20260902_client_request_id_unique ON receptions_20260902 (client_request_id)',
  ).run();
  await env.DB.prepare(
    'CREATE INDEX IF NOT EXISTS receptions_20260902_status_updated_idx ON receptions_20260902 (status, updated_at)',
  ).run();
  await env.DB.prepare(
    'CREATE UNIQUE INDEX IF NOT EXISTS receptions_20260902_display_name_unique ON receptions_20260902 (display_name)',
  ).run();
  await env.DB.prepare('PRAGMA optimize').run();
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS reception_sequences_20260902 (
      event_key TEXT PRIMARY KEY NOT NULL,
      last_number INTEGER NOT NULL
    )`,
  ).run();
}

async function removeExpiredCompletedReceptions(now = Date.now()) {
  await env.DB.prepare(
    `DELETE FROM receptions_20260902
     WHERE status = 'complete' AND updated_at < ?`,
  )
    .bind(now - completedRetentionMs)
    .run();
}

async function hashResumeToken(token: string) {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function nextReceptionCode() {
  const result = await env.DB.prepare(
    `INSERT INTO reception_sequences_20260902 (event_key, last_number)
     VALUES (?, 1)
     ON CONFLICT(event_key) DO UPDATE SET last_number = last_number + 1
     RETURNING last_number`,
  )
    .bind(eventKey)
    .first<{ last_number: number }>();
  if (!result) throw new Error('reception-number-failed');
  return `${eventKey}-${result.last_number.toString().padStart(3, '0')}`;
}

function present(row: ReceptionRow, resumeToken: string) {
  return {
    receptionCode: row.reception_code,
    status: row.status,
    resumeToken,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeDisplayName(value: unknown) {
  if (typeof value !== 'string') return '';
  const visibleCharacters = Array.from(value, (character) => character.codePointAt(0) ?? 0)
    .filter((code) => code >= 32 && code !== 127)
    .map((code) => String.fromCodePoint(code))
    .join('');
  return visibleCharacters.normalize('NFKC').trim().replace(/\s+/g, ' ');
}

async function appendToReceptionSheet(row: ReceptionRow, displayName: string) {
  if (!env.SHEET_WEBAPP_URL || !env.SHEET_WRITE_SECRET) {
    throw new Error('sheet-connection-not-configured');
  }

  const response = await fetch(env.SHEET_WEBAPP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      secret: env.SHEET_WRITE_SECRET,
      receptionCode: row.reception_code,
      displayName,
      receptionAt: new Date(row.created_at).toISOString(),
      clientRequestId: row.client_request_id,
    }),
    redirect: 'follow',
  });

  if (!response.ok) throw new Error(`sheet-http-${response.status}`);
  const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (result?.error === 'duplicate_name') throw new Error('duplicate-name');
  if (!result?.ok) throw new Error('sheet-write-rejected');
}

async function findReceptionByToken(token: string) {
  const tokenHash = await hashResumeToken(token);
  return env.DB.prepare(
    `SELECT reception_code, status, resume_token_hash, client_request_id, display_name, created_at, updated_at
     FROM receptions_20260902 WHERE resume_token_hash = ? LIMIT 1`,
  )
    .bind(tokenHash)
    .first<ReceptionRow>();
}

export async function GET(request: Request) {
  await ensureSchema();
  await removeExpiredCompletedReceptions();
  const token = new URL(request.url).searchParams.get('token');
  if (!token) {
    return Response.json({ error: '再開情報がありません。' }, { status: 400, headers: jsonHeaders });
  }

  const row = await findReceptionByToken(token);
  if (!row) {
    return Response.json({ error: '保存された受付が見つかりません。' }, { status: 404, headers: jsonHeaders });
  }

  return Response.json({ reception: present(row, token) }, { headers: jsonHeaders });
}

export async function POST(request: Request) {
  await ensureSchema();
  await removeExpiredCompletedReceptions();
  const body = (await request.json().catch(() => null)) as {
    action?: string;
    token?: string;
    familyName?: string;
    givenName?: string;
    clientRequestId?: string;
    resumeToken?: string;
  } | null;

  if (body?.action === 'start') {
    const familyName = normalizeDisplayName(body.familyName);
    const givenName = normalizeDisplayName(body.givenName);
    const displayName = `${familyName} ${givenName}`;
    const clientRequestId = typeof body.clientRequestId === 'string' ? body.clientRequestId.trim() : '';
    const resumeToken = typeof body.resumeToken === 'string' ? body.resumeToken.trim() : '';
    if (!familyName || !givenName || familyName.length > 20 || givenName.length > 20 || displayName.length > 40) {
      return Response.json(
        { error: '名字と下のお名前を、それぞれ20文字以内で入力してください。' },
        { status: 400, headers: jsonHeaders },
      );
    }
    if (!/^[0-9a-f-]{36}$/i.test(clientRequestId)) {
      return Response.json({ error: '保存操作を確認できませんでした。もう一度お試しください。' }, { status: 400, headers: jsonHeaders });
    }
    if (!/^[A-Za-z0-9_-]{43}$/.test(resumeToken)) {
      return Response.json({ error: '再開情報を作成できませんでした。もう一度お試しください。' }, { status: 400, headers: jsonHeaders });
    }
    const resumeTokenHash = await hashResumeToken(resumeToken);

    const existing = await env.DB.prepare(
      `SELECT reception_code, status, resume_token_hash, client_request_id, display_name, created_at, updated_at
       FROM receptions_20260902 WHERE client_request_id = ? LIMIT 1`,
    )
      .bind(clientRequestId)
      .first<ReceptionRow>();
    if (existing) {
      if (existing.resume_token_hash !== resumeTokenHash) {
        return Response.json({ error: '保存操作の再開情報が一致しません。' }, { status: 409, headers: jsonHeaders });
      }
      await appendToReceptionSheet(existing, displayName);
      return Response.json({ reception: present(existing, resumeToken) }, { headers: jsonHeaders });
    }

    const duplicateName = await env.DB.prepare(
      `SELECT reception_code, status, resume_token_hash, client_request_id, display_name, created_at, updated_at
       FROM receptions_20260902 WHERE display_name = ? LIMIT 1`,
    )
      .bind(displayName)
      .first<ReceptionRow>();
    if (duplicateName) {
      return Response.json(
        { error: '同じお名前ですでに受付済みです。受付担当者にお声がけください。' },
        { status: 409, headers: jsonHeaders },
      );
    }

    const now = Date.now();
    const receptionCode = await nextReceptionCode();

    try {
      await env.DB.prepare(
        `INSERT INTO receptions_20260902
         (id, reception_code, status, resume_token_hash, client_request_id, display_name, created_at, updated_at)
         VALUES (?, ?, 'in_progress', ?, ?, ?, ?, ?)`,
      )
        .bind(crypto.randomUUID(), receptionCode, resumeTokenHash, clientRequestId, displayName, now, now)
        .run();
    } catch {
      const concurrent = await env.DB.prepare(
        `SELECT reception_code, status, resume_token_hash, client_request_id, display_name, created_at, updated_at
         FROM receptions_20260902 WHERE client_request_id = ? LIMIT 1`,
      )
        .bind(clientRequestId)
        .first<ReceptionRow>();
      if (!concurrent) {
        const concurrentName = await env.DB.prepare(
          `SELECT reception_code, status, resume_token_hash, client_request_id, display_name, created_at, updated_at
           FROM receptions_20260902 WHERE display_name = ? LIMIT 1`,
        )
          .bind(displayName)
          .first<ReceptionRow>();
        if (concurrentName) {
          return Response.json(
            { error: '同じお名前ですでに受付済みです。受付担当者にお声がけください。' },
            { status: 409, headers: jsonHeaders },
          );
        }
        throw new Error('reception-save-failed');
      }
      if (concurrent.resume_token_hash !== resumeTokenHash) {
        return Response.json({ error: '保存操作の再開情報が一致しません。' }, { status: 409, headers: jsonHeaders });
      }
      await appendToReceptionSheet(concurrent, displayName);
      return Response.json({ reception: present(concurrent, resumeToken) }, { headers: jsonHeaders });
    }

    const row: ReceptionRow = {
      reception_code: receptionCode,
      status: 'in_progress',
      resume_token_hash: resumeTokenHash,
      client_request_id: clientRequestId,
      display_name: displayName,
      created_at: now,
      updated_at: now,
    };

    try {
      await appendToReceptionSheet(row, displayName);
    } catch (cause) {
      await env.DB.prepare('DELETE FROM receptions_20260902 WHERE resume_token_hash = ?').bind(resumeTokenHash).run();
      if (cause instanceof Error && cause.message === 'duplicate-name') {
        return Response.json(
          { error: '同じお名前ですでに受付済みです。受付担当者にお声がけください。' },
          { status: 409, headers: jsonHeaders },
        );
      }
      return Response.json(
        { error: '受付帳へ保存できませんでした。通信を確認して、もう一度お試しください。' },
        { status: 502, headers: jsonHeaders },
      );
    }

    return Response.json({ reception: present(row, resumeToken) }, { status: 201, headers: jsonHeaders });
  }

  if (body?.action === 'complete' && body.token) {
    const tokenHash = await hashResumeToken(body.token);
    const now = Date.now();
    await env.DB.prepare(
      `UPDATE receptions_20260902 SET status = 'complete', updated_at = ? WHERE resume_token_hash = ?`,
    )
      .bind(now, tokenHash)
      .run();

    const row = await findReceptionByToken(body.token);
    if (!row) {
      return Response.json({ error: '完了する受付が見つかりません。' }, { status: 404, headers: jsonHeaders });
    }

    return Response.json({ reception: present(row, body.token) }, { headers: jsonHeaders });
  }

  return Response.json({ error: '不明な操作です。' }, { status: 400, headers: jsonHeaders });
}

export async function DELETE(request: Request) {
  await ensureSchema();
  await removeExpiredCompletedReceptions();
  const token = new URL(request.url).searchParams.get('token');
  if (!token) {
    return Response.json({ error: '削除する受付がありません。' }, { status: 400, headers: jsonHeaders });
  }

  const tokenHash = await hashResumeToken(token);
  await env.DB.prepare('DELETE FROM receptions_20260902 WHERE resume_token_hash = ?').bind(tokenHash).run();
  return Response.json({ deleted: true }, { headers: jsonHeaders });
}
