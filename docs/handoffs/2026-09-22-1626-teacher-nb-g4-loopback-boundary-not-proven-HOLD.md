# Teacher NB-G4 loopback boundary evaluation — HOLD

## Timestamp

- 2026-09-22 16:26 JST

## Outcome

- Execution ID: `TEACHER_ANONYMOUS_API_SAFE_METADATA_EVIDENCE_20260922_01`
- Evidence attempt: `0/1` unchanged
- `NB-G0..NB-G3`: fixed PASS; not re-evaluated
- `NB-G4`: `NOT PROVEN — STOP`
- `NB-G5..NB-G7`: not evaluated
- `TW-G0..TW-G10`: not evaluated
- Overall classification: `ISOLATED_BUILD_SAFETY_BOUNDARY_NOT_RESOLVED`

OpenAI Docs define an exact-local-IP allowlist mechanism for network-enabled, proxy-enforced permission profiles. They do not authoritatively establish that the current Windows network-disabled runtime denies local bind and loopback connection paths. No exact build-specific permission profile is selected or attested, the documented host policy is not port-scoped, and build necessity for loopback is not fixed.

The earlier `127.0.0.1:4181` result remains consistent: it proves local bind plus a separately controlled browser path was available for that authorized attempt, not that build-process loopback is available and not that external egress was available.

## Record

- Result: `docs/teacher-anonymous-api-nb-g4-loopback-boundary-evaluation-result-2026-09-22.md`
- Result SHA-256: `8cba281bc3ed3a54a59f9ad924a71603976afe8d1c874d65b639dfb250eb744f`

## Preserved HOLD

- No network/loopback probe, isolated copy, build, server, browser, HTTP, real attempt, rollback, config/profile change.
- Source/tests/original `dist`, GitHub, deployment, publication, Production D1, formal data, and external services remain unchanged.

## Next safe resumption point

Under separate approval, either obtain an authoritative current-runtime attestation covering local bind and loopback connection denial, or design a new separately configured build session/profile using an active proxy and exact loopback IP literals only. The latter is a new runtime boundary, not an already approved exception. Do not enter `NB-G5` or TW-01 while `NB-G4` remains unproven.

HOLD.
