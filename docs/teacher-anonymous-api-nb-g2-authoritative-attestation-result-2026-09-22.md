# Teacher anonymous API — NB-G2 authoritative attestation result

- Recorded: 2026-09-22 15:51 JST
- Execution ID: `TEACHER_ANONYMOUS_API_SAFE_METADATA_EVIDENCE_20260922_01`
- Evidence attempt: `0/1` unchanged
- Evaluated Gate: `NB-G2` only
- Exact plan SHA-256: `d42ac51b9032bb4b1feca1409a5546d34e7da59e9130c8d3d514f1667812875b`
- Starting classification: `ISOLATED_BUILD_SAFETY_BOUNDARY_NOT_RESOLVED`

## Authoritative evidence

1. The effective session attestation reports a managed `workspace-write` sandbox and restricted network access.
2. Official OpenAI documentation states that, for the ChatGPT desktop app, Codex CLI, and IDE extension, default `workspace-write` keeps command network access disabled unless it is explicitly enabled.
3. The same official documentation states that network destination rules apply to scripts, programs, and subprocesses spawned by commands.
4. Official scope documentation identifies local commands running inside the sandbox as the controlled execution surface and separates hosted web search, connectors, MCP servers, browser/computer-use surfaces, and Codex service traffic from that local-command boundary.

Official sources:

- [Agent approvals & security — Network access and Network isolation](https://learn.chatgpt.com/docs/agent-approvals-security)
- [Permissions — Scope and enforcement](https://learn.chatgpt.com/docs/permissions)

## Application to the fixed build topology

- The fixed Node executable is a program launched by the sandboxed command.
- A build plugin executing in that Node process remains inside the same sandboxed program.
- Any plugin or tool launched as a child of that command is a spawned subprocess and is covered by the documented destination-rule inheritance.
- No unsandboxed launcher, external MCP server, browser, connector, hosted search tool, or approved escalation is part of the fixed build topology.

The plugin mapping above is an application of the documented process boundary, not a live behavioral probe. It adds no assumption that a separately controlled surface is covered.

## Gate decision

| Gate | Result | Reason |
|---|---|---|
| `NB-G2` | **PASS** | Current effective sandbox attestation plus official OpenAI scope establishes that the command's program, scripts, and spawned subprocesses inherit the network boundary. In-process plugins share the sandboxed program; child plugins are subprocesses. |

## Stop boundary

- `NB-G3..NB-G7`: not evaluated in this task.
- `TW-G0..TW-G10`: not evaluated in this task.
- No alternative NB-01 design is produced because the authoritative evidence closes NB-G2.
- Overall isolated-build readiness is not declared; the current HOLD remains until later Gates receive separate approval.

## Preserved state

- No network probe was executed.
- No isolated copy, build, server, browser, HTTP request, real evidence attempt, or rollback was executed.
- Original source, tests, and `dist` were not changed.
- GitHub, deployment, publication, Production D1, formal data, and external services were not changed.

HOLD.
