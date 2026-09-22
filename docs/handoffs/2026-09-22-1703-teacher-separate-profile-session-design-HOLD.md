# Teacher separate profile/session design — HOLD

## Timestamp and scope

- Recorded: 2026-09-22 17:03 JST
- Branch: `codex/checkpoint-2026-09-04-passed`
- HEAD at design start: `a63be09dc670bd53e1e635cf88574868fc27f480`
- Local `origin/main`: `052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- Execution ID: `TEACHER_ANONYMOUS_API_SAFE_METADATA_EVIDENCE_20260922_01`
- Approved scope: read-only investigation and design-document creation only

## Result

Classification:

`SEPARATE_PROFILE_SESSION_EXACT_PLAN_CANDIDATE_ESTABLISHED__ACTIVE_BOUNDARY_NOT_PROVEN__HOLD`

Exact-plan candidate:

- `docs/teacher-anonymous-api-separate-profile-session-safety-boundary-exact-plan-candidate-2026-09-22.md`
- SHA-256: `c0f0d7b68a8e3258840c0b39013a7805d3cdd1144b625fd29d4f790a71ad44c9`

The candidate uses a future separate permission profile/session with an active network proxy, no external destination allow entries, and the default local/private guard. Loopback is denied because the fixed current build path does not prove it is required. The four allowed write subtrees are limited to the exact isolated root: `dist/**`, `.wrangler/**`, `node_modules/.vite/**`, and `.tmp/**`.

The candidate is not an active safety boundary. A future profile/session must fail before build if trusted evidence cannot close configuration-layer precedence, legacy-sandbox exclusion, active-proxy enforcement, exact root selection, native-Windows elevated enforcement, separate tool-surface exclusion, child inheritance, or exact filesystem rules.

## Read-only findings

- Official OpenAI documentation establishes that local spawned commands inherit the sandbox boundary.
- Command permission profiles do not govern web search, Codex plugins/connectors, MCP, browser/Computer Use, Codex cloud, or Codex service traffic; those surfaces must be disabled/unavailable for a future build step.
- Network-on with proxy-off is unrestricted and is prohibited.
- Network-on with an active proxy and no allow entries is the only accepted external-egress candidate.
- The installed Vinext optional prerender path uses `127.0.0.1`, ephemeral ports, HTTP, and possible forked child servers.
- The fixed `node <isolated-cli> build` path has no prerender flag, no Next export output, and no explicit Vinext prerender configuration. Loopback necessity is therefore not proven and no loopback exception is designed or adopted.
- Documented network allowlisting is host/IP scoped, not port scoped. Any future exact-port requirement would remain unresolved and require HOLD.

## Preserved state

- Existing `NB-G0..NB-G3 = PASS` and `NB-G4 = NOT PROVEN — STOP` records are unchanged.
- Evidence attempt remains `0/1`.
- No permission profile/config was created, changed, selected, or started.
- No new session, network/loopback probe, isolated copy, build, server, browser, HTTP request, real attempt, or rollback occurred.
- Original application source, tests, generated `dist`, predecessor/successor identities, contract, and existing dirty worktree were not changed.
- No commit, push, PR, GitHub change, deploy, publication, Production D1/formal-data change, production-data operation, or external-service write occurred.

## Next safe point

Stop. The next step, only under separate explicit approval, is to decide whether to create the candidate profile/config artifact. Profile creation must not select or start it. Isolated-copy creation, session start/attestation, build, post-build fixation, real attempt, and rollback remain separate approvals.

HOLD.
