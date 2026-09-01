import { env } from 'cloudflare:workers';
import { todayInJapan } from '@/lib/matches-store';
import { actorForRequest, isResponse } from '@/lib/request-auth';

export async function POST(request: Request) {
  if (env.SUIYOUKAI_LOCAL_TEST_MODE !== '1') {
    return Response.json({ error: 'ローカル試験以外では使えません。' }, { status: 404 });
  }
  const actor = actorForRequest(request);
  if (isResponse(actor)) return actor;
  if (actor.role !== 'admin') return Response.json({ error: '管理者だけが試験データを準備できます。' }, { status: 403 });

  const body = await request.json().catch(() => ({})) as { playedOn?: string };
  const playedOn = body.playedOn || todayInJapan();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(playedOn)) return Response.json({ error: '対局日が不正です。' }, { status: 400 });
  const now = Date.now();
  const rows = [
    ['001', '10:00', '水曜 はなこ', '8級', 'aoba', 'stones', 5, null, 'participant_loss', 'app'],
    ['002', '11:00', '囲碁 みどり', null, 'aoba', 'stones', 6, 6, null, 'admin'],
    ['003', '10:30', '花野 たろう', '3級', 'wakamatsu', 'stones', 3, 4, 'participant_win', 'admin'],
    ['004', '11:30', '桜井 こよみ', '初段', 'wakamatsu', 'sen', null, 13, 'jigo', 'app'],
  ] as const;

  const statements = [
    env.DB.prepare('INSERT OR IGNORE INTO teachers (id, display_name, active, created_at, updated_at) VALUES (?, ?, 1, ?, ?)').bind('aoba', '青葉先生', now, now),
    env.DB.prepare('INSERT OR IGNORE INTO teachers (id, display_name, active, created_at, updated_at) VALUES (?, ?, 1, ?, ?)').bind('wakamatsu', '若松先生', now, now),
    ...rows.map((row) => env.DB.prepare(
      `INSERT OR IGNORE INTO match_records
       (id, played_on, played_at, participant_name, rank, teacher_id, handicap_type, stone_count,
        reverse_komi_half_points, reverse_komi_recipient, result, source, created_by, updated_by,
        created_at, updated_at, version)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'black', ?, ?, ?, ?, ?, ?, 1)`,
    ).bind(`local-${playedOn}-${row[0]}`, playedOn, row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], actor.actorId, actor.actorId, now, now)),
  ];
  await env.DB.batch(statements);
  return Response.json({ seeded: true, playedOn, message: 'ローカル試験用の架空データを準備しました。' });
}
