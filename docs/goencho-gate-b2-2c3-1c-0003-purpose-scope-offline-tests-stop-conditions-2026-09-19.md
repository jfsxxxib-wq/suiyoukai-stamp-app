# Gate B2-2C3-1C `0003` 目的・固定範囲・offline試験・停止条件

作成日時：2026-09-19 17:59（日本時間）

状態：**計画ゲート合格／`0003`新規作成・実行HOLD。Token 0、Cloudflare通信0、remote request 0。**

## 1. 結論

現時点では、ご縁帳candidateに`0003`原本も、`0003`を必要とする承認済み業務要件も存在しない。番号を連続させる目的だけでmigrationを追加しない。

この工程をB2-2C3-1C **`0003`必要性判定ゲート** とする。具体的なschema変更要件が先に確定した場合だけ、version 3から次versionへ進める最小migrationとして改めて設計する。

要件が存在しない場合は`0003`を作らず、D1 schemaはversion 3で固定したまま、secret／runtime canary等の別工程へ進む計画を別承認で作る。

## 2. 判定根拠

- ご縁帳candidateのmigrationは次の2本だけ。
  - `0001_goencho.sql`：6,502 bytes、SHA-256 `0EAADB9E1A72D1947414F50A45073D0B00FD8E33DE8267E15288D10A2F6194ED`
  - `0002_auth_write_guards.sql`：1,403 bytes、SHA-256 `1391CCC7B0599C7B22191DD4BD8F801BA3218218E3D989D0199D164DE48D676C`
- 既存のB2-2C3計画は、この2本で17 tables、8 indexes、15 foreign keys、`schema_meta.version=3`になる範囲を固定している。
- 隔離D1はremote `0002`後にversion 3、tables 17、indexes 8、foreign keys 15、columns 132、business rows 0でPASS済み。
- 現在のcandidate回帰試験はB1 168／168、Cloudflare 61／61で合格し、追加DDL不足を示す失敗は0。
- portability試験はD1とPostgresの17 tables、ID、公開API、認証mutationの一致を確認済み。

## 3. 同名migrationの混入禁止

主作業場の別プロジェクトには`prototype/teacher-admin-production-candidate/drizzle/0003_luxuriant_jack_power.sql`がある。

これはリーグ用tableを作るDrizzle migrationであり、ご縁帳candidateの`goencho_*` schema、REST batch方式、`schema_meta`履歴とは別物である。B2-2C3-1Cへコピー、改名、部分流用しない。

## 4. 将来`0003`を作れる目的条件

次のすべてが文書で確定した場合だけ、`0003`設計へ進める。

1. 追加・変更したい利用者機能または整合性制約が一つに特定されている。
2. application codeだけでは満たせず、DB schema変更が必要な理由を説明できる。
3. 対象table、column、index、constraint、既存rowへの影響が列挙されている。
4. D1とPostgres portabilityを維持する対応を決められる。
5. version 3の既存schemaとAPI契約を壊さないか、破壊的変更なら別工程へ分離できる。
6. rollback不能・data rewrite・table再構築の有無を事前に判定できる。

この条件を満たさない「将来用」「念のため」「連番維持」だけのmigrationは作らない。

## 5. 固定範囲

現時点で固定するのは、`0003`のSQL内容ではなく設計境界だけ。

- 基準checkpoint：`0ebd2d656aa197ba651eb668c685a95984f6e1f7`
- remote基準：隔離D1 `goencho-b2-canary-db-202609`、`schema_meta.version=3`
- namespace：`schema_meta`と`goencho_*`だけ
- 履歴方式：`d1_migrations`を作成・挿入せず、固定hash＋REST単一batch＋`schema_meta`を継続
- remote候補：preflight SELECT 1回、migration write 1回、明確な全面成功時だけpostcheck SELECT 1回の最大3 request
- client retry、write再送、曖昧時postcheck、restore：0
- 正式resource、本番data、受付系table、リーグtable：対象外

`0003`のファイル名、bytes、statements、SHA-256、version 4への更新、具体的DDLは未確定であり、推測で固定しない。

## 6. offline試験計画

具体的要件の承認後、Token作成より前に次をすべて行う。

### A. 要件とsourceの固定

- 変更理由、対象object、旧schema、新schema、API影響を一対一で対応させる。
- SQL原本のbytes、statement数、SHA-256を固定する。
- 許可object以外のDDL、seed、業務data、`d1_migrations`操作が0であることを静的検査する。
- D1用SQLとPostgres側schema／adapter／manifestの差分を照合する。

### B. version 3からの適用試験

- 新規in-memory SQLiteへ固定`0001`、`0002`を順に適用し、version 3基準を作る。
- version 3基準へ`0003`候補を一回だけ適用する。
- table、column、index、foreign key、constraint、default、partial predicateを名前と定義で照合する。
- `schema_meta`が1 table・1 rowで、期待versionへ一度だけ更新されることを確認する。
- 既存17 tablesの業務rowを変えないことを、before／after件数と内容hashで確認する。

### C. 原子性・失敗注入

- 各statement位置で意図的に失敗させ、batch全体がversion 3へrollbackすることを確認する。
- timeout、HTTP不成功、応答不正、部分成功、`total_attempts`欠落・不正のfixtureを用意する。
- 曖昧writeではDB状態を推測せず、postcheck、再送、restoreを行わずSTOPすることを確認する。

### D. 回帰・隔離

- B1全試験、Cloudflare全試験、portability、scope check、leak scan、source manifestを再実行する。
- 既存`0001`／`0002` runnerを上書きせず、`0003`専用runnerを別の一時領域で作る。
- external network、real Token、Cloudflare requestが0であることを確認する。
- offline合格後も、GitHub checkpointとremote実行をそれぞれ別承認に分離する。

## 7. remote前の必須preflight候補

実際の`0003`内容が確定した後に、期待値を具体化する。最低限、次を満たさなければwriteへ進まない。

- 対象account、D1名、UUIDが固定値と一致する。
- `schema_meta`はtable 1・row 1・version 3。
- user tables 17、named indexes 8、foreign keys 15、total columns 132。
- business rows 0、`d1_migrations` 0、未知table／index／view／trigger 0。
- `0003`で追加予定のobjectは適用前状態と一致する。
- preflightのclient attemptと`total_attempts`は1。

## 8. 即時停止条件

次のいずれか一つでも該当したら、`0003`を作成・実行せずSTOPする。

- 承認済みの具体的業務要件がない。
- 別プロジェクトの`0003`やリーグ／受付schemaを混入させる必要がある。
- version 3基準、migration hash、対象object、期待postcheckを一意に固定できない。
- destructive DDL、table再構築、既存row rewriteが必要だが、専用計画と復旧方法がない。
- D1／Postgres portability、229件回帰、scope check、leak scanのいずれかが不合格。
- candidate、runner、migration、計画の内容に未説明のdriftがある。
- Token、Cloudflare API、remote request、restore、Worker実行、secret、route、公開が必要になる。
- 正式resource、本番data、実在人物、受付系／リーグdataが必要になる。

## 9. 承認ゲート

1. **目的承認**：`0003`が解決する具体的要件を確定する。
2. **実装・offline承認**：SQL候補と専用runnerを一時領域で作り、offline試験する。
3. **GitHub checkpoint承認**：offline合格物だけを専用branchへ保存する。
4. **remote実行承認**：固定commitを基準にToken作成と最大3 requestを許可する。

各ゲートは前段の承認を次段へ流用しない。PASS／STOP後はTokenをCloudflare側で削除・失効確認し、次migrationやruntime工程へ進まず結果提示で停止する。

## 10. 今回の実施結果

- candidate migration一覧確認：2本、`0003`なし。
- B1：168／168 PASS。
- Cloudflare：61／61 PASS。
- scope check：110 files PASS。
- leak scan：PASS。
- source manifest：57 files PASS。
- `0003` SQL、runner、Token、localhost受け口、Cloudflare通信、remote request、Git操作：0。

結論は **`0003`新規作成・実行HOLD**。次は具体的schema要件の有無を確認し、要件がなければ`0003`を作らず別工程へ進む計画を提示する。
