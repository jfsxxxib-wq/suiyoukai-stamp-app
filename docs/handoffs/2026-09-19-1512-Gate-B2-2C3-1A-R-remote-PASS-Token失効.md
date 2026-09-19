# Gate B2-2C3-1A-R remote PASS・Token失効

記録日時：2026-09-19 15:12（日本時間）

## 結論

固定対象・停止条件の範囲で、D1 Read Tokenを使ったSELECT-only remote requestを1回だけ実行しPASSした。Tokenは削除・失効済み。D1 write、`0001`、公開、本番dataには触れず停止した。

## 事前確認

- 新規1A-R専用runner：offline 21件合格。
- 既存transport：offline 15件合格。
- 既存runner：offline 20件合格。
- 固定account、D1名・UUID、binding、endpoint、SELECT-only SQLを照合した。

## remote結果

- HTTP 200、client request 1、client retry 0。
- Cloudflare内部 `meta.total_attempts = 1`。
- `cf_internal_tables = 1`、`sqlite_internal_tables = 0`。
- `d1_migrations_tables`、`schema_meta_tables`、`goencho_tables`、`unexpected_user_tables`、`unexpected_named_indexes`、`unexpected_user_objects`はすべて0。
- 判定：`PASS`。
- remote write 0、`0001`送信0、追加remote call 0。

詳細：`docs/goencho-gate-b2-2c3-1a-r-readonly-remote-result-2026-09-19.md`

## Token

- 対象account全体・D1 Readだけ・7日のAccount API Tokenを使用した。
- 初回発行secretは取得せず、Rollで無効化した。
- Roll後secretはlocalhostの非表示受け口へだけ渡し、chat・file・環境変数・ログへ保存していない。
- 使用後Buffer zero-fill、raw response参照解除、受け口閉鎖を確認した。
- 結果確認後にTokenを削除し、Account API tokens一覧が空へ戻ったことを確認した。

## Git照合

- 主branch：`codex/checkpoint-2026-09-04-passed`
- 主HEAD：`7c5c4e6f14fae9141689323cd596e7fdc5c72be3`
- `origin/main`：`052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- Gate B2 branch：`codex/goencho-gate-b2-cloudflare-candidate-20260918`
- Gate B2 HEAD／origin branch：`3c64b38ea9156bfb9dfb30846637a250c23514b9`
- Gate B2とtracking branch：0 ahead／0 behind。`origin/main`との差：0 behind／1 ahead。
- Git commit・push・PR・`main`変更なし。既存変更と未追跡`prototype/`を保持した。

## 外部状態

- 隔離D1：SELECT-only request 1、write 0、`0001`未実行。
- Account API Token：削除・失効済み。
- Worker／binding／billing：変更なし。
- 公開route／domain：変更なし。
- 正式Site、正式D1、正式Sheets、本番data：変更なし。

## 次回の安全な再開地点

最初にB2-2C3-1A remote `0001`の最終範囲・試験・停止条件を確認する。別の明確な実行承認があるまでD1 Write Token、remote write、`0001`へ進まない。

## 触らない

- 追加SELECT、過去のremote call再試行、原因調査だけのremote call。
- 別承認なしのD1 Write Token、`0001`、`0002`、restore。
- Worker実行、secret、route、公開。
- 正式resource、本番data、Git commit、push、PR、GitHub `main`。
