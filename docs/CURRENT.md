# CURRENT

## 記録日時

- 2026-09-22 17:39（日本時間）

## 対象作業と引き継ぎ元

- 対象：別build profile/session用candidate profile/config artifactの作成と静的検証。
- 引き継ぎ元：GitHub checkpoint `6b4b0ba896ebe5415c0ac0a99c780c7e32c3fbd9`と、artifactを作成するだけの承認。
- 現在path state：`CANDIDATE_PROFILE_CONFIG_ARTIFACT_STATICALLY_VALID__NOT_INSTALLED__RUNTIME_ENFORCEMENT_NOT_PROVEN__HOLD`。`NB-G0..NB-G3`はPASS、現taskの`NB-G4 = NOT PROVEN — STOP`は不変。
- 最新Option A classification：`OPTION_A_NOT_SUFFICIENT_FOR_REQUIRED_EVIDENCE`。
- 最新preflight classification：`GENERATED_BUILD_FIXATION_NOT_DETERMINABLE_PRE_BUILD`。
- 最新診断classification：`NOT_DETERMINABLE_FROM_BOUNDED_EVIDENCE`。
- 最新classification：`TEACHER_PAGE_BROWSER_FOLLOWUP_STOPPED_AT_ANONYMOUS_API_RESPONSE／BROWSER_RENDER_AND_HYDRATION_REACHED／EXPECTED_401_NOT_OBSERVED／ATTEMPT_1_OF_1_CONSUMED／CLEANUP_PASS／HOLD`。
- Execution ID：`TEACHER_ANONYMOUS_API_SAFE_METADATA_EVIDENCE_20260922_01`
- Attempt：`0/1`
- Safe-metadata plan：`docs/teacher-anonymous-api-safe-metadata-evidence-exact-plan-2026-09-22.md`
- Safe-metadata plan SHA-256：`f450a60f6c42a8815d8cf43f1861c1988f13e50711c9c28e1fa96f8aa72a374f`
- Instrumentation result：`docs/teacher-anonymous-api-safe-metadata-instrumentation-result-2026-09-22.md`
- Instrumentation result SHA-256：`8fdcde9843584e14cb61182656b87eaf3113c35626e16a4c5b618f6ea60a80a1`
- Generated-build preflight：`docs/teacher-anonymous-api-generated-build-preflight-fixation-2026-09-22.md`
- Generated-build preflight SHA-256：`210534f9a970bf402b27d5ec05ac19789842f7c895dcb47f8608bfb290830e72`
- Evidence-path decision plan：`docs/teacher-anonymous-api-safe-metadata-evidence-path-decision-exact-plan-2026-09-22.md`
- Decision plan SHA-256：`08b3e872719b610a76f6b58b10c74b2e2736f6c1a2bea46db43f3a16d8045c22`
- Option A result：`docs/teacher-anonymous-api-option-a-formal-evaluation-result-2026-09-22.md`
- Option A result SHA-256：`57a334b6f1e6404483c887b2c597fabc05e5e20c9731873f9498a72459682f4c`
- Option B result：`docs/teacher-anonymous-api-option-b-formal-evaluation-result-2026-09-22.md`
- Option B result SHA-256：`7b762508bf073f3aa8a12d8c0edf698e04c12a0c0e4c87ad9e2b32be106d03bf`
- Isolated-build safety plan：`docs/teacher-anonymous-api-isolated-build-safety-boundary-exact-plan-2026-09-22.md`
- Isolated-build safety plan SHA-256：`d42ac51b9032bb4b1feca1409a5546d34e7da59e9130c8d3d514f1667812875b`
- NB-G4 loopback result：`docs/teacher-anonymous-api-nb-g4-loopback-boundary-evaluation-result-2026-09-22.md`
- NB-G4 loopback result SHA-256：`8cba281bc3ed3a54a59f9ad924a71603976afe8d1c874d65b639dfb250eb744f`
- Source exact-plan candidate：`docs/teacher-anonymous-api-separate-profile-session-safety-boundary-exact-plan-candidate-2026-09-22.md`／SHA-256 `c0f0d7b68a8e3258840c0b39013a7805d3cdd1144b625fd29d4f790a71ad44c9`
- Candidate artifact：`docs/candidate-artifacts/teacher-separate-build-profile-20260922/teacher-build-evidence-offline-loopback-denied-20260922.config.toml`／SHA-256 `723e738382ad15e2da3b2577c1761f3295a1ecdf5ce661a33289a45d6ad5dc0e`
- Artifact record：`docs/candidate-artifacts/teacher-separate-build-profile-20260922/artifact-record.md`／SHA-256 `420f2662667b4b32adadf2763cd6a593cf9f2a293154f77341a15a1558d7bd22`
- 対応handoff：`docs/handoffs/2026-09-22-1737-teacher-candidate-profile-config-artifact-HOLD.md`／SHA-256 `61a0f19ba2df2ad0a4afdadd0e657ee4add8bd885e9375080ecf5dc4ba1c3099`

## Git照合

- 保存済みbranch：`codex/checkpoint-2026-09-04-passed`
- 保存済みHEAD／upstream：`6b4b0ba896ebe5415c0ac0a99c780c7e32c3fbd9`
- 保存済み`origin/main`：`052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- 固定Gate commit：`5e402e2def68c7ab0841db27059074f82390b660`
- Branch／HEAD／upstream／`origin/main`はartifact作成開始時照合値と一致。
- 共有作業ツリーの既存多数項目は整理・変更・stageしていない。
- GitHub checkpoint：separate profile/session design commit `6b4b0ba896ebe5415c0ac0a99c780c7e32c3fbd9`は追跡branchと一致。
- 今回のcandidate artifact、artifact record、handoff、本CURRENTはローカル未コミット。commit／pushは未承認・未実施。

## Fixed authority

- Contract ID：`goencho.authoritative-artifact-schema`
- Version：integer `1`
- Contract path：`docs/authoritative-artifact-schema-contract-v1.md`
- Contract SHA-256：`5d3baeab355b84e978d9c044713d5a36fb67d8ad21a0841a133def56bdbbba4e`
- I7 result：`docs/authoritative-schema-v1-i7-bounded-combined-verification-result-2026-09-22.md`
- I7 result SHA-256：`58e18066ad4cd82cd6bf828ef27ca3499ba8f97a6ced66db5607b52193598d86`
- Required assurance：`PIPELINE_GENERATION_ASSURANCE`
- Decoder model：`OPTION_1_ARTIFACT_ONLY_STRICT_DECODER`

## Identity source of truth — predecessor

- Record：`docs/component-identities/artifact-fixation-runtime.pre-implementation.v1.json`
- Schema：`component-identity-record/v1`
- File SHA-256：`ad238735a19695e60d3c14793f6014f261d927fdc7a613605c1ac9705a96e05d`
- Self-hash：`0ba175c1cc03383f4850c3419449459445386e7dae495a8a39ead3233c20e607`
- Phase：`PRE_IMPLEMENTATION`
- Tracked blob：`NOT_YET_CREATED`
- Predecessor modification：なし。

## Identity source of truth — verified implementation successor

- Record：`docs/component-identities/artifact-fixation-runtime.implementation.v1.json`
- Schema：`component-identity-record/v2`
- File SHA-256：`bae40d63172018f80058c560c600eeb9ac4042cff59f0095bee8ffc98c57fe57`
- Self-hash：`33554c627195a77ae2f4ebd6e5dbccfff4d6ba26e0ae52470be8989ae264131a`
- Phase／status：`IMPLEMENTATION／IMPLEMENTED／PASSED`
- Classification：`IMPLEMENTATION_VERIFIED_OFFLINE`
- Format：4437 bytes、one-line UTF-8、BOMなし、終端LF 1、CR 0。

## NB-G4 loopback boundary stop

- `NB-G0..NB-G3`は固定PASSで再評価していない。
- Network-disabled attestation／Windows公式仕様はlocal bindとloopback connectのdenyを個別定義していない。
- Exact local-IP allowlist機構は公式に存在するが、network-on＋active proxyの別profile境界であり、port単位ではない。
- 現runtimeへbuild固有profile／exceptionは選択・attestされず、過去の`127.0.0.1:4181`成功とも矛盾しない。
- `NB-G4 = NOT PROVEN — STOP`。`NB-G5..NB-G7`と`TW-G0..TW-G10`は未評価。

## 完了したこと

- Browser follow-upはBF-G0〜G11を12／12 PASS、rendering／hydration到達後にunexpected non-JSONで停止し、cleanup／port解放／post-checkを完了。消費済みattempt `1/1`は再利用しない。
- Bounded diagnosticはDG 7／7 PASSとSD-00〜08を完了したが、actual status／content-type／handler reach不足により`NOT_DETERMINABLE_FROM_BOUNDED_EVIDENCE`で停止。
- Safe metadata 10 fields、temporary instrumentation 6 files、syntax 3／3、offline synthetic tests 17／17 PASSを固定。Evidence attemptは`0/1`。
- Build inputs／toolchain／pre-build inventoryを固定したがpost-build値は未確定。Option AはA-G0／1／3／6 FAIL、Option BはB-G5／7 FAILで不採用。isolated rootは未作成。
- Effective runtime variablesからNB-G3をprobeなしでPASS。NB-G4は未証明で停止し、source hashes 6／6と既存`dist` 135 files／2,239,925 bytes不変を確認。
- OpenAI Docsのpermission profile、network proxy、filesystem、child-process、Windows enforcement境界をread-onlyで再確認。
- 別profile/session候補を、network-on＋active proxy＋外部allow entryなし＋local/private guard有効のfail-closed設計として固定。
- 固定build pathではloopback必要性が証明されないため、候補profileではloopbackを禁止。Vinext optional prerenderが選択された場合だけ`127.0.0.1`／ephemeral port／child serverを使う静的経路を記録。
- Write範囲をexact isolated root内の`dist/**`、`.wrangler/**`、`node_modules/.vite/**`、`.tmp/**`だけに限定するcandidateを固定。
- Local spawned commands／build plugins／child processは同一command sandbox境界、Codex plugins／connectors／MCP／web／browser等は別境界として明示し、future build stepでは後者を無効・不使用に固定。
- Exact-plan candidateを意味変更なしのinert TOML artifactとして専用docs配下に作成。TOML構文、schema/value allowlist、plan解析値一致、禁止キー不在、専用場所をPASSし、artifact／record／handoffをhash固定。active profile/config/sessionは未作成・未変更・未選択・未起動。

## 未完了・未確定

- Anonymous Teacher API responseがnon-JSONとなったtechnical root cause。
- Actual HTTP status／content-type、route handler／auth branch／harness catchの到達状況。
- Safe 401／403、complete asset、cookie boundaryは未確認。
- Exact post-build artifacts／hashesとwhole-build change policyは未確定。
- `NB-G4`はNOT PROVEN。`NB-G5..NB-G7`および`TW-G0..TW-G10`は未評価。
- Loopback deny attestation、または別runtime/profileとしてのbuild固有exact loopback-only exceptionが未確定。
- Option B safety boundaryの実評価、isolated copy、buildは未実施。
- 現行Option A／Bの双方が不成立。新しいsafety contractなしではreal evidence path未解決。
- Candidate artifactは作成済みだがactive locationへ未配置。profileは未選択・未起動で、active boundary／runtime enforcementは未証明。
- Future pre-sessionではlegacy sandbox混在なし、全config layer、active proxy、effective empty allowlist、exact root、native-Windows elevated enforcement、separate tool surface無効化をtrusted evidenceで閉じる必要がある。
- Permission profile機構はOpenAI Docs上beta。future schema再確認で一つでも閉じなければ`SEPARATE_PROFILE_SESSION_SAFETY_BOUNDARY_NOT_PROVEN`でHOLD。
- Loopback許可案は未採用。必要性が固定build pathから別途証明されるまで設計・実装しない。host/IP scopeより狭いexact port制約が必要なら現機構では不成立。
- Populated data、Teacher QR、real auth／production D1、deploy／公開確認は別境界。
- GitHubへ保存するかの判断と別承認。

## 公開・本番データ・外部サービス

- GitHub：latest design checkpointは`6b4b0ba896ebe5415c0ac0a99c780c7e32c3fbd9`。今回のartifact記録はローカル未コミット、PR／`main`変更なし。
- Commit／push：今回は禁止・未実施。
- 公開・deploy：変更なし。
- 本番データ：変更なし。
- 外部サービス：OpenAI公式文書のread-only参照のみ。書き込みなし。

## 次回の安全な再開地点

1. 本CURRENT、latest handoff、artifact record、inert TOML、source exact-plan、Git metadataを読む。
2. Artifactは作成・静的検証済み。次へ進む場合は、ローカル記録をGitHub checkpointへ保存するか、別承認でfuture pre-session Gateを扱うかを先に決める。
3. Active locationへの配置、profile選択・有効化、isolated copy、separate session start/attestation、build、post-build fixation、real attempt、rollbackをそれぞれ別承認とする。
4. Future pre-session Gate `PS-G0..PS-G10`が全PASSしない限りsessionを起動しない。probeで不足attestationを代替しない。
5. Attempt `0/1`を未消費のまま保持する。

## 触らない

- Predecessor／verified successorの変更・削除。
- 消費済みattempt `1/1`の再利用。
- Browser follow-up attempt `1/1`の再利用。
- 無承認のTeacher page／server／browser再起動。
- npm／Vinext／Wrangler／別executable、別port、retry／fallback。
- 無承認のbuild、`dist` clean／rewrite、rollback。
- Candidate docs artifact以外のprofile/config作成、active locationへのcopy／変更／選択／有効化、別session起動、legacy sandbox設定変更、network proxy有効化、loopback allow entry追加。
- Network-on＋proxy-off、外部domain allow entry、`allow_local_binding=true`、Unix socket allow、`dangerously_*` network key、native-Windows `unelevated` fallbackでの候補実行。
- Codex plugins／connectors／MCP／web search／browser／Computer Use／cloudをfuture buildのnetwork経路として使用すること。
- Seed、write API、production D1、正式データ、real auth、Teacher QR target。
- Contract／I1〜I6 source／tests／fixturesの変更。
- 共有作業ツリー既存項目の整理・変更・stage。
- Commit、push、PR、GitHub変更、deploy、公開、本番データ、外部サービス操作。
