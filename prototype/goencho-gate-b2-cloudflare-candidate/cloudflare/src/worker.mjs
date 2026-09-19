import { rejectOwnerPinInput, rejectTeacherIdInput } from '../../lib/actor.mjs';
import { fail } from '../../lib/errors.mjs';
import { japanDateKey, requireDateKey, requireParticipantId } from '../../lib/date-key.mjs';
import { GoenchoD1AuthWriteAdapter } from './d1-auth-write-adapter.mjs';
import { GoenchoD1Repository } from './d1-repository.mjs';
import {
  assertStateChangingRequest,
  errorResponse,
  headersWithCookies,
  jsonResponse,
  parseCookies,
  readJson,
  secureCookie,
  securityHeaders,
} from './fetch-security.mjs';
import { assertRuntimeBindings, B2_CONFIG } from './runtime-config.mjs';

const ASSET_PATHS = new Set([
  '/owner/', '/owner/index.html', '/owner/owner.js',
  '/teacher/', '/teacher/index.html', '/teacher/teacher.js',
  '/shared/api.js', '/shared/enrollment-url.js', '/shared/match-periods.js', '/shared/styles.css',
]);

function assertQueryKeys(url, allowed = []) {
  const allowedSet = new Set(allowed);
  for (const key of url.searchParams.keys()) {
    if (!allowedSet.has(key)) fail(400, 'UNEXPECTED_QUERY', 'Unexpected query parameter');
  }
  for (const key of allowedSet) {
    if (url.searchParams.getAll(key).length !== 1) {
      fail(400, 'INVALID_QUERY', 'Query parameter is missing or repeated');
    }
  }
}

function decodePathValue(encoded, code, validator = (value) => value) {
  try {
    const value = decodeURIComponent(encoded);
    if (!value || value.includes('/') || value.includes('\\')) throw new Error('invalid path value');
    return validator(value);
  } catch (error) {
    if (error?.code === code) throw error;
    fail(400, code, 'Path encoding is invalid');
  }
}

function requestHeadersObject(request) {
  return Object.fromEntries(request.headers.entries());
}

function deviceCookie(name, value) {
  return secureCookie(name, value, { maxAge: B2_CONFIG.deviceCredentialMaxAgeSeconds });
}

function sessionCookie(name, value) {
  return secureCookie(name, value);
}

async function teacherActor(request, env, repository, now) {
  const cookies = parseCookies(request);
  return repository.resolveTeacherActor({
    deviceToken: cookies[B2_CONFIG.teacherDeviceCookie],
    sessionToken: cookies[B2_CONFIG.teacherSessionCookie],
    deviceHmacKey: env.GOENCHO_DEVICE_TOKEN_HMAC_KEY_V1,
    sessionHmacKey: env.GOENCHO_SESSION_HMAC_KEY_V1,
    now,
    inactivityMs: B2_CONFIG.inactivityMs,
  });
}

export function createWorkerApplication({
  now = () => Date.now(),
  repositoryFactory = (env) => new GoenchoD1Repository(env.GOENCHO_DB),
  authServiceFactory = (env) => new GoenchoD1AuthWriteAdapter({ db: env.GOENCHO_DB, secrets: env, now }),
  assertBindings = assertRuntimeBindings,
} = {}) {
  return {
    async fetch(request, env) {
      const url = new URL(request.url);
      const headers = securityHeaders(url.origin);
      try {
        assertStateChangingRequest(request, url.origin);
        const body = request.method === 'POST' ? await readJson(request) : {};
        if (url.pathname.startsWith('/api/')) {
          rejectTeacherIdInput({
            query: Object.fromEntries(url.searchParams), body,
            headers: requestHeadersObject(request), path: url.pathname,
          });
        }
        if (url.pathname.startsWith('/api/owner/')) {
          rejectOwnerPinInput({ body, headers: requestHeadersObject(request) });
        }

        assertBindings(env);
        const repository = repositoryFactory(env);
        let authInstance;
        const authService = () => {
          authInstance ??= authServiceFactory(env);
          return authInstance;
        };
        const cookies = parseCookies(request);
        const ownerActor = () => authService().resolveOwnerActor(cookies[B2_CONFIG.ownerSessionCookie]);

        if (request.method === 'GET' && url.pathname === '/api/health') {
          assertQueryKeys(url);
          const version = await repository.schemaVersion();
          if (version !== 3) fail(503, 'SERVICE_UNAVAILABLE', 'Schema version mismatch');
          return jsonResponse(200, {
            service: 'goencho-b2-cloudflare-candidate', mode: 'isolated-local-preparation',
          }, headers);
        }

        if (request.method === 'GET' && url.pathname === '/api/owner/state') {
          assertQueryKeys(url);
          const result = await authService().ownerState({
            deviceToken: cookies[B2_CONFIG.ownerDeviceCookie],
            sessionToken: cookies[B2_CONFIG.ownerSessionCookie],
          });
          const outputHeaders = ['unlock_required', 'active'].includes(result.state)
            ? headersWithCookies(headers, [deviceCookie(B2_CONFIG.ownerDeviceCookie, cookies[B2_CONFIG.ownerDeviceCookie])])
            : headers;
          return jsonResponse(200, result, outputHeaders);
        }

        if (request.method === 'POST' && url.pathname === '/api/owner/bootstrap/activate') {
          assertQueryKeys(url);
          const result = await authService().activateOwner({ ticket: body.ticket, pin: body.pin });
          return jsonResponse(201, { status: 'owner_active', recoveryCodes: result.recoveryCodes },
            headersWithCookies(headers, [
              deviceCookie(B2_CONFIG.ownerDeviceCookie, result.deviceToken),
              sessionCookie(B2_CONFIG.ownerSessionCookie, result.sessionToken),
            ]));
        }

        if (request.method === 'POST' && url.pathname === '/api/owner/recovery/consume') {
          assertQueryKeys(url);
          const result = await authService().recoverOwner({ recoveryCode: body.recoveryCode, newPin: body.newPin });
          return jsonResponse(200, { status: 'recovered', recoveryCodes: result.recoveryCodes },
            headersWithCookies(headers, [
              deviceCookie(B2_CONFIG.ownerDeviceCookie, result.deviceToken),
              sessionCookie(B2_CONFIG.ownerSessionCookie, result.sessionToken),
            ]));
        }

        if (request.method === 'POST' && url.pathname === '/api/owner/session/unlock') {
          assertQueryKeys(url);
          const result = await authService().unlockOwner({
            deviceToken: cookies[B2_CONFIG.ownerDeviceCookie], pin: body.pin,
          });
          return jsonResponse(200, { status: 'unlocked' }, headersWithCookies(headers, [
            deviceCookie(B2_CONFIG.ownerDeviceCookie, cookies[B2_CONFIG.ownerDeviceCookie]),
            sessionCookie(B2_CONFIG.ownerSessionCookie, result.sessionToken),
          ]));
        }

        if (request.method === 'POST' && url.pathname === '/api/owner/session/logout') {
          assertQueryKeys(url);
          await authService().logoutOwner(cookies[B2_CONFIG.ownerSessionCookie]);
          return jsonResponse(200, { status: 'logged_out' }, headersWithCookies(headers, [
            secureCookie(B2_CONFIG.ownerSessionCookie, '', { clear: true }),
          ]));
        }

        if (request.method === 'POST' && url.pathname === '/api/owner/teacher-enrollments') {
          assertQueryKeys(url);
          const result = await authService().createInitialTeacherEnrollment({
            actor: await ownerActor(), displayName: body.displayName,
          });
          return jsonResponse(201, {
            teacherId: result.teacherId, ticket: result.token, purpose: result.purpose,
          }, headers);
        }

        if (request.method === 'GET' && url.pathname === '/api/owner/teacher-devices') {
          assertQueryKeys(url, ['status']);
          const devices = await authService().listTeacherDevices({
            actor: await ownerActor(), status: url.searchParams.get('status'),
          });
          return jsonResponse(200, { devices }, headers);
        }

        const ownerDeviceAction = url.pathname.match(
          /^\/api\/owner\/teacher-devices\/(?<authorizationId>[^/]+)\/(?<action>approve|reject|revoke)$/,
        );
        if (request.method === 'POST' && ownerDeviceAction) {
          assertQueryKeys(url);
          const actor = await ownerActor();
          const authorizationId = decodePathValue(ownerDeviceAction.groups.authorizationId, 'INVALID_AUTHORIZATION_ID');
          let result;
          if (ownerDeviceAction.groups.action === 'approve') {
            result = await authService().approveTeacherDevice({ actor, authorizationId, confirmationCode: body.confirmationCode });
          } else if (ownerDeviceAction.groups.action === 'reject') {
            result = await authService().rejectTeacherDevice({ actor, authorizationId });
          } else {
            result = await authService().revokeTeacherDevice({ actor, authorizationId });
          }
          return jsonResponse(200, result, headers);
        }

        if (request.method === 'GET' && url.pathname === '/api/teacher/state') {
          assertQueryKeys(url);
          const result = await authService().teacherState({
            deviceToken: cookies[B2_CONFIG.teacherDeviceCookie],
            sessionToken: cookies[B2_CONFIG.teacherSessionCookie],
          });
          const outputHeaders = ['pending', 'unlock_required', 'active'].includes(result.state)
            ? headersWithCookies(headers, [deviceCookie(B2_CONFIG.teacherDeviceCookie, cookies[B2_CONFIG.teacherDeviceCookie])])
            : headers;
          return jsonResponse(200, result, outputHeaders);
        }

        if (request.method === 'POST' && url.pathname === '/api/teacher/enrollment/claim') {
          assertQueryKeys(url);
          const result = await authService().claimEnrollment({ ticket: body.ticket });
          return jsonResponse(200, {
            claimToken: result.claimToken, purpose: result.purpose, displayName: result.displayName,
          }, headers);
        }

        if (request.method === 'POST' && url.pathname === '/api/teacher/enrollment/set-pin') {
          assertQueryKeys(url);
          const result = await authService().setTeacherPin({ claimToken: body.claimToken, pin: body.pin });
          return jsonResponse(202, { status: result.status, confirmationCode: result.confirmationCode },
            headersWithCookies(headers, [deviceCookie(B2_CONFIG.teacherDeviceCookie, result.deviceToken)]));
        }

        if (request.method === 'GET' && url.pathname === '/api/teacher/enrollment/status') {
          assertQueryKeys(url);
          const result = await authService().teacherState({
            deviceToken: cookies[B2_CONFIG.teacherDeviceCookie],
            sessionToken: cookies[B2_CONFIG.teacherSessionCookie],
          });
          const outputHeaders = ['pending', 'unlock_required', 'active'].includes(result.state)
            ? headersWithCookies(headers, [deviceCookie(B2_CONFIG.teacherDeviceCookie, cookies[B2_CONFIG.teacherDeviceCookie])])
            : headers;
          return jsonResponse(result.state === 'pending' ? 202 : 200, result, outputHeaders);
        }

        if (request.method === 'POST' && url.pathname === '/api/teacher/session/unlock') {
          assertQueryKeys(url);
          const result = await authService().unlockTeacher({
            deviceToken: cookies[B2_CONFIG.teacherDeviceCookie], pin: body.pin,
          });
          return jsonResponse(200, { status: 'unlocked' }, headersWithCookies(headers, [
            deviceCookie(B2_CONFIG.teacherDeviceCookie, cookies[B2_CONFIG.teacherDeviceCookie]),
            sessionCookie(B2_CONFIG.teacherSessionCookie, result.sessionToken),
          ]));
        }

        if (request.method === 'POST' && url.pathname === '/api/teacher/session/logout') {
          assertQueryKeys(url);
          await authService().logoutTeacher(cookies[B2_CONFIG.teacherSessionCookie]);
          return jsonResponse(200, { status: 'logged_out' }, headersWithCookies(headers, [
            secureCookie(B2_CONFIG.teacherSessionCookie, '', { clear: true }),
          ]));
        }

        if (request.method === 'GET' && url.pathname === '/api/teacher/matches/today') {
          assertQueryKeys(url);
          const actor = await teacherActor(request, env, repository, now());
          const date = japanDateKey(now());
          return jsonResponse(200, { date, matches: await repository.todayMatches(actor, date) }, headers);
        }

        if (request.method === 'GET' && url.pathname === '/api/teacher/matches/dates') {
          assertQueryKeys(url);
          const actor = await teacherActor(request, env, repository, now());
          return jsonResponse(200, { dates: await repository.matchDates(actor) }, headers);
        }

        if (request.method === 'GET' && url.pathname === '/api/teacher/matches/by-date') {
          assertQueryKeys(url, ['date']);
          const actor = await teacherActor(request, env, repository, now());
          const date = requireDateKey(url.searchParams.get('date'));
          return jsonResponse(200, { date, matches: await repository.matchesByDate(actor, date) }, headers);
        }

        const participant = url.pathname.match(/^\/api\/teacher\/participants\/(?<participantId>[^/]+)\/matches$/);
        if (request.method === 'GET' && participant) {
          assertQueryKeys(url);
          const actor = await teacherActor(request, env, repository, now());
          const participantId = decodePathValue(
            participant.groups.participantId, 'INVALID_PARTICIPANT_ID', requireParticipantId,
          );
          return jsonResponse(200, { matches: await repository.participantMatches(actor, participantId) }, headers);
        }

        if (url.pathname.startsWith('/api/')) return jsonResponse(404, { error: 'NOT_FOUND' }, headers);
        if (request.method === 'GET' && ASSET_PATHS.has(url.pathname)
          && env.ASSETS && typeof env.ASSETS.fetch === 'function') {
          const response = await env.ASSETS.fetch(request);
          const secured = new Headers(response.headers);
          for (const [name, value] of Object.entries(headers)) secured.set(name, value);
          return new Response(response.body, { status: response.status, headers: secured });
        }
        return jsonResponse(404, { error: 'NOT_FOUND' }, headers);
      } catch (error) {
        return errorResponse(error, headers);
      }
    },
  };
}

const application = createWorkerApplication();

export default {
  fetch(request, env) {
    return application.fetch(request, env);
  },
};
