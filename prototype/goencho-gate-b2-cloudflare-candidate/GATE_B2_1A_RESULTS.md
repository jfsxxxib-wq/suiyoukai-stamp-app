# Gate B2-1A ローカル移植準備結果

実施日：2026-09-18

状態：**ローカル準備は実施済み。外部resource作成へ進める完全合格ではなく、認証書込みtransactionとPIN CPUを未解決として停止。**

## 完了

- Gate B1 source 57 fileを.localなしでcopyし、SHA-256 manifestで元source不変を確認。
- Gate B1 168 testを維持。
- Cloudflare用D1 migration、非同期repository、Fetch handler、Secure Cookie候補を追加。
- 今日・過去・個人、server確定teacher、同日2局、同姓同名、複数先生、重複拒否をD1 adapterで確認。
- Worker／D1／asset bindingのbundle dry-run成功。
- Wrangler local D1へ23 statementのmigration成功。schema version 2、受付系table 0件。
- workers.dev無効、Preview URLなし、routeなし、observability／logs／trace無効をstatic検査。
- secret欠落503、client teacher ID持込み400、session単独拒否、無操作lockを確認。
- source／DB／応答／保存候補のleak scan合格。

## 未解決

1. owner初回登録、復旧、先生登録、PIN設定、端末承認・失効は同期SQLite serviceのままで、D1非同期transactionへ未移植。
2. D1には対話的な同期transactionがないため、条件付きUPDATE／INSERT SELECT／batchへ操作単位で再設計が必要。
3. 現行scrypt-v1は8回平均で作成36.62ms、照合36.54ms。Workers FreeのHTTP request CPU 10ms枠内か確認できず、Free 0円を確定できない。
4. Wrangler 4.134.0のlocal D1は最小SELECT 1でも内部エラー。既知回帰前の4.112.0へ固定し、短い一時pathで成功。
5. Workersの全log面、実際のCPU、Cookie、iPhone／Androidは外部隔離実測前なので未確認。

## Wrangler telemetryの確認

- 最初のWrangler 4.134.0 dry-run 1回は既定の匿名利用統計を送信していた。
- 送信内容はWrangler版、OS／Node版、dry-run実行、端末識別用UUID等。メール、PIN、Cookie、認証header、secret、D1行は含まれていなかった。
- 直後にWRANGLER_SEND_METRICS=falseを強制し、Cloudflare credentialをprocess環境から除外するlocal専用wrapperへ変更した。
- 今回生成された標準保存先の診断log 5件、分離worktree内の診断log／失敗state、架空local D1一時DBは削除済み。
- Cloudflare accountへのlogin、resource作成、deploy、remote D1通信は0件。

## 停止判定

- Cloudflare account、Worker、remote D1、secret、routeを作成しない。
- B2-1Bへは自動で進まない。
- 次は認証書込みD1 adapterとPIN algorithm／CPU試験の範囲・停止条件を先に提示する。
