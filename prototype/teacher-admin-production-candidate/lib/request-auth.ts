import { env } from 'cloudflare:workers';
import { authConfigFromEnv, resolveActor } from './auth.mjs';

export type Actor =
  | { role: 'admin'; actorId: string }
  | { role: 'teacher'; actorId: string; teacherId: string };

export function actorForRequest(request: Request): Actor | Response {
  const result = resolveActor(request.headers, authConfigFromEnv(env));
  if (!result.ok) {
    return Response.json({ error: result.message }, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
  }
  return result.actor as Actor;
}

export function isResponse(value: Actor | Response): value is Response {
  return value instanceof Response;
}
