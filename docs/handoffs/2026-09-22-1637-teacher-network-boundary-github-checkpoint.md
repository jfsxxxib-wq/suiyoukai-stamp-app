# Teacher Network Boundary — GitHub checkpoint

## Timestamp and scope

- Recorded: 2026-09-22 16:37 JST
- Branch: `codex/checkpoint-2026-09-04-passed`
- Pre-checkpoint HEAD: `7c5c4e6f14fae9141689323cd596e7fdc5c72be3`
- Local `origin/main`: `052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- Execution ID: `TEACHER_ANONYMOUS_API_SAFE_METADATA_EVIDENCE_20260922_01`

This handoff and the bounded Network Boundary plan/results/handoffs plus `docs/CURRENT.md` are the only authorized checkpoint scope. The resulting commit SHA is intentionally not embedded in this file because the file is part of that commit; Git metadata is the authoritative commit binding.

## Fixed checkpoint state

- `NB-G0..NB-G3`: fixed PASS
- `NB-G4`: `NOT PROVEN`
- `NB-G5..NB-G7`: not evaluated
- `TW-G0..TW-G10`: not evaluated
- Evidence attempt: `0/1` unconsumed
- Instrumentation source hashes: `6/6` match
- Existing `dist`: unchanged (`135` files, `2,239,925` bytes)
- Network/loopback probe, isolated copy, build, server, browser, HTTP: not executed in the NB-G4 evaluation
- Current managed runtime cannot authoritatively close `NB-G4`
- Next work is allowed only under separate approval to design a separate build profile/session as a new safety boundary

## Included root records

- `docs/teacher-anonymous-api-isolated-build-safety-boundary-exact-plan-2026-09-22.md`
- `docs/teacher-anonymous-api-isolated-build-safety-boundary-read-only-evaluation-result-2026-09-22.md`
- `docs/teacher-anonymous-api-nb-g2-authoritative-attestation-result-2026-09-22.md`
- `docs/teacher-anonymous-api-nb-g3-read-only-evaluation-result-2026-09-22.md`
- `docs/teacher-anonymous-api-nb-g3-effective-policy-resolution-result-2026-09-22.md`
- `docs/teacher-anonymous-api-nb-g4-read-only-evaluation-result-2026-09-22.md`
- `docs/teacher-anonymous-api-nb-g4-loopback-boundary-evaluation-result-2026-09-22.md`

## Included handoffs

- `docs/handoffs/2026-09-22-1533-teacher-isolated-build-safety-boundary-plan-HOLD.md`
- `docs/handoffs/2026-09-22-1541-teacher-isolated-build-safety-boundary-unresolved-HOLD.md`
- `docs/handoffs/2026-09-22-1551-teacher-nb-g2-authoritatively-closed-HOLD.md`
- `docs/handoffs/2026-09-22-1557-teacher-nb-g3-not-proven-HOLD.md`
- `docs/handoffs/2026-09-22-1608-teacher-nb-g3-authoritatively-closed-HOLD.md`
- `docs/handoffs/2026-09-22-1617-teacher-nb-g4-not-proven-HOLD.md`
- `docs/handoffs/2026-09-22-1626-teacher-nb-g4-loopback-boundary-not-proven-HOLD.md`
- `docs/handoffs/2026-09-22-1637-teacher-network-boundary-github-checkpoint.md`

`docs/CURRENT.md` is included as the mutable resumption pointer.

## Excluded state

- Application source and tests, generated `dist`, build inputs/outputs, and all unrelated dirty-worktree files are excluded from staging.
- No new build profile/session, config change, probe, copy, build, server, browser, or HTTP execution.
- No deploy, publication, Production D1/formal-data mutation, production-data change, or external-service change.

## HOLD

After the bounded commit and push are verified, stop. Do not proceed to `NB-G5`, TW-01, or a new build profile/session without separate approval.
