# Gate B2-2C4-3 secret設定＋full Worker deploy 範囲・offline試験・停止条件

作成日時：2026-09-20 00:02（日本時間）

状態：**計画確認PASS／実装・実行HOLD。Token、secret値、localhost受け口、Cloudflare account API、secret設定、deploy、runtime request、D1 read／writeは0。**

## 1. 目的

既存の隔離Worker `goencho-b2-canary-202609`へ、固定5 secretとfreeze済みfull Workerを安全に接続し、外部入口を開かないままcontrol planeだけで配線を確認できる状態を作る。

B2-2C4-3ではruntime canaryを実行しない。`GET /api/health`を含む外部runtime request、D1 query、route、Preview URL、`workers.dev`は0のまま停止する。health読取りはB2-2C4-4の別計画・別承認とする。

## 2. 公式仕様との最終照合

Cloudflare公式仕様では、`wrangler secret bulk`は最大100件を一括1 requestで更新できる一方、secret操作は新しいWorker versionを作成して**直ちにdeployする**。また`wrangler deploy`は既存secretを削除せず、`--strict`で競合remote設定の上書きを防止できる。

したがって、旧表現の「secret設定1回＋full Worker deploy 1回」は、実際には次の2段階remote mutationとして扱う。

1. 5 secret bulk 1 attempt：5 secretを一括更新し、現行の無効Worker codeを含む中間versionを即時deployする。
2. full Worker deploy 1 attempt：freeze済みcode／assets／D1 bindingをdeployする。secretは保持する。

secret bulkを非deploy操作と見なしてはならない。中間deployの安全性をoffline fixtureとremote preflightで保証できなければC4-3を開始しない。

参照：

- [Wrangler Workers commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/)
- [Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Workers bulk secrets API](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/secrets/)
- [Worker upload API](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/methods/update/)
- [API token permissions](https://developers.cloudflare.com/fundamentals/api/reference/permissions/)

## 3. 固定基準

- Gate branch：`codex/goencho-gate-b2-cloudflare-candidate-20260918`
- GitHub checkpoint：`5d90a3e05c86851adccc35af0b8675f9f12c2245`
- candidate files：116
- candidate tree SHA-256：`0015C1D9E2A882082BEB82DCFEADDD7321BF83BBBDDD8AFD6742F76A79520A8F`
- deployment contract SHA-256：`960A67C4DDC1E9F3377383A3F60C58999E32A7B27CD0069E022F35D43E40E0BA`
- full Worker SHA-256：`D52283968D001C8024A27B75A5BC7210453DA479A94098AD78FCEAB40F7D0564`
- 現行無効bootstrap SHA-256：`3B05EDCF71B3CA9C5D883944CB625E459AF3D8E17CC732E0C339498DCCBA613F`
- `wrangler.jsonc` SHA-256：`A9391500702CEACE2DAD1A60F4A3E74ADB503EAB074C7504BEFECF82FF519470`
- Wrangler：local lock済み`4.112.0`。Node：`>=24.0.0`。
- migration `0001`／`0002`：既存固定hash不変。`0003`は存在せず、作らない。

## 4. 固定resource・権限

- account：既存の隔離canary account 1件だけ。
- Worker：`goencho-b2-canary-202609` 1件だけ。
- D1：`goencho-b2-canary-db-202609` 1件だけ。
- binding：`GOENCHO_DB` 1件、assets binding `ASSETS` 1件だけ。
- secret名：既存計画の5件だけ。追加・削除・改名しない。
- 短期Token：account scopeを対象1 accountだけへ限定し、`Workers Scripts Write`＋`D1 Read`だけ。Zone permission、Workers Routes Write、D1 Write、API Tokens Writeは付けない。
- Token有効期限：作成時点から最大24時間。PASS／STOPを問わず同じ工程内で削除・失効確認する。

D1 Readは固定D1名からUUIDをcontrol planeで解決するためだけに使い、D1 `/query`、`/raw`、export、importは呼ばない。

## 5. 公開・observability契約

- `workers_dev=false`
- `preview_urls=false`
- route／custom domain／schedule／tail consumer：0
- observability、logs、invocation logs、traces、logpush：無効
- `send_metrics=false`
- dependency instrumentation：無効
- Wrangler automatic provisioning：明示的に無効
- `--strict`を必須とし、未知remote設定があれば上書きせずSTOP

実D1 UUIDを全ゼロplaceholderへ置換したままremoteへ送ることを禁止する。remote preflightで固定名と一致したUUIDだけを、厳格ACLの一時deployment descriptorへ注入し、終了時に削除する。完全UUIDをsource、Git、通常output、結果文書へ残さない。

## 6. 工程分離

### C4-3A：live adapterのoffline実装・fixture

- GitHub保存済み7 toolsは変更しない。
- 追跡外の新規一時rootへlive adapter、launcher、safe result、fixtureを作る。
- real Token、real secret、Cloudflare API、Wrangler remote、deployは0。
- OSレベルのnetwork block下で全fixtureと既存255件を1回実行する。
- PASSしてもcandidate、Gate tools、GitHub、C4-3 remote実行へ進まず停止する。

### C4-3B：remote実行直前最終照合

- C4-3Aの固定files／hash、endpoint・client command・API request予算、Token権限、入力方式、停止条件を再照合する。
- この照合もToken作成・Cloudflare通信なしで行い、別の明確な実行承認待ちで停止する。

### C4-3C：remote実行

- 別の明確な承認後だけ短期Tokenを作成する。
- read-only preflight 1組→secret bulk 1 attempt→明確な全面成功時だけfull deploy 1 attempt→固定control-plane postcheck 1組まで。
- client retry、secret再送、deploy再送、secret削除、旧version復元、runtime request、D1 queryは0。
- PASS／STOP後にbuffer zero-fill、受け口閉鎖、Token削除・失効確認を行い停止する。

## 7. C4-3A offline fixture

### C4-3-F01 baseline

commit、candidate 116 files、tree、Worker、bootstrap、Wrangler config、package、manifest、migration、tool manifestが固定値と一致しなければSTOP。

### C4-3-F02 official behavior model

secret bulkが一括1 requestかつ即時deployを伴うこと、full deployが別のdeployであることをstate machineへ明示する。mutation総数を2段階として記録する。

### C4-3-F03 current remote code guard

secret bulk前のremote codeが固定無効bootstrap hashと一致するfixtureだけを許可する。不明、download不可、別hashならsecret bulk attempt 0でSTOP。

### C4-3-F04 exact resource preflight

account 1、Worker 1、D1 1、binding exact、入口0、observability無効、未知binding／var／route 0をsafe fieldsだけで判定する。

### C4-3-F05 minimum Token permission

Workers Scripts Write＋D1 Read、対象account 1だけを許可する。Zone、route、D1 Write、token管理、全account scopeが含まれればSTOP。

### C4-3-F06 ephemeral descriptor

実D1 UUIDを一時descriptorへ1回だけ注入し、全ゼロID、別D1、余剰bindingを拒否する。ACL、終了時削除、通常output非表示をfixtureで確認する。

### C4-3-F07 telemetry・自動作成禁止

metrics、dependency instrumentation、auto provision、install skills、profile自動選択、update checkを明示的に無効化する。未知の外部request先があればSTOP。

### C4-3-F08 secret material

5 secret値はOS CSPRNGからmemory内生成し、各32 bytes以上、名称exact、重複なしとする。値はstdinだけでbulk adapterへ渡し、argv、通常env、clipboard、disk、output、exceptionへ出さず全終了経路でzero-fillする。

### C4-3-F09 secret bulk単回性

bulk adapterは1 client attemptだけ。明確な全面成功時だけfull deployへ進む。timeout、parse不能、部分状態、非zero exitは`SECRET_STATE_UNKNOWN`で停止し、postcheck、再送、削除、復元を行わない。

### C4-3-F10 full deploy単回性

secret成功後だけ1 client attempt。`--strict`、固定config、固定bundleを必須とする。timeout、parse不能、非zero exitは`DEPLOY_STATE_UNKNOWN`とし、再deploy・rollbackを行わない。

### C4-3-F11 postcheck境界

deployが明確成功または結果不明の場合だけcontrol-plane readを最大1組実行できる。Worker 1、D1 binding exact、secret名5、入口0、observability無効を確認するが、曖昧deployを成功へ推測しない。runtime requestとD1 queryは0。

### C4-3-F12 safe output

段階、attempt数、固定category、boolean／count、短縮hashだけを保存する。Token、secret、account ID、D1 UUID、version ID、URL、raw response、header、body、stderr、内部exceptionは保存しない。

### C4-3-F13 failure state preservation

secret bulk成功後にdeployが失敗・不明でも、5 secretと中間versionを自動削除・復元しない。Tokenだけを失効し、remote状態を推測せずSTOPする。

### C4-3-F14 single-use launcher

二重起動、button連打、session再利用、runner再起動を拒否する。preflight／bulk／deploy／postcheckのattempt上限を越えない。

### C4-3-F15 external network block

fixtureはOSレベルでnetworkを遮断し、外部接続可能性0をguardian証跡で確認する。UAC、rule、Node、listenerを終了時0に戻す。

### C4-3-F16 request budget manifest・回帰

remote adapterが使用するendpoint、HTTP method、Wrangler child command、最大client attempt、想定内部API requestをmanifestへ固定する。未知endpoint 0を確認し、B2-2C4-2 15件、B1 168件、Cloudflare offline 72件、合計255件、scope、leak、manifest、構文を再実行する。

## 8. remote実行のPASS条件

- C4-3A／C4-3Bが別々に合格し、さらにremote実行が明確に承認されている。
- read-only preflightが固定resource、無効bootstrap、入口0、observability無効を確認する。
- secret bulk 1、full deploy 1、各client retry 0。
- postcheckでWorker 1、D1 binding exact、secret名5、入口0、observability無効を確認する。
- runtime request 0、D1 query／row read／row write 0、route 0。
- Token削除・失効、buffer zero-fill、listener閉鎖が確認できる。

## 9. 即時停止条件

- commit、hash、resource、bootstrap、binding、secret名、Token権限が不一致。
- secret bulkの即時deployを検知・記録できない。
- remote code同一性、入口0、observability無効をpreflightで証明できない。
- 全ゼロD1 ID、別D1 ID、未知binding／var／routeがremote descriptorへ入る。
- secret値またはprivate IDがdisk、log、response、Git、画面へ残る。
- Wranglerがauto provision、route作成、Preview URL、update check、telemetry、未知endpointを要求する。
- secret bulkまたはdeployが失敗・timeout・結果不明になる。
- client retry、再送、rollback、secret削除、restoreが必要になる。
- runtime request、D1 query、正式resource、本番data、別accountが必要になる。
- Token失効、listener閉鎖、一時descriptor削除を確認できない。

STOP時は追加操作でremote状態を整えない。特にsecret bulk後は削除もdeploy再送もせず、Token失効後に`REMOTE_UNKNOWN`として結果提示する。

## 10. 今回の停止点

この計画と公式仕様の照合だけで停止する。Token、secret値、localhost受け口、Cloudflare API、Wrangler remote、deploy、runtime canaryは0。次の最小工程は、別の明確な承認後に**追跡外一時rootだけへC4-3A live adapterを実装し、F01〜F16をnetwork block下でoffline実行すること**である。

先生ページはローカル完成済み。隔離完成まで残りC4-3〜C4-6の4工程、正式利用可能な完成までさらに3工程を加えた残り7工程。
