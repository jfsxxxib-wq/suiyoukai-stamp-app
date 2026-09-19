# Gate B2-2C4-3A GitHub checkpoint保存範囲

確認日時：2026-09-20 01:22（日本時間）

判定：**保存範囲確認PASS／実行HOLD。固定6 toolsとC4-3／C4-3Aの監査連鎖を残す14記録の合計20 filesだけを、専用branchの次checkpoint候補とする。別の明確な実行承認までは、Gateへの記録copy、Git add／commit／pushを行わない。**

## 1. 固定基準

- Gate root：`work/goencho-gate-b2-cloudflare-candidate-20260918/`
- branch：`codex/goencho-gate-b2-cloudflare-candidate-20260918`
- HEAD／upstream：`5d90a3e05c86851adccc35af0b8675f9f12c2245`
- `origin/main`：`052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- 現在のGate差分：下記tools 6 filesの未追跡だけ。
- Gate側の下記12既存記録との同名衝突：0。
- PR、`main`、Cloudflare、Token、secret実値、deploy、公開、本番データ：変更しない。

## 2. checkpoint候補20 files

### 2.1 Gate tools固定6 files（現在Gate内に未追跡で存在）

1. `tools/goencho-gate-b2-c4-3-offline-contract-20260920/C43_SOURCE_MANIFEST.sha256`
2. `tools/goencho-gate-b2-c4-3-offline-contract-20260920/README.md`
3. `tools/goencho-gate-b2-c4-3-offline-contract-20260920/REQUEST_BUDGET.json`
4. `tools/goencho-gate-b2-c4-3-offline-contract-20260920/c43-live-adapter.mjs`
5. `tools/goencho-gate-b2-c4-3-offline-contract-20260920/start-c43-live.ps1`
6. `tools/goencho-gate-b2-c4-3-offline-contract-20260920/tests/c43-live-adapter.test.mjs`

固定hash：

- `C43_SOURCE_MANIFEST.sha256`：`6E5AA93A31A25BDAC423A975FAE02621D2B1F3CD5DC035C9812561FDB3130CEF`
- `README.md`：`AFB6082DC1152572C8C2A71B8273A2A9F61B64C7D22C1A70AD07D40256C8132D`
- `REQUEST_BUDGET.json`：`1AF51E1F0D2A23F353500E548E7DE3ADD69906DCE3B42EF49CB1A12FC8D7A359`
- `c43-live-adapter.mjs`：`5DAF2A0D21F7501FB15780BC8C17003F8418115A598D0971683840B7B4A175A3`
- `start-c43-live.ps1`：`1B4755277D2E335695E0FC2E3FE2731C15AB73B700C83B1FE8CF6989D5C1A85D`
- `tests/c43-live-adapter.test.mjs`：`85BADCF016F786B602DED321B91474A9FCEC4A6514D0A1BD184FEB4E31B4C91A`

manifestは5／5一致済み。tools directoryは6 filesだけ、ignore 0、reparse point 0、予定外file 0である。実装はoffline fixture専用で、remote transport、Token受け口、secret実値を含まない。

### 2.2 C4-3／C4-3A監査連鎖の既存12記録（実行承認後にGateへ個別copy）

7. `docs/goencho-gate-b2-2c4-3-secret-full-worker-deploy-scope-offline-tests-stop-conditions-2026-09-20.md`
8. `docs/handoffs/2026-09-20-0002-Gate-B2-2C4-3-secret-full-Worker-deploy計画-HOLD.md`
9. `docs/goencho-gate-b2-2c4-3-live-adapter-offline-result-2026-09-20.md`
10. `docs/handoffs/2026-09-20-0029-Gate-B2-2C4-3A-live-adapter-offline-launcher-STOP.md`
11. `docs/goencho-gate-b2-2c4-3-live-adapter-offline-v2-result-2026-09-20.md`
12. `docs/handoffs/2026-09-20-0042-Gate-B2-2C4-3A-live-adapter-offline-v2-PASS.md`
13. `docs/goencho-gate-b2-2c4-3a-v2-promotion-checkpoint-c4-3b-connection-plan-2026-09-20.md`
14. `docs/handoffs/2026-09-20-0050-Gate-B2-2C4-3A-v2昇格-checkpoint-C4-3B接続計画-HOLD.md`
15. `docs/goencho-gate-b2-2c4-3a-portable-staging-v1-result-2026-09-20.md`
16. `docs/handoffs/2026-09-20-0103-Gate-B2-2C4-3A-portable-staging-v1-PASS.md`
17. `docs/goencho-gate-b2-2c4-3a-gate-tools-promotion-v1-result-2026-09-20.md`
18. `docs/handoffs/2026-09-20-0117-Gate-B2-2C4-3A-Gate-tools昇格-v1-PASS.md`

初回STOPから1行修正、v2 PASS、portable化、Gate tools昇格PASSまでを一続きで監査できるため、途中記録も今回は残す。

### 2.3 今回のscope確認2記録（実行承認後にGateへ個別copy）

19. `docs/goencho-gate-b2-2c4-3a-github-checkpoint-scope-2026-09-20.md`
20. `docs/handoffs/2026-09-20-0122-Gate-B2-2C4-3A-GitHub-checkpoint範囲確認-HOLD.md`

`docs/CURRENT.md`は可変入口のため対象外とする。raw control logs、Firewall／guardian証跡、旧STOP／v2／portable staging／promotion validation root、candidate、C4-2 tools、migration、生成物、秘密値、private IDは対象外とする。

## 3. 実行承認後の手順

1. branch、HEAD、upstream、`origin/main`、Gate statusが上記基準と完全一致することを再確認する。
2. 14記録を親作業場からGateの同一相対pathへ個別copyし、14／14 byte一致を確認する。同名fileが1件でもあれば書き込まずSTOPする。
3. Gate statusが20 filesの追加だけで、tracked変更・削除・予定外追加が0であることを確認する。
4. tools 6 hash、manifest 5／5、Node／PowerShell構文、secret実値・private ID・raw response・一時証跡の除外を確認する。271件、UAC、Firewall rule、remote操作は再実行しない。
5. `git add --`へ固定20 filesを明示し、staged name/statusが`A` 20件だけであることを集合照合する。
6. `git diff --cached --check`、staged内容、leak scan、対象数を再確認する。
7. commit message `Checkpoint B2-2C4-3A offline contract PASS`で1 commitだけ作成し、既存専用branchへpushを1回だけ行う。force push、amend、PR、`main`変更は行わない。
8. 親commitが`5d90a3e`、HEAD／upstream一致、worktree clean、`origin/main`不変、open PR 0を確認し、checkpoint結果を親作業場へ記録して停止する。

## 4. rollbackと停止条件

- branch、HEAD、upstream、`origin/main`、現在の6-file差分が基準と不一致。
- copy先に同名fileがある、copy後またはstagedに20 files以外がある、欠落、tracked変更、削除、ignore、reparse pointがある。
- hash、manifest、構文、byte一致、`diff --cached --check`、secret／leak scanのいずれかが不合格。
- commit結果が曖昧、pushが拒否・失敗・曖昧、remote branchが想定外に進んでいる。

停止時はforce、rebase、amend、追加commit、push再送、PR作成、`main`操作を行わない。commit前なら固定20 filesだけを安全にunstageし、Gateへcopyした14記録だけを削除候補としてexact list照合してから停止する。固定6 toolsは削除・rollbackしない。commit後にpushできなければlocal commitを保持し、状態を推測せず報告する。

## 5. 現在の停止点

保存範囲確認だけが完了した。Gate statusは固定6 toolsだけ未追跡、HEAD／upstreamは`5d90a3e`一致。Git add／commit／push、14記録のGate copy、C4-3B、Cloudflare、Token、secret、runtime canaryには進んでいない。
