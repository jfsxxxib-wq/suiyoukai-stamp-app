# CURRENT

## 記録日時

- 2026-09-22 18:19（日本時間）

## 対象作業と引き継ぎ元

- 対象：legacy sandbox keyとWindows elevated-only条件を扱うcandidate専用runtime境界のexact-plan設計評価。
- 引き継ぎ元：GitHub checkpoint `e38e9e2681ec4cd4de9e01d59b3136c3f148498d`と、read-only調査・設計・記録だけの承認。
- Classification：`CANDIDATE_DEDICATED_RUNTIME_BOUNDARY_EXACT_PLAN_NOT_AUTHORITATIVELY_ESTABLISHED__PRESELECTION_EFFECTIVE_RUNTIME_ATTESTATION_UNAVAILABLE__SAME_HOST_ELEVATED_ONLY_NOT_ZERO_IMPACT__HOLD`
- Current-task boundary：`NB-G0..NB-G3 = PASS`、`NB-G4 = NOT PROVEN — STOP`。Evidence attemptは`0/1`未消費。
- Candidate profile/config：静的検証PASS済み。runtime enforcementは未証明。
- Plan evaluation：`docs/teacher-candidate-dedicated-runtime-boundary-exact-plan-evaluation-2026-09-22.md`
- Plan evaluation SHA-256：`33fb0cecd39023661375ca56d1912fe0eb08b7311be4dee18059cdb32ed2f109`
- 対応handoff：`docs/handoffs/2026-09-22-1819-teacher-candidate-dedicated-runtime-boundary-plan-NOT-ESTABLISHED-HOLD.md`
- Handoff SHA-256：`8cfe973bc7bb3dd34e31031c96b98c75440a6971b8e4b7d963a682c3f0fb8570`

## Candidate source of truth

- Source exact-plan candidate：`docs/teacher-anonymous-api-separate-profile-session-safety-boundary-exact-plan-candidate-2026-09-22.md`
- Source plan SHA-256：`c0f0d7b68a8e3258840c0b39013a7805d3cdd1144b625fd29d4f790a71ad44c9`
- Candidate artifact：`docs/candidate-artifacts/teacher-separate-build-profile-20260922/teacher-build-evidence-offline-loopback-denied-20260922.config.toml`
- Candidate SHA-256：`723e738382ad15e2da3b2577c1761f3295a1ecdf5ce661a33289a45d6ad5dc0e`
- Pre-selection attestation：`docs/teacher-candidate-profile-pre-selection-read-only-attestation-result-2026-09-22.md`
- Pre-selection attestation SHA-256：`8096accc353ffc58d36481b1aca53aafa29289516e9c299c9acf3935056d40ad`

## Git照合

- 記録時branch：`codex/checkpoint-2026-09-04-passed`
- 記録時`HEAD`：`e38e9e2681ec4cd4de9e01d59b3136c3f148498d`
- 記録時upstream：`e38e9e2681ec4cd4de9e01d59b3136c3f148498d`
- 記録時`origin/main`：`052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- Pre-selection checkpoint commit：`0238bd0652116dad18924d91c0f3503b534c9963`
- CURRENT completion checkpoint／基準commit：`e38e9e2681ec4cd4de9e01d59b3136c3f148498d`
- 開始時、branch／HEAD／upstream／origin/mainとsource hashesはcheckpointに一致。
- 開始時worktree：既存tracked変更20件、既存untracked 7,839件、staged 0。既存項目は整理・変更・stageしていない。
- 本設計のplan evaluation／handoff／CURRENTはローカルのみ。commit／pushは未実施。

## 完了したこと

- 保存済みOpenAI Docs根拠とbounded local evidenceだけで設計評価を実施。この工程ではbrowser／HTTPを実行していない。
- Same-host別`CODEX_HOME`案を評価。通常user configとlegacy `sandbox_mode`を除外できるが、Windows elevated-onlyのhost-scoped requirements／sandbox setupを通常環境への影響ゼロにできないため不採用。
- Disposable dedicated Windows guest案を評価。通常環境との分離、guest-only requirements、rollback、config-set manifest、exact profile選択、proxy／allowlist／loopback／write gatesを条件付き計画として固定。
- Candidate session用のguest config集合、unique profile、legacy除外、elevated-only allowlist、separate tool surface停止条件を設計。
- `DR-G0..DR-G8`を固定。`DR-G8`は、candidate未選択のままactual elevated implementationとactive proxyを証明するauthoritative dry-run/effective-runtime入口が未確立でNOT PROVEN。
- Bootstrap attestor sessionはlater candidate profileのactive runtimeを証明しないため代替不採用。

## 未完了・未確定

- Candidate専用runtime境界のexact planはauthoritativeには不成立。現在地点は`HOLD`。
- Same-host案はnormal config無変更でも、host-level elevated setup／requirementsの影響ゼロを満たさない。
- Guest案はguest availability、image identity、client/schema compatibility、guest provisioningが未証明・未実装。
- Complete effective config/requirements source manifestをcandidate未選択で出力するsupported interfaceは未確認。
- Active proxyはruntime factであり、static TOMLだけではcandidate未選択のまま証明できない。
- Candidate-selected／no-command attestationを許可するなら別safety contractと別承認が必要。
- Config／requirements artifact、guest、sessionは作成していない。

## 公開・本番データ・外部サービス

- GitHub：checkpoint `e38e9e2681ec4cd4de9e01d59b3136c3f148498d`から変更なし。本設計記録は未commit／未push。
- 公開・deploy：変更なし。
- 本番データ：変更なし。
- 外部サービス：変更・書込みなし。browser／HTTPも未実行。
- Normal user config／Windows sandbox設定：変更なし。
- Candidate：未install・未移動・未選択・未有効化・未変更。
- Session/runtime：変更なし。新session未起動。
- Probe／copy／build／server／browser／HTTP：未実行。

## 次回の安全な再開地点

1. 本CURRENT、latest handoff、plan evaluation、pre-selection attestation、candidate artifact、Git metadataを読む。
2. 現在は`HOLD`。Evidence attempt `0/1`と`NB-G4 = NOT PROVEN`を保持する。
3. 続ける場合は、supported no-session effective-runtime attestationをauthoritativeに確認するか、candidate-selected／no-command attestationを新しい安全契約として許可するか、外部強制guest boundaryを採用するかを別承認で決める。
4. Guest provisioning、config／requirements artifact作成、install、profile選択、session start、runtime attestation、probe、copy、buildはすべて別境界。

## 触らない

- Normal user configのlegacy key、Windows sandbox設定、host `%ProgramData%` requirementsの変更・削除。
- Candidateやrequirements artifactの作成・install・move・copy・選択・有効化・変更。
- Guest／VM作成、snapshot操作、auth/config/session/runtime変更、新session起動。
- Network／loopback probe、isolated copy、build、server、browser、HTTP。
- `NB-G4`のPASS化、Evidence attempt `0/1`の消費。
- Codex plugins／connectors／MCP／web search／browser／Computer Use／cloudをfuture build network経路に使うこと。
- 共有作業ツリーの既存tracked／untracked項目の整理・変更・stage。
- Commit、push、PR、GitHub変更、deploy、公開、本番データ、外部サービス書込み。
