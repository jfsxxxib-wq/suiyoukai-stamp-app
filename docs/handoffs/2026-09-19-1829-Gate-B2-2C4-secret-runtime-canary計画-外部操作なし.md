# Gate B2-2C4 secret／runtime canary計画・外部操作なし handoff

記録日時：2026-09-19 18:29（日本時間）

## 結論

secret／runtime canaryを、目的、固定対象、禁止書込み、停止条件から別計画化した。実行はHOLD。最初のruntime canaryは`GET /api/health`だけの配線確認とし、D1 write 0で停止する。

## 請求情報

- 税込：5.50 USD
- 税率：10%
- 税抜相当：5.00 USD
- 毎月、18日請求
- 悦子さん確認値として確定し、未解決事項から除外した。

## 現在地

- 隔離Worker：作成済み、外部入口なし、現行runtime実行なし。
- D1 binding：`GOENCHO_DB`設定済み。
- 隔離D1：version 3、business rows 0。
- migration：`0001`／`0002`で完了、`0003`なし。
- Token：0。
- Cloudflare通信：0。

## 重要な未接続

先生ページUIとローカル認証導線は合格済みだが、Cloudflare Worker HTTP entrypointはhealthと対局読取りだけ。owner／先生のstate、登録、PIN、承認、失効、再認証routeは未接続である。

そのため、full teacher runtime canaryより先にB2-2C4-1でWorker HTTP parityをoffline接続する。

## 固定対象

- Worker：`goencho-b2-canary-202609`
- D1：`goencho-b2-canary-db-202609`
- binding：`GOENCHO_DB`
- runtime secret名：owner PIN pepper、teacher PIN pepper、device HMAC、session HMAC、recovery pepperの5件
- 基準checkpoint：`94131e1c65ee2ce41f453d42487a7852b76a1842`

secret値は未生成・未入力・未保存。一時入口access gate方式も未確定のためHOLD。

## 残工程

- ローカルの画面・機能：完成済み。
- Cloudflare隔離環境での完成：あと6工程。
- 正式利用可能な完成：あと9工程。

最初の6工程は、Worker HTTP parity、bundle／runner固定、secret＋入口なしdeploy、health canary、synthetic先生導線canary、閉鎖・checkpoint。正式利用にはさらに正式計画、限定deploy、公開／実機確認の3工程が必要。

## 今回行っていないこと

- candidate／Worker code／runner変更。
- Token、secret、deploy、route、一時入口、runtime request。
- D1 read／write、synthetic data、restore。
- Git commit／push／PR／`main`変更。
- 正式resource、本番data、公開変更。

## 次回の安全な再開地点

B2-2C4-1として、未接続のowner／先生HTTP routeをWorkerへoffline接続し、local serverとのstatus、response、Cookie、Origin、transaction parityをfixtureで確認する計画・実装範囲を提示する。別承認までは実装も外部操作も行わない。

## 触らない

- Token、secret値、Cloudflare API、Worker deploy、runtime request、一時入口。
- D1 write、migration、restore、synthetic data。
- 正式resource、本番data、route、公開、Logs／Traces。
- Git commit／push／PR、GitHub `main`。
