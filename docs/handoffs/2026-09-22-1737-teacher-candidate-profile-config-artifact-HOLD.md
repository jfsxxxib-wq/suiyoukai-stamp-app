# Teacher candidate profile/config artifact — static validation HOLD

## Timestamp and scope

- Recorded: 2026-09-22 17:37 JST
- Branch: `codex/checkpoint-2026-09-04-passed`
- HEAD/upstream baseline: `6b4b0ba896ebe5415c0ac0a99c780c7e32c3fbd9`
- Local `origin/main`: `052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- Execution ID: `TEACHER_ANONYMOUS_API_SAFE_METADATA_EVIDENCE_20260922_01`
- Evidence attempt: `0/1` unchanged
- Authorization: create only an inert candidate profile/config artifact, statically compare and validate it, and record its identity

## Result

Classification:

`CANDIDATE_PROFILE_CONFIG_ARTIFACT_STATICALLY_VALID__NOT_INSTALLED__RUNTIME_ENFORCEMENT_NOT_PROVEN__HOLD`

The artifact faithfully represents the saved exact-plan candidate without widening its filesystem or network policy. It is stored only as documentation data and is not discoverable as an active `.codex`, `.agents`, user, or session configuration.

## Artifact identity

- Artifact: `docs/candidate-artifacts/teacher-separate-build-profile-20260922/teacher-build-evidence-offline-loopback-denied-20260922.config.toml`
- Artifact SHA-256: `723e738382ad15e2da3b2577c1761f3295a1ecdf5ce661a33289a45d6ad5dc0e`
- Artifact bytes: `1449`
- Record: `docs/candidate-artifacts/teacher-separate-build-profile-20260922/artifact-record.md`
- Record SHA-256: `420f2662667b4b32adadf2763cd6a593cf9f2a293154f77341a15a1558d7bd22`
- Source exact-plan SHA-256: `c0f0d7b68a8e3258840c0b39013a7805d3cdd1144b625fd29d4f790a71ad44c9`

## Validation

- TOML syntax: PASS using Python standard-library `tomllib`.
- Parsed exact-plan equality: PASS.
- Official OpenAI permission-profile schema/value allowlist: PASS for the current documentation snapshot.
- Exact workspace root and four write subtrees: PASS.
- `network_proxy=true`, command network enabled, no domains, no local literals, `allow_local_binding=false`: PASS.
- No upstream proxy, SOCKS5, Unix socket, `dangerously_*`, legacy `sandbox_mode`, or `sandbox_workspace_write`: PASS.
- Dedicated inactive location: PASS.

The checks are static. The artifact was not passed to Codex, selected, enabled, or runtime-parsed by a new session. Real-environment enforcement remains unproven.

## Preserved state

- Current-task `NB-G4` remains `NOT PROVEN — STOP`.
- No active profile/config created or changed.
- No profile selected or enabled; no new session started.
- No runtime boundary changed.
- No network/loopback probe, isolated copy, build, server, browser, or HTTP request.
- Evidence attempt remains `0/1`.
- Existing tracked changes and untracked files were not organized, modified, or staged.
- No commit, push, PR, deploy, publication, production-data operation, or external-service write.

## Next safe point

Stop. A later decision about selection/enablement or session startup requires separate approval and must begin with `PS-G0..PS-G10`. Static artifact validity does not authorize or satisfy runtime attestation.

HOLD.
