param(
    [ValidateSet('OfflineFixture')]
    [string]$Mode = 'OfflineFixture'
)

$ErrorActionPreference = 'Stop'
if ($Mode -ne 'OfflineFixture') { throw 'REMOTE_MODE_NOT_AUTHORIZED' }
if ($env:CLOUDFLARE_API_TOKEN -or $env:CLOUDFLARE_API_KEY -or $env:CLOUDFLARE_ACCOUNT_ID) {
    throw 'REAL_CLOUDFLARE_CREDENTIAL_ENV_FORBIDDEN'
}
Write-Output '{"operation":"b2-2c4-3-live-adapter","mode":"offline-fixture","remote_attempts":0}'
