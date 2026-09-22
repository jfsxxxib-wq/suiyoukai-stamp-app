# Teacher candidate dedicated runtime boundary plan — NOT ESTABLISHED / HOLD

## State

- Recorded: 2026-09-22 18:19 JST
- Classification: `CANDIDATE_DEDICATED_RUNTIME_BOUNDARY_EXACT_PLAN_NOT_AUTHORITATIVELY_ESTABLISHED__PRESELECTION_EFFECTIVE_RUNTIME_ATTESTATION_UNAVAILABLE__SAME_HOST_ELEVATED_ONLY_NOT_ZERO_IMPACT__HOLD`
- Plan evaluation: `docs/teacher-candidate-dedicated-runtime-boundary-exact-plan-evaluation-2026-09-22.md`
- Plan evaluation SHA-256: `33fb0cecd39023661375ca56d1912fe0eb08b7311be4dee18059cdb32ed2f109`
- Candidate static validation: `PASS`
- Candidate SHA-256: `723e738382ad15e2da3b2577c1761f3295a1ecdf5ce661a33289a45d6ad5dc0e`
- Current-task `NB-G4`: `NOT PROVEN — STOP`
- Evidence attempt: `0/1` unconsumed

## Start gate

- Branch: `codex/checkpoint-2026-09-04-passed`
- `HEAD`: `e38e9e2681ec4cd4de9e01d59b3136c3f148498d`
- Upstream: `e38e9e2681ec4cd4de9e01d59b3136c3f148498d`
- `origin/main`: `052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- Existing worktree at start: tracked changes `20`, untracked items `7,839`, staged changes `0`.
- CURRENT, preceding handoff, attestation result, and candidate hashes matched the checkpoint.

## Completed design work

- Reused the checkpointed official OpenAI documentation evidence and performed bounded local read-only inspection. No browser or HTTP request was made in this turn.
- Evaluated a same-host alternate-`CODEX_HOME` boundary. It can exclude the normal user config, but it cannot make host-scoped Windows elevated-only requirements and elevated setup zero-impact for the normal environment.
- Evaluated a disposable dedicated Windows guest boundary. It can isolate host-level requirements and rollback by destroying/reverting the guest.
- Fixed the conditional guest topology, config-source manifest, elevated-only guest requirements, profile uniqueness, proxy/allowlist/loopback/write gates, separate tool-surface gate, and fail-closed sequence.
- Identified `DR-G8` as the first unresolved gate: no authoritative pre-selection interface was established that proves the actual elevated implementation and active proxy while the candidate remains unselected.
- Rejected a bootstrap-attestor substitution because it cannot prove the later candidate profile's active runtime without candidate selection.

## Decision

The exact plan is **not authoritatively established** under the requested contract. A same-host plan violates zero-impact elevated-only isolation; a guest plan remains conditional and cannot satisfy the candidate-unselected runtime attestation requirement.

No implementation artifact, guest, requirements file, config, profile, or session was created or changed. `HOLD`.

## Preserved state

- Normal user config and Windows sandbox setting: unchanged.
- Candidate: not installed, moved, selected, enabled, or changed.
- Session/runtime: unchanged; no new session.
- Probe/copy/build/server/browser/HTTP: not performed.
- Evidence attempt: `0/1` unconsumed.
- Current-task `NB-G4`: remains `NOT PROVEN — STOP`.
- Commit/push: not performed.
- Public deployment, production data, and external services: unchanged.
- Existing tracked `20` and untracked `7,839` items were not organized, modified, or staged.

## Safe restart point

Remain on `HOLD`. A later step must separately choose one of: obtain a supported no-session effective-runtime attestation interface; explicitly permit a candidate-selected/no-command attestation session; or adopt an independently enforced guest boundary. Do not infer authorization to provision a guest, create config/requirements artifacts, select a profile, or start a session.
