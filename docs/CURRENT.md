# CURRENT

## 記録日時

- 2026-09-22 18:07（日本時間）

## 対象作業と引き継ぎ元

- 対象：candidate profile/configを選択・有効化する前のread-only attestation調査。
- 引き継ぎ元：GitHub checkpoint `d571bb78379c5bcd07aab4a6a95d997497eb9f25`と、選択前調査だけの承認。
- Classification：`CANDIDATE_PROFILE_PRE_SELECTION_ATTESTATION_NOT_PROVEN__LEGACY_SANDBOX_LOADED__WINDOWS_UNELEVATED__HOLD`
- Current-task boundary：`NB-G0..NB-G3 = PASS`、`NB-G4 = NOT PROVEN — STOP`。Evidence attemptは`0/1`未消費。
- Candidate profile/config：既存checkpointで静的検証PASS済み。runtime enforcementは未証明。
- Result：`docs/teacher-candidate-profile-pre-selection-read-only-attestation-result-2026-09-22.md`
- Result SHA-256：`8096accc353ffc58d36481b1aca53aafa29289516e9c299c9acf3935056d40ad`
- 対応handoff：`docs/handoffs/2026-09-22-1759-teacher-candidate-profile-pre-selection-attestation-NOT-PROVEN-HOLD.md`
- Handoff SHA-256：`b875ca791842e2e93c857049d98deab2e247894efcf2a63c79a05829d5005da8`

## Candidate source of truth

- Source exact-plan：`docs/teacher-anonymous-api-separate-profile-session-safety-boundary-exact-plan-candidate-2026-09-22.md`
- Source exact-plan SHA-256：`c0f0d7b68a8e3258840c0b39013a7805d3cdd1144b625fd29d4f790a71ad44c9`
- Candidate artifact：`docs/candidate-artifacts/teacher-separate-build-profile-20260922/teacher-build-evidence-offline-loopback-denied-20260922.config.toml`
- Candidate SHA-256：`723e738382ad15e2da3b2577c1761f3295a1ecdf5ce661a33289a45d6ad5dc0e`
- Artifact record：`docs/candidate-artifacts/teacher-separate-build-profile-20260922/artifact-record.md`
- Artifact record SHA-256：`420f2662667b4b32adadf2763cd6a593cf9f2a293154f77341a15a1558d7bd22`
- Candidate artifact handoff：`docs/handoffs/2026-09-22-1737-teacher-candidate-profile-config-artifact-HOLD.md`
- Candidate artifact handoff SHA-256：`61a0f19ba2df2ad0a4afdadd0e657ee4add8bd885e9375080ecf5dc4ba1c3099`

## Git照合

- 記録時branch：`codex/checkpoint-2026-09-04-passed`
- 記録時`HEAD`：`d571bb78379c5bcd07aab4a6a95d997497eb9f25`
- 記録時upstream：`d571bb78379c5bcd07aab4a6a95d997497eb9f25`
- 記録時`origin/main`：`052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- Candidate artifact checkpoint commit：`e8f6d11d98b300163e012c6ab670093d086ead65`
- Incoming CURRENT checkpoint／基準commit：`d571bb78379c5bcd07aab4a6a95d997497eb9f25`
- Pre-selection attestation checkpoint commit：`0238bd0652116dad18924d91c0f3503b534c9963`
- 調査開始時、branch／HEAD／upstream／origin/mainはcheckpoint記録と一致。candidate／artifact record／handoffのhashも一致。
- 調査開始時worktree：既存tracked変更20件、既存untracked 7,839件、staged 0。既存項目は整理・変更・stageしていない。
- 承認されたresult／handoff／CURRENTだけをcheckpoint commit `0238bd0652116dad18924d91c0f3503b534c9963`へ保存。既存worktree項目は含めていない。
- 本CURRENTのcheckpoint完了追補commit SHA／push後HEADはGit metadataを正本とする。

## 完了したこと

- OpenAI公式文書だけを使い、profile配置、configuration precedence、permission profile、network proxy、Windows sandbox、child command継承、別network面をread-onlyで再確認。
- Future profile fileの参照位置を`$CODEX_HOME/<profile-name>.config.toml`、選択方法を`--profile <profile-name>`として確認。candidate targetは存在せず、artifactはdocs専用場所のまま。
- Bounded local inventoryでuser config、project config、Windows system requirements、legacy managed config、current processの安全なkey presenceだけを確認。秘密値や無関係な内容は記録していない。
- `PA-G0` checkpoint／artifact identityはPASS。
- `PA-G1` future reference locationの特定だけはPASS。install／選択は未実施。
- `PA-G2`で停止。現在のuser configに`legacy sandbox_mode = "workspace-write"`があり、公式仕様上はloaded configのどこかにこのkeyがあるとpermission profileではなくlegacy sandboxが選ばれる。
- 同じinventoryでWindows sandboxが`unelevated`と確認され、exact planのelevated-only条件とも不一致。修復・変更・実行はしていない。

## 未完了・未確定

- Legacy sandbox混在なしを証明できない。`PA-G2 = NOT PROVEN — STOP`。
- Managed `allowed_permission_profiles` exceptionを含むfuture effective compositionは、candidateを選択・session startせずにはauthoritativeに確定できない。
- Active proxy、effective empty external allowlist、effective loopback deny、native-Windows elevated enforcementはruntime attestation未評価。
- Child process／build plugin継承、exact workspace root／write範囲はfuture effective runtimeとして未評価。
- Codex plugin／connector／MCP／web search／browser／Computer Use／cloud等の別network面がfuture build stepでdisabled／unavailableであることは未評価。
- Candidate TOMLの静的値は維持されるが、effective runtime enforcementの証明ではない。
- Anonymous Teacher API responseのtechnical root cause、safe 401／403、post-build artifacts、real evidence pathは未解決。

## 公開・本番データ・外部サービス

- GitHub：pre-selection attestation checkpoint `0238bd0652116dad18924d91c0f3503b534c9963`をcurrent branchへcommit済み。CURRENT追補とpushはこの記録時点では未完了。`main`変更なし。
- 公開・deploy：変更なし。
- 本番データ：変更なし。
- 外部サービス：OpenAI公式文書のread-only参照のみ。書き込みなし。
- Candidate profile/config：未install・未移動・未選択・未有効化・未変更。
- Session/runtime：変更なし。新session未起動。
- Probe／copy／build／server／browser／HTTP：未実行。

## 次回の安全な再開地点

1. 本CURRENT、latest handoff、attestation result、candidate artifact record、source exact-plan、Git metadataを読む。
2. 現在は`HOLD`。candidateをinstall／selectせず、Evidence attempt `0/1`と`NB-G4 = NOT PROVEN`を保持する。
3. 続ける場合は、legacy sandbox keyの扱い、Windows elevated-only強制、managed/cloud requirementsのauthoritative確認を行う「設計または変更」工程を別承認にする。
4. Config変更、candidate install、profile選択、session start、runtime attestation、probe、copy、buildはそれぞれ別境界。今回の承認から推定して進めない。

## 触らない

- Candidateのinstall、active locationへのmove／copy、選択、有効化、変更。
- User／project／managed／cloud config、requirements、Windows sandbox設定、runtime boundaryの変更。
- New session start、network／loopback probe、isolated copy、build、server、browser、HTTP。
- `NB-G4`のPASS化、Evidence attempt `0/1`の消費。
- Network-on＋proxy-off、外部domain allow entry、loopback／private allow、`allow_local_binding=true`、Unix socket allow、`dangerously_*` key、Windows `unelevated`でのcandidate実行。
- Codex plugins／connectors／MCP／web search／browser／Computer Use／cloudをfuture buildのnetwork経路に使うこと。
- 共有作業ツリーの既存tracked／untracked項目の整理・変更・stage。
- 今回承認範囲外のcommit、push、PR、GitHub変更、deploy、公開、本番データ、外部サービス書込み。
