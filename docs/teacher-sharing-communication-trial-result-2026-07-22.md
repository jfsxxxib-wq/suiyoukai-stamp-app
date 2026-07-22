# 一局のご縁帳 最小通信試験 結果記録

試験日時: 2026年7月22日 20:13:03〜20:18:01  
記録日: 2026年7月22日

## 試験名

一局のご縁帳 最小通信試験（ダミーデータ専用）

## 目的

通常アプリや本番データへ接続する前に、独立した試験用Google Apps ScriptへダミーJSONを送信し、次の最小条件を確認する。

- 正常なダミーデータを1件だけ保存できること
- 同じデータを再送しても二重保存されないこと
- 規則に合わないダミーデータが保存されないこと
- Apps ScriptのJSON返却とリダイレクトを送信側で受け取れること

## 試験環境

- パソコン: Windows
- 送信環境: Node.js `v24.14.0`
- 送信方法: Node.js標準の`fetch`
- HTTPメソッド: `POST`
- Content-Type: `application/json`
- リダイレクト: `redirect: "follow"`
- タイムアウト: 15秒
- 自動リトライ: なし
- 受信環境: 試験専用Google Apps Scriptウェブアプリ
- Apps Scriptプロジェクト: `一局のご縁帳 最小通信試験 2026-07-22`
- デプロイ: ウェブアプリ、バージョン1
- 実行ユーザー: プロジェクト所有者
- アクセスできるユーザー: 全員
- 保存先: 試験用Apps Scriptのスクリプト プロパティ
- 通常アプリ、Googleフォーム、Googleスプレッドシート: 未接続

試験終了時点でも試験用デプロイは有効であり、試験データ1件は削除せず残している。

## 使用したダミーデータ

### 正常保存・重複判定

```json
{
  "schemaVersion": 1,
  "testRunId": "pages-gas-trial-20260722-A",
  "requestId": "request-001",
  "recordId": "trial-record-001",
  "deviceId": "trial-device-desktop",
  "sentAt": "2026-07-22T10:00:00+09:00"
}
```

### invalid_request判定

正常データから`recordId`だけを試験用規則に合わない値へ変更した。

```json
{
  "schemaVersion": 1,
  "testRunId": "pages-gas-trial-20260722-A",
  "requestId": "request-001",
  "recordId": "invalid-record-002",
  "deviceId": "trial-device-desktop",
  "sentAt": "2026-07-22T10:00:00+09:00"
}
```

実在する受付番号、参加者名、先生ID、本番の端末識別子は使用していない。

## 正常保存試験の結果

- HTTP状態: `200 OK`
- Content-Type: `application/json; charset=utf-8`
- Apps Scriptの返却URLへのリダイレクト: あり
- JSON解析: 成功
- Apps Scriptの`doPost`: 完了
- 実行開始: 2026年7月22日 20:13:03
- 実行時間: 1.505秒

返却された生の本文:

```json
{"result":"accepted","recordId":"trial-record-001","stored":true,"duplicate":false,"storedCount":1}
```

結果は予定どおりであり、`trial-record-001`が1件保存された。

## 重複判定試験の結果

正常保存試験と完全に同じJSONを、同じNode.jsの方法で1回だけ再送した。

- HTTP状態: `200 OK`
- JSON解析: 成功
- Apps Scriptの`doPost`: 完了
- 実行開始: 2026年7月22日 20:15:33
- 実行時間: 0.676秒

返却された生の本文:

```json
{"result":"accepted","recordId":"trial-record-001","stored":false,"duplicate":true,"storedCount":1}
```

`stored`は`false`、`duplicate`は`true`となり、スクリプト プロパティは1件のままだった。既存の`firstRequestId`と`firstReceivedAt`も変更されなかった。

## invalid_request試験の結果

`recordId`を`invalid-record-002`へ変更した不正なダミーJSONを1回だけ送信した。

- HTTP状態: `200 OK`
- JSON解析: 成功
- Apps Scriptの`doPost`: 完了
- 実行開始: 2026年7月22日 20:18:01
- 実行時間: 0.455秒

返却された生の本文:

```json
{"result":"invalid_request"}
```

返却JSONには不正理由や項目名は含まれない。`invalid-record-002`の保存キーは作成されず、スクリプト プロパティは1件のまま、既存の`trial-record-001`も変更されなかった。

## PowerShellからNode.jsへ変更した経緯

最初はWindows PowerShellの`Invoke-WebRequest`を使用し、`application/json`、最大10回のリダイレクト、30秒タイムアウトで送信した。しかし「接続が切断されました: 受信時に予期しないエラーが発生しました」となり、HTTP状態を取得できなかった。

このときApps Scriptの実行履歴に`doPost`はなく、スクリプト プロパティも0件だった。そのため、保存処理ではなくApps Scriptへ到達する前の送信側通信処理が原因である可能性が高いと判断した。同じPowerShell方式のGETでも同じエラーが再現し、TLS 1.2と基本解析を明示しても改善しなかった。

一方、ブラウザーとNode.jsのGETでは試験用URLからHTTP `200 OK`を取得できた。送信方法をNode.js標準の`fetch`へ変更し、`redirect: "follow"`、15秒タイムアウト、自動リトライなしで実行したところ、1回のPOSTでApps Scriptの`doPost`が完了し、JSON返却も取得できた。

Apps Scriptの`ContentService`は正常な本文を`script.googleusercontent.com`の一時URLから返す。Node.jsの送信ではこのリダイレクトを追従できた。

## Apps Script側の保存件数

試験終了時点のスクリプト プロパティは1件。

- キー: `teacherSharingCommTrial:pages-gas-trial-20260722-A:record:trial-record-001`
- `testRunId`: `pages-gas-trial-20260722-A`
- `recordId`: `trial-record-001`
- `deviceId`: `trial-device-desktop`
- `firstRequestId`: `request-001`
- `firstReceivedAt`: `2026-07-22T11:13:03.831Z`

重複判定と`invalid_request`判定の後も、この1件の内容は変わっていない。

## 通常アプリや本番データへの影響

- 通常アプリのファイルは変更していない。
- 通常アプリから試験用URLへ接続していない。
- 本番データ、受付番号、参加者名、先生IDを送信していない。
- GoogleフォームとGoogleスプレッドシートへ接続していない。
- 未追跡のローカル保管物を変更していない。
- GitHubへのコミット、プッシュ、マージを行っていない。
- 保存は試験専用Apps Scriptの名前空間内だけで行った。

## 今回確認できたこと

- 有効なダミーJSONを1件保存できる。
- 同じ`recordId`の再送を重複と判定し、二重保存しない。
- 不正な`recordId`を`invalid_request`として拒否し、保存しない。
- 保存件数を試験用`testRunId`の名前空間内だけで数えられる。
- Apps Scriptの`doPost`が各試験で正常完了する。
- Node.jsの`fetch`でApps Scriptの返却リダイレクトを追従し、JSON本文を取得できる。
- 生のレスポンス本文を確認してからJSONとして解析できる。
- 通信試験が通常アプリと本番データから分離されている。

## 今回まだ確認していないこと

- `text/plain;charset=UTF-8`での送信
- GitHub Pages上の試験画面からApps Scriptへ送る場合のCORSとリダイレクト
- 応答遅延、受信打ち切り、その後の同一`recordId`確認
- 同時送信時のScript Lockと一時エラー
- スマートフォンや水曜会で使用予定の端末からの通信
- 通常アプリとの接続
- 本番の受付番号、参加者名、先生IDを用いた処理
- Googleフォーム、Googleスプレッドシートとの接続
- 先生本人確認と先生ページへの反映
- 試験データの削除手順の実行
- 試験用デプロイのアーカイブとURL停止

`doGet`は実装していないため、試験用URLをブラウザーでGETすると「スクリプト関数が見つかりません: doGet」と表示される。GETエラー表示は確認済みだが、正常なGET受付は未実装である。

## 次の段階へ進む前の注意点

1. 現在の安定状態を優先し、今回未確認の項目を一度に広げない。
2. 試験用URLを通常アプリへ接続する前に、GitHub Pagesまたは実際のブラウザー環境からのCORS確認を行う。
3. 送信側はApps Scriptのリダイレクトを必ず追従し、タイムアウトを設ける。
4. 応答が不明な場合でも新しい記録を作らず、同じ`recordId`で結果を確認できる設計を維持する。
5. 自動リトライを追加する場合は、重複防止と利用者への表示を先に確認する。
6. 本番データや本人確認へ進む前に、受付番号の照合、保存項目、閲覧権限、削除手順を別途確認する。
7. 試験終了時は、対象キー一覧と確認トークンを人が確認してから試験データを削除し、その後に試験用デプロイをアーカイブする。
8. 現在残っている試験データ1件と有効なデプロイを、意図せず本番用途に使わない。

## 判定

今回の最小通信試験で予定した3項目は、すべて合格。

- 正常なダミーデータの保存: 合格
- 同一データの重複防止: 合格
- 不正なダミーデータの拒否: 合格
