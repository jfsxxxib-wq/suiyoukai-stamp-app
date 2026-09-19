# Gate B2-2C4-1 GitHub checkpoint保存範囲

作成日時：2026-09-19 19:24（日本時間）

状態：**保存範囲確認済み／専用branchへのcheckpointのみ承認済み。PR、`main`、B2-2C4-2、Cloudflareは対象外。**

## 結論

B2-2C4-1のPASS地点を別checkoutから復元可能にするため、これまで未追跡だったcandidate正本一式116ファイルと、B2-2C4／B2-2C4-1の計画・結果・handoff 13ファイルを専用branchへ保存する。昇格対象23ファイルだけでは残り93ファイルが欠けるため、checkpointとして自己完結しない。

## 保存対象

### Candidate正本：116ファイル

- `prototype/goencho-gate-b2-cloudflare-candidate/`配下のsource一式。
- `SOURCE_MANIFEST.sha256`自身を含む。manifest検証対象は115ファイル。
- 反映後tree SHA-256は`0015C1D9E2A882082BEB82DCFEADDD7321BF83BBBDDD8AFD6742F76A79520A8F`へ固定する。
- 固定23ファイルは一時copyと23／23 byte一致し、残り93ファイルは昇格前candidateから不変である。

### 記録：13ファイル

- `docs/goencho-gate-b2-2c4-secret-runtime-canary-plan-2026-09-19.md`
- `docs/handoffs/2026-09-19-1829-Gate-B2-2C4-secret-runtime-canary計画-外部操作なし.md`
- `docs/goencho-gate-b2-2c4-1-worker-http-parity-scope-fixtures-stop-conditions-2026-09-19.md`
- `docs/handoffs/2026-09-19-1836-Gate-B2-2C4-1-Worker-HTTP-parity範囲確認-HOLD.md`
- `docs/goencho-gate-b2-2c4-1-worker-http-parity-offline-result-2026-09-19.md`
- `docs/handoffs/2026-09-19-1903-Gate-B2-2C4-1-Worker-HTTP-parity-offline-PASS.md`
- `docs/goencho-gate-b2-2c4-1-candidate-promotion-plan-2026-09-19.md`
- `docs/handoffs/2026-09-19-1909-Gate-B2-2C4-1-candidate昇格計画-HOLD.md`
- `docs/goencho-gate-b2-2c4-1-candidate-promotion-result-2026-09-19.md`
- `docs/handoffs/2026-09-19-1918-Gate-B2-2C4-1-candidate昇格-PASS.md`
- この保存範囲文書。
- `docs/handoffs/2026-09-19-1930-Gate-B2-2C4-1-GitHub-checkpoint-STOP.md`
- `docs/handoffs/2026-09-19-1934-Gate-B2-2C4-1-checkpoint空白allowlist承認.md`

## 明示的な対象外

- `node_modules/`、`.local/`、`.wrangler/`、一時DB、cache、log、raw response、rollback退避、一時copy。
- secret値、Token、PIN、Cookie、ticket、digest、個人情報、本番値。
- root側の無関係なdirty差分と過去資料。
- B2-2C4-2の新規計画・runner・fixture。
- PR、GitHub `main`、Cloudflare、Token、secret、deploy、runtime request、公開、本番data。

## 保存前検証

- branch／HEAD／upstreamが`codex/goencho-gate-b2-cloudflare-candidate-20260918`／`94131e1c65ee2ce41f453d42487a7852b76a1842`／同一。
- candidate 116ファイル、tree hash、manifest 115、`0001`／`0002` hashを再確認する。
- stage対象がcandidate 116＋記録13の129ファイルだけであることを集合照合する。
- staged差分のsecret／token候補、禁止生成物、予定外pathを検査する。
- `git diff --cached --check`の既存6件が承認済みallowlistと完全一致し、7件目がないことを検査する。
- commit後にHEAD内容からcandidate tree hash、manifest、migration hashを再確認する。

## 停止条件

一つでも対象集合、hash、manifest、secret scan、staged差分、承認済み空白allowlist、branch／upstreamが一致しなければcommit・pushせず停止する。commit後のpush失敗時は新しいcommitを作らず、状態を報告して停止する。
