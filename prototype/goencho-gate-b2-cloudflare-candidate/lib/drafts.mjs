const FORBIDDEN = /pin|token|cookie|ticket|recovery|pepper|hash/i;

export class DraftStore {
  constructor() {
    this.drafts = new Map();
  }

  put(authorizationId, draftId, value) {
    const keys = Object.keys(value ?? {});
    if (keys.some((key) => FORBIDDEN.test(key))) throw new Error('Draft contains forbidden field');
    this.drafts.set(`${authorizationId}:${draftId}`, structuredClone(value));
  }

  get(authorizationId, draftId) {
    const value = this.drafts.get(`${authorizationId}:${draftId}`);
    return value ? structuredClone(value) : null;
  }

  remove(authorizationId, draftId) {
    this.drafts.delete(`${authorizationId}:${draftId}`);
  }
}
