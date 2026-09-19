# Gate B2-2C4-1 Worker HTTP parity 実装範囲・fixture・停止条件

作成日時：2026-09-19 18:36（日本時間）

状態：**範囲確認合格／実装HOLD。candidate変更、Token、secret、Cloudflare通信、deploy、runtime request、D1 read／writeは0。**

## 1. 結論

B2-2C4-1は、ローカル版で合格済みのowner／先生HTTP導線を、単一Cloudflare Workerで衝突なく動かせる形へoffline移植する工程とする。

現状は、D1 auth write serviceのtransaction処理は存在する一方、Worker HTTP entrypointにはhealthと対局読取りしか接続されていない。またローカル版はowner／先生を別originで動かすため、両方が同じ`/api/session/unlock`と`/api/session/logout`を使用している。単一Workerへそのままコピーするとrouteが衝突する。

したがって、**単一Worker／単一originを維持し、owner／teacherのUIとAPIをrole別namespaceへ分離する方式** を第一候補として固定する。別Worker、別domain、custom route、外部serviceを増やさない。

この文書では範囲、fixture、停止条件だけを確定する。実装開始には別の明確な承認を必要とする。

## 2. 現状差分

### ローカル版にあるもの

- owner state、初回activate、recovery、unlock、logout
- 先生作成／enrollment、端末一覧、approve／reject／revoke
- teacher state、claim、set-pin、status、unlock、logout
- 今日／過去日／個人の対局読取り
- ownerと先生を別originで分離するHTTP server

### Cloudflare Workerに接続済み

- `GET /api/health`
- `GET /api/matches/today`
- `GET /api/matches/dates`
- `GET /api/matches/by-date`
- `GET /api/participants/:participantId/matches`
- D1 teacher actor解決、schema version確認

### Cloudflare側に未接続・不足

- owner／teacher認証・管理HTTP route
- owner state、owner session actor解決
- teacher state、enrollment status
- owner用teacher device一覧
- owner／teacher両方のCookie発行・更新・clear
- 単一originで衝突しないrole判定
- `/owner/`／`/teacher/`とscript／shared assetのpath整合

## 3. 採用候補のURL境界

単一Workerで曖昧なCookie推測を行わず、pathnameだけでroleを一意に決める。

### UI

- owner：`/owner/`
- teacher：`/teacher/`
- shared asset：`/shared/`
- root `/`：自動でroleを選ばず、安全な案内または404

### 共通

- `GET /api/health`

### owner API

- `GET /api/owner/state`
- `POST /api/owner/bootstrap/activate`
- `POST /api/owner/recovery/consume`
- `POST /api/owner/session/unlock`
- `POST /api/owner/session/logout`
- `POST /api/owner/teacher-enrollments`
- `GET /api/owner/teacher-devices?status=...`
- `POST /api/owner/teacher-devices/:authorizationId/approve`
- `POST /api/owner/teacher-devices/:authorizationId/reject`
- `POST /api/owner/teacher-devices/:authorizationId/revoke`

### teacher API

- `GET /api/teacher/state`
- `POST /api/teacher/enrollment/claim`
- `POST /api/teacher/enrollment/set-pin`
- `GET /api/teacher/enrollment/status`
- `POST /api/teacher/session/unlock`
- `POST /api/teacher/session/logout`
- `GET /api/teacher/matches/today`
- `GET /api/teacher/matches/dates`
- `GET /api/teacher/matches/by-date?date=...`
- `GET /api/teacher/participants/:participantId/matches`

旧い非namespaceの`/api/session/*`や`/api/matches/*`を本番候補の別名として残さない。二重surface、role誤判定、fixture重複を避ける。ローカルserverとUIも同じcanonical pathへ揃え、status／body／Cookieの意味を一致させる。

## 4. 実装対象

候補内の次の責務だけを変更対象とする。正確なファイル一覧は実装開始前にsource manifestとして固定する。

1. Worker router
   - role別method／pathname allowlist
   - dynamic parameter decode
   - unknown APIの安全な404または503
2. D1 auth HTTP facade
   - `GoenchoD1AuthWriteAdapter`を呼ぶ薄いasync境界
   - state、session actor、device一覧など不足するread query
   - service resultから公開response allowlistへの変換
3. Cookie response
   - owner device、owner session、teacher device、teacher sessionを別名で固定
   - device Cookieだけ明示Max-Age、session Cookieはbrowser session限定
   - `HttpOnly; Secure; SameSite=Strict; Path=/`
   - 複数`Set-Cookie`をカンマ結合しない
4. public UI
   - owner／teacherそれぞれのnamespaced API path
   - `/owner/`、`/teacher/`、`/shared/`に一致するasset path
   - QR fragmentの扱い、表示、文言、DOM構造は変更しない
5. local parity server
   - 同じcanonical pathをoffline fixtureで受けられるようにする
   - localhost 2-originの安全境界は維持する
6. tests
   - Worker HTTP auth fixtureを新規追加
   - local HTTP fixtureをcanonical pathへ更新
   - asset path／route collision静的試験を追加

## 5. 実装対象外

- 新しい画面、機能、table、column、index、migration
- `0001`／`0002`、schema version 3、D1 rowの変更
- PIN桁数、PBKDF2 600,000 iterations、lock時間、ticket期限の変更
- 対局書込みAPI、正式データ取込、ID対応表
- access gate、一時入口、route、custom domain、Preview URL、`workers.dev`
- Worker deploy、secret作成、Cloudflare API、runtime request
- 正式Site、正式D1、正式Sheets、本番data、QR
- Git commit／push／PR／`main`

## 6. fixture計画

すべてin-memory D1互換fixtureまたはstubで行い、external networkを禁止する。

### F01 route／asset境界

- owner／teacherの全method＋pathnameが一意で重複0。
- `/api/owner/*`がteacher handlerへ、`/api/teacher/*`がowner handlerへ入らない。
- `/owner/`、`/teacher/`、各script、shared script／CSSが期待statusとMIMEで解決する。
- root `/`、directory traversal、未知asset、未知APIを安全に拒否する。
- owner UIがteacher APIを、teacher UIがowner APIを呼ばない。

### F02 binding／secret fail-closed

- `GOENCHO_DB`欠落／不正で503。
- 5 secretの各欠落、短すぎる値、未知key versionで503。
- 503時にauth service、D1 write、asset fallbackを呼ばない。
- error bodyへbinding名、secret名、内部messageを出さない。

### F03 owner state／Cookie

- `setup_required`、`recovery_required`、`unlock_required`、`active`、`unavailable`をlocalと一致させる。
- activateは201、owner device＋session Cookie、recovery code allowlistだけを返す。
- recoverは200、新device＋session、旧device／session失効を確認する。
- unlockは200、device Cookie再発行＋新session、旧session失効。
- logoutはsessionだけclearし、device承認を維持する。
- secret値、PIN、token digest、内部IDをresponseへ出さない。

### F04 owner先生管理

- enrollment作成は201でteacherとticketを同一transactionにする。
- sessionなし／inactive ownerは拒否し、D1 write 0。
- device一覧はstatus allowlistとquery個数を検査する。
- pending一覧だけ確認番号を返し、approved／revokedへ返さない。
- approve／reject／revokeはactor、対象、確認番号、終端状態を照合する。
- failure injectionで半端なteacher、ticket、device、auditを残さない。

### F05 teacher state／enrollment

- `enrollment_required`、`pending`、`unlock_required`、`active`、`teacher_unavailable`をlocalと一致させる。
- claim成功時だけclaim token、purpose、display nameを返す。
- set-pinは202、teacher device Cookieと確認番号だけを返す。
- enrollment statusはpending時202、それ以外はlocal契約どおり。
- inactive teacher、expired／used ticket、wrong purposeを公開statusとerror codeで照合する。

### F06 teacher session／対局読取り

- unlockはdevice＋PINを要求し、session Cookieを新しく発行する。
- logoutはsessionだけclearし、device承認を維持する。
- deviceなし、sessionだけ、別device session、revoked deviceを拒否する。
- 今日／過去日／個人は同じactorとmatch IDを使い、teacher間で混ざらない。
- 読取りAPIはD1 rowを変更しない。

### F07 request security

- POSTは完全一致Origin＋JSONだけを許可。
- Originなし／不一致は403、JSON以外は415、16 KiB超過は413、不正JSONは400。
- query重複、未知query、path decode不正、participant ID不正を拒否する。
- `teacherId`／`teacher_id`のquery、body、header、path持込みを400で拒否する。
- 保護owner APIへの`ownerPin` body／header持込みを拒否する。
- 公開errorは内部exception、SQL、secret、header、Cookie、bodyを含まない。

### F08 Cookie wire format

- 4 Cookie名が衝突しない。
- device Cookieだけ正のMax-Ageを持ち、session Cookieは永続化しない。
- clearは`Max-Age=0`。
- 複数`Set-Cookie`が独立headerとして保持され、カンマ結合されない。
- owner／teacherのCookieが反対roleのactor解決に使われない。

### F09 transaction／競合

- 既存D1 auth transaction 19件を維持する。
- bootstrap、recovery、claimの20並列で成功1件。
- approve対reject、revoke対unlockの競合で許可した終端状態だけになる。
- 各statement failure injectionで完全rollbackする。
- HTTP入力検証で拒否したcaseはtransactionを開始しない。

### F10 回帰・隔離

- B1 168件、Cloudflare 61件をすべて再合格させる。
- 新規fixture件数は実装後に確定し、skip／todo 0。
- scope check、leak scan、source manifest、Node構文を合格させる。
- migration hash、schema counts、business rows 0を変更しない。
- network socket／DNS／Cloudflare credential参照0。

## 7. PASS条件

- role別namespaceとasset pathが一意で、曖昧なrole推測が0。
- local serverとWorker fixtureのstatus、公開body、Cookie、最終DB状態が一致する。
- D1 auth write serviceのatomicity、一回限り制約、actor分離を維持する。
- 既存229件＋新規fixture、scope、leak、manifest、syntaxが全PASS。
- schema、migration、business rows、external resource、GitHubに変更0。
- 実装成果物は追跡外一時copyで自己完結し、内容提示で停止する。

## 8. 即時停止条件

次のいずれか一つでも該当したら実装・fixtureをSTOPし、外部工程へ進まない。

- role namespaceを固定できず、Cookie内容や存在からowner／teacherを推測する必要がある。
- 別Worker、別domain、route、custom domain、Cloudflare Access等の追加resourceが必要になる。
- asset pathを一意にできず、owner／teacherのrootやscriptが衝突する。
- 複数`Set-Cookie`を独立headerとして安全に返せない。
- localとD1でstate、status、公開body、Cookie、transaction終端が一致しない。
- 新しいDDL、migration、schema version変更、既存row rewriteが必要になる。
- PIN／secret／token／Cookie／digest／内部SQLがresponse、console、fixture保存物へ出る。
- Node専用APIをWorker runtime pathへ持ち込む必要がある。
- 既存229件、scope、leak、manifest、syntaxのいずれかが不合格。
- Token、secret、Cloudflare API、remote D1、deploy、runtime requestが必要になる。
- 正式resource、本番data、Git操作が必要になる。

## 9. 実装時の停止点

別承認後に実装してoffline fixtureが全PASSしても、その場でcandidate正本、GitHub、Cloudflareへ反映しない。

1. 追跡外一時copyで差分と結果を提示する。
2. candidateへ反映する範囲を改めて確認する。
3. 反映・GitHub checkpointを別承認にする。
4. B2-2C4-2 bundle／runner固定へはさらに別承認を必要とする。

今回の停止点は **範囲・fixture・STOP条件の確認完了／実装未開始**。
