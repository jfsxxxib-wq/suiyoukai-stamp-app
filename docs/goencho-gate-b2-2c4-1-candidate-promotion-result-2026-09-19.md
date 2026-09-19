# Gate B2-2C4-1 candidate昇格結果

実施日時：2026-09-19 19:18（日本時間）

判定：**PASS。固定23ファイルだけをcandidateへ反映し、GitHub・B2-2C4-2・secret・runtime canary・Cloudflareへ進まず停止した。**

## 固定範囲

- 反映元：`tmp/goencho-b2-2c4-1-worker-http-parity-20260919-offline/`
- 反映先：`work/goencho-gate-b2-cloudflare-candidate-20260918/prototype/goencho-gate-b2-cloudflare-candidate/`
- 対象：計画書に固定した23 pathのみ（既存変更22、新規1、削除0）。
- 事前退避：`tmp/goencho-b2-2c4-1-candidate-promotion-rollback-20260919-1915/`
- 既存22ファイルは22／22退避済み。新規`cloudflare/tests/09-worker-http-parity.test.mjs`はrollback時の削除対象として記録済み。

## 反映結果

- 反映元とのbyte一致：23／23。
- 反映前manifestとの差分：23件。変更22、新規1、削除0。
- 固定23 pathとの集合一致：PASS。予定外差分0。
- 反映後tree SHA-256：`0015C1D9E2A882082BEB82DCFEADDD7321BF83BBBDDD8AFD6742F76A79520A8F`。期待値と一致。
- `SOURCE_MANIFEST.sha256` SHA-256：`F967FE27B90EAE2C98F1C42BFD5EFDB0E6B38E0D17195769425E18AB9FAF2FA6`。
- `0001_goencho.sql` SHA-256：`0EAADB9E1A72D1947414F50A45073D0B00FD8E33DE8267E15288D10A2F6194ED`。不変。
- `0002_auth_write_guards.sql` SHA-256：`1391CCC7B0599C7B22191DD4BD8F801BA3218218E3D989D0199D164DE48D676C`。不変。

初回反映確認では、検証側だけが相対pathの区切りを計画時と異なる形式へ正規化したため、tree hashが偽不一致になった。追加作業を止め、退避22ファイルの復元と新規1ファイルの除去を実施し、反映前tree hash `7726318580E2671484E15B3B751E53A8CAC928D28653C7283A3F64C96B6F05C6`、差分0、新規不在へ完全に戻ったことを確認した。その後、計画時と同一のhash方式で23ファイルを再反映し、上記期待値へ一致した。remote操作やGit操作は行っていない。

## Offline試験

- 主要7 JavaScript filesの`node --check`：PASS。
- B1：168／168 PASS。
- Cloudflare：72／72 PASS（F01〜F10の11 fixtureを含む）。
- 合計：240／240 PASS。
- scope check：111 files、PASS。
- leak scan：10 runtime secret markers不在、PASS。
- source manifest：115 files、PASS。

## Git・外部状態

- Gate branch：`codex/goencho-gate-b2-cloudflare-candidate-20260918`。
- Gate HEAD／upstream：ともに`94131e1c65ee2ce41f453d42487a7852b76a1842`。Git書込みなし。
- Gate statusは従来どおり`?? prototype/`。commit、push、PR、`main`変更なし。
- 対象port 4191、4192、63496のlistener：0。
- Token作成、secret設定、Cloudflare API、remote request、runtime canary、deploy、公開、本番data変更：0。

## 停止位置

B2-2C4-1のcandidate反映とoffline再検証だけを完了した。GitHub checkpoint、B2-2C4-2、secret、runtime canary、Cloudflareは別計画・別承認までHOLDする。
