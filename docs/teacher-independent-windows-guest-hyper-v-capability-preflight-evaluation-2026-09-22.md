# Independent Windows guest Hyper-V capability preflight evaluation — HOLD

## State

- Recorded: 2026-09-22 19:34 JST
- Classification: `INDEPENDENT_WINDOWS_GUEST_HYPER_V_CAPABILITY_PREFLIGHT_FAILED__WINDOWS_HOME_CORE_NOT_ELIGIBLE__STOPPED_AT_FIRST_GATE__HOLD`
- Baseline checkpoint: `6c503155326f154826e1a31e34cf234908346aea`
- Exact-plan checkpoint: `344d61f64b45d79963346d10efae031a52e766de`
- Exact-plan candidate: `docs/teacher-independent-windows-guest-build-boundary-exact-plan-candidate-2026-09-22.md`
- Current-task `NB-G4`: `NOT PROVEN — STOP`
- Evidence attempt: `0/1` unconsumed

## Authorized scope and stop rule

This evaluation was limited to read-only host-state inspection and local records. It did not authorize Windows or Hyper-V changes, guest artifacts, downloads, runtime changes, probes, builds, browser/HTTP use, commits, pushes, or external writes.

The approved questions had to be evaluated in the user's stated order. The first `NOT PROVEN` or incompatible condition required immediate stop with every later question left `NOT EVALUATED`.

## Start gate

- Branch: `codex/checkpoint-2026-09-04-passed`
- `HEAD`: `6c503155326f154826e1a31e34cf234908346aea`
- Upstream: `6c503155326f154826e1a31e34cf234908346aea`
- `origin/main`: `052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- Existing worktree: tracked changes `20`, untracked items `7,839`, staged changes `0`.
- The branch, `HEAD`, upstream, checkpoint records, and saved source hashes matched the checkpoint completion state.

## Read-only method

Only the following host facts were queried before the stop:

1. `HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion` values needed for edition/version classification.
2. `[Environment]::Is64BitOperatingSystem`.
3. `Win32_OperatingSystem` through `Get-CimInstance` as a corroborating query; this returned `Access is denied` and supplied no values.

The already-checkpointed exact plan defines `WG-G1` as requiring authoritative and compatible Hyper-V Gen2 capability, Windows edition/license, Secure Boot, and host virtualization state, with failure action `Do not create guest`.

No online documentation search was performed because browser and HTTP use were expressly prohibited. The saved exact-plan decision and the locally reported Windows edition were used; no new external claim or source was introduced.

## Ordered evaluation

### 1. Hyper-V-capable Windows edition/version

Observed host values:

| Field | Observed value |
| --- | --- |
| `ProductName` | `Windows 10 Home` |
| `EditionID` | `Core` |
| `DisplayVersion` | `25H2` |
| `CurrentBuild.UBR` | `26200.9457` |
| `InstallationType` | `Client` |
| 64-bit OS | `True` |

Decision: `FAIL — INCOMPATIBLE EDITION`.

`EditionID = Core` identifies the installed Home edition. The exact plan requires the host to be eligible for the Hyper-V Gen2 role; Windows Home/Core is not an eligible client edition for that role. A 64-bit OS does not cure the edition mismatch.

The marketing-name value (`Windows 10 Home`) and the version/build values (`25H2`, `26200.9457`) do not form a reliable product-name tuple. The decision therefore does not rely on whether the current marketing name should read Windows 10 or Windows 11; it relies only on the authoritative local edition identifier `Core`/Home. The failed CIM corroboration is retained as evidence and was not treated as permission to continue.

Stop action: `WG-G1` cannot PASS. Do not create a guest and do not proceed to `HV-S0`.

### 2–10. Later questions

All later questions are `NOT EVALUATED` because question 1 failed:

2. CPU virtualization and other hardware prerequisites.
3. Current Hyper-V-related Windows feature state.
4. Whether reboot or feature enablement would be required.
5. Existing Hyper-V VMs, virtual switches, or network configuration.
6. Possible impact of guest creation on existing networking or normal Codex use.
7. Ability to prohibit host mounts, clipboard, drive sharing, and Guest Services.
8. Trusted guest-image source and identity-verification method.
9. Independent management of guest-only VHDX, switch, and checkpoints.
10. Whether the prerequisites for `HV-S0..HV-S4` are authoritatively established.

No inference about these later questions is permitted from this evaluation.

## Safety ledger

- Hyper-V and Windows features: unchanged.
- BIOS/UEFI: unchanged.
- VM/VHDX/virtual switch/checkpoint: not created, started, mounted, or changed.
- Guest image: not downloaded or mounted.
- Candidate: not installed, moved, selected, or enabled.
- User config, Windows sandbox, session, and runtime: unchanged.
- Network/loopback probe: not performed.
- Copy/build/server/browser/HTTP: not performed.
- Evidence attempt: `0/1` unconsumed.
- Current-task `NB-G4`: remains `NOT PROVEN — STOP`.
- Commit/push: not performed.
- Public deployment, production data, and external services: unchanged.
- Pre-existing tracked `20` and untracked `7,839` items were not organized, modified, or staged.

## Decision

The current host cannot be accepted as the Hyper-V host for the independent Windows guest exact-plan candidate. The evaluation stopped at the first ordered condition, before CPU, feature, VM, switch, network, image, or checkpoint inspection.

Classification remains `HOLD`. No edition upgrade, feature enablement, reboot, alternate hypervisor, guest provisioning, or repair is authorized by this result.
