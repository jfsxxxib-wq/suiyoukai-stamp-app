export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}

export function fail(status, code, message) {
  throw new AppError(status, code, message);
}

export function publicError(error) {
  if (error instanceof AppError) {
    return { status: error.status, body: { error: error.code } };
  }
  return { status: 503, body: { error: 'SERVICE_UNAVAILABLE' } };
}
