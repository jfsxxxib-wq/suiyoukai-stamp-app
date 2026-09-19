# Gate B2-2C4-1 candidate昇格計画

作成日時：2026-09-19 19:09（日本時間）

状態：**計画確認合格／昇格HOLD。candidate正本、GitHub、B2-2C4-2、Cloudflare、Token、secret、本番データは未変更。**

## 1. 固定元と到達値

- 反映元：`tmp/goencho-b2-2c4-1-worker-http-parity-20260919-offline/`
- 反映先：`work/goencho-gate-b2-cloudflare-candidate-20260918/prototype/goencho-gate-b2-cloudflare-candidate/`
- 反映前candidateソース木SHA-256：`7726318580E2671484E15B3B751E53A8CAC928D28653C7283A3F64C96B6F05C6`
- 反映後期待ソース木SHA-256：`0015C1D9E2A882082BEB82DCFEADDD7321BF83BBBDDD8AFD6742F76A79520A8F`
- 反映元`SOURCE_MANIFEST.sha256` SHA-256：`F967FE27B90EAE2C98F1C42BFD5EFDB0E6B38E0D17195769425E18AB9FAF2FA6`
- Gate B2 branch／HEAD／upstream：`codex/goencho-gate-b2-cloudflare-candidate-20260918`／`94131e1c65ee2ce41f453d42487a7852b76a1842`／同一。

## 2. 反映対象23ファイル

区分は**変更22、新規1、削除0**。次の相対path以外は反映しない。

### Cloudflare runtime：変更4

1. `cloudflare/src/d1-auth-service.mjs`
2. `cloudflare/src/fetch-security.mjs`
3. `cloudflare/src/runtime-config.mjs`
4. `cloudflare/src/worker.mjs`

### Cloudflare fixture：変更2、新規1

5. `cloudflare/tests/02-worker.test.mjs`（変更）
6. `cloudflare/tests/06-portability-migration.test.mjs`（変更）
7. `cloudflare/tests/09-worker-http-parity.test.mjs`（新規）

### 共通入力境界：変更1

8. `lib/actor.mjs`

### UI／asset：変更4

9. `public/owner/index.html`
10. `public/owner/owner.js`
11. `public/teacher/index.html`
12. `public/teacher/teacher.js`

### local parity server：変更1

13. `server.mjs`

### manifest：変更2

14. `SOURCE_MANIFEST.sha256`
15. `tools/verify-source-manifest.mjs`

### B1回帰fixture：変更8

16. `tests/09-owner-http.test.mjs`
17. `tests/11-owner-ui-contract.test.mjs`
18. `tests/12-owner-phase2-http.test.mjs`
19. `tests/14-teacher-phase3-http.test.mjs`
20. `tests/15-teacher-ui-contract.test.mjs`
21. `tests/17-phase4-http.test.mjs`
22. `tests/20-phase5-ui-contract.test.mjs`
23. `tests/21-phase6-device-persistence.test.mjs`

## 3. 明示的な対象外

- ファイル削除、directory単位の上書き、23ファイル以外のcopy。
- `cloudflare/migrations/0001_goencho.sql`、`0002_auth_write_guards.sql`、新規migration、schema version。
- `wrangler.jsonc`、binding、route、domain、resource ID、package依存。
- `.env`、`.dev.vars`、Token、secret、本番値、生成DB、raw response。
- Git add／commit／push／PR／`main`。
- B2-2C4-2、deploy、runtime canary、Cloudflare API、remote D1。

## 4. 反映方法

1. 実行承認後、candidate HEAD／upstream、worktree状態、反映前tree hashが上記固定値と一致することを確認する。
2. 反映元でmanifest 115 files、F01〜F10、240件回帰が引き続きPASSすることを確認する。
3. 23ファイルの反映元SHA-256と、22変更ファイルの反映先SHA-256、新規1ファイルが反映先に存在しないことを固定する。
4. 22変更ファイルの反映前内容を`tmp/`内の専用rollback copyへ保存し、新規1ファイルの不存在を記録する。
5. directory copyは行わず、固定23 pathだけを一つずつ反映する。
6. 反映直後、23／23の内容一致、予定外差分0、削除0をhash比較する。
7. 反映後candidateの全ソース木hashが期待値`0015C1D9...520A8F`と一致することを確認する。
8. `0001`／`0002` hash、wrangler設定、package依存、secret候補0を再確認する。

途中のlocal file I/O失敗時は追加反映と試験を止める。承認済みrollback範囲内なら、22ファイルだけをrollback copyから戻し、新規1ファイルだけを除去して反映前tree hashへ戻す。rollbackの対象または結果が一意でなければ自動修復を続けずSTOPする。

## 5. 反映後試験

- F01〜F10：11／11。
- B1：168／168。
- Cloudflare：72／72（既存61＋新規11）。
- 合計：240／240、skip／todo 0。
- 主要7ファイルのNode構文。
- `npm run scope-check`：111 files基準。
- `npm run leak-scan`：runtime secret marker漏えい0。
- `npm run manifest:verify`：115 files基準。
- migration hash：`0001`=`0EAADB9E...F6194ED`、`0002`=`1391CCC7...D676C`。
- localhost 4191／4192／63496 listenerが終了時0。

## 6. PASS条件

- 反映前固定値がすべて一致する。
- 変更22、新規1、削除0、予定外差分0。
- 23／23が反映元とbyte一致し、全tree hashが期待値と一致する。
- 240／240、scope、leak、manifest、syntaxが全PASS。
- migration、schema、wrangler、package依存、secret、本番値、外部resource、GitHubに変更0。

## 7. 即時停止条件

- candidateの開始hash、HEAD、upstream、既存状態が固定値と異なる。
- 反映元manifest不合格、23ファイルのhash変化、新規対象がすでに存在する。
- 24番目の差分、削除、対象外path、migration／schema／config変更が生じる。
- 23／23内容一致または反映後tree hashが一致しない。
- 240件、scope、leak、manifest、syntaxの一つでも不合格。
- Token、secret実値、Cloudflare、remote D1、Git操作が必要になる。

## 8. 停止点

反映とoffline再試験がPASSしても、結果提示でSTOPする。GitHub checkpoint、B2-2C4-2、secret設定、runtime canary、route／公開は別計画・別承認とする。
