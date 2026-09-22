# Teacher NB-G4 read-only evaluation — HOLD

## Timestamp

- 2026-09-22 16:17 JST

## Outcome

- Execution ID: `TEACHER_ANONYMOUS_API_SAFE_METADATA_EVIDENCE_20260922_01`
- Evidence attempt: `0/1` unchanged
- `NB-G0..NB-G3`: fixed PASS; not re-evaluated
- `NB-G4`: `NOT PROVEN — STOP`
- `NB-G5..NB-G7`: not evaluated
- `TW-G0..TW-G10`: not evaluated
- Overall classification: `ISOLATED_BUILD_SAFETY_BOUNDARY_NOT_RESOLVED`

The managed command-network boundary continues to prove non-loopback egress denial. It does not separately attest that local bind and loopback communication are denied. Saved Teacher-page records show that an earlier separately authorized local attempt bound `127.0.0.1:4181` and returned HTTP 200. No build-specific exact loopback-only exception has been fixed. Therefore neither permitted branch of `NB-G4` is proven.

## Record

- Result: `docs/teacher-anonymous-api-nb-g4-read-only-evaluation-result-2026-09-22.md`
- Result SHA-256: `15514097ea100172019c55bf1ac82bd901ace72e1389d7155b95090875344e9e`

## Preserved HOLD

- No network probe, isolated copy, build, server, browser, HTTP, real attempt, rollback, or config change.
- Source/tests/original `dist`, GitHub, deployment, publication, Production D1, formal data, and external services remain unchanged.

## Next safe resumption point

Only under separate approval, resolve `NB-G4` by obtaining an authoritative loopback-denial attestation or by defining and separately approving the exact build-specific loopback-only exception required by the plan. Do not enter `NB-G5` or TW-01 while `NB-G4` remains unproven.

HOLD.
