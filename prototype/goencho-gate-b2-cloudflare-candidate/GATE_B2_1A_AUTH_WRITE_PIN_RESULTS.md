# Gate B2-1A 認証書込みtransaction＋PIN CPU比較結果

実施日：2026-09-18

状態：**ローカルD1認証書込みは合格。PIN保護を維持したままWorkers Free 10msへ収める根拠は得られず、外部resource作成前で停止。**

## 実装したローカル候補

- D1 schema version 3の追加型migration。
- owner初回登録・PIN解除・一回限り復旧コード・復旧時の旧端末／旧session失効。
- 先生登録券・一回限りclaim・初回PIN・新端末・PIN reset・端末承認／失効。
- PIN連続失敗の原子的な回数加算、一時停止、成功時の失敗履歴消去。
- 操作ごとの条件付きUPDATE／INSERT SELECTとD1 `batch()`。
- active owner、active credential、端末ごとのactive sessionを部分unique indexで防護。
- operationごとのmutation IDをguardに使い、別操作の成功行を後続statementが誤参照しない構造。
- PBKDF2-HMAC-SHA-256 600,000回、16-byte salt、32-byte hash、pepper key version記録。
- PIN、pepper、復旧コード、端末token、session tokenの平文をDB・応答・保存ファイル・ログへ残さない境界。

## transaction試験

- 同じbootstrap ticketの20並列利用：成功1件。
- 別bootstrap ticketの競合：active owner 1件。
- owner初回登録11 statementの各failure injection：全件完全rollback。
- owner復旧コードの並列利用：成功1件、旧credential／端末／session／残り旧コードを失効。
- owner復旧13 statementの各failure injection：旧一式を維持して完全rollback。
- 先生作成＋ticket発行3 statementの各failure injection：完全rollback。
- enrollment claimの20並列利用：成功1件。
- 同じclaimからのPIN設定10並列：credentialとpending端末は一組。
- 初回PIN設定3 statement、PIN reset 6 statement、端末承認2 statementの各failure injection：完全rollback。
- 端末失効とPIN解除の競合：失効端末にactive sessionを残さない。
- 誤PIN5並列：回数を取りこぼさず、一時停止中はKDFを再実行しない。
- logout／無操作lock：sessionだけを止め、端末承認は維持。

Cloudflare候補41件、Gate B1回帰168件、合計209件が合格した。

## local workerd 100回比較

Wrangler 4.112.0のlocal workerdで架空PIN／架空pepperだけを使い、各方式の作成・正解照合・不正解照合を100回測定した。数値はWorker handler内の経過時間であり、Cloudflare本番の請求CPU時間を保証する値ではない。

| 方式 | 作成 平均 / p95 | 正解照合 平均 / p95 | 不正解照合 平均 / p95 |
|---|---:|---:|---:|
| PBKDF2-SHA-256 600k | 307.63 / 319 ms | 306.11 / 318 ms | 306.35 / 319 ms |
| 旧scrypt N=2^14,r=8,p=1 | 41.60 / 44 ms | 41.86 / 46 ms | 41.60 / 45 ms |
| 比較scrypt N=2^14,r=8,p=5 | 173.57 / 181 ms | 173.08 / 181 ms | 172.58 / 179 ms |

## 判定

- PBKDF2 600kはWeb Crypto標準APIで実装でき、version付き保存と将来の更新が可能。
- しかしlocal実測はFree HTTP requestの10ms CPU枠を大きく上回る。旧scryptでさえ約42msであり、Free前提の合格根拠にはできない。
- 10msへ合わせる目的でwork factorを下げることは禁止し、安全基準を維持する。
- 外部隔離実測へ進む前に、有料WorkersのCPU枠、別の認証サーバー、またはPIN方式自体の構成変更を比較し、悦子さんの承認を得る必要がある。

## D1／境界確認

- Wrangler local D1へ0001（23 command）と0002（15 command）を順に適用して成功。
- schema version 3、受付系および`test_receptions`に該当するtable 0件。
- source manifest：Gate B1 57 file不変。
- scope check：82 file、routeなし、logs／traceなし、隔離D1 placeholderだけ。
- leak scan：合格。
- bundle dry-run：成功。deploy、Cloudflare login、remote D1通信、resource作成は行っていない。

## 停止

- Cloudflare account、Worker、remote D1、secret、routeを作成しない。
- 正式Site、正式D1、正式Sheets、本番データ、公開、GitHubへ変更しない。
- 次はホスティング／CPU枠の選択肢と試験・停止条件を先に提示し、自動では進まない。
