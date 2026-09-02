export type LinkageParticipant = {
  id: string;
  name: string;
  receptionNumber: string;
  appNumber: string | null;
  receptionStatus: '完了';
  linkStatus: '未連携' | '連携券発行済み' | '連携済み';
  stampStatus: '未反映' | '送信待ち' | '反映済み';
  receivedAt: string;
  note?: string;
  history: { time: string; text: string; tone: 'good' | 'wait' | 'neutral' }[];
};

const linkLabels = { unlinked: '未連携', ticket_issued: '連携券発行済み', linked: '連携済み' } as const;
const stampLabels = { not_sent: '未反映', pending: '送信待ち', applied: '反映済み', correction: '修正待ち' } as const;

type ReceptionRow = {
  id: string;
  display_name: string;
  reception_number: string;
  app_number: string | null;
  reception_status: 'complete';
  app_link_status: keyof typeof linkLabels;
  stamp_status: keyof typeof stampLabels;
  received_at: string;
};

export async function listLinkageOverview(db: D1Database) {
  const receptions = await db.prepare(
    `SELECT r.id, r.display_name, r.reception_number, p.app_number,
      r.reception_status, r.app_link_status, r.stamp_status, r.received_at
     FROM receptions r LEFT JOIN participants p ON p.id = r.participant_id
     ORDER BY r.received_on, r.sequence`,
  ).all<ReceptionRow>();
  const audits = await db.prepare(
    `SELECT reception_id, detail_json, created_at FROM reception_audit ORDER BY created_at, id`,
  ).all<{ reception_id: string; detail_json: string; created_at: number }>();
  const history = new Map<string, LinkageParticipant['history']>();
  for (const audit of audits.results) {
    const detail = safeJson(audit.detail_json);
    const item = {
      time: typeof detail.time === 'string' ? detail.time : japanTime(audit.created_at),
      text: typeof detail.text === 'string' ? detail.text : '状態を更新',
      tone: detail.tone === 'good' || detail.tone === 'wait' ? detail.tone : 'neutral',
    } as const;
    history.set(audit.reception_id, [...(history.get(audit.reception_id) || []), item]);
  }

  const participants = receptions.results.map((row): LinkageParticipant => ({
    id: row.id,
    name: row.display_name,
    receptionNumber: row.reception_number,
    appNumber: row.app_number,
    receptionStatus: '完了',
    linkStatus: linkLabels[row.app_link_status],
    stampStatus: presentStampStatus(row.stamp_status),
    receivedAt: row.received_at,
    note: row.stamp_status === 'pending'
      ? '本人が花記録を開くと参加スタンプを受け取ります'
      : row.app_link_status === 'unlinked' ? 'アプリを利用しているか受付で確認' : undefined,
    history: history.get(row.id) || [],
  }));
  const mirror = await db.prepare(
    `SELECT reception_id, row_json, sync_status, updated_at FROM spreadsheet_mirror ORDER BY reception_id`,
  ).all<{ reception_id: string; row_json: string; sync_status: string; updated_at: number }>();
  return {
    participants,
    mirror: mirror.results.map((row) => ({
      receptionId: row.reception_id,
      row: safeJson(row.row_json),
      syncStatus: row.sync_status,
      updatedAt: row.updated_at,
    })),
  };
}

export async function resetLinkageDemo(db: D1Database, actorId: string) {
  for (const table of ['spreadsheet_mirror', 'reception_audit', 'app_link_tickets', 'stamp_events', 'receptions', 'participants']) {
    await db.prepare(`DELETE FROM ${table}`).run();
  }
  const now = Date.now();
  const rows = [
    ['p-001', '水曜 はなこ', '12345678', 'linked', 'applied', '09:42'],
    ['p-002', '花野 みどり', '24681357', 'linked', 'pending', '10:08'],
    ['p-003', '藤色 まこと', null, 'unlinked', 'not_sent', '10:31'],
    ['p-004', '若葉 つばき', '87654321', 'linked', 'applied', '11:05'],
    ['p-005', '木ノ実 さくら', '13572468', 'linked', 'applied', '11:27'],
    ['p-006', '空野 あおい', null, 'unlinked', 'not_sent', '12:02'],
  ] as const;
  const statements: D1PreparedStatement[] = [];
  for (const [id, name, appNumber, linkStatus, stampStatus, receivedAt] of rows) {
    const participantId = appNumber ? `participant-${id}` : null;
    if (appNumber) {
      statements.push(db.prepare(
        'INSERT INTO participants (id, app_number, created_at, updated_at) VALUES (?, ?, ?, ?)',
      ).bind(participantId, appNumber, now, now));
    }
    const sequence = Number(id.slice(-3));
    const receptionNumber = `20260902-${String(sequence).padStart(3, '0')}`;
    statements.push(db.prepare(
      `INSERT INTO receptions
       (id, received_on, sequence, reception_number, display_name, participant_id,
        reception_status, app_link_status, stamp_status, received_at, created_at, updated_at)
       VALUES (?, '2026-09-02', ?, ?, ?, ?, 'complete', ?, ?, ?, ?, ?)`,
    ).bind(id, sequence, receptionNumber, name, participantId, linkStatus, stampStatus, receivedAt, now, now));
    statements.push(auditStatement(db, id, 'reception_created', actorId, {
      time: receivedAt, text: '受付サイトで名前を保存', tone: 'neutral',
    }, now + sequence));
    if (participantId) {
      statements.push(auditStatement(db, id, 'app_linked', actorId, {
        time: receivedAt, text: 'アプリ個人番号と受付番号を連携', tone: 'good',
      }, now + 20 + sequence));
      statements.push(db.prepare(
        `INSERT INTO stamp_events
         (id, participant_id, reception_id, amount, event_type, status, source_reference, actor_id, created_at, applied_at)
         VALUES (?, ?, ?, 1, 'participation', ?, ?, ?, ?, ?)`,
      ).bind(`stamp-${id}`, participantId, id, stampStatus, `reception:${id}:participation`, actorId, now + 30 + sequence, stampStatus === 'applied' ? now + 40 + sequence : null));
      statements.push(auditStatement(db, id, stampStatus === 'applied' ? 'stamp_applied' : 'stamp_pending', actorId, {
        time: receivedAt,
        text: stampStatus === 'applied' ? '参加スタンプ +1・本人アプリで反映確認' : '参加スタンプを送信待ちに保存',
        tone: stampStatus === 'applied' ? 'good' : 'wait',
      }, now + 40 + sequence));
    }
    statements.push(db.prepare(
      `INSERT INTO spreadsheet_mirror (reception_id, row_json, sync_status, updated_at)
       VALUES (?, ?, 'pending', ?)`,
    ).bind(id, JSON.stringify(mirrorRow({ name, receptionNumber, appNumber, linkStatus, stampStatus, receivedAt })), now));
  }
  await db.batch(statements);
}

export async function issueLinkTicket(db: D1Database, receptionId: string, actorId: string) {
  const reception = await db.prepare(
    'SELECT id, display_name, app_link_status FROM receptions WHERE id = ? LIMIT 1',
  ).bind(receptionId).first<{ id: string; display_name: string; app_link_status: string }>();
  if (!reception) throw linkageError('not-found', '受付記録が見つかりません。');
  if (reception.app_link_status === 'linked') throw linkageError('already-linked', 'すでに花記録と連携済みです。');

  const rawToken = randomToken();
  const tokenHash = await hashToken(rawToken);
  const now = Date.now();
  const expiresAt = now + 15 * 60 * 1000;
  await db.batch([
    db.prepare('UPDATE app_link_tickets SET used_at = ? WHERE reception_id = ? AND used_at IS NULL').bind(now, receptionId),
    db.prepare(
      `INSERT INTO app_link_tickets (id, reception_id, token_hash, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    ).bind(crypto.randomUUID(), receptionId, tokenHash, expiresAt, now),
    db.prepare(
      `UPDATE receptions SET app_link_status = 'ticket_issued', updated_at = ?, version = version + 1 WHERE id = ?`,
    ).bind(now, receptionId),
    auditStatement(db, receptionId, 'ticket_issued', actorId, {
      text: '一度だけ使える連携券を発行', tone: 'wait',
    }, now),
  ]);
  await rebuildMirror(db, receptionId);
  return { ticket: rawToken, receptionId, displayName: reception.display_name, expiresAt };
}

export async function redeemLinkTicket(db: D1Database, rawToken: string, appNumber: string) {
  if (!/^\d{8}$/.test(appNumber)) throw linkageError('invalid-app-number', 'アプリ個人番号は8桁の数字で入力してください。');
  if (!rawToken) throw linkageError('ticket-invalid', '連携券がありません。管理画面から発行し直してください。');
  const now = Date.now();
  const tokenHash = await hashToken(rawToken);
  const claimed = await db.prepare(
    `UPDATE app_link_tickets SET used_at = ?
     WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?
     RETURNING reception_id`,
  ).bind(now, tokenHash, now).first<{ reception_id: string }>();
  if (!claimed) throw linkageError('ticket-invalid', 'この連携券は使用済みか、有効時間が切れています。');

  let participant = await db.prepare('SELECT id FROM participants WHERE app_number = ? LIMIT 1')
    .bind(appNumber).first<{ id: string }>();
  if (!participant) {
    participant = { id: crypto.randomUUID() };
    await db.prepare(
      'INSERT INTO participants (id, app_number, created_at, updated_at) VALUES (?, ?, ?, ?)',
    ).bind(participant.id, appNumber, now, now).run();
  }
  const reception = await db.prepare(
    'SELECT id, display_name, reception_number FROM receptions WHERE id = ? LIMIT 1',
  ).bind(claimed.reception_id).first<{ id: string; display_name: string; reception_number: string }>();
  if (!reception) throw linkageError('not-found', '受付記録が見つかりません。');

  await db.batch([
    db.prepare(
      `UPDATE receptions SET participant_id = ?, app_link_status = 'linked', stamp_status = 'pending',
       updated_at = ?, version = version + 1 WHERE id = ?`,
    ).bind(participant.id, now, reception.id),
    db.prepare(
      `INSERT OR IGNORE INTO stamp_events
       (id, participant_id, reception_id, amount, event_type, status, source_reference, actor_id, created_at)
       VALUES (?, ?, ?, 1, 'participation', 'pending', ?, 'participant-app', ?)`,
    ).bind(crypto.randomUUID(), participant.id, reception.id, `reception:${reception.id}:participation`, now),
    auditStatement(db, reception.id, 'app_linked', 'participant-app', {
      text: `アプリ個人番号 ${appNumber} と受付番号を連携`, tone: 'good',
    }, now),
    auditStatement(db, reception.id, 'stamp_pending', 'system', {
      text: '参加スタンプ +1 を送信待ちに保存', tone: 'wait',
    }, now + 1),
  ]);
  await rebuildMirror(db, reception.id);
  return { appNumber, receptionNumber: reception.reception_number, displayName: reception.display_name };
}

export async function syncPendingStamps(db: D1Database, appNumber: string) {
  if (!/^\d{8}$/.test(appNumber)) throw linkageError('invalid-app-number', 'アプリ個人番号は8桁の数字で入力してください。');
  const participant = await db.prepare('SELECT id FROM participants WHERE app_number = ? LIMIT 1')
    .bind(appNumber).first<{ id: string }>();
  if (!participant) throw linkageError('not-found', 'この個人番号の連携記録がありません。');
  const pending = await db.prepare(
    `SELECT id, reception_id FROM stamp_events WHERE participant_id = ? AND status = 'pending' ORDER BY created_at`,
  ).bind(participant.id).all<{ id: string; reception_id: string }>();
  const now = Date.now();
  const statements: D1PreparedStatement[] = [];
  for (const event of pending.results) {
    statements.push(db.prepare("UPDATE stamp_events SET status = 'applied', applied_at = ? WHERE id = ? AND status = 'pending'").bind(now, event.id));
    statements.push(db.prepare("UPDATE receptions SET stamp_status = 'applied', updated_at = ?, version = version + 1 WHERE id = ?").bind(now, event.reception_id));
    statements.push(auditStatement(db, event.reception_id, 'stamp_applied', 'participant-app', {
      text: '参加スタンプ +1・本人アプリで反映確認', tone: 'good',
    }, now));
  }
  if (statements.length) await db.batch(statements);
  for (const event of pending.results) await rebuildMirror(db, event.reception_id);
  const total = await db.prepare(
    `SELECT COALESCE(SUM(amount), 0) AS total FROM stamp_events WHERE participant_id = ? AND status = 'applied'`,
  ).bind(participant.id).first<{ total: number }>();
  return { appliedCount: pending.results.length, total: Number(total?.total || 0) };
}

async function rebuildMirror(db: D1Database, receptionId: string) {
  const row = await db.prepare(
    `SELECT r.display_name AS name, r.reception_number AS receptionNumber, p.app_number AS appNumber,
      r.app_link_status AS linkStatus, r.stamp_status AS stampStatus, r.received_at AS receivedAt
     FROM receptions r LEFT JOIN participants p ON p.id = r.participant_id WHERE r.id = ?`,
  ).bind(receptionId).first<{
    name: string; receptionNumber: string; appNumber: string | null;
    linkStatus: string; stampStatus: string; receivedAt: string;
  }>();
  if (!row) return;
  const now = Date.now();
  await db.prepare(
    `INSERT INTO spreadsheet_mirror (reception_id, row_json, sync_status, updated_at)
     VALUES (?, ?, 'pending', ?)
     ON CONFLICT(reception_id) DO UPDATE SET row_json = excluded.row_json,
       sync_status = 'pending', updated_at = excluded.updated_at, synced_at = NULL`,
  ).bind(receptionId, JSON.stringify(mirrorRow(row)), now).run();
}

function mirrorRow(row: {
  name: string; receptionNumber: string; appNumber: string | null;
  linkStatus: string; stampStatus: string; receivedAt: string;
}) {
  return {
    受付番号: row.receptionNumber,
    アプリ個人番号: row.appNumber || '',
    氏名: row.name,
    受付状態: '完了',
    アプリ連携: linkLabels[row.linkStatus as keyof typeof linkLabels] || row.linkStatus,
    参加スタンプ: stampLabels[row.stampStatus as keyof typeof stampLabels] || row.stampStatus,
    受付日時: row.receivedAt,
  };
}

function auditStatement(
  db: D1Database,
  receptionId: string,
  action: string,
  actorId: string,
  detail: Record<string, unknown>,
  createdAt: number,
) {
  return db.prepare(
    `INSERT INTO reception_audit (reception_id, action, actor_id, detail_json, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  ).bind(receptionId, action, actorId, JSON.stringify(detail), createdAt);
}

function safeJson(value: string): Record<string, unknown> {
  try { return JSON.parse(value); } catch { return {}; }
}

function presentStampStatus(value: keyof typeof stampLabels): '未反映' | '送信待ち' | '反映済み' {
  const label = stampLabels[value];
  return label === '修正待ち' ? '未反映' : label;
}

function japanTime(timestamp: number) {
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(timestamp));
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hashToken(rawToken: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawToken));
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('');
}

function linkageError(code: string, message: string) {
  return Object.assign(new Error(message), { code });
}
