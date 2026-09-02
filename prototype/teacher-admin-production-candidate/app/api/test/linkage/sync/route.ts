import { env } from 'cloudflare:workers';
import { syncPendingStamps } from '@/lib/linkage-store';

export async function POST(request: Request) {
  if (env.SUIYOUKAI_LOCAL_TEST_MODE !== '1') return Response.json({ error: 'ローカル試験だけで使えます。' }, { status: 404 });
  const body = await request.json().catch(() => null) as { appNumber?: string } | null;
  try {
    return Response.json(await syncPendingStamps(env.DB, body?.appNumber?.trim() || ''), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const known = error as Error & { code?: string };
    const status = known.code === 'invalid-app-number' ? 400 : known.code === 'not-found' ? 404 : 500;
    return Response.json({ error: status === 500 ? 'スタンプを受け取れませんでした。' : known.message }, { status });
  }
}
