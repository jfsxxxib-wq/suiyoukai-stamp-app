# Teacher candidate-selected / no-command contract — NOT ESTABLISHED / HOLD

## State

- Recorded: 2026-09-22 18:45 JST
- Classification: `CANDIDATE_SELECTED_NO_COMMAND_ATTESTATION_CONTRACT_NOT_AUTHORITATIVELY_ESTABLISHED__REQUIRED_RUNTIME_METADATA_SCHEMA_AND_FAIL_CLOSED_SESSION_TERMINATION_NOT_PROVEN__HOLD`
- Contract evaluation: `docs/teacher-candidate-selected-no-command-attestation-safety-contract-evaluation-2026-09-22.md`
- Contract evaluation SHA-256: `c5d5eb619542a89b6e8f432bdfae92be90321ed7ee22a503c52d053e59560e90`
- Candidate static validation: `PASS`
- Candidate SHA-256: `723e738382ad15e2da3b2577c1761f3295a1ecdf5ce661a33289a45d6ad5dc0e`
- Current-task `NB-G4`: `NOT PROVEN — STOP`
- Evidence attempt: `0/1` unconsumed

## Start gate

- Branch: `codex/checkpoint-2026-09-04-passed`
- `HEAD`: `00ec1fea13546cc0a50ed21ce725535684d3c247`
- Upstream: `00ec1fea13546cc0a50ed21ce725535684d3c247`
- `origin/main`: `052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- Existing worktree at start: tracked changes `20`, untracked items `7,839`, staged changes `0`.
- CURRENT, dedicated-runtime evaluation/handoff, pre-selection result, and candidate hashes matched the checkpoint.

## Completed design work

- Reused checkpointed official OpenAI documentation evidence; no browser or HTTP request was made.
- Defined `no-command` to exclude every shell/process, file read/write, tool, plugin/connector/MCP, web/browser/Computer Use, network probe, copy, build, escalation, retry, and fallback.
- Defined the mandatory trusted runtime metadata envelope for profile selection, complete config sources, legacy-key absence, effective elevated Windows implementation, active proxy, empty external/local allowlists, loopback denial, exact filesystem map, separate tool surfaces, and zero-command ledger.
- Fixed expected profile identity, workspace root, four write subpaths, network closure values, and `CSNC-G0..CSNC-G14`.
- Fixed fail-closed behavior: one missing or mismatched field means no command/tool, no repair/retry, and runtime-native termination with a final zero-ledger acknowledgement.

## Decision

The safety contract is **not authoritatively established**. Current checkpointed documentation does not establish:

- a versioned runtime-origin metadata schema containing all required effective fields;
- pre-tool delivery and runtime authenticity/integrity;
- actual elevated implementation and active-proxy fields;
- complete effective config/network/filesystem/tool-surface manifests;
- a trusted zero-command ledger; or
- a runtime-native no-command session-close acknowledgement.

The first unresolved prerequisite is `CSNC-G1`; `CSNC-G2` is independently unresolved. Candidate selection is not authorized. `HOLD`.

## Preserved state

- Candidate: not installed, moved, selected, enabled, or changed.
- Session/runtime: unchanged; no new session.
- Normal user config and Windows sandbox setting: unchanged.
- Guest and requirements artifact: not created.
- Probe/copy/build/server/browser/HTTP: not performed.
- Evidence attempt: `0/1` unconsumed.
- Current-task `NB-G4`: remains `NOT PROVEN — STOP`.
- Commit/push: not performed.
- Public deployment, production data, and external services: unchanged.
- Existing tracked `20` and untracked `7,839` items were not organized, modified, or staged.

## Safe restart point

Remain on `HOLD`. A future step may only resume after a separately approved, authoritative check for a supported runtime attestation schema and no-command close acknowledgement. Do not create artifacts, install/select the candidate, start a session, or substitute static config, UI labels, logs, environment reads, or probes for missing runtime metadata.
