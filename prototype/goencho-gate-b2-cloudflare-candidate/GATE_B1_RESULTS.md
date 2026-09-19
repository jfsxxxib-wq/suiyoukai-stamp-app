# 一局のご縁帳 Gate B1 隔離実装結果

記録日時：2026-09-18 01:54 JST

## 判定

localhostだけで動く実装候補の主要要件、Phase 1 owner session基盤、Phase 2管理6画面、Phase 3先生認証状態、Phase 4今日・過去・個人記録、Phase 5午前／午後表示、Phase 6端末承認保持・再認証分離は合格した。Gate B2、Gate C、migration、公開、正式環境接続へは進まない。

- branch：`codex/goencho-gate-b1-isolated-candidate-20260917`
- 基準HEAD：`052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- 変更範囲：`prototype/goencho-gate-b1-isolated-candidate/` の新規ファイルだけ
- package追加：なし
- 外部network：使用なし
- local DB：候補フォルダ内 `.local/`（Git除外）

## 試験結果

### Phase 6 端末承認保持・再認証分離（今回）

- 変更前159件を実行し、159件すべて合格してから実装を開始
- 自動試験：168件中168件合格（既存159件＋Phase 6追加9件）
- owner／先生の端末証明Cookieだけへlocal試験候補の`Max-Age`を設定
- 操作session Cookieには`Max-Age`を付けず、無操作30分のserver-side lockを維持
- 有効なowner／先生状態確認とPIN認証時だけ端末証明Cookieを再発行
- 端末証明CookieなしではPINだけで復旧できず、失効端末は古いCookieでも401
- owner Cookieと先生Cookieを別originへ送っても認証に使われない
- 同じpepperを安全に注入した隔離試験で、server再起動後も同じ承認端末・同じ`teacher_id`としてPIN再認証
- 800日相当の経過だけではDB承認状態が`approved`から変わらない
- DB schema、6画面、対局データ、今日／過去／個人、午前／午後表示は変更なし
- scope check：56ファイル合格
- schema invariant：合格
- leak scan：実行時秘密marker 10件の残存0
- JavaScript構文検査：46ファイル合格
- local候補の技術的Cookie保持値は正式な端末期限ではなく、正式値と実機上限は未確定

### Phase 5 午前／午後表示（今回）

- 自動試験：159件中159件合格（既存140件＋Phase 5追加19件）
- 既存HTTP試験のserver再起動時に閉じた接続を再利用する揺らぎを、試験専用`Connection: close`で除去
- 12:00を仮境界として表示設定1か所に置き、00:00〜11:59を午前、12:00〜23:59を午後に分類
- 境界を13:00へ差し替える純粋関数試験にも合格
- 今日と過去の特定日だけが同じ共通分類を使い、個人記録は日付・時刻順のまま維持
- 16局を午前7局・午後9局に分け、カード番号は1〜16の通し番号
- 午前0局、午後0局、全体0局を保持し、0局の区分見出しは表示しない
- 時刻形式不正は推測や非表示にせず「時刻確認中」へ分離し、不正値を画面や`datetime`へ出さない
- 分類前後で`matchId`集合が一致し、欠落・重複なし
- DB schema、match APIの8公開項目、認証・認可は変更なし
- scope check：55ファイル合格
- schema invariant：合格
- leak scan：実行時秘密marker 10件の残存0
- JavaScript構文検査：45ファイル合格

### Phase 4 今日・過去・個人記録（今回）

- 自動試験：140件中140件合格（既存115件＋Phase 4追加25件）
- 今日、過去日、個人記録を同じ `goencho_match_records` と同じ公開用match変換へ接続
- 3方向で同じ1局を同じ `matchId` として保持
- 公開応答は8項目だけとし、内部 `teacher_id`、`source_reference`、`created_at`を返さない
- `teacher_id`はserver認証sessionだけから確定し、client持込みを拒否
- 個人記録は `teacher_id + participant_id` で分離し、同姓同名と複数先生を混同しない
- 日本時間の当日キーをserver側で生成し、clientからtodayを上書きできない
- 日付とparticipant IDを厳密検証し、重複・余分なqueryを400で拒否
- 16局を省略せず表示し、未知の結果codeは「記録確認中」として安全表示
- 1局目は「手合の歩み」を出さず、2局以上だけ表示
- 認証切れ時は取得済み記録を消し、PIN再認証後にAPIから再取得
- DB由来文字列は `textContent` だけで配置し、browser永続storageとconsole出力は不使用
- scope check：52ファイル合格
- schema invariant：合格
- leak scan：実行時秘密marker 10件の残存0

### Phase 3 先生認証状態・画面接続（今回）

- 自動試験：115件中115件合格（既存90件＋Phase 3追加25件）
- `GET /api/teacher/state`で、未登録、pending、PIN認証必要、activeをserver側cookieとDBから判定
- unknown／revoked端末を401、inactive先生を403で安全停止
- pendingだけに先生名と確認番号を返し、approved／revoked後は確認番号を返さない
- QR ticketをfragmentから直ちに除去し、claim tokenは画面memoryだけに保持
- `initial`／`new_device`／`pin_reset`でPIN画面の文言とserver処理を分離
- pending中とPIN認証前は先生画面からmatch APIを呼ばない
- protected match APIはteacher session cookieだけでなく、一致するapproved device cookieも必須
- PIN再認証時は同じ端末の旧active／locked sessionを失効して新sessionを発行
- state確認だけでは無操作時間を延長しない
- logoutと無操作lockはsessionだけを止め、approved deviceを維持
- Phase 3画面から静的な架空対局表示を除去し、認証完了は「利用準備完了」まで
- HTTP統合：QR claim、PIN設定、pending、管理承認、PIN認証、match認可、logoutまで合格
- scope check：48ファイル合格
- schema invariant：合格
- leak scan：実行時秘密marker 10件の残存0
- HTTP試験のport再利用で一度だけ接続resetを検出し、各caseを別loopback portへ分離後、単独・全体とも合格

### Phase 2 管理6画面とowner API接続

- 自動試験：90件中90件合格（既存70件を含む）
- 管理端末の初回登録、復旧コード一度だけ表示、紛失復旧、先生登録、承認待ち、端末承認を実APIへ接続
- 初回登録前、復旧必要、PIN再認証必要、利用可能、構成異常をserver側状態で分岐
- 先生作成と初回登録券発行を同一transactionにし、途中失敗時は先生作成もrollback
- 管理端末の認可とSQLにはserver側で確定したowner sessionだけを使用
- 端末申請一覧をpending／approved／revokedで分離し、確認番号はpendingにだけ返す
- 承認前の対面確認checkbox、拒否・失効前の確認dialogを実装
- 復旧コード確認後はDOMとmemoryから消去し、登録券はURL queryではなくfragmentだけへ置く
- browser storage、自動clipboard、`innerHTML`、consoleへの秘密出力は不使用
- scope check：45ファイル合格
- schema invariant：合格
- leak scan：実行時秘密marker 10件の残存0

### Phase 1 owner session基盤

- 自動試験：70件中70件合格（既存55件を含む）
- owner sessionをDBにはhashだけで保存し、HttpOnly・SameSite=Strict cookieで受け渡す
- 初回登録、PIN再認証、復旧で新sessionを発行
- 通常の先生登録・登録券発行・申請一覧・端末承認は、PINではなくserver確定owner sessionを使用
- bodyの`ownerPin`／`owner_pin`、headerの`x-owner-pin`を400で拒否
- 状態変更POSTは完全一致Originを必須化し、欠落・不一致を403、JSON以外を415で拒否
- 30分無操作ではsessionだけをlockし、承認済み管理端末は維持
- logoutでは対象sessionだけを失効し、管理端末は維持
- 復旧では旧管理端末と全旧sessionを失効し、新管理端末・新sessionを発行
- HTTP実測：health 200、Originなし403、JSON以外415、旧PIN header 400、sessionなし401、logout 200
- scope check：42ファイル合格
- schema invariant：合格
- leak scan：実行時秘密marker 10件の残存0

### Phase 0以前

- 自動試験：55件中55件合格
  - owner初回登録・復旧：8件
  - 先生登録・端末承認：12件
  - 期限なし端末・明示失効：8件
  - ID・対局分離：10件
  - session・入力途中draft：6件
  - HTTP／漏えい境界：8件
  - QR ticket履歴除去：3件
- schema invariant：合格
  - 先生端末authorizationに `expires_at` なし
  - 受付系table参照なし
- scope check：合格
  - 36ファイルを検査
  - loopback以外のURL／bindなし
  - 外部dependencyなし
  - 正式基盤bindingなし
- leak scan：合格
  - 実行時だけ作った9個の秘密markerがDB、公開error、audit、保存ファイルに残らない
- HTTP実測：合格
  - owner health 200
  - teacher health 200
  - 許可外Host 400
  - cross-origin 403
  - 全応答に `Cache-Control: no-store` とCSPあり

## 実画面確認

- owner：`http://127.0.0.1:4191/`
- teacher：`http://localhost:4192/`
- Phase 2管理画面を390 × 844相当で再確認
- 横はみ出しなし
- 上部6操作ボタンは高さ44px、主要ボタン47px、入力欄46px
- browser console warning／error：0件
- 画面切替後の見出しfocusを維持しつつ、不要な黒枠を表示しないよう修正
- 初回登録の架空不正値では安全な失敗表示となり、入力値が応答後に消えることを確認
- Phase 2の成功経路はHTTP統合試験で、初回登録から先生申請・承認・失効まで確認
- Phase 3先生画面を390 × 844相当で確認。横はみ出しなし、上部6段階44px、主要操作48px
- 架空QR受取後のURLからfragmentが消え、先生名と用途別PIN画面が表示されることを確認
- PIN設定後にpendingと確認番号を表示し、低頻度確認でapproved後のPIN認証へ移ることを確認
- approved移行後は確認番号がDOMから消え、PIN認証後は架空対局を表示せず利用準備完了となることを確認
- logout後はapproved deviceを維持したままPIN認証へ戻ることを確認
- Phase 3 browser console warning／error：0件
- 個人記録に別参加者が混ざっていた静的表示を発見し、水曜はなこ（架空）の3局だけへ修正後、再確認済み
- 架空のQR ticket markerをfragmentから読み込み、`history.replaceState` 後のURLが `/` となることを実ブラウザで確認
- Phase 4は架空の青葉先生で、2026年9月18日の16局を実ブラウザ表示
- 時刻、名前、棋力、手合、結果を16局すべて保持し、長い名前と未知結果「記録確認中」も表示
- 今日→個人で5局、「先生とのご縁 5局目」、最初・最近の対局、手合の歩みを確認
- 過去→9月17日→個人→9月17日の戻り先を確認
- 1局だけの桜井こよみ（架空）は「先生とのご縁 1局目」となり、手合の歩みを表示しないことを確認
- 実画面操作中の可視エラーなし。Phase 4 browser console warning／error：0件

## 確認できた分離

- `participant_id`、`teacher_id`、`match_id` が識別基準
- 同日同一相手2局を保持
- 同姓同名を別人として保持
- 同じ参加者の複数先生記録を分離
- 個人記録を `teacher_id + participant_id` で分離
- 今日／過去／個人記録が同じ `match_id` を参照
- `source_reference` と `match_id` の重複を拒否
- 先生兼リーグ参加者のIDと認証を自動連動しない
- approved先生端末は180日／365日経過だけでは停止しない
- 個別失効、全端末失効、端末交換を別操作として扱う
- 無操作lock後も端末承認と入力途中draftを維持
- 端末証明Cookieと操作session Cookieを分離
- Cookie削除後はPINだけで端末承認を復元しない
- 800日相当の経過だけでは承認状態を変更しない

## 漏えい検査の境界

意図しない漏えいとして、DB、audit、公開error、保存ファイルを検査した。初回登録時の復旧コード、QR用ticket、HttpOnly cookieなど、正規の一回限り受け渡しに必要な成功応答は「漏えい」ではなく、受取権限を持つ画面への意図した配付として別管理する。これらをapplication logへ出す処理はない。

## 残る確認事項

- 午前／午後の正式運用境界は未確定。現在の12:00は表示側だけの仮設定。
- 実QR画像生成、複数実機を使う横断確認は未実施。
- localhost HTTPではproduction用 `Secure` cookieを実測できない。
- browser終了後のdevice cookie保持・更新方式はlocal候補まで実装・試験済み。正式な技術的保持値とiPhone／Android実機挙動は未確認。DBのapproved authorizationには日数期限を設けていない。
- 外部隔離環境の標準log収録前redact、保持、閲覧権限は未確認。
- 正式D1、正式Sheets、正式Site、リーグv11、本番データ、正式secret、正式対応表は未接続・未変更。

次はPhase 6結果を悦子さんへ提示して停止する。別の明確な承認なしにGate B2、Gate C、正式反映、公開、Git保存へ進まない。
