# Gate B2-2C3-1B remote `0002` 最終範囲・試験・停止条件

記録日時：2026-09-19 16:48（日本時間）

状態：**計画合格／実行HOLD。`0002`原本とremote `0001`後の基準状態を照合し、in-memory offline検証は合格した。専用runnerの補強・fixture試験と別の明確な実行承認が終わるまで、Token作成、localhost受け口、Cloudflare API、remote request、`0002`を開始しない。**

## 結論

remote `0002`は、commit `505169f85d1604994d4b05ab2796004d415a2adb`に保存済みのremote `0001` PASSを前提に、固定D1へのREST `/query` 最大3 requestだけを実行候補とする。

1. `0001`後の状態を確認するSELECT-only preflight：1 request。
2. 固定hashの`0002_auth_write_guards.sql`全体：単一batch、1 requestだけ。
3. writeが明確に全件成功した場合だけ、SELECT-only postcheck：1 request。

client retry、write再送、結果不明時のpostcheck、任意SQL、`d1_migrations`操作、Worker実行、restoreは0とする。PASS／STOPのどちらでもTokenを削除・失効し、結果提示で停止する。

## 固定対象

- account：`242d67724ca0baef96a00553df0fac35`
- D1：`goencho-b2-canary-db-202609`
- D1 UUID：`f12fe289-977c-4215-ae73-40aaa34bff97`
- Worker：`goencho-b2-canary-202609`
- binding：`GOENCHO_DB`
- branch：`codex/goencho-gate-b2-cloudflare-candidate-20260918`
- 基準commit：`505169f85d1604994d4b05ab2796004d415a2adb`
- migration原本：`prototype/goencho-gate-b2-cloudflare-candidate/cloudflare/migrations/0002_auth_write_guards.sql`
- SHA-256：`1391CCC7B0599C7B22191DD4BD8F801BA3218218E3D989D0199D164DE48D676C`
- size：1,403 bytes
- statements：15
- 最大statement：153 bytes
- 内訳：`ALTER TABLE ... ADD COLUMN` 10、部分unique index 4、`schema_meta` update 1

## `d1_migrations`を使わない理由

初期のB2-2C3計画ではWrangler migration履歴2件を想定していた。しかしremote `0001`は、Cloudflare内部tableによる空判定false positiveを避けるため、REST単一batchと`schema_meta.version`＋固定hashを正本にする方式へ確定し、`d1_migrations`を作成しなかった。

`0002`だけWrangler migration方式へ戻すと履歴体系が混在するため、C3-1BもREST単一batchへ統一する。preflight／postcheckとも`d1_migrations=0`を必須にし、作成・挿入・偽装を行わない。この文書は、既存の一般計画にある「migration履歴2件」をC3-1Bについて置き換える。

## preflight PASS条件

`0001` remote PASS後の基準状態が、次のすべてに一致する場合だけwriteへ進む。

- `schema_meta`：table 1、row 1、version 2
- user tables：17（`schema_meta` 1＋`goencho_*` 16）
- named indexes：4
- foreign keys：15
- 16業務table総row数：0
- `d1_migrations`：0
- 未知table／index／view／trigger：0
- `0002`追加予定column：0／10
- `0002`追加予定index：0／4
- client attempt：1
- 記録対象の`meta.total_attempts`：すべて整数1

許容する内部objectは`_cf_*`／`sqlite_*`だけとする。追加予定columnまたはindexが1件でも既に存在する場合、部分適用・別変更・再実行の可能性があるためSTOPする。

## `0002` write範囲

次の15 statementsを原本どおり1個の`sql`値で送り、単一batch・単一REST `/query` requestを原子単位とする。

- credential 2 tablesへの`work_factor`、`parameters_json`、`pepper_key_version`：6 columns
- ticket／recovery／authorization 4 tablesへの`last_mutation_id`：4 columns
- active owner／operator credential／teacher credential／teacher device sessionの部分unique index：4
- `UPDATE schema_meta SET version = 3`：1

preflightで`schema_meta` 1 rowを必須にするため、version updateの複数row更新を許容しない。client attemptは1、client retryは0、write再送は0とする。

## postcheck PASS条件

writeのHTTP成功、top-level success、15 result、各result success、各`meta.total_attempts=1`がすべて明確な場合だけ実行する。

- `schema_meta`：table 1、row 1、version 3
- user tables：17、16業務table総row数0
- named indexes：8
- foreign keys：15
- `d1_migrations`：0
- 未知table／index／view／trigger：0
- 追加column：10／10、table・name・type・nullability・defaultが一致
- `work_factor`：`INTEGER`、nullable、defaultなし
- `parameters_json`：`TEXT`、nullable、defaultなし
- `pepper_key_version`：`TEXT NOT NULL DEFAULT 'v1'`
- `last_mutation_id`：対象4 tablesで`TEXT`、nullable、defaultなし
- 追加index：4／4、name・table・column・unique・partial predicateが一致
- 4 indexのpredicate：`WHERE status = 'active'`
- client attempt：1、記録対象の`meta.total_attempts`はすべて整数1

## Token作成前のoffline前提

専用`0002` runnerは、追跡済み`0001` runnerを上書きせず別ディレクトリへ作る。Token作成前に次を満たす。

- migration hash、bytes、statement数を起動時に固定照合
- preflight／write／postcheckの最大3 requestをコード上で固定
- request purposeとendpointを固定し、client retryを実装しない
- preflightのversion 2、columns 0、new indexes 0をfixtureで確認
- postcheckのversion 3、columns 10、indexes 8、partial indexes 4をfixtureで確認
- 未知object、業務row、schema_meta複数row、wrong default／type／predicateをPASSにしない
- timeout／network／HTTP／JSON異常は追加requestなしでSTOP
- writeの`total_attempts`欠落・型不正・1以外は、commit有無を推測せずSTOP
- write失敗・曖昧時はpostcheck 0、再送0、restore 0
- fake Tokenがresult、stdout、stderr、file、call記録へ漏れない
- transport active 0、raw response／JSON参照解除、Token Buffer zero-fill、受け口閉鎖を確認
- external network 0、real Token 0、Cloudflare API 0でoffline試験を完了

offline runner合格後は、内容一致・secret除外を確認し、必要なら専用branchへ別checkpoint保存する。実行承認はその後の別ゲートとする。

## 今回のoffline確認

- `0002` hash：既存C3-0 rehearsalと一致
- in-memory `0001`直後：version 2、tables 17、indexes 4、FK 15、業務row 0、追加column 0、新index 0、`d1_migrations=0`
- in-memory `0002`後：version 3、tables 17、indexes 8、FK 15、業務row 0、追加column 10、新index 4、`d1_migrations=0`
- 先頭ALTER後の意図的失敗：version 2、indexes 4、追加column 0へrollback
- B1：168／168 PASS
- Cloudflare：61／61 PASS
- 合計：229／229 PASS
- B2 scope check：PASS
- leak scan：PASS
- source manifest：57ファイル不変
- external network 0、remote request 0、real Token 0

## 承認後の実行順序

専用runnerがoffline合格し、さらに別の明確な実行承認を得た場合だけ次へ進む。

1. Git ref、target、manifest、SQL hash、offline試験を再確認する。
2. account限定・D1 Writeだけ・7日有効の短期Account API Tokenを1個作成する。
3. Tokenをlocalhost password formへだけ渡し、ファイル、環境変数、clipboardへ保存しない。
4. request 1：SELECT-only preflightを1回。
5. 完全PASS直後、`T_restore = UTC現在分切捨て - 60秒`をRFC3339とUnix秒で記録する。
6. request 2：固定hashの`0002`を単一batchで1回。
7. writeが明確に全件成功した場合だけrequest 3：SELECT-only postcheckを1回。
8. PASS／STOPともTokenを削除し、一覧から失効を確認する。
9. 安全化した結果を記録して停止する。Worker runtime、公開、restoreへ進まない。

## 即時STOP条件

- Git ref、target、endpoint、hash、bytes、statement数の不一致
- offline試験の失敗、external network、Token漏えい可能性
- Token権限、account範囲、期限の不一致
- preflight条件のどれか不一致または結果不明
- `0002`予定column／indexの事前存在
- writeのtimeout、network error、HTTP不成功、応答不正、件数不一致、result失敗
- writeの`total_attempts`欠落・型不正・1以外
- postcheckのversion、row、column、default、index、predicate、FK、未知object、attempt不一致
- Token削除・失効を確認できない
- request数増加、client retry、write再送、別endpoint、別D1、追加権限が必要
- `d1_migrations`操作、Worker実行、secret、route、公開、restoreが必要

## STOP後に行わないこと

- `0002`再送
- 結果不明時の自動postcheckまたは原因調査remote call
- 自動修復SQL
- Time Travel restore
- Worker runtime、binding、secret、route、公開

必要ならToken失効後に新しいread-only計画を作り、別承認で状態を確認する。restoreは新しい`T_restore`と影響範囲を確認する別計画・別承認に分ける。

## 今回の停止点

固定範囲、PASS／STOP条件、REST方式への統一、Token前offline要件を確定し、in-memory schema検証と229件回帰を完了した。専用`0002` runnerは未作成であり、実行はHOLDとする。

D1 Write Token、localhost受け口、Cloudflare API、remote SELECT、remote write、`0002`、restore、Git commit／pushは行っていない。
