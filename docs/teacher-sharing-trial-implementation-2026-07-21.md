# 一局のご縁帳 共有最小試験 実装メモ

作成日: 2026年7月21日

## 位置付け

先生1人・参加者3〜5人・一人一局の最小試験用。通常状態では無効であり、本番のGoogleフォーム回答、Googleスプレッドシート、先生認証には未接続。

## 守る順序

1. 先生別固定QRを対局後に読む
2. 花、対局記録、今日の記録を参加者端末へ先に保存する
3. 試験機能が有効な場合だけ共有確認画面を開く
4. 参加者が表示名、対局日、置き石を確認する
5. 「この名前で残す」を選んだ場合だけ共有待ち記録を作る
6. 共有受付へ送信する

共有の失敗や辞退で、花と今日の記録を取り消さない。

## 共有待ち記録

保存先: `localStorage` の `suiyoukai-teacher-sharing-outbox-trial-v1`

- `recordId`
- `teacherId`
- `displayName`
- `gameDate`
- `handicap`
- `receptionCodeAtConsent`
- `consentedAt`
- `status`
- `lastAttemptAt`
- `retryCount`

`receptionCodeAtConsent` は同意時点の値を固定し、再送時も同じ値を使う。先生ページ用データには含めない。

## 試験設定の境界

通常は `window.SUIYOUKAI_TEACHER_SHARING_TRIAL` が存在しないため共有画面は開かない。試験時だけ、ページ読込前に次のいずれかを安全な設定から渡す。

```js
window.SUIYOUKAI_TEACHER_SHARING_TRIAL = {
  enabled: true,
  endpoint: "https://安全な受付処理のURL",
};
```

または、自動試験では `submitRecord(record)` を注入する。受付処理は `verified`、`unregistered`、`invalid`、`temporary_error` のいずれかだけを返す。

## 試験版の制限

- 先生1人
- 参加者3〜5人
- 一人一局
- 同じ日・同じ先生は一局のみ
- 共有項目は表示名、置き石、対局日のみ
- 勝敗、棋力、Google対局記録フォーム連携は対象外
- 共有の再送は参加者本人がボタンを押す
- 先生認証は未接続

## 確認

`docs/verify-teacher-sharing-trial-2026-07-21.cjs` で次を確認する。

- 花と今日の記録を共有前に保存
- 同意画面と置き石必須
- 同意時点の受付番号を固定
- 共有しない自由
- 同じ先生QRの二重反映防止
- 通信失敗時は端末内保留
- 本人操作による再送
- 先生本人ページの最小一局カード

