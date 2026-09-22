# Teacher Hyper-V alternative boundary comparison — HOLD

## State

- Recorded: 2026-09-22 20:00 JST
- Classification: `HYPER_V_ALTERNATIVE_BOUNDARY_COMPARISON_COMPLETE__SEPARATE_ELIGIBLE_HOST_POTENTIAL__CURRENT_HOST_ALTERNATIVES_NOT_PROVEN_OR_INSUFFICIENT__NO_IMPLEMENTATION__HOLD`
- Comparison: `docs/teacher-hyper-v-alternative-safety-boundary-read-only-comparison-2026-09-22.md`
- Baseline checkpoint: `7069648d3f798362901bf3683aeff790e4ee4b80`
- Current-task `NB-G4`: `NOT PROVEN — STOP`
- Evidence attempt: `0/1` unconsumed

## Start gate

- Branch: `codex/checkpoint-2026-09-04-passed`
- `HEAD` and upstream: `7069648d3f798362901bf3683aeff790e4ee4b80`
- `origin/main`: `052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- Existing worktree at start: tracked changes `20`, untracked items `7,839`, staged changes `0`.
- Git/checkpoint state matched. Public deployment, production data, and external services were unchanged.

## Comparison result

Two route families were evaluated against host separation, filesystem/process/registry isolation, fail-closed egress, loopback denial, exact four-subtree writes, child/plugin inheritance, separate Codex tool surfaces, candidate-only selection, pre-build attestation, rollback/destruction, and Evidence-attempt separation.

1. A separately approved eligible Windows host running the saved dedicated Hyper-V Gen2 guest plan is `成立可能性あり` at the architecture level. It can preserve the existing plan and add physical separation, but no concrete host, guest, gateway, runtime enforcement, or attestation is proven.
2. Current-Host non-Hyper-V routes do not provide an authoritative candidate now:
   - isolated alternate-boot Windows and a third-party full-system Windows VM/emulator are `NOT PROVEN`;
   - WSL, Windows Sandbox, a Host-kernel container, and a separate user/process/AppContainer/worktree are `authoritativeに不成立` against the fixed Windows guest acceptance contract.

The current Host's installed software or alternative-hypervisor state was not probed. No product presence, compatibility, or trust is inferred.

## Decision

The only architecture-level path worth a next design-only step is a requirements manifest for a future concrete eligible host. That path still requires fresh `WG-G0..WG-G20`-equivalent evidence and does not authorize connecting to, changing, or provisioning any host.

No current-Host alternative may be installed, started, or selected from this comparison. Remain on `HOLD`.

## Preserved state

- Windows edition, Hyper-V/Windows features, BIOS/UEFI, user config, Windows sandbox, runtime, and session: unchanged.
- VM/container/guest/VHDX/switch/checkpoint/alternate-boot/software artifacts: not created, started, installed, uninstalled, downloaded, or mounted.
- Candidate: not installed, moved, selected, or enabled.
- Probe/copy/build/server/browser/HTTP: not performed.
- Evidence attempt: `0/1` unconsumed.
- Current-task `NB-G4`: remains `NOT PROVEN — STOP`.
- Commit/push: not performed.
- Public deployment, production data, and external services: unchanged.
- Existing tracked `20` and untracked `7,839` items were not organized, modified, or staged.

## Safe restart point

Remain on `HOLD`. A future turn may only design a requirements-only manifest for a separately approved eligible host, or separately approve product-specific official-documentation research for one precisely named current-Host full-system virtualization candidate. Do not implement either path from this comparison.
