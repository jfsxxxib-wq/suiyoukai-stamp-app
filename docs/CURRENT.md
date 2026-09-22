# CURRENT

## 記録日時

- 2026-09-22 20:08（日本時間）

## 対象作業と引き継ぎ元

- 対象：現在Hostのeditionを変更せず、Hyper-V経路と同等以上になり得る安全境界候補のread-only比較。
- 引き継ぎ元：GitHub checkpoint `7069648d3f798362901bf3683aeff790e4ee4b80`と、2系統に限定したread-only調査承認。
- Classification：`HYPER_V_ALTERNATIVE_BOUNDARY_COMPARISON_COMPLETE__SEPARATE_ELIGIBLE_HOST_POTENTIAL__CURRENT_HOST_ALTERNATIVES_NOT_PROVEN_OR_INSUFFICIENT__NO_IMPLEMENTATION__HOLD`
- Current-task boundary：`NB-G0..NB-G3 = PASS`、`NB-G4 = NOT PROVEN — STOP`。Evidence attemptは`0/1`未消費。
- Comparison：`docs/teacher-hyper-v-alternative-safety-boundary-read-only-comparison-2026-09-22.md`
- Comparison SHA-256：`2dbeab568bd8bdea084ffd33c92da1b9c451065c14fe14d97f6ddb9146e07ce2`
- 対応handoff：`docs/handoffs/2026-09-22-2000-teacher-hyper-v-alternative-boundary-comparison-HOLD.md`
- Handoff SHA-256：`7365405903ae28d1d801f911e093c1802eb1b5e963d477b807206ea3b1937b37`

## Source of truth

- Exact-plan candidate：`docs/teacher-independent-windows-guest-build-boundary-exact-plan-candidate-2026-09-22.md`
- Exact-plan SHA-256：`e42372c7fbf7209fcea6f59b598d20438896f43601d82799a3632b698a06b464`
- Current-host preflight：`docs/teacher-independent-windows-guest-hyper-v-capability-preflight-evaluation-2026-09-22.md`
- Candidate artifact：`docs/candidate-artifacts/teacher-separate-build-profile-20260922/teacher-build-evidence-offline-loopback-denied-20260922.config.toml`
- Candidate SHA-256：`723e738382ad15e2da3b2577c1761f3295a1ecdf5ce661a33289a45d6ad5dc0e`
- `WG-G0..WG-G20`、`HV-S0..HV-S4`、rollback／quarantine／destruction、runtime attestation gapは維持。

## Git照合

- 記録開始時branch：`codex/checkpoint-2026-09-04-passed`
- 記録開始時`HEAD`：`7069648d3f798362901bf3683aeff790e4ee4b80`
- 記録開始時upstream：`7069648d3f798362901bf3683aeff790e4ee4b80`
- 記録開始時`origin/main`：`052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- Hyper-V host capability preflight checkpoint：`3b8105ab3ea6bd13c1099f3973df8b940ec0486e`
- CURRENT completion checkpoint／基準commit：`7069648d3f798362901bf3683aeff790e4ee4b80`
- Hyper-V alternative boundary comparison checkpoint：`49a901f2136d16435dfa3709925442c3caecabc5`
- Branch／HEAD／upstream／origin/mainとcheckpoint記録は開始ゲートで一致。
- 開始時worktree：既存tracked変更20件、既存untracked 7,839件、staged 0。既存項目は整理・変更・stageしていない。
- 承認されたcomparison／handoff／CURRENTだけをcheckpoint commit `49a901f2136d16435dfa3709925442c3caecabc5`へ保存。既存worktree項目は含めていない。
- 本CURRENTのcheckpoint完了追補commit SHA／push後HEADはGit metadataを正本とする。

## 比較結果

| Candidate | 判定 | 現在地点 |
| --- | --- | --- |
| 別のeligible Windows host＋保存済みHyper-V Gen2 guest exact plan | `成立可能性あり` | Architecture-levelのみ。具体的host、guest、gateway、runtime enforcement、attestationは未証明。 |
| 現在Hostの独立alternate-boot Windows | `NOT PROVEN` | Storage物理分離、boot trust、license、firmware無影響、network、rollbackが未証明。 |
| 現在Hostのthird-party full-system Windows VM／emulator | `NOT PROVEN` | 製品／version／driver影響／integration／network／attestation未固定。 |
| WSL／WSL2 | `authoritativeに不成立` | 独立Windows guest／Windows elevated sandbox／registry contractを満たさない。 |
| Windows Sandbox | `authoritativeに不成立` | 非Hyper-V経路ではなく、Home/Core gate不適合。Exact planでも代替不採用。 |
| Host-kernel container | `authoritativeに不成立` | 独立kernel／registry境界がない。Full-VM-backedなら別候補として再評価。 |
| 別user／process／AppContainer-only／Host worktree | `authoritativeに不成立` | Host-wide requirements、registry/policy、kernel、normal runtime stateを分離できない。 |

## 完了したこと

- 2系統を、Host分離、filesystem/process/registry、fail-closed egress、loopback deny、4 subtree write、child/plugin継承、別network面、candidate-only、pre-build attestation、rollback/destruction、Evidence分離で比較。
- 別のeligible host経路だけを`成立可能性あり`と分類。ただし実装候補の採用や特定hostの承認ではない。
- 現在Hostのnon-Hyper-V経路はすべて`NOT PROVEN`または`authoritativeに不成立`。実装可能と判定されたものはない。
- Browser／HTTP禁止のため新しいOpenAI Docs／vendor docs検索は行わず、checkpoint済みOpenAI Docs結論とlocal記録だけを使用。
- Installed software／alternative hypervisor inventoryやruntime probeは行っていない。製品の存在・互換性・trustを推定しない。

## 未完了・未証明

- `成立可能性あり`の別hostは未特定。Edition/license、virtualization、Secure Boot、storage、gateway、image、integration、rollback、全runtime gateは未証明。
- Current Hostのalternate boot／third-party full VMは、具体的platformとauthoritative sourceがないためexact plan化不可。
- Elevated implementation、active proxy、loopback bind/connect deny、4-subtree write、child/plugin inheritance、separate tool surfaces、complete effective-runtime attestationは引き続き未証明。

## 公開・本番データ・外部サービス

- GitHub：Hyper-V alternative boundary comparison checkpoint `49a901f2136d16435dfa3709925442c3caecabc5`をcurrent branchへcommit済み。CURRENT追補とpushはこの記録時点では未完了。`main`変更なし。
- 公開・deploy：変更なし。
- 本番データ：変更なし。
- 外部サービス：変更・書込みなし。Browser／HTTPも未実行。
- Windows edition、Hyper-V／Windows feature、BIOS／UEFI、user config、Windows sandbox、session／runtime：変更なし。
- VM／container／guest／VHDX／switch／checkpoint／alternate-boot／software artifact：未作成・未起動・未install・未uninstall。
- Candidate：未install・未移動・未選択・未有効化。
- Probe／copy／build／server／browser／HTTP：未実行。

## 次回の安全な再開地点

1. 本CURRENT、comparison、handoff、exact plan、preflight、Git metadataを読む。
2. 現在は`HOLD`。`NB-G4 = NOT PROVEN`、Evidence attempt `0/1`未消費を保持する。
3. 続けるなら、別のeligible hostに要求するevidenceだけをhost未特定のrequirements manifestとして設計する工程を別承認で検討する。
4. Current Host候補を続けるなら、1製品／1versionを正確に指定した公式docs調査を別承認し、実装はさらに別工程とする。

## 触らない

- Windows edition、Hyper-V／Windows feature、BIOS／UEFI、runtime／session／Windows sandbox／user configの変更。
- VM／container／guest／VHDX／switch／checkpoint／alternate-boot／requirements／software artifactの作成・起動・install・uninstall・download・mount。
- Candidateのinstall／move／copy／選択／有効化／変更。
- Network／loopback／runtime probe、copy、build、server、browser、HTTP。
- `NB-G4`のPASS化、Evidence attempt `0/1`の消費。
- 共有作業ツリーの既存tracked／untracked項目の整理・変更・stage。
- 今回承認範囲外のcommit、push、PR、GitHub変更、deploy、公開、本番データ、外部サービス書込み。
