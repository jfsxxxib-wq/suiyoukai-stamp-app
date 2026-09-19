import { publicError } from '../lib/errors.mjs';

const OPERATIONS = Object.freeze({
  activateOwner: { status: 201, call: 'activateOwner', present: (value) => ({
    status: 'owner_active', recoveryCodes: value.recoveryCodes,
  }) },
  recoverOwner: { status: 200, call: 'recoverOwner', present: (value) => ({
    status: 'recovered', recoveryCodes: value.recoveryCodes,
  }) },
  createInitialTeacherEnrollment: {
    status: 201,
    call: 'createInitialTeacherEnrollment',
    present: (value) => ({ teacherId: value.teacherId, ticket: value.token, purpose: value.purpose }),
  },
  createTeacherEnrollment: {
    status: 201,
    call: 'createTeacherEnrollment',
    present: (value) => ({ status: 'ticket_created', ticket: value.token, purpose: value.purpose }),
  },
  claimEnrollment: {
    status: 200,
    call: 'claimEnrollment',
    present: ({ claimToken, purpose, displayName }) => ({ claimToken, purpose, displayName }),
  },
  setTeacherPin: {
    status: 202,
    call: 'setTeacherPin',
    present: ({ status, confirmationCode }) => ({ status, confirmationCode }),
  },
  approveTeacherDevice: { status: 200, call: 'approveTeacherDevice', present: (value) => value },
  rejectTeacherDevice: { status: 200, call: 'rejectTeacherDevice', present: (value) => value },
  revokeTeacherDevice: { status: 200, call: 'revokeTeacherDevice', present: (value) => value },
});

export async function invokeAuthWriteApi(service, operation, input) {
  const route = OPERATIONS[operation];
  if (!route) return { status: 404, body: { error: 'NOT_FOUND' } };
  try {
    const value = await service[route.call](input);
    return { status: route.status, body: route.present(value) };
  } catch (error) {
    return publicError(error);
  }
}
