const MAX_BODY_BYTES = 64 * 1024;
const MAX_ERROR_CODES = 8;
const MAX_OBJECT_DEPTH = 32;
const MAX_OBJECT_NODES = 4096;

const OPERATIONS = new Set([
  'token-verify',
  'd1-list',
  'd1-create',
  'worker-list',
  'worker-subdomain',
  'worker-version-settings',
  'worker-script-settings',
  'worker-secrets',
  'worker-schedules',
]);
const OUTPUT_KEYS = Object.freeze([
  'schema_version',
  'operation',
  'outcome',
  'http_status',
  'error_codes',
  'category',
  'response_format',
]);

export class SanitizerInputError extends Error {
  constructor(code) {
    super('Sanitizer input rejected');
    this.name = 'SanitizerInputError';
    this.code = code;
  }
}

function fixedInputError(code) {
  return new SanitizerInputError(code);
}

function readOwnDataProperty(object, key) {
  let descriptor;
  try {
    descriptor = Object.getOwnPropertyDescriptor(object, key);
  } catch {
    return { safe: false, present: false, value: undefined };
  }
  if (!descriptor) return { safe: true, present: false, value: undefined };
  if (!('value' in descriptor)) return { safe: false, present: true, value: undefined };
  return { safe: true, present: true, value: descriptor.value };
}

function utf8Bytes(value) {
  return new TextEncoder().encode(value).byteLength;
}

function measurePlainData(root) {
  const seen = new Set();
  const stack = [{ value: root, depth: 0 }];
  let bytes = 0;
  let nodes = 0;

  while (stack.length > 0) {
    const { value, depth } = stack.pop();
    nodes += 1;
    if (nodes > MAX_OBJECT_NODES || depth > MAX_OBJECT_DEPTH) return { safe: false };

    if (value === null || value === undefined) continue;
    if (typeof value === 'string') {
      bytes += utf8Bytes(value);
    } else if (typeof value === 'number' || typeof value === 'bigint') {
      bytes += 8;
    } else if (typeof value === 'boolean') {
      bytes += 1;
    } else if (typeof value === 'object') {
      if (seen.has(value)) return { safe: false };
      seen.add(value);

      let keys;
      try {
        keys = Object.keys(value);
      } catch {
        return { safe: false };
      }

      for (const key of keys) {
        bytes += utf8Bytes(key);
        if (bytes > MAX_BODY_BYTES) return { safe: false };
        const property = readOwnDataProperty(value, key);
        if (!property.safe) return { safe: false };
        stack.push({ value: property.value, depth: depth + 1 });
      }
    } else {
      return { safe: false };
    }

    if (bytes > MAX_BODY_BYTES) return { safe: false };
  }

  return { safe: true };
}

function inspectBody(bodyProperty) {
  if (!bodyProperty.safe) {
    return { safe: false, parsed: null, format: 'absent' };
  }
  if (!bodyProperty.present || bodyProperty.value === undefined) {
    return { safe: true, parsed: null, format: 'absent' };
  }

  const body = bodyProperty.value;
  if (typeof body === 'string') {
    if (utf8Bytes(body) > MAX_BODY_BYTES) {
      return { safe: false, parsed: null, format: 'non_json' };
    }
    try {
      const parsed = JSON.parse(body);
      const measured = measurePlainData(parsed);
      return { safe: measured.safe, parsed: measured.safe ? parsed : null, format: 'json' };
    } catch {
      return { safe: true, parsed: null, format: 'non_json' };
    }
  }

  if (body === null || typeof body === 'object') {
    const measured = measurePlainData(body);
    return { safe: measured.safe, parsed: measured.safe ? body : null, format: 'json' };
  }

  return { safe: false, parsed: null, format: 'non_json' };
}

function normalizeStatus(value) {
  return Number.isInteger(value) && value >= 100 && value <= 599 ? value : null;
}

function extractEnvelopeSuccess(parsed) {
  if (!parsed || typeof parsed !== 'object') return undefined;
  const property = readOwnDataProperty(parsed, 'success');
  if (!property.safe) return undefined;
  return property.present && typeof property.value === 'boolean' ? property.value : undefined;
}

function extractErrorCodes(parsed) {
  if (!parsed || typeof parsed !== 'object') return [];
  const errorsProperty = readOwnDataProperty(parsed, 'errors');
  if (!errorsProperty.safe || !Array.isArray(errorsProperty.value)) return [];

  const codes = new Set();
  for (const error of errorsProperty.value) {
    if (!error || typeof error !== 'object') continue;
    const codeProperty = readOwnDataProperty(error, 'code');
    if (!codeProperty.safe || !codeProperty.present) continue;
    const code = codeProperty.value;
    if (!Number.isSafeInteger(code) || code < 0 || code > 2_147_483_647) continue;
    codes.add(code);
  }
  return [...codes].sort((left, right) => left - right).slice(0, MAX_ERROR_CODES);
}

function classify(status, transportFailure, unsafeBody) {
  if (transportFailure) return 'transport_error';
  if (unsafeBody) return 'unknown';
  if (status !== null && status >= 200 && status <= 299) return 'success';
  if (status === 400) return 'bad_request';
  if (status === 401) return 'authentication';
  if (status === 403) return 'authorization';
  if (status === 409) return 'conflict';
  if (status === 429) return 'rate_limited';
  if (status !== null && status >= 500) return 'server_error';
  return 'unknown';
}

function createOutput(values) {
  const output = Object.create(null);
  for (const key of OUTPUT_KEYS) output[key] = values[key];
  Object.freeze(output.error_codes);
  return Object.freeze(output);
}

export function sanitizeCloudflareResult(input) {
  if (!input || typeof input !== 'object') throw fixedInputError('INVALID_INPUT');

  const operationProperty = readOwnDataProperty(input, 'operation');
  if (!operationProperty.safe || !OPERATIONS.has(operationProperty.value)) {
    throw fixedInputError('INVALID_OPERATION');
  }
  const operation = operationProperty.value;

  const transportProperty = readOwnDataProperty(input, 'transportError');
  const transportFailure = !transportProperty.safe || (
    transportProperty.present && transportProperty.value !== null && transportProperty.value !== undefined
  );

  if (transportFailure) {
    return createOutput({
      schema_version: 1,
      operation,
      outcome: 'failure',
      http_status: null,
      error_codes: [],
      category: 'transport_error',
      response_format: 'absent',
    });
  }

  const statusProperty = readOwnDataProperty(input, 'httpStatus');
  const status = statusProperty.safe ? normalizeStatus(statusProperty.value) : null;
  const body = inspectBody(readOwnDataProperty(input, 'body'));
  const category = classify(status, false, !body.safe);
  const envelopeSuccess = body.safe ? extractEnvelopeSuccess(body.parsed) : undefined;
  const success = category === 'success' && envelopeSuccess !== false;

  return createOutput({
    schema_version: 1,
    operation,
    outcome: success ? 'success' : 'failure',
    http_status: status,
    error_codes: body.safe ? extractErrorCodes(body.parsed) : [],
    category: success ? 'success' : category === 'success' ? 'unknown' : category,
    response_format: body.format,
  });
}
