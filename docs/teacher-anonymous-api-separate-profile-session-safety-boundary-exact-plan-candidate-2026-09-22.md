# Teacher anonymous API — separate build profile/session safety-boundary exact plan candidate

- Recorded: 2026-09-22 17:00 JST
- Execution ID: `TEACHER_ANONYMOUS_API_SAFE_METADATA_EVIDENCE_20260922_01`
- Evidence attempt: `0/1` unchanged
- Scope: read-only research and design records only
- Profile creation/change/selection, session start, network/loopback probe, isolated copy, build, server, browser, HTTP, rollback, GitHub, deploy, production data, and external-service writes: not authorized or performed
- Incoming state: `NB-G0..NB-G3 = PASS`; `NB-G4 = NOT PROVEN — STOP`

## 1. Decision

Classification:

`SEPARATE_PROFILE_SESSION_EXACT_PLAN_CANDIDATE_ESTABLISHED__ACTIVE_BOUNDARY_NOT_PROVEN__HOLD`

A separate permission profile and separate session can be designed as a candidate safety boundary without contradicting the existing Network Boundary record. The design is not an active or verified boundary. It becomes eligible for a later implementation decision only if every pre-session and pre-build Gate below can be closed from trusted configuration/runtime evidence without a network or loopback probe.

If the future client cannot authoritatively attest the selected permission profile, active network proxy, absence of legacy sandbox override, exact workspace root, and enforceable native-Windows split filesystem policy, the candidate is rejected as:

`SEPARATE_PROFILE_SESSION_SAFETY_BOUNDARY_NOT_PROVEN`

and stops before copy or build.

## 2. Authoritative platform facts and limits

Official OpenAI documentation fixes the following:

1. Permission profiles combine filesystem and command-network rules for local sandboxed commands.
2. `network.enabled = true` permits command networking but does not start the network proxy.
3. With network enabled and the proxy active, the proxy enforces domain rules; if there are no allow entries, external destinations are blocked.
4. With the proxy active, local/private destinations are blocked by default. Exact local literals can be allowed explicitly, while host patterns are normalized without port scope.
5. Spawned local commands such as package managers and test runners inherit the sandbox boundary. This covers the fixed Node process, in-process build plugins, and OS child processes started by that command.
6. Web search, Codex plugins/connectors, MCP servers, browser/Computer Use, Codex service traffic, and Codex cloud are separate network surfaces. A command permission profile does not control them.
7. On native Windows, `elevated` sandboxing is the strongest enforcement path. The `unelevated` fallback has weaker network isolation and cannot enforce every split read/write carveout; unsupported policies are refused.
8. Permission profiles and legacy `sandbox_mode` / `sandbox_workspace_write` must not be mixed for the candidate session. A loaded legacy setting or CLI `--sandbox` can cause the legacy system to be selected instead.
9. Permission profiles are currently documented as beta. Therefore exact version, configuration sources, selected profile, and effective runtime state must be fixed again before any implementation.

Official sources:

- [OpenAI Docs — Permissions](https://learn.chatgpt.com/docs/permissions)
- [OpenAI Docs — Sandbox](https://learn.chatgpt.com/docs/sandboxing)

## 3. Compatibility with existing NB-G0..NB-G4

This plan does not revise earlier evidence:

- `NB-G0..NB-G3` remain fixed PASS for the current managed `:workspace` / network-disabled task.
- `NB-G4 = NOT PROVEN — STOP` remains correct for the current task because its network-disabled attestation did not define native-Windows local bind and loopback-connect semantics.
- This candidate is a different future profile/session boundary: command networking would be enabled only so that an active policy proxy can authoritatively apply an empty external allowlist and its default local/private guard.
- Success of the candidate would create a new result for the separate session. It would not retroactively turn the current task's `NB-G4` into PASS.

## 4. Loopback necessity decision

### 4.1 Fixed current build path

The only fixed future build invocation remains:

- executable: `C:\Program Files\nodejs\node.exe`
- argv[0]: `<isolated-root>\node_modules\vinext\dist\cli.js`
- argv[1]: `build`
- argv length: exactly 2
- cwd: exact isolated root
- shell: false
- retry/fallback/second build: none

Static evidence for the installed Vinext `1.0.0-beta.5` path:

| Input | SHA-256 |
|---|---|
| `node_modules/vinext/dist/cli.js` | `1bf2dcd565adc188d97f1a5b8f11c04d87e38735469fcff4aa3f323082961b90` |
| `node_modules/vinext/dist/config/prerender.js` | `c563328635ac30c845b41f36817740a7aa268cea2a3983be15e215d01ec82735` |
| `node_modules/vinext/dist/build/run-prerender.js` | `e6112cd83c143dab493c5f3d8fab5ef859ea77b543bb7ce46d143d80f4210c6b` |
| `node_modules/vinext/dist/build/prerender.js` | `265e09c47ca96d695f10f71f25f27a25893e6a6abe2231029cf64681ca04c663` |
| `node_modules/vinext/dist/build/prerender-server-pool.js` | `b49678057dc306e7408665b78d12344038d25baf6263adf0d022c1ef1ef61425` |
| `vite.config.ts` | `3c028e727dde6c92022197ba7241a424ccd1e3d335f1f46cc9bbf91a8a3a968c` |
| `next.config.ts` | `d063bebef3a4878ae82f9f9547c2c9675b8b6945ab23702932dcb63a011a9fc9` |
| `package.json` | `7da02a227374c62994899b1ca37b928fdd9125adc70ec49dc18ccb41d7d36555` |

`resolveVinextPrerenderDecision` enables prerender only for `--prerender-all`, Next `output: "export"`, or an explicit Vinext prerender config. The fixed argv contains no prerender flag, `next.config.ts` does not select export, and the fixed project configuration does not select Vinext prerender.

The installed optional prerender path does bind `127.0.0.1` on ephemeral ports, performs HTTP fetches to those ports, and may fork child production-server processes. That proves loopback is used if that optional path is selected; it does not prove that the fixed current build selects or requires it.

### 4.2 Fixed decision

For this candidate, build loopback necessity is **not proven**. Therefore loopback is prohibited.

- No `localhost`, `127.0.0.1`, `::1`, private IP, link-local IP, wildcard, Unix socket, or port is allowlisted.
- `allow_local_binding` remains `false`.
- A blocked local bind/connect is a fail-closed build failure, not grounds for a retry, profile edit, exception, fallback, or second build.
- Discovery during a future approved build that loopback was attempted does not authorize it. Stop and preserve evidence without consuming the real-evidence attempt.

### 4.3 Separate future loopback branch

No loopback-allowed profile is adopted by this plan. It may be designed only after a separate static record proves that the fixed build path necessarily selects the loopback code path.

Even then:

- the only candidate literals are `127.0.0.1` and, only if separately required, `::1`;
- `localhost`, wildcards, private/LAN/link-local destinations, Unix sockets, and `allow_local_binding = true` remain prohibited;
- OpenAI Docs define host/IP allowlisting, not exact port allowlisting. If the required safety contract demands one exact ephemeral or fixed port, the documented profile mechanism cannot meet it and the result is HOLD;
- external destination allow entries remain empty, so external egress must stay fail-closed;
- the loopback branch requires a new design review and separate approval before profile creation or session start.

## 5. Exact isolated root and session topology

Exact future isolated project root, not created:

`C:\Users\akane\Documents\Codex\2026-06-14\new-chat\suiyoukai-stamp-app\work\teacher-anonymous-api-safe-metadata-evidence-20260922-01\isolated-build\teacher-admin-production-candidate`

The future build session must:

1. use this directory as its only runtime workspace root and cwd;
2. not use the repository root or its parent as a workspace root;
3. load no project/user profile that adds another writable root;
4. start only after the separately approved independent copy exists and passes the fixed no-link/hash/inventory Gates;
5. use a unique permission profile name that is not extended or merged by another configuration layer;
6. use `approval_policy = "never"` for the build session so blocked access cannot become an interactive escalation;
7. have no applicable command rule or previously approved prefix that can run the fixed Node command outside the profile;
8. prohibit `require_escalated`, Full Access, `:danger-full-access`, and legacy `--sandbox` selection.

## 6. Candidate permission profile — loopback denied

Candidate identifier:

`teacher-build-evidence-offline-loopback-denied-20260922`

This is a design specimen only. It must not be installed, selected, or used without a separate approval and a fresh official-schema check.

```toml
default_permissions = "teacher-build-evidence-offline-loopback-denied-20260922"
approval_policy = "never"

[features]
network_proxy = true

[permissions.teacher-build-evidence-offline-loopback-denied-20260922]
description = "Isolated Teacher build; no external destinations and no loopback"

[permissions.teacher-build-evidence-offline-loopback-denied-20260922.workspace_roots]
'C:\Users\akane\Documents\Codex\2026-06-14\new-chat\suiyoukai-stamp-app\work\teacher-anonymous-api-safe-metadata-evidence-20260922-01\isolated-build\teacher-admin-production-candidate' = true

[permissions.teacher-build-evidence-offline-loopback-denied-20260922.filesystem]
":root" = "deny"
":minimal" = "read"
":tmpdir" = "deny"
":slash_tmp" = "deny"

[permissions.teacher-build-evidence-offline-loopback-denied-20260922.filesystem.":workspace_roots"]
"." = "read"
"dist" = "write"
".wrangler" = "write"
"node_modules/.vite" = "write"
".tmp" = "write"

[permissions.teacher-build-evidence-offline-loopback-denied-20260922.network]
enabled = true
allow_local_binding = false
allow_upstream_proxy = false
enable_socks5 = false
enable_socks5_udp = false
```

Network rules deliberately contain no `domains` allow entries and no Unix-socket allow entries. The `dangerously_*` keys remain unset. The candidate is valid only if the active proxy is independently attested; network-on with proxy-off is unrestricted and is an immediate STOP.

## 7. Filesystem and write boundary

The build process may read the fixed minimal runtime and the isolated workspace. It may write only these isolated-root subtrees:

| ID | Exact isolated-root subtree | Purpose |
|---|---|---|
| `PS-DIST` | `dist/**` | Vinext/Vite generated output, including `dist/.openai/**` |
| `PS-WRANGLER` | `.wrangler/**` | Local-only Wrangler/Miniflare logs, registry, deploy metadata, and state |
| `PS-VITE` | `node_modules/.vite/**` | Vite cache inside the independent dependency copy |
| `PS-TEMP` | `.tmp/**` | Child-only redirected temp files |

Every other isolated-root path is read-only. Every path outside the isolated root is denied except the fixed minimal runtime read surface.

Child-only environment overlay remains:

- `WRANGLER_WRITE_LOGS=false`
- `WRANGLER_LOG_PATH=<isolated-root>/.wrangler/logs`
- `MINIFLARE_REGISTRY_PATH=<isolated-root>/.wrangler/registry`
- `WRANGLER_SEND_METRICS=false`
- `TEMP=<isolated-root>/.tmp`
- `TMP=<isolated-root>/.tmp`
- `TMPDIR=<isolated-root>/.tmp`

Do not modify or repurpose `HOME`, `USERPROFILE`, `CODEX_HOME`, PATH, credentials, tokens, system/user environment, or Production D1 identifiers.

## 8. Child process and plugin boundary

### Covered by the candidate profile

- the fixed top-level Node process;
- Vinext, Vite, OpenAI Sites, and Cloudflare code loaded in that process;
- Node `child_process` descendants, including optional toolchain children;
- package-manager/test-runner style local commands if they were spawned, although the fixed command prohibits install/test/package-manager invocation.

These are local sandboxed command execution and must inherit the same filesystem and network boundary. Any child escape, unsandboxed helper, unsupported split policy, or request for elevation is a hard failure.

### Not covered by the command profile

- Codex plugins as product capabilities;
- connectors/apps;
- local or remote MCP servers;
- web search;
- browser or Computer Use;
- Codex cloud/service traffic.

The future build session must not invoke these surfaces. They must be disabled, unavailable, or excluded by trusted session controls before build authorization. A Codex plugin name and an in-process Vite build plugin are not treated as the same security surface.

## 9. Future pre-session Gate

All must PASS before the separate session is started:

| Gate | Requirement |
|---|---|
| `PS-G0` | Candidate official schema is rechecked against current OpenAI Docs; no key or enforcement semantic has changed. |
| `PS-G1` | Unique profile source and every loaded configuration layer are enumerated and hash-fixed without secrets. |
| `PS-G2` | No loaded `sandbox_mode`, `sandbox_workspace_write`, CLI `--sandbox`, same-name profile extension, or higher-precedence widening exists. |
| `PS-G3` | Managed `allowed_permission_profiles`, if present, explicitly permits only the intended candidate for this task; inability to resolve managed policy is STOP. |
| `PS-G4` | Separate session root is exactly the fixed isolated root; repository root, parent, shared roots, and unrelated roots are absent. |
| `PS-G5` | Native-Windows `elevated` enforcement, or another officially supported equivalently strong enforcement path, can enforce the exact split read/write policy. `unelevated` is not accepted. |
| `PS-G6` | Network proxy activation is trustedly attested before any build command; configuration intent alone is insufficient. |
| `PS-G7` | Effective network allow entries are empty; local/private guard is active; `allow_local_binding=false`; no Unix socket or `dangerously_*` exception exists. |
| `PS-G8` | Approval policy is `never`; no escalation, Full Access, approved-prefix bypass, or command rule can unsandbox the fixed Node invocation. |
| `PS-G9` | Web search, Codex plugins/connectors, MCP, browser/Computer Use, cloud execution, and other separate network surfaces are disabled/unavailable for the build step. |
| `PS-G10` | No profile/session creation, selection, or start occurs under this design-only approval. |

No network/loopback probe may substitute for a missing attestation. First failure produces `SEPARATE_PROFILE_SESSION_SAFETY_BOUNDARY_NOT_PROVEN` and HOLD.

## 10. Future pre-build Gate

After a separately approved session start, but before process creation, all must PASS:

| Gate | Requirement |
|---|---|
| `PB-G0` | Independent isolated copy, input closure, original `dist` snapshot, no-link proof, and canonical manifests match the existing fixed records. |
| `PB-G1` | Fixed tool/config hashes in section 4 match inside the isolated root. |
| `PB-G2` | Effective profile/session attestations still match `PS-G0..PS-G9`; no setting changed after startup. |
| `PB-G3` | Loopback allow entries remain absent because necessity is not proven. |
| `PB-G4` | Fixed executable/argv/cwd/`shell:false` and child-only environment match exactly. |
| `PB-G5` | Installed dependencies and fixed binary exist; no install/download/upgrade/telemetry/deploy/fallback path is authorized. |
| `PB-G6` | Complete isolated-root pre-build inventory is fixed; only the four approved write subtrees are writable. |
| `PB-G7` | Original source/tests/`dist`, identities, contract, and shared dirty worktree are hash-fixed and remain outside the write boundary. |
| `PB-G8` | Evidence attempt remains `0/1`; build has its own separate one-shot authorization and does not consume it. |

Any failure stops before Node starts.

## 11. Future one-shot and post-build rules

This section is a candidate only and does not authorize execution.

1. Run exactly one fixed Node/Vinext build command.
2. A denied network, denied loopback, denied write, child-process failure, or plugin failure ends the build with no repair, retry, fallback, profile edit, or second build.
3. Capture the complete isolated-root post-build inventory.
4. Reject every `ADDED`, `REMOVED`, or `CHANGED` path outside the four write subtrees.
5. Re-hash every copied read-only input and all known original targets.
6. Record only bounded status metadata; do not record secrets, bodies, complete headers, tokens, personal data, or production identifiers.
7. Do not start a server/browser/HTTP attempt automatically.
8. Evidence attempt remains `0/1` until the separately approved real-evidence attempt begins.
9. Rollback deletion of the exact isolated task root remains a separate approval.

## 12. Sequential approval boundaries

Each requires a later explicit approval and must end before the next begins:

1. Profile/config artifact creation only.
2. Independent isolated-copy creation and verification only.
3. Separate profile/session selection and startup attestation only.
4. One-shot build only.
5. Post-build fixation and acceptance decision only.
6. Real server/browser/HTTP evidence attempt `1/1` only.
7. Rollback deletion, if required.

Approval of this design authorizes none of those actions.

## 13. HOLD

The exact-plan candidate is established, but no active boundary is proven or adopted. No profile/session was created, changed, selected, or started. No probe, copy, build, server, browser, HTTP request, real attempt, rollback, Git operation, deploy, production-data operation, or external-service write was performed.

HOLD.
