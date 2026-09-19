# Gate B2-2C4-3A portable staging v1 結果

記録日時：2026-09-20 01:03（日本時間）

判定：**PASS_OFFLINE**

## 実施範囲

- 新規追跡外root：`tmp/goencho-b2-2c4-3a-portable-staging-v1-20260920/`
- 最終配置と同じtarget-like path：`gate/tools/goencho-gate-b2-c4-3-offline-contract-20260920/`
- candidate 116 files、C4-2 tools 7 filesを内容一致copyとして配置した。
- v2／旧STOP rootと証跡は変更していない。
- Gate tools正本、GitHub、Cloudflareは変更していない。

## portable化差分

- byte不変3 files：`c43-live-adapter.mjs`、`REQUEST_BUDGET.json`、`start-c43-live.ps1`
- portable化：testのC4-2 sibling import、Gate root、candidate、guardian、launcher、request budget解決
- README：offline contract packageでありremote runnerではないことを明文化
- `C43_SOURCE_MANIFEST.sha256`：派生hash更新
- 検証harness：C4-3 package pathと派生runner／launcher hashだけを更新

## 試験

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
- runner／guardian exit：0／0
- launcher：`COMPLETE`

## network guardian

- phases：9／9
- warmup samples：20
- active samples：322
- COM samples：352
- NetSecurity boundaries：20
- event chain：404／404
- invariant failures：0
- NetSecurity max：6,931.999 ms（上限15,000 ms）
- COM API max：43.612 ms（上限250 ms）
- COM gap max：154.323 ms（上限1,000 ms）
- cleanup後：対象rule 0、全関連rule 0、専用Node 0、listener 0

## 固定6 files hash

- `c43-live-adapter.mjs`：`5DAF2A0D21F7501FB15780BC8C17003F8418115A598D0971683840B7B4A175A3`
- `REQUEST_BUDGET.json`：`1AF51E1F0D2A23F353500E548E7DE3ADD69906DCE3B42EF49CB1A12FC8D7A359`
- `start-c43-live.ps1`：`1B4755277D2E335695E0FC2E3FE2731C15AB73B700C83B1FE8CF6989D5C1A85D`
- `README.md`：`AFB6082DC1152572C8C2A71B8273A2A9F61B64C7D22C1A70AD07D40256C8132D`
- `tests/c43-live-adapter.test.mjs`：`85BADCF016F786B602DED321B91474A9FCEC4A6514D0A1BD184FEB4E31B4C91A`
- `C43_SOURCE_MANIFEST.sha256`：`6E5AA93A31A25BDAC423A975FAE02621D2B1F3CD5DC035C9812561FDB3130CEF`

## 証跡hash

- result：`3DDCBF0C789A824020B7D02CC06640443CC234ECEECF7FD5743D9A80CDB9F11C`
- cleanup：`13269F78F7B1938CF8292A045C0B787B34E5A3753676BC9288A8120AC760513A`
- event log：`3BB441B1C22F4345E056DD1FE0F60C3FCEC901F07022E180856C7028FDB2619E`

## 外部状態・停止点

- Cloudflare API、Wrangler remote、secret bulk、deploy、runtime request、D1 query：0
- real Token、real secret：0
- Gate tools、GitHub、PR、`main`：変更なし
- 公開／本番データ：変更なし

P1 PASSで停止した。次は別の明確な承認後だけ、固定6 filesを新規Gate tools dirへ個別昇格し、内容一致・予定外差分0・network block下271件を1回確認する。
