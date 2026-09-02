import { env } from 'cloudflare:workers';
import { redeemLinkTicket } from '@/lib/linkage-store';

export async function POST(request: Request) {
  if (env.SUIYOUKAI_LOCAL_TEST_MODE !== '1') return Response.json({ error: 'ローカル試験だけで使えます。' }, { status: 404 });
  const body = await request.json().catch(() => null) as { ticket?: string; appNumber?: string } | null;
  try {
    const result = await redeemLinkTicket(env.DB, body?.ticket?.trim() || '', body?.appNumber?.trim() || '');
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return failure(error);
  }
}

function failure(error: unknown) {
  const known = error as Error & { code?: string };
  const status = known.code === 'invalid-app-number' ? 400 : known.code === 'not-found' ? 404 : known.code === 'ticket-invalid' ? 409 : 500;
  return Response.json({ error: status === 500 ? '花記録と連携できませんでした。' : known.message }, { status });
}
