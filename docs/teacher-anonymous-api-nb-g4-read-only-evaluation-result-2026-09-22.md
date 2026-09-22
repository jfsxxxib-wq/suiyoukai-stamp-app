# Teacher anonymous API — NB-G4 read-only evaluation result

- Recorded: 2026-09-22 16:17 JST
- Execution ID: `TEACHER_ANONYMOUS_API_SAFE_METADATA_EVIDENCE_20260922_01`
- Evidence attempt: `0/1` unchanged
- Scope: evaluate only `NB-G4`; `NB-G0..NB-G3` remain fixed PASS and were not re-evaluated
- Exact plan SHA-256: `d42ac51b9032bb4b1feca1409a5546d34e7da59e9130c8d3d514f1667812875b`
- Fixed predecessor result: `docs/teacher-anonymous-api-nb-g3-effective-policy-resolution-result-2026-09-22.md`
- Fixed predecessor result SHA-256: `c4a7d5b116f3d2966f3b2a23d542b567086bc7e4e0758de8792e2082524fe6bd`

## Gate requirement

`NB-G4` requires one of exactly two states before build:

1. loopback is denied; or
2. an exact loopback-only exception is separately fixed, with no broader network access.

The exact plan additionally states that the build-phase preference is to deny all network including loopback; a loopback exception may not be assumed and requires a separate pre-build Gate proving both necessity and continued denial of every non-loopback destination. The previous Teacher server/browser authorization does not authorize loopback for this build.

## Bounded authoritative evidence

### External command-network boundary

The fixed `NB-G3` evidence proves that command network access is disabled for the managed task and that the boundary extends to command-spawned programs and subprocesses. This establishes non-loopback egress denial for the fixed build topology. It does not, by itself, supply a separate authoritative statement that local bind and loopback process-to-process communication are denied.

Official references:

- [Permissions — network permissions and scope](https://learn.chatgpt.com/docs/permissions)
- [Agent approvals & security — network isolation](https://learn.chatgpt.com/docs/agent-approvals-security)

The documented `allow_local_binding` control belongs to the network-policy rule surface. No current fixed runtime attestation or adopted build exception records an exact build-specific loopback policy under that surface.

### Saved local-runtime evidence

Existing immutable records show that a previously authorized Teacher-page attempt in this environment successfully:

- bound a local server to `127.0.0.1:4181`;
- received an HTTP 200 readiness response from `/teacher`; and
- opened `http://127.0.0.1:4181/teacher` in the task-scoped browser.

Sources:

- `docs/teacher-page-browser-followup-result-2026-09-22.md`
- `docs/handoffs/2026-09-22-0423-teacher-page-live-precheck-incomplete-HOLD.md`

These saved facts prevent treating loopback denial as proven merely from the general command-network-disabled attestation. They do not constitute the separate build-specific loopback exception required by the exact plan.

## Gate decision

| Gate | Result | Basis |
|---|---|---|
| `NB-G4` | **NOT PROVEN — STOP** | Neither permitted branch is authoritatively fixed: loopback denial is not attested, and no exact build-specific loopback-only exception has been separately adopted. |

This is a proof-boundary result, not a claim that the build needs loopback and not a claim that broader external egress is available. `NB-G3` remains PASS for non-loopback egress denial.

## Sequential stop boundary

- `NB-G5..NB-G7`: not evaluated.
- `TW-G0..TW-G10`: not evaluated.
- Classification remains `ISOLATED_BUILD_SAFETY_BOUNDARY_NOT_RESOLVED`.
- No transition to TW-01 is permitted.

## Preserved state

- No network probe, isolated copy, build, server, browser, HTTP request, real attempt, rollback, or configuration change.
- Evidence attempt remains `0/1`.
- Original source, tests, and `dist` remain unchanged.
- GitHub, deployment, publication, Production D1, formal data, and external services remain unchanged.

HOLD.
