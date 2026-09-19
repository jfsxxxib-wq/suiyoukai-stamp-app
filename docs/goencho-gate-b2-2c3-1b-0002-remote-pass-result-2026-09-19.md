# Gate B2-2C3-1B remote `0002` PASS結果

実行日時：2026-09-19 17:40頃（日本時間）

## 結論

commit `3e2f74fb5dd41cbaa3c40cb558a62049ee8f56ec`の固定runnerで、隔離D1へのremote `0002`を実行し、**PASS**した。

実行はpreflight SELECT 1回、`0002` write 1回、明確なwrite成功後のpostcheck SELECT 1回の計3 requestだけ。client retry、write再送、曖昧時postcheck、restore、`0001`再送、`0003`以降は0。

PASS後、短期TokenをCloudflare側で削除し、Account API Token一覧0件を確認して停止した。

## 固定対象

- account：`242d67724ca0baef96a00553df0fac35`
- D1：`goencho-b2-canary-db-202609`
- D1 UUID：`f12fe289-977c-4215-ae73-40aaa34bff97`
- binding：`GOENCHO_DB`
- migration：`0002_auth_write_guards.sql`
- bytes：1,403
- statements：15
- SHA-256：`1391CCC7B0599C7B22191DD4BD8F801BA3218218E3D989D0199D164DE48D676C`

## 実行結果

- status：`PASS`
- final phase：`COMPLETE_TOKEN_REVOCATION_REQUIRED`
- transport calls：3
- client attempts：3
- live client attempts：3
- migration requests：1
- retry：0
- write resend：0
- restore：0
- `d1_migrations` touched：false
- raw response stored：false
- Token stored：false

## preflight

runnerの固定PASS条件をすべて満たした。

- `schema_meta`：table 1、row 1、version 2
- `goencho_*`：16 tables、user tables合計17
- named indexes：4
- foreign keys：15
- business rows：0
- total columns：122
- `0002`追加columns／indexes：0／0
- `d1_migrations`：0
- 未知table／index／view／trigger：0
- client attempt／`total_attempts`：1

## write

- `0002`単一REST batch：1 request
- result：15件すべて明確に成功
- client attempt：1
- 各resultの`total_attempts`：1
- timeout／network error／HTTP不成功／応答不正／部分失敗：なし

## postcheck

- tables：17
- `schema_meta.version`：3
- named indexes：8
- foreign keys：15
- business rows：0
- total columns：132
- 追加columns：10
- 追加partial unique indexes：4
- 追加columnの名前、型、NOT NULL、default：全件一致
- 追加indexの名前、table、column、unique、partial、predicate：全件一致
- `d1_migrations`：0
- 未知table／index／view／trigger：0
- client attempt／`total_attempts`：1

## recovery timestamp

- RFC3339：`2026-09-19T08:39:00Z`
- Unix：`1789807140`

これはpreflight PASS後、write前に記録した回復基準。Time Travel restoreは実行していない。

## Token終了処理

- Token名：`goencho-b2-c3-1b-write-20260919`
- 権限：対象accountのD1 Writeのみ
- 有効期限：7日
- 値の表示・保存・記録：なし
- localhost receiver：一回だけ受領後に閉鎖
- Token Buffer：zero-fill
- active request：0
- raw response／raw JSON参照：解放済み
- Cloudflare側Token：削除済み
- Account API Token一覧：0件

## 非実施

- `0001`再送：0
- `0003`以降：0
- Worker実行／変更／deploy：0
- binding／secret／route／公開変更：0
- Git commit／push／PR／`main`変更：0
- 正式D1／正式本番データ変更：0

## 停止点

remote `0002` PASSとToken失効確認で停止する。次工程は別計画・別承認とし、追加Token、Cloudflare API、remote request、`0003`以降へ進まない。
