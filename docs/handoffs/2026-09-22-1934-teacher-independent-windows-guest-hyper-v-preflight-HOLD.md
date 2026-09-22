# Teacher independent Windows guest Hyper-V preflight — HOLD

## State

- Recorded: 2026-09-22 19:34 JST
- Classification: `INDEPENDENT_WINDOWS_GUEST_HYPER_V_CAPABILITY_PREFLIGHT_FAILED__WINDOWS_HOME_CORE_NOT_ELIGIBLE__STOPPED_AT_FIRST_GATE__HOLD`
- Evaluation: `docs/teacher-independent-windows-guest-hyper-v-capability-preflight-evaluation-2026-09-22.md`
- Exact-plan candidate: `docs/teacher-independent-windows-guest-build-boundary-exact-plan-candidate-2026-09-22.md`
- Current-task `NB-G4`: `NOT PROVEN — STOP`
- Evidence attempt: `0/1` unconsumed

## Start gate

- Branch: `codex/checkpoint-2026-09-04-passed`
- `HEAD` and upstream: `6c503155326f154826e1a31e34cf234908346aea`
- `origin/main`: `052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- Existing worktree at start: tracked changes `20`, untracked items `7,839`, staged changes `0`.
- The Git and checkpoint state matched. No task change had started before the gate completed.

## Result

The first approved question failed. Read-only registry inspection reported `EditionID = Core` and `ProductName = Windows 10 Home`, with `DisplayVersion = 25H2`, build `26200.9457`, client installation, and a 64-bit OS.

The exact plan's `WG-G1` requires an authoritative, compatible Windows edition and Hyper-V Gen2 capability. Home/Core is not eligible for the required Hyper-V client role, so `WG-G1` cannot PASS and the guest must not be created. The product-name/version tuple was not used to distinguish Windows 10 from Windows 11; the stop rests on the local edition identifier. A corroborating `Win32_OperatingSystem` CIM query returned `Access is denied` and no values.

Per the approved first-failure rule, the following were not evaluated: CPU virtualization, Hyper-V feature state, reboot/enablement need, existing VM/switch/network state, network/Codex impact, integration-channel prohibitions, trusted image identity, guest-only artifact management, and `HV-S0..HV-S4` readiness.

## Preserved state

- Hyper-V/Windows/BIOS/UEFI/runtime configuration: unchanged.
- Guest/VM/VHDX/vSwitch/checkpoint/requirements artifacts: not created or started.
- Guest image: not downloaded or mounted.
- Candidate: not installed, moved, selected, or enabled.
- User config and Windows sandbox: unchanged.
- Probe/copy/build/server/browser/HTTP: not performed.
- Evidence attempt: `0/1` unconsumed.
- Current-task `NB-G4`: remains `NOT PROVEN — STOP`.
- Commit/push: not performed.
- Public deployment, production data, and external services: unchanged.
- Existing tracked `20` and untracked `7,839` items were not organized, modified, or staged.

## Safe restart point

Remain on `HOLD`. Do not continue the ordered host evaluation on this host and do not enable features or provision a guest. Any proposal to use a different eligible host or change the Windows edition is a separate plan and requires separate approval.
