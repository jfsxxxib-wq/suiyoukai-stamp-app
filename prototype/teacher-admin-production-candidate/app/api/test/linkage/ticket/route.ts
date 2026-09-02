import { env } from 'cloudflare:workers';
import { issueLinkTicket } from '@/lib/linkage-store';
import { actorForRequest, isResponse } from '@/lib/request-auth';

export async function POST(request: Request) {
  if (env.SUIYOUKAI_LOCAL_TEST_MODE !== '1') return Response.json({ error: 'ローカル試験だけで使えます。' }, { status: 404 });
  const actor = actorForRequest(request);
  if (isResponse(actor)) return actor;
  if (actor.role !== 'admin') return Response.json({ error: '管理者だけが連携券を発行できます。' }, { status: 403 });
  const body = await request.json().catch(() => null) as { receptionId?: string } | null;
  if (!body?.receptionId) return Response.json({ error: '受付記録を選んでください。' }, { status: 400 });
  try {
    return Response.json(await issueLinkTicket(env.DB, body.receptionId, actor.actorId), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return failure(error);
  }
}

function failure(error: unknown) {
  const known = error as Error & { code?: string };
  const status = known.code === 'not-found' ? 404 : known.code === 'already-linked' ? 409 : 500;
  return Response.json({ error: status === 500 ? '連携券を発行できませんでした。' : known.message }, { status });
}
