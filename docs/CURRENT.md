# CURRENT

## 記録日時

- 2026-09-22 20:24（日本時間）

## 対象作業と引き継ぎ元

- 対象：別のeligible Windows hostに要求するevidenceだけを固定したhost未特定requirements manifestの設計。
- 引き継ぎ元：GitHub checkpoint `e389715daa875b78e759301ebffc0c83c07eaa03`と、host探索・接続なしのmanifest作成承認。
- Classification：`HOST_UNSPECIFIED_ELIGIBLE_WINDOWS_HOST_REQUIREMENTS_MANIFEST_ESTABLISHED__NO_HOST_SELECTED__ALL_RUNTIME_ENFORCEMENT_UNPROVEN__HOLD`
- Manifest ID：`TEACHER-ELIGIBLE-WINDOWS-HOST-BOUNDARY-REQ-20260922-V1`
- Current-task boundary：`NB-G0..NB-G3 = PASS`、`NB-G4 = NOT PROVEN — STOP`。Evidence attemptは`0/1`未消費。
- Manifest：`docs/teacher-unspecified-eligible-windows-host-requirements-manifest-2026-09-22.md`
- Manifest SHA-256：`cbac5c92420b4e5e13369c17117957b0585f9556b15a1f11e98c68f267c0c9e3`
- 対応handoff：`docs/handoffs/2026-09-22-2014-teacher-unspecified-eligible-windows-host-requirements-manifest-HOLD.md`
- Handoff SHA-256：`fa1d2fe420ee70879b39e61208d7cde748bb000a28d3f12ee68aec34dca84b53`

## Source of truth

- Exact-plan candidate：`docs/teacher-independent-windows-guest-build-boundary-exact-plan-candidate-2026-09-22.md`
- Exact-plan SHA-256：`e42372c7fbf7209fcea6f59b598d20438896f43601d82799a3632b698a06b464`
- Hyper-V alternative comparison：`docs/teacher-hyper-v-alternative-safety-boundary-read-only-comparison-2026-09-22.md`
- Candidate artifact：`docs/candidate-artifacts/teacher-separate-build-profile-20260922/teacher-build-evidence-offline-loopback-denied-20260922.config.toml`
- Candidate SHA-256：`723e738382ad15e2da3b2577c1761f3295a1ecdf5ce661a33289a45d6ad5dc0e`
- `WG-G0..WG-G20`、`HV-S0..HV-S4`、CSNC／DR runtime attestation gapは維持。

## Git照合

- 記録開始時branch：`codex/checkpoint-2026-09-04-passed`
- 記録開始時`HEAD`：`e389715daa875b78e759301ebffc0c83c07eaa03`
- 記録開始時upstream：`e389715daa875b78e759301ebffc0c83c07eaa03`
- 記録開始時`origin/main`：`052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- Hyper-V alternative boundary comparison checkpoint：`49a901f2136d16435dfa3709925442c3caecabc5`
- CURRENT completion checkpoint／基準commit：`e389715daa875b78e759301ebffc0c83c07eaa03`
- Eligible Windows host requirements manifest checkpoint：`95835f686223bedf3019e11b9d232612eb5a67e2`
- Branch／HEAD／upstream／origin/mainとcheckpoint記録は開始ゲートで一致。
- 開始時worktree：既存tracked変更20件、既存untracked 7,839件、staged 0。既存項目は整理・変更・stageしていない。
- 承認されたmanifest／handoff／CURRENTだけをcheckpoint commit `95835f686223bedf3019e11b9d232612eb5a67e2`へ保存。既存worktree項目は含めていない。
- 本CURRENTのcheckpoint完了追補commit SHA／push後HEADはGit metadataを正本とする。

## 完了したこと

- `EH-R00..EH-R23`を定義：mandatory 22件、optional 2件。
- 全要件に`MANDATORY`／`OPTIONAL`、PASS evidence、`NOT PROVEN`条件、`FAIL`条件を固定。
- Windows edition/version/license、Hyper-V Gen2、CPU/firmware、Host非干渉、integration禁止、trusted image、guest-only VHDX/switch/checkpointを要求。
- Candidate-only config/no legacy、effective elevated-only、active proxy、empty external allowlist、direct-bypass deny、loopback bind/connect denyを要求。
- Exact four-subtree write、child/build-plugin inheritance、MCP/connector/browser等のdisabled/unavailable、trusted pre-build attestationを要求。
- `E-01..E-17`のpre-build evidence bundle、`HV-S0..HV-S4` rollback/quarantine/destruction、phase/Evidence分離を固定。
- Mandatory項目が1件でも`NOT PROVEN`／`FAIL`ならhost adoption、次phase、candidate selection、buildへ進まない。
- Network／HTTP禁止のため新しいOpenAI Docs／Microsoft Docsは取得せず、current-version compatibilityをfuture authoritative evidenceとして要求。

## 未完了・未証明

- Host identityは`UNASSIGNED`。Hostの探索・接続・選定・評価は未実施。
- どのhostもmanifestをPASSしていない。Edition/license/capability/image/network/runtime enforcement/attestationはすべて実環境未証明。
- CSNC-G1/G2を含むruntime-origin schema、fail-closed termination、elevated/proxy active metadata等は未確立。
- Manifestはhost search、connection、purchase、provisioning、VM作成、candidate選択、attestation、buildの承認ではない。

## 公開・本番データ・外部サービス

- GitHub：eligible Windows host requirements manifest checkpoint `95835f686223bedf3019e11b9d232612eb5a67e2`をcurrent branchへcommit済み。CURRENT追補とpushはこの記録時点では未完了。`main`変更なし。
- 公開・deploy：変更なし。
- 本番データ：変更なし。
- 外部サービス：変更・書込みなし。Network／HTTPも未使用。
- Host discovery／connection：未実行。
- Windows edition、Hyper-V／Windows feature、BIOS／UEFI、user config、Windows sandbox、session／runtime：変更なし。
- VM／guest／VHDX／switch／checkpoint／softwareおよびguest runtime `requirements.toml`／config artifact：未作成・未起動・未install。今回作成したのはevidence requirements manifest文書だけ。
- Candidate：未install・未移動・未選択・未有効化。
- Probe／copy／build／server／browser：未実行。

## 次回の安全な再開地点

1. 本CURRENT、manifest、handoff、exact plan、comparison、Git metadataを読む。
2. 現在は`HOLD`。Host=`UNASSIGNED`、`NB-G4 = NOT PROVEN`、Evidence attempt `0/1`未消費を保持する。
3. 続けるならmanifestの静的完全性／内部整合性検証、またはhost-selection evidence intake template作成だけを別承認で検討する。
4. Host探索・接続・評価は、その後も別承認が必要。

## 触らない

- Host探索・接続・選定・purchase・inspection。
- Network／HTTP、新しい外部資料取得、外部サービス書込み。
- Windows edition、Hyper-V／Windows feature、BIOS／UEFI、runtime／session／Windows sandbox／user configの変更。
- VM／guest／VHDX／switch／checkpoint／guest runtime `requirements.toml`／config／software artifactの作成・起動・install・uninstall・download・mount。
- Candidateのinstall／move／copy／選択／有効化／変更。
- Probe／copy／build／server／browser、`NB-G4`のPASS化、Evidence attempt `0/1`の消費。
- 共有作業ツリーの既存tracked／untracked項目の整理・変更・stage。
- 今回承認範囲外のcommit、push、PR、GitHub変更、deploy、公開、本番データ変更。
