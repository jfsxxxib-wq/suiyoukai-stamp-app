# 先生写真の差し替えメモ 2026-07-06

先生写真は年齢、肩書き、掲載許可、画質の都合で差し替えが起こる前提にする。

## 変更する場所

写真の表示元は `styles.css` の最後にある `Current teacher photo sources` にまとめる。

差し替える時は、該当する先生の `--teacher-photo-image` だけを新しい画像ファイルへ変更する。

## 先生IDと現在の画像

- 常石先生: `akari` / `assets/teacher-photo-1.jpg`
- 結城先生: `yuki` / `assets/teacher-yuki.jpg`
- 小池先生: `koike` / `assets/teacher-koike.jpg`
- 山城先生: `yamashiro` / `assets/teacher-yamashiro.jpg`
- 松本先生: `matsumoto` / `assets/teacher-matsumoto-suit-20260706-v3.png`（試験表示）

## 差し替え時のルール

- 元の写真は消さない。
- 新しい写真は別名で `assets/` に追加する。
- ファイル名には日付か版番号を入れる。
- CSSの読み込み番号も更新する。
- 顔全体と肩の一部が自然に見える写真を使う。
- 本採用前は「試験表示」として扱う。
