# iPhone Safari利用案内 GitHub保管・公開・公開後実機確認完了記録 2026-07-24

## 結論

iPhoneの通常Safariとホーム画面版で端末内の保存領域が分かれることへの対策として、Ver.1の利用場所をSafariへ統一し、「Safariでお使いください」の案内を通常アプリへ実装した。

変更はPull Request #14として`main`へマージされ、GitHub Pagesへの公開に成功した。公開後のiPhone Safari実機確認も全項目に合格した。

## 原因とVer.1の方針

現在のアプリは、名前、受付番号、花、スタンプ、今日の記録などをブラウザーの端末内保存領域へ保存している。

iPhoneでは通常Safariとホーム画面版の保存領域が分かれるため、同じ端末でも別の名前、受付番号、花、スタンプ、今日の記録として見える場合がある。記録が消えたのではなく、保存場所が分かれていることが原因である。

Ver.1ではホーム画面への追加を勧めず、通常Safariでそのまま利用する方針へ統一した。

## 正式なSafari利用案内

- 見出し: 「Safariで」「お使いください」
- 主ボタン: 「このまま使う」
- 副ボタン: 「案内を閉じる」
- iPhoneの通常Safariだけに初回表示する
- iPhone版Chrome・Edge・Firefox、Android、PC、ホーム画面版には表示しない
- 管理画面、受付QR、先生QRから入った画面には表示しない
- どちらのボタンでも案内を閉じ、同じ閉じた履歴を保存する
- 再読み込み、新しいSafariタブ、`?install=1`付きURLでも閉じた履歴を尊重する

## 保存データの保護

Safari利用案内の閉じた履歴には、次の専用キー1件だけを使用する。

```text
suiyoukai-safari-use-guide-dismissed-v1
```

案内を初回状態へ戻して試験する場合は、この専用キーだけを削除する。Safari実機試験開始HTMLも、このキーだけを`localStorage.removeItem()`で初期化していた。

名前、受付番号、花、スタンプ、今日の記録など、既存参加者データの保存キーは削除・初期化・変更しない。

今回の実装後および公開後の実機確認で、名前、受付番号、花、スタンプ、今日の記録に変化がないことを確認した。

## 自動試験とローカル実機試験

自動試験は全項目に合格した。

- iPhone通常Safariでは初回だけ案内を表示
- 両方のボタンで閉じた履歴を保存
- 再読み込み、新しいタブ、`?install=1`で再表示しない
- iPhone版Chrome等、Android、PC、ホーム画面版では表示しない
- 管理画面、受付QR、先生QRでは表示しない
- 既存参加者データに影響しない
- 旧ホーム画面推奨文言が利用者向け表示に残っていない

iPhone Safariのローカル実機試験も全項目に合格した。

## GitHub保管

- 作業ブランチ: `fix/iphone-safari-use-guide-2026-07-24`
- 実装コミット: `db617db7c812e6d54f2384147a771601a96ed1e2`
- コミットメッセージ: `iPhone Safari利用案内と保存領域分離対策を追加`
- Pull Request: [#14 iPhone Safari利用案内と保存領域分離対策を追加](https://github.com/jfsxxxib-wq/suiyoukai-stamp-app/pull/14)
- base: `main`
- compare: `fix/iphone-safari-use-guide-2026-07-24`
- PR内のコミット: 1件
- PR内の変更ファイル: 6件
- マージコミット: `b533b36a81b7bd2ee1026e14a6171ea90a185834`

`manifest.webmanifest`、ホーム画面アイコン、公開設定、デプロイ設定、本番データは変更していない。

## GitHub Pages公開

- 公開先: https://jfsxxxib-wq.github.io/suiyoukai-stamp-app/
- GitHub Pagesの公開更新: 完了・成功
- 公開サイトにSafari利用案内が反映された
- 公開サイトにiPhone通常Safari向けの表示判定が反映された
- 公開・デプロイのエラーや警告: なし

## 公開後のiPhone Safari実機確認

次の項目すべてに合格した。

1. 公開URLをiPhoneの通常Safariで開くとSafari利用案内が表示された
2. 「このまま使う」で案内が閉じ、通常画面を操作できた
3. 名前、受付番号、花、スタンプ、今日の記録に変化がなかった
4. 再読み込み後に案内が再表示されなかった
5. 新しいSafariタブで同じ公開URLを開いても再表示されなかった
6. ホーム画面版では案内が表示されなかった

Safariのサイトデータ全体の削除、ホーム画面アイコンの削除、名前の再入力、参加者データのリセットは行っていない。

## 最終判定

合格・完了。

原因の診断、候補Aの採用、通常アプリへの実装、自動試験、ローカル実機試験、GitHub保管、Pull Request、`main`へのマージ、GitHub Pages公開、公開後のiPhone Safari実機確認まで完了した。

