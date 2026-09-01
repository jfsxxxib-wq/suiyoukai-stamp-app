# 2026年9月2日 受付入口のソース保存記録

## 保存の目的

2026年9月2日に使う「アプリ読み取りQR入口／受付入口」の承認待ち状態を、公開中の仕組みとは切り離してGitHubへ保管する。
この保存物は記録用であり、デプロイ、データ接続、QR差し替えを行うものではない。

## 保存元

- 保存日: 2026-09-01（日本時間）
- 公開入口: `https://suiyoukai-reception-sheet-test-20260831.c84s4n967v.chatgpt.site`
- 公開Sitesバージョン: 11
- 保存元のソースコミット: `a8012274bd8fde13847ce419bf6ad6abdf93ddc9`
- 保存対象: 受付画面、受付API、参加QR画面、D1スキーマとマイグレーション、Apps Script本番用ソース

## 含めたもの

- `app/`: 受付入口、入口QR、参加QR、受付API
- `db/` と `drizzle/`: D1の定義と変更履歴
- `google-apps-script/ProductionCode.gs`: Script Propertiesから設定を読む本番用ソース
- ビルド設定、依存関係、共通部品、公開用画像
- `.env.example` と `.openai/hosting.example.json`: 値を伏せた設定例

## 意図的に含めていないもの

- `.env.local` と実際の環境変数値
- Sitesの内部プロジェクトIDを含む `.openai/hosting.json`
- GoogleスプレッドシートID、Apps Script内部ID、秘密鍵、書き込み用シークレット
- テスト用シートIDが書かれた旧 `google-apps-script/Code.gs`
- 参加者名、受付番号などの本番データ
- `node_modules/`、ビルド生成物、キャッシュ

## 注意

`drizzle/` は実施済みの変更履歴を記録するための保存物で、リセット用マイグレーションも含む。別環境へそのまま実行せず、適用先と内容を人が確認する。

Apps Scriptの公開中デプロイからソース本文を直接読み戻す操作は行っていない。ここには、公開設定に使った作業ファイルとして確認済みの `ProductionCode.gs` を保存した。公開デプロイやScript Propertiesには変更を加えていない。
