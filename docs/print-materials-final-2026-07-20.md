# 水曜会アプリ紹介プリント2種 確定記録 2026-07-20

状態: 確定・印刷用データ作成済み

## 1. 水曜会アプリでできること

用途: 初めての方へ、水曜会アプリの5つの機能を1枚で紹介する。

確定ファイル:

- `output/pdf/suiyoukai_app_guide_A4_print.pdf`
- `output/pdf/suiyoukai_app_guide_A4_print_master_300dpi.jpg`
- `output/pdf/suiyoukai_app_guide_source.jpg`

確認内容:

- A4縦、1ページ
- 画像全体を縦横比のまま中央配置
- 下端、花、細かい文字に欠けなし
- 左下に小さな `Apollon Team` 羽ペンサイン
- 家庭用プリンター、コンビニ印刷向け

## 2. 先生の花カード一覧

用途: 7人の先生について、名前、段位、花、写真を1枚で紹介する。

確定ファイル:

- `output/pdf/suiyoukai_teacher_flower_cards_exact_photos_A4_print.pdf`
- `output/images/suiyoukai_teacher_flower_cards_exact_photos.png`
- `output/images/suiyoukai_teacher_flower_cards_exact_photos_300dpi.jpg`
- `output/images/suiyoukai_teacher_flower_cards_layout_source.png`

確認内容:

- A4縦、1ページ
- 写真下の細かい説明文は掲載しない
- 写真下は先生ごとの小さな花飾り
- 左下に小さな `Apollon Team` 羽ペンサイン
- 下端、花、文字、サインに欠けなし
- 7人の写真は画像生成で描き直さず、アプリが現在参照している元写真を直接配置

## 使用した先生写真

| 先生 | アプリの元写真 |
| --- | --- |
| 小池 芳弘 七段 | `assets/teacher-koike.jpg` |
| 山城 宏 九段 | `assets/teacher-yamashiro.jpg` |
| 松本 武久 八段 | `assets/teacher-matsumoto-suit-20260706-v3.png` |
| 結城 聡 九段 | `assets/teacher-yuki.jpg` |
| 常石 隆志 六段 | `assets/teacher-tsuneishi-20260713-photo-2.jpg` |
| 徐 文燕 三段 | `assets/teacher-jo-bunen-20260719.jpg` |
| 大西 竜平 七段 | `assets/teacher-onishi-ryohei-20260719.jpg` |

## 確定までの判断

- 最初の生成見本では、小池先生と山城先生の顔が元写真から変化していた。
- 人物写真は生成画像を使わず、アプリ内の元写真をそのまま写真枠へ配置する方式へ変更した。
- 2026-07-20、悦子さんから先生一覧を「これがいいです」、機能紹介を「こちらも確定」と承認いただいた。

## 注意

- 今回確定したのは説明用の印刷物であり、アプリ本体の表示や機能は変更していない。
- 将来先生写真を差し替える場合は、`docs/brand/先生写真の差し替えルール_Ver1.md` に従う。
