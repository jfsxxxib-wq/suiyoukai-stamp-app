# Teacher anonymous API — NB-G3 read-only evaluation result

- Recorded: 2026-09-22 15:57 JST
- Execution ID: `TEACHER_ANONYMOUS_API_SAFE_METADATA_EVIDENCE_20260922_01`
- Evidence attempt: `0/1` unchanged
- Resumed Gate: `NB-G3`
- Evaluation mode: sequential, read-only, fail-fast
- Exact plan SHA-256: `d42ac51b9032bb4b1feca1409a5546d34e7da59e9130c8d3d514f1667812875b`
- Prior authoritative closure: `NB-G0..NB-G2` PASS

## NB-G3 requirement

External DNS, HTTP, HTTPS, raw TCP/UDP, and direct-IP egress must be fail-closed by the effective sandbox boundary.

## Bounded evidence

### Official OpenAI specification

- Default `workspace-write` keeps network access off unless it is enabled in configuration.
- Network-off means commands cannot access the network regardless of proxy configuration.
- Network-on with the proxy off permits unrestricted direct outbound access.
- Destination rules apply to scripts, programs, and subprocesses spawned by commands.

Official sources:

- [Agent approvals & security — Network access and Network isolation](https://learn.chatgpt.com/docs/agent-approvals-security)
- [Permissions — Network permissions](https://learn.chatgpt.com/docs/permissions)

### Effective and local configuration evidence

- The trusted session metadata reports managed `workspace-write` with network access `restricted`.
- The local Codex config explicitly contains top-level `sandbox_mode = "workspace-write"`.
- The same local config contains `[sandbox_workspace_write] network_access = true`.
- No `network_proxy`, permission-profile network rule, or `allow_local_binding` key was found in that bounded config inspection.
- No managed `requirements.toml` was present at the three bounded standard paths inspected by this task.

Only the relevant non-secret keys and section names were inspected. No credentials, environment values, or unrelated configuration were collected.

## Gate decision

| Gate | Result | Reason |
|---|---|---|
| `NB-G3` | **NOT PROVEN — STOP** | The effective session says `restricted`, but the available attestation does not define the enforced destinations or protocols. The stored local setting enables network, and no bounded local evidence identifies the managed override that makes external DNS, raw TCP/UDP, direct-IP, HTTP, and HTTPS egress fail-closed. Official defaults cannot replace proof of the effective policy. |

No inference is made that `restricted` necessarily means complete external egress denial. No live network probe is permitted or used.

## Fail-fast boundary

- `NB-G4..NB-G7`: not evaluated.
- `TW-G0..TW-G10`: not evaluated.
- No isolated copy, build, server, browser, HTTP attempt, or rollback was executed.
- No configuration was changed.

## Classification

`ISOLATED_BUILD_SAFETY_BOUNDARY_NOT_RESOLVED`

## Preserved state

- Evidence attempt remains `0/1`.
- Candidate isolated root remains uncreated.
- Original source, tests, and `dist` are unchanged.
- GitHub, deployment, publication, Production D1, formal data, and external services are unchanged.

HOLD.
