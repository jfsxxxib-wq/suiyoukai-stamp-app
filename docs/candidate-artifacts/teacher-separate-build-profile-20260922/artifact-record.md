# Teacher separate build profile — candidate artifact record

## Identity and scope

- Recorded: 2026-09-22 17:36 JST
- Execution ID: `TEACHER_ANONYMOUS_API_SAFE_METADATA_EVIDENCE_20260922_01`
- Evidence attempt: `0/1` unchanged
- GitHub checkpoint baseline: `6b4b0ba896ebe5415c0ac0a99c780c7e32c3fbd9`
- Source exact-plan candidate: `docs/teacher-anonymous-api-separate-profile-session-safety-boundary-exact-plan-candidate-2026-09-22.md`
- Source plan SHA-256: `c0f0d7b68a8e3258840c0b39013a7805d3cdd1144b625fd29d4f790a71ad44c9`
- Authorized scope: create an inert candidate artifact, perform static comparison and syntax/schema/value validation, and record its identity only

Classification:

`CANDIDATE_PROFILE_CONFIG_ARTIFACT_STATICALLY_VALID__NOT_INSTALLED__RUNTIME_ENFORCEMENT_NOT_PROVEN__HOLD`

## Artifact

- Relative path: `docs/candidate-artifacts/teacher-separate-build-profile-20260922/teacher-build-evidence-offline-loopback-denied-20260922.config.toml`
- Absolute path: `C:\Users\akane\Documents\Codex\2026-06-14\new-chat\suiyoukai-stamp-app\docs\candidate-artifacts\teacher-separate-build-profile-20260922\teacher-build-evidence-offline-loopback-denied-20260922.config.toml`
- SHA-256: `723e738382ad15e2da3b2577c1761f3295a1ecdf5ce661a33289a45d6ad5dc0e`
- Bytes: `1449`
- Format: UTF-8 TOML candidate with comments
- Discovery state: inert documentation artifact; outside `.codex`, `.agents`, `$CODEX_HOME`, and any selected profile/session config location

## Fixed content

- `default_permissions = "teacher-build-evidence-offline-loopback-denied-20260922"`
- `approval_policy = "never"`
- `features.network_proxy = true`
- Exact profile-defined workspace root: the not-yet-created isolated Teacher build root from the source plan
- Filesystem default: `:root = deny`, `:minimal = read`, `:tmpdir = deny`, `:slash_tmp = deny`
- Workspace-root base: read-only
- Only writable subtrees: `dist`, `.wrangler`, `node_modules/.vite`, `.tmp`
- Command network: enabled only for the required active-proxy policy model
- Local/private guard: `allow_local_binding = false`
- Upstream proxy use: false
- SOCKS5 and SOCKS5 UDP: false
- External domain allow entries: none
- Local literal allow entries: none
- Unix socket allow entries: none
- `dangerously_*` network exceptions: none
- Legacy `sandbox_mode` / `sandbox_workspace_write`: absent

## Static validation

| Check | Result | Basis |
|---|---|---|
| TOML syntax | PASS | Parsed successfully with Python standard-library `tomllib`. |
| Parsed equality to exact-plan TOML | PASS | Parsed objects are equal; artifact-only comments create no semantic difference. |
| Top-level key allowlist | PASS | Exactly `default_permissions`, `approval_policy`, `features`, and `permissions`. |
| Profile key allowlist | PASS | Exactly `description`, `workspace_roots`, `filesystem`, and `network`. |
| Filesystem values | PASS | Exact isolated root and four writable subtrees match the plan. |
| Network values | PASS | Active-proxy intent, no external allowlist, no loopback allowlist, and no broad exception match the plan. |
| Legacy sandbox-key absence | PASS | `sandbox_mode` and `sandbox_workspace_write` are absent. |
| Dangerous/local exception absence | PASS | `domains`, `unix_sockets`, and `dangerously_*` entries are absent. |
| Dedicated-location containment | PASS | Resolved artifact path is under its exact dedicated candidate-artifact directory. |
| Active-config-location exclusion | PASS | Resolved path is not under `.codex` or `.agents`; no user/profile/session config was written. |

Official schema reference used for the static allowlist and semantics:

- [OpenAI Docs — Permissions](https://learn.chatgpt.com/docs/permissions)

## What this does not prove

- The artifact was not passed to Codex as a selected config and was not runtime-parsed by a new session.
- No effective configuration layer, managed requirement, active proxy, native-Windows elevated enforcement, workspace-root selection, or child-process enforcement was attested.
- No profile/config was installed, copied to an active location, selected, enabled, or merged.
- `PS-G1..PS-G9` and all `PB-G0..PB-G8` remain future Gates. Static artifact validity does not close them.
- Current-task `NB-G4` remains `NOT PROVEN — STOP`.

## Preserved state

- No new session or runtime-boundary change.
- No network/loopback probe.
- No isolated copy, build, server, browser, or HTTP request.
- Evidence attempt remains `0/1`.
- No application source, test, generated `dist`, predecessor/successor identity, contract, or pre-existing dirty-worktree item changed.
- No commit, push, PR, deploy, publication, production-data operation, or external-service write.

## HOLD

The candidate artifact is statically valid and faithfully represents the saved exact-plan candidate. It is not adopted as an active profile and does not prove real-environment enforceability. Selection, enablement, session start, or copying to an active config location requires separate approval and a fresh pre-session Gate.

HOLD.
