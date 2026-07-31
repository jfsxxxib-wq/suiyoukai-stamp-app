# 先生1人の2行コメント・第1段階 設計決定記録

作成日: 2026年7月26日  
文書状態: 設計会議中・未実装  
対象段階: 第1段階「シートとApps Scriptの保存処理」

## 1. この文書の位置づけ

この文書は、承認済みの次の2文書を変更せず、第1段階に必要な未決定事項について、設計会議で承認された決定だけを順次記録する。

- `docs/teacher-two-line-comment-preimplementation-spec-ver1-2026-07-26.md`
- `docs/teacher-two-line-comment-minimum-test-items-ver1-2026-07-26.md`

この記録は実装の許可を意味しない。現時点では、Apps Script、スプレッドシート、通常アプリ、試験環境、公開環境を作成・変更しない。

## 2. 決定状況

| 議題 | 内容 | 状態 | 承認日 |
|---|---|---|---|
| 第1議題 | 1行30文字の数え方 | 承認済み | 2026年7月26日 |
| 第2議題 | 試験環境の分離方法 | 承認済み | 2026年7月26日 |
| 第3議題 | 各IDの発行形式 | 承認済み | 2026年7月26日 |
| 第4議題 | 第1段階用APIの要求・返却形式 | 承認済み | 2026年7月26日 |
| 第5議題 | 差し戻し理由・予約取消理由・公開取り下げ理由の文字数と入力規則 | 承認済み | 2026年7月26日 |
| 第6議題 | 自動開始・自動終了の履歴 | 承認済み | 2026年7月26日 |
| 第7議題 | 試験データの保管・削除手順 | 承認済み | 2026年7月26日 |
| 第8議題 | 復旧不能な不整合の記録・警告・解消方法 | 承認済み | 2026年7月27日 |
| 第9議題 | 既存の作成途中コメントがある場合の `create_draft` | 承認済み | 2026年7月31日 |
| 第10議題 | 「要求処理結果」とN-01の整合性・事故記録 | 承認済み | 2026年7月31日 |

## 3. 第1議題「1行30文字の数え方」

### 3.1 決定文

> 1行30文字の文字数は、利用者が画面上で一文字と認識する「見た目上の文字」を単位とし、Unicodeの拡張書記素クラスタとして数える。
>
> 入力文字列はUnicode NFCで標準化する。改行が含まれていないことを確認した後、文頭・文末の空白を除去して文字数を数える。文章途中の半角空白・全角空白は、それぞれ1文字として数える。
>
> 絵文字、国旗、結合文字なども、一つに表示されるものは1文字とする。
>
> 下書きは空欄でも保存できるが、入力済みの行は30文字以内とする。確認依頼時は2行とも1～30文字を必要とする。31文字以上は自動で切らずに拒否する。
>
> 画面側とApps Script側は同じ計数規則と共通の確認用文字列を使用し、最終判定はApps Script側で行う。
>
> 文頭・文末の空白除去は、画面側とApps Script側の両方でJavaScriptの`String.prototype.trim()`相当の同じ規則を使う。実装時には、通常の日本語、分離した濁点、絵文字、国旗、家族絵文字、キーキャップ絵文字、半角空白、全角空白を含む共通確認用文字列を両側で数え、結果がすべて一致しない限り保存処理の試験へ進まない。

### 3.2 処理順

1. NFCで標準化する
2. 改行の有無を検査する
3. 文頭・文末の空白を`String.prototype.trim()`相当の規則で除去する
4. Unicodeの拡張書記素クラスタを数える
5. 下書き保存または確認依頼の条件を判定する

改行検査は空白除去より先に行う。文頭または文末に改行があっても、空白除去によって見逃さないためである。

### 3.3 操作ごとの条件

| 操作 | 各行の条件 |
|---|---|
| 下書き保存 | 空欄を許可する。入力済みの行は1～30文字 |
| 確認依頼 | 1行目・2行目とも1～30文字 |
| 31文字以上 | 自動で切らず、保存または確認依頼を拒否 |

拒否した場合も、先生が入力した文章を画面から消さず、修正できる状態を保つ。表示文の候補は次とする。

> 30文字以内で入力してください。現在31文字です。

### 3.4 共通確認用文字列

画面側とApps Script側で、少なくとも次の種類を含む同一の確認用文字列を使用する。

| 種類 | 例 | 期待する数え方 |
|---|---|---|
| 通常の日本語 | `碁` | 1文字 |
| 分離した濁点 | `か`＋結合濁点 | NFC標準化後に1文字 |
| 絵文字 | `😊` | 1文字 |
| 国旗 | `🇯🇵` | 1文字 |
| 家族絵文字 | `👨‍👩‍👧‍👦` | 1文字 |
| キーキャップ絵文字 | `1️⃣` | 1文字 |
| 文章途中の半角空白 | `囲碁 サロン` | 半角空白を1文字に含める |
| 文章途中の全角空白 | `囲碁　サロン` | 全角空白を1文字に含める |

通常の日本語、上記の結合文字・絵文字・空白、30文字ちょうど、31文字を含む確認セットを用意する。画面側とApps Script側の全結果が一致しない場合、使用する文字分割処理を採用せず、保存処理の試験へ進まない。

### 3.5 実装上の境界

- この決定では、具体的な文字分割APIやライブラリを固定しない。
- どの方法を選ぶ場合も、画面側とApps Script側で同じ結果になることを共通確認用文字列で確認する。
- 安全上の最終判断はApps Script側とする。
- 画面側で30文字と表示されても、Apps Script側で上限超過と判定された場合は保存しない。

## 4. 参照資料

- [Unicode Standard Annex #15: Unicode Normalization Forms](https://www.unicode.org/reports/tr15/)
- [Unicode Standard Annex #29: Unicode Text Segmentation](https://www.unicode.org/reports/tr29/)
- [ECMAScript Internationalization API Specification](https://tc39.es/ecma402/)
- [RFC 9562: Universally Unique IDentifiers](https://www.rfc-editor.org/info/rfc9562/)
- [Web Apps | Apps Script | Google for Developers](https://developers.google.com/apps-script/guides/web)
- [Class TextOutput | Apps Script | Google for Developers](https://developers.google.com/apps-script/reference/content/text-output)
- [Class Utilities | Apps Script | Google for Developers](https://developers.google.com/apps-script/reference/utilities/utilities)
- [Installable Triggers | Apps Script | Google for Developers](https://developers.google.com/apps-script/guides/triggers/installable)
- [Container-bound Scripts | Apps Script | Google for Developers](https://developers.google.com/apps-script/guides/bound)
- [Create and manage deployments | Apps Script | Google for Developers](https://developers.google.com/apps-script/concepts/deployments)
- [Recover a deleted file in Google Drive | Google Drive Help](https://support.google.com/drive/answer/1716222)
- [Recommended Emoji ZWJ Sequences | Unicode](https://unicode.org/emoji/charts/emoji-zwj-sequences.html)
- [Chapter 5: Implementation Guidelines | Unicode](https://unicode.org/versions/Unicode17.0.0/core-spec/chapter-5/)

## 5. 第2議題「試験環境の分離方法」

### 5.1 決定文

> 第1段階では、本番アプリ、本番スプレッドシート、既存Apps Scriptから完全に分離した試験環境を新規作成する。
>
> スプレッドシート名は  
> `【試験専用・本番接続禁止】先生2行コメント 第1段階 シート YYYY-MM-DD`
>
> Apps Script名は  
> `【試験専用・本番接続禁止】先生2行コメント 第1段階 GAS YYYY-MM-DD`
>
> 共通環境IDは  
> `teacher-two-line-comment-phase1-YYYYMMDD-A`
>
> 試験用先生IDは  
> `trial-teacher-001`
>
> とする。`YYYY-MM-DD`と`YYYYMMDD`には、実際に試験環境を作成する日を入れる。
>
> 再試験環境を作る場合は、共通環境IDの末尾を`B`、`C`の順に変更し、以前の環境を上書きしない。
>
> 第1段階のApps Scriptは、試験用スプレッドシートへ紐づけたコンテナバインド形式ではなく、Google Drive上で独立して管理できるスタンドアロン形式として作成する。スプレッドシートとApps Scriptは、それぞれ別のファイルID、名称、保管・削除承認を持つ。
>
> 試験用コードには、本番アプリ、本番スプレッドシート、既存Apps ScriptのURLやIDを登録しない。Apps Scriptは環境状態、環境ID、試験用スプレッドシートID、試験専用の名前を処理前に検証し、一つでも不一致の場合は読み書きを行わない。
>
> 第1段階では、試験用デプロイを通常アプリへ接続しない。

### 5.2 試験環境の名称

| 対象 | 名称 |
|---|---|
| スプレッドシート | `【試験専用・本番接続禁止】先生2行コメント 第1段階 シート YYYY-MM-DD` |
| Apps Script | `【試験専用・本番接続禁止】先生2行コメント 第1段階 GAS YYYY-MM-DD` |
| 共通環境ID | `teacher-two-line-comment-phase1-YYYYMMDD-A` |
| 試験用先生ID | `trial-teacher-001` |
| Apps Script形式 | Google Drive上で独立して管理するスタンドアロン形式 |

Google Drive上でスプレッドシートとApps Scriptが並んでも区別できるよう、名称にそれぞれ`シート`と`GAS`を含める。両方の名前の先頭には、必ず`【試験専用・本番接続禁止】`を付ける。

Apps Scriptは試験用スプレッドシートへ紐づけず、スタンドアロン形式で作成する。スプレッドシートとApps Scriptは、別々のGoogle DriveファイルとしてファイルIDと名称を記録し、保管・削除時も一件ずつ個別に確認する。

### 5.3 Apps Scriptへ登録する接続情報

試験用Apps ScriptのScript Propertiesには、作成後に次の情報だけを接続先として登録する。

```text
ENVIRONMENT_ID
teacher-two-line-comment-phase1-YYYYMMDD-A

TRIAL_SPREADSHEET_ID
試験用スプレッドシートのID

ENVIRONMENT_STATUS
ACTIVE
```

- `TRIAL_SPREADSHEET_ID`には、今回新規作成する試験用スプレッドシートのIDだけを登録する。
- `ENVIRONMENT_STATUS`は、試験操作を許可する`ACTIVE`、復旧不能な不整合による停止状態の`INCONSISTENT`、保管状態の`ARCHIVED`の3種類だけを使用する。
- 本番スプレッドシート、既存Apps Script、通常アプリのURLやIDを登録しない。
- スプレッドシートIDを画面やAPI要求から受け取らない。
- 利用者側から接続先IDを指定または上書きできないようにする。
- Apps Scriptは、Script Propertiesに登録した`TRIAL_SPREADSHEET_ID`だけを使用する。

### 5.4 読み書き前の環境検査

Apps Scriptは、保存・取得・履歴追記などの処理を始める前に、毎回次を順番どおり確認する。

1. スプレッドシートを開く前に、`ENVIRONMENT_STATUS`が`ACTIVE`と完全一致する
2. `ENVIRONMENT_ID`が、その試験環境用に決めた値と一致する
3. 接続先が、Script Propertiesに登録済みの`TRIAL_SPREADSHEET_ID`と一致する
4. 接続先スプレッドシートの名前が`【試験専用・本番接続禁止】`で始まる

`ENVIRONMENT_STATUS`が`ACTIVE`以外、不正、未設定、取得不能の場合は、通常の読み取り・書き込み・公開GETについて、スプレッドシートを開かず、現在値と履歴を変更せず、安全な`temporary_error`を返して処理を停止する。例外として、`INCONSISTENT`または事故記録を持つ`ARCHIVED`では、スプレッドシートを開かずScript Propertiesだけを読む`get_integrity_status`を許可する。その他の検査も、一つでも不一致、未設定、取得不能がある場合は、スプレッドシートの読み書きを行わず処理を停止する。誤った接続先へ試し書きをして確認する方式にはしない。

### 5.5 再試験環境

- 最初の環境は末尾`A`とする。
- 新しい試験環境を作る場合は、末尾を`B`、`C`の順に変更する。
- 以前のスプレッドシート、Apps Script、環境IDを上書きまたは再利用しない。
- 各環境のスプレッドシートIDと環境IDを混ぜない。

### 5.6 第1段階で接続しないもの

- 通常アプリ
- 本番スプレッドシート
- 既存Apps Script
- 公開中のウェブアプリ
- 本番または実在の先生データ

第1段階では、試験用Apps Scriptと試験用スプレッドシートの間だけで、ダミーデータによる保存処理を確認する。

## 6. 第3議題「各IDの発行形式」

### 6.1 決定文

> `comment_id`、`event_id`、`request_id`は、種類を示す接頭辞とランダムなUUIDv4を組み合わせて発行する。形式はそれぞれ`cmt_<UUIDv4>`、`evt_<UUIDv4>`、`req_<UUIDv4>`とする。
>
> ID全体には、半角小文字の英数字、ハイフン、および接頭辞直後のアンダースコア1文字だけを使用する。UUIDv4は、`8文字-4文字-4文字-4文字-12文字`の文字列表現とする。
>
> `comment_id`は、新しいコメントを初めて作成する時にApps Scriptが発行する。書き直しや差し戻し後も同じ値を維持し、新しい催しのコメントには新しい値を発行する。
>
> `event_id`は、変更履歴へ1行追加する時にApps Scriptが発行する。
>
> `comment_id`または`event_id`が既存のIDと一致した場合は、既存記録を上書きせず、新しいUUIDv4を発行し直す。
>
> `request_id`は、画面または第1段階の試験送信側が、1つの操作を送信する直前に発行する。同じ操作の結果確認や通信上の再送では同じ値を維持する。操作または送信内容が変わった場合は、新しい`request_id`を発行する。
>
> 同じ`request_id`と同じ要求内容が処理済みの場合は`duplicate`として扱い、再実行しない。同じ`request_id`が異なる操作または異なる内容に使われた場合は`invalid_request`として拒否する。
>
> 第1段階では、先生操作の`actor_id`を`trial-teacher-001`、管理者操作を`trial-admin-001`、システム処理を`system`とする。これらはApps Script側の試験設定と許可された操作種別から決定し、画面やPOST本文から受け取った`actor_id`を使用しない。
>
> 第2段階以降は、先生の`actor_id`を先生用セッションに結び付いた`teacher_id`から、管理者の`actor_id`を管理者セッションから決定する。
>
> IDには氏名、メールアドレス、日時その他の個人情報を含めない。一度発行したIDは変更・再利用しない。IDは識別専用であり、パスワード、認証トークン、権限判定の証明として使用しない。

### 6.2 IDの形式と発行元

| ID | 形式 | 第1段階の発行・決定元 |
|---|---|---|
| `comment_id` | `cmt_<UUIDv4>` | Apps Script |
| `event_id` | `evt_<UUIDv4>` | Apps Script |
| `request_id` | `req_<UUIDv4>` | 操作を送る画面または試験送信側 |
| 先生の`actor_id` | `trial-teacher-001` | Apps Script側の試験設定と操作種別 |
| 管理者の`actor_id` | `trial-admin-001` | Apps Script側の試験設定と操作種別 |
| システムの`actor_id` | `system` | Apps Script内部 |

### 6.3 形式検査

`comment_id`、`event_id`、`request_id`は、次の共通規則で検査する。

```text
^(cmt|evt|req)_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$
```

この規則により、次を確認する。

- 接頭辞は`cmt`、`evt`、`req`のいずれか
- 接頭辞直後にアンダースコアが1文字だけある
- UUID部分は小文字の16進数
- UUIDv4の版番号を示す位置が`4`
- バリアント位置が`8`、`9`、`a`、`b`のいずれか
- UUID部分の桁数とハイフン位置が正しい

例:

```text
cmt_3f15de91-4eac-4a44-80c1-16e7e569f546
evt_89f73c77-1a35-4fc1-b092-f99f8ab902c8
req_50f03e1d-aaba-450c-935b-c8ed7895aca8
```

### 6.4 `comment_id`の使用規則

- 新しいコメントを初めて作る時にApps Scriptが発行する。
- 同じコメントの下書き保存、確認依頼、差し戻し、書き直し、承認では変更しない。
- 新しい催しや活動のコメントには、新しい`comment_id`を発行する。
- 既存の`comment_id`との重複を検出した場合は、既存記録を上書きせず再発行する。
- コメントが終了、取消、取り下げ、削除の対象になった後も、別のコメントへ再利用しない。

### 6.5 `event_id`の使用規則

- 「コメント変更履歴」へ1行追加する時にApps Scriptが発行する。
- 履歴1行につき1つの`event_id`を使用する。
- 既存の`event_id`との重複を検出した場合は、既存履歴を上書きせず再発行する。
- 履歴が保管または削除の対象になった後も、別の履歴へ再利用しない。

### 6.6 `request_id`の使用規則

- 1つの論理的な操作を送信する直前に、送信側が発行する。
- 同じ操作について、通信結果の確認または通信上の再送を行う場合は、同じ`request_id`を使用する。
- 操作名、対象、本文、公開期間など、要求内容のいずれかを変更した場合は、新しい`request_id`を発行する。
- 同じ`request_id`と同じ要求内容が処理済みなら、処理を再実行せず`duplicate`を返す。
- 同じ`request_id`が異なる操作または異なる要求内容に使われた場合は、`invalid_request`として拒否する。
- 一度使った`request_id`を別の操作へ再利用しない。

### 6.7 `actor_id`と権限の分離

第1段階ではセッションをまだ実装しないため、`actor_id`は本人確認情報ではなく、分離された試験環境内で履歴の操作種別を識別する固定値として扱う。

- 先生に許可された操作は、Apps Script側で`trial-teacher-001`を設定する。
- 管理者に許可された操作は、Apps Script側で`trial-admin-001`を設定する。
- 自動処理は、Apps Script内部で`system`を設定する。
- POST本文や画面から送られた`actor_id`を、権限判定または履歴記録の根拠にしない。
- 第2段階以降は、先生用・管理者用の短期セッションから`actor_id`を決定する。

IDは記録を識別するための値であり、IDを知っていることを本人確認や操作権限の証明として扱わない。

## 7. 第4議題「第1段階用APIの要求・返却形式」

### 7.1 決定文

> 第1段階では、管理・保存・管理用読み取りをJSONによるHTTP POSTで`doPost(e)`へ送り、一般公開用の`get_public_comment`だけをHTTP GETで`doGet(e)`へ送る。返却はJSON形式の`TextOutput`とし、成否はJSON本文の`result`で判定する。
>
> 第1段階の管理用APIにはセッション認証がないため、編集権限者だけが利用できるApps Scriptのテストデプロイ`/dev`だけを使用し、公開用`/exec`として一般公開しない。ダミーデータだけを扱い、先生、通常アプリ、本番環境へ接続しない。
>
> POST要求の最上位項目は、`schemaVersion`、`environmentId`、`operation`、書き込み時の`requestId`、既存コメントを対象とする場合の`commentId`、書き込み時の`expectedVersionNo`、および`payload`に固定する。`commentId`と`expectedVersionNo`は対象指定・競合防止に使う共通制御項目として最上位に置き、本文、日時、理由、確認フラグなどの業務上の操作固有値はすべて`payload`内に置く。
>
> 画面または試験送信側から、`actor_id`、役割、状態、履歴ID、操作日時、接続先IDなどを受け取らない。これらはApps Scriptが試験設定と処理結果から決定する。
>
> 1回の書き込み操作につき、現在値の変更と履歴1行の追記を一つの排他処理で行う。本文を保存する操作だけが`version_no`を増やす。`request_review`では、正規化後の本文が直前の下書きと同一でも、確認対象として固定するため`version_no`を1増やす。
>
> `request_fingerprint`は、固定順序の正規化済み要求をJSON文字列化し、UTF-8のSHA-256で算出する。同じ`requestId`と同じ指紋は`duplicate`、異なる指紋は`invalid_request`とする。
>
> 公開APIの返却形式、ISO 8601の`+09:00`、`Asia/Tokyo`の使用は承認済み仕様書どおりとする。通信結果不明時に、元の`requestId`の処理結果を照会するAPI、画面、返却内容は引き続き未決定・保留とする。

### 7.2 第1段階で使用する入口

| 用途 | HTTPメソッド | Apps Script入口 | 第1段階での使用 |
|---|---|---|---|
| 管理・保存・管理用読み取り | POST | `doPost(e)` | テストデプロイ`/dev`だけ |
| 一般公開用の単体試験 | GET | `doGet(e)` | `get_public_comment`だけ |

- 返却は`ContentService.createTextOutput()`を用いたJSONとし、MIMEタイプをJSONに設定する。
- Apps Scriptの`TextOutput`では任意のHTTPステータスだけに依存せず、JSON本文の`result`で処理結果を判定する。
- 第1段階では公開用`/exec`として一般公開しない。
- テストデプロイURLを先生または一般利用者へ渡さない。
- 実在する先生または本番のコメントを送らない。
- 通常アプリ、本番スプレッドシート、既存Apps Scriptへ接続しない。
- 第1段階の固定`actor_id`は本人確認または認証を意味しない。

### 7.3 POST要求の共通形式

```json
{
  "schemaVersion": 1,
  "environmentId": "teacher-two-line-comment-phase1-20260726-A",
  "operation": "save_draft",
  "requestId": "req_50f03e1d-aaba-450c-935b-c8ed7895aca8",
  "commentId": "cmt_3f15de91-4eac-4a44-80c1-16e7e569f546",
  "expectedVersionNo": 2,
  "payload": {
    "line1": "8月30日、試験会場でお待ちしています。",
    "line2": "初めての方も気軽にお声がけください。"
  }
}
```

最上位項目の役割は次のとおりとする。

| 項目 | 役割 |
|---|---|
| `schemaVersion` | 整数の`1`で固定 |
| `environmentId` | 第2議題で決めた試験環境IDとの完全一致を確認 |
| `operation` | 許可済みの操作名 |
| `requestId` | 書き込み操作で必須。読み取り操作では使用しない |
| `commentId` | 既存コメントを対象とする操作で使用 |
| `expectedVersionNo` | 既存コメントへの書き込み操作で使用 |
| `payload` | 本文、日時、理由、確認フラグなどの操作固有値 |

- `commentId`と`expectedVersionNo`は、対象指定と競合防止に使う共通制御項目として最上位に置く。
- 業務上の操作固有値は`payload`内だけに置く。
- 操作に不要な最上位項目は送らない。
- 最上位と`payload`内の両方で、未定義の余分な項目を受け取った場合は`invalid_request`とする。
- 任意項目の未指定と、空文字、`null`を同じ値として扱わない。

### 7.4 POST要求で受け取らない項目

次の値は画面または試験送信側から受け取らず、Apps Script側で決定する。

- `actor_id`
- `actor_role`
- `status`
- `event_id`
- `approved_by`
- `withdrawn_by`
- `withdrawal_type`
- 作成日時、更新日時、承認日時、取消・取り下げ日時などのサーバー日時
- スプレッドシートID
- スプレッドシート名
- Apps ScriptのURL
- 変更履歴の内容

これらが要求へ含まれていた場合は、権限や記録の根拠として使用しない。未定義項目として`invalid_request`で拒否する。

### 7.5 書き込み操作

#### `create_draft`

- `requestId`と`payload.line1`、`payload.line2`を使用する。
- `commentId`と`expectedVersionNo`は送らない。
- 2行とも空欄を許可する。
- Apps Scriptが新しい`comment_id`を発行する。
- `version_no`を`1`、状態を`draft`とする。
- 履歴へ`draft_saved`を1行追加する。

#### `save_draft`

- `requestId`、`commentId`、`expectedVersionNo`、`payload.line1`、`payload.line2`を使用する。
- `draft`の本文を保存し、`version_no`を1増やす。
- 履歴へ`draft_saved`を1行追加する。

#### `request_review`

- `requestId`、`commentId`、`expectedVersionNo`、`payload.line1`、`payload.line2`を使用する。
- 本文の検証、最新本文の保存、`version_no`の加算、`draft`から`pending_review`への遷移、履歴追記を一つの処理として行う。
- 正規化後の本文が直前の下書きと同一でも、確認対象の版を固定するため`version_no`を1増やす。
- 履歴へ`review_requested`を1行だけ追加し、同じ操作について別の`draft_saved`履歴を追加しない。
- 差し戻し後の再確認依頼が成功した場合は、現在値の最新差し戻し日時と理由を空にし、過去の差し戻し内容は履歴に残す。

#### `request_revision`

- `requestId`、`commentId`、`expectedVersionNo`、`payload.reason`を使用する。
- `payload.reason`は文字列の必須項目とし、正規化・前後空白除去後の差し戻し理由を1～100文字とする。
- 本文と`version_no`は変更しない。
- `pending_review`から`draft`へ遷移する。
- 履歴へ`revision_requested`を1行追加する。

#### `approve_comment`

- `requestId`、`commentId`、`expectedVersionNo`、`payload.publishStartAt`、`payload.publishEndAt`、`payload.confirmImmediatePublication`を使用する。
- 本文と`version_no`は変更しない。
- `pending_review`から`approved`へ遷移する。
- 開始時刻が処理時点より前で、終了時刻より前の場合は、`confirmImmediatePublication`が`true`でなければ`confirmation_required`を返す。
- 承認が成功した場合は、履歴へ`approved`を1行追加する。

例:

```json
{
  "schemaVersion": 1,
  "environmentId": "teacher-two-line-comment-phase1-20260726-A",
  "operation": "approve_comment",
  "requestId": "req_50f03e1d-aaba-450c-935b-c8ed7895aca8",
  "commentId": "cmt_3f15de91-4eac-4a44-80c1-16e7e569f546",
  "expectedVersionNo": 3,
  "payload": {
    "publishStartAt": "2026-08-20T09:00:00+09:00",
    "publishEndAt": "2026-08-30T18:00:00+09:00",
    "confirmImmediatePublication": false
  }
}
```

#### `cancel_reservation`

- `requestId`、`commentId`、`expectedVersionNo`、`payload.reason`を使用する。
- `payload.reason`は文字列の必須項目とするが、正規化・前後空白除去後の空文字を「理由なし」として受理する。入力する場合は100文字以内とする。
- 本文と`version_no`は変更しない。
- Apps Scriptが`withdrawal_type`を`cancelled_before_start`に設定する。
- 履歴へ`reservation_cancelled`を1行追加する。

#### `withdraw_publication`

- `requestId`、`commentId`、`expectedVersionNo`、`payload.reason`を使用する。
- `payload.reason`は文字列の必須項目とするが、正規化・前後空白除去後の空文字を「理由なし」として受理する。入力する場合は100文字以内とする。
- 本文と`version_no`は変更しない。
- Apps Scriptが`withdrawal_type`を`withdrawn_during_publication`に設定する。
- 履歴へ`publication_withdrawn`を1行追加する。

### 7.6 管理用の読み取り操作

管理用読み取りもPOSTへ統一するが、データを変更しないため`requestId`と`expectedVersionNo`を要求しない。返却にも`requestId`を含めない。

| 操作 | 要求 | 返却 |
|---|---|---|
| `get_own_comments` | `payload`は空。先生IDはサーバーの試験設定から決定 | 対象の先生に属するコメントの最新版一覧 |
| `list_pending_comments` | `payload`は空。管理者IDはサーバーの試験設定から決定 | `pending_review`の最新版一覧 |
| `get_comment_for_review` | 最上位の`commentId`だけを要求 | 対象コメントのその時点の最新版と`versionNo` |

`get_comment_for_review`では`expectedVersionNo`を要求しない。取得結果の`versionNo`を、その後の承認または差し戻し要求で`expectedVersionNo`として使用する。

読み取り成功時の共通形式は次とする。

```json
{
  "schemaVersion": 1,
  "result": "accepted",
  "operation": "get_own_comments",
  "serverNow": "2026-07-26T18:30:00+09:00",
  "data": {
    "comments": []
  }
}
```

- 読み取り結果には、シートの列を無条件でそのまま返さない。
- 操作ごとに定義した許可済み項目だけを返す。
- 管理用読み取りの詳細な返却項目は、画面実装前に操作ごとの許可リストとして確定する。

### 7.7 書き込み成功時の共通返却

```json
{
  "schemaVersion": 1,
  "result": "accepted",
  "operation": "save_draft",
  "requestId": "req_50f03e1d-aaba-450c-935b-c8ed7895aca8",
  "serverNow": "2026-07-26T18:30:00+09:00",
  "data": {
    "commentId": "cmt_3f15de91-4eac-4a44-80c1-16e7e569f546",
    "versionNo": 3,
    "status": "draft"
  }
}
```

- `data`には、操作結果の確認に必要な最小項目だけを返す。
- 書き込み成功時は、少なくとも確定後の`commentId`、`versionNo`、`status`を返す。
- サーバー内部の例外文、関数名、行番号、スプレッドシートID、シート名を返さない。

### 7.8 拒否・失敗時の共通返却

```json
{
  "schemaVersion": 1,
  "result": "invalid_request",
  "operation": "save_draft",
  "requestId": "req_50f03e1d-aaba-450c-935b-c8ed7895aca8",
  "serverNow": "2026-07-26T18:30:00+09:00",
  "error": {
    "message": "入力内容を確認してください。",
    "fields": {
      "line1": "too_long"
    }
  }
}
```

入力欄ごとの安全な理由コードには、少なくとも次を使用する。

- `required`
- `too_long`
- `contains_newline`
- `invalid_format`
- `invalid_date_range`
- `period_overlap`

内部の例外文、関数名、行番号、接続先情報、シート名などは返さない。

第1段階で使用する主な`result`は次のとおりとする。

| `result` | 意味 |
|---|---|
| `accepted` | 正常に受け付けた |
| `duplicate` | 同じ要求が処理済みで、再実行していない |
| `existing_comment` | 作成途中または確認待ちのコメントがすでにあり、新しい下書きを作成していない |
| `version_conflict` | 取得後に版が変わった、または古い画面から操作した |
| `invalid_transition` | 許可されていない状態遷移 |
| `invalid_request` | 形式、入力値、操作名、要求IDの再利用方法が不正 |
| `confirmation_required` | 承認すると直ちに公開されるため、明示確認が必要 |
| `temporary_error` | 完了と断定できない一時エラー |

`unauthorized`と`forbidden`は、第2段階で先生用・管理者用セッションを導入した後に使用する。

### 7.9 `request_fingerprint`

Apps Scriptは、画面または試験送信側から`request_fingerprint`を受け取らず、要求内容から自ら算出する。

次の固定順序の配列を`JSON.stringify()`で文字列化し、そのUTF-8表現からSHA-256を計算する。

```text
[
  schemaVersion,
  environmentId,
  operation,
  serverActorId,
  commentIdまたはnull,
  expectedVersionNoまたはnull,
  操作ごとの固定順序で作った正規化・検証済みpayload
]
```

- `requestId`は指紋へ含めない。
- サーバー時刻、`eventId`、サーバーが自動設定する状態や日時を含めない。
- 未指定値は`null`で表し、空文字と区別する。
- `payload`は操作ごとにキーと順序を固定する。
- 本文はNFC標準化、改行検査、`trim()`後の保存対象値を使用する。
- 公開日時は検証後のISO 8601文字列を使用する。
- `confirmImmediatePublication`と理由も、対象操作では指紋へ含める。
- `Utilities.computeDigest()`を用い、UTF-8のSHA-256を小文字16進数64文字に変換する。

同じ`requestId`について、次のように判定する。

- 同じ指紋: 処理を再実行せず`duplicate`
- 異なる指紋: データを変更せず`invalid_request`

`duplicate`では、最初に確定した操作後の`commentId`、`versionNo`、`status`を`data`へ再掲する。`serverNow`は再送を受けた時点のサーバー時刻とする。

### 7.10 書き込み要求の確認順序

同じ要求の再送を、版番号の変化によって誤って`version_conflict`と判定しないため、次の順序とする。

1. 要求形式と`requestId`の形式を確認する
2. サーバー側で`actor_id`を決定し、正規化済み要求から指紋を算出する
3. 同じ`requestId`の処理済み記録を検索する
4. 処理済みの場合は指紋を比較する
   - 同じ指紋なら、元の確定結果を`duplicate`として返す
   - 異なる指紋なら、`invalid_request`として拒否する
5. 未処理の場合だけ、現在状態、`expectedVersionNo`、入力内容、状態遷移、公開期間を検証する
6. 更新前の現在値を復旧用に保持する
7. 現在値を更新する
8. 変更履歴へ1行追記する
9. 完了結果を返す

現在値更新後の履歴追記失敗と復旧方法は、承認済み実装前仕様書の規則に従う。

### 7.11 一般公開用GET

要求形式:

```text
?schemaVersion=1
&operation=get_public_comment
&teacherId=trial-teacher-001
```

公開中の返却:

```json
{
  "schemaVersion": 1,
  "result": "active",
  "teacherId": "trial-teacher-001",
  "line1": "8月30日、試験会場でお待ちしています。",
  "line2": "初めての方も気軽にお声がけください。",
  "serverNow": "2026-08-30T17:30:00+09:00",
  "publishEndAt": "2026-08-30T18:00:00+09:00"
}
```

公開対象がない場合:

```json
{
  "schemaVersion": 1,
  "result": "no_active_comment",
  "teacherId": "trial-teacher-001"
}
```

一般公開用GETでは、管理情報、下書き、確認待ち、非公開本文、差し戻し理由、履歴、承認者、版番号、内部IDを返さない。

### 7.12 日時形式

- API要求日時は、ISO 8601、秒まで、明示的な`+09:00`を必須とする。
- API返却日時も、ISO 8601、秒まで、明示的な`+09:00`とする。
- タイムゾーンがない日時、`Z`、`+09:00`以外のオフセット、形式不正は受け付けない。
- Apps Scriptとスプレッドシートのタイムゾーンは`Asia/Tokyo`に統一する。

例:

```text
2026-08-30T18:00:00+09:00
```

### 7.13 引き続き保留する事項

通信結果が不明な`request_id`について、過去の確定結果を照会する専用API、画面、要求形式、返却内容は、この議題では決定しない。

最小試験項目`C-07`は、照会方法を別議題で決定するまで保留とする。結果照会方法を決定する際も、元の`request_id`について新しいコメント、版、履歴を作らず確認できることを条件とする。

## 8. 第5議題「差し戻し理由・予約取消理由・公開取り下げ理由の文字数と入力規則」

### 8.1 決定文

> 差し戻し理由、予約取消理由、公開取り下げ理由は、一行の短い文章とし、Unicodeの拡張書記素クラスタで最大100文字と数える。差し戻し理由は1～100文字の必須入力、予約取消理由と公開取り下げ理由は0～100文字の任意入力とする。
>
> 対象となる3操作では`payload.reason`を必ず含め、文字列として送る。項目省略、`null`、数値、配列、オブジェクトは`invalid_request`または`invalid_format`として拒否する。
>
> 入力はNFCで標準化し、改行・行区切り・段落区切りを検査した後、タブその他の禁止制御文字を検査する。その後、前後の空白を`String.prototype.trim()`相当で除去し、拡張書記素クラスタで文字数を数える。
>
> `request_revision`では、前後空白除去後の空文字を`required`として拒否する。`cancel_reservation`と`withdraw_publication`では、空文字を「理由なし」として受理する。
>
> 絵文字のZWJ、バリエーションセレクタ、結合文字など、正常な拡張書記素クラスタを構成する文字は拒否しない。101文字以上は自動で切らず、`too_long`として拒否する。
>
> 正規化後の理由を現在値、変更履歴、`request_fingerprint`に使用する。理由なしは空文字`""`として扱い、`null`や項目省略とは区別する。理由はHTMLとして解釈せず、通常の文字として表示する。
>
> 理由欄へ個人情報、専用リンク、認証情報を記載しないよう画面で案内するが、内容を自動判定する機能は最小試験に含めない。

### 8.2 操作ごとの入力条件

| 操作 | 理由の用途 | `payload.reason` | `trim()`後の条件 |
|---|---|---|---|
| `request_revision` | 差し戻し理由 | 必須の文字列 | 1～100文字。空文字は`required` |
| `cancel_reservation` | 予約取消理由 | 必須の文字列 | 0～100文字。空文字は理由なし |
| `withdraw_publication` | 公開取り下げ理由 | 必須の文字列 | 0～100文字。空文字は理由なし |

ここで「予約取消理由・公開取り下げ理由は任意」とは、`payload.reason`自体を省略できるという意味ではなく、値を空文字にできるという意味とする。

- `payload.reason`の省略は`invalid_request`
- `null`、数値、真偽値、配列、オブジェクトは`invalid_format`
- 101文字以上は`too_long`
- 101文字以上でも自動で切り詰めない
- 拒否時は入力内容を画面に残し、修正できるようにする

### 8.3 処理順

1. `payload.reason`が存在することを確認する
2. 値が文字列であることを確認する
3. 正常なUnicode文字列として扱えることを確認する
4. NFCで標準化する
5. 改行・行区切り・段落区切りを検査する
6. タブその他の禁止制御文字を検査する
7. 前後の空白を`String.prototype.trim()`相当で除去する
8. Unicodeの拡張書記素クラスタで文字数を数える
9. 操作ごとの必須条件と100文字以内の条件を判定する
10. 正規化後の値を現在値、履歴、`request_fingerprint`に使用する

空欄かどうかの判定は、必ずNFC標準化と前後空白除去の後に行う。

### 8.4 改行として拒否する文字

次を含む場合は`contains_newline`として拒否する。

| 名称 | コードポイント |
|---|---|
| LINE FEED | U+000A |
| CARRIAGE RETURN | U+000D |
| NEXT LINE | U+0085 |
| LINE SEPARATOR | U+2028 |
| PARAGRAPH SEPARATOR | U+2029 |

これらは前後空白除去より先に検査する。理由の先頭または末尾にあっても、`trim()`によって消える前に検出する。

### 8.5 `invalid_format`として拒否するもの

- タブ U+0009
- 改行として別途定義したものを除く、その他のC0・C1制御文字
- 孤立した上位サロゲートまたは下位サロゲートなど、正常なUnicode文字列として扱えないもの
- 文字列以外の値

「見えない文字」という理由だけで一律に拒否しない。次の正常な文字は拒否対象に含めない。

- 結合文字
- 絵文字のバリエーションセレクタ
- U+200D ZERO WIDTH JOINER
- その他、正常な拡張書記素クラスタを構成する文字

### 8.6 保存と履歴

#### 差し戻し理由

正規化後の値を次へ保存する。

- 「コメント現在値」の`latest_return_reason`
- 「コメント変更履歴」の`reason`

差し戻し後の再確認依頼が成功した場合は、現在値の`latest_return_reason`を空にする。過去の理由は履歴に残す。

#### 予約取消理由・公開取り下げ理由

正規化後の値を次へ保存する。

- 「コメント現在値」の`withdrawal_reason`
- 「コメント変更履歴」の`reason`

理由なしの場合は、空文字`""`として扱い、シートでは空欄として保存する。`null`や項目省略には置き換えない。

### 8.7 二重処理防止との関係

- NFC標準化と前後空白除去後の理由を`request_fingerprint`へ含める。
- 理由なしは空文字`""`を含める。
- `null`または項目省略を空文字と同じ指紋にはしない。
- 同じ`requestId`の再送では、同じ正規化後理由を使用する。
- 同じ`requestId`で異なる理由を送った場合は`invalid_request`とする。

### 8.8 表示と運用上の安全対策

- 理由はHTMLとして挿入せず、`textContent`相当の通常文字として表示する。
- 理由欄には、電話番号、メールアドレス、専用リンク、入口・セッショントークン、第三者の個人情報を記載しないよう画面で案内する。
- 個人情報などを内容から自動判定する機能は、最小試験に含めない。
- 理由は短い確認・記録欄であり、長い連絡や個別相談の用途には使用しない。

## 9. 第6議題「自動開始・自動終了の履歴」

### 9.1 決定文

> 第1段階では、`publication_started`および`publication_ended`の履歴行を自動追記しない。時間主導トリガー、開始・終了履歴を追記する定期処理、読み取り時の履歴補完処理も作成しない。
>
> 内部状態が`approved`のコメントは、1回の要求処理の開始時に取得した同一の`serverNow`と公開期間を比較し、開始前を「公開予約」、開始日時以上・終了日時未満を「公開中」、終了日時以上を「終了」と算出する。内部状態が`withdrawn`の場合は時刻判定より優先し、`withdrawal_type`により「予約取消済み」または「公開取り下げ済み」と表示する。
>
> APIへ返す`serverNow`と、公開状態の判定に使う時刻には、同じ値を使用する。1回の要求処理中に時刻を取り直して、判定と返却を食い違わせない。
>
> 時刻による表示状態の変化では、内部状態、`version_no`、`updated_at`、コメント現在値、コメント変更履歴を変更しない。読み取りアクセスをきっかけに開始・終了履歴を後付けしない。
>
> 第1段階で履歴へ残すのは、人が行った承認、予約取消、公開取り下げなどの操作とする。承認履歴には公開開始・終了日時のスナップショットを保存する。開始時刻を過ぎたコメントを即時公開として承認した場合も、履歴へ追加するのは`approved`の1行だけとする。
>
> `publication_started`、`publication_ended`、システム用`actor_id`の`system`は将来用の予約名として維持するが、第1段階では使用しない。将来、自動履歴が必要になった場合は、時間主導トリガー、実行遅延、二重記録防止、失敗時の復旧を別途設計する。第1段階の公開期間へ遡って開始・終了履歴を自動生成しない。

### 9.2 表示状態の判定

1回の要求処理の開始時に、Apps Scriptが`serverNow`を1回だけ取得する。同じ値を、その要求内のすべての時刻比較とAPI返却に使用する。

| 内部状態・時刻条件 | 画面上の状態 | 一般公開用GET |
|---|---|---|
| `status = approved`かつ`serverNow < publishStartAt` | 公開予約 | `no_active_comment` |
| `status = approved`かつ`publishStartAt <= serverNow < publishEndAt` | 公開中 | `active` |
| `status = approved`かつ`publishEndAt <= serverNow` | 終了 | `no_active_comment` |
| `status = withdrawn`かつ`withdrawal_type = cancelled_before_start` | 予約取消済み | `no_active_comment` |
| `status = withdrawn`かつ`withdrawal_type = withdrawn_during_publication` | 公開取り下げ済み | `no_active_comment` |

- 開始時刻ちょうどから「公開中」とする。
- 終了時刻ちょうどから「終了」とする。
- `withdrawn`は公開期間との比較より先に判定する。
- `withdrawal_type`により、開始前の予約取消と公開開始後の取り下げを区別する。
- API返却の`serverNow`に、状態判定後に取り直した別の時刻を使用しない。

### 9.3 時刻経過で変更しないもの

時刻が公開開始または公開終了の境界を越えても、次を更新しない。

- 内部状態の`approved`
- `version_no`
- `updated_at`
- 「コメント現在値」のその他の列
- 「コメント変更履歴」

公開予約、公開中、終了は、保存された別の内部状態ではなく、`approved`、公開期間、同一の`serverNow`から算出した表示上の状態である。

### 9.4 読み取り操作の副作用禁止

次の読み取り操作では、現在値の更新や履歴追記を行わない。

- `get_own_comments`
- `list_pending_comments`
- `get_comment_for_review`
- `get_public_comment`

最初の読み取りが公開開始後または公開終了後であっても、その読み取りをきっかけに`publication_started`または`publication_ended`を作らない。過去の境界通過を検出して履歴を補完する処理も行わない。

### 9.5 第1段階で残す履歴

| 人が行う操作 | 履歴の`event_type` | 時刻・期間の記録 |
|---|---|---|
| 承認 | `approved` | 承認日時と公開開始・終了日時のスナップショット |
| 開始前の予約取消 | `reservation_cancelled` | 取消日時、本来の公開期間、操作者、任意理由 |
| 公開中の取り下げ | `publication_withdrawn` | 取り下げ日時、本来の公開期間、操作者、任意理由 |

開始時刻が処理時点より前で、終了時刻より前のコメントを即時公開として承認した場合も、`approved`を1行だけ追加する。`publication_started`を同時追加しない。

### 9.6 第1段階で作成しないもの

- 時間主導トリガー
- 開始・終了履歴を追記する定期実行処理
- 読み取り操作をきっかけに履歴を補完する処理
- 過去の開始・終了履歴を後から一括生成する処理

時間主導トリガーは第1段階の試験環境にも作成しない。

### 9.7 将来用に予約するもの

次の名前は承認済み仕様書との互換性を保つため、将来用の予約名として残す。

- `publication_started`
- `publication_ended`
- システム用`actor_id`の`system`

第1段階では、これらを持つ履歴行を生成しない。将来、自動履歴を導入する場合は、少なくとも次を別の設計会議で決定する。

- 時間主導トリガーの実行間隔と時刻のずれ
- 同じ境界について履歴を重複作成しない方法
- トリガー停止・失敗時の検出と復旧
- 現在値更新と履歴追記の整合性
- 試験終了後のトリガー削除手順

将来導入する場合も、第1段階で既に経過した公開期間について、開始・終了履歴を自動的に遡及生成しない。

## 10. 第7議題「試験データの保管・削除手順」

### 10.1 決定文

> 第1段階の試験終了直後には、試験データ、試験用スプレッドシート、Apps Scriptを削除しない。最初に新しい試験操作を停止し、環境ID、各ファイルID、名称、現在値件数、履歴件数、試験結果、本番未接続の確認結果を試験終了記録へ残す。
>
> 第1段階のApps Scriptは、試験用スプレッドシートへ紐づけたコンテナバインド形式ではなく、Google Drive上で独立して管理できるスタンドアロン形式として作成する。スプレッドシートとApps Scriptは、それぞれ別のファイルID、名称、保管・削除承認を持つ。
>
> 通常の試験終了による保管状態への移行時は、Script Propertiesの`ENVIRONMENT_STATUS`を`ACTIVE`から`ARCHIVED`へ変更する。復旧不能な不整合から保管へ移る場合は、第8議題の手順に従い、事故記録を`abandoned`へ更新・確認した後に`INCONSISTENT`から`ARCHIVED`へ変更する。
>
> すべてのAPI処理はスプレッドシートへのアクセス前に環境状態を検査し、`ACTIVE`以外では通常処理を停止する。例外として、`INCONSISTENT`または事故記録を持つ`ARCHIVED`では、スプレッドシートを開かずScript Propertiesだけを読む`get_integrity_status`を許可する。名称変更は第二の安全確認として使用し、名称だけを唯一の停止手段としない。
>
> 悦子さんの確認後、スプレッドシートとApps Scriptの名称を`【試験終了・操作禁止】`で始まる保管用名称へ変更する。保管中はデータを追加・修正しない。
>
> 第1段階ではHead deploymentの`/dev`だけを試験に使用する。Head deployment自体を削除したとは記録せず、環境状態を`ARCHIVED`に変更し、編集権限を整理したため処理不能であると記録する。Versioned deploymentが誤って存在した場合は自動で変更せず、識別情報を記録し、悦子さんの別途承認後にアーカイブする。
>
> 試験資産は試験結果承認日から90日間保管する。期限到達時にも自動削除せず、必要性を再確認する。削除する場合は、環境ID、各ファイルID、名称、件数が試験終了記録とすべて一致する対象だけを、悦子さんの最終承認後に一件ずつGoogle Driveのゴミ箱へ移す。
>
> スクリプトによる試験環境全体の自動削除、検索名だけによる削除、一括削除、ゴミ箱の一括消去、完全削除は行わない。本番または別の試験環境と一つでも識別情報が一致しない場合は処理を停止する。
>
> 生のトークン、専用リンク、認証情報、個人情報を含む不要な証拠は保管しない。第1段階では入口・セッションを使用していないことを終了記録へ明記する。

### 10.2 Apps Scriptの作成形式

第1段階のApps Scriptは、Google Drive上で独立して管理するスタンドアロン形式とする。

- 試験用スプレッドシートへ紐づけたコンテナバインド形式では作成しない。
- スプレッドシートとApps Scriptは、それぞれ別のGoogle Driveファイルとして管理する。
- 両方のファイルIDと名称を、試験環境作成時と試験終了時に記録する。
- 保管、名称変更、ゴミ箱への移動は一件ずつ別の操作として承認する。
- 一方のファイルに対する承認を、他方のファイルの変更・削除承認として扱わない。

### 10.3 試験終了記録へ残すもの

試験環境ごとに、次を非公開の試験終了記録へ残す。

- 共通環境ID
- 試験用先生ID
- スプレッドシートの元の名称、保管用名称、ファイルID
- Apps Scriptの元の名称、保管用名称、ファイルID
- Apps Scriptがスタンドアロン形式であること
- 試験に使用したデプロイ種別
- Head deployment／`/dev`の終了時の扱い
- Versioned deploymentの有無、存在する場合は識別情報と状態
- 試験開始日時と終了日時
- 「コメント現在値」のデータ行数と状態別件数
- 「コメント変更履歴」のデータ行数と`event_type`別件数
- 最初と最後の履歴発生日時
- 必須試験の判定結果
- 保留、未実施、不合格の一覧
- 本番スプレッドシート、既存Apps Script、通常アプリへ接続していないことの最終確認結果
- 入口・セッションを使用していないこと
- 最終確認者と確認日時
- 保管開始日、90日後の見直し予定日、延長した場合は次回見直し日

スプレッドシートとApps ScriptのファイルID、デプロイ識別情報は、削除対象を正確に照合するための非公開管理情報とする。公開リポジトリや一般向け資料へ記載しない。

### 10.4 保管しないもの

- 生の入口トークンまたはセッショントークン
- 専用リンク
- OAuthトークンその他の認証情報
- 不要な一時ログまたはデバッグ出力
- 個人情報を含む試験証拠
- 本番のURLまたはID
- 実在する先生、参加者、対局者の情報

第1段階では入口・セッションを使用しないため、トークンや専用リンクの値を作成・保管せず、試験終了記録には「使用なし」とだけ記載する。

### 10.5 保管状態への移行順序

次の順序を変更しない。

1. 新しい試験要求の送信を停止する
2. 環境ID、各ファイルID、元の名称、件数、試験結果を記録する
3. 本番、既存Apps Script、通常アプリが未変更・未接続であることを確認する
4. 必要な試験証拠を保存する
5. 悦子さんが試験終了記録と保管対象を確認する
6. 通常の保管移行として、Script Propertiesの`ENVIRONMENT_STATUS`を`ACTIVE`から`ARCHIVED`へ変更する
7. APIを呼び出し、スプレッドシートを開かず処理が拒否されることを確認する
8. スプレッドシート名を保管用名称へ変更する
9. Apps Script名を保管用名称へ変更する
10. 不要な編集者がいる場合は、対象を確認してから権限を解除する
11. Head deploymentとVersioned deploymentの状態を確認して記録する
12. 保管開始日と90日後の見直し予定日を記録する

`ARCHIVED`への変更が確認できない場合は、名称変更や権限整理へ進まない。`ARCHIVED`変更後のAPI確認でスプレッドシートへアクセスした形跡がある場合も、保管完了とせず作業を停止する。

この順序は、正常に終了した試験環境を`ACTIVE → ARCHIVED`で保管する場合に使用する。復旧不能な不整合を保管する場合はこの通常手順へ直接入らず、第8議題で事故記録を`abandoned`へ更新・確認した後、`INCONSISTENT → ARCHIVED`とし、その後に名称変更・権限整理・デプロイ状態の記録を行う。

### 10.6 `ENVIRONMENT_STATUS`

Script Propertiesには、次のいずれかだけを保存する。

| 値 | 意味 | APIの扱い |
|---|---|---|
| `ACTIVE` | 第1段階の試験操作を許可 | 他の環境検査へ進む |
| `INCONSISTENT` | 復旧不能な不整合による停止状態 | 通常処理を停止し、`get_integrity_status`だけを許可 |
| `ARCHIVED` | 試験終了または復旧断念後の保管状態 | 通常処理を停止し、事故記録がある場合だけ`get_integrity_status`を許可 |

- 大文字・小文字を含め完全一致で検査する。
- 未設定、空文字、その他の値は`ACTIVE`として扱わない。
- すべてのPOSTとGETで、スプレッドシートを開く前に検査する。
- `ACTIVE`以外では通常の読み取り・書き込み・公開GETを停止し、現在値と履歴を変更しない。
- `ACTIVE`以外では原則として安全な`temporary_error`を返し、内部設定値やファイルIDを返さない。
- 例外として、`INCONSISTENT`または事故記録を持つ`ARCHIVED`では、スプレッドシートを開かずScript Propertiesだけを読む`get_integrity_status`を許可する。
- `get_integrity_status`は第8議題で定めた最小情報だけを返し、通常処理、復旧処理、環境状態の変更を行わない。
- 通常の保管移行は`ACTIVE → ARCHIVED`、不整合からの保管移行は`INCONSISTENT → ARCHIVED`とする。
- `ARCHIVED`は第1段階の終点とし、`ARCHIVED → ACTIVE`は行わない。
- 再試験が必要な場合は、保管済み環境を再開せず、末尾`B`または`C`の新しい試験環境を悦子さんの別途承認後に作成する。
- 名称を元へ戻しただけでは、`ARCHIVED`状態を解除しない。

`ENVIRONMENT_STATUS`を第一の停止手段、保管用名称への変更を目で確認できる第二の停止手段とする。

### 10.7 保管用名称

```text
【試験終了・操作禁止】先生2行コメント 第1段階 シート YYYY-MM-DD
【試験終了・操作禁止】先生2行コメント 第1段階 GAS YYYY-MM-DD
```

- 元の名称と保管用名称を試験終了記録へ両方残す。
- 名称変更前に、必ず`ENVIRONMENT_STATUS = ARCHIVED`を確認する。
- 保管用名称または元の名称へ変更しても、`ARCHIVED`状態の環境を再開しない。
- 再試験が必要な場合は、対象、理由、新しい環境ID、試験期間、終了後の保管手順について悦子さんの別途承認を得て、末尾`B`または`C`の新しい試験環境を作成する。

### 10.8 デプロイの扱い

#### Head deployment／`/dev`

- Apps Scriptプロジェクトに存在する試験用のHead deploymentとして扱う。
- 第1段階終了時に「削除済み」とは記録しない。
- 終了記録には、次のように記載する。

```text
Head deployment／dev：
存在するが、ENVIRONMENT_STATUSをARCHIVEDとし、
編集権限を整理したため処理不能
```

- `/dev`のURLを通常アプリ、先生、一般利用者へ渡さない。
- 保管中に`/dev`を使った新しい試験操作を行わない。

#### Versioned deployment

- 第1段階では作成しない。
- 試験終了時に、Versioned deploymentがないことを確認する。
- 誤って存在した場合は、その場で変更・アーカイブせず、デプロイID、種類、状態を記録して作業を停止する。
- 悦子さんの別途承認後、Apps Scriptの管理画面から一件ずつアーカイブする。
- アーカイブ後も、識別情報と実施日時を試験終了記録へ残す。

### 10.9 保管期間

- 試験結果を悦子さんが承認した日から90日間保管する。
- 90日到達時に自動削除しない。
- 期限到達時に、次段階の調査や比較に必要かを再確認する。
- 保管を延長する場合は、理由と次回見直し日を記録する。
- 削除承認がない場合は保管を継続する。
- 保管中は、試験データ、コード、Script Propertiesを追加・修正しない。

### 10.10 削除対象の確定条件

削除候補は、次のすべてが試験終了記録と一致したものだけとする。

- 共通環境ID
- 試験用先生ID
- スプレッドシートのファイルID
- Apps ScriptのファイルID
- 両ファイルの元の名称
- 両ファイルの保管用名称
- 「コメント現在値」の記録済み件数
- 「コメント変更履歴」の記録済み件数
- 本番・通常アプリ未接続の確認結果
- `ENVIRONMENT_STATUS = ARCHIVED`

名前だけ、Driveの検索結果だけ、URLの見た目だけでは削除対象を決めない。一つでも不一致、取得不能、想定外がある場合は削除せず、悦子さんへ報告する。

### 10.11 削除の実行順序

90日後、悦子さんから対象ごとの明確な削除承認を受けた場合だけ、次の順で行う。

1. 現在の環境ID、各ファイルID、名称、件数、環境状態を再取得する
2. 試験終了記録と照合する
3. 有効なVersioned deploymentがないことを確認する
4. 不一致がないことと、削除対象一覧を悦子さんへ報告する
5. スプレッドシートをゴミ箱へ移す最終承認を得る
6. スプレッドシートだけをGoogle Driveのゴミ箱へ移す
7. 対象のファイルIDがゴミ箱にあることを確認する
8. Apps Scriptをゴミ箱へ移す最終承認を別に得る
9. Apps ScriptだけをGoogle Driveのゴミ箱へ移す
10. 対象のファイルIDがゴミ箱にあることを確認する
11. 本番と別の試験環境が残っていることを確認する
12. 削除結果、実施者、実施日時、ゴミ箱へ移した各ファイルIDを記録する

スプレッドシートとApps Scriptは一括操作せず、一件ずつ確認する。行データだけを自動削除する機能や、試験環境全体を自動削除する機能は作らない。

### 10.12 ゴミ箱と完全削除

- Google Driveのゴミ箱へ移す操作を、最終削除段階として扱う。
- ゴミ箱へ移した後は、通常30日間は復元でき、その後完全削除される。
- ゴミ箱を手動で空にしない。
- 他のファイルを巻き込む一括操作を行わない。
- 完全削除を自動実行しない。
- ゴミ箱へ移した直後に、対象ファイルIDと件数を試験終了記録へ追記する。

### 10.13 役割

| 作業 | 担当 |
|---|---|
| 件数・識別情報の読み取りと一覧作成 | Codex君が補助可能 |
| 試験結果の承認 | 悦子さん |
| 保管状態への移行承認 | 悦子さん |
| `ENVIRONMENT_STATUS`変更の承認 | 悦子さん |
| Versioned deploymentのアーカイブ承認 | 悦子さん |
| 削除候補の確認 | 悦子さん |
| スプレッドシートをゴミ箱へ移す最終承認 | 悦子さん |
| Apps Scriptをゴミ箱へ移す最終承認 | 悦子さん |
| 実行後の照合 | Codex君が補助可能 |
| ゴミ箱の一括消去・完全削除 | 自動実行しない |

## 11. 第8議題「復旧不能な不整合の記録・警告・解消方法」

### 11.1 決定文

> 現在値更新後の履歴追記に失敗し、現在値を操作前へ正確に戻せなかった場合、試験環境全体を`INCONSISTENT`として停止する。復旧不能な不整合をコメント1件だけの問題として扱わず、通常の読み取り・書き込み・公開取得をすべて停止する。
>
> Apps Scriptは`ScriptLock`を保持したまま、`ENVIRONMENT_STATUS = INCONSISTENT`を保存・再確認し、固有の`incident_id`を持つ事故記録をScript Propertiesへ保存する。事故記録本体の保存確認後に、`ACTIVE_INTEGRITY_INCIDENT_ID`を設定する。
>
> 事故IDは`inc_<UUIDv4>`とする。事故状態は`open`、`resolved`、`abandoned`の3種類とし、過去の事故記録を上書き・再利用しない。
>
> 事故記録には、発生日時、環境ID、操作名、`request_id`、`request_fingerprint`、`comment_id`、操作前と操作予定後の版番号・スナップショット・照合用ハッシュ、履歴行数、最終`event_id`、追加予定だった`event_id`、発生段階を保存する。生の例外文、接続先ID、URL、認証情報は保存しない。
>
> `INCONSISTENT`中は、通常APIと公開GETを停止する。不整合状態を確認する`get_integrity_status`だけを許可し、スプレッドシートを開かずScript Propertiesから最小情報を返す。
>
> 履歴行が追加されていないこと、操作前スナップショットと現在値が正確に照合できること、他の要求が処理されていないこと、操作前の版へ正確に戻せることのすべてを確認できた場合だけ復旧する。履歴の修正・削除・推測による補完は行わない。
>
> 正確な復旧後、事故記録を`resolved`へ更新してから、悦子さんの確認を経て`ENVIRONMENT_STATUS`を`ACTIVE`へ戻す。正確に復旧できない場合は、事故記録を`abandoned`とし、環境を`ARCHIVED`へ移して新しい試験環境を作る。自動解除、自動再試行、画面だけによる解除は禁止する。

### 11.2 環境状態

`ENVIRONMENT_STATUS`には、次の3種類だけを使用する。

| 値 | 意味 | 通常API |
|---|---|---|
| `ACTIVE` | 第1段階の試験操作を許可 | 他の環境検査へ進む |
| `INCONSISTENT` | 復旧不能な不整合により環境全体を停止 | 読み取り・書き込み・公開GETを停止 |
| `ARCHIVED` | 試験終了または復旧断念後の保管状態 | 読み取り・書き込み・公開GETを停止 |

- 未設定、空文字、その他の値は`ACTIVE`として扱わない。
- `INCONSISTENT`から時間経過や次の要求によって自動的に`ACTIVE`へ戻さない。
- 通常画面の操作だけで`INCONSISTENT`を解除しない。
- `INCONSISTENT`中に新しい保存、確認依頼、承認、取消、取り下げを受け付けない。
- 一般公開用GETは期間限定コメントを返さず、安全な`temporary_error`を返す。
- 将来、通常アプリへ接続する段階では、`temporary_error`を受けた一般アプリは通常コメントを表示する。

許可する状態遷移は次のとおりとする。

```text
ACTIVE → INCONSISTENT
ACTIVE → ARCHIVED
INCONSISTENT → ACTIVE
INCONSISTENT → ARCHIVED
```

- `ACTIVE → INCONSISTENT`は、Apps Scriptが復旧不能な不整合を検出した場合に行う。
- `ACTIVE → ARCHIVED`は、正常に終了した試験環境を通常保管する場合に行う。
- `INCONSISTENT → ACTIVE`は、正確な復旧と悦子さんの確認後だけ行う。
- `INCONSISTENT → ARCHIVED`は、復旧せず環境を保管する場合に行う。
- `ARCHIVED`は第1段階の終点とし、`ARCHIVED → ACTIVE`は許可しない。
- 保管後に再試験が必要な場合は、末尾`B`または`C`の新しい試験環境を別途承認後に作成する。
- `ARCHIVED`へ移した`abandoned`事故を、後から`resolved`へ変更しない。

### 11.3 事故ID

事故IDはApps Scriptが発行し、次の形式とする。

```text
inc_<UUIDv4>
```

形式検査:

```text
^inc_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$
```

- 一度発行した`incident_id`を別の事故へ再利用しない。
- 事故状態が`resolved`または`abandoned`になった後も再利用しない。
- 事故IDを認証情報または権限判定の証明として使用しない。
- 追加予定だった`event_id`が履歴行として保存されなかった場合も、その`event_id`を再利用しない。

### 11.4 Script Propertiesのキー

事故記録には、次の2種類のキーを使用する。

```text
INTEGRITY_INCIDENT_<incident_id>
事故記録本体のJSON

ACTIVE_INTEGRITY_INCIDENT_ID
現在のincident_id
```

- `INTEGRITY_INCIDENT_<incident_id>`は事故ごとに別のキーとし、過去の事故記録を上書きしない。
- `ACTIVE_INTEGRITY_INCIDENT_ID`は、事故記録本体の保存と読み直しが成功した後に設定する。
- 正確に復旧して`resolved`となった場合は、環境を`ACTIVE`へ戻した確認後に`ACTIVE_INTEGRITY_INCIDENT_ID`を空にする。
- 復旧を断念して`abandoned`とした場合は、`ARCHIVED`中の保管記録として現在事故IDを維持する。

事故状態は次の3種類とする。

| 値 | 意味 |
|---|---|
| `open` | 未解決 |
| `resolved` | 正確な復旧と確認が完了 |
| `abandoned` | 復旧せず環境を保管 |

### 11.5 事故記録へ保存する情報

事故記録本体には、少なくとも次を保存する。

- `incident_id`
- `incident_status`
- 発生日時
- `environment_id`
- 操作名
- `request_id`
- `request_fingerprint`
- `comment_id`
- 操作前の`version_no`
- 操作後に予定していた`version_no`
- 操作前の現在値スナップショット
- 操作後に予定していた現在値スナップショット
- 各スナップショットの照合用ハッシュ
- 操作前の履歴行数
- 操作前の最終`event_id`
- 追加予定だった`event_id`
- 復旧不能と判断した処理段階
- 復旧失敗の安全な理由コード
- 解決または保管判断の日時、判断者、方法または理由

次は保存しない。

- 生の例外文
- スタックトレース
- スプレッドシートIDその他の接続先ID
- Apps ScriptまたはスプレッドシートのURL
- 認証情報
- 生の入口トークンまたはセッショントークン

事故記録は非公開のScript Propertiesにだけ保存し、一般公開用GET、通常の管理用読み取り、画面表示へそのまま返さない。

### 11.6 事故発生時の保存順序

Apps Scriptは`ScriptLock`を保持したまま、次の順序で処理する。

1. `incident_id`を発行する
2. `ENVIRONMENT_STATUS = INCONSISTENT`を保存する
3. `ENVIRONMENT_STATUS`を読み直し、`INCONSISTENT`と完全一致することを確認する
4. `INTEGRITY_INCIDENT_<incident_id>`へ事故記録本体を保存する
5. 事故記録本体を読み直し、保存予定内容と一致することを確認する
6. `ACTIVE_INTEGRITY_INCIDENT_ID`へ`incident_id`を保存する
7. 現在事故IDを読み直し、発行した`incident_id`と一致することを確認する
8. `ScriptLock`を解放する

事故記録本体より先に`ACTIVE_INTEGRITY_INCIDENT_ID`を設定しない。

途中で処理に失敗しても、`ENVIRONMENT_STATUS = INCONSISTENT`の保存確認が完了している場合は、通常処理を再開しない。状態変更または読み直し自体に失敗した場合も成功扱いにせず、`temporary_error`を返して試験操作を直ちに中止する。悦子さんがScript Propertiesを確認し、`INCONSISTENT`の設定と読み直しを完了するまで試験を再開しない。

### 11.7 `get_integrity_status`

`get_integrity_status`は、通常の管理・保存APIとは分けた、編集権限者専用の読み取り操作とする。

- 第1段階ではテストデプロイ`/dev`だけで使用する。
- `INCONSISTENT`の場合に使用できる。
- `ARCHIVED`かつ事故記録がある場合にも、保管状態の確認に使用できる。
- スプレッドシートを開かず、Script Propertiesだけを読み取る。
- 現在値、履歴、スナップショット、ハッシュ、`request_fingerprint`、例外詳細、接続先情報を返さない。
- 読み取りをきっかけに事故記録、環境状態、現在値、履歴を変更しない。

返却例:

```json
{
  "schemaVersion": 1,
  "result": "integrity_incident",
  "environmentStatus": "INCONSISTENT",
  "incidentId": "inc_3f15de91-4eac-4a44-80c1-16e7e569f546",
  "occurredAt": "2026-07-27T18:30:00+09:00",
  "operation": "save_draft",
  "commentId": "cmt_3f15de91-4eac-4a44-80c1-16e7e569f546",
  "incidentStatus": "open"
}
```

### 11.8 復旧できる条件

次のすべてを確認できた場合だけ、操作前の状態へ復旧する。

1. 履歴行が実際には追加されていない
2. 操作前スナップショットと現在値を正確に照合できる
3. 操作前の履歴行数と最終`event_id`を正確に照合できる
4. 追加予定だった`event_id`を持つ履歴行が存在しない
5. 不整合発生後に他の要求が処理されていない
6. 操作前の`version_no`へ正確に戻せる
7. 照合用ハッシュが一致する

- 不明な操作を成功扱いにしない。
- 履歴行を修正、削除、並べ替えしない。
- 曖昧な履歴を推測で補完しない。
- 正確に照合できない場合は復旧を実行しない。
- 復旧操作を通常APIまたは通常画面のボタンとして提供しない。
- 復旧は、対象の事故IDと手順について悦子さんの個別承認を得た後に行う。

### 11.9 正確に復旧できた場合の順序

1. `ScriptLock`を取得し、保持したまま第11.8項の復旧条件をすべて再確認する
2. 操作前スナップショットを「コメント現在値」の対象行へ書き戻す
3. 書き戻した対象行をスプレッドシートから読み直す
4. 読み直した対象行を同じ正規化規則でスナップショット化し、操作前スナップショットの照合用ハッシュと完全一致することを確認する
5. 履歴行数と最終`event_id`が、不整合発生時に記録した値から変化していないことを再確認する
6. 追加予定だった`event_id`を持つ履歴行が存在しないことを再確認する
7. ここまでの書き戻し、読み直し、ハッシュ照合、履歴照合がすべて成功した場合だけ、事故記録の`incident_status`を`resolved`へ更新する
8. 解決日時、解決者、解決方法を事故記録へ保存する
9. 事故記録を読み直し、`resolved`と解決情報が保存予定内容と一致することを確認する
10. 復旧書き込みと事故記録の確認完了後に`ScriptLock`を解放する
11. 悦子さんが復旧結果を確認する
12. 環境再開処理で再度`ScriptLock`を取得し、事故記録が`resolved`であり、現在値と履歴の整合が維持されていることを確認する
13. `ENVIRONMENT_STATUS`を`ACTIVE`へ変更する
14. `ENVIRONMENT_STATUS`を読み直し、`ACTIVE`と完全一致することを確認する
15. `ACTIVE_INTEGRITY_INCIDENT_ID`を空にし、空になったことを読み直して確認する
16. `ScriptLock`を解放する

操作前スナップショットの書き戻し、対象行の読み直し、ハッシュ照合、履歴行数または最終`event_id`の再確認のいずれかが失敗した場合は、事故記録を`resolved`へ変更せず、`ENVIRONMENT_STATUS`も`ACTIVE`へ変更しない。事故状態を`open`、環境状態を`INCONSISTENT`のまま維持して処理を停止し、安全な`temporary_error`を返す。

事故記録を`resolved`へ更新する前、または悦子さんの確認前に、環境を`ACTIVE`へ戻さない。`ACTIVE`への変更確認に失敗した場合も環境を再開せず、事故記録と環境状態を再確認する。

### 11.10 復旧せず保管する場合の順序

正確な復旧ができない場合は、無理に修理せず次の順序で保管する。

1. 事故記録の`incident_status`を`abandoned`へ更新する
2. 復旧を断念した理由、判断日時、判断者を記録する
3. 事故記録を読み直し、更新内容を確認する
4. 悦子さんが保管判断と対象環境を確認する
5. `ENVIRONMENT_STATUS`を`ARCHIVED`へ変更する
6. `ENVIRONMENT_STATUS`を読み直し、`ARCHIVED`と完全一致することを確認する
7. `ACTIVE_INTEGRITY_INCIDENT_ID`を消さず、保管記録として維持する
8. 第7議題の手順に従って現在の環境を保管する
9. 必要な場合は、末尾`B`または`C`の新しい試験環境を別途承認後に作成する

- `abandoned`となった事故を後から`resolved`へ変更しない。
- 保管した環境は自動・手動を問わず再開しない。
- 新しい試験環境へ現在値や履歴を推測で引き継がない。
- 試験結果には復旧不能な不整合が発生したことと、該当試験を不合格として記録する。

### 11.11 禁止する処理

- 次の要求をきっかけにした自動再試行
- 現在値または履歴の推測による修正
- 履歴の削除、上書き、並べ替え
- 履歴の後付け補完
- 時間経過による自動解除
- 通常画面のボタンだけによる解除
- 事故記録を保存しないままの環境再開
- 悦子さんの確認を経ない`INCONSISTENT → ACTIVE`

## 12. 第9議題「既存の作成途中コメントがある場合の `create_draft`」

### 12.1 決定文

> 同じ先生に状態が `draft` または `pending_review` のコメントがすでに1件ある場合、別の `requestId` による `create_draft` では、新しい下書きを作成しない。
>
> 既存コメントの本文を上書きせず、`comment_id`、`version_no`、状態、現在値、変更履歴を一切変更しない。新しい `comment_id` および `event_id` も発行しない。
>
> 通信上の同一要求として、同じ `requestId` と同じ要求内容が再送された場合は、従来どおり `duplicate` を返し、初回の確定結果を返す。
>
> 同じ `requestId` を異なる要求内容へ再利用した場合は、承認済みの `request_id` 規則に従い `invalid_request` で拒否する。
>
> 同じ先生に `draft` または `pending_review` が合計2件以上見つかった場合は、どれか1件を選んで `existing_comment` を返してはならない。第8議題の手順に従ってデータ不整合として記録し、環境全体を `INCONSISTENT` へ変更して安全停止する。

### 12.2 判定順序

`create_draft` では、次の順序で判定する。

1. `requestId` と要求内容の指紋を確認する
2. 同一要求が処理済みなら `duplicate` を返す
3. 同じ `requestId` が異なる要求内容に使われていれば `invalid_request` を返す
4. 同じ先生に `draft` または `pending_review` が何件あるか確認する
5. 合計2件以上ある場合は、`existing_comment` を返さず、データ不整合として環境全体を安全停止する
6. 1件だけ存在する場合は `existing_comment` を返し、新しい下書きを作成しない
7. 1件も存在しない場合だけ、新しい下書きを作成する

複数件の検出による安全停止では、第8議題に従って事故記録を保存し、通常の読み取り・書き込み・公開取得を停止する。呼び出し元へは内部情報を含まない安全な `temporary_error` を返す。

### 12.3 既存コメントが1件ある場合の返却

`existing_comment` では、既存コメントを特定するために必要な次の最小項目だけを返す。

- `commentId`
- `versionNo`
- `status`

認証を使用する環境では、認証済みの先生IDと既存コメントの先生IDが一致する場合だけ、これらの項目を返す。一致しない場合は `existing_comment` を返さず、他の先生に属するコメントの存在、識別子、版番号、状態を開示しない。

第1段階では先生用認証をまだ実装しないため、サーバーの試験設定から決定した先生IDと既存コメントの先生IDが一致する場合だけ、同じ最小項目を返す。画面またはPOST本文から受け取った先生IDを本人一致の根拠に使用しない。

本文、履歴、差し戻し理由、管理情報は、この返却へ含めない。

返却例：

```json
{
  "schemaVersion": 1,
  "result": "existing_comment",
  "operation": "create_draft",
  "requestId": "req_50f03e1d-aaba-450c-935b-c8ed7895aca8",
  "serverNow": "2026-07-31T10:00:00+09:00",
  "data": {
    "commentId": "cmt_3f15de91-4eac-4a44-80c1-16e7e569f546",
    "versionNo": 2,
    "status": "draft"
  }
}
```

### 12.4 先生への案内

既存コメントの状態に応じて、次の文章を表示する。

`draft` の場合：

> 作成途中のコメントがあります。新しい下書きは作らず、保存済みのコメントを開いて続きを入力してください。

`pending_review` の場合：

> 確認をお願いしているコメントがあります。新しい下書きは作らず、確認結果をお待ちください。

`draft` の場合は、案内後に保存済みコメントを開けるようにする。`pending_review` の場合は、新しい入力や上書きを行わない。

### 12.5 変更しないもの

既存コメントが1件あるため `existing_comment` を返す場合、次の処理は禁止する。

- 新しいコメント行の作成
- 既存本文の上書き
- `version_no`の加算
- 変更履歴の追記
- `comment_id`または`event_id`の発行
- 既存コメントの状態変更

## 13. 第10議題「要求処理結果」とN-01の整合性・事故記録

### 13.1 決定文

> 第1段階の試験用スプレッドシートに、「コメント現在値」「コメント変更履歴」に加えて、3つ目のシートとして「要求処理結果」を作成する。
>
> 「要求処理結果」は、同じ `request_id` の二重処理を防ぎ、最初に確定した結果を安全に再確認するために使用する。
>
> N-01では、少なくとも `accepted` と `existing_comment` の確定結果を保存する。`duplicate`、`invalid_request`、`temporary_error` は、新しい確定結果行として保存しない。
>
> `duplicate` は新しい行を追加せず、最初に保存された確定結果を読み取り、処理を再実行せずに返す。
>
> 「要求処理結果」は追記専用とし、確定済み・未確定を問わず、追加後の行を通常処理から上書き、削除、並べ替え、再利用しない。
>
> 本文、変更履歴、理由、シート行番号、スプレッドシートID、シートID、URLその他の接続先情報は保存しない。

### 13.2 「要求処理結果」の列

| 列名 | 内容 |
|---|---|
| `schema_version` | データ形式の版 |
| `request_id` | 要求ごとの一意なID |
| `request_fingerprint` | 正規化済み要求から算出したSHA-256 |
| `operation` | `create_draft`などの操作名 |
| `result` | 最初に確定した `accepted` または `existing_comment` |
| `comment_id` | 確定結果の対象コメントID |
| `version_no` | 確定結果の版番号 |
| `status` | 確定結果の内部状態 |
| `processed_at` | 確定日時 |

次の情報は保存しない。

- `line_1`、`line_2`などの本文
- 変更履歴の内容
- 差し戻し、取消、取り下げなどの理由
- シートの行番号
- スプレッドシートID、シートID、ファイル名、URL
- 認証情報、トークン
- 生の例外文やスタックトレース

### 13.3 保存する結果

#### `accepted`

新しい下書きの作成が完全に成立し、「コメント現在値」「コメント変更履歴」「要求処理結果」の保存確認がすべて完了した場合だけ保存する。

#### `existing_comment`

同じ先生に `draft` または `pending_review` が1件だけ存在し、先生IDの一致確認が完了した場合に保存する。

#### 保存しない結果

次は新しい確定結果行として保存しない。

- `duplicate`
- `invalid_request`
- `temporary_error`

`duplicate` は、保存済み行の `result`、`comment_id`、`version_no`、`status`から返却内容を再構成する。元の結果を区別するため、`data.originalResult`へ保存済み行の `result`を返す。

返却例：

```json
{
  "schemaVersion": 1,
  "result": "duplicate",
  "operation": "create_draft",
  "requestId": "req_50f03e1d-aaba-450c-935b-c8ed7895aca8",
  "serverNow": "2026-07-31T10:05:00+09:00",
  "data": {
    "originalResult": "existing_comment",
    "commentId": "cmt_3f15de91-4eac-4a44-80c1-16e7e569f546",
    "versionNo": 2,
    "status": "draft"
  }
}
```

### 13.4 `request_id`の一意性

「要求処理結果」では、1つの `request_id`につき確定結果は1行だけとする。

同じ `request_id`が2行以上見つかった場合は、どれか1行を選ばない。`accepted`、`existing_comment`、`duplicate`を返さず、データ不整合として事故記録を作成し、環境全体を `INCONSISTENT`へ変更して安全停止する。呼び出し元へは安全な `temporary_error`を返す。

安全な理由コードは次とする。

```text
multiple_request_results
```

### 13.5 保存後の読み直し

確定結果行を追加した後は、同じ `ScriptLock`を保持したまま、`request_id`で読み直す。

次のすべてが保存予定値と一致した場合だけ、確定結果として扱う。

- 該当件数が1件
- `schema_version`
- `request_id`
- `request_fingerprint`
- `operation`
- `result`
- `comment_id`
- `version_no`
- `status`
- `processed_at`

0件、2件以上、項目の不一致、読み取り失敗を同じ結果として扱わず、各節の規則に従って判定する。

### 13.6 `existing_comment`の保存結果

`existing_comment`では、「コメント現在値」と「コメント変更履歴」を変更せず、「要求処理結果」だけを1回の `spreadsheets.batchUpdate`で追記する。

追加後は、同じ `ScriptLock`内で読み直し、次のように判定する。

| 読み直し結果 | 判定 |
|---|---|
| 保存予定行が1件だけ存在し、全項目が完全一致 | 初回処理中なら `existing_comment` |
| 保存予定行が0件 | `temporary_error` |
| 同じ `request_id`が複数件 | `INCONSISTENT` |
| 1件だが内容が一致しない | `INCONSISTENT` |
| 読み取り自体が一時的に失敗し、状態を観測できない | `temporary_error` |

`existing_comment`の確定結果を保存できなかった場合は、`existing_comment`を成功として返さない。コメント本文、状態、版番号、現在値、変更履歴は変更しない。

同じ `requestId`が再送された場合は「要求処理結果」を再検索する。完全一致する確定結果行が1件あれば、新しい行を追加せず `duplicate`を返す。0件ならN-01を再判定する。複数件または内容不一致ならデータ不整合として安全停止する。

0件または一時的な読み取り失敗だけでは、直ちに `INCONSISTENT`へ変更しない。書き込み結果が不明でも、自動で同じ要求を再送しない。

### 13.7 新しい下書きの原子的な保存

新しい下書きでは、次の3行を必ず1つの `spreadsheets.batchUpdate`要求へまとめる。

1. 「コメント現在値」の新規行
2. 「コメント変更履歴」の `draft_saved`行
3. 「要求処理結果」の `accepted`行

- 3つを別々に書き込む代替経路を作らない。
- 同一操作内で別の書き込み方式へ切り替えない。
- 1つでも要求形式が不正なら、3つとも適用しない。
- 適用される場合は、同じ要求内の3つをまとめて原子的に適用する。
- 確定結果の保存確認前に `accepted`を返さない。

`spreadsheets.batchUpdate`の公式仕様では、同じ要求に含まれる各更新を事前に検証し、1つでも不正なら全体を適用せず、適用する場合は要求内の更新をまとめて原子的に適用する。ただし、共同編集者、手動編集、別のスクリプトなど、同じ要求の外側から行われる変更まで防ぐものではない。

### 13.8 書き込み処理用の時刻

書き込み処理用のサーバー時刻は、`ScriptLock`取得後、環境と3シートの確認に合格した直後、要求処理結果とコメントを検索する前に1回だけ確定する。

同じ時刻を次へ使用する。

- 「コメント現在値」の `created_at`
- 「コメント現在値」の `updated_at`
- 「コメント変更履歴」の `occurred_at`
- 「要求処理結果」の `processed_at`
- 成功時のAPI返却 `serverNow`
- 書き込み要求の通信結果が不明となった場合のAPI返却 `serverNow`

ロック取得前の要求形式検査、本文検証、正規化、指紋作成で拒否する場合は、返却を作成する時点の時刻を `serverNow`として使用する。シートへ保存する日時は作成しない。

`duplicate`など、既存の確定結果を読み取って返す場合の `serverNow`は、従来の決定どおり、その要求を処理して返却を作成する時点の時刻とする。

### 13.9 保存結果が不明な場合の判定

`batchUpdate`の応答がタイムアウトその他の通信事情により不明になった場合も、同じ `ScriptLock`を保持したまま、発行済みの `comment_id`、`event_id`、`request_id`で3シートを読み直す。

| 読み直し結果 | 判定 |
|---|---|
| 予定した3行が各1件存在し、全項目が完全一致 | 初回処理中なら `accepted` |
| 予定した3行がすべて存在しない | `temporary_error` |
| 一部の行だけ存在 | 行を変更せず `INCONSISTENT` |
| 予定値と異なる項目がある | 行を変更せず `INCONSISTENT` |
| 同じ `comment_id`、`event_id`または`request_id`の行が複数ある | どれも選ばず `INCONSISTENT` |
| 読み取り自体が一時的に失敗し、状態を観測できない | `temporary_error`。同じ `requestId`の再送で再確認する |

部分状態、予定外の値、重複、照合不一致を検出した場合は、復旧のための削除、上書き、書き戻し、補完を行わない。証拠をそのまま残し、第8議題に従って事故記録を作成し、環境全体を `INCONSISTENT`へ変更して安全停止する。

### 13.10 追記専用と禁止する復旧

「コメント変更履歴」と「要求処理結果」は、確定済み・未確定を問わず、追加後の行を通常処理から削除または上書きしない。追記専用に例外を設けない。

次の処理を禁止する。

- 部分状態を解消するための行削除
- 保存予定値への推測による上書き
- 複数行から正しいと思われる1件を選ぶ処理
- 失敗後に別々の書き込みを行って不足行を補う処理
- 履歴や要求処理結果の後付け補完
- `batchUpdate`の失敗後に別の書き込み方式へ切り替える処理

### 13.11 `ScriptLock`と環境確認の順序

処理順序は次のとおりとする。

1. 要求形式を検証する
2. 本文を検証し、NFC標準化と前後空白除去を行う
3. サーバー側で操作主体を決定し、要求指紋を作成する
4. `ScriptLock`を取得する
5. Script Propertiesだけを読み、`ENVIRONMENT_STATUS`を確認する
6. `ACTIVE`でなければ、スプレッドシートを開かず停止する
7. Script Propertiesの `ENVIRONMENT_ID`と `TRIAL_SPREADSHEET_ID`を検証する
8. 登録された試験用スプレッドシートだけを開く
9. 実際のスプレッドシート名を確認する
10. Apps Scriptとスプレッドシートのタイムゾーンを確認する
11. 「コメント現在値」「コメント変更履歴」「要求処理結果」の名称と列構成を確認する
12. すべて一致した場合だけ、書き込み処理用のサーバー時刻を1回確定する
13. 同じ `request_id`の要求処理結果を検索する
14. N-01の判定に必要なコメントを検索する
15. 判定結果に応じて、`duplicate`、`invalid_request`、`existing_comment`、複数件の安全停止、新規下書き作成のいずれかへ進む

事故記録処理は、すでに取得している同じ `ScriptLock`を保持したまま行う。事故記録関数の内部で、別の `ScriptLock`を重ねて取得しない。

`ScriptLock`は同じApps Script内の同時実行を防ぐためのものであり、スプレッドシートの手動編集や、別の仕組みからの変更を停止するものではない。

試験中は次を禁止する。

- 3シートの手動編集
- 別のApps Scriptによる変更
- 自動処理や外部ツールによる変更
- シートの並べ替え
- 行の追加、削除、上書き
- 列名、列順、シート名の変更

### 13.12 `multiple_request_results`の事故記録

同じ `request_id`が複数行見つかった場合は、単一行用の `request_fingerprint`、`operation`、`comment_id`を `null`とする。

検出した各行の安全な最小項目を `detected_request_results`配列として保存する。

```json
{
  "failure_reason_code": "multiple_request_results",
  "request_id": "req_50f03e1d-aaba-450c-935b-c8ed7895aca8",
  "request_fingerprint": null,
  "operation": null,
  "comment_id": null,
  "detected_count": 2,
  "detected_request_results": [
    {
      "request_fingerprint": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      "operation": "create_draft",
      "result": "accepted",
      "comment_id": "cmt_3f15de91-4eac-4a44-80c1-16e7e569f546",
      "version_no": 1,
      "status": "draft",
      "processed_at": "2026-07-31T17:00:00+09:00"
    }
  ]
}
```

`detected_count`は検出した行数とする。

`detected_request_results`は、次の固定順序で比較して並べる。

1. `request_fingerprint`
2. `operation`
3. `result`
4. `comment_id`
5. `version_no`
6. `status`
7. `processed_at`

文字列は昇順、`version_no`は数値の昇順とする。

配列には本文、理由、シート行番号、接続先情報、例外詳細を含めない。

### 13.13 `multiple_open_comments`の事故記録

同じ先生に `draft`または`pending_review`が合計2件以上見つかった場合の安全な理由コードは、次とする。

```text
multiple_open_comments
```

単一対象用の次の項目は、該当しないため `null`とする。

- `comment_id`
- 操作前の `version_no`
- 操作後に予定していた `version_no`
- 操作前の現在値スナップショット
- 操作後に予定していた現在値スナップショット
- 各スナップショットの照合用ハッシュ
- 追加予定だった `event_id`

検出したコメントは、次の `detected_comments`配列として保存する。

```json
{
  "failure_reason_code": "multiple_open_comments",
  "comment_id": null,
  "before_version_no": null,
  "planned_version_no": null,
  "before_snapshot": null,
  "planned_snapshot": null,
  "before_snapshot_hash": null,
  "planned_snapshot_hash": null,
  "planned_event_id": null,
  "detected_count": 2,
  "detected_comments": [
    {
      "comment_id": "cmt_11111111-1111-4111-8111-111111111111",
      "status": "draft",
      "version_no": 2
    },
    {
      "comment_id": "cmt_22222222-2222-4222-8222-222222222222",
      "status": "pending_review",
      "version_no": 3
    }
  ]
}
```

`detected_comments`は `comment_id`の昇順で並べる。配列内へ本文、理由、先生名、シート行番号、接続先情報を保存しない。

事故記録と `INCONSISTENT`への変更は、すでに保持している同じ `ScriptLock`内で、第8議題の保存順序に従って行う。

### 13.14 `get_integrity_status`

`get_integrity_status`では、次を外部へ返さない。

- `detected_request_results`
- `detected_comments`
- 検出した各 `comment_id`
- 各コメントの `status`
- 各コメントの `version_no`
- 各 `request_fingerprint`
- スナップショット
- シート行番号
- 接続先情報

読み取りをきっかけに事故記録、環境状態、現在値、履歴、要求処理結果を変更しない。

### 13.15 Advanced Sheets Service、Sheets API、OAuth権限

設計承認時点の状態は次のとおりである。

- Advanced Sheets Service v4は有効化済み
- Google上でサービス `Sheets`として認識済み
- OAuth権限は `https://www.googleapis.com/auth/spreadsheets.readonly`
- 書き込み権限は未追加
- `spreadsheets.batchUpdate`による書き込みは未実施

Google統合試験へ進む場合は、別途承認後に次を行う。

- `spreadsheets.batchUpdate`を使用するコードの追加
- OAuth権限を必要最小限の書き込み可能な `spreadsheets`範囲へ変更
- 標準Google Cloudプロジェクトを使用している場合は、Sheets APIの有効状態を再確認
- 変更前後の `appsscript.json`差分を提示
- 権限確認画面の内容を記録
- 本番や通常アプリへ接続していないことを再確認

今回の設計記録への追記だけでは、Advanced Sheets Service、Sheets API、OAuth権限、`appsscript.json`を変更しない。

### 13.16 試験終了と保管

試験終了記録へ次を追加する。

- 「要求処理結果」のデータ行数
- `result`別の件数
- 一意な `request_id`の件数
- 重複した `request_id`がないこと
- 3シートの整合確認結果

削除時の照合対象へ次を追加する。

- 「要求処理結果」のシート名
- 列構成
- データ行数
- `request_id`件数
- 試験終了記録との一致

削除または保管時にも、「要求処理結果」の既存行を個別に編集・削除しない。試験用スプレッドシート全体を、承認済みの保管・削除手順に従って扱う。

### 13.17 追加する試験

N-01専用の別試験として、少なくとも次を追加する。

| ID案 | 試験内容 | 期待結果 |
|---|---|---|
| RR-01 | `accepted`を保存 | 最小項目が1行だけ保存される |
| RR-02 | `existing_comment`を保存 | 最小項目が1行だけ保存される |
| RR-03 | `duplicate` | 新しい行を追加せず、元の結果から返す |
| RR-04 | `invalid_request` | 確定結果行を追加しない |
| RR-05 | `temporary_error` | 確定結果行を追加しない |
| RR-06 | 同じ `request_id`が2行 | どちらも選ばず安全停止 |
| RR-07 | `existing_comment`の保存予定行が0件 | `temporary_error` |
| RR-08 | `existing_comment`の保存予定行が1件で完全一致 | 初回処理中なら `existing_comment` |
| RR-09 | `existing_comment`の保存予定行が複数 | `INCONSISTENT` |
| RR-10 | `existing_comment`の保存予定行が内容不一致 | `INCONSISTENT` |
| RR-11 | 再送時に確定結果行なし | N-01を再判定できる |
| RR-12 | 再送時に確定結果行あり | `duplicate`として返す |
| TX-01 | 1つの `batchUpdate`へ3行を含める | 書き込み要求は1回だけ |
| TX-02 | 別々の書き込みへ切り替える代替コードを静的検査 | 代替コードが存在しない |
| TX-03 | 通信結果不明後、3行が各1件で完全一致 | 初回処理なら `accepted` |
| TX-04 | 通信結果不明後、3行とも存在しない | `temporary_error` |
| TX-05 | 一部の行だけ存在 | 削除せず `INCONSISTENT` |
| TX-06 | 項目が一致しない | 上書きせず `INCONSISTENT` |
| TX-07 | 同じIDが複数ある | どれも選ばず `INCONSISTENT` |
| ENV-01 | ロック直後に非 `ACTIVE` | シートを開かず停止 |
| ENV-02 | シート名、タイムゾーンまたは列構成不一致 | データを読まず停止 |
| ENV-03 | 試験中の手動変更を模擬 | 削除・補完せず安全停止 |
| INC-01 | 複数の要求処理結果 | 固定順序の配列として事故記録 |
| INC-02 | 複数の作成途中コメント | `comment_id`順の配列として事故記録 |
| INC-03 | `get_integrity_status` | 検出配列を返さない |
| TIME-01 | 新規下書きの3シートの日時 | 環境確認後に確定した同じ時刻を使用 |
| TIME-02 | 書き込み成功または結果不明時の `serverNow` | 3シートと同じ確定時刻を使用 |
| TIME-03 | ロック取得前の形式拒否 | 返却時刻だけを作り、保存日時を作成しない |

合格済みの基礎自己試験17件は変更しない。N-01と3シート整合性の試験は、別の自己試験・別のローカル試験として追加する。
