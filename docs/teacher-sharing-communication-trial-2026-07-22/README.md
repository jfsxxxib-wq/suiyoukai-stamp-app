# 一局のご縁帳 最小通信試験（未公開）

GitHub PagesとGoogle Apps Script間のPOST、返却JSON、リダイレクト、CORS、重複防止を、ダミーデータだけで確認するための独立試験です。

## 分離条件

- 通常アプリからリンクしない
- 本番データ、受付番号、参加者名、先生IDを使用しない
- Googleフォームとスプレッドシートへ接続しない
- Apps Script URLをファイル、クエリ文字列、localStorageへ保存しない
- `deviceId` を本人確認に使わない
- `no-cors` を使わない

## 予定ファイル

- `index.html`: 試験専用画面
- `styles.css`: 試験画面だけのスタイル
- `trial.js`: ダミーPOSTと安全な結果表示
- `apps-script/Code.gs`: 未デプロイの試験受付処理案
- `apps-script/appsscript.json`: Apps Scriptの最小マニフェスト

## パソコン確認手順（デプロイ前）

1. ローカルHTTPサーバーでこのフォルダーを表示する。
2. 画面に「試験専用・本番データ未接続」が表示されることを確認する。
3. URL欄が空で、ページ再読込後も空のままであることを確認する。
4. ダミーJSONに受付番号、名前、先生IDがないことを確認する。
5. URL未入力で各送信ボタンを押し、安全な案内だけが表示されることを確認する。
6. 通常試験と応答遅延試験を切り替え、実在情報が現れないことを確認する。
7. ブラウザーの開発者画面で、通常アプリの保存領域を読み書きしていないことを確認する。

## デプロイ後に行う通信確認（今回は対象外）

1. 試験専用Apps Script URLを画面へ手入力する。
2. `application/json` で送信する。
3. 同じ本文を `text/plain;charset=UTF-8` で送信する。
4. `accepted` と、二回目の `duplicate: true`、名前空間内の `storedCount: 1` を確認する。
5. 送信順を公平に比較する場合は、削除対象キーを一覧確認して試験名前空間を削除し、逆順で行う。
6. 応答遅延用ダミーデータで応答を打ち切り、同じ`recordId`の再送で`accepted`が返ることを確認する。

## 削除手順（デプロイ後）

1. `CLEANUP_TEST_RUN_ID`が対象の試験用IDだけを指すことを確認する。
2. Apps Scriptエディターから`prepareConfiguredTrialDeletion`を実行する。
3. 実行ログの対象キー一覧が、指定した試験用`testRunId`だけであることを人が確認する。
4. ログの確認トークンを`CLEANUP_CONFIRMATION_TOKEN`へ一時入力する。
5. 10分以内に`deleteConfiguredTrialData`を実行し、直後にトークンを空欄へ戻す。
6. 一覧確認後にキーが変化した場合、削除は中止される。もう一度一覧確認から始める。

結果画面は、許可した項目だけを表示します。受信本文、例外文、Apps Script内部情報はそのまま表示しません。
