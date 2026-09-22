# Hyper-V alternative safety-boundary read-only comparison — HOLD

## State

- Recorded: 2026-09-22 20:00 JST
- Classification: `HYPER_V_ALTERNATIVE_BOUNDARY_COMPARISON_COMPLETE__SEPARATE_ELIGIBLE_HOST_POTENTIAL__CURRENT_HOST_ALTERNATIVES_NOT_PROVEN_OR_INSUFFICIENT__NO_IMPLEMENTATION__HOLD`
- Baseline checkpoint: `7069648d3f798362901bf3683aeff790e4ee4b80`
- Exact-plan candidate: `docs/teacher-independent-windows-guest-build-boundary-exact-plan-candidate-2026-09-22.md`
- Current-host preflight: `docs/teacher-independent-windows-guest-hyper-v-capability-preflight-evaluation-2026-09-22.md`
- Current-task `NB-G4`: `NOT PROVEN — STOP`
- Evidence attempt: `0/1` unconsumed

## Scope and evidence limit

The comparison is limited to two route families:

1. use a different eligible host; or
2. use a non-Hyper-V independent boundary on the current Host without changing its Windows edition.

No browser or HTTP request was made. Current vendor documentation, product versions, licensing, installed-software inventory, feature state, hardware capability, or runtime behavior was not probed. The comparison therefore uses only checkpointed OpenAI Docs conclusions and the existing local design/evaluation records. A platform-specific property not fixed by those records is `NOT PROVEN`.

The labels mean:

- `成立可能性あり`: no fixed requirement contradiction was found at the architecture level; a future exact plan and full attestation are still mandatory.
- `authoritativeに不成立`: the candidate conflicts with a mandatory boundary property already fixed by the checkpointed acceptance contract. This is not a general claim that the technology has no security value.
- `NOT PROVEN`: no contradiction is established, but the evidence needed to accept the candidate is unavailable.

## Non-negotiable acceptance contract

Any replacement must equal or exceed the saved Windows guest exact plan on all of these dimensions:

1. no impact on the normal Host Codex environment;
2. independent filesystem, process, and registry domains;
3. command egress fail-closed behind an active proxy and an independently denying gateway;
4. loopback bind/connect denied;
5. writes limited to the exact four approved subtrees;
6. identical enforcement for child processes and build plugins;
7. plugins, connectors, MCP, web, browser, Computer Use, cloud, and other network surfaces disabled or unavailable;
8. only the hash-fixed candidate profile, with no legacy sandbox keys or fallback;
9. effective boundary attested before project build;
10. deterministic rollback/quarantine/destruction; and
11. complete separation from Evidence attempt `0/1`.

The existing runtime gaps also remain binding: actual elevated implementation, active proxy, loopback bind denial, exact write enforcement, child/plugin inheritance, separate tool-surface state, and complete pre-build effective-runtime evidence are not yet authoritative.

## Candidate summary

| ID | Route | Overall classification | Reason |
| --- | --- | --- | --- |
| `ALT-A` | Different eligible Windows host plus the existing dedicated Hyper-V Gen2 guest exact plan | `成立可能性あり` | Preserves the already designed guest topology and can add physical separation from the current Host. No specific host or enforcement has been proven. |
| `ALT-B` | Current hardware booted into a dedicated Windows environment on separate media, with normal Host storage physically inaccessible | `NOT PROVEN` | Could create a separate OS/process/registry domain, but boot trust, storage exclusion, licensing, firmware impact, network enforcement, and reproducible rollback are not established. |
| `ALT-C` | Third-party full-system Windows VM/emulator on the current Host | `NOT PROVEN` | Full-system isolation is conceptually relevant, but no product/version/security model, host driver impact, integration-channel closure, network gateway, or attestation path is fixed. |
| `ALT-D` | WSL/WSL2 boundary | `authoritativeに不成立` | It is not the required independent Windows guest and cannot attest the Windows `elevated` sandbox/registry contract. The saved exact plan explicitly rejects WSL as an equivalent substitute. |
| `ALT-E` | Windows Sandbox | `authoritativeに不成立` | It is not a non-Hyper-V route, the current Home/Core Host failed the required edition gate, and the saved exact plan explicitly rejects Windows Sandbox as equivalent. |
| `ALT-F` | Container sharing the Host kernel | `authoritativeに不成立` | It lacks an independent kernel/registry boundary; a container backed by a separate full VM is evaluated as `ALT-C`, not as this candidate. |
| `ALT-G` | Separate user/process, AppContainer-only boundary, or Host worktree | `authoritativeに不成立` | It does not isolate host-wide requirements, registry/policy, runtime state, or the normal Host kernel; the saved exact plan rejects these same-host shapes. |

## Mandatory-control comparison

`POTENTIAL` means designable in principle but not attested. `FAIL` means a fixed acceptance requirement is contradicted. `NP` means `NOT PROVEN`.

| Control | `ALT-A` eligible host + Hyper-V guest | `ALT-B` isolated alternate boot | `ALT-C` third-party full VM | `ALT-D` WSL | `ALT-E` Windows Sandbox | `ALT-F` host-kernel container | `ALT-G` user/process/worktree |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Normal Host separation | `POTENTIAL` — different physical host plus guest | `NP` — requires physical storage exclusion and no persistent firmware/boot change | `NP` — Host hypervisor/drivers/config remain in normal OS | `FAIL` — Host integration and shared Host control remain | `FAIL` — wrong route and current edition gate | `FAIL` — Host kernel/control plane shared | `FAIL` — normal OS and Host policy shared |
| Filesystem/process/registry isolation | `POTENTIAL` — full Windows guest | `POTENTIAL` — separate booted Windows if Host disks are inaccessible | `POTENTIAL` — full-system Windows guest | `FAIL` — no independent Windows registry/elevated-sandbox domain | `POTENTIAL` internally, but route already fails | `FAIL` — Host kernel/registry boundary incomplete | `FAIL` |
| External egress fail-closed | `NP` — exact gateway/proxy and identity binding unproven | `NP` | `NP` | `NP`, and fatal platform mismatch remains | `NP` | `NP` | `NP`; process policy alone is insufficient |
| Loopback deny | `NP` — bind/connect attestation remains open | `NP` | `NP` | `NP`; Host/guest integration adds ambiguity | `NP` | `NP` | `NP` |
| Exact four-subtree writes | `NP` — elevated Windows enforcement must attest | `NP` | `NP` | `FAIL` — fixed Windows path/enforcement contract is not preserved | `NP` | `NP` | `FAIL` — host-wide/temp/link escape boundary not established |
| Child/build-plugin inheritance | `NP` | `NP` | `NP` | `NP` plus platform mismatch | `NP` | `NP` | `FAIL` — same-user helpers can escape the intended logical boundary |
| MCP/connector/browser surfaces disabled | `NP` — managed requirements/effective inventory needed | `NP` | `NP` | `NP` | `NP` | `NP` | `NP` |
| Candidate profile only | `POTENTIAL` — guest-only `CODEX_HOME` and requirements | `POTENTIAL` in separate OS; effective selection unproven | `POTENTIAL`; effective selection unproven | `FAIL` — Windows-specific candidate enforcement cannot be preserved | `NP` | `NP` | `FAIL` — host-scoped requirements collide with normal environment |
| Pre-build effective attestation | `NP` — saved CSNC/DR runtime gaps remain | `NP` | `NP` | `FAIL` relative to Windows contract | `NP` | `NP` | `FAIL` |
| Rollback/quarantine/destruction | `POTENTIAL` — saved `HV-S0..HV-S4` design | `NP` — clean reimage/physical-media process not fixed | `POTENTIAL` snapshots/disks, but product semantics unproven | `NP` | `NP` | `NP` | `FAIL` — cannot roll back host-wide changes independently |
| Evidence attempt separation | `POTENTIAL` — saved phase IDs remain reusable | `POTENTIAL` by separate execution IDs | `POTENTIAL` by separate execution IDs | `POTENTIAL`, but fatal boundary mismatch remains | `POTENTIAL`, but fatal route mismatch remains | `POTENTIAL`, but fatal isolation mismatch remains | `FAIL` as a complete safety boundary |

## Route 1 decision — different eligible host

`ALT-A` is the only route classified `成立可能性あり`.

The future host must be separately identified and must pass a fresh equivalent of `WG-G0..WG-G20`. At minimum, it must prove eligible Windows edition/license, virtualization and Secure Boot state, no normal-user Codex data exposure, dedicated VM storage and gateway identities, trusted guest image identity, disabled integration channels, rollback integrity, and every runtime enforcement/attestation gate.

This classification does not approve a host, remote service, cloud tenant, VM, copy, or build. A generic cloud/remote Windows machine is not automatically accepted; provider control planes, nested virtualization, storage/network tenancy, administrator access, and destruction evidence would all be additional trust boundaries. Until a concrete host and evidence manifest exist, implementation remains `NOT PROVEN`.

## Route 2 decision — current Host without Hyper-V

No current-Host route is authoritative now.

- `ALT-B` and `ALT-C` remain `NOT PROVEN`. They may receive a future design-only review if a precise platform, version, trusted source, license, host-change manifest, integration-channel policy, external gateway, rollback model, and attestation interface are fixed first.
- `ALT-D` through `ALT-G` are `authoritativeに不成立` against the fixed acceptance contract. Additional configuration cannot cure their decisive platform or isolation mismatch without changing them into another candidate class.

The current Host's installed alternative-hypervisor state was not inventoried because runtime/software probes were outside this turn's safe interpretation. No inference that a product is present, absent, compatible, or trusted is permitted.

## Safe future order

If further work is approved, the lowest-risk next design target is a requirements-only manifest for `ALT-A` describing the concrete eligible host evidence that must exist before any connection, installation, guest creation, or copy. The manifest must remain host-agnostic until a specific host is separately approved.

`ALT-B` or `ALT-C` should be considered only after a separate approval names the exact platform and permits official documentation research. Neither may borrow `ALT-A`'s `成立可能性あり` label.

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

## Final decision

Comparison is complete and remains `HOLD`.

There is one architecture-level candidate with `成立可能性あり`: a separately approved eligible Windows host running the saved dedicated Hyper-V guest plan. No candidate is implemented or adopted. Every current-Host non-Hyper-V route is either `NOT PROVEN` or `authoritativeに不成立`; none authorizes installation, provisioning, attestation, copy, or build.
