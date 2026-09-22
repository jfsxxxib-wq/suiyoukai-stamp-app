# Teacher anonymous API — NB-G3 effective policy resolution result

- Recorded: 2026-09-22 16:08 JST
- Execution ID: `TEACHER_ANONYMOUS_API_SAFE_METADATA_EVIDENCE_20260922_01`
- Evidence attempt: `0/1` unchanged
- Scope: resolve only the precedence and effective-policy evidence that left `NB-G3` unproven
- Exact plan SHA-256: `d42ac51b9032bb4b1feca1409a5546d34e7da59e9130c8d3d514f1667812875b`
- Previous immutable result: `efc97e7181c1bcc88520e80172f6f931b8efc0b1b54ec12e112dbe384c674216`

## 1. Priority resolution

Official OpenAI configuration precedence makes session/CLI overrides higher priority than project, profile, and user `config.toml` defaults. Managed requirements are a separate enforcement layer rather than a user value that lower-precedence config can broaden.

The stored user setting `[sandbox_workspace_write] network_access = true` is therefore an input/default permission request. It does not override a stricter already-resolved managed runtime boundary applied to the current task. Effective access is the intersection of that request and the outer managed enforcement boundary; the deny remains controlling.

No project-level `.codex/config.toml`, standard system config, local standard `requirements.toml`, or legacy `managed_config.toml` was present in the bounded paths inspected. This absence is supporting evidence only; it is not used as proof that no cloud-managed policy exists.

Official sources:

- [Configuration basics — Configuration precedence](https://learn.chatgpt.com/docs/config-file/config-basic)
- [Managed configuration — locations and precedence](https://learn.chatgpt.com/docs/enterprise/managed-configuration)
- [Sandboxing — active permissions and configuration defaults](https://learn.chatgpt.com/docs/sandboxing)

## 2. Effective policy

Two independent effective-runtime evidence channels agree:

- Trusted task metadata: managed `workspace-write` sandbox; network access restricted.
- Exact non-secret runtime attestations inherited by sandboxed commands:
  - `CODEX_PERMISSION_PROFILE=:workspace`
  - `CODEX_SANDBOX_NETWORK_DISABLED=1`
  - `CODEX_WINDOWS_SANDBOX_PACKAGE_FAMILY=OpenAI.Codex_2p2nqsd0c76g0`

The effective local-command policy for this task is therefore:

- permission profile: `:workspace`
- command-network state: disabled
- platform enforcement: native Windows Codex sandbox package identified above
- escalation: not part of the fixed build path

The runtime variable names were first enumerated without values. Only the three fixed non-secret policy values above were then read. No environment dump, secret, credential, or unrelated value was collected.

## 3. Probe-free authoritative proof

Official OpenAI documentation states that:

- network-off commands cannot access the network, regardless of proxy feature state;
- the network boundary applies to scripts, programs, and subprocesses spawned by commands;
- web search, connectors, MCP, browser/computer-use, and Codex service traffic are separate surfaces.

Official sources:

- [Agent approvals & security — Network isolation](https://learn.chatgpt.com/docs/agent-approvals-security)
- [Permissions — Network permissions and scope](https://learn.chatgpt.com/docs/permissions)

The fixed build topology contains only the sandboxed Node program, in-process plugins, and any program subprocesses. It does not use the separately controlled surfaces listed above. Combining the effective `NETWORK_DISABLED=1` attestation with the official network-off semantics establishes fail-closed command egress without a live probe.

## Gate decision

| Gate | Result | Basis |
|---|---|---|
| `NB-G3` | **PASS** | Effective command network is explicitly disabled; official semantics make network-off inaccessible to sandboxed commands and their subprocesses. This covers external DNS, HTTP, HTTPS, raw TCP/UDP, and direct-IP egress as network access. |

The earlier `NOT PROVEN` result remains immutable historical evidence: it was correct before the effective runtime variables were identified. This record supersedes only the current decision for `NB-G3`; it does not rewrite the earlier result.

## Stop boundary

- `NB-G4..NB-G7`: not evaluated here.
- `TW-G0..TW-G10`: not evaluated here.
- Overall isolated-build readiness is not declared.
- No alternative network-boundary design is required for NB-G3.

## Preserved state

- No network probe, isolated copy, build, server, browser, HTTP request, real attempt, rollback, or configuration change.
- Evidence attempt remains `0/1`.
- Original source, tests, and `dist` remain unchanged.
- GitHub, deployment, publication, Production D1, formal data, and external services remain unchanged.

HOLD.
