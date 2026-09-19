# Gate B2-2C4-1 Worker HTTP parity 範囲確認・HOLD handoff

記録日時：2026-09-19 18:36（日本時間）

## 結論

Worker HTTP parityをoffline限定で実装する範囲、fixture、停止条件を確認した。計画は合格、実装はHOLD。

## 重要な発見

- Cloudflare Workerはhealthと対局読取りだけを接続済み。
- D1 auth write serviceはあるが、owner／先生HTTP route、state、一覧、Cookie発行が未接続。
- ローカル版はowner／先生を別originで動かし、両方が`/api/session/unlock`・`logout`を使う。
- 単一Workerへそのまま移すとrouteが衝突する。
- owner／teacher assetもローカルroot前提で、単一origin用path固定が必要。

## 第一候補

単一Worker／単一originを維持し、次へ分離する。

- UI：`/owner/`、`/teacher/`、`/shared/`
- owner API：`/api/owner/*`
- teacher API：`/api/teacher/*`
- health：`/api/health`

Cookieの有無からroleを推測せず、pathnameだけで一意に決める。別Worker、別domain、custom routeは増やさない。

## fixture

- route／asset一意性
- binding／5 secret欠落時503
- owner state、activate、recovery、unlock、logout
- enrollment、device一覧、approve／reject／revoke
- teacher state、claim、set-pin、status、unlock、logout
- 今日／過去／個人のteacher分離
- Origin、JSON、body上限、query、ID持込み拒否
- 4 Cookieの属性、更新、clear、複数`Set-Cookie`
- transaction／20並列／failure injection
- B1 168＋Cloudflare 61、scope、leak、manifest、syntax

## 今回行っていないこと

- candidate、Worker、UI、test、runnerの変更。
- Token、secret、Cloudflare API、deploy、runtime request。
- D1 read／write、migration、restore、synthetic data。
- Git commit／push／PR／`main`変更。

## Git・外部状態

- Gate HEAD／upstream：`94131e1c65ee2ce41f453d42487a7852b76a1842`
- `origin/main`：`052c787b947bf5630fbd62f0ff168c8ec7a3506b`
- Token：0、Cloudflare通信：0。
- 隔離D1：version 3、business rows 0のまま。
- 正式resource、本番data、公開：変更なし。

## 次回の安全な再開地点

この範囲を明確に承認した場合だけ、追跡外一時copyでB2-2C4-1を実装し、offline fixtureを実行する。合格後もcandidate反映、GitHub、B2-2C4-2、外部操作へ進まず結果提示で停止する。

## 触らない

- candidate正本、migration、schema、D1 row。
- Token、secret、Cloudflare API、Worker deploy、runtime request、一時入口。
- 正式resource、本番data、route、公開、Logs／Traces。
- Git commit／push／PR、GitHub `main`。
