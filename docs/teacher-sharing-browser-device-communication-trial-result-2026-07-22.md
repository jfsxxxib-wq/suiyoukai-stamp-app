# 先生ページ ブラウザー・iPhone実機通信試験 結果記録

- 試験日: 2026年7月22日
- 対象: 独立した試験HTMLと試験用Google Apps Scriptウェブアプリ
- 使用データ: 試験専用ダミーデータのみ
- 判定: パソコンブラウザー、iPhone実機ともに正常保存を確認

## 試験目的

通常アプリへ接続する前に、独立した試験ページから試験用Google Apps Scriptへブラウザー経由でPOSTし、次を確認することを目的とした。

- パソコンのブラウザーから正常に送信・保存・応答取得できること
- iPhone実機から正常に表示・送信・保存・応答取得できること
- ブラウザーのクロスオリジン通信でCORSやリダイレクトが妨げにならないこと
- 二重操作、自動再送、タイムアウトに対する安全設計が組み込まれていること
- 通常アプリや本番データから分離された状態を維持すること

## 独立した試験HTMLの構成

試験ページは次の1ファイルで構成した。

`tests/manual/teacher-sharing-browser-communication-trial-2026-07-22.html`

- CSSとJavaScriptをHTML内に含む単一ファイル
- 通常アプリのHTML、CSS、JavaScriptから読み込まれない独立構成
- Apps Script URLはファイルに固定せず、試験時だけ画面へ入力
- 入力したURLを`localStorage`、`sessionStorage`、Cookieへ保存しない
- Apps Script URLや一時的な転送URLをログや結果欄へ出力しない
- ページの初期表示や再読み込みだけでは通信しない
- 固定された試験用ダミーデータ以外を送信できる入力欄を設けない
- JSON解析前の生のレスポンス本文も画面に表示
- 成功、重複、通信失敗、タイムアウト、予定外の応答を文章と色の両方で区別

## 送信設計

- HTTPメソッド: `POST`
- Content-Type: `text/plain;charset=UTF-8`
- 本文: JSON文字列
- リダイレクト: `redirect: "follow"`
- タイムアウト: `AbortController`による15秒
- `fetch`の実行: ボタン操作1回につき1回だけ
- 自動再送・自動リトライ: なし
- 二重送信防止: 送信中のボタン無効化と`inFlight`フラグの二重構成

`text/plain;charset=UTF-8`を使用することで、`application/json`指定時に発生し得るCORSプリフライトを避けながら、Apps Script側では受信本文をJSONとして解析する構成とした。

## パソコンブラウザーでの正常保存結果

### 送信したダミーデータ

```json
{
  "schemaVersion": 1,
  "testRunId": "pages-gas-trial-20260722-A",
  "requestId": "request-002",
  "recordId": "trial-record-002",
  "deviceId": "trial-device-browser-pc",
  "sentAt": "2026-07-22T12:19:37.289Z"
}
```

### 結果

- HTTP状態: `200`
- Content-Type: `application/json; charset=utf-8`
- JSON解析: 成功
- result: `accepted`
- recordId: `trial-record-002`
- stored: `true`
- duplicate: `false`
- storedCount: `2`
- 画面判定: 「正常保存」
- 追加送信: なし

生のレスポンス本文:

```json
{"result":"accepted","recordId":"trial-record-002","stored":true,"duplicate":false,"storedCount":2}
```

文字切れ、重なり、横スクロールは確認されなかった。

## iPhone実機での正常保存結果

### 表示確認

- 同じWi-Fi内のiPhoneから試験ページを表示できた
- 注意表示、URL入力欄、ダミーデータ、送信ボタン、初期判定を確認できた
- URL入力前の初期判定は「未送信」だった
- 文字の重なりや横スクロールはなく、長い値は縦方向に折り返された

### 送信したダミーデータ

```json
{
  "schemaVersion": 1,
  "testRunId": "pages-gas-trial-20260722-A",
  "requestId": "request-003",
  "recordId": "trial-record-003",
  "deviceId": "trial-device-browser-smartphone",
  "sentAt": "2026-07-22T13:22:39.610Z"
}
```

### 結果

- HTTP状態: `200`
- Content-Type: `application/json; charset=utf-8`
- JSON解析: 成功
- result: `accepted`
- recordId: `trial-record-003`
- stored: `true`
- duplicate: `false`
- storedCount: `3`
- 画面判定: 「正常保存」
- 追加送信: なし

生のレスポンス本文:

```json
{"result":"accepted","recordId":"trial-record-003","stored":true,"duplicate":false,"storedCount":3}
```

## CORSとリダイレクト

パソコンブラウザーとiPhone実機の両方で、`text/plain;charset=UTF-8`のPOST後にApps ScriptのJSON応答を読み取ることができた。今回使用したローカル試験ページ、試験用Apps Script、ブラウザーの組み合わせでは、CORSやApps Scriptのレスポンス転送による問題は発生しなかった。

この結果は今回の試験環境に対する確認であり、GitHub Pagesなど別の公開元からの通信まで確認したものではない。

## 試験用データの件数

iPhone実機試験の正常保存後、Apps Scriptの応答は`storedCount: 3`を返した。試験用名前空間の保存件数は3件となった。

- `trial-record-001`: Node.jsによる最初の正常保存試験
- `trial-record-002`: パソコンブラウザーによる正常保存試験
- `trial-record-003`: iPhone実機による正常保存試験

本記録作成時点では、これらの試験データは削除していない。

## 通常アプリや本番データへの影響

- 通常アプリのHTML、CSS、JavaScriptは変更していない
- 通常アプリから試験用Apps Scriptへ接続していない
- 本番の受付番号、参加者名、先生ID、本番データを使用していない
- Googleフォームへ接続していない
- Googleスプレッドシートへ接続していない
- 保存先は試験用Apps Scriptのスクリプト プロパティだけである
- GitHubへのコミット、プッシュ、公開を行っていない

## ローカルネットワークと終了時の整理

スマートフォン試験では、パソコンとiPhoneを同じWi-Fiへ接続した。Windowsの対象Wi-Fiネットワークプロファイルを`Private`へ変更した。

ローカルサーバーはWi-FiのIPv4アドレスだけにバインドし、公開対象を`tests/manual/`だけに限定した。通常アプリは公開対象に含めなかった。

接続確認のため、次の条件に限定した一時ファイアウォール規則を作成した。

- プロファイル: `Private`のみ
- 接続元: `LocalSubnet`のみ
- プロトコル: TCP
- ポート: 8765番のみ
- 対象プログラム: 試験用ローカルサーバーを実行したPython

試験終了後に次を確認した。

- 試験専用ローカルサーバープロセスを停止
- TCP 8765番の待受を解放
- 今回作成した一時ファイアウォール規則を削除
- 以前から存在するPython用ファイアウォール規則は変更していない

## 今回確認できたこと

- 独立した試験HTMLがパソコンとiPhoneで表示できる
- ページ表示や再読み込みだけではApps Scriptへ送信しない
- パソコンブラウザーからダミーデータ1件を正常保存できる
- iPhone実機からダミーデータ1件を正常保存できる
- `text/plain;charset=UTF-8`でJSON文字列を送信できる
- Apps ScriptのJSON応答と生の本文をブラウザーで取得できる
- 今回の環境ではCORSとリダイレクトに問題がない
- 成功応答を画面上で「正常保存」と判定できる
- 送信中の二重操作防止、自動再送なし、15秒タイムアウトがコードに実装されている
- 通常アプリと本番データから分離して試験できる

## まだ確認していないこと

- GitHub Pagesなど本番に近い公開元からApps Scriptへ送る場合のCORSとリダイレクト
- ブラウザー画面から同一`recordId`を意図的に再送した場合の重複表示
- 実際にネットワークを切断して「通信失敗」表示を発生させる試験
- 実際に15秒を超過させて「タイムアウト」表示を発生させる試験
- 通信失敗またはタイムアウト後に、Apps Script側で保存されたかを照合する手順
- 同時送信時のScript Lockと競合動作
- Android端末や別バージョンのモバイルブラウザー
- 通常アプリとの接続
- 本番の受付番号照合、参加者、先生ID、本人確認、閲覧権限
- Googleフォーム、Googleスプレッドシートとの接続
- 本番運用時のApps Scriptアクセス制御とセキュリティ設計
- 試験データ3件の削除
- 試験用Apps Scriptデプロイの停止またはアーカイブ

## 判定

パソコンブラウザーとiPhone実機の正常保存試験は、いずれも合格とする。通常アプリへ接続する前のブラウザー通信経路について、今回のローカル試験環境では正常に動作することを確認した。
