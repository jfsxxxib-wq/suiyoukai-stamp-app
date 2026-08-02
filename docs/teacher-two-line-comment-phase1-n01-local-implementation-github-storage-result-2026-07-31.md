# 先生2行コメント・第1段階 N-01ローカル判定 GitHub保管完了記録

## 記録情報

- 記録日：2026年7月31日
- 対象：先生一人の二行コメント設計・N-01
- 状態：第9・第10議題承認、ローカル実装・専用試験・GitHub保管完了
- Pull Request：[#24](https://github.com/jfsxxxib-wq/suiyoukai-stamp-app/pull/24)
- Google統合：未実装
- Google試験環境：未変更
- `INCONSISTENT`：安全停止状態を維持

## 今回完了したこと

1. 第9議題として、既存の `draft` または `pending_review` がある場合のN-01安全動作を決定した。
2. 第10議題として、「要求処理結果」シートを含む将来の3シート整合性、処理順序、事故記録、試験方針を決定した。
3. Googleへ接続しないローカル範囲で、N-01の判定処理、要求指紋、API返却、自己試験を実装した。
4. 基礎試験とN-01専用試験を合格させた。
5. 指定8ファイルだけをコミットし、PR #24としてGitHubへ保管した。
6. PR #24を通常のMerge pull request方式で `main`へマージした。
7. ローカル `main`を `origin/main`へfast-forwardで同期した。
8. 作業ブランチをローカル・リモートの両方から非強制で削除した。

## N-01の承認済み安全動作

- 通信上の同一要求は `duplicate`として最初の確定結果から返す。
- 同じ `request_id`に異なる内容が届いた場合は `invalid_request`とする。
- 同じ先生に未完了コメントが複数ある場合は、どれかを選ばず安全停止する。
- 未完了コメントが1件の場合は新しい下書きを作らず、`existing_comment`へ進む。
- `existing_comment`で `commentId`、`versionNo`、`status`を返すのは、認証済みの先生と既存コメントの先生が一致する場合だけとする。
- 既存本文、版番号、履歴は変更しない。
- 複数件検出時の安全な理由コードは `multiple_open_comments`とする。
- 事故記録へ本文、接続先情報、シート行番号を入れない。

先生への案内は状態別に次のとおりとする。

- `draft`：作成途中のコメントがあることを案内し、保存済みコメントを開いて続けてもらう。
- `pending_review`：確認依頼中のコメントがあることを案内し、確認結果を待ってもらう。

## 第10議題で決定した将来のGoogle統合条件

- 「コメント現在値」「コメント変更履歴」「要求処理結果」の3シートを一組として扱う。
- 書き込みは同じ `ScriptLock`内で扱う。
- 新規下書き作成時は、将来の `spreadsheets.batchUpdate` 1回による不可分な保存を前提とする。
- 保存後に読み直して完全一致を確認するまで、成功結果を返さない。
- 完全復旧を確認できない場合だけ、第8議題に従って `INCONSISTENT`へ変更する。
- 書き込み用サーバー時刻は、環境と3シートの確認後に1回だけ確定する。
- Google統合、書き込み可能なOAuth権限、`appsscript.json`変更は、別途承認を得てから行う。

## ローカル実装の保管対象

1. `trial/teacher-two-line-comment-phase1/apps-script/CreateDraftDecision.gs`
2. `trial/teacher-two-line-comment-phase1/apps-script/RequestFingerprint.gs`
3. `trial/teacher-two-line-comment-phase1/apps-script/ApiResponse.gs`
4. `trial/teacher-two-line-comment-phase1/apps-script/CreateDraftN01SelfTest.gs`
5. `trial/teacher-two-line-comment-phase1/tests/n01-cases.json`
6. `trial/teacher-two-line-comment-phase1/tests/run-create-draft-n01-validation.cjs`
7. `trial/teacher-two-line-comment-phase1/README.md`
8. `docs/teacher-two-line-comment-phase1-design-decisions-2026-07-26.md`

差分は8ファイル、1,959行追加、削除0行であった。

## 試験結果

| 試験 | 結果 |
| --- | --- |
| 基礎自己試験 | 17件合格 |
| 基礎ランナー | 135／135アサーション合格 |
| N-01専用試験 | 23／23件合格 |

試験はローカルだけで実行した。Google、スプレッドシート、Apps Script試験環境への接続や書き込みは行っていない。

## GitHub保管結果

- 実装・設計コミット：`e215a90c21598d2a162d96d0ea7a1b669776df34`
- PR：[#24 先生2行コメント N-01ローカル判定と設計記録を追加](https://github.com/jfsxxxib-wq/suiyoukai-stamp-app/pull/24)
- マージ方式：通常のMerge pull request
- マージコミット：`cd564aec7a848fea392acbebdf75da842ce76c48`
- ローカル `main`：`cd564aec7a848fea392acbebdf75da842ce76c48`
- `origin/main`：`cd564aec7a848fea392acbebdf75da842ce76c48`
- 作業ブランチ：ローカル・リモートとも削除済み
- 強制削除：未使用

対象コミットはマージコミットの親として `main`へ完全に含まれている。

## 変更していないもの

- 通常アプリ
- Google Apps Script試験環境
- 試験用・本番用スプレッドシート
- Google接続処理
- Sheets書き込み処理
- `spreadsheets.batchUpdate`の実装
- OAuth権限
- `appsscript.json`
- `INCONSISTENT`の安全停止状態

スプレッドシートID、Apps Script ID、URL、認証情報、トークンは、この記録へ保存しない。

## 保持した既存データ

- 対象外の未追跡ファイル8件は、変更・削除・ステージせず残した。
- 今回の保管対象以外のファイルをコミットへ含めていない。

## 次回の開始位置

N-01のローカル判定と設計保管は完了している。

次にGoogle統合へ進む場合は、作業前に改めて次を確認し、悦子さんの明確な承認を得る。

1. `spreadsheets.batchUpdate`を使用する実装範囲
2. OAuth権限を読み取り専用から必要最小限の書き込み可能範囲へ変更すること
3. `appsscript.json`の変更差分
4. 3つ目の試験用シート「要求処理結果」の追加
5. Google試験環境の識別条件と `INCONSISTENT`状態
6. Google統合専用試験の実施順序と停止条件

これらの承認前には、Google側、通常アプリ、OAuth権限、`appsscript.json`、`INCONSISTENT`を変更しない。
