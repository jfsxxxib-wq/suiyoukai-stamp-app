# Teacher unspecified eligible Windows host requirements manifest — HOLD

## State

- Recorded: 2026-09-22 20:14 JST
- Classification: `HOST_UNSPECIFIED_ELIGIBLE_WINDOWS_HOST_REQUIREMENTS_MANIFEST_ESTABLISHED__NO_HOST_SELECTED__ALL_RUNTIME_ENFORCEMENT_UNPROVEN__HOLD`
- Manifest: `docs/teacher-unspecified-eligible-windows-host-requirements-manifest-2026-09-22.md`
- Manifest ID: `TEACHER-ELIGIBLE-WINDOWS-HOST-BOUNDARY-REQ-20260922-V1`
- Baseline checkpoint: `e389715daa875b78e759301ebffc0c83c07eaa03`
- Current-task `NB-G4`: `NOT PROVEN — STOP`
- Evidence attempt: `0/1` unconsumed

## Start gate

- Branch: `codex/checkpoint-2026-09-04-passed`
- `HEAD` and upstream: `e389715daa875b78e759301ebffc0c83c07eaa03`
- `origin/main`: `052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- Existing worktree at start: tracked changes `20`, untracked items `7,839`, staged changes `0`.
- Git/checkpoint state matched. Public deployment, production data, and external services were unchanged.

## Completed

- Established `EH-R00..EH-R23`: 22 mandatory requirements plus two optional hardening/retention requirements.
- Every requirement has a level, PASS evidence, `NOT PROVEN` condition, and `FAIL` condition.
- Fixed host/Windows/Hyper-V/CPU/firmware eligibility, normal-Host non-interference, trusted image identity, guest-only artifacts and integrations, candidate-only config, elevated-only implementation, active proxy/empty allowlist, loopback denial, exact four-subtree writes, child/plugin inheritance, separate tool-surface disabling, pre-build attestation, rollback/quarantine/destruction, and Evidence-attempt separation.
- Fixed pre-build evidence bundle `E-01..E-17` and phase separation. Any mandatory unknown stops before host adoption or the next phase.
- No current vendor/OpenAI documentation was fetched because network/HTTP was prohibited. Current-version compatibility must be supplied as future authoritative evidence; absence is `NOT PROVEN`.

## Decision

The host-unspecified evidence contract is established, but no host is selected, contacted, inspected, or approved. No host can PASS the manifest now. Runtime enforcement and attestation remain unproven, so the state is `HOLD`.

The manifest does not authorize host search/connection, provisioning, requirements/config creation, candidate selection, VM creation, attestation, copy, build, server, browser, or HTTP.

## Preserved state

- Host discovery/connection: not performed.
- Network/HTTP: not used.
- Windows/Hyper-V/BIOS/runtime/session/user config/Windows sandbox: unchanged.
- VM/guest/software and guest runtime `requirements.toml`/config artifacts: not created, started, installed, or changed. The evidence requirements manifest is the only new requirements-named document.
- Candidate: not installed, moved, selected, or enabled.
- Probe/copy/build/server/browser: not performed.
- Evidence attempt: `0/1` unconsumed.
- Current-task `NB-G4`: remains `NOT PROVEN — STOP`.
- Commit/push: not performed.
- Public deployment, production data, and external services: unchanged.
- Existing tracked `20` and untracked `7,839` items were not organized, modified, or staged.

## Safe restart point

Remain on `HOLD`. A future separately approved step may statically validate this manifest for completeness/consistency or create a host-selection evidence intake template. Do not search for or connect to a host from this manifest approval.
