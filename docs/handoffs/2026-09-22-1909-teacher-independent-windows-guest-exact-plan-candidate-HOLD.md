# Teacher independent Windows guest exact-plan candidate — HOLD

## State

- Recorded: 2026-09-22 19:09 JST
- Classification: `INDEPENDENT_WINDOWS_GUEST_BUILD_BOUNDARY_EXACT_PLAN_CANDIDATE_ESTABLISHED__HYPER_V_GEN2_TOPOLOGY_FIXED__IMPLEMENTATION_AND_ENFORCEMENT_NOT_PROVEN__HOLD`
- Exact-plan candidate: `docs/teacher-independent-windows-guest-build-boundary-exact-plan-candidate-2026-09-22.md`
- Exact-plan candidate SHA-256: `e42372c7fbf7209fcea6f59b598d20438896f43601d82799a3632b698a06b464`
- Candidate static validation: `PASS`
- Candidate SHA-256: `723e738382ad15e2da3b2577c1761f3295a1ecdf5ce661a33289a45d6ad5dc0e`
- Current-task `NB-G4`: `NOT PROVEN — STOP`
- Evidence attempt: `0/1` unconsumed

## Start gate

- Branch: `codex/checkpoint-2026-09-04-passed`
- `HEAD`: `d071c7aa54973a87223c3915fe228857ebfce297`
- Upstream: `d071c7aa54973a87223c3915fe228857ebfce297`
- `origin/main`: `052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- Existing worktree at start: tracked changes `20`, untracked items `7,839`, staged changes `0`.
- CURRENT, no-command evaluation/handoff, dedicated-runtime evaluation, and candidate hashes matched the checkpoint.

## Completed design work

- Reused checkpointed official OpenAI documentation evidence; no browser or HTTP request was made.
- Fixed the guest technology to a dedicated Hyper-V Generation 2 VM. Windows Sandbox, WSL, containers, host worktrees, and a second normal-user process are not substitutes.
- Fixed guest-only VHDX/process/filesystem/registry/firewall/`CODEX_HOME`/requirements/network identities and prohibited writable host mounts, clipboard/drive sharing, Guest Services file copy, host LAN, and workflow use of PowerShell Direct.
- Fixed a guest-only candidate profile/config composition with no legacy sandbox keys and elevated-only guest requirements.
- Fixed active-proxy plus empty external allowlist, no loopback/local/private exceptions, exact four-subtree writes, child/build-plugin inheritance, and separate tool-surface disabling requirements.
- Separated design, host preflight, provisioning, boundary attestation, input import, build, and real Teacher evidence into distinct execution IDs; none before the final evidence phase consumes Evidence attempt `0/1`.
- Fixed Hyper-V checkpoints `HV-S0..HV-S4`, fail-closed rollback, quarantine, and separately approved destruction requirements.
- Fixed sequential gates `WG-G0..WG-G20` and required future evidence artifacts.

## Decision

The topology is established as an exact-plan candidate, but the Windows guest is not adopted as an active boundary. Implementation and enforcement remain unproven.

The first future work is read-only host capability/platform verification. Hyper-V capability, image/client identity, integration-channel closure, identity-bound control-plane egress, elevated guest enforcement, active proxy, loopback bind/connect denial, exact filesystem enforcement, child/plugin inheritance, separate tool surfaces, and checkpoint/revert integrity must all PASS before build.

Any NOT PROVEN or mismatch becomes `INDEPENDENT_WINDOWS_GUEST_BUILD_BOUNDARY_NOT_PROVEN__HOLD`. No repair, retry, fallback, or build follows automatically.

## Preserved state

- Host normal Codex environment, user config, and Windows sandbox: unchanged.
- Guest/VM/vSwitch/VHDX/checkpoint/requirements artifacts: not created or started.
- Candidate: not installed, moved, selected, enabled, or changed.
- Session/runtime: unchanged; no new session.
- Probe/copy/build/server/browser/HTTP: not performed.
- Evidence attempt: `0/1` unconsumed.
- Current-task `NB-G4`: remains `NOT PROVEN — STOP`.
- Commit/push: not performed.
- Public deployment, production data, and external services: unchanged.
- Existing tracked `20` and untracked `7,839` items were not organized, modified, or staged.

## Safe restart point

Remain on `HOLD`. A future step may only perform separately approved read-only host/Hyper-V platform verification. Do not create or start a guest, VM artifacts, requirements/config artifacts, switch/gateway, candidate session, probe, copy, or build from this design approval.
