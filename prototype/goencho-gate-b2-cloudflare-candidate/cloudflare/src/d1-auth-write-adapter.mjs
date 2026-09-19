import { GoenchoD1AuthService } from './d1-auth-service.mjs';

// Compatibility boundary: the existing D1 auth engine implements the common
// atomic auth-write contract. New callers depend on this adapter name rather
// than importing a D1-specific service as their business API.
export class GoenchoD1AuthWriteAdapter extends GoenchoD1AuthService {}
