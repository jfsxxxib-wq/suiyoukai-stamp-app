# 追加先生A/B 本番素材差し替え準備 2026-07-02

## 目的

追加先生A/Bの花・妖精素材を、あとで画像ファイルだけ差し替えればよい状態にする。

## 差し替え方法

下のファイル名で本番画像を `assets/` に上書きする。コード側はすでにこの本番用ファイル名を参照している。

## 花素材

| 先生枠 | 巡 | 花 | 本番ファイル名 | 現在の状態 |
| --- | --- | --- | --- | --- |
| 追加先生A | 1 | すずらん | `assets/suzuran-stamp-stage-05-list.png` | 仮素材あり |
| 追加先生A | 2 | 木蓮 | `assets/mokuren-stamp-stage-05-list.png` | 仮素材あり |
| 追加先生A | 3 | ひなげし | `assets/hinageshi-stamp-stage-05-list.png` | 仮素材あり |
| 追加先生B | 1 | 白詰草 | `assets/shirotsumekusa-stamp-stage-05-list.png` | 仮素材あり |
| 追加先生B | 2 | 蘭 | `assets/ran-stamp-stage-05-list.png` | 仮素材あり |
| 追加先生B | 3 | 花水木 | `assets/hanamizuki-stamp-stage-05-list.png` | 仮素材あり |

## 妖精素材

| 先生枠 | 巡 | 妖精 | 本番ファイル名 | 現在の状態 |
| --- | --- | --- | --- | --- |
| 追加先生A | 1 | ネズミ妖精 | `assets/fairy-companion-suzuran-mouse.png` | 仮素材あり |
| 追加先生A | 2 | 白猫妖精 | `assets/fairy-companion-mokuren-white-cat.png` | 仮素材あり |
| 追加先生A | 3 | リス妖精 | `assets/fairy-companion-hinageshi-squirrel.png` | 仮素材あり |
| 追加先生B | 1 | トイプードル妖精 | `assets/fairy-companion-shirotsumekusa-toy-poodle.png` | 仮素材あり |
| 追加先生B | 2 | 亀妖精 | `assets/fairy-companion-ran-turtle.png` | 仮素材あり |
| 追加先生B | 3 | 鶴妖精 | `assets/fairy-companion-hanamizuki-crane.png` | 仮素材あり |

## 注意

- 現在は既存素材をコピーした仮画像。
- 本番素材ができたら、同じファイル名で上書きする。
- 上書き後は `docs/verify-extra-teacher-assets-2026-07-02.cjs` と `docs/verify-extra-teachers-ui-2026-07-02.cjs` を再実行する。
- 鶴妖精は、別の妖精翼を足すより、鶴自身の翼を生かす方針。
