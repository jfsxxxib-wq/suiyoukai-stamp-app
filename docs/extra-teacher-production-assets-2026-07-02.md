# 追加先生A/B 本番素材差し替え準備 2026-07-02

## 目的

追加先生A/Bの花・妖精素材を、あとで画像ファイルだけ差し替えればよい状態にする。

## 差し替え方法

下のファイル名で本番画像を `assets/` に上書きする。コード側はすでにこの本番用ファイル名を参照している。

## 花素材

| 先生枠 | 巡 | 花 | 本番ファイル名 | 現在の状態 |
| --- | --- | --- | --- | --- |
| 追加先生A | 1 | すずらん | `assets/suzuran-stamp-stage-05-list.png` | 本番差し替え済み 2026-07-03 |
| 追加先生A | 2 | 木蓮 | `assets/mokuren-stamp-stage-05-list.png` | 本番差し替え済み 2026-07-03 |
| 追加先生A | 3 | ひなげし | `assets/hinageshi-stamp-stage-05-list.png` | 本番差し替え済み 2026-07-03 |
| 追加先生B | 1 | 白詰草 | `assets/shirotsumekusa-stamp-stage-05-list.png` | 本番差し替え済み 2026-07-03 |
| 追加先生B | 2 | 蘭 | `assets/ran-stamp-stage-05-list.png` | 本番差し替え済み 2026-07-03 |
| 追加先生B | 3 | 花水木 | `assets/hanamizuki-stamp-stage-05-list.png` | 本番差し替え済み 2026-07-03 |

## 妖精素材

| 先生枠 | 巡 | 妖精 | 本番ファイル名 | 現在の状態 |
| --- | --- | --- | --- | --- |
| 追加先生A | 1 | ネズミ妖精 | `assets/fairy-companion-suzuran-mouse.png` | 本番差し替え済み 2026-07-03 |
| 追加先生A | 2 | 白猫妖精 | `assets/fairy-companion-mokuren-white-cat.png` | 本番差し替え済み 2026-07-03 |
| 追加先生A | 3 | リス妖精 | `assets/fairy-companion-hinageshi-squirrel.png` | 本番差し替え済み 2026-07-03 |
| 追加先生B | 1 | トイプードル妖精 | `assets/fairy-companion-shirotsumekusa-toy-poodle.png` | 本番差し替え済み 2026-07-03 |
| 追加先生B | 2 | 亀妖精 | `assets/fairy-companion-ran-turtle.png` | 本番差し替え済み 2026-07-03 |
| 追加先生B | 3 | 鶴妖精 | `assets/fairy-companion-hanamizuki-crane.png` | 本番差し替え済み 2026-07-03 |

## 注意

- 2026-07-03に既存素材コピーの仮画像から本番素材へ差し替え済み。
- 旧仮素材バックアップ: `docs/extra-teacher-placeholder-backup-2026-07-03/`
- 生成元シート:
  - `docs/extra-teacher-flowers-production-sheet-2026-07-03.png`
  - `docs/extra-teacher-fairies-production-sheet-2026-07-03.png`
- 差し替え後の確認一覧: `docs/extra-teacher-production-replacement-preview-2026-07-03.png`
- 仮置き戻り防止の確認: `docs/verify-production-assets-no-placeholders-2026-07-03.cjs`
- 上書き後は `docs/verify-production-assets-no-placeholders-2026-07-03.cjs`、`docs/verify-extra-teacher-assets-2026-07-02.cjs`、`docs/verify-extra-teachers-ui-2026-07-02.cjs` を再実行する。
- 鶴妖精は、別の妖精翼を足すより、鶴自身の翼を生かす方針。
