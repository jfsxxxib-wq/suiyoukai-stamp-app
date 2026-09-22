# Teacher candidate profile — pre-selection read-only attestation result

## Classification

`CANDIDATE_PROFILE_PRE_SELECTION_ATTESTATION_NOT_PROVEN__LEGACY_SANDBOX_LOADED__WINDOWS_UNELEVATED__HOLD`

- Recorded: 2026-09-22 17:57 JST
- Candidate SHA-256: `723e738382ad15e2da3b2577c1761f3295a1ecdf5ce661a33289a45d6ad5dc0e`
- Evidence attempt: `0/1` unchanged
- Current-task `NB-G4`: `NOT PROVEN — STOP` unchanged
- Candidate install, move, selection, enablement, session start, runtime change, network/loopback probe, copy, build, server, browser, HTTP, commit, and push: not performed

## Decision

The saved candidate cannot be authoritatively attested as enforcing the exact-plan boundary before selection in the current configuration state. The investigation stopped at the first required boundary conflict.

The official permission-profile specification states that if `sandbox_mode` appears in any loaded configuration file, Codex uses the legacy sandbox settings instead of `default_permissions`. The current user configuration contains `sandbox_mode = "workspace-write"`. Selecting the candidate profile file would not, by itself, remove that loaded legacy setting. No local managed `allowed_permission_profiles` exception was found, and a future effective cloud-managed layer cannot be attested without starting the client/session that resolves it.

The same bounded inventory also found `[windows] sandbox = "unelevated"`. The saved exact plan requires native-Windows `elevated` enforcement and prohibits the weaker fallback. This is an additional static conflict; it was not repaired or tested.

Result: do not install or select the candidate. `HOLD`.

## Start gate and artifact identity

| Item | Result | Evidence |
| --- | --- | --- |
| Branch | PASS | `codex/checkpoint-2026-09-04-passed` |
| `HEAD` | PASS | `d571bb78379c5bcd07aab4a6a95d997497eb9f25` |
| Upstream | PASS | `d571bb78379c5bcd07aab4a6a95d997497eb9f25` |
| `origin/main` | PASS | `052c787b947bf5630fbd62f0ff168c8ec7a3506b` |
| Existing worktree state | PASS | tracked changes `20`; untracked items `7,839`; staged changes `0` |
| Candidate identity | PASS | SHA-256 matched the checkpoint value above |
| Artifact record identity | PASS | SHA-256 `420f2662667b4b32adadf2763cd6a593cf9f2a293154f77341a15a1558d7bd22` |
| Candidate handoff identity | PASS | SHA-256 `61a0f19ba2df2ad0a4afdadd0e657ee4add8bd885e9375080ecf5dc4ba1c3099` |

## Bounded attestation sequence

| Gate | Required statement | Result | Reason |
| --- | --- | --- | --- |
| `PA-G0` | Checkpoint and candidate identity are unchanged. | PASS | Git and hashes matched. |
| `PA-G1` | The future reference location is identified without installing. | PASS — location only | Official config precedence identifies `$CODEX_HOME/<profile-name>.config.toml`, selected by `--profile <profile-name>`. The corresponding target `C:\Users\akane\.codex\teacher-build-evidence-offline-loopback-denied-20260922.config.toml` does not exist. |
| `PA-G2` | No loaded legacy sandbox setting or precedence layer can displace the permission profile. | **NOT PROVEN — STOP** | `C:\Users\akane\.codex\config.toml` contains `sandbox_mode = "workspace-write"`; official permission-profile semantics select the legacy system when this key appears in any loaded config. |

The investigation stopped at `PA-G2` as required. The following requested claims are therefore **NOT EVALUATED as runtime attestations**:

- active network proxy certainty;
- external allow-entry absence as an effective fail-closed policy;
- effective loopback prohibition;
- native-Windows elevated enforcement;
- child process and build-plugin inheritance in the future session;
- exact effective workspace root and write ranges;
- plugins, connectors, MCP, web search, browser, Computer Use, Codex cloud, and other separate network surfaces being disabled or unavailable for the future build step.

The candidate TOML still statically expresses `features.network_proxy = true`, no domain allow entries, `allow_local_binding = false`, and the previously fixed filesystem rules. Those facts do not prove the effective runtime after configuration composition.

## Read-only configuration inventory

Effective `CODEX_HOME` for this process: `C:\Users\akane\.codex`.

| Source | Observation |
| --- | --- |
| Candidate profile target | Absent; candidate remains only under `docs/candidate-artifacts/`. |
| User config | Present; contains one `sandbox_mode`, one `sandbox_workspace_write` table, `[windows] sandbox = "unelevated"`, two MCP server sections, and eleven plugin-related sections. It contains no candidate profile name and no `network_proxy` key. |
| Project `.codex/config.toml` | Absent at the repository root. |
| Windows system requirements | `%ProgramData%\OpenAI\Codex\requirements.toml` absent. |
| Legacy managed config | `$CODEX_HOME\managed_config.toml` absent. |
| Current process | `CODEX_PERMISSION_PROFILE=:workspace`; `CODEX_SANDBOX_NETWORK_DISABLED=1`. This describes the current task only and does not attest a future candidate session. |

No secret values, tokens, complete service identifiers, or unrelated configuration content were recorded.

## Authoritative references

- [Permissions](https://learn.chatgpt.com/docs/permissions): permission profiles are beta; any loaded `sandbox_mode` selects legacy settings; proxy activation is separate from `network.enabled`; an active proxy with no allowed domains blocks external destinations; separate tool surfaces have separate controls; native-Windows `elevated` is the strongest enforcement.
- [Config basics](https://learn.chatgpt.com/docs/config-file/config-basic): configuration precedence and profile-file location.
- [Sample configuration](https://learn.chatgpt.com/docs/config-file/config-sample): profile files under `$CODEX_HOME`, selected with `--profile`.
- [Managed configuration](https://learn.chatgpt.com/docs/enterprise/managed-configuration): Windows requirements location, cloud requirements composition, and managed permission-profile exception.
- [Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox): `elevated` versus weaker `unelevated` enforcement.
- [Sandbox](https://learn.chatgpt.com/docs/sandboxing): spawned commands inherit the command sandbox; web search, plugins, and remote browser use separate controls.

Accessed read-only on 2026-09-22.

## Preserved state and HOLD

- Candidate profile/config: not installed, moved, selected, enabled, or changed.
- Session/runtime: unchanged; no new session started.
- Probe/copy/build/server/browser/HTTP: not performed.
- Evidence attempt: `0/1` unconsumed.
- Current-task `NB-G4`: remains `NOT PROVEN — STOP`.
- Public deployment, production data, and external services: no changes or writes.
- Git: no commit or push; existing tracked and untracked items were not organized, modified, or staged.

Any remediation would require a separately approved configuration-design/change step. It must not be inferred from this attestation approval.
