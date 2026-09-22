# Teacher anonymous API isolated-build safety boundary — exact plan

- Recorded: 2026-09-22 15:33 JST
- Execution ID: `TEACHER_ANONYMOUS_API_SAFE_METADATA_EVIDENCE_20260922_01`
- Real-evidence attempt: `0/1` unchanged
- Scope: close NB-01 and TW-01 by plan only
- Isolated copy / build / server / browser / HTTP / real attempt / rollback: not authorized or performed
- Starting state: `SAFE_METADATA_REAL_EVIDENCE_PATH_NOT_RESOLVED`

## 1. Fixed incoming evidence

| Item | Fixed value |
|---|---|
| Option-path decision plan SHA-256 | `08b3e872719b610a76f6b58b10c74b2e2736f6c1a2bea46db43f3a16d8045c22` |
| Option A result | `OPTION_A_NOT_SUFFICIENT_FOR_REQUIRED_EVIDENCE` |
| Option A result SHA-256 | `57a334b6f1e6404483c887b2c597fabc05e5e20c9731873f9498a72459682f4c` |
| Option B result | `OPTION_B_NOT_SAFE_OR_NOT_ISOLATABLE` |
| Option B result SHA-256 | `7b762508bf073f3aa8a12d8c0edf698e04c12a0c0e4c87ad9e2b32be106d03bf` |
| Instrumentation result SHA-256 | `8fdcde9843584e14cb61182656b87eaf3113c35626e16a4c5b618f6ea60a80a1` |
| Original `dist` inventory | 135 files / 2,239,925 bytes |
| Original `dist` legacy inventory SHA-256 | `0fca4254ed6cee52ba533cf751f8d91ded8787dc1ba59633297a765a1f90c190` |
| Original `dist` ordinal inventory SHA-256 | `112061c6e2f28220ae5bf293ddc56200742eaa68ceca5ae446999a8b24796977` |
| Copy-input closure | 41,338 files / 593,721,992 bytes |
| Source-root reparse points | `0` |
| Dependency reparse points | `0` |

## 2. Candidate isolated root

Exact target, not created by this plan:

`work/teacher-anonymous-api-safe-metadata-evidence-20260922-01/isolated-build/teacher-admin-production-candidate`

All later path checks must use a resolved absolute path. Stop before creation if the target exists, its parent resolves outside the exact task root, or any copied entry is a junction, symlink, hardlink, or other write-through reference to the original.

## 3. NB-01 — no-network enforcement

### 3.1 Candidate comparison

| Candidate | Process + children | Fail-closed | Host/system mutation | Admin | Decision |
|---|---:|---:|---:|---:|---|
| Managed Codex default sandbox with restricted network; no escalation | Yes, sandbox boundary contains descendants | Yes, if platform policy is attested before launch | None | No | **Preferred candidate** |
| Windows Firewall rule per executable | Can cover executable but is host-global state | Potentially | Yes; rule creation/removal | Normally yes | Reject |
| Proxy environment variables | No; direct sockets and custom DNS can bypass | No | None | No | Reject |
| Hosts-file/DNS alteration | Does not cover direct IP/other protocols | No | System-wide mutation/rollback | Usually yes | Reject |
| Docker/VM with `network=none` | Descendants isolated | Yes | Requires a different runtime/daemon and new build topology | Environment-dependent | Reject for this execution |
| New AppContainer/restricted-token launcher | Potentially | Not proven by an existing verified launcher | New security/runtime mechanism | Environment-dependent | Reject |

### 3.2 Selected planning candidate

Identifier: `NB01_MANAGED_SANDBOX_EXTERNAL_DENY`

Required properties:

1. Launch only through the current managed `workspace-write` sandbox with network access reported as restricted.
2. Use `sandbox_permissions: use_default`; never request or reuse `require_escalated` for copy, build, verification, or child processes.
3. The sandbox boundary, not proxy variables or application cooperation, must deny DNS and outbound TCP/UDP, including HTTP and HTTPS, to every non-loopback destination.
4. The restriction must apply to the fixed Node process and every process/plugin it spawns.
5. No Windows Firewall, security policy, administrator token, PATH change, certificate store, hosts file, DNS setting, VPN, or machine-wide proxy is changed.
6. No post-build network-setting restoration is needed.
7. Package install, download, npm/npx, Wrangler CLI, deploy, telemetry upload, and remote API use remain prohibited.

### 3.3 Loopback rule

- Build phase preference: deny all network, including loopback.
- If Vinext's inspected prerender path demonstrably requires local process-to-process HTTP, the only permitted exception candidate is `127.0.0.1` and `::1` within the same sandbox.
- No LAN, private-network, link-local, wildcard bind, hostname-derived non-loopback, or public destination is permitted.
- A loopback exception may not be assumed. It requires a separate pre-build Gate showing both that it is necessary and that the sandbox still denies every non-loopback destination.
- The later real server/browser attempt has its own loopback authorization and is not covered by this build plan.

### 3.4 Pre-launch attestation Gate

`NB-G0` through `NB-G7` must all PASS before the build process is created:

| Gate | Requirement |
|---|---|
| `NB-G0` | Current permission profile is still managed `workspace-write`; network is explicitly reported restricted. |
| `NB-G1` | Launch request uses default sandbox only; no escalation or approved unsandboxed prefix can apply. |
| `NB-G2` | Sandbox documentation/runtime attestation covers the launched process and all descendants/plugins. |
| `NB-G3` | External DNS, HTTP, HTTPS, raw TCP/UDP, and direct-IP egress are fail-closed by the sandbox boundary. |
| `NB-G4` | Loopback is denied, or an exact loopback-only exception is separately fixed; no broader network access exists. |
| `NB-G5` | No install/download/telemetry/deploy command or fallback path exists in the fixed argv. |
| `NB-G6` | No system-wide setting, administrator action, firewall mutation, or later restoration is required. |
| `NB-G7` | If the platform cannot attest any preceding property without a network probe, stop before build; do not probe or infer. |

Failure classification: `ISOLATED_BUILD_SAFETY_BOUNDARY_NOT_RESOLVED`.

No live network-denial probe is part of this plan. A probe would itself expand the authorized execution surface and requires separate approval.

## 4. TW-01 — isolated-root tool-state write allowlist

### 4.1 Static findings

- Vinext resolves the build root from `process.cwd()` and primary output as `<cwd>/dist`.
- `cleanBuildOutput` recursively removes only the resolved output directory when it is inside the root.
- OpenAI Sites plugin writes generated hosting output below `dist/.openai`.
- Project configuration sets `WRANGLER_LOG_PATH=.wrangler/logs` and `MINIFLARE_REGISTRY_PATH=.wrangler/registry` when unset.
- Cloudflare plugin contains project-local paths below `.wrangler/deploy` and `.wrangler/state`.
- Vite's default cache directory is `node_modules/.vite`.
- Vinext compatibility code may update `package.json` only when the project lacks `type: module`; the fixed project already has `type: module`, so any root-file mutation is forbidden.
- The installed Windows `workerd` binary exists in copied dependencies; no binary download is allowed.
- OS temporary-directory calls exist in the toolchain and must be redirected to an isolated child-only temp directory.

### 4.2 Exact write allowlist candidate

All paths are relative to the resolved isolated root. Directory entries themselves and descendants are allowed; no other path is writable by contract.

| Allowlist ID | Exact path | Purpose |
|---|---|---|
| `TW-DIST` | `dist/**` | Vinext/Vite server, client, SSR, manifests, prerender output, and `dist/.openai`. |
| `TW-WRANGLER` | `.wrangler/**` | Local-only logs, registry, deploy metadata, and Miniflare state generated by the build plugin. |
| `TW-VITE-CACHE` | `node_modules/.vite/**` | Vite dependency/cache state inside the independent dependency copy. |
| `TW-TEMP` | `.tmp/**` | Child-only OS temporary files after exact temp redirection. |

Explicitly forbidden writes include:

- `.next/**`
- `.vinext/**`
- `.npm-cache/**`
- `.openai/**` at the isolated root; only `dist/.openai/**` is allowed
- any `node_modules/**` path outside `node_modules/.vite/**`
- `package.json`, `package-lock.json`, `vite.config.ts`, `next.config.ts`, `tsconfig.json`, `tsconfig.tsbuildinfo`, `next-env.d.ts`, or any other copied root file
- `app/**`, `components/**`, `lib/**`, `tests/**`, `data/**`, `db/**`, `drizzle/**`, `public/**`, and every other copied source/input path
- every path outside the resolved isolated task root

### 4.3 Child-only environment fixation

Before a future build, set only the build child's environment overlay; do not change the parent/user/system environment:

- `WRANGLER_WRITE_LOGS=false`
- `WRANGLER_LOG_PATH=<isolated-root>/.wrangler/logs`
- `MINIFLARE_REGISTRY_PATH=<isolated-root>/.wrangler/registry`
- `WRANGLER_SEND_METRICS=false`
- `TEMP=<isolated-root>/.tmp`
- `TMP=<isolated-root>/.tmp`
- `TMPDIR=<isolated-root>/.tmp`

Do not repurpose or change `HOME`, `USERPROFILE`, `CODEX_HOME`, PATH, credentials, tokens, or environment values containing secrets. Do not supply Production D1 identifiers. The application build binding remains the fixed placeholder database ID.

### 4.4 Copy and inventory rules

The earlier `0fca...` evidence hash is reproducible only with the PowerShell current-culture ordering used when that record was created, although its prose called the ordering ordinal. The same unchanged 135 files, 2,239,925 total bytes, and 16,133 manifest bytes produce `112061...` under actual ordinal ordering. Preserve `0fca...` as legacy provenance only. All future original-versus-isolated comparisons use the exact ordinal rule and `112061...`; do not mix the two ordering algorithms or infer a file-content change from their digest difference.

The future isolated-copy task must:

1. Copy the 41,338-file input closure byte-for-byte without links or shared writable cache.
2. Copy the 135-file original `dist` as the isolated pre-build whole-tree snapshot.
3. Generate a canonical input manifest using `relative-path<TAB>byte-length<TAB>lowercase-sha256`, ordinal path sort, LF join, no terminal LF; the original `dist` side must equal `112061c6e2f28220ae5bf293ddc56200742eaa68ceca5ae446999a8b24796977` before copy comparison.
4. Verify entry-for-entry equality between original inputs and isolated inputs.
5. Verify the three instrumentation files equal their fixed hashes.
6. Capture a full isolated-root pre-build inventory before creating any allowlisted tool-state.
7. Confirm original source/`dist` hashes immediately before build.

No copy action is authorized by this plan.

### 4.5 Build command fixation candidate

- executable: `C:\Program Files\nodejs\node.exe`
- argv[0]: `<isolated-root>\node_modules\vinext\dist\cli.js`
- argv[1]: `build`
- argv length: exactly 2
- cwd: exact isolated root
- shell: false
- attempt: a separately approved build attempt; not the real-evidence `0/1` budget
- retry / fallback / second build: none

The runtime executable may be outside the isolated root as a read-only fixed runtime. CLI, dependencies, cwd, inputs, outputs, caches, logs, registry, state, and temp must be inside the isolated root.

### 4.6 Post-build write-set verification

After a future one-shot build and before any server/real attempt:

1. Compute the complete isolated-root post-build inventory.
2. Diff it against the complete pre-build inventory with exact `ADDED`, `REMOVED`, and `CHANGED` records.
3. Require every changed path to match one of the four allowlist prefixes.
4. Require all copied source/config/root files and all non-allowlisted dependency files to retain their hashes.
5. Capture `dist` as a whole-tree snapshot; content-hash filenames and generated random values are valid only as recorded members of that snapshot.
6. Resolve route/client artifacts through generated manifests and record marker-presence booleans/counts only; do not print generated bodies.
7. Re-hash original source and original `dist`; require exact equality with pre-build values.
8. Verify no path outside the isolated root was created or modified by the task within the bounded known targets.
9. If any unexpected write exists, classify the build as invalid, do not repair or rebuild, do not start a server, and HOLD.

### 4.7 Rollback boundary

- The only rollback target candidate is the exact task-scoped isolated root.
- Deletion is not authorized by this plan.
- A future rollback requires separate authority, exact resolved-path verification, proof the root was created by that execution, and proof it is not finalized.
- Original source, original `dist`, shared worktree files, user profile, and external state are never rollback targets.
- Because no links/shared writable cache are allowed and temp/tool state is root-local, deleting the isolated root would remove every permitted build write without restoration of host settings.

## 5. TW-01 Gate

`TW-G0` through `TW-G10` must all PASS before build:

| Gate | Requirement |
|---|---|
| `TW-G0` | Exact isolated target is absent and resolves under the fixed task root. |
| `TW-G1` | Copy-input closure/count/bytes and original `dist` inventory match fixed evidence. |
| `TW-G2` | No reparse point, hardlink, shared writable cache, or original-path reference exists in the copy. |
| `TW-G3` | Isolated inputs match originals by canonical per-file manifest. |
| `TW-G4` | Package is already `type: module`; React/workerd dependencies are present; no upgrade/download branch is needed. |
| `TW-G5` | Child-only environment maps Wrangler/Miniflare/temp state to the four allowlisted root-local paths. |
| `TW-G6` | Fixed command uses isolated CLI/dependencies/cwd and `shell:false`. |
| `TW-G7` | Original source and original `dist` are hash-fixed before launch. |
| `TW-G8` | Complete pre-build isolated-root inventory is fixed. |
| `TW-G9` | Post-build diff checker rejects every write outside the four allowlist prefixes. |
| `TW-G10` | Any unexpected write causes stop with no repair, retry, fallback, server, or real attempt. |

Failure classification: `ISOLATED_BUILD_SAFETY_BOUNDARY_NOT_RESOLVED`.

## 6. Combined Gate

The isolated whole-build may be re-evaluated only if all of the following are true:

1. `NB-G0..NB-G7` all PASS before process creation.
2. `TW-G0..TW-G10` all PASS at their applicable pre/post-build stages.
3. The fixed safe-record schema and execution ID remain unchanged.
4. Real-evidence attempt remains `0/1`; build does not consume it.
5. Original source/tests/`dist`, predecessor/successor identities, contract, GitHub, publication, Production D1, formal data, and external services remain unchanged.

If NB-01 or TW-01 cannot be uniquely closed, record:

`ISOLATED_BUILD_SAFETY_BOUNDARY_NOT_RESOLVED`

and stop without build or real attempt.

If both close, the only allowed outcome of the future safety preflight is `ISOLATED_BUILD_SAFETY_BOUNDARY_READY_FOR_SEPARATE_BUILD_APPROVAL`. That status does not itself authorize copy creation, build, server/browser/HTTP, real attempt, or rollback.

## 7. Approval boundaries

Each requires a later separate approval:

1. Isolated-copy creation and hash verification.
2. Build preflight and one-shot build execution.
3. Post-build snapshot/diff fixation.
4. Server/browser/HTTP real-evidence attempt `1/1`.
5. Rollback deletion, if needed.

No step automatically advances to the next.

## 8. HOLD

This document is a safety-boundary plan only. No isolated directory, tool-state, build output, server, browser, HTTP request, network probe, real attempt, rollback, source/test/`dist` change, GitHub save, deploy, publication, external-service change, or production-data change was made.

HOLD.
