# Gate B2-2C4-1 Worker HTTP parity offline実装結果

実施日時：2026-09-19 19:03（日本時間）

状態：**PASS／結果提示でSTOP。candidate正本、GitHub、B2-2C4-2、Cloudflare、Token、secret、本番データは変更していない。**

## 実装場所

- 追跡外一時コピー：`tmp/goencho-b2-2c4-1-worker-http-parity-20260919-offline/`
- `.gitignore`の`tmp/`によりGit非追跡。
- 作成直後はcandidate正本とソース木SHA-256が一致した。
- candidate正本の開始時／終了時ソース木SHA-256：`7726318580E2671484E15B3B751E53A8CAC928D28653C7283A3F64C96B6F05C6`。

## 実装内容

- UIを`/owner/`、`/teacher/`、共通assetを`/shared/`へ分離した。
- APIを`/api/owner/*`と`/api/teacher/*`へ分離し、旧非namespace APIをWorkerから除外した。
- owner state、bootstrap、recovery、unlock、logout、先生登録、端末一覧、approve／reject／revokeを接続した。
- teacher state、claim、set-pin、status、unlock、logout、今日／過去日／個人読取りを接続した。
- D1 auth facadeへowner session actor、owner logout、owner／teacher state、teacher device一覧のread境界を追加した。
- owner／teacher各device・sessionの4 Cookie名を分離した。deviceだけMax-Age、sessionはbrowser session、clearはMax-Age=0とした。
- 複数`Set-Cookie`を独立headerとしてappendする実装にした。
- local server、public UI、既存fixtureも同じcanonical namespaceへ揃えた。
- 自己完結manifestを115ファイルへ更新した。

candidateとの差分は23ファイルで、うち新規は`cloudflare/tests/09-worker-http-parity.test.mjs`の1ファイル。migration、schema、package依存、wrangler resource設定は変更していない。

## fixture結果

- F01〜F10：11／11 PASS、skip／todo 0。
- 実D1互換DBでowner初回登録→先生登録→pending→owner承認→先生unlock→activeまでPASS。
- bindingおよび5 secretの各欠落／短値はdownstream 0で503。
- role別route／asset、request security、4 Cookie、独立`Set-Cookie`、actor分離、read-only matchを確認した。
- 既存D1 auth transaction 19件の20並列、failure injection、競合試験を維持した。

## 回帰・静的確認

- B1：168／168 PASS。
- Cloudflare：72／72 PASS（既存61＋新規11）。
- 合計：240／240 PASS。
- Node構文：変更した主要7ファイル PASS。
- scope check：111 files PASS。
- leak scan：runtime secret marker 10件の漏えい0。
- source manifest：115 files PASS。
- `0001` SHA-256：`0EAADB9E1A72D1947414F50A45073D0B00FD8E33DE8267E15288D10A2F6194ED`、不変。
- `0002` SHA-256：`1391CCC7B0599C7B22191DD4BD8F801BA3218218E3D989D0199D164DE48D676C`、不変。

## 隔離確認

- candidate正本：変更0。終了時ソース木hashは開始時と一致。
- Gate B2 HEAD：`94131e1c65ee2ce41f453d42487a7852b76a1842`、変更なし。
- Gate worktree status：従来どおり`?? prototype/`だけ。
- localhost 4191／4192／63496 listener：終了時0。
- Cloudflare通信、Token作成、secret実値、remote D1、deploy、runtime request：0。
- Git add／commit／push／PR／main変更：0。
- 正式Site、正式D1、正式Sheets、本番データ：変更0。

## 停止点

B2-2C4-1は追跡外一時コピーでoffline PASSした。candidate正本への反映、GitHub checkpoint、B2-2C4-2 bundle／runner、secret、runtime canary、route／公開は別計画・別承認とする。
