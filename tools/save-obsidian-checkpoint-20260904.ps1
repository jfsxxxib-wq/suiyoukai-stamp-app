$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$vaultRoot = 'C:\Users\akane\OneDrive\デスクトップ\obsidian-E\最初の黒曜石'
$destination = Join-Path $vaultRoot '20_Projects\水曜会 花記録\2026-09-04 合格状態'
$resolvedVault = [System.IO.Path]::GetFullPath($vaultRoot)
$resolvedDestination = [System.IO.Path]::GetFullPath($destination)
if (-not $resolvedDestination.StartsWith($resolvedVault + '\', [System.StringComparison]::OrdinalIgnoreCase)) { throw 'Destination is outside the verified vault.' }
if (-not (Test-Path -LiteralPath (Join-Path $vaultRoot '.obsidian'))) { throw 'Obsidian vault was not found.' }
$plan = @()
Get-ChildItem -LiteralPath (Join-Path $projectRoot 'docs\obsidian') -File -Filter '2026-09-04*.md' | ForEach-Object {
  $plan += [PSCustomObject]@{Source=$_.FullName; Target=(Join-Path $destination $_.Name)}
}
Get-ChildItem -LiteralPath (Join-Path $projectRoot 'docs') -File -Filter '2026-09-04*.md' | ForEach-Object {
  $plan += [PSCustomObject]@{Source=$_.FullName; Target=(Join-Path (Join-Path $destination '詳細') $_.Name)}
}
foreach ($entry in $plan) {
  if (Test-Path -LiteralPath $entry.Target) {
    if ((Get-FileHash -LiteralPath $entry.Source).Hash -ne (Get-FileHash -LiteralPath $entry.Target).Hash) { throw ('Existing note differs; not overwritten: '+$entry.Target) }
  }
}
New-Item -ItemType Directory -Path (Join-Path $destination '詳細') -Force | Out-Null
foreach ($entry in $plan) {
  Copy-Item -LiteralPath $entry.Source -Destination $entry.Target
  if ((Get-FileHash -LiteralPath $entry.Source).Hash -ne (Get-FileHash -LiteralPath $entry.Target).Hash) { throw 'Copy verification failed.' }
}
[PSCustomObject]@{Notes=$plan.Count; Destination=$destination; HashVerification='All matched'} | ConvertTo-Json
