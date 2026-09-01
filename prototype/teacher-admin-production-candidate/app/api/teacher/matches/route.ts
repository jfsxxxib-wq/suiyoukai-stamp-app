import { env } from 'cloudflare:workers';
import { listMatches, teacherName, todayInJapan } from '@/lib/matches-store';
import { actorForRequest, isResponse } from '@/lib/request-auth';

const responseHeaders = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  const actor = actorForRequest(request);
  if (isResponse(actor)) return actor;
  if (actor.role !== 'teacher') {
    return Response.json({ error: '先生本人の入口から開いてください。' }, { status: 403, headers: responseHeaders });
  }

  const playedOn = new URL(request.url).searchParams.get('date') || todayInJapan();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(playedOn)) {
    return Response.json({ error: '対局日を正しく指定してください。' }, { status: 400, headers: responseHeaders });
  }

  const teacher = await teacherName(env.DB, actor.teacherId);
  if (!teacher) {
    return Response.json({ error: '先生の登録が見つかりません。' }, { status: 403, headers: responseHeaders });
  }
  const matches = await listMatches(env.DB, playedOn, actor.teacherId);
  return Response.json(
    { playedOn, teacher: { id: actor.teacherId, displayName: teacher.displayName }, matches },
    { headers: responseHeaders },
  );
}
