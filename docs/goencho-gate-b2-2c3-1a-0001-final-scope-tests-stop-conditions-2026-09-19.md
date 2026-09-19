# Gate B2-2C3-1A remote `0001` 最終範囲・試験・停止条件

作成日時：2026-09-19 15:32（日本時間）
状態：**計画確認とWrite Token前offline補強・再試験が完了。D1 Write Token作成、Cloudflare API、remote write、`0001`は未実行。**

## 結論

remote `0001`は、固定D1に対するREST `/query` 3 requestだけを実行候補とする。

1. 直前のSELECT-only空状態確認：1 request。
2. `0001_goencho.sql`全体の単一batch write：1 requestだけ。
3. writeが明確に全件成功した場合だけ、SELECT-only事後確認：1 request。

client retry、write再送、`0002`、`d1_migrations`操作、Worker実行、公開、restoreは0とする。PASS／STOPのどちらでもTokenを削除・失効し、結果提示で停止する。

Git対象外の一時runnerだけをofflineで補強し、runner 38 case・transport 17 caseが合格した。実行にはこの結果の確認とは別の明確な承認が必要であり、**現時点ではWrite Token作成へ進まない**。

## 固定対象

- account：`242d67724ca0baef96a00553df0fac35`
- D1名：`goencho-b2-canary-db-202609`
- D1 UUID：`f12fe289-977c-4215-ae73-40aaa34bff97`
- 隔離Worker：`goencho-b2-canary-202609`
- binding：`GOENCHO_DB`
- endpoint：`POST https://api.cloudflare.com/client/v4/accounts/{account}/d1/database/{uuid}/query`
- migration：`cloudflare/migrations/0001_goencho.sql`だけ
- SHA-256：`0EAADB9E1A72D1947414F50A45073D0B00FD8E33DE8267E15288D10A2F6194ED`
- UTF-8 bytes：6,502
- statements：23
- SQL内のtransaction control：`BEGIN`／`COMMIT`／`ROLLBACK`なし
- expected schema：17 tables（`schema_meta` 1＋`goencho_*` 16）、named indexes 4、foreign keys 15、`schema_meta.version=2`
- remote履歴の正本：`schema_meta.version`＋ローカル不変hash manifest
- `d1_migrations`：作成・挿入・偽装・履歴正本化をしない

## 公式仕様との照合

- Cloudflare D1 Query APIは、セミコロンで連結した複数statementをbatchとして実行でき、必要権限は`D1 Read`または`D1 Write`である。
  <https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/>
- CloudflareはD1 batchをSQL transactionと説明し、途中statement失敗時はsequence全体をabortまたはrollbackするとしている。REST `/query`の複数statementも公式にbatchと呼ばれるため、同じD1 batch semanticsが適用されると推論し、単一requestを原子単位とする。
  <https://developers.cloudflare.com/d1/worker-api/d1-database/#batch>
- 各statementの上限は100 KB、query duration上限は30秒。今回の各statementと30秒timeoutは範囲内。
  <https://developers.cloudflare.com/d1/platform/limits/>
- D1はread-only queryだけを内部で最大2回追加retryし得る。client側は全requestでretry 0とし、remoteの`meta.total_attempts`も最終判定へ含める。
  <https://developers.cloudflare.com/d1/best-practices/retry-queries/>
- Time Travelは常時有効で、timestampから復旧点を決められる。2026年作成の新規D1は更新済みstorage architectureを使う。restoreはDBを上書きする破壊的な別工程であり、自動実行しない。
  <https://developers.cloudflare.com/d1/reference/time-travel/>
  <https://developers.cloudflare.com/d1/platform/alpha-migration/>

## Write Token前に必要なoffline補強

変更を許すのは次のGit対象外一時runnerだけとする。

- `tmp/gate-b2-c3-1a-rest-bootstrap-20260919/`
- `tmp/gate-b2-c3-1a-rest-live-transport-20260919/`

追加する判定は次の4点。

1. preflightとpostcheckで、予期しないuser view／triggerが0であること。
2. postcheckで、`schema_meta`がtable 1件かつrow 1件、version 2であること。
3. postcheckで、16個の`goencho_*`業務tableの総row数が0であること。
4. live結果にclient attemptsと各resultの`meta.total_attempts`を安全な数値だけで残し、想定外attemptをPASSにしないこと。

migration、manifestの固定値、candidate、Worker code、binding、公開設定、本体アプリは変更しない。

## Token作成前の試験

既存試験を維持し、上記4点の正常系・異常系を追加する。

- runner既存20 case：全件回帰PASS。
- transport既存15 case：全件回帰PASS。
- 追加case：未知view、未知trigger、`schema_meta`複数row、業務row混入、`total_attempts`欠落・型不正・2以上、client attempts不一致。
- batch途中失敗：全体rollback想定、write再送0、postcheck 0、restore 0。
- timeout／network／HTTP／JSON異常：retry 0、追加remote call 0。
- fake Tokenがresult、stdout、stderr、file、call記録へ漏れない。
- endpoint固定、POST-only、redirect拒否、localhost一回限り受け口、Buffer zero-fill、生response参照解除を維持する。
- external network 0、real Token 0、Cloudflare API 0、remote write 0。
- `0001`のhash、6,502 bytes、23 statements、17 tables、4 indexesが不変。

このoffline補強と試験結果の確認は、Write Token作成とは別の前段とする。

## offline補強結果

- runner：`REST_OFFLINE_TESTS_PASS cases=38`
- transport：`REST_TRANSPORT_OFFLINE_PASS cases=17`
- Node構文確認：7ファイルPASS
- external network 0、real Token 0、Cloudflare API 0、remote request 0、write 0
- writeの`total_attempts`欠落・不正・2は、writeがcommit済みの可能性を残したfixtureでも、postcheck 0・retry 0・restore 0でSTOP
- 詳細：`docs/goencho-gate-b2-2c3-1a-0001-final-offline-hardening-result-2026-09-19.md`

## 承認後の実行順序

別の明確な実行承認が得られた場合だけ、次の順に進む。

1. Gitと固定manifestを再照合し、補強後offline試験を全件再実行する。
2. 対象account全体に限定した、`D1 Write`だけ、7日有効の短期Account API Tokenを1個作成する。
3. Tokenはlocalhostのpassword formへだけ渡し、表示・保存・環境変数化・clipboard再利用をしない。
4. request 1：固定D1へSELECT-only preflightを1回送る。
5. preflightが完全PASSした直後、`T_restore = UTC現在分切捨て - 60秒`をRFC3339とUnix秒で記録する。
6. request 2：固定hashの`0001`全体を単一`sql`値・単一 `/query` requestで1回だけ送る。
7. HTTP成功、top-level success、23 result、各result successがすべて明確に真の場合だけrequest 3へ進む。
8. request 3：固定SELECT-only postcheckを1回送る。
9. PASS／STOPのどちらでもTokenを直ちに削除し、Token一覧から失効を確認する。
10. 安全化した結果を記録して停止する。`0002`へは進まない。

前回のD1 Read remote PASSは、空判定式と対象が正しい証拠として保持する。実行時は時間差による状態変化を排除するため、Write直前に同じ厳格なpreflightを改めて1回だけ行う。

## PASS条件

全条件の同時成立だけをPASSとする。

- 固定account、D1名・UUID、binding、endpoint、migration hashが一致。
- preflight：`d1_migrations=0`、`schema_meta=0`、`goencho_*=0`、未知table／index／view／trigger=0。`_cf_*`／`sqlite_*`だけ許容。
- client requestは合計3、うちwriteは1。client retry 0。
- `0001` responseはHTTP成功、top-level success、23 result、全result success。
- postcheck：`schema_meta` table 1・row 1・version 2、`goencho_*` 16 tables・総row 0、named indexes 4、foreign keys 15。
- postcheck：`d1_migrations=0`、未知table／index／view／trigger=0。
- 記録対象の`meta.total_attempts`はすべて整数1。欠落・型不正・2以上はPASSにしない。
- Token削除・失効、Buffer zero-fill、raw参照解除、受け口閉鎖を確認。
- `0002`、Worker、binding、secret、route、公開、restore、正式resource、本番dataの変更0。

## STOP条件

次のどれか1つでも該当した時点でSTOPする。

- Git ref、target、endpoint、manifest、hash、bytes、statement数、static schemaの不一致。
- offline試験の1件でも失敗、external network発生、Token漏えい可能性。
- Tokenの権限・account範囲・期限が固定条件と異なる。
- preflightの期待count不一致、結果不明、`total_attempts != 1`。
- writeのHTTP／Cloudflare error、timeout、network／TLS、redirect、invalid JSON、結果件数不一致、1件でも`success != true`、attempt不明。
- writeの`total_attempts`が欠落・型不正・1以外。write済みかどうかを推測せず、再送も事後SELECTも行わない。
- write結果が不明な場合。postcheckを自動追加せず停止する。
- postcheckのschema、row、index、foreign key、version、未知object、attemptのどれかが不一致。
- Token削除・失効を確認できない。
- request数が増える、client retry、write再送、別endpoint、別D1、追加権限が必要になる。
- `d1_migrations`操作、`0002`、Worker実行、secret、route、公開、restoreへ進む必要が生じる。

## STOP後に行わないこと

- 同じwriteの再送。
- 原因調査だけの追加remote call。
- 結果不明時の自動postcheck。
- `d1_migrations`の後付け。
- Time Travel restore。
- `0002`、Worker runtime、公開。

必要なら、Token失効後に新しいread-only計画を作り、別承認で状態を確認する。restoreは`T_restore`、対象、影響、戻せる範囲を再確認した別計画・別承認に分ける。

## 今回の停止点

固定範囲、試験、PASS／STOP条件を確定し、現行runnerのoffline補強4点をWrite Token前提条件にした。D1 Write Token作成、localhost受け口起動、Cloudflare API、remote SELECT、remote write、`0001`、Token操作は行っていない。
