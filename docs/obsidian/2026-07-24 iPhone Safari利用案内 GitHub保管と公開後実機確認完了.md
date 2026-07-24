# iPhone Safari利用案内 GitHub保管と公開後実機確認完了

- 実施日: 2026-07-24
- 判定: **合格・完了**
- 原因: Safariとホーム画面版の保存領域分離
- Ver.1の方針: Safari利用へ統一
- 自動試験: 全項目合格
- ローカル実機試験: 全項目合格
- GitHub Pages公開: 成功
- 公開後iPhone Safari実機確認: 全項目合格
- 既存参加者データへの影響: なし

## 完了したこと

- 候補A「Safariでお使いください」を通常アプリへ実装
- iPhoneの通常Safariだけに初回表示
- iPhone版Chrome等、Android、PC、ホーム画面版では非表示
- 管理画面、受付QR、先生QRでは非表示
- 「このまま使う」と「案内を閉じる」で同じ閉じた履歴を保存
- 再読み込み、新しいSafariタブ、`?install=1`でも閉じた履歴を尊重
- Ver.1の案内をSafari利用方針と矛盾しない表現へ変更
- PR #14を`main`へマージ
- GitHub Pagesへの公開成功
- 公開後のiPhone Safari確認に合格

## GitHub

- 実装コミット: `db617db7c812e6d54f2384147a771601a96ed1e2`
- PR: [#14 iPhone Safari利用案内と保存領域分離対策を追加](https://github.com/jfsxxxib-wq/suiyoukai-stamp-app/pull/14)
- マージコミット: `b533b36a81b7bd2ee1026e14a6171ea90a185834`
- 公開URL: https://jfsxxxib-wq.github.io/suiyoukai-stamp-app/
- GitHub Pages公開: 成功

## 保存データの保護

Safari利用案内の閉じた履歴には、専用キーだけを使用する。

```text
suiyoukai-safari-use-guide-dismissed-v1
```

初回表示を再試験するときは、この専用キーだけを削除する。実機試験開始HTMLも、このキーだけを初期化していた。

名前、受付番号、花、スタンプ、今日の記録など、既存参加者データの保存キーは削除しない。

公開後の実機確認でも、名前、受付番号、花、スタンプ、今日の記録に変化はなかった。ホーム画面版ではSafari利用案内が表示されなかった。

## 詳細記録

- `docs/iphone-safari-use-guide-github-storage-release-and-device-verification-result-2026-07-24.md`
- `docs/iphone-safari-home-screen-storage-separation-investigation-2026-07-24.md`

