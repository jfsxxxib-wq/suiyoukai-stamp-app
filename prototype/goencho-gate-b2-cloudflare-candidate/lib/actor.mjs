import { fail } from './errors.mjs';

export function rejectTeacherIdInput({ query = {}, body = {}, headers = {}, path = '' } = {}) {
  const forbiddenQuery = Object.keys(query).some((key) => /^(teacherId|teacher_id)$/i.test(key));
  const forbiddenBody = body && typeof body === 'object' && Object.keys(body).some((key) => /^(teacherId|teacher_id)$/i.test(key));
  const forbiddenHeader = Object.keys(headers).some((key) => /^(teacherId|teacher_id|x-teacher-id)$/i.test(key));
  const forbiddenPath = /\/teachers\/[^/]+(?:\/|$)|\/teacher_id\//i.test(path);
  if (forbiddenQuery || forbiddenBody || forbiddenHeader || forbiddenPath) {
    fail(400, 'TEACHER_ID_NOT_ACCEPTED', 'Teacher ID must be server determined');
  }
  return true;
}

export function rejectOwnerPinInput({ body = {}, headers = {} } = {}) {
  const forbiddenBody = body && typeof body === 'object'
    && Object.keys(body).some((key) => /^(ownerPin|owner_pin)$/i.test(key));
  const forbiddenHeader = Object.keys(headers).some((key) => /^x-owner-pin$/i.test(key));
  if (forbiddenBody || forbiddenHeader) {
    fail(400, 'OWNER_PIN_NOT_ACCEPTED', 'Owner PIN is accepted only by session unlock');
  }
  return true;
}
