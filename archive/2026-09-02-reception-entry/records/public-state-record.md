# 2026年9月2日 受付入口 公開状態記録

確認日: 2026-09-01（日本時間）

## 公開入口

- 受付入口: `https://suiyoukai-reception-sheet-test-20260831.c84s4n967v.chatgpt.site/`
- 入口QR画面: `https://suiyoukai-reception-sheet-test-20260831.c84s4n967v.chatgpt.site/entrance-qr`
- 参加QR画面: `https://suiyoukai-reception-sheet-test-20260831.c84s4n967v.chatgpt.site/participation-qr`
- Sites公開設定: `public`
- 公開Sitesバージョン: 11
- 対応するソースコミット: `a8012274bd8fde13847ce419bf6ad6abdf93ddc9`

## 接続状態

- Sites環境には `SHEET_WEBAPP_URL` が設定されていることを確認した。値は保存していない。
- Sites環境には秘密値 `SHEET_WRITE_SECRET` が設定されていることを確認した。値は読み出さず、保存していない。
- Apps ScriptはScript Propertiesから接続先と秘密値を読む構成。
- 公開中Apps Scriptのソース本文を直接読み戻す操作は行っていない。作業時に確認した本番用ソースを別途 `site/google-apps-script/ProductionCode.gs` に保存した。

## データ状態

- Google受付帳: 見出し4列、受付行0件
- D1 `receptions_20260902`: 0件
- D1 `reception_sequences_20260902`: 0件
- 次の実受付番号: `20260902-001`

## GitHub基準点

保存作業開始時の `main` と `origin/main` は、いずれも `1c7a3e2c8c007942ae80f0c87cb7a792d31d06c1` だった。

## 保存時に変更していないもの

- `main` と `origin/main`
- Sitesの公開設定、画面、動作
- D1のスキーマと本番データ
- Apps Scriptのコード、デプロイ、Script Properties
- 印刷済み・公開済みQR
- Google受付帳

この記録には、参加者データ、Googleサービスの内部ID、秘密値を含めていない。
