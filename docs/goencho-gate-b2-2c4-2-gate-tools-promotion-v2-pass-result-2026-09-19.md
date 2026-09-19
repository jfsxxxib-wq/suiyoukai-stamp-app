# Gate B2-2C4-2 Gate tools昇格 v2 PASS結果

実行日時：2026-09-19 23:15〜23:18（日本時間）

判定：**PASS_CANDIDATE。host分離launcherでguardianをWindows PowerShell 5.1、runnerをPowerShell 7.6.5へ分離し、固定7 filesのGate tools再昇格後に8 phase・255件を1回だけ完走した。cleanup後は全対象Firewall rule 0、専用Node 0、listener 0。固定7 filesを未追跡で保持し、Git操作へ進まず停止した。**

## 1. 固定基準

- Gate branch：`codex/goencho-gate-b2-cloudflare-candidate-20260918`。
- Gate HEAD／upstream：`9afbc0dea94dd6af2a247a03d01898d0e9d03c2c`。
- Gate tools：`tools/goencho-gate-b2-c4-2-offline-20260919/`。
- 実行root：`tmp/goencho-b2-2c4-2-gate-tools-promotion-validation-v2-20260919/`。
- rule：`Codex-Goencho-C42-Gate-Tools-Promotion-V2-V3B-20260919`。
- launcher SHA-256：`9A33AA3218532BDB7A9B7F9E4138650A109AA12906D820E1557F91C5FD0BD458`。
- host probe SHA-256：`B1D0BBB8762037153771D182D493F832EEAF8F37296E5D0FE68D61B702D7F1D1`。
- guardian SHA-256：`5B2440D284FBFE9D83A4AAADFB7FA55CBB2D9C481381E5E21B81CC53CA21C47F`。
- runner／wrapper SHA-256：`95728A3A...783DE`／`4BA868AE...A635`。

## 2. 昇格とUAC前監査

- Gate tools：新規7、変更0、削除0、既存退避0。
- 反映元／Gate／実行copy：各7 files、三者7／7 byte一致、予定外file 0、ignore 0、reparse point 0。
- Gate差分：固定7 untracked filesだけ。
- candidate正本／実行copy：116／116 byte一致。
- candidate tree SHA-256：`0015C1D9E2A882082BEB82DCFEADDD7321BF83BBBDDD8AFD6742F76A79520A8F`。
- deployment contract SHA-256：`960A67C4DDC1E9F3377383A3F60C58999E32A7B27CD0069E022F35D43E40E0BA`。
- tool manifest 6／6、candidate manifest 115／115、V3-B manifest 3／3、launcher manifest 3／3。
- PowerShell構文6／6、Node構文5／5。
- candidate直下は通常`node_modules`、内部junctionは`wrangler`／`@electric-sql`の2件だけ。
- launcher PlanOnly、guardian host probe Desktop 5.1.26100.9444、runner host probe Core 7.6.5：PASS。
- 開始前全対象rule 0、専用Node 0、listener 0。

## 3. 実行回数

- UAC：1回。
- guardian start：1回、runner start：1回。
- Firewall rule作成／削除：各1回。
- 8 phase：各1回。
- retry、runner再起動、phase再実行、rule再作成：0。
- guardian／runner exit：0／0。

## 4. 観測結果

- NetSecurity境界照合：18回、最大6,917.152 ms／上限15,000 ms。
- COM観測：warmup 20、active 309。
- COM API最大：51.395 ms／上限250 ms。
- completed-sample gap最大：154.196 ms／warmup上限500 ms・active上限1,000 ms。
- invariant failure、属性不一致、上限超過：0。
- event chain：385／385、独立再計算head `B4291599E20BC3DC3004CDD842776B779EBE57F9F68F5AF85578F78B98900810`がcleanupと一致。

## 5. 8 phase

| phase | samples | API max ms | gap max ms | NetSecurity pre／post ms | 結果 |
|---:|---:|---:|---:|---:|---|
| 1 | 2 | 9.972 | 144.307 | 6,729.889／6,865.928 | PASS |
| 2 | 5 | 16.038 | 139.834 | 6,870.207／6,699.055 | PASS |
| 3 | 28 | 30.110 | 151.694 | 6,778.071／6,085.544 | 15／15 PASS |
| 4 | 68 | 20.530 | 154.196 | 6,691.490／6,761.940 | 168／168 PASS |
| 5 | 197 | 31.798 | 147.594 | 6,727.665／6,750.684 | 72／72 PASS |
| 6 | 3 | 22.297 | 145.251 | 6,717.492／6,747.391 | scope PASS |
| 7 | 3 | 18.351 | 138.418 | 6,713.529／6,755.702 | leak PASS |
| 8 | 3 | 14.826 | 125.800 | 6,726.024／6,537.171 | manifest PASS |

F01〜F14＋validator 15／15、B1 168／168、Cloudflare offline 72／72、合計255／255。既存回帰240／240、scope、leak、全manifestも合格した。

## 6. cleanupと事後照合

- final attestation：`PASS_CANDIDATE`、8 phase、invariant failure 0。
- cleanup：`REMOVED`。
- v1／v2／V3-A／V3-B／staging／promotion v1／v2を含む全対象rule：0。
- 専用Node process：0、listener 4191／4192／63496：0。
- update-check cache：SHA-256 `7CB66CE345581D55A59FA09F50DF0DAE61184A1734597F5CF15EA64C60E428FD`、UTC `2026-09-19T10:51:58.0028613Z`で不変。
- candidate正本：116 files、tree hash／deployment contract不変。
- `0001`／`0002` hash不変。
- 前回launcher STOP証跡：3 hashとevent chain 27／27不変。
- Gate status：固定7 untracked filesだけ。Git add／commit／pushは0。

## 7. 外部状態と停止点

Cloudflare API、remote request、Token、secret実値、deploy、D1、route、公開、本番データ変更は0。GitHub、PR、`main`も変更していない。

B2-2C4-2 Gate tools昇格とoffline検証はPASS。次は今回の固定7 filesと結果記録をGitHub checkpointへ保存する範囲を別確認するか、B2-2C4-3を別計画として開始する。別の明確な承認までは、Git add／commit／push、B2-2C4-3、secret、Cloudflare、runtime canaryへ進まない。
