# Teacher isolated-build safety boundary plan — HOLD

## Timestamp

- 2026-09-22 15:33 JST

## Scope

- Execution ID: `TEACHER_ANONYMOUS_API_SAFE_METADATA_EVIDENCE_20260922_01`
- Attempt: `0/1` unchanged
- Planned: NB-01 no-network enforcement and TW-01 isolated-root tool-state allowlist
- Not performed: isolated copy, build, server/browser/HTTP, real attempt, rollback

## Result

- NB-01 preferred mechanism: `NB01_MANAGED_SANDBOX_EXTERNAL_DENY` using only the managed default sandbox, no escalation, no host firewall/security mutation, and inherited restriction for all descendants/plugins.
- Build loopback is denied by default; a loopback-only exception requires separate evidence and cannot allow non-loopback access.
- TW-01 exact candidate allowlist: `dist/**`, `.wrangler/**`, `node_modules/.vite/**`, and `.tmp/**` only.
- Wrangler/Miniflare/temp locations are fixed through child-only environment overlays; HOME, USERPROFILE, CODEX_HOME, PATH, secrets, and system settings remain unchanged.
- Every non-allowlisted isolated input remains hash-protected; unexpected writes invalidate the build with no retry/repair.
- NB and TW Gates must both close before isolated whole-build re-evaluation.
- The unchanged original `dist` has legacy current-culture inventory hash `0fca...`; the exact future ordinal manifest hash is fixed separately as `112061...` so the two ordering algorithms cannot be mixed.

## Durable plan

- Plan: `docs/teacher-anonymous-api-isolated-build-safety-boundary-exact-plan-2026-09-22.md`
- Plan SHA-256: `d42ac51b9032bb4b1feca1409a5546d34e7da59e9130c8d3d514f1667812875b`

## Safety state

- Candidate isolated root remains absent.
- Source/tests/original `dist` and existing uncommitted changes remain untouched.
- No network probe or external communication occurred.
- GitHub/deploy/publication/Production D1/formal data/external services: unchanged.
- Branch: `codex/checkpoint-2026-09-04-passed`
- HEAD: `7c5c4e6f14fae9141689323cd596e7fdc5c72be3`
- `origin/main`: `052c787b947bf5630fbd62f0ff168c8ec7a3506b`

## Next safe resumption point

Under separate approval, evaluate the NB/TW pre-copy readiness Gates. Do not create the isolated root or run a build merely because this plan exists.

HOLD.
