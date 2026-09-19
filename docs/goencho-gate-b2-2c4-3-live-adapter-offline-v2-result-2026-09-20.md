# Gate B2-2C4-3A live adapter offline v2 clean再試験結果

記録日時：2026-09-20 00:42（日本時間）

判定：**PASS_OFFLINE**

## 修正範囲

- 旧証跡root `tmp/goencho-b2-2c4-3-live-adapter-offline-20260920/`は変更しなかった。
- 新規追跡外root `tmp/goencho-b2-2c4-3-live-adapter-offline-v2-20260920/`を構築した。
- 手修正はrunner 388行目の状態名`PASS_CANDIDATE`→`PASS_OFFLINE`の1行だけ。
- 派生更新はV3-B manifest、launcher固定runner hash、launcher manifestの各1行だけ。
- candidate 116／116、C4-2 tools 7／7、C4-3 files 6／6の内容一致を確認した。
- 旧result／cleanup／event log 3件は固定hash不変。

## clean再試験

- UAC／guardian／runner開始：各1回
- retry／再起動／再試験：0
- C4-3 F01〜F16：16／16 PASS
- C4-2：15／15 PASS
- B1：168／168 PASS
- Cloudflare offline：72／72 PASS
- 既存回帰：255／255 PASS
- 合計：271／271 PASS
- JavaScript構文：6 files PASS
- PowerShell構文：4 files PASS
- scope、leak、candidate／C4-2／C4-3／V3-B manifest：PASS
- update cache：不変
- completed phases：9／9
- warmup samples：20、active samples：319
- COM samples：349、NetSecurity boundaries：20
- event chain：401／401
- invariant failures：0
- NetSecurity max：7,033.807 ms（上限15,000 ms）
- COM API max：44.374 ms（上限250 ms）
- COM gap max：147.994 ms（上限1,000 ms）
- runner exit：0
- guardian exit：0
- launcher：`COMPLETE`

## cleanup

- 一時Firewall rule：削除済み
- 対象rule：0
- 全関連rule：0
- 専用Node：0
- listener：0
- cleanup state：`REMOVED`

## 固定hash

- runner：`5D25904757746B10F20B383E3B372F143261773277011FDBA2F341607F0991DA`
- launcher：`6DC074BB338FA5B699A4CD74486D23F73A0BD1BBF52AA843B1C76A52A1F88D2E`
- result：`C6D04E051C85D4C08506DE7DAF4490182EC2306A25C8FCC3E4D6C3C1BEBF28CD`
- cleanup：`1DA463EDEEAD53ED07AA51CED14722955E2549257DBFC30D4AD2E423FD33B42A`
- event log：`7FB63E6AA60639E3E9411A63B0088900FF2A9C882B084224DD4A4F0C21CD815E`

## 外部状態

- 専用Nodeは全phaseでOutbound Block。違反0。
- Cloudflare API、Wrangler remote、secret bulk、deploy、runtime request、D1 query：0。
- real Token、real secret：0。
- candidate正本、Gate tools、GitHub、PR、`main`、公開、本番データ：変更なし。
- Gate HEAD／upstream：`5d90a3e05c86851adccc35af0b8675f9f12c2245`、worktree clean。

## 停止点

C4-3Aは追跡外v2 rootでPASS_OFFLINE。指定どおり、candidate、Gate tools、GitHub、C4-3B、Token、Cloudflareへ進まず停止した。

次は別計画・別承認で、v2固定filesの昇格・checkpoint要否とC4-3B直前照合への入り方を確認する。
