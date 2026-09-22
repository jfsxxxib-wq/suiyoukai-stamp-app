# Teacher candidate profile pre-selection attestation — NOT PROVEN / HOLD

## State

- Recorded: 2026-09-22 17:59 JST
- Classification: `CANDIDATE_PROFILE_PRE_SELECTION_ATTESTATION_NOT_PROVEN__LEGACY_SANDBOX_LOADED__WINDOWS_UNELEVATED__HOLD`
- Result: `docs/teacher-candidate-profile-pre-selection-read-only-attestation-result-2026-09-22.md`
- Result SHA-256: `8096accc353ffc58d36481b1aca53aafa29289516e9c299c9acf3935056d40ad`
- Candidate SHA-256: `723e738382ad15e2da3b2577c1761f3295a1ecdf5ce661a33289a45d6ad5dc0e`
- Current-task `NB-G4`: `NOT PROVEN — STOP`
- Evidence attempt: `0/1` unconsumed

## Start gate

- Branch: `codex/checkpoint-2026-09-04-passed`
- `HEAD`: `d571bb78379c5bcd07aab4a6a95d997497eb9f25`
- Upstream: `d571bb78379c5bcd07aab4a6a95d997497eb9f25`
- `origin/main`: `052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- Checkpoint candidate, artifact record, and preceding handoff hashes matched.
- Pre-existing worktree state before this investigation: tracked changes `20`, untracked items `7,839`, staged changes `0`.

## Completed read-only work

- Read official OpenAI documentation for permission profiles, configuration precedence and profile files, managed requirements, sandbox inheritance, separate tool surfaces, and native-Windows sandbox enforcement.
- Confirmed the correct future profile-file reference pattern is `$CODEX_HOME/<profile-name>.config.toml`, selected with `--profile <profile-name>`.
- Confirmed the candidate target is absent and the candidate remains inert under `docs/candidate-artifacts/`.
- Inspected only bounded configuration locations and safe key presence; no secrets or unrelated values were recorded.
- Stopped at `PA-G2`: the loaded user config contains `sandbox_mode = "workspace-write"`. Official semantics therefore select the legacy sandbox instead of the candidate permission profile unless a managed `allowed_permission_profiles` exception is authoritatively effective.
- Also observed `[windows] sandbox = "unelevated"`, which conflicts with the exact plan's elevated-only requirement.

## Not proven / not evaluated

- Effective exclusion of legacy sandbox settings: **NOT PROVEN — STOP**.
- Active proxy, effective empty external allowlist, effective loopback prohibition, elevated Windows enforcement, child/build-plugin inheritance, effective root/write boundary, and disabling or non-use of separate network surfaces: not evaluated as runtime attestations after the stop.
- The presence of safe values in the inert TOML remains a static fact only.

## Unchanged boundaries

- Candidate was not installed, moved, selected, enabled, or modified.
- No profile/config/session/runtime change was made and no new session was started.
- No network or loopback probe, isolated copy, build, server, browser, or HTTP action was performed.
- No commit or push was performed.
- Public deployment, production data, and external services were not changed.
- Existing tracked and untracked worktree items were not organized, modified, or staged.

## Safe restart point

Remain on `HOLD`. If work resumes, first read `docs/CURRENT.md` and the result above. Any attempt to remove or override legacy sandbox settings, change Windows sandbox implementation, add managed requirements, install/select the candidate, or start a session needs separate explicit approval. Do not consume Evidence attempt `0/1` and do not turn current-task `NB-G4` into PASS.
