import { env } from 'cloudflare:workers';
import { listLinkageOverview, resetLinkageDemo } from '@/lib/linkage-store';
import { actorForRequest, isResponse } from '@/lib/request-auth';

const headers = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  const actor = authorize(request);
  if (actor instanceof Response) return actor;
  return Response.json(await listLinkageOverview(env.DB), { headers });
}

export async function POST(request: Request) {
  const actor = authorize(request);
  if (actor instanceof Response) return actor;
  await resetLinkageDemo(env.DB, actor.actorId);
  return Response.json({ message: '試験用データを最初の状態へ戻しました。' }, { headers });
}

function authorize(request: Request) {
  if (env.SUIYOUKAI_LOCAL_TEST_MODE !== '1') {
    return Response.json({ error: 'この連携見本はローカル試験だけで使えます。' }, { status: 404, headers });
  }
  const actor = actorForRequest(request);
  if (isResponse(actor)) return actor;
  if (actor.role !== 'admin') return Response.json({ error: '管理者だけが確認できます。' }, { status: 403, headers });
  return actor;
}
