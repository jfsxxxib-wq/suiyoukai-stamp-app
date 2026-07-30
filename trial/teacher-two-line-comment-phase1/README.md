# 先生2行コメント・第1段階 ローカル基礎実装

## 位置づけ

このフォルダーは、「先生1人の2行コメント」第1段階のうち、次の基礎だけを分離して確認するためのローカル試験用ソースである。

- 試験環境の設定値を読み書きの前に検査する構造
- 2行コメントの純粋な入力検証
- 試験用IDと接頭辞付きUUIDv4の形式検証
- ローカルとGoogle Apps Scriptで同じ検証関数を使用する構造

Google側のApps Scriptプロジェクト、スプレッドシート、Script Properties、デプロイは、まだ作成しない。

## 試験専用名称

作成が別途承認された場合の名称は次の形式とする。

```text
Apps Script:
【試験専用・本番接続禁止】先生2行コメント 第1段階 GAS YYYY-MM-DD

スプレッドシート:
【試験専用・本番接続禁止】先生2行コメント 第1段階 シート YYYY-MM-DD

環境ID:
teacher-two-line-comment-phase1-YYYYMMDD-A

試験用先生ID:
trial-teacher-001
```

再試験では、以前の環境を再利用せず、環境ID末尾を`B`または`C`に変更する。

## ファイル

- `apps-script/TextValidation.gs`
  - NFC、禁止文字、前後空白、拡張書記素クラスタ、2行条件を検証する純粋関数
- `apps-script/IdValidation.gs`
  - 試験用先生ID、環境ID、接頭辞付きUUIDv4を検証する純粋関数
- `apps-script/EnvironmentGuard.gs`
  - 設定値だけを調べる純粋関数と、Advanced Sheets Serviceによる読み取り専用のメタデータ取得を分離
- `apps-script/FoundationSelfTest.gs`
  - Apps Script上で後日実行する、書き込みを伴わない自己試験
- `apps-script/appsscript.json`
  - V8、`Asia/Tokyo`、スプレッドシート読み取り専用権限、Advanced Sheets Service v4
- `tests/validation-cases.json`
  - ローカル共通確認データ
- `tests/run-foundation-validation.cjs`
  - `.gs`の実装を直接読み込み、同じ関数をローカル実行

## ローカル確認

リポジトリのルートで次を実行する。

```powershell
node trial/teacher-two-line-comment-phase1/tests/run-foundation-validation.cjs
```

通常は、PATHで利用できる`node`を使って実行する。`node`がPATHにない場合は、作業環境で利用可能であることを確認済みのNode.js実行ファイルを使用する。端末固有の絶対パスは、リポジトリ内のファイルへ記録しない。

文字検証・ID検証は、Apps Script用の実際の`.gs`実装をローカル試験から直接読み込んで確認する。環境ガードは、模擬した`PropertiesService`、`Session`、`Sheets.Spreadsheets.get`を使用して確認する。外部サービスへは接続せず、不正な環境IDや`INCONSISTENT`・`ARCHIVED`の停止状態では、`Sheets.Spreadsheets.get`へ到達しないことも試験する。

Advanced Sheets Serviceは`appsscript.json`の`enabledAdvancedServices`で有効化する。Google側の作業が別途承認された後、Apps ScriptエディタでGoogle Sheets API v4がサービス`Sheets`として認識されていることを確認する。OAuthスコープは`https://www.googleapis.com/auth/spreadsheets.readonly`だけとし、書き込み権限は追加しない。

## 環境ガードの順序

1. Script Propertiesを読み取る
2. スクリプトのタイムゾーンを読み取る
3. 設定値を純粋関数へ渡す
4. `ENVIRONMENT_STATUS = ACTIVE`を確認する
5. 環境ID、接続先ID、期待する試験専用名称を確認する
6. すべて合格した場合だけ、Advanced Sheets Serviceで`properties.title`だけを取得する
7. 応答、`properties`、空でない文字列の`properties.title`を検査する
8. 実際のタイトルと期待する完全な名称を照合する

`INCONSISTENT`、`ARCHIVED`、未設定、不正形式では、Advanced Sheets Serviceを呼び出さない。

## 今回実装しないもの

- `create_draft`などの保存・状態変更操作
- セル更新、シート作成、履歴追記
- `ScriptLock`を使う更新処理
- WebアプリのGET・POST入口
- 公開API
- `get_integrity_status`
- `request_id`の結果照会
- Webアプリ設定とデプロイ
- 本番URL、本番ID、通常アプリ接続

## 未決定の不可視書式文字

ゼロ幅スペース、文字方向制御記号、その他の不可視書式文字は、承認済み文書に明確な許可・拒否規則がない。今回の検証では、新しい判断を追加しない。

明示的に拒否するのは、改行、行区切り、段落区切り、タブ、C0・C1制御文字、不正な単独サロゲートだけである。正常な結合文字、ZWJ、バリエーションセレクタは拒否しない。
