# iPhone Safari・ホーム画面版 保存領域分離の診断と対策実装結果 2026-07-24

## 現在の判定

**対策実装・ローカル試験合格、未公開**

- 候補A「Safariでお使いください」を正式採用
- 通常アプリへローカル実装済み
- Safari利用案内の自動試験は全項目合格
- iPhone Safariのローカル実機試験も全項目合格
- 名前・受付番号・花・スタンプ・今日の記録への影響なし
- 公開、GitHub保存、コミット、プッシュは未実施

## 結論

原因は、iPhoneのSafariとホーム画面版が別々の端末内保存領域を使うことにある。

現行アプリは、名前、受付番号、花、スタンプ、今日の記録などをブラウザーの`localStorage`へ保存している。Safariとホーム画面版の`localStorage`は共有されないため、同じ端末でも別の記録として見える。

Safari側の記録は再読み込み後も残っており、先生共有の15秒タイムアウト対応によるデータ消失ではない。先生ページやサーバー側の問題でもない。

Ver.1では利用場所をSafariへ統一し、保存済みの名前・受付番号・花・スタンプが別の保存領域へ分かれることを防ぐ。

## 実機で確認した事実

### Safari

- 保存済みの冒険者名と受付番号が表示された
- 受付QRの参加スタンプが表示された
- 先生QRの指導碁スタンプが表示された
- 同じQRの再読取で二重に増えなかった
- Safari再読み込み後も名前と今日の記録が残った

### ホーム画面版

- Safariとは異なる冒険者名が表示された
- Safariで入れた今日の参加・先生スタンプが表示されなかった
- Safariとは異なる受付番号が表示された

以上から、記録が消えたのではなく、Safariとホーム画面版で保存場所が分かれていると診断した。

## 原因

現在のアプリは、次の情報をブラウザーの`localStorage`へ保存している。

- 冒険者名
- 受付番号
- 累計の花とスタンプ
- 今日の記録
- QRの二重読取防止ID
- 先生共有の送信待ち記録

ホーム画面版は`display: standalone`の独立したWebアプリとして開く。AppleとWebKitの公式説明どおり、iPhoneではSafariとホーム画面Webアプリの保存領域が分かれ、`localStorage`はコピー・共有されない。

`manifest`のキャッシュ更新、Service Worker、`navigator.storage.persist()`だけでは、2つの保存領域を共有できない。

## 正式採用した対策

候補A「Safariでお使いください」を正式採用した。

表示内容:

- 見出し: 「Safariで」「お使いください」
- 主ボタン: 「このまま使う」
- 副ボタン: 「案内を閉じる」
- ホーム画面へ追加するとSafariとは別の記録として保存される場合があることを、生成り色と薄い黄色の案内で説明する

表示条件:

- iPhoneの通常Safariだけに初回表示する
- iPhone版Chrome・Edge・Firefox、Android、PC、ホーム画面版には表示しない
- 管理画面、受付QR、先生QRから入った画面には表示しない
- どちらのボタンでも案内を閉じ、専用の履歴だけを`localStorage`へ保存する
- 再読み込み、新しいSafariタブ、`?install=1`付きURLでも閉じた履歴を尊重する

既存の名前・受付番号・花・スタンプ・今日の記録の保存キーは変更していない。`manifest.webmanifest`とホーム画面アイコンも変更していない。

## 試験結果

### 自動試験

全項目合格。

- iPhone通常Safariで初回だけ表示
- 「このまま使う」と「案内を閉じる」で閉じた履歴を保存
- 再読み込みと新しいタブで再表示しない
- `?install=1`でも閉じた履歴を尊重
- iPhone版Chrome等、Android、PC、ホーム画面版で表示しない
- 受付QR、先生QR、管理画面で表示しない
- 名前、受付番号、花、スタンプ、今日の記録に影響しない
- 旧ホーム画面案内文が通常画面に残っていない

### iPhone Safari実機試験

全項目合格。

- 通常Safariの初回表示を確認
- 「このまま使う」で案内が閉じ、通常画面を操作できた
- 再読み込み後も案内が再表示されなかった
- 新しいSafariタブと`?install=1`付きURLでも再表示されなかった
- 名前・受付番号・花・スタンプが変化していなかった
- ホーム画面版では案内が表示されなかった

## 保全

実機写真には受付番号が写っているため、公開される可能性があるリポジトリには保存しない。記録には観察結果だけを残す。

試験中は、ホーム画面アイコンの削除、名前の再入力、端末データのリセット、不要な追加QR読取を行っていない。

## 公開状態と次の段階

通常アプリへの変更はローカル環境にだけ存在する。公開サイトとGitHubにはまだ反映しておらず、ブランチ作成、ステージング、コミット、プッシュ、Pull Request作成も行っていない。

次の段階:

1. 今回の6ファイルをGitHubへ保管する
2. 内容確認後に公開する
3. 公開後、iPhoneの通常Safariで初回表示、閉じる操作、再読み込み後の非表示、保存データ不変を短く確認する

## 公式情報

- Apple WWDC23「What’s new in web apps」
  - https://developer.apple.com/videos/play/wwdc2023/10120/
- WebKit「WebKit Features in Safari 17.2」
  - https://webkit.org/blog/14787/webkit-features-in-safari-17-2/
- WebKit「Web Push for Web Apps on iOS and iPadOS」
  - https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- WebKit「WebKit Features in Safari 26.0」
  - https://webkit.org/blog/17333/webkit-features-in-safari-26-0/
- WebKit「Updates to Storage Policy」
  - https://webkit.org/blog/14403/updates-to-storage-policy/
