# 追加先生A/B 実装チェックポイント 2026-07-02

## 実装内容

- 追加先生A/Bを「追加先生枠」として実装。
- 追加先生A/Bは先生紹介、花図鑑、運営画面の押印対象に表示。
- 追加先生A/Bは先生の輪の達成条件には含めない。
- 先生の輪は基本5人IDだけで計算。
- 旧バックアップに追加先生IDが無い場合、復元時に0回として補完。

## 追加した先生枠

| ID | 表示名 | 1巡目 | 2巡目 | 3巡目 |
| --- | --- | --- | --- | --- |
| `teacher_extra_01` | 追加先生A | すずらん / ネズミ妖精 | 木蓮 / 白猫妖精 | ひなげし / リス妖精 |
| `teacher_extra_02` | 追加先生B | 白詰草 / トイプードル妖精 | 蘭 / 亀妖精 | 花水木 / 鶴妖精 |

## 先生の輪

- 達成条件は基本5人のまま。
- 対象ID: `tsuneishi`, `yuki`, `koike`, `yamashiro`, `matsumoto`
- 追加先生A/Bが0回でも、基本5人が1回ずつなら先生の輪は1巡のまま。

## 検証結果

- `script.js` 文法確認: OK
- `stamp-rules.js` 文法確認: OK
- `docs/verify-additional-teachers-readiness-2026-07-02.cjs`: ALL OK: 8 checks
- `docs/verify-backup-restore.cjs`: ALL OK: 7 checks
- `docs/verify-extra-teachers-ui-2026-07-02.cjs`: ALL OK

## 保管対象

- `index.html`
- `script.js`
- `stamp-rules.js`
- `docs/work-log-2026-07-02.md`
- `docs/verify-additional-teachers-readiness-2026-07-02.cjs`
- `docs/verify-backup-restore.cjs`
- `docs/verify-extra-teachers-ui-2026-07-02.cjs`
- `docs/additional-teachers-readiness-2026-07-02/result.json`
- `docs/backup-restore-check-2026-06-19/result.json`
- `docs/backup-restore-check-2026-06-19/test-old-backup-missing-extra-teachers.json`
- `docs/backup-restore-check-2026-06-19/test-before-old-restore.json`

## 注意

- 追加先生A/Bの花と妖精の画像は、現時点では既存素材を仮表示として使用。
- 花キーと妖精IDは固有名で入れてあるため、本番画像ができたら差し替えやすい。
