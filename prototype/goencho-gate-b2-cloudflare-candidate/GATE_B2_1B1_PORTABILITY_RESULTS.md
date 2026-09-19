# Gate B2-1B1 D1→Postgres移行可能性ローカル試験

実施日時：2026-09-18 14:29（日本時間）

判定：**現在公開候補のteacher認証読取り・今日／過去／個人API・全17 table移送は合格。正式環境変更なし。**

## 実装

- 共通contract：`portability/db-contract.mjs`
- DB非依存業務service：`portability/goencho-service.mjs`
- D1 adapter：`cloudflare/src/d1-repository.mjs`
- Postgres adapter候補：`portability/postgres-adapter.mjs`
- Postgres DDL候補：`portability/postgres-schema.sql`
- 明示table／列manifest：`portability/schema-manifest.mjs`
- snapshot／CSV／hash／FK照合：`portability/migration-rehearsal.mjs`
- 比較試験：`cloudflare/tests/06-portability-migration.test.mjs`

ローカルPostgresは外部serverやDockerではなく、dev dependencyのPGlite 0.5.8をWASMでmemory実行した。Worker本体のruntime dependencyには追加していない。

## 新規試験 8件

1. 共通contract／業務serviceへD1の`prepare`、`bind`、`batch`、`meta.changes`、bindingを持ち込まない。
2. D1相当snapshotを別SQLiteへ復元し、明示列CSVからPostgresへ全17 tableを移す。
3. `teacher_id`、`participant_id`、`match_id`の全値が完全一致する。
4. health、今日、日付一覧、過去日、個人記録のHTTP status／JSON／sort順が完全一致する。
5. HMAC照合後のteacher actor、先生間分離、同日2局、同姓同名、複数先生、3方向同一matchの結果が一致する。
6. `match_id`と`source_reference`の重複を両DBが拒否する。
7. D1だけへ書込んだ差分をhashで検出し、最終snapshot再取込後に全件一致へ戻せる。
8. SQLite `TEXT`／`INTEGER`からPostgres `text`／`bigint`へ移しても日付、時刻、日本語、JSON文字列、work factorの意味を維持する。

## 照合結果

- 17／17 tableでrow count一致。
- 17／17 tableでprimary key hash一致。
- 17／17 tableで全行canonical hash一致。
- SQLite／Postgresともforeign key orphan 0件。
- `teacher_id`、`participant_id`、`match_id`集合は完全一致。
- fixtureは全17 tableに架空行を持ち、認証hash、credential状態、session、人物対応、対局、auditも比較対象にした。
- CSVは固定table manifestと明示列順を使い、暗黙の`SELECT *`列順へ依存していない。
- 二つのDBへ同時writeせず、差分検出→最終snapshot→再照合の順で切替条件を再現した。

## 回帰・安全確認

- `npm test`：B1 168件＋Cloudflare 49件＝217件、全件合格。
- `npm run scope-check`：合格。routeなし、logなし、D1 placeholderのみ。
- `npm run leak-scan`：合格。10個のruntime秘密markerはDB、error、audit、保存ファイルに不在。
- `npm run manifest:verify`：合格。Gate B1の57 source fileは不変。
- `npm run wrangler:dry-run`：合格。公開なし。Worker bundle 20.01 KiB、gzip 5.47 KiB。
- PGliteはdev dependencyだけで、dry-run Worker bundleへ含まれていない。

## 達成した境界

```text
HTTP API
  → GoenchoService（認証判断・teacher境界・入力・公開DTO）
    → 共通DB contract
      ├─ GoenchoD1Adapter
      └─ GoenchoPostgresAdapter
```

Workerは`repositoryFactory`注入で同じroute実装のままadapterを交換できる。clientからbackend種類を指定する経路はない。

## 残る条件

`d1-auth-service.mjs`のowner初回登録、復旧、teacher enrollment、PIN設定、端末承認等の**書込みstate machine全体**は、今回Postgres adapterへ移していない。現在の公開読取りAPIとteacher session認可、保存data全体の移送は合格したが、将来Supabaseへ正式切替する前には、書込みstate machineも共通auth contractへ分離し、D1／Postgres双方で並列一回限り・rollback試験を行う必要がある。

この未実施項目は「分離不能」ではなく、次の独立した高risk工程である。既存D1側19件のtransaction／failure injection試験は引き続き全件合格している。

## 変更していないもの

- 正式Site、正式D1、正式Sheets、本番data、受付、`test_receptions`、stamp、league、花図鑑。
- Cloudflare Paid、Supabase契約、外部DB、remote resource、secret、route、domain。
- 公開、deploy、Git commit、GitHub push、PR。
