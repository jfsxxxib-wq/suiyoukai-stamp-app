# Gate B2-2C3-1A-R read-only専用runner offline結果

記録日時：2026-09-19 14:34（日本時間）

状態：**offline合格。Token作成・Cloudflare通信・remote read・`0001`なしで停止。**

## 保存対象

`tools/goencho-gate-b2-c3-1a-r-readonly-20260919/`

- `scope.mjs`：固定account、D1名・UUID、`GOENCHO_DB` binding、SELECT-only SQL。
- `readonly-transport.mjs`：固定endpoint、POST-only、redirect拒否、timeout、client request上限1、no-retry、安全なcountと`total_attempts`だけの正規化。
- `readonly-runner.mjs`：空状態と`total_attempts`のPASS／STOP判定。
- `stub-fetch.mjs`：外部通信しない架空response。
- `token-receiver-readonly.mjs`：localhost一回限り、D1 Read表記、password入力、Buffer zero-fill。
- `test-offline.mjs`：21件のoffline stub試験。

## 固定条件

- 対象account、D1 UUID、D1名、bindingを固定値と照合。
- API endpointは固定D1の`POST /query`だけ。
- bodyは固定SELECT 1文だけ。任意SQL、write、migrationを拒否。
- transport instance当たりclient requestは最大1、client retryは0。
- `meta.total_attempts = 1`だけPASS。
- `total_attempts = 2`／3はclient retryとは扱わず`CLOUDFLARE_INTERNAL_RETRY`でSTOP。
- 欠落、0、負数、非整数、型不正、4以上は`REMOTE_RESULT_INVALID`でSTOP。
- 生response、名前、SQL定義、message、error detail、Tokenを結果へ残さない。

## 試験結果

- 新規：`READONLY_EMPTY_CHECK_OFFLINE_PASS cases=21 external_network=0 real_token=0 remote_requests=0 write=0 bootstrap_sql_loaded=0 bootstrap_sql_sent=0 client_retry=0 token_persisted=0`
- 既存transport回帰：`REST_TRANSPORT_OFFLINE_PASS cases=15 external_network=0 real_token=0 bootstrap_sql_loaded=0 bootstrap_sql_sent=0 client_retry=0 token_persisted=0`
- 既存runner回帰：`REST_OFFLINE_TESTS_PASS cases=20 external_network=0 live_transport=0 real_token=0 bootstrap_sql_bytes=6502 statements=23`

## 静的分離

- bootstrap core、migration manifest、`0001_goencho.sql`、`0002`のimport／参照なし。
- `process.env`、Token環境変数、`console.log`／`console.error`なし。
- `INSERT`、`UPDATE`、`DELETE`、`CREATE`、`DROP`、`ALTER`なし。
- 本物のsecret、Token、本番data、生成物、不要な一時ファイルなし。

## 実施していないこと

- 外部通信、Cloudflare API call、remote read。
- 本物Tokenの作成・入力・保存。
- `0001`／`0002`、D1 write、Time Travel restore。
- Worker実行、secret、route、公開。
- 正式resource、本番data。

## 停止点

offline試験結果提示で停止。次のToken作成・remote read 1回には別の明確な承認が必要。remoteでPASSしても`0001`へは自動で進まない。
