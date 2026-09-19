import http from 'node:http';
import { mkdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';
import { CONFIG, assertRuntimeConfig } from './lib/config.mjs';
import { randomToken } from './lib/crypto.mjs';
import { openDatabase } from './lib/db.mjs';
import { OwnerAuthService } from './lib/owner-auth.mjs';
import { TeacherAuthService } from './lib/teacher-auth.mjs';
import { rejectOwnerPinInput, rejectTeacherIdInput } from './lib/actor.mjs';
import { matchDates, matchesByDate, participantMatches, todayMatches } from './lib/matches.mjs';
import { japanDateKey, requireDateKey, requireParticipantId } from './lib/date-key.mjs';
import { fail } from './lib/errors.mjs';
import {
  assertHost,
  assertNoCrossOrigin,
  assertStateChangingRequest,
  localDeviceCookie,
  localSessionCookie,
  parseCookies,
  readJson,
  securityHeaders,
  sendError,
  sendJson,
} from './lib/http-security.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

function routeMatch(pathname, pattern) {
  const match = pathname.match(pattern);
  return match ? match.groups ?? {} : null;
}

function assertQueryKeys(url, allowed = []) {
  const allowedSet = new Set(allowed);
  for (const key of url.searchParams.keys()) {
    if (!allowedSet.has(key)) fail(400, 'UNEXPECTED_QUERY', 'Unexpected query parameter');
  }
  for (const key of allowedSet) {
    if (url.searchParams.getAll(key).length !== 1) fail(400, 'INVALID_QUERY', 'Query parameter is missing or repeated');
  }
}

function decodeParticipantId(encoded) {
  try {
    return requireParticipantId(decodeURIComponent(encoded));
  } catch (error) {
    if (error?.code === 'INVALID_PARTICIPANT_ID') throw error;
    fail(400, 'INVALID_PARTICIPANT_ID', 'Participant ID encoding is invalid');
  }
}

function serveFile(response, file, headers) {
  try {
    const data = readFileSync(join(root, file));
    response.writeHead(200, { ...headers, 'Content-Type': mimeTypes.get(extname(file)) ?? 'application/octet-stream' });
    response.end(data);
  } catch {
    sendJson(response, 404, { error: 'NOT_FOUND' }, headers);
  }
}

function ownerHandler({ ownerAuth, config }) {
  const origin = `http://${config.ownerAllowedHost}`;
  const headers = securityHeaders(origin);
  return async (request, response) => {
    try {
      assertHost(request, config.ownerAllowedHost);
      assertNoCrossOrigin(request, origin);
      const url = new URL(request.url, origin);
      const cookies = parseCookies(request);
      assertStateChangingRequest(request, origin);
      const body = request.method === 'POST' ? await readJson(request) : {};
      rejectOwnerPinInput({ body, headers: request.headers });

      if (request.method === 'GET' && url.pathname === '/owner/') return serveFile(response, 'public/owner/index.html', headers);
      if (request.method === 'GET' && url.pathname === '/owner/owner.js') return serveFile(response, 'public/owner/owner.js', headers);
      if (request.method === 'GET' && url.pathname === '/shared/api.js') return serveFile(response, 'public/shared/api.js', headers);
      if (request.method === 'GET' && url.pathname === '/shared/enrollment-url.js') return serveFile(response, 'public/shared/enrollment-url.js', headers);
      if (request.method === 'GET' && url.pathname === '/shared/styles.css') return serveFile(response, 'public/shared/styles.css', headers);
      if (request.method === 'GET' && url.pathname === '/api/health') {
        return sendJson(response, 200, { service: 'goencho-owner-gate-b1', mode: 'local-isolated' }, headers);
      }
      if (request.method === 'GET' && url.pathname === '/api/owner/state') {
        const result = ownerAuth.ownerState({
          deviceToken: cookies[config.ownerCookie],
          sessionToken: cookies[config.ownerSessionCookie],
        });
        const responseHeaders = ['unlock_required', 'active'].includes(result.state)
          ? {
              ...headers,
              'Set-Cookie': localDeviceCookie(
                config.ownerCookie,
                cookies[config.ownerCookie],
                config.deviceCredentialMaxAgeSeconds,
              ),
            }
          : headers;
        return sendJson(response, 200, result, responseHeaders);
      }

      if (request.method === 'POST' && url.pathname === '/api/owner/bootstrap/activate') {
        const result = ownerAuth.activate({ ticket: body.ticket, pin: body.pin });
        return sendJson(response, 201, {
          status: 'owner_active',
          recoveryCodes: result.recoveryCodes,
        }, {
          ...headers,
          'Set-Cookie': [
            localDeviceCookie(config.ownerCookie, result.deviceToken, config.deviceCredentialMaxAgeSeconds),
            localSessionCookie(config.ownerSessionCookie, result.sessionToken),
          ],
        });
      }

      if (request.method === 'POST' && url.pathname === '/api/owner/recovery/consume') {
        const result = ownerAuth.recover({ recoveryCode: body.recoveryCode, newPin: body.newPin });
        return sendJson(response, 200, {
          status: 'recovered', recoveryCodes: result.recoveryCodes,
        }, {
          ...headers,
          'Set-Cookie': [
            localDeviceCookie(config.ownerCookie, result.deviceToken, config.deviceCredentialMaxAgeSeconds),
            localSessionCookie(config.ownerSessionCookie, result.sessionToken),
          ],
        });
      }

      if (request.method === 'POST' && url.pathname === '/api/owner/session/unlock') {
        const result = ownerAuth.unlock({ deviceToken: cookies[config.ownerCookie], pin: body.pin });
        return sendJson(response, 200, { status: 'unlocked' }, {
          ...headers,
          'Set-Cookie': [
            localDeviceCookie(
              config.ownerCookie,
              cookies[config.ownerCookie],
              config.deviceCredentialMaxAgeSeconds,
            ),
            localSessionCookie(config.ownerSessionCookie, result.sessionToken),
          ],
        });
      }

      if (request.method === 'POST' && url.pathname === '/api/owner/session/logout') {
        ownerAuth.logout(cookies[config.ownerSessionCookie]);
        return sendJson(response, 200, { status: 'logged_out' }, {
          ...headers,
          'Set-Cookie': localSessionCookie(config.ownerSessionCookie, '', { clear: true }),
        });
      }

      if (request.method === 'POST' && url.pathname === '/api/owner/teachers') {
        const actor = ownerAuth.resolveSession(cookies[config.ownerSessionCookie]);
        const result = ownerAuth.createTeacher({ actor, displayName: body.displayName });
        return sendJson(response, 201, result, headers);
      }

      if (request.method === 'POST' && url.pathname === '/api/owner/teacher-enrollments') {
        const actor = ownerAuth.resolveSession(cookies[config.ownerSessionCookie]);
        const result = ownerAuth.createInitialTeacherEnrollment({ actor, displayName: body.displayName });
        return sendJson(response, 201, result, headers);
      }

      const enrollment = routeMatch(url.pathname, /^\/api\/owner\/teachers\/(?<teacherId>[^/]+)\/enrollment-ticket$/);
      if (request.method === 'POST' && enrollment) {
        const actor = ownerAuth.resolveSession(cookies[config.ownerSessionCookie]);
        const result = ownerAuth.createEnrollmentTicket({ actor, teacherId: enrollment.teacherId, purpose: body.purpose });
        return sendJson(response, 201, { status: 'ticket_created', ticket: result.token, purpose: result.purpose }, headers);
      }

      if (request.method === 'GET' && url.pathname === '/api/owner/teacher-devices/pending') {
        const actor = ownerAuth.resolveSession(cookies[config.ownerSessionCookie]);
        return sendJson(response, 200, { devices: ownerAuth.listPending({ actor }) }, headers);
      }

      if (request.method === 'GET' && url.pathname === '/api/owner/teacher-devices') {
        const actor = ownerAuth.resolveSession(cookies[config.ownerSessionCookie]);
        return sendJson(response, 200, {
          devices: ownerAuth.listDevices({ actor, status: url.searchParams.get('status') }),
        }, headers);
      }

      const deviceAction = routeMatch(url.pathname, /^\/api\/owner\/teacher-devices\/(?<authorizationId>[^/]+)\/(?<action>approve|reject|revoke)$/);
      if (request.method === 'POST' && deviceAction) {
        const actor = ownerAuth.resolveSession(cookies[config.ownerSessionCookie]);
        const result = deviceAction.action === 'approve'
          ? ownerAuth.approveDevice({ actor, authorizationId: deviceAction.authorizationId, confirmationCode: body.confirmationCode })
          : ownerAuth.revokeDevice({ actor, authorizationId: deviceAction.authorizationId, reason: deviceAction.action });
        return sendJson(response, 200, result, headers);
      }

      sendJson(response, 404, { error: 'NOT_FOUND' }, headers);
    } catch (error) {
      sendError(response, error, headers);
    }
  };
}

function teacherHandler({ teacherAuth, db, config, now }) {
  const origin = `http://${config.teacherAllowedHost}`;
  const headers = securityHeaders(origin);
  return async (request, response) => {
    try {
      assertHost(request, config.teacherAllowedHost);
      assertNoCrossOrigin(request, origin);
      const url = new URL(request.url, origin);
      const cookies = parseCookies(request);
      assertStateChangingRequest(request, origin);
      const body = request.method === 'POST' ? await readJson(request) : {};
      rejectTeacherIdInput({ query: Object.fromEntries(url.searchParams), body, headers: request.headers, path: url.pathname });

      if (request.method === 'GET' && url.pathname === '/teacher/') return serveFile(response, 'public/teacher/index.html', headers);
      if (request.method === 'GET' && url.pathname === '/teacher/teacher.js') return serveFile(response, 'public/teacher/teacher.js', headers);
      if (request.method === 'GET' && url.pathname === '/shared/api.js') return serveFile(response, 'public/shared/api.js', headers);
      if (request.method === 'GET' && url.pathname === '/shared/enrollment-url.js') return serveFile(response, 'public/shared/enrollment-url.js', headers);
      if (request.method === 'GET' && url.pathname === '/shared/match-periods.js') return serveFile(response, 'public/shared/match-periods.js', headers);
      if (request.method === 'GET' && url.pathname === '/shared/styles.css') return serveFile(response, 'public/shared/styles.css', headers);
      if (request.method === 'GET' && url.pathname === '/api/health') {
        return sendJson(response, 200, { service: 'goencho-teacher-gate-b1', mode: 'local-isolated' }, headers);
      }
      if (request.method === 'GET' && url.pathname === '/api/teacher/state') {
        const result = teacherAuth.teacherState({
          deviceToken: cookies[config.teacherDeviceCookie],
          sessionToken: cookies[config.teacherSessionCookie],
        });
        const responseHeaders = ['pending', 'unlock_required', 'active'].includes(result.state)
          ? {
              ...headers,
              'Set-Cookie': localDeviceCookie(
                config.teacherDeviceCookie,
                cookies[config.teacherDeviceCookie],
                config.deviceCredentialMaxAgeSeconds,
              ),
            }
          : headers;
        return sendJson(response, 200, result, responseHeaders);
      }

      if (request.method === 'POST' && url.pathname === '/api/teacher/enrollment/claim') {
        const result = teacherAuth.claimEnrollment({ ticket: body.ticket });
        return sendJson(response, 200, {
          claimToken: result.claimToken,
          purpose: result.purpose,
          displayName: result.displayName,
        }, headers);
      }
      if (request.method === 'POST' && url.pathname === '/api/teacher/enrollment/set-pin') {
        const result = teacherAuth.setPin({ claimToken: body.claimToken, pin: body.pin });
        return sendJson(response, 202, {
          status: result.status, confirmationCode: result.confirmationCode,
        }, {
          ...headers,
          'Set-Cookie': localDeviceCookie(
            config.teacherDeviceCookie,
            result.deviceToken,
            config.deviceCredentialMaxAgeSeconds,
          ),
        });
      }
      if (request.method === 'GET' && url.pathname === '/api/teacher/enrollment/status') {
        const result = teacherAuth.teacherState({
          deviceToken: cookies[config.teacherDeviceCookie],
          sessionToken: cookies[config.teacherSessionCookie],
        });
        const responseHeaders = ['pending', 'unlock_required', 'active'].includes(result.state)
          ? {
              ...headers,
              'Set-Cookie': localDeviceCookie(
                config.teacherDeviceCookie,
                cookies[config.teacherDeviceCookie],
                config.deviceCredentialMaxAgeSeconds,
              ),
            }
          : headers;
        return sendJson(response, result.state === 'pending' ? 202 : 200, result, responseHeaders);
      }
      if (request.method === 'POST' && url.pathname === '/api/teacher/session/unlock') {
        const result = teacherAuth.unlock({ deviceToken: cookies[config.teacherDeviceCookie], pin: body.pin });
        return sendJson(response, 200, { status: 'unlocked' }, {
          ...headers,
          'Set-Cookie': [
            localDeviceCookie(
              config.teacherDeviceCookie,
              cookies[config.teacherDeviceCookie],
              config.deviceCredentialMaxAgeSeconds,
            ),
            localSessionCookie(config.teacherSessionCookie, result.sessionToken),
          ],
        });
      }
      if (request.method === 'POST' && url.pathname === '/api/teacher/session/logout') {
        teacherAuth.logout(cookies[config.teacherSessionCookie]);
        return sendJson(response, 200, { status: 'logged_out' }, {
          ...headers, 'Set-Cookie': localSessionCookie(config.teacherSessionCookie, '', { clear: true }),
        });
      }

      if (request.method === 'GET' && url.pathname.startsWith('/api/teacher/matches')) {
        const actor = teacherAuth.resolveDeviceSession({
          deviceToken: cookies[config.teacherDeviceCookie],
          sessionToken: cookies[config.teacherSessionCookie],
        });
        const today = japanDateKey(now());
        if (url.pathname === '/api/teacher/matches/today') {
          assertQueryKeys(url);
          return sendJson(response, 200, { date: today, matches: todayMatches(db, actor, today) }, headers);
        }
        if (url.pathname === '/api/teacher/matches/dates') {
          assertQueryKeys(url);
          return sendJson(response, 200, { dates: matchDates(db, actor) }, headers);
        }
        if (url.pathname === '/api/teacher/matches/by-date') {
          assertQueryKeys(url, ['date']);
          const date = requireDateKey(url.searchParams.get('date'));
          return sendJson(response, 200, { date, matches: matchesByDate(db, actor, date) }, headers);
        }
      }

      const participant = routeMatch(url.pathname, /^\/api\/teacher\/participants\/(?<participantId>[^/]+)\/matches$/);
      if (request.method === 'GET' && participant) {
        assertQueryKeys(url);
        const actor = teacherAuth.resolveDeviceSession({
          deviceToken: cookies[config.teacherDeviceCookie],
          sessionToken: cookies[config.teacherSessionCookie],
        });
        const participantId = decodeParticipantId(participant.participantId);
        return sendJson(response, 200, { matches: participantMatches(db, actor, participantId) }, headers);
      }

      sendJson(response, 404, { error: 'NOT_FOUND' }, headers);
    } catch (error) {
      sendError(response, error, headers);
    }
  };
}

export function createGateB1Application({
  dbPath = join(root, '.local', 'goencho-gate-b1.sqlite'),
  pepper = randomToken(32),
  now = () => Date.now(),
  config = CONFIG,
  seed = true,
} = {}) {
  assertRuntimeConfig(config, process.env.GOENCHO_MODE ?? 'local');
  mkdirSync(join(root, '.local'), { recursive: true });
  const db = openDatabase({ path: dbPath, seed });
  const ownerAuth = new OwnerAuthService({ db, pepper, now, config });
  const teacherAuth = new TeacherAuthService({ db, pepper, now, config });
  const ownerServer = http.createServer(ownerHandler({ ownerAuth, config }));
  const teacherServer = http.createServer(teacherHandler({ teacherAuth, db, config, now }));
  return {
    db, ownerAuth, teacherAuth, ownerServer, teacherServer,
    async start() {
      await Promise.all([
        new Promise((resolve, reject) => ownerServer.once('error', reject).listen(config.ownerPort, config.ownerHost, resolve)),
        new Promise((resolve, reject) => teacherServer.once('error', reject).listen(config.teacherPort, config.teacherHost, resolve)),
      ]);
    },
    async close() {
      await Promise.all([
        new Promise((resolve) => ownerServer.close(() => resolve())),
        new Promise((resolve) => teacherServer.close(() => resolve())),
      ]);
      db.close();
    },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const app = createGateB1Application();
  await app.start();
  process.stdout.write('Gate B1 local preview started on loopback ports 4191 and 4192.\n');
  const shutdown = async () => {
    await app.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
