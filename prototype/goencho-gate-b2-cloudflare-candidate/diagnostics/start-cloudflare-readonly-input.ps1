param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$probePath = Join-Path $PSScriptRoot 'cloudflare-readonly-probe.mjs'
$nodeCommand = Get-Command node.exe -ErrorAction Stop
$script:SafeOutput = $null

function New-Label([string]$text, [int]$x, [int]$y, [int]$width, [int]$height) {
    $label = [System.Windows.Forms.Label]::new()
    $label.Text = $text
    $label.Location = [System.Drawing.Point]::new($x, $y)
    $label.Size = [System.Drawing.Size]::new($width, $height)
    return $label
}

function Convert-ToSafeResult($parsed) {
    return [ordered]@{
        schema_version = [int]$parsed.schema_version
        operation = [string]$parsed.operation
        direct = [ordered]@{
            attempted = [bool]$parsed.direct.attempted
            success = [bool]$parsed.direct.success
            http_status = $parsed.direct.http_status
            error_codes = @($parsed.direct.error_codes | ForEach-Object { [int]$_ })
            d1_count = $parsed.direct.d1_count
        }
        wrangler = [ordered]@{
            attempted = [bool]$parsed.wrangler.attempted
            success = [bool]$parsed.wrangler.success
            exit_code = $parsed.wrangler.exit_code
            d1_count = $parsed.wrangler.d1_count
        }
        same_account_input = [bool]$parsed.same_account_input
        counts_match = $parsed.counts_match
        write_methods_sent = [int]$parsed.write_methods_sent
        stopped_reason = [string]$parsed.stopped_reason
    }
}

$form = [System.Windows.Forms.Form]::new()
$form.Text = 'Cloudflare 読み取り専用・非表示入力'
$form.StartPosition = 'CenterScreen'
$form.Size = [System.Drawing.Size]::new(570, 420)
$form.MinimumSize = $form.Size
$form.MaximumSize = $form.Size
$form.TopMost = $true
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$form.FormBorderStyle = 'FixedDialog'

$ready = New-Label 'INPUT_WAITING_READY' 28 22 500 34
$ready.Font = [System.Drawing.Font]::new('Segoe UI', 15, [System.Drawing.FontStyle]::Bold)
$ready.ForeColor = [System.Drawing.Color]::FromArgb(16, 92, 72)
$form.Controls.Add($ready)

$description = New-Label "この画面を確認してから、Cloudflareで読取り専用Tokenを作成してください。`r`n値は画面・ファイル・コマンド履歴へ表示しません。" 30 64 495 48
$form.Controls.Add($description)

$form.Controls.Add((New-Label 'Account ID（非表示）' 30 125 230 24))
$accountBox = [System.Windows.Forms.TextBox]::new()
$accountBox.Location = [System.Drawing.Point]::new(30, 150)
$accountBox.Size = [System.Drawing.Size]::new(495, 29)
$accountBox.UseSystemPasswordChar = $true
$accountBox.ShortcutsEnabled = $true
$form.Controls.Add($accountBox)

$form.Controls.Add((New-Label '3個目Token（非表示）' 30 194 230 24))
$tokenBox = [System.Windows.Forms.TextBox]::new()
$tokenBox.Location = [System.Drawing.Point]::new(30, 219)
$tokenBox.Size = [System.Drawing.Size]::new(495, 29)
$tokenBox.UseSystemPasswordChar = $true
$tokenBox.ShortcutsEnabled = $true
$form.Controls.Add($tokenBox)

$status = New-Label '入力待ちです。まだ外部通信は行っていません。' 30 264 495 44
$status.ForeColor = [System.Drawing.Color]::FromArgb(70, 70, 70)
$form.Controls.Add($status)

$runButton = [System.Windows.Forms.Button]::new()
$runButton.Text = '読取り確認を開始'
$runButton.Location = [System.Drawing.Point]::new(285, 320)
$runButton.Size = [System.Drawing.Size]::new(155, 38)
$form.Controls.Add($runButton)

$cancelButton = [System.Windows.Forms.Button]::new()
$cancelButton.Text = '中止'
$cancelButton.Location = [System.Drawing.Point]::new(450, 320)
$cancelButton.Size = [System.Drawing.Size]::new(75, 38)
$form.Controls.Add($cancelButton)
$form.CancelButton = $cancelButton

$cancelButton.Add_Click({
    $accountBox.Clear()
    $tokenBox.Clear()
    try { [System.Windows.Forms.Clipboard]::Clear() } catch {}
    $script:SafeOutput = '{"schema_version":1,"operation":"free-1r-external","status":"cancelled"}'
    $form.Close()
})

$runButton.Add_Click({
    $accountId = $accountBox.Text
    $token = $tokenBox.Text
    if ($accountId -notmatch '^[0-9a-fA-F]{32}$' -or $token -notmatch '^\S{20,256}$') {
        $status.Text = '入力形式を確認してください。値は送信されていません。'
        $status.ForeColor = [System.Drawing.Color]::FromArgb(165, 72, 0)
        return
    }

    $runButton.Enabled = $false
    $cancelButton.Enabled = $false
    $accountBox.Enabled = $false
    $tokenBox.Enabled = $false
    $status.Text = 'GET限定の読取り確認を実行しています…'
    $form.Refresh()

    try { [System.Windows.Forms.Clipboard]::Clear() } catch {}

    try {
        $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
        $startInfo.FileName = $nodeCommand.Source
        $startInfo.ArgumentList.Add($probePath)
        $startInfo.ArgumentList.Add('--run')
        $startInfo.WorkingDirectory = $projectRoot
        $startInfo.UseShellExecute = $false
        $startInfo.CreateNoWindow = $true
        $startInfo.RedirectStandardOutput = $true
        $startInfo.RedirectStandardError = $true
        $startInfo.Environment['CLOUDFLARE_ACCOUNT_ID'] = $accountId
        $startInfo.Environment['CLOUDFLARE_API_TOKEN'] = $token
        $startInfo.Environment['WRANGLER_SEND_METRICS'] = 'false'

        $process = [System.Diagnostics.Process]::new()
        $process.StartInfo = $startInfo
        [void]$process.Start()
        $stdout = $process.StandardOutput.ReadToEnd()
        $stderr = $process.StandardError.ReadToEnd()
        $process.WaitForExit()

        $accountBox.Clear()
        $tokenBox.Clear()

        if ($stdout.Contains($accountId) -or $stdout.Contains($token) -or $stderr.Contains($accountId) -or $stderr.Contains($token)) {
            throw [System.InvalidOperationException]::new('Unsafe child output suppressed')
        }
        if ($process.ExitCode -ne 0) {
            throw [System.InvalidOperationException]::new('Probe safely stopped')
        }

        $parsed = $stdout | ConvertFrom-Json -ErrorAction Stop
        $safe = Convert-ToSafeResult $parsed
        $script:SafeOutput = $safe | ConvertTo-Json -Compress -Depth 6
        $status.Text = '読取り確認が完了しました。Tokenを失効してください。'
        $status.ForeColor = [System.Drawing.Color]::FromArgb(16, 92, 72)
    } catch {
        $script:SafeOutput = '{"schema_version":1,"operation":"free-1r-external","status":"safe_stop"}'
        $status.Text = '安全停止しました。Tokenを失効してください。'
        $status.ForeColor = [System.Drawing.Color]::FromArgb(165, 32, 32)
    } finally {
        $accountId = $null
        $token = $null
        $stdout = $null
        $stderr = $null
        try { [System.Windows.Forms.Clipboard]::Clear() } catch {}
        $closeButton = [System.Windows.Forms.Button]::new()
        $closeButton.Text = '閉じる'
        $closeButton.Location = [System.Drawing.Point]::new(420, 320)
        $closeButton.Size = [System.Drawing.Size]::new(105, 38)
        $closeButton.Add_Click({ $form.Close() })
        $form.Controls.Add($closeButton)
        $closeButton.BringToFront()
    }
})

$form.Add_Shown({ $form.Activate(); $accountBox.Focus() })
[void]$form.ShowDialog()

if ($script:SafeOutput) {
    [Console]::Out.WriteLine($script:SafeOutput)
}

