# 一局のご縁帳 Gate B2-1A Cloudflareローカル移植候補

Gate B1候補をhash manifest付きで複製し、Cloudflare Workers＋専用D1へ移す境界をローカルだけで試験する候補です。

Gate B1の168試験をそのまま保持しながら、D1非同期repository、Workers Fetch handler、非公開Wrangler設定、D1 migrationと41件の追加試験を持ちます。

## 絶対条件

- 正式Site、正式D1、正式Sheets、本番データ、正式secretへ接続しない。
- 実在人物の名前、メール、番号を入れない。
- 既存受付系tableとtest_receptionsを作成・参照・変更しない。
- 先生端末authorizationに日数期限とexpires_atを持たせない。
- Cloudflare login、account／Worker／remote D1／secret／route作成、deploy、公開を行わない。
- workers.dev、Preview URL、observability、Workers Logs、traceは初回設定候補から無効。
- remote D1 IDは全ゼロplaceholderのままにし、正式IDを保存しない。

## Gate B1 localhost候補

    npm run start:b1

- owner: http://127.0.0.1:4191/
- teacher: http://localhost:4192/

DBは.local/goencho-gate-b1.sqliteに作成され、Git対象外です。

## 端末承認とCookie

- owner／先生の端末承認はDB上に日数期限を持ちません。
- 端末証明Cookieだけは、ブラウザ終了後も同じ端末だと示せるようMax-Age候補を持ちます。
- 操作session Cookieは永続化せず、server側の無操作30分lockを維持します。
- Cookieが消えた場合はPINや名前だけで復旧せず、新しい一回限りQRで再登録します。
- Workers候補のCookieはhost-only、HttpOnly、Secure、SameSite Strictです。

## Gate B2-1A試験

    npm test
    npm run manifest:verify
    npm run scope-check
    npm run leak-scan
    npm run wrangler:dry-run
    npm run d1:init:local
    npm run benchmark:pin
    npm run benchmark:pin:workerd

wrangler:dry-runは外部deployを行いません。d1:init:localも--localを強制し、remote用credentialをprocess環境から除外します。

Windowsの長いworktree pathではWrangler local D1がSQLite fileを開けないため、local D1の生成物だけをOSの専用一時directoryへ置きます。正式データや実在情報は含めません。

## 現在の移植境界

- 今日・過去・個人のD1読み取り、teacher session／device HMAC照合、無操作lock、teacher ID持込み拒否はWorkers候補へ接続済みです。
- owner初回登録、先生登録、PIN設定・再認証、端末承認・失効・復旧の書込みを、条件付き更新／INSERT SELECT／D1 batchへローカル移植済みです。
- 並列一回限り操作、競合、各statementのfailure injection、部分unique indexを41件のCloudflare試験で確認済みです。
- PIN候補はPBKDF2-SHA-256 600,000回です。local workerd 100回では照合平均約306msで、比較した旧scryptも約42msでした。
- Workers Freeの10ms枠へ収めるためにPIN保護を弱めません。外部resource作成前に、有料CPU枠・別認証サーバー・構成変更を比較して承認を得る必要があります。

詳細は `GATE_B2_1A_AUTH_WRITE_PIN_RESULTS.md` を参照してください。
