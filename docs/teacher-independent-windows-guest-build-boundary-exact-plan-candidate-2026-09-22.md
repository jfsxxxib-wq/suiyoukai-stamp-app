# Teacher build — independent Windows guest boundary exact-plan candidate

## Classification

`INDEPENDENT_WINDOWS_GUEST_BUILD_BOUNDARY_EXACT_PLAN_CANDIDATE_ESTABLISHED__HYPER_V_GEN2_TOPOLOGY_FIXED__IMPLEMENTATION_AND_ENFORCEMENT_NOT_PROVEN__HOLD`

- Recorded: 2026-09-22 19:06 JST
- Baseline checkpoint: `d071c7aa54973a87223c3915fe228857ebfce297`
- Candidate static validation: `PASS`
- Candidate SHA-256: `723e738382ad15e2da3b2577c1761f3295a1ecdf5ce661a33289a45d6ad5dc0e`
- Candidate: not installed, moved, selected, enabled, or changed
- Guest/VM/requirements artifacts: not created
- Current-task `NB-G4`: `NOT PROVEN — STOP` unchanged
- Evidence attempt: `0/1` unconsumed

## Decision

An independent Windows guest can be expressed as an exact-plan candidate only if the guest technology and all cross-boundary channels are fixed. This candidate fixes the guest as a dedicated Hyper-V Generation 2 VM with guest-only storage, guest-only Codex state, guest-local Windows requirements, and a dedicated network path. Windows Sandbox, a host worktree, WSL, a container sharing the host kernel, and a second process under the normal Windows user are not equivalent substitutes.

The topology and gates below are established as a design candidate. The boundary is **not adopted** and its actual enforcement is **not proven**. Hyper-V availability, VM configuration, guest image identity, guest control-plane egress, elevated Codex sandbox implementation, active proxy, loopback bind/connect denial, and complete pre-build attestation remain unverified. No implementation may begin from this document alone. `HOLD`.

## Scope and trust boundaries

### Host

The host is the current normal Windows/Codex environment. The plan prohibits changes to:

- `C:\Users\akane\.codex` and all normal user config/auth/session/plugin state;
- the normal Codex app's selected permissions and runtime;
- the host Codex `[windows] sandbox = "unelevated"` setting;
- host `%ProgramData%\OpenAI\Codex\requirements.toml`;
- the current repository worktree, except separately approved documentation records;
- public deployment, production data, and external services.

Future VM provisioning necessarily creates host-side VM registration, VHDX, checkpoint, and virtual-switch state. Those are not changes to the normal Codex environment, but they are still host mutations and require their own explicit approval and fixed paths. They must never be inferred from approval of this design.

### Guest

The guest is a dedicated Hyper-V Generation 2 VM with its own:

- Windows kernel and process namespace;
- guest OS system drive and guest-only build VHDX;
- user profile, registry, ACLs, firewall, and `%ProgramData%`;
- `CODEX_HOME`, authentication store, logs, sessions, skills, and plugin state;
- virtual network adapter and dedicated switch/gateway policy;
- Codex runtime and pinned client binary identity.

No host filesystem path may be mounted writable into the guest. Identical path strings inside the guest refer only to guest VHDX contents.

## Fixed VM topology

| Component | Exact design |
| --- | --- |
| Hypervisor | Hyper-V, Generation 2 VM only. |
| VM name | `teacher-build-boundary-20260922-01` candidate identifier. Final name must be fixed before creation. |
| Firmware | UEFI/Secure Boot required; measured identities recorded if supported. |
| System disk | Guest-only fixed VHDX created from a hash-fixed Windows image. No differencing parent outside the approved VM root after provisioning. |
| Build disk | Separate guest-only VHDX. No host folder sharing, SMB share, drive redirection, or live sync. |
| Checkpoints | Production checkpoints only; exact checkpoint IDs and VHDX chain hashes recorded. |
| Network | One guest vNIC attached only to a dedicated build-boundary vSwitch/gateway. No Default Switch, external bridged adapter, host LAN, or additional adapter. |
| Integration | Clipboard, Enhanced Session drive sharing, Guest Services file copy, shared folders, dynamic host-path mounts, and browser profile sharing disabled. PowerShell Direct and console file transfer are prohibited for workflow data. |
| Time | Guest clock source recorded; time synchronization may remain only if it cannot carry workflow data. Otherwise disable and record. |
| Secrets | No host credential store mount. Guest auth is separate, ephemeral, and handled by a separately approved secret-injection procedure. |

The exact Hyper-V configuration schema, supported integration-service switches, image identity, licensing, Secure Boot state, and host virtualization readiness are unproven. They are pre-provisioning gates, not assumptions.

## Host non-interference contract

1. The normal Codex process remains open or closed independently; its config files are never read into guest provisioning and never copied.
2. The guest uses no host `CODEX_HOME`, no host requirements, no host session, no host plugin cache, and no host browser profile.
3. VM artifacts live under one future approved host directory outside the repository and outside the normal `CODEX_HOME`. Its exact path must be fixed before creation.
4. VM networking uses a dedicated switch/gateway object with no rule reuse from the normal Codex sandbox.
5. No host repository folder is shared with the guest. Inputs and outputs use immutable, hash-fixed offline media artifacts created in separate approved phases.
6. Host firewall, Hyper-V, VHDX, and switch mutations must be enumerated before provisioning. Any unenumerated host mutation stops the plan.
7. Rollback must not edit or restore the normal Codex user config because it was never part of the guest boundary.

## Guest config and permission-profile contract

The guest uses a fixed candidate-only Codex state root, proposed as:

`C:\CodexBoundary\teacher-build-20260922-01\codex-home`

The guest config set contains exactly:

1. Guest-local `%ProgramData%\OpenAI\Codex\requirements.toml`.
2. Guest-only `$CODEX_HOME\config.toml` with no `sandbox_mode`, no `sandbox_workspace_write`, no MCP server, no plugin marketplace/config, and `[windows] sandbox = "elevated"`.
3. Guest-only `$CODEX_HOME\teacher-build-evidence-offline-loopback-denied-20260922.config.toml`, byte-identical to candidate SHA-256 `723e...dc0e`.
4. No project `.codex/config.toml` in the guest build root.
5. No guest `managed_config.toml`.
6. No cloud-managed config/requirements layer unless its complete signed bundle identity and contents are fixed and show no legacy keys, same-name profile, or widening. The preferred candidate is API-key authentication with no ChatGPT workspace cloud bundle, subject to separate authorization and availability proof.
7. Exact launch arguments containing one `--profile teacher-build-evidence-offline-loopback-denied-20260922`, no `--sandbox`, no config override, no Full Access, no escalation, and no fallback flag.

Guest requirements must, after fresh schema verification:

- set `default_permissions` to the exact candidate profile;
- allow the candidate profile and omit/deny all other permission profiles, including unrestricted built-ins;
- permit only the required approval policy and prohibit escalation/full access;
- set `[windows].allowed_sandbox_implementations = ["elevated"]`;
- pin `features.network_proxy = true`;
- disable plugins and any supported separately configurable web/browser/computer-use capability;
- refuse legacy sandbox selection and unsupported client versions.

No requirements or config artifact is created by this design.

## Guest filesystem boundary

The guest build root must use the already fixed exact path string inside the guest VHDX:

`C:\Users\akane\Documents\Codex\2026-06-14\new-chat\suiyoukai-stamp-app\work\teacher-anonymous-api-safe-metadata-evidence-20260922-01\isolated-build\teacher-admin-production-candidate`

This is not a host mount. The permission profile must resolve to:

- `:root = deny`;
- `:minimal = read`;
- `:tmpdir = deny`;
- `:slash_tmp = deny`;
- workspace root default `read`;
- write only to `dist`, `.wrangler`, `node_modules/.vite`, and `.tmp` under that exact root;
- no other write entry, writable temp, shared volume, symlink/junction escape, device path, UNC path, or alternate data stream route.

Input source and dependencies must arrive on separately approved, read-only hash-fixed media. Provisioning copies them into the guest before the clean pre-build checkpoint. No host live-sync or dependency download is permitted during build.

## Guest network boundary

### Command-network plane

The candidate permission profile must have:

- `network.enabled = true` only so traffic is forced through the active proxy path;
- `features.network_proxy = true` effectively active;
- zero external domain allow entries;
- zero localhost, loopback, private, LAN, link-local, or literal-IP allow entries;
- `allow_local_binding = false`;
- `allow_upstream_proxy = false`;
- SOCKS5 and SOCKS5 UDP disabled;
- no Unix-socket allow entry and no dangerous escape key.

The elevated Windows sandbox must deny direct network bypass by sandbox users/processes. The dedicated external gateway must also deny command-plane egress independently and log any attempted bypass. An active proxy plus empty allowlist is required; network-on/proxy-off is an immediate FAIL.

### Codex control plane

Model/authentication service traffic is separate from command-network traffic. The dedicated gateway may allow only a future fixed Codex control-plane policy bound to the Codex client identity, never to sandbox child identities. Hostnames, certificate expectations, redirect behavior, DNS policy, and update traffic must be fixed before provisioning.

Automatic client updates, package downloads, telemetry not required for the session, browser traffic, plugin/connector traffic, MCP transports, and arbitrary client fetches are denied. If Codex control-plane destinations cannot be authoritatively distinguished from command traffic, the guest plan fails.

The exact control-plane allowlist and identity-bound gateway mechanism are not yet established.

## Loopback contract

Loopback is prohibited for this candidate:

- no `localhost`, `127.0.0.1`, `::1`, wildcard, private address, or local-binding exception;
- no Unix socket, named-pipe proxy, local HTTP server, or port-forward exception;
- no child server or preview server;
- any successful loopback bind or connect during boundary attestation is FAIL;
- no build repair may add loopback.

The fixed current build path does not statically establish a loopback need. If a future build path proves loopback necessary, stop this plan and create a separate port-, process-, direction-, lifetime-, and destination-limited design under separate approval. The current permission-profile mechanism's ability to enforce an exact port-limited bind/connect exception is not assumed.

Loopback-connect blocking follows the documented active-proxy local/private guard. Loopback-bind denial on the selected guest/runtime remains unproven and is a mandatory attestation gate.

## Process, child, and build-plugin boundary

Official OpenAI documentation states that spawned commands inherit the command sandbox. The future boundary must additionally verify inside the disposable guest that:

- the fixed Node build process runs as the elevated sandbox identity;
- OS child processes cannot escape filesystem/network rules;
- in-process build plugins have no broader OS identity or out-of-process helper;
- package-manager hooks, shell startup, service creation, scheduled tasks, COM activation, named pipes, and job-object escapes are absent or denied;
- no plugin may spawn a server, browser, updater, downloader, or fallback executable.

A synthetic boundary fixture may test inheritance in a separately approved attestation phase. It is not the project build and must be rolled back before the clean pre-build checkpoint.

## Separate Codex tool surfaces

The guest uses Codex CLI only; the ChatGPT desktop app and general browser are not installed or launched for the build session. The guest contract requires:

- plugins disabled by guest managed requirements;
- no plugin marketplace or plugin state;
- no MCP server configuration and an empty effective MCP inventory;
- no connectors/apps;
- web search disabled/unavailable;
- browser and Computer Use disabled/unavailable;
- no Codex cloud execution or remote handoff;
- no image generation, external app connector, or unrelated tool.

An unused but available surface is not equivalent to disabled/unavailable. If the client cannot produce a trustworthy effective tool-capability manifest, the pre-build gate fails.

## Phase and attempt separation

Every phase has a separate execution identity and approval. None consumes Teacher Evidence attempt `0/1`.

| Phase | Candidate execution ID | May consume Evidence attempt? | Permitted scope |
| --- | --- | --- | --- |
| Design | `GUEST-DESIGN-20260922-01` | No | This document only. |
| Host capability inventory | `GUEST-HOST-PREFLIGHT-20260922-01` | No | Read-only Hyper-V/host checks under separate approval. |
| VM artifact creation | `GUEST-PROVISION-20260922-01` | No | Create VM/VHDX/switch/gateway/config artifacts under separate approval. |
| Boundary attestation | `GUEST-BOUNDARY-ATTEST-20260922-01` | No | Synthetic filesystem/network/loopback/child/tool checks; no project build. |
| Source/dependency import | `GUEST-INPUT-IMPORT-20260922-01` | No | Import hash-fixed offline media; no build. |
| Build | `GUEST-BUILD-20260922-01` | No | One separately approved project build only. |
| Real Teacher evidence | Existing Evidence attempt `1/1` | Yes | Server/browser/HTTP only after a later exact plan and approval. |

Failure in any guest phase never consumes or renumbers Evidence attempt `0/1`.

## Checkpoint and rollback topology

Future checkpoints must be created only after their preceding gate passes:

- `HV-S0`: pristine guest OS/image identity, before Codex provisioning.
- `HV-S1`: guest OS patched and pinned; Hyper-V integration/network policy fixed; no candidate or source.
- `HV-S2`: guest Codex runtime, requirements, candidate config, and control-plane policy installed; boundary attestation PASS; attestation canaries removed; no project source.
- `HV-S3`: hash-fixed source/dependencies imported into exact guest root; pre-build inventory PASS; no build run.
- `HV-S4`: optional post-build evidence snapshot, created only after the one-shot build and never reused for another build.

On any failure before build, power off the guest and revert to the last earlier clean checkpoint. On any boundary ambiguity, revert to `HV-S0` or quarantine the entire VM chain. Do not repair in place.

Final destruction, if separately approved, removes the VM registration, every guest VHDX/checkpoint, dedicated switch/gateway rules, ephemeral guest secret material, and temporary offline media. Before deletion, verify exact absolute paths remain within the approved VM root. Destruction is not authorized by this plan. A recoverable export or retained `HV-S0` may be required before deletion; that choice must be fixed in the provisioning plan.

## Sequential gates

### Host and artifact gates

| Gate | Required evidence | Failure action |
| --- | --- | --- |
| `WG-G0` | Baseline Git/candidate hashes and Evidence attempt `0/1` match. | Stop. |
| `WG-G1` | Hyper-V Gen2 capability, Windows edition/license, Secure Boot, and host virtualization state are authoritative and compatible. | Do not create guest. |
| `WG-G2` | Exact approved VM root, VM name, VHDX paths, vSwitch/gateway names, and cleanup targets are fixed. | Do not create guest. |
| `WG-G3` | Hash-fixed Windows guest image, patch state, Codex client binary, and schema versions are fixed. | Do not create guest. |
| `WG-G4` | Complete host mutation manifest proves no normal Codex/user-config/Windows-sandbox path is touched. | Do not create guest. |

### Guest configuration gates

| Gate | Required evidence | Failure action |
| --- | --- | --- |
| `WG-G5` | Guest filesystems/processes are independent; no host mount, clipboard, drive sharing, Guest Services copy, PowerShell Direct workflow, or host LAN path exists. | Do not install candidate. |
| `WG-G6` | Guest config-source manifest is complete; no legacy sandbox key, project config, managed legacy config, cloud widening, or same-name profile exists. | Do not select candidate. |
| `WG-G7` | Guest requirements permit only candidate profile and elevated implementation; no fallback/full access/escalation. | Do not select candidate. |
| `WG-G8` | Dedicated control-plane egress is identity-bound; sandbox child egress is denied independently; update/plugin/browser/MCP traffic is denied. | Do not select candidate. |

### Boundary-attestation gates

| Gate | Required evidence | Failure action |
| --- | --- | --- |
| `WG-G9` | Candidate profile name/file hash and effective selected permission system match; no legacy system active. | End guest session; revert. |
| `WG-G10` | Actual Windows implementation is elevated with no fallback; child identity/inheritance PASS. | End guest session; revert. |
| `WG-G11` | Proxy is active; external allowlist is empty; direct egress and proxy-off bypass are denied. | End guest session; revert. |
| `WG-G12` | Loopback/local/private connect and bind are denied; no local service exception exists. | End guest session; revert. |
| `WG-G13` | Exact guest workspace root and four write subtrees PASS; every other write path is denied, including temp and link escapes. | End guest session; revert. |
| `WG-G14` | OS child and synthetic build-plugin fixture inherit identical filesystem/network/process boundaries. | End guest session; revert. |
| `WG-G15` | Plugins/connectors/MCP/web/browser/Computer Use/cloud are disabled or unavailable in the effective session. | End guest session; revert. |
| `WG-G16` | Attestation outputs, gateway logs, runtime metadata, and final clean checkpoint hashes are complete; no project build ran. | Revert; do not import source. |

### Pre-build gates

| Gate | Required evidence | Failure action |
| --- | --- | --- |
| `WG-G17` | Guest is reverted to clean `HV-S2`; attestation canaries are absent. | Do not import source. |
| `WG-G18` | Source/dependency offline media hashes match; import produces exact inventory under the guest root only. | Revert to `HV-S2`. |
| `WG-G19` | `HV-S3` identity, candidate/runtime continuity, network/tool surface state, and zero prior build count match. | Do not build. |
| `WG-G20` | Separate one-shot build authorization exists; Evidence attempt remains `0/1`. | Do not build. |

Any NOT PROVEN, unavailable evidence, hash mismatch, unexpected host/guest channel, or successful forbidden operation is FAIL. There is no repair, retry, fallback, second profile, second build, or automatic transition to server/browser/HTTP.

## Required evidence artifacts for future phases

The following artifacts are required but were not created:

- host capability and mutation manifest;
- guest image and client binary identity record;
- Hyper-V VM/export configuration manifest;
- vSwitch/gateway/firewall policy and control-plane allowlist;
- guest `requirements.toml` and candidate config package;
- ordered effective config-source manifest;
- elevated implementation attestation;
- active proxy/empty allowlist/direct-bypass attestation;
- loopback bind/connect denial result;
- exact filesystem/write-boundary result;
- child/build-plugin inheritance result;
- separate tool-surface availability result;
- clean checkpoint/VHDX chain identity record;
- rollback/destruction checklist with exact paths.

Each artifact needs a separate approval, schema validation, hash, and immutable handoff.

## Authoritative facts and unproven conditions

Checkpointed official OpenAI documentation supports these Codex-level facts:

- permission profiles and legacy sandbox settings must not mix;
- active proxy plus no allowed domains blocks external command destinations;
- the active proxy blocks local/private targets by default unless explicitly opened;
- Windows elevated sandboxing is stronger and uses sandbox users/filesystem/firewall boundaries;
- spawned commands inherit the command sandbox;
- plugins/connectors/MCP/web/browser/Computer Use/cloud use separate controls.

The following guest-platform and integration claims remain unproven and prevent adoption now:

1. Hyper-V capability and exact isolation configuration on this host.
2. Guest Windows image, license, patch level, Secure Boot, and Codex version compatibility.
3. Ability to prevent every host integration/shared-data channel while retaining required operation.
4. Identity-bound Codex control-plane egress without exposing sandbox child egress.
5. Guest-only elevated setup and requirements behavior on the selected client version.
6. Active-proxy attestation and direct-network bypass denial.
7. Loopback bind as well as connect denial on native Windows.
8. Exact four-subtree write enforcement including temp, symlink/junction, device, UNC, and ADS paths.
9. Complete child/build-plugin inheritance for the fixed toolchain.
10. Authoritative disabled/unavailable state for every separate Codex network surface.
11. Deterministic checkpoint/revert integrity and complete secret/media cleanup.

If any item cannot be authoritatively closed in its future gate, classify the boundary as `INDEPENDENT_WINDOWS_GUEST_BUILD_BOUNDARY_NOT_PROVEN__HOLD` and stop before build.

## Authoritative references already checkpointed

- [Permissions](https://learn.chatgpt.com/docs/permissions)
- [Config basics](https://learn.chatgpt.com/docs/config-file/config-basic)
- [Environment variables](https://learn.chatgpt.com/docs/config-file/environment-variables)
- [Managed configuration](https://learn.chatgpt.com/docs/enterprise/managed-configuration)
- [Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox)
- [Sandbox](https://learn.chatgpt.com/docs/sandboxing)
- Dedicated-runtime evaluation: `docs/teacher-candidate-dedicated-runtime-boundary-exact-plan-evaluation-2026-09-22.md`
- No-command contract evaluation: `docs/teacher-candidate-selected-no-command-attestation-safety-contract-evaluation-2026-09-22.md`

No browser or HTTP request was made during this design turn. Hyper-V/Windows guest platform behavior must receive fresh authoritative verification before provisioning because it is not established by the checkpointed OpenAI documentation.

## Preserved state and HOLD

- Host normal Codex environment, user config, and Windows sandbox: unchanged.
- Guest/VM/vSwitch/VHDX/checkpoint/requirements artifacts: not created or started.
- Candidate: not installed, moved, selected, enabled, or changed.
- Session/runtime: unchanged; no new session.
- Probe/copy/build/server/browser/HTTP: not performed.
- Evidence attempt: `0/1` unconsumed.
- Current-task `NB-G4`: remains `NOT PROVEN — STOP`.
- Git commit/push: not performed.
- Public deployment, production data, and external services: no changes or writes.
- Existing tracked `20` and untracked `7,839` items: not organized, modified, or staged.

Final state: exact-plan candidate recorded; implementation and adoption remain `HOLD`.
