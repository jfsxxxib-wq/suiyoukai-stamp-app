# Gate B2-2C4 secret／runtime canary 目的・固定対象・禁止書込み・停止条件

作成日時：2026-09-19 18:29（日本時間）

状態：**計画提示のみ／実行HOLD。Token、secret作成、Worker変更・deploy、一時入口、runtime request、D1 writeは0。**

## 1. 結論

最初のruntime canaryは先生ページ全体の実利用試験ではなく、**既存の隔離Worker、D1 binding、version 3 schema、5 secret、Worker bundleが正しく接続され、読取りだけで安全停止できることを確かめる配線canary** とする。

最初からowner／先生登録、PIN、Cookie、架空対局へ進まない。最初の外部runtime requestは、別承認後の`GET /api/health`だけに固定し、D1 write 0で停止する。

## 2. 請求情報の確定

悦子さん確認値として、Workers Paidの請求情報を次で確定する。

- 税込請求額：5.50 USD
- 税率：10%
- 税抜相当：5.00 USD
- 請求頻度：毎月
- 請求日：18日

請求額・請求日は未解決事項から外す。今回Invoice、契約、支払方法、追加購入は操作しない。

## 3. 現在地

- Worker：`goencho-b2-canary-202609`
- D1：`goencho-b2-canary-db-202609`
- binding：`GOENCHO_DB`
- D1 schema：version 3、17 tables、8 named indexes、15 foreign keys、132 columns、business rows 0
- Workerの現行外部状態：停止中、外部入口なし
- `workers_dev=false`、`preview_urls=false`、route／custom domain 0
- observability、logs、invocation logs、traces：無効候補としてsource固定済み
- migration：`0001`と`0002`で完了。`0003`は作らない
- GitHub基準checkpoint：`94131e1c65ee2ce41f453d42487a7852b76a1842`
- Token：0

## 4. 先生ページの現在の完成度

### 完了済み

- 先生ページUI、mobile向け表示、44px以上の操作、accessibility契約。
- QR claim、pending、owner承認、PIN設定・再認証、logoutのローカル導線。
- 今日／過去日／個人の3方向表示、午前／午後分類。
- 先生間分離、端末承認、無操作lock、Cookie永続性、失効、再認証。
- B1 168件とCloudflare 61件、計229件のoffline回帰。
- D1 auth write serviceとtransaction／rollback試験。

### 未接続

現在のCloudflare Worker HTTP entrypointが公開するのは、`GET /api/health`と対局読取りAPIだけである。ローカルserverにある次のowner／先生認証・管理HTTP routeは、まだWorkerへ接続されていない。

- owner state、bootstrap activate、recovery consume、owner unlock／logout
- 先生作成、enrollment発行、pending／全端末一覧、approve／reject／revoke
- teacher state、enrollment claim／set-pin／status、teacher unlock／logout

`d1-auth-service.mjs`の業務処理は存在するが、Worker routeが未接続のため、このままでは先生ページ全体のremote runtime canaryはできない。未接続APIを先にofflineで接続する。

## 5. 固定対象

### resource

- 対象account：既存の隔離canary accountだけ
- Worker：`goencho-b2-canary-202609`だけ
- D1：`goencho-b2-canary-db-202609`だけ
- D1 binding名：`GOENCHO_DB`だけ
- source：`prototype/goencho-gate-b2-cloudflare-candidate/`のfreeze済み自己完結copy
- 正式Site、正式D1、正式Sheets、正式domain：対象外

### runtime secret名

現在のsourceが要求する5 secret名だけを候補とする。値は未生成・未入力・未保存。

- `GOENCHO_OWNER_PIN_PEPPER_V1`
- `GOENCHO_TEACHER_PIN_PEPPER_V1`
- `GOENCHO_DEVICE_TOKEN_HMAC_KEY_V1`
- `GOENCHO_SESSION_HMAC_KEY_V1`
- `GOENCHO_RECOVERY_CODE_PEPPER_V1`

値はcanary専用の暗号学的乱数とし、正式secret、既存PIN、既存tokenを流用しない。値をsource、Git、D1、通常env var、shell history、画面記録、response、log、保存文書へ残さない。

一時入口のaccess gate方式は未確定であり、推測で第6 secretやrouteを追加しない。安全な方式をofflineで比較・固定するまで入口有効化はHOLDとする。

## 6. 工程分離

各工程は結果提示で停止し、前工程の承認を次工程へ流用しない。

### B2-2C4-1：Worker HTTP parity offline接続

- 欠けているowner／先生認証・管理routeをWorkerへ接続する。
- local serverと同じstatus、response allowlist、Cookie、Origin、JSON制約をfixtureで照合する。
- `teacher_id`持込み拒否、secret欠落503、transaction rollbackを維持する。
- 一時入口access gateの候補と閉鎖方法を決める。
- external network、real Token、Cloudflare操作は0。

### B2-2C4-2：bundle・runner・secret入力経路のoffline固定

- source、assets、Wrangler設定、D1 binding、5 secret名、bundle hashを固定する。
- `workers_dev=false`、`preview_urls=false`、route 0、logs／traces 0をguardで検証する。
- secret値を表示・保存しない一回限り入力経路をoffline fixtureで試験する。
- deploy attempt 1、retry 0、曖昧時再deploy 0のrunnerを別領域に作る。
- 合格後もGitHub checkpointは別承認。

### B2-2C4-3：secret設定＋full Worker deploy、入口なし

- 別の明確な承認後だけ、既存隔離Workerへ5 secretを設定する。
- freeze済みfull Workerを一回だけdeployする。
- 外部入口を開かず、code／binding／secret名／observability設定だけをcontrol planeで読み取り確認する。
- runtime request、D1 read／write、route、Preview URL、`workers.dev`は0で停止する。

### B2-2C4-4：health読取りcanary

- access gate、有効化差分、到達範囲、無効化手順を別承認で固定する。
- 一時入口を開き、`GET /api/health`だけを固定回数送る。
- schema version 3と公開response allowlistを確認する。
- D1 write、Cookie、PIN、ticket、body、query、架空dataは0。
- PASS／STOP後は入口を閉じ、到達不能確認、API Token失効で停止する。

### B2-2C4-5：synthetic先生導線canary

- health canary PASS後の別承認でのみ開始する。
- canary専用の架空owner、架空先生、架空PIN、架空端末、架空参加者・対局だけを使う。
- QR claim、pending、承認、PIN、再認証、今日／過去／個人、端末失効をPC、iPhone Safari、Android Chromeで確認する。
- request総数500件、架空対局100件を上限とし、負荷試験を行わない。
- 終了後は入口を閉じ、synthetic rowの扱いとsecret cleanupを別承認で判断する。

### B2-2C4-6：閉鎖・結果checkpoint

- 一時入口が閉じ、外部到達0、active Token 0を確認する。
- secretを保持するか削除するかは、影響と回復性を提示して別承認にする。
- canary結果だけを専用branchへcheckpoint保存する。
- 正式反映、正式データ接続、公開へ進まず停止する。

## 7. 絶対に書き込まないもの

全工程共通で次を禁止する。

- 正式D1、正式Site、正式Sheets、正式domain、正式secret、本番data
- 受付系table、リーグtable、既存stamp、実在人物情報
- `d1_migrations`、`0003`、追加migration、seed、正式ID対応表
- secret値、PIN平文、ticket、Cookie、端末token、session token、recovery code、digest
- raw request header、query、body、例外、synthetic markerの永続log
- 未承認のWorker、binding、route、custom domain、Preview URL、`workers.dev`
- PR、GitHub `main`、正式公開設定

B2-2C4-4 health canaryでは隔離D1にも一切書き込まない。B2-2C4-5で別承認された場合だけ、既存隔離D1の`goencho_*`へsynthetic dataを書き込める。

## 8. 即時停止条件

次のいずれか一つでも該当したら、その工程をSTOPし、retry、再deploy、追加request、restore、cleanup削除へ自動で進まない。

- 対象account、Worker、D1、binding、checkpoint、bundle hashが固定値と違う。
- Worker HTTP parity、access gate、入口閉鎖方法がoffline合格していない。
- 5 secretの安全入力・zero-fill・非表示・非保存を保証できない。
- secret値、PIN、token、Cookie、request内容がsource、Git、D1、response、log、画面、保存記録へ出る。
- observability、persistent logs、invocation logs、tracesを無効のまま固定・確認できない。
- 外部入口が未承認で有効になる、または予定どおり閉じられない。
- health canaryでD1 write、業務row増加、schema変更が発生する。
- version 3、17 tables、8 indexes、15 foreign keys、business rows 0のpreflightと一致しない。
- client retry、deploy retry、曖昧時再送が必要になる。
- 正式resource、本番data、実在人物、別accountが必要になる。
- PBKDF2 600,000 iterationsを弱める必要がある、timeout、Error 1102、予期しない費用が発生する。
- PC、iPhone Safari、Android Chromeのいずれかで認証・Cookie・表示が成立しない。

## 9. 合格条件

### 最初のhealth canary

- freeze済みWorker、`GOENCHO_DB`、5 secret名、version 3が一致する。
- `GET /api/health`だけが期待status／bodyで成功する。
- D1 write 0、業務row 0、secret／request情報の漏えい0。
- PASS／STOP後に入口が閉じ、active API Token 0である。

### 先生ページの隔離完成

- C4-1〜C4-6が順番に合格する。
- owner／先生認証、端末承認、3方向表示、Cookie再認証が実際のCloudflare runtimeと主要ブラウザで成立する。
- 正式環境への変更が0で、canaryを再び外部到達不能にできる。

## 10. 先生ページ完成までの工程数

「完成」を三段階に分ける。

1. **画面・ローカル機能完成**：完了済み。追加0工程。
2. **Cloudflare隔離環境で先生ページ完成**：C4-1〜C4-6の **あと6工程**。
3. **先生が正式に利用できる完成**：隔離完成後に、次の3工程を加えた **あと9工程**。
   - 正式resource／データ／ID対応・rollback計画
   - 正式環境への限定deployと関係者acceptance
   - 公開入口／QR切替とPC・iPhone・Android最終確認

現時点の最大の未完了は画面デザインではなく、Cloudflare Workerへのowner／先生認証HTTP route接続と、外部runtimeでの安全実測である。

## 11. 今回行わないこと

- candidate code、Worker route、secret機構、runnerの実装
- Token作成、localhost受け口、Cloudflare login／API、secret作成、deploy
- runtime request、D1 read／write、架空data投入、入口有効化
- Git commit／push／PR、GitHub `main`変更
- 正式反映、公開、QR変更、実機試験

この計画提示で停止する。次へ進む最小工程は **B2-2C4-1 Worker HTTP parityのoffline接続** であり、別の明確な承認を必要とする。
