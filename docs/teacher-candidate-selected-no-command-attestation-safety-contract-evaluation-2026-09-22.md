# Teacher candidate-selected / no-command attestation safety-contract evaluation

## Classification

`CANDIDATE_SELECTED_NO_COMMAND_ATTESTATION_CONTRACT_NOT_AUTHORITATIVELY_ESTABLISHED__REQUIRED_RUNTIME_METADATA_SCHEMA_AND_FAIL_CLOSED_SESSION_TERMINATION_NOT_PROVEN__HOLD`

- Recorded: 2026-09-22 18:43 JST
- Baseline checkpoint: `00ec1fea13546cc0a50ed21ce725535684d3c247`
- Candidate static validation: `PASS`
- Candidate SHA-256: `723e738382ad15e2da3b2577c1761f3295a1ecdf5ce661a33289a45d6ad5dc0e`
- Candidate: not installed, moved, selected, enabled, or changed
- Current-task `NB-G4`: `NOT PROVEN — STOP` unchanged
- Evidence attempt: `0/1` unconsumed

## Decision

A precise candidate-selected/no-command safety contract can be specified, but it cannot be adopted as authoritative with the currently established platform evidence.

The contract requires a trusted runtime-generated metadata envelope, injected before the first agent turn, that proves the effective permission profile, complete config-source composition, actual Windows sandbox implementation, active proxy state, effective network and filesystem rules, separate tool-surface state, and a zero-command ledger. The checkpointed official documentation defines the underlying settings and enforcement semantics, but it does not establish this complete no-command attestation envelope or a fail-closed session-termination acknowledgement.

Static candidate values, the permissions UI, model-visible prose, or agent-generated summaries are not substitutes for runtime-origin evidence. Therefore the candidate must remain unselected and the contract remains `HOLD`.

## Meaning of no-command

For this contract, `command` includes every agent-triggered local or remote action after session selection:

- shell or process execution;
- file read/write tools, including config, log, environment, registry, process, firewall, or port inspection;
- apply-patch or any filesystem mutation;
- plugin, connector, MCP, web search, browser, Computer Use, cloud-execution, or other tool call;
- network or loopback probe;
- copy, build, server, browser navigation, or HTTP request;
- escalation, approval request, retry, fallback, or repair action.

The only permitted first-turn operation would be deterministic comparison of runtime-supplied immutable metadata already present before the turn. Model/authentication control-plane traffic necessary to create the Codex session must be separately identified by the runtime and is not evidence for command-network policy.

## Trust boundary for metadata

The attestation envelope must be produced by the Codex runtime or a separately trusted enforcement component, not by the model, prompt, repository, candidate TOML, or user-authored script. It must:

1. have a versioned public schema and documented field semantics;
2. be bound to one immutable `session_id`, client build identity, host/guest identity, and selection event;
3. be emitted after config composition and sandbox/proxy activation but before any agent command or tool is enabled;
4. include a runtime authenticity/integrity indicator that the client verifies before presenting it;
5. be immutable for the attestation turn;
6. mark every unavailable field as unavailable, never infer a PASS;
7. include a monotonic command/tool ledger initialized by the runtime, not a model statement that no command ran.

No such complete schema is established by the current checkpoint.

## Required metadata envelope

The exact future envelope would need all fields below. Names are design identifiers only; they are not claims that current Codex emits this schema.

```text
schema_id
schema_version
runtime_attestation_authority
session_id
session_created_at
client_version
client_binary_identity
host_or_guest_identity

selection.profile_name
selection.profile_source_path
selection.profile_file_sha256
selection.default_permissions_effective
selection.permission_system = "permission_profile"

config.ordered_sources[] = { precedence, kind, path_or_bundle_id, sha256, loaded }
config.cli_args_sha256
config.legacy_sandbox_mode_present = false
config.legacy_sandbox_workspace_write_present = false
config.cli_sandbox_override_present = false
config.same_name_profile_sources = 1

windows.requested_implementation = "elevated"
windows.effective_implementation = "elevated"
windows.fallback_used = false
windows.enforcement_ready = true

network.proxy_requested = true
network.proxy_active = true
network.proxy_enforcement_bound_to_session = true
network.external_allow_entries = []
network.local_allow_entries = []
network.allow_local_binding = false
network.allow_upstream_proxy = false
network.socks5_enabled = false
network.socks5_udp_enabled = false
network.unix_socket_allow_entries = []
network.dangerous_escape_keys_present = false

filesystem.workspace_roots = [EXPECTED_EXACT_ROOT]
filesystem.root_default = "deny"
filesystem.minimal = "read"
filesystem.tmpdir = "deny"
filesystem.slash_tmp = "deny"
filesystem.workspace_root_default = "read"
filesystem.write_subpaths = ["dist", ".wrangler", "node_modules/.vite", ".tmp"]
filesystem.other_write_entries = []

surfaces.plugins = "disabled_or_unavailable"
surfaces.connectors = "disabled_or_unavailable"
surfaces.mcp = "disabled_or_unavailable"
surfaces.web_search = "disabled_or_unavailable"
surfaces.browser = "disabled_or_unavailable"
surfaces.computer_use = "disabled_or_unavailable"
surfaces.cloud_execution = "disabled_or_unavailable"

ledger.agent_commands = 0
ledger.tool_calls = 0
ledger.filesystem_reads = 0
ledger.filesystem_writes = 0
ledger.command_network_requests = 0
ledger.escalations = 0
ledger.retries = 0

termination.fail_closed_supported = true
termination.no_command_close_acknowledgement_available = true
```

## Fixed expected values

- Profile name: `teacher-build-evidence-offline-loopback-denied-20260922`
- Profile SHA-256: `723e738382ad15e2da3b2577c1761f3295a1ecdf5ce661a33289a45d6ad5dc0e`
- Expected workspace root:
  `C:\Users\akane\Documents\Codex\2026-06-14\new-chat\suiyoukai-stamp-app\work\teacher-anonymous-api-safe-metadata-evidence-20260922-01\isolated-build\teacher-admin-production-candidate`
- Root policy: deny all except runtime-minimal read and the exact workspace policy.
- Workspace default: read.
- Exact write subpaths only: `dist`, `.wrangler`, `node_modules/.vite`, `.tmp`.
- External domain allow entries: empty.
- Loopback/local/private allow entries: empty.
- `allow_local_binding`: false.
- Upstream proxy, SOCKS5, SOCKS5 UDP, Unix socket allow, and dangerous escape keys: absent/false.
- Windows implementation: effective `elevated`; fallback false.
- Evidence attempt: `0/1` before and after attestation.

## Candidate-selected/no-command gate sequence

The sequence below is an exact contract candidate only. It must not be executed until every prerequisite is authoritative and separately approved.

| Gate | Runtime-metadata-only requirement | Failure action |
| --- | --- | --- |
| `CSNC-G0` | Baseline checkpoint, candidate path, and candidate hash match. | Do not select candidate; stop. |
| `CSNC-G1` | A documented, versioned attestation schema and trusted authority are available. | Do not select candidate; stop. |
| `CSNC-G2` | Fail-closed no-command session termination and acknowledgement are supported. | Do not select candidate; stop. |
| `CSNC-G3` | Candidate is selected in a new dedicated session; runtime injects the envelope before enabling any command/tool. | If envelope is absent, execute nothing and request runtime termination. |
| `CSNC-G4` | Ledger fields are all zero. | Execute nothing; terminate session. |
| `CSNC-G5` | Exact candidate name, source, hash, and effective `default_permissions` match. | Execute nothing; terminate session. |
| `CSNC-G6` | Ordered config/requirements sources are complete; no legacy key, CLI sandbox override, or same-name profile source exists. | Execute nothing; terminate session. |
| `CSNC-G7` | Requested and effective Windows implementation are `elevated`; fallback is false; enforcement ready is true. | Execute nothing; terminate session. |
| `CSNC-G8` | Proxy is requested, active, and bound to this session's command sandbox. | Execute nothing; terminate session. |
| `CSNC-G9` | External allowlist is empty and no widening entry exists. | Execute nothing; terminate session. |
| `CSNC-G10` | Local/loopback/private allowlist is empty; local binding, upstream proxy, SOCKS, Unix socket, and escape keys are closed. | Execute nothing; terminate session. |
| `CSNC-G11` | Exact workspace root and exact read/write map match; no other write entry exists. | Execute nothing; terminate session. |
| `CSNC-G12` | Plugins, connectors, MCP, web search, browser, Computer Use, cloud execution, and other separate network surfaces are disabled or unavailable. | Execute nothing; terminate session. |
| `CSNC-G13` | Evidence attempt remains `0/1`; no probe/build/evidence action is authorized. | Execute nothing; terminate session. |
| `CSNC-G14` | Runtime emits an immutable `ATTESTATION_PASS_NO_COMMAND` record with final zero ledger. | End attestation turn; do not build. |

Passing `CSNC-G14` would only prove the no-command session boundary at that instant. It would not authorize copy, build, probe, server, browser, HTTP, or Evidence attempt use. Any later command authorization would require another explicit approval and a continuity check binding it to the same unchanged session and envelope.

## Effective-runtime-metadata-only limits

The attestation turn must not read or derive evidence from:

- candidate/user/project/system config files;
- session logs or sandbox logs;
- environment variables;
- registry, ACL, firewall, process, listener, or proxy state;
- repository files, workspace contents, or artifact files;
- tool inventory obtained by invoking tool discovery;
- a network denial/success test;
- UI automation, browser, or Computer Use.

Those actions are commands or tools under this contract. Their results could also change state or consume a probe. All required values must already be in the trusted envelope.

## Separate network surfaces

The permission profile's network proxy covers local sandboxed command traffic only. Therefore the envelope must independently report the runtime availability state of plugins, connectors, MCP, web search, browser, Computer Use, and cloud execution. A promise not to use an available surface is weaker than disabled/unavailable and cannot PASS `CSNC-G12`.

Codex model/authentication service traffic is a separate control-plane surface. The envelope must distinguish it from command-network traffic and must not treat successful service traffic as proof that the command proxy is active.

## Failure and termination contract

If any field is missing, stale, inconsistent, not runtime-authenticated, or not exactly equal to the fixed value:

1. do not call any tool or command;
2. do not request approval or escalation;
3. do not inspect files, logs, environment, UI, or network;
4. emit only `ATTESTATION_NOT_PROVEN__NO_COMMAND__TERMINATE` with the failed gate and no inferred repair;
5. invoke a runtime-native no-command termination primitive that cannot run repository code or tools;
6. require a runtime acknowledgement that the session is closed and the final ledger remains zero;
7. do not retry, fall back, edit config, reselect, or start a replacement session;
8. keep Evidence attempt `0/1` and current-task `NB-G4 = NOT PROVEN` unchanged.

The current checkpoint does not establish items 5–6 as supported product behavior. A model final response or an idle task is not proof that the underlying session has been closed.

## Authoritative gap analysis

| Required proof | Checkpointed official facts | Current authoritative status |
| --- | --- | --- |
| Selected permission profile | Profile definition/selection semantics are documented. | No complete runtime-origin selection envelope established. |
| No effective legacy key | Mixing rule and precedence are documented. | No complete effective-source manifest established. |
| Windows effective elevated implementation | Elevated/unelevated semantics are documented. | No no-command runtime metadata field/schema established. |
| Active proxy | Proxy configuration and active/inactive consequences are documented. | No no-command active-state attestation field/schema established. |
| Empty external/local allowlists | Static policy semantics are documented. | No complete effective runtime allowlist envelope established. |
| Exact filesystem boundary | Static filesystem schema is documented. | No runtime-origin expanded effective map established. |
| Separate tool surfaces disabled | Separate-control requirement is documented. | No complete runtime availability manifest established. |
| Zero commands/tools | Contract can require zero. | No trusted runtime ledger schema established. |
| Fail-closed session end | Desired behavior is specified here. | No runtime-native close acknowledgement established. |

The first unresolved prerequisite is `CSNC-G1`; `CSNC-G2` is independently unresolved. The contract is therefore not ready for selection or execution.

## Conditions for a future authoritative contract

All of the following need fresh authoritative evidence before this contract can be adopted:

1. Officially documented runtime attestation schema covering every required field above.
2. Runtime-authenticated delivery before commands/tools become callable.
3. Complete effective config and requirements source manifest with hashes and precedence.
4. Actual Windows sandbox implementation and proxy active-state fields.
5. Complete effective network/filesystem maps and separate-surface availability manifest.
6. Trusted zero-command/tool ledger.
7. Runtime-native terminate-without-command operation and final closure acknowledgement.

If any item remains unavailable, the exact plan remains not established. Do not approximate with static files, agent prose, UI labels, environment reads, logs, or probes.

## Authoritative references already checkpointed

- [Permissions](https://learn.chatgpt.com/docs/permissions)
- [Config basics](https://learn.chatgpt.com/docs/config-file/config-basic)
- [Managed configuration](https://learn.chatgpt.com/docs/enterprise/managed-configuration)
- [Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox)
- [Sandbox](https://learn.chatgpt.com/docs/sandboxing)
- Prior evaluation: `docs/teacher-candidate-dedicated-runtime-boundary-exact-plan-evaluation-2026-09-22.md`
- Pre-selection result: `docs/teacher-candidate-profile-pre-selection-read-only-attestation-result-2026-09-22.md`

No browser or HTTP request was made during this design turn.

## Preserved state and HOLD

- Candidate: not installed, moved, selected, enabled, or changed.
- Session/runtime: unchanged; no new session started.
- Normal user config and Windows sandbox settings: unchanged.
- Guest and requirements artifact: not created.
- Probe/copy/build/server/browser/HTTP: not performed.
- Evidence attempt: `0/1` unconsumed.
- Current-task `NB-G4`: remains `NOT PROVEN — STOP`.
- Git commit/push: not performed.
- Public deployment, production data, and external services: no changes or writes.
- Existing tracked `20` and untracked `7,839` items: not organized, modified, or staged.

Final state: `HOLD`.
