# 水曜会 現在地

記録日時：2026-09-17 03:51（日本時間）
対象作業：Sites version 11の公開完了、悦子さんの管理画面確認、親GitHubへの記録補完。
引き継ぎ元：`docs/handoffs/2026-09-17-0349-version11管理画面確認GitHub補完準備.md`
対応するhandoff：`docs/handoffs/2026-09-17-0351-version11GitHub記録補完完了.md`
状態：**version 11公開・管理画面確認・親GitHubへの記録補完まで完了。version 11を公開継続。**

## 完了したこと

- version 11とrollback先version 9の保存状態・source・archive・deploymentを再確認。
- 正式D1の公開前基準を取得。
- 悦子さんの承認に基づき、保存済みversion 11だけをproductionへdeploy。
- 公開後に管理画面、対局メモ、2リンク、会員・端末・復旧対象表示を確認。
- 正式D1が公開前後で完全一致することを確認。
- rollback条件へ該当しなかったためversion 9へは戻していない。
- 悦子さんが公開後の管理画面を確認。異常報告なし。
- 今回の対局メモ公開履歴6ファイルだけを親GitHubへcommit・push済み。

## 公開後確認

- deployment：成功。
- 公開URL：従来と同じ。
- 「参加者画面を開く」：正常遷移。
- 「端末復旧QRを発行」：正常遷移。
- コピー専用対局メモ：場所省略で追加、番号付きコピー内容、コピー完了表示を確認。
- 再読み込み後：0件へ戻り、正式保存されないことを確認。
- 管理者画面：正式会員38名、承認済み端末2件、復旧対象3名を確認。
- 正式対局画面：入力欄と一覧表示を確認。確定・訂正は実行していない。
- 正式D1：13テーブル・177行、公開前後で内容完全一致。
- Worker：5xx・例外なし。既知のfavicon 404のみ。

## Git照合

- 親branch：`codex/checkpoint-2026-09-04-passed`
- 親HEAD／`origin/codex/checkpoint-2026-09-04-passed`：`13812588fb6700e8b3f2a5326b54892eff6d9496`
- 親`origin/main`：`82013b5f8a1e5974601a6c212f34065c8de60bcd`
- 正式リーグsource branch：`main`
- 正式リーグsource HEAD／`origin/main`：`5479b578fb182fe481e43e03960982bd9239e23e`
- 正式リーグsource worktree：clean。
- 親GitHub補完commit `13812588fb6700e8b3f2a5326b54892eff6d9496`を同名remote branchへpush済み。
- 親worktreeの他案件は保存対象外とし、上記commitへ含めていない。

## 公開・本番データ

- 水曜会リーグ：version 11公開中。
- version 9：rollback先として保存済み。
- version 10：保存済みだが非公開。再deployしない。
- 水曜会ポータル：version 19公開中、変更なし。
- 今回、正式D1、本番データ、migration、正式スプレッドシート、Apps Scriptへの書き込みなし。
- GitHub補完工程で公開・本番データ・外部サービスは変更していない。

## 次回の安全な再開地点

- version 11を通常運用し、悦子さんの実機で対局メモを使う。
- 実機で2リンク、対局メモ、既存正式対局に異常が出た場合は、その時点の本番データを読み取り確認してversion 9 rollbackを検討する。
- 正式対局の確定・訂正は、実際に登録する対局がある時だけ通常運用として行う。

## 触らない

- 正式D1、本番データ、migration、正式スプレッドシート、Apps Scriptへの検証目的の書き込み。
- version 10の再deploy。
- 画面確認専用routeの正式source混入。
- 期限切れ復旧ticketの再利用、本人不在での新QR発行。
- 今回の記録6ファイル以外を含む親リポジトリのcommit・push、PR、merge、main。
- 秘密値、PIN、pepper、token、実人物の行本文。
