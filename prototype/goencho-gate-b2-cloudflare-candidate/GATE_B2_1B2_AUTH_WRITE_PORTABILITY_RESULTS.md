# Gate B2-1B2 Auth Write Portability Results

Recorded: 2026-09-18 15:07 JST

## Decision

PASS. The local D1-to-Postgres migration-readiness check is frozen as complete.

No external database, Cloudflare Paid resource, Supabase project, production data, secret, route, deploy, commit, or push was used.

## Implemented boundary

- `portability/auth-write-contract.mjs`: ten auth-write operations shared by both database implementations.
- `portability/auth-write-service.mjs`: database-independent PIN format, owner authorization, display-name, purpose, and public operation validation.
- `portability/auth-write-api.mjs`: database-independent public status/body projection for parity tests.
- `cloudflare/src/d1-auth-write-adapter.mjs`: explicit D1 compatibility boundary.
- `portability/postgres-auth-write-adapter.mjs`: local Postgres implementation using explicit transactions, conditional updates, and normalized domain errors.
- `cloudflare/src/d1-auth-service.mjs`: injectable fake ID/token/hex factories for exact parity and a pending-only reject operation distinct from device revocation.

The contract covers:

1. owner bootstrap ticket and activation
2. owner recovery
3. initial teacher creation/enrollment
4. teacher enrollment ticket issuance
5. one-time ticket claim
6. initial PIN, new-device PIN verification, and PIN reset
7. owner device approval
8. owner device rejection
9. device revocation
10. all required one-time token consumption in those flows

## Local parity evidence

- D1 and PGlite/Postgres received the same fake time, IDs, tokens, confirmation values, and PIN codec output.
- owner activation, teacher registration, initial PIN, extra device, rejection, revocation, PIN reset, approval, and owner recovery ended with identical canonical table manifests.
- All relevant primary keys, full-row hashes, domain IDs, and foreign-key results matched.
- Public HTTP status and public response body matched for every scoped operation and replay error.
- Same bootstrap ticket, recovery code, enrollment ticket, claim token, PIN set, and pending-device approval were exercised with 20 concurrent calls; exactly one succeeded.
- approve-versus-reject ordering and simultaneous execution produced one terminal decision and the same result in both backends.
- Postgres failure injection covered every mutation boundary for owner activation, teacher creation, initial PIN, approval, rejection, revocation, PIN reset, and owner recovery; every failure restored the prior canonical snapshot.
- Existing D1 failure tests remained green, and a D1 reject failure test preserved the pending state.

## Test results

- Gate B1 regression: 168/168 passed.
- Cloudflare, migration, and auth portability: 56/56 passed.
- Total: 224/224 passed.
- New auth portability: 7/7 passed.
- Scope check: passed; 97 files, no route, no logs, isolated D1 placeholder only.
- Leak scan: passed; ten runtime secret markers absent from saved files, DB, public errors, and audit data.
- Gate B1 source manifest: all 57 source files unchanged.
- Syntax checks: passed.
- Wrangler dry-run: passed; no deploy; 20.01 KiB / gzip 5.47 KiB; only `GOENCHO_DB` and `ASSETS` bindings.

## Important boundary

- PGlite is a local Postgres engine and the concurrency checks are local-process checks. No remote Supabase or networked multi-node test was performed.
- The auth-write API comparator is an isolated candidate projection; no production route was added.
- Routine unlock, failed-PIN throttling as a standalone flow, inactivity lock, logout, and session refresh were outside this approved phase. The new-device path still verifies the existing PIN and preserves its current failure behavior.
- No database schema or migration file was changed.

## Freeze

- Do not add dual-write, CDC, live migration, or new migration features.
- The next step is to present the Workers Paid isolated-canary scope, tests, and stop conditions before creating any external resource.
