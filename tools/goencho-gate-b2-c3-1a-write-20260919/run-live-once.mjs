import { resolve } from 'node:path';
import { runBootstrapSafely } from './rest-bootstrap-core.mjs';
import { createLiveTransport, FIXED_ENDPOINT } from './live-transport.mjs';
import { createTokenReceiver } from './token-receiver.mjs';

const workspaceRoot = resolve(import.meta.dirname, '..', '..');
const live = createLiveTransport({ fetchLike: globalThis.fetch, timeoutMs: 30_000 });

function safeSummary(result, debug) {
  return {
    status: result?.status ?? 'STOPPED',
    phase: result?.phase ?? 'UNKNOWN',
    restore_timestamp_rfc3339: result?.restore_timestamp_rfc3339 ?? null,
    restore_timestamp_unix: result?.restore_timestamp_unix ?? null,
    transport_calls: Number.isInteger(result?.transport_calls) ? result.transport_calls : 0,
    client_attempts: Number.isInteger(result?.client_attempts) ? result.client_attempts : 0,
    live_client_attempts: Number.isInteger(debug?.client_attempts) ? debug.client_attempts : 0,
    bootstrap_requests: Number.isInteger(result?.bootstrap_requests) ? result.bootstrap_requests : 0,
    result_counts: result?.result_counts ?? null,
    safe_failure: result?.safe_failure ?? null,
    retry_performed: result?.retry_performed === true,
    restore_performed: result?.restore_performed === true,
    d1_migrations_touched: result?.d1_migrations_touched === true,
    token_stored: result?.token_stored === true,
    raw_response_stored: result?.raw_response_stored === true,
  };
}

let finalSummary = null;
const receiver = createTokenReceiver({
  closeAfterAccept: true,
  async onToken(tokenBuffer) {
    const transport = async ({ method, path, purpose, token, body }) => {
      const expectedPath = new URL(FIXED_ENDPOINT).pathname.replace('/client/v4', '');
      if (path !== expectedPath || token !== tokenBuffer) {
        const error = new Error('LOCAL_SCOPE');
        error.safeCode = 'LOCAL_SCOPE';
        error.classification = 'LOCAL_SCOPE';
        throw error;
      }
      const delivered = await live.send({ method, tokenBuffer, body });
      return delivered;
    };

    const result = await runBootstrapSafely({
      workspaceRoot,
      transport,
      token: tokenBuffer,
      now: new Date(),
    });
    const debug = live.getDebugState();
    if (result?.status === 'PASS' && result?.client_attempts !== debug.client_attempts) {
      finalSummary = safeSummary({
        ...result,
        status: 'STOPPED',
        phase: 'LIVE_CLIENT_ATTEMPTS_CHECK',
        safe_failure: {
          phase: 'LIVE_CLIENT_ATTEMPTS_CHECK',
          classification: 'REMOTE_ATTEMPTS_INVALID',
          http_status: null,
          cloudflare_numeric_codes: [],
          client_attempts: debug.client_attempts,
          total_attempts: null,
          safe_code: 'CLIENT_ATTEMPTS_MISMATCH',
        },
      }, debug);
    } else {
      finalSummary = safeSummary(result, debug);
    }
    process.stdout.write(`LIVE_RESULT_SAFE ${JSON.stringify(finalSummary)}\n`);
    process.stdout.write(`LIVE_TRANSPORT_RELEASED active=${debug.active_requests} raw_response=${debug.raw_response_held} raw_json=${debug.raw_json_held}\n`);
  },
});

const address = await receiver.listen();
process.stdout.write(`INPUT_WAITING_READY http://${address.host}:${address.port}/\n`);

const shutdown = async () => {
  await receiver.close().catch(() => {});
  process.exit(finalSummary?.status === 'PASS' ? 0 : 1);
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

while (!receiver.getState().server_closed) {
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
}

process.exit(finalSummary?.status === 'PASS' ? 0 : 1);
