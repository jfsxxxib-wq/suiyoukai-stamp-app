# 追加先生A/B 本番運用までの道順

## 方針

追加先生A/Bは、アプリの枠としては実装済みです。ここから先は、仮素材を本番素材へ差し替え、実際の先生名にして、スマホで安心して使えるかを確認します。

## 1. 本番素材の差し替え

下のファイル名のまま、`assets/` の中へ本番画像を上書きします。アプリ側の参照先はすでにこの名前になっています。

### 花

| 先生枠 | 巡 | 花 | 上書きするファイル |
| --- | ---: | --- | --- |
| 追加先生A | 1 | すずらん | `assets/suzuran-stamp-stage-05-list.png` |
| 追加先生A | 2 | 木蓮 | `assets/mokuren-stamp-stage-05-list.png` |
| 追加先生A | 3 | ひなげし | `assets/hinageshi-stamp-stage-05-list.png` |
| 追加先生B | 1 | 白詰草 | `assets/shirotsumekusa-stamp-stage-05-list.png` |
| 追加先生B | 2 | 蘭 | `assets/ran-stamp-stage-05-list.png` |
| 追加先生B | 3 | 花水木 | `assets/hanamizuki-stamp-stage-05-list.png` |

### 妖精

| 先生枠 | 巡 | 妖精 | 上書きするファイル |
| --- | ---: | --- | --- |
| 追加先生A | 1 | ネズミ妖精 | `assets/fairy-companion-suzuran-mouse.png` |
| 追加先生A | 2 | 白猫妖精 | `assets/fairy-companion-mokuren-white-cat.png` |
| 追加先生A | 3 | リス妖精 | `assets/fairy-companion-hinageshi-squirrel.png` |
| 追加先生B | 1 | トイプードル妖精 | `assets/fairy-companion-shirotsumekusa-toy-poodle.png` |
| 追加先生B | 2 | 亀妖精 | `assets/fairy-companion-ran-turtle.png` |
| 追加先生B | 3 | 鶴妖精 | `assets/fairy-companion-hanamizuki-crane.png` |

## 2. 追加先生の名前・段位を確定

実際の先生名と段位が決まったら、表示名、紹介文、初期表示を差し替えます。内部IDは変えず、`teacher_extra_01` と `teacher_extra_02` のまま使います。

変更する主な項目:

- 先生名
- 段位
- 今日の先生カードの紹介文
- 先生一覧と先生詳細の紹介文
- 写真や初期表示

## 3. スマホ表示確認

本番素材差し替え後に見る場所:

- 花図鑑
- 先生一覧
- 先生詳細
- 神社画面の今日の先生
- 運営画面の押印対象

## 4. 押印運用の確認

追加先生A/Bは押印対象に含めます。ただし先生の輪の達成条件は、これまで通り基本5人だけにします。

確認すること:

- 運営画面から追加先生A/Bを選べる
- 追加先生A/Bの押印が記録される
- 基本5人の先生の輪が後退しない
- 追加先生A/Bは先生の輪の達成条件に入らない

## 5. バックアップ復元の実地確認

古いバックアップに追加先生A/BのIDがない場合でも、復元時に0回として補完される状態です。次は画面操作で復元を確認します。

## 6. 次の冒険の出し方

追加先生A/Bを次の冒険にすぐ出すか、基本5人を優先してから出すかを決めます。おすすめは、基本5人を優先しつつ、追加先生がイベント参加している日は今日の先生で自然に見える形です。

## 7. 最終スマホ確認

最後にスマホで通し確認します。

- トップ
- 花図鑑
- 先生一覧
- 追加先生詳細
- 神社画面の今日の先生
- 運営押印
- バックアップ復元

## 差し替え後に実行する確認

```powershell
node docs\verify-extra-teacher-assets-2026-07-02.cjs
node docs\verify-extra-teacher-production-flow-2026-07-02.cjs
node docs\verify-shrine-today-teachers-2026-07-02.cjs
node docs\verify-backup-restore.cjs
```
