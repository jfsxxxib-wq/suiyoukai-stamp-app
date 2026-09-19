# Gate B2-2C3-1A `0001` 最終offline補強結果

記録日時：2026-09-19 15:46（日本時間）

## 判定

**offline合格。D1 Write Token、Cloudflare API、remote request、remote write、`0001`なしで停止。**

## 変更範囲

Git対象外の一時runner 7ファイルだけを変更した。`tmp/`は`.gitignore`対象である。

- `tmp/gate-b2-c3-1a-rest-bootstrap-20260919/rest-bootstrap-core.mjs`
- `tmp/gate-b2-c3-1a-rest-bootstrap-20260919/stub-transport.mjs`
- `tmp/gate-b2-c3-1a-rest-bootstrap-20260919/test-offline.mjs`
- `tmp/gate-b2-c3-1a-rest-live-transport-20260919/live-transport.mjs`
- `tmp/gate-b2-c3-1a-rest-live-transport-20260919/run-live-once.mjs`
- `tmp/gate-b2-c3-1a-rest-live-transport-20260919/stub-fetch.mjs`
- `tmp/gate-b2-c3-1a-rest-live-transport-20260919/test-offline.mjs`

migration、manifest固定値、candidate、Worker code、binding、secret、route、公開設定、本体アプリは変更していない。

## 補強内容

### 直前SELECT

- 既存table判定に加え、未知named index、未知view／triggerを0必須にした。
- resultの`total_attempts`は整数1だけをPASSとした。
- 欠落、型不正、2はwrite前STOP。
- client attemptは1必須。2または不明はwrite前STOP。

### `0001` write batch

- client attemptは1、client retryは0を必須にした。
- HTTP成功、top-level success、23 result、全result successを従来どおり必須にした。
- 各resultの`total_attempts`が整数1の場合だけ事後SELECTへ進む。
- `total_attempts`欠落・型不正・2のfixtureでは、writeがcommit済みの可能性を意図的に残しながら、STOP、postcheck 0、write再送0、restore 0を確認した。
- DB状態を推測せず、安全化した`WRITE_TOTAL_ATTEMPTS_INVALID`だけを記録する。

### 事後SELECT

- `schema_meta` table 1件、row 1件、version 2を必須にした。
- `goencho_*` 16 tablesの総row数0を必須にした。
- 未知table／index／view／triggerを0必須にした。
- named indexes 4、foreign keys 15、`d1_migrations` 0を維持した。
- `total_attempts`は整数1だけをPASSとした。

### attempt記録

- logical transport callsとclient attemptsを別々に安全な整数で保持する。
- live transportの累計client attemptsも別に保持し、PASS時にcore集計と一致しなければSTOPへ変える。
- Token、Authorization、生response、SQL本文、table名、error messageはsafe resultへ含めない。

## offline試験結果

- runner：`REST_OFFLINE_TESTS_PASS cases=38 external_network=0 live_transport=0 real_token=0 bootstrap_sql_bytes=6502 statements=23`
- transport：`REST_TRANSPORT_OFFLINE_PASS cases=17 external_network=0 real_token=0 bootstrap_sql_loaded=0 bootstrap_sql_sent=0 client_retry=0 token_persisted=0`
- Node構文確認：変更7ファイルすべてPASS。

追加・維持した主なcase：

- 内部tableだけ：PASS。
- 既存ご縁帳table、`schema_meta`、`d1_migrations`、未知table／index／view／trigger：write前STOP。
- preflight `total_attempts`欠落・不正・2：write前STOP。
- write batch途中失敗・timeout：再送なしSTOP。
- write `total_attempts`欠落・不正・2：commit状態を推測せず、事後SELECTなしSTOP。
- write client attempts 2：事後SELECTなしSTOP。
- postcheckのschema row、業務row、table、index、view／trigger、foreign key、version不一致：STOP。
- postcheck `total_attempts`欠落・不正・2：STOP。
- localhost一回限り受け口、POST-only、endpoint固定、redirect拒否、Buffer zero-fill、生response参照解除：PASS。

## 不変確認

- `0001_goencho.sql`：6,502 bytes。
- SHA-256：`0EAADB9E1A72D1947414F50A45073D0B00FD8E33DE8267E15288D10A2F6194ED`。
- statements：23。
- account、D1名・UUID、binding、endpoint：不変。
- migration、Worker、本体アプリ、公開設定：変更なし。

## 外部状態

- D1 Write Token：作成なし。
- localhost Token受け口：live起動なし。
- Cloudflare API：0。
- remote SELECT／write：0。
- `0001`／`0002`：未実行。
- Worker runtime／公開：0。
- Time Travel restore：0。
- Git commit／push／PR：0。
- 正式resource／本番data：変更なし。

## 停止点

offline補強の合格結果を提示して停止する。別の明確な実行承認があるまで、D1 Write Token、localhost受け口、Cloudflare API、remote SELECT／write、`0001`へ進まない。
