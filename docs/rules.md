# ルールメモ

このアプリのルール本体は `stamp-rules.js` にあります。

## 参加スタンプ

- 対象: 会への参加
- 1巡目の達成条件: 10回
- 1巡目の花: コスモス
- 2巡目の花: 藤
- 3巡目の花: 金木犀
- 1巡ごとに妖精を達成します。
  - 10回: コスモスの妖精
  - 20回: ダリアの妖精
  - 30回: 梅の妖精
- 達成名: コスモス満開
- 勲章: コスモス満開勲章
- 称号: コスモス満開の友

## 先生ごとの妖精達成

同じ先生の指導碁スタンプを5回集めると、その巡に対応する妖精を達成します。
先生ごとに15回まで記録できます。
1巡目が終わった後は、同じ先生カード内で2巡目・3巡目の花が先生ごとに別の花へ変わります。
各先生ごとに、1巡目・2巡目・3巡目の3妖精を達成できます。

## 18枠の花割り当て

| 枠 | 1巡目 | 2巡目 | 3巡目 |
| --- | --- | --- | --- |
| 参加スタンプ | コスモス | 藤 | 金木犀 |
| 常石先生 | 菖蒲 | 蓮 | 菫 |
| 結城先生 | 椿 | 牡丹 | 百合 |
| 小池先生 | ひまわり | 朝顔 | 桔梗 |
| 山城先生 | 紫陽花 | 撫子 | 水仙 |
| 松本先生 | 桜 | 萩 | 芍薬 |

追加した12種類は、藤、金木犀、蓮、菫、牡丹、百合、朝顔、桔梗、撫子、水仙、萩、芍薬です。

| 先生 | 花 | 妖精 | 素材 |
| --- | --- | --- | --- |
| 常石 隆志 六段 | 菖蒲 | 菖蒲の妖精 | `fairy-companion-iris-v2.png` |
| 結城 聡 九段 | 椿 | 椿の妖精 | `fairy-companion-camellia-v2.png` |
| 小池 芳弘 七段 | ひまわり | ひまわりの妖精 | `fairy-companion-sunflower-v2.png` |
| 山城 宏 九段 | 紫陽花 | 紫陽花の妖精 | `fairy-companion-hydrangea-v2.png` |
| 松本 武久 八段 | 桜 | 桜の妖精 | `fairy-companion-sakura-v2.png` |

今の方針:

- 先生ごとの妖精達成は、勲章なし
- 先生ごとの妖精達成は、称号あり
- 先生ごとの妖精達成と先生の輪は別ルール

## 先生の輪

先生5人から各1回ずつ指導碁を受けると、先生の輪が1巡します。

| 巡数 | 勲章 | 称号 |
| --- | --- | --- |
| 1巡 | 先生の輪 一巡勲章 | 先生の輪をひらいた旅人 |
| 2巡 | 先生の輪 二巡勲章 | 先生の輪をめぐる旅人 |
| 3巡 | 先生の輪 三巡勲章 | 先生の輪を深める旅人 |
| 5巡 | 先生の輪 五巡勲章 | 先生の輪の案内人 |

## 予備・追加候補の花

| 花 | 状態 | 素材 |
| --- | --- | --- |
| ダリア | 花素材あり、妖精素材あり | `dahlia-stamp-stage-05-list.png`, `fairy-companion-dahlia-v2.png` |
| 梅 | 予備素材あり | `ume-stamp-reserve.png` |

## 判定関数

`stamp-rules.js` に以下の関数があります。

- `evaluateParticipationAchievement(count)`
- `evaluateTeacherFairyAchievements(teacherLessonCounts)`
- `evaluateTeacherCircleAchievements(teacherCircleRounds)`
- `evaluateAllAchievements(progress)`

`script.js` 側では、現在の画面上の仮スタンプ数から `evaluateAllAchievements()` を呼んで、冒険者カードに結果を表示しています。

## `userProgress` の形

保存する進捗データは以下の形に整理しています。

- `schemaVersion`
- `stamps.participationCount`
- `stamps.teacherLessonCounts`
- `stamps.teacherCircleRounds`
- `earned.fairies`
- `earned.medals`
- `earned.titles`

古い保存形式が `localStorage` に残っていても、読み込み時にこの形へ寄せます。
