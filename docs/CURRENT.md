# CURRENT

## 記録日時

- 2026-09-22 19:23（日本時間）

## 対象作業と引き継ぎ元

- 対象：独立Windows guestをbuild用安全境界とするexact-plan候補の設計。
- 引き継ぎ元：GitHub checkpoint `d071c7aa54973a87223c3915fe228857ebfce297`と、read-only調査・設計・記録だけの承認。
- Classification：`INDEPENDENT_WINDOWS_GUEST_BUILD_BOUNDARY_EXACT_PLAN_CANDIDATE_ESTABLISHED__HYPER_V_GEN2_TOPOLOGY_FIXED__IMPLEMENTATION_AND_ENFORCEMENT_NOT_PROVEN__HOLD`
- Current-task boundary：`NB-G0..NB-G3 = PASS`、`NB-G4 = NOT PROVEN — STOP`。Evidence attemptは`0/1`未消費。
- Candidate profile/config：静的検証PASS済み。runtime enforcementは未証明。
- Exact-plan candidate：`docs/teacher-independent-windows-guest-build-boundary-exact-plan-candidate-2026-09-22.md`
- Exact-plan SHA-256：`e42372c7fbf7209fcea6f59b598d20438896f43601d82799a3632b698a06b464`
- 対応handoff：`docs/handoffs/2026-09-22-1909-teacher-independent-windows-guest-exact-plan-candidate-HOLD.md`
- Handoff SHA-256：`1fceb79a077720fb22248c9c9a7b3ce64ec1e77d31a8e91de6ea5a354d62a3ab`

## Candidate source of truth

- Candidate artifact：`docs/candidate-artifacts/teacher-separate-build-profile-20260922/teacher-build-evidence-offline-loopback-denied-20260922.config.toml`
- Candidate SHA-256：`723e738382ad15e2da3b2577c1761f3295a1ecdf5ce661a33289a45d6ad5dc0e`
- No-command contract evaluation：`docs/teacher-candidate-selected-no-command-attestation-safety-contract-evaluation-2026-09-22.md`
- No-command evaluation SHA-256：`c5d5eb619542a89b6e8f432bdfae92be90321ed7ee22a503c52d053e59560e90`
- Dedicated-runtime evaluation：`docs/teacher-candidate-dedicated-runtime-boundary-exact-plan-evaluation-2026-09-22.md`
- Dedicated-runtime evaluation SHA-256：`33fb0cecd39023661375ca56d1912fe0eb08b7311be4dee18059cdb32ed2f109`

## Git照合

- 記録時branch：`codex/checkpoint-2026-09-04-passed`
- 記録時`HEAD`：`d071c7aa54973a87223c3915fe228857ebfce297`
- 記録時upstream：`d071c7aa54973a87223c3915fe228857ebfce297`
- 記録時`origin/main`：`052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- No-command contract checkpoint：`3cd98d7f7d758797a3c3e028ac9f3660120122a2`
- CURRENT completion checkpoint／基準commit：`d071c7aa54973a87223c3915fe228857ebfce297`
- Independent Windows guest exact-plan checkpoint：`344d61f64b45d79963346d10efae031a52e766de`
- 開始時、branch／HEAD／upstream／origin/mainとsource hashesはcheckpointに一致。
- 開始時worktree：既存tracked変更20件、既存untracked 7,839件、staged 0。既存項目は整理・変更・stageしていない。
- 承認されたexact-plan candidate／handoff／CURRENTだけをcheckpoint commit `344d61f64b45d79963346d10efae031a52e766de`へ保存。既存worktree項目は含めていない。
- 本CURRENTのcheckpoint完了追補commit SHA／push後HEADはGit metadataを正本とする。

## 完了したこと

- Checkpoint済みOpenAI Docs根拠だけで設計。この工程ではbrowser／HTTPを実行していない。
- Guest方式を専用Hyper-V Generation 2 VMに固定。Windows Sandbox、WSL、container、host worktree、normal-user別processは代替不採用。
- Guest-only Windows kernel/process、VHDX、registry、ACL/firewall、`CODEX_HOME`、requirements、vNIC／dedicated switch/gatewayを固定。
- Host通常Codex、user config、Windows sandbox、host requirements、repositoryをguestから分離。Host mount、clipboard/drive共有、Guest Services copy、host LAN、workflowでのPowerShell Directを禁止。
- Guest config集合をcandidate permission profileだけに限定し、legacy sandbox key、project config、legacy managed config、same-name profileを禁止。
- Guest-local requirementsでelevated-only、active proxy、empty external allowlist、loopback/local/private deny、four-subtree writeを要求。
- Child process／build plugin同一境界、plugin／connector／MCP／web／browser／Computer Use／cloud disabled/unavailableを要求。
- Design／host preflight／provision／boundary attestation／input import／build／real evidenceを別execution IDに分離。Evidence attempt `0/1`はreal evidenceまで未消費。
- `HV-S0..HV-S4` checkpoint／rollback／quarantine／separate destructionを固定し、`WG-G0..WG-G20`を定義。

## 未完了・未確定

- Exact-plan候補は成立したが、guest boundaryのimplementation／enforcement／adoptionは未証明。現在地点は`HOLD`。
- Hyper-V capability、Windows guest image／license／patch／Secure Boot、Codex client/schema compatibilityは未確認。
- Host integration channel完全閉鎖、guest-only storage/process/network独立、checkpoint/revert integrityは未証明。
- Codex control-plane egressのidentity-bound allowlistとsandbox child direct egress denyは未設計artifact・未証明。
- Guest内elevated implementation、active proxy、empty allowlist、loopback bind/connect deny、four-subtree write、child/plugin inheritanceは未attest。
- Separate Codex tool surfaceのdisabled/unavailable manifestは未証明。
- Guest／VM／vSwitch／VHDX／checkpoint／requirements／config artifactは未作成・未起動。

## 公開・本番データ・外部サービス

- GitHub：independent Windows guest exact-plan checkpoint `344d61f64b45d79963346d10efae031a52e766de`をcurrent branchへcommit済み。CURRENT追補とpushはこの記録時点では未完了。`main`変更なし。
- 公開・deploy：変更なし。
- 本番データ：変更なし。
- 外部サービス：変更・書込みなし。browser／HTTPも未実行。
- Host通常Codex／user config／Windows sandbox：変更なし。
- Guest／requirements／VM artifact：未作成・未起動。
- Candidate：未install・未移動・未選択・未有効化・未変更。
- Session/runtime：変更なし。新session未起動。
- Probe／copy／build／server／browser／HTTP：未実行。

## 次回の安全な再開地点

1. 本CURRENT、latest handoff、guest exact-plan、candidate artifact、no-command／dedicated-runtime evaluations、Git metadataを読む。
2. 現在は`HOLD`。Evidence attempt `0/1`と`NB-G4 = NOT PROVEN`を保持する。
3. 続ける場合は`WG-G1..WG-G4`のread-only host／Hyper-V platform preflightだけを別承認で検討する。
4. VM artifact creation、guest start、network／requirements／config作成、candidate install/select、attestation probes、copy、buildはそれぞれ別承認。

## 触らない

- Host通常Codex、user config、Windows sandbox、host requirements、repository既存項目の変更。
- Guest／VM／vSwitch／VHDX／checkpoint／gateway／requirements／config artifactの作成・起動・変更。
- Candidateのinstall・move・copy・選択・有効化・変更。
- New session/runtime、network／loopback probe、copy、build、server、browser、HTTP。
- `NB-G4`のPASS化、Evidence attempt `0/1`の消費。
- 共有作業ツリーの既存tracked／untracked項目の整理・変更・stage。
- 今回承認範囲外のcommit、push、PR、GitHub変更、deploy、公開、本番データ、外部サービス書込み。
