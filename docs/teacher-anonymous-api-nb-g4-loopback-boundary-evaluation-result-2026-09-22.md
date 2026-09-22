# Teacher anonymous API — NB-G4 loopback boundary read-only evaluation

- Recorded: 2026-09-22 16:26 JST
- Execution ID: `TEACHER_ANONYMOUS_API_SAFE_METADATA_EVIDENCE_20260922_01`
- Evidence attempt: `0/1` unchanged
- Scope: current managed-runtime loopback semantics and whether a build-only loopback exception can be fixed authoritatively without a probe
- Exact plan SHA-256: `d42ac51b9032bb4b1feca1409a5546d34e7da59e9130c8d3d514f1667812875b`
- Fixed prior state: `NB-G0..NB-G3 = PASS`; `NB-G4 = NOT PROVEN — STOP`

## Authoritative sources

- [OpenAI Docs — Permissions](https://learn.chatgpt.com/docs/permissions)
- [OpenAI Docs — Agent approvals & security](https://learn.chatgpt.com/docs/agent-approvals-security)
- [OpenAI Docs — Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox)

The OpenAI Docs establish these relevant rules:

- With command networking off, commands cannot access the network regardless of proxy-feature state.
- With networking on and the network proxy active, destination rules constrain command traffic.
- `allow_local_binding = false` blocks loopback, link-local, and private destinations by default, while exact local IP literals or `localhost` may be explicitly allowlisted.
- Wildcards do not qualify as explicit local exceptions.
- Host patterns are normalized by stripping simple ports and brackets; the documented policy is therefore host/IP scoped, not port scoped.
- Permission profiles apply to sandboxed command execution for the active profile/session; browser and computer-use surfaces have separate controls.
- The Windows sandbox documentation describes bounded network permissions and offline controls, but does not define whether the current network-disabled Windows boundary denies local bind or loopback process-to-process traffic.

## 1. Does network-disabled authoritatively cover loopback?

**Result: NOT PROVEN.**

The general rule that network-off commands cannot access the network is authoritative for external egress and remains the basis for fixed `NB-G3 = PASS`. The available Windows/runtime documentation does not state the more specific property required by `NB-G4`: that both local bind and loopback connection paths are denied in this managed runtime.

The effective runtime attestation `CODEX_SANDBOX_NETWORK_DISABLED=1` does not encode a separate loopback policy. It therefore cannot, without inference, prove the exact `NB-G4` loopback-denial branch.

## 2. Can an allowed loopback scope be restricted to exact local literals?

**Result: GENERIC CONFIGURATION MECHANISM EXISTS; CURRENT-BUILD APPLICATION NOT PROVEN.**

OpenAI permission profiles support the following policy shape when command networking is enabled and the network proxy is active:

- retain `allow_local_binding = false`;
- allow only exact local IP literals such as `127.0.0.1` and an exact IPv6 loopback literal such as `::1`;
- add no wildcard or public-host allow rule; and
- retain the default prohibition on broader local/private destinations.

This is an IP/host-level exception. The documented normalization strips ports from host patterns, so the policy cannot be claimed to restrict access to one exact loopback port. No such permission profile is fixed, selected, or attested for the current build path.

## 3. Can only build-required loopback be allowed without weakening external egress?

**Result: NOT AUTHORITATIVELY FIXABLE IN THE CURRENT RUNTIME STATE.**

A separately configured, network-enabled, proxy-enforced permission profile with only exact loopback literals can preserve an allowlist-first external-egress boundary in principle. It is not the current managed state:

- the current active command-network state is disabled;
- the fixed build plan requires `sandbox_permissions: use_default` and no escalation;
- no current per-build permission-profile selection or managed profile allowance has been attested;
- no build-specific exact loopback policy is active; and
- the build's necessity for process-to-process loopback has not been authoritatively established.

Changing to or starting a separately configured profile/session would be a new runtime/configuration boundary and requires its own plan and approval. It cannot be treated as already fixed by this read-only evaluation.

## 4. Consistency with the saved `127.0.0.1:4181` success

The immutable Teacher-page records show that a previously and separately authorized attempt:

- started the fixed Node harness;
- bound `127.0.0.1:4181`;
- returned HTTP 200 for the readiness request; and
- was reached by the task-scoped browser, which OpenAI Docs treat as a separately controlled surface.

This is consistent with external command egress being denied while a local bind and a separately controlled browser-to-loopback path are available. It is not proof that build-process-to-child-process loopback is allowed, and it prevents an authoritative claim that the current network-disabled attestation necessarily denies all loopback behavior.

Saved evidence:

- `docs/teacher-page-browser-followup-result-2026-09-22.md`
- `docs/handoffs/2026-09-22-0423-teacher-page-live-precheck-incomplete-HOLD.md`

## NB-G4 decision

| Permitted branch | Status | Reason |
|---|---|---|
| Loopback is denied | `NOT PROVEN` | Neither the effective attestation nor Windows sandbox specification defines the required local-bind and loopback-connect denial. |
| Exact loopback-only exception is separately fixed | `NOT PROVEN` | A generic exact-IP mechanism exists, but no build-specific profile/policy is selected or attested, port scope is unavailable, and build necessity is not fixed. |

Final result: **`NB-G4 = NOT PROVEN — STOP`**.

## Sequential stop and preserved state

- `NB-G5..NB-G7`: not evaluated.
- `TW-G0..TW-G10`: not evaluated.
- Classification remains `ISOLATED_BUILD_SAFETY_BOUNDARY_NOT_RESOLVED`.
- No network or loopback probe, isolated copy, build, server, browser, HTTP request, real attempt, rollback, configuration change, or profile change.
- Evidence attempt remains `0/1`.
- Original source, tests, and `dist` remain unchanged.
- GitHub, deployment, publication, Production D1, formal data, and external services remain unchanged.

HOLD.
