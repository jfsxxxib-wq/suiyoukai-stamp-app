# Gate B2-2C4-3A v2 昇格・checkpoint・C4-3B接続計画

記録日時：2026-09-20 00:50（日本時間）

判定：**計画PASS／直接昇格STOP／実行HOLD**

## 1. 目的

C4-3A v2のPASS_OFFLINE成果を失わず、Gate toolsへ再実行可能な形で昇格し、GitHub checkpointを先に作成してからC4-3Bへ接続する。今回行うのは計画固定だけであり、Gate tools、GitHub、Cloudflareは変更しない。

## 2. 固定基準

- Gate branch：`codex/goencho-gate-b2-cloudflare-candidate-20260918`
- Gate HEAD／upstream：`5d90a3e05c86851adccc35af0b8675f9f12c2245`
- v2 root：`tmp/goencho-b2-2c4-3-live-adapter-offline-v2-20260920/`
- C4-3A：16／16、既存255／255、合計271／271 PASS
- runner／guardian exit 0、launcher `COMPLETE`、retry 0
- event chain 401／401、cleanup後rule／Node／listener 0
- candidate、C4-2 tools、GitHub、Cloudflareは無変更

## 3. 直接昇格を止める理由

v2のC4-3 testは一時root固有の配置を参照している。

- test 38行目：`../../gate/tools/goencho-gate-b2-c4-2-offline-20260919/...`
- test 41行目：testから2階層上をstaging rootとして解決
- test 42行目：その配下の`gate/prototype/...`をcandidateとして解決

Gate tools直下へ6ファイルをbyte-copyすると、この3参照が存在しないパスを指し、fixtureを再実行できない。candidate copyや検証harness全体をGitへ同梱する案は、正本の重複と生成証跡混入を招くため採用しない。testを除外する案も再現性を失うため採用しない。

さらに`start-c43-live.ps1`は`OfflineFixture`だけを受理し、remote modeを明示的に拒否する。現6ファイルは**offline contract package**であり、C4-3C remote runnerではない。

## 4. 推奨昇格先

`tools/goencho-gate-b2-c4-3-offline-contract-20260920/`

「live adapter」という名称でremote実行可能と誤認させず、state machine、secret handling、command specification、request budget、safe output、fixtureの固定物であることを名称でも示す。

## 5. 工程分離

### P1 portable化・staging試験

別の明確な承認後、新規追跡外rootにGate最終配置と同じ`gate/tools/...` topologyを作る。v2 rootと旧STOP rootは変更しない。

固定6ファイルの扱い：

- byte不変3：`c43-live-adapter.mjs`、`REQUEST_BUDGET.json`、`start-c43-live.ps1`
- portable化2：`tests/c43-live-adapter.test.mjs`のC4-2 import／Gate root／candidate path、`README.md`の昇格先・offline-only説明
- 派生更新1：`C43_SOURCE_MANIFEST.sha256`

production module、request budget、secret handling、state machine、attempt上限、remote禁止条件は変更しない。

target-like stagingで、OS network block下にC4-3 16＋既存255＝271件、scope、leak、manifest、構文を1回実行する。PASS／STOPともcleanup後に結果提示で停止する。

### P2 Gate tools昇格

P1 PASS後の別承認で、固定6ファイルだけを新規昇格先へ個別コピーする。既存同名dirがあれば書き込まずSTOPする。新規dirのため既存ファイル退避は0。rollback対象は、commit前かつ昇格失敗時の新規6ファイル／空dirだけとする。

昇格後は6／6 byte一致、予定外差分0、secret scan、manifest、構文、candidate／C4-2不変を確認し、network block下の271件を1回実行する。PASSしてもGitHubへ進まず停止する。

### P3 GitHub checkpoint

P2 PASS後に別の保存範囲確認を行い、固定6 toolsと、その時点までの計画・結果・handoffだけをexact listへ固定する。`CURRENT.md`は可変入口なので、checkpointへ含めるかを保存範囲確認時に明示する。

明確な承認後だけstage、secret除外、`diff --cached --check`、1 commit、専用branchへpush 1回、HEAD／upstream照合を行う。PR、`main`変更は0。

### P4 C4-3B接続

checkpoint完了後の別計画として開始する。最初にremote実行可能性の完全性を監査する。

- offline contract packageとcheckpoint hash
- 実transport／child process実装の有無
- Tokenをchild限定で渡す受け口
- direct control-plane GETの実装
- Wrangler secret bulk／deploy childのstdin・env・timeout・exit判定
- ephemeral descriptorのWindows ACL実装と削除確認
- safe output、request budget、single-use、Token失効境界

現時点では実transportとremote launcherが存在しないため、C4-3Bで不足が確認された場合はTokenを作らずSTOPし、C4-3B1実装計画へ分離する。offline contractの合格をremote readinessと扱わない。

## 6. 停止条件

- v2／旧STOP証跡が変化した。
- production module、request budget、launcherにportable化以外の変更が必要になった。
- portable化差分がtest path・README・manifestを超えた。
- candidate 116 files、C4-2 7 files、migration hash、Gate HEADが不一致。
- staging／昇格後の271件、scope、leak、manifest、構文、network guardianが不合格。
- 予定外Git差分、secret、private ID、raw response、生成物が混入した。
- remote transport未実装のままToken作成またはCloudflare操作が必要になった。

STOP時は次工程、retry、GitHub、Cloudflareへ進まない。

## 7. 今回の停止点

計画記録だけで停止する。portable化、Gate tools昇格、Git stage／commit／push、C4-3B、Token、secret、Cloudflare API、deployは0。

次の最小工程は、別の明確な実行承認後の**P1 portable化・target-like staging・network block下271件試験1回**である。
