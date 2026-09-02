import { env } from 'cloudflare:workers';
import { normalizeMatchInput } from '@/lib/match-domain.mjs';
import { createAdminMatch, listMatches, listTeachers, todayInJapan, updateAdminMatch } from '@/lib/matches-store';
import { actorForRequest, isResponse } from '@/lib/request-auth';

const responseHeaders = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  const actor = actorForRequest(request);
  if (isResponse(actor)) return actor;
  if (actor.role !== 'admin') return forbidden();

  const playedOn = new URL(request.url).searchParams.get('date') || todayInJapan();
  if (!validDate(playedOn)) return badRequest('対局日を正しく指定してください。');
  const [teachers, matches] = await Promise.all([listTeachers(env.DB), listMatches(env.DB, playedOn)]);
  return Response.json({ playedOn, teachers, matches }, { headers: responseHeaders });
}

export async function POST(request: Request) {
  const actor = actorForRequest(request);
  if (isResponse(actor)) return actor;
  if (actor.role !== 'admin') return forbidden();
  const body = await request.json().catch(() => null);
  const normalized = normalizeMatchInput(body);
  if (!normalized.ok) return badRequest(normalized.message);

  try {
    const id = await createAdminMatch(env.DB, actor.actorId, normalized.value);
    return Response.json({ id, message: 'アプリを使わない参加者を名簿に追加しました。' }, { status: 201, headers: responseHeaders });
  } catch (error) {
    return storeFailure(error);
  }
}

export async function PATCH(request: Request) {
  const actor = actorForRequest(request);
  if (isResponse(actor)) return actor;
  if (actor.role !== 'admin') return forbidden();
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const id = typeof body?.id === 'string' ? body.id.trim() : '';
  const version = Number(body?.version);
  if (!id || !Number.isInteger(version) || version < 1) return badRequest('訂正対象を読み直してください。');
  const normalized = normalizeMatchInput(body);
  if (!normalized.ok) return badRequest(normalized.message);

  try {
    await updateAdminMatch(env.DB, actor.actorId, id, version, normalized.value);
    return Response.json({ message: '名簿を訂正しました。' }, { headers: responseHeaders });
  } catch (error) {
    return storeFailure(error);
  }
}

function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function badRequest(error: string) {
  return Response.json({ error }, { status: 400, headers: responseHeaders });
}

function forbidden() {
  return Response.json({ error: '管理者だけが名簿を変更できます。' }, { status: 403, headers: responseHeaders });
}

function storeFailure(error: unknown) {
  const known = error as Error & { code?: string };
  const status = known.code === 'not-found' ? 404 : known.code === 'conflict' || known.code === 'duplicate' ? 409 : known.code === 'teacher-not-found' ? 400 : 500;
  return Response.json({ error: status === 500 ? '名簿を保存できませんでした。' : known.message }, { status, headers: responseHeaders });
}
