# Teacher candidate — dedicated runtime boundary exact-plan evaluation

## Classification

`CANDIDATE_DEDICATED_RUNTIME_BOUNDARY_EXACT_PLAN_NOT_AUTHORITATIVELY_ESTABLISHED__PRESELECTION_EFFECTIVE_RUNTIME_ATTESTATION_UNAVAILABLE__SAME_HOST_ELEVATED_ONLY_NOT_ZERO_IMPACT__HOLD`

- Recorded: 2026-09-22 18:17 JST
- Baseline checkpoint: `e38e9e2681ec4cd4de9e01d59b3136c3f148498d`
- Candidate static validation: `PASS`
- Candidate SHA-256: `723e738382ad15e2da3b2577c1761f3295a1ecdf5ce661a33289a45d6ad5dc0e`
- Candidate: not installed, moved, selected, enabled, or changed
- Current-task `NB-G4`: `NOT PROVEN — STOP` unchanged
- Evidence attempt: `0/1` unconsumed

## Decision

An authoritative exact plan satisfying all requested conditions cannot be established with the currently documented and locally observable controls.

Two partial designs were evaluated:

1. A separate same-host `CODEX_HOME` can exclude the normal user config and its legacy `sandbox_mode`, but it cannot provide a zero-impact, candidate-only elevated-only enforcement boundary. The strongest enforcement control is a Windows requirements policy and elevated sandbox setup that is host-scoped rather than scoped only to one `CODEX_HOME`.
2. A disposable dedicated Windows guest can isolate those host-scoped changes from the normal environment, but no supported pre-selection dry-run/effective-runtime attestation interface was established that can prove an *active* proxy and the actually selected Windows sandbox implementation while keeping the candidate unselected.

Because the final requirement is fail-closed with the candidate still unselected, neither partial design is adopted. `HOLD`.

## Fixed facts

The following facts are taken from the already checkpointed OpenAI Docs review and local read-only inventory. No browser or HTTP request was made during this design turn.

1. The normal user config is under the effective normal `CODEX_HOME` and contains `sandbox_mode = "workspace-write"`, `sandbox_workspace_write`, and `[windows] sandbox = "unelevated"`.
2. A selected config profile file is resolved from `$CODEX_HOME/<profile-name>.config.toml`; config precedence is CLI overrides, project config, selected profile, user config, cloud-managed config defaults, system config, then built-ins.
3. Permission profiles do not compose with legacy `sandbox_mode` or `sandbox_workspace_write`. Any loaded legacy `sandbox_mode` selects the legacy sandbox unless an authoritative managed exception applies.
4. `CODEX_HOME` is the root for Codex config, authentication data, logs, sessions, skills, and related state. A distinct value therefore isolates the normal user config, but it also creates a distinct Codex state boundary that must not inherit links or copied config blindly.
5. Native-Windows `elevated` is stronger than `unelevated`; elevated setup uses dedicated sandbox users, filesystem boundaries, firewall rules, and local policy changes.
6. `windows.allowed_sandbox_implementations = ["elevated"]` in managed requirements is the documented enforcement control that prevents fallback to `unelevated`. On Windows, local system requirements are at `%ProgramData%\OpenAI\Codex\requirements.toml`, which is not scoped to a single `CODEX_HOME`.
7. `features.network_proxy = true` is configuration intent. The proxy is only an effective enforcement boundary when it is active. With an active proxy and no allowed domains, external destinations are blocked; local/private targets are blocked unless explicitly opened.
8. Spawned commands inherit the command sandbox, but web search, plugins/connectors, MCP, browser/Computer Use, Codex service traffic, and cloud execution are separate surfaces.

## Evaluation of requested conditions

| Requirement | Same-host alternate `CODEX_HOME` | Dedicated Windows guest | Result |
| --- | --- | --- | --- |
| Exclude normal legacy `sandbox_mode` without editing normal config | Possible if the candidate root is new, fixed, and contains no copy/link to the normal home. | Possible. | Designable. |
| Select only the candidate permission profile | `--profile <candidate-name>` plus a unique profile name and an exact config-set manifest are designable. | Same. | Static designable; effective selection not pre-selection attested. |
| Enforce elevated-only | Candidate config can request `elevated`, but same-host fallback prevention needs host-scoped requirements. | Guest-scoped requirements can allow only `elevated`. | Same-host fails zero-impact; guest remains unimplemented. |
| Zero impact on normal Codex environment | Normal config files can remain untouched, but elevated setup and `%ProgramData%` requirements are host-wide. | Guest boundary can isolate host-wide changes. | Guest required. |
| Deterministic return to normal environment | Unset the candidate `CODEX_HOME` and close a separate process, but host-level changes would remain. | Destroy/revert the guest; normal host process and home were never changed. | Guest required. |
| Confirm precedence and every loaded config source | Static path inventory is possible; cloud-delivered layers and actual process composition require supported effective-config evidence. | Same, though the guest can reduce sources. | No authoritative pre-selection effective-config output established. |
| Pre-execution active proxy / empty allowlist / loopback deny / writes | Static TOML values can be verified before selection; *active* proxy and actual sandbox implementation are runtime facts. | Same. | Cannot prove active state while candidate remains unselected. |
| Prove no legacy/profile mixing | All known files and exact launch arguments can be scanned, but a complete effective-source manifest is still required. | Same with fewer sources. | Conditional on an authoritative effective-config manifest. |
| On any failure, stop with candidate unselected | Static gates can do this. Runtime-only facts cannot be observed without starting/selecting a runtime boundary. | Same. | **Not satisfied.** |

## Rejected same-host plan

The following would isolate ordinary user-level configuration but is not sufficient and must not be implemented as the safety boundary:

1. Set `CODEX_HOME` only for a new child process to a fixed candidate-only root.
2. Place the candidate profile at `<candidate-home>\teacher-build-evidence-offline-loopback-denied-20260922.config.toml`.
3. Launch with exact `--profile teacher-build-evidence-offline-loopback-denied-20260922`, no `--sandbox`, and no `-c sandbox_mode=...` override.
4. Put `[windows] sandbox = "elevated"` in candidate-only config.

This plan is rejected because it does not make `%ProgramData%` requirements candidate-only, cannot guarantee that elevated setup has no host-level effect, and cannot prove the active proxy before the candidate is selected.

## Conditional guest plan — not adopted

The only boundary shape that could preserve zero impact on the current normal environment is a disposable dedicated Windows guest or separate Windows host. The following is a conditional plan, not an implementation authorization:

### Guest identity and isolation

1. Fix a guest image/snapshot identity and record its cryptographic or platform identity before use.
2. Do not share the normal `C:\Users\akane\.codex`, registry-backed settings, authentication store, session store, plugin cache, browser profile, writable host workspace, or `%ProgramData%\OpenAI\Codex` with the guest.
3. Use a new guest-only `CODEX_HOME` with no junction, symlink, inherited config copy, or fallback to the normal home.
4. Any source transfer, dependency population, authentication, guest provisioning, output export, and guest destruction are separate approval boundaries.

### Guest managed requirements

Before any candidate selection, a separately approved guest provisioning step would have to create guest-local `%ProgramData%\OpenAI\Codex\requirements.toml` that:

- permits only the exact candidate profile and a separately named read-only attestor profile, with all omitted profiles denied;
- sets the default to the read-only attestor, not the candidate;
- allows only `approval_policy = "never"` for the candidate workflow;
- pins `[windows].allowed_sandbox_implementations` to `elevated` only;
- pins `features.network_proxy = true` and disables plugins through managed features;
- prevents full access, legacy sandbox selection, escalation, and fallback.

Exact schema and client-version compatibility would require a fresh authoritative verification before artifact creation. No requirements artifact was created in this turn.

### Candidate config set

The guest candidate root would contain only:

1. guest system requirements with a recorded hash;
2. a guest user config with no `sandbox_mode`, no `sandbox_workspace_write`, no MCP servers, no plugin marketplace/config entries, and `[windows] sandbox = "elevated"`;
3. the selected candidate profile file with the checkpointed candidate hash;
4. no project `.codex/config.toml` in the exact workspace path;
5. no legacy `managed_config.toml`;
6. either no cloud-managed layer or a trusted, immutable manifest/hash of the resolved cloud bundle showing no same-name profile, legacy sandbox key, or widening rule;
7. exact launch arguments with no `--sandbox`, no configuration override, no escalation flag, and the unique `--profile` value.

### Required pre-selection attestation gates

| Gate | Required evidence | Failure action |
| --- | --- | --- |
| `DR-G0` | Guest identity and pristine snapshot match. | Do not select candidate; stop. |
| `DR-G1` | Candidate `CODEX_HOME` resolves only to the guest root; normal home is absent/unmounted. | Do not select candidate; stop. |
| `DR-G2` | Ordered config-source manifest is complete: CLI, project, selected profile candidate, guest user config, cloud defaults, guest system config, built-ins, requirements layers. | Do not select candidate; stop. |
| `DR-G3` | No effective `sandbox_mode`, `sandbox_workspace_write`, CLI `--sandbox`, or same-name profile from any other layer. | Do not select candidate; stop. |
| `DR-G4` | Guest requirements allow only `elevated`; no `unelevated` fallback; client version supports the selected requirements schema. | Do not select candidate; stop. |
| `DR-G5` | Candidate hash, exact profile name, exact workspace root, and exact write subpaths match the checkpoint. | Do not select candidate; stop. |
| `DR-G6` | Effective network configuration has proxy enabled, no external allow entries, no loopback/local/private allow, `allow_local_binding=false`, no Unix socket/upstream/SOCKS/`dangerously_*` exception. | Do not select candidate; stop. |
| `DR-G7` | Plugins/connectors/MCP/web search/browser/Computer Use/cloud execution are disabled, unavailable, or excluded by their own controls for the future build step. | Do not select candidate; stop. |
| `DR-G8` | An authoritative, supported pre-selection report proves the actual Windows implementation will be `elevated` and the network proxy will be active, without selecting the candidate. | Do not select candidate; stop. |

`DR-G8` is not currently satisfiable from the saved official documentation, local CLI output, or static config files. It is the first unresolved gate after adopting a guest boundary.

## Why a bootstrap session does not close DR-G8

A read-only attestor session could prove that the guest can start with elevated sandboxing. It cannot prove that the later, differently selected candidate profile has an active proxy and exact effective policy without either:

- selecting the candidate; or
- relying on a supported dry-run/effective-config resolver that has not been established.

Selecting the candidate and then stopping before build would be a different safety contract: failure would occur after selection, contrary to the requested requirement that failure leave the candidate unselected. This design does not silently weaken that requirement.

## Conditions that would make a future exact plan possible

At least one of the following must be separately authorized and authoritatively established:

1. A supported Codex command or application surface that emits the complete effective config/requirements source set, selected permission profile, Windows sandbox implementation, and proxy activation result in a no-session or dry-run mode; or
2. A revised approval boundary allowing a candidate-selected but no-command/no-build attestation session, with automatic termination on any mismatch; or
3. A different externally enforced guest boundary that independently guarantees network and filesystem restrictions before Codex starts, plus evidence that the permission profile is not relied on for the missing guarantees.

Until then, do not create guest artifacts, change requirements, install/select the candidate, or start any session.

## Authoritative references already checkpointed

- [Permissions](https://learn.chatgpt.com/docs/permissions)
- [Config basics](https://learn.chatgpt.com/docs/config-file/config-basic)
- [Environment variables](https://learn.chatgpt.com/docs/config-file/environment-variables)
- [Managed configuration](https://learn.chatgpt.com/docs/enterprise/managed-configuration)
- [Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox)
- [Sandbox](https://learn.chatgpt.com/docs/sandboxing)
- Local evidence: `docs/teacher-candidate-profile-pre-selection-read-only-attestation-result-2026-09-22.md`

## Preserved state and HOLD

- Normal user config and Windows sandbox settings: unchanged.
- Candidate: not installed, moved, selected, enabled, or changed.
- New session/runtime: not started or changed.
- Probe/copy/build/server/browser/HTTP: not performed.
- Evidence attempt: `0/1` unconsumed.
- Current-task `NB-G4`: remains `NOT PROVEN — STOP`.
- Git commit/push: not performed.
- Public deployment, production data, and external services: no changes or writes.
- Existing tracked `20` and untracked `7,839` worktree items: not organized, modified, or staged.

Final state: `HOLD`.
