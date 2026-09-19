param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$probePath = Join-Path $PSScriptRoot 'cloudflare-d1-create-once-probe.mjs'
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
        preflight = [ordered]@{
            attempted = [bool]$parsed.preflight.attempted
            success = [bool]$parsed.preflight.success
            http_status = $parsed.preflight.http_status
            error_codes = @($parsed.preflight.error_codes | ForEach-Object { [int]$_ })
            d1_count = $parsed.preflight.d1_count
        }
        create = [ordered]@{
            attempted = [bool]$parsed.create.attempted
            outcome = [string]$parsed.create.outcome
            http_status = $parsed.create.http_status
            error_codes = @($parsed.create.error_codes | ForEach-Object { [int]$_ })
            category = [string]$parsed.create.category
            response_format = [string]$parsed.create.response_format
        }
        postcheck = [ordered]@{
            attempted = [bool]$parsed.postcheck.attempted
            success = [bool]$parsed.postcheck.success
            http_status = $parsed.postcheck.http_status
            error_codes = @($parsed.postcheck.error_codes | ForEach-Object { [int]$_ })
            d1_count = $parsed.postcheck.d1_count
        }
        post_attempts = [int]$parsed.post_attempts
        write_methods_sent = [int]$parsed.write_methods_sent
        stopped_reason = [string]$parsed.stopped_reason
    }
}

$form = [System.Windows.Forms.Form]::new()
$form.Text = 'Cloudflare D1 一回限りPOST・非表示入力'
$form.StartPosition = 'CenterScreen'
$form.Size = [System.Drawing.Size]::new(590, 515)
$form.MinimumSize = $form.Size
$form.MaximumSize = $form.Size
$form.TopMost = $true
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$form.FormBorderStyle = 'FixedDialog'

$ready = New-Label 'INPUT_WAITING_READY' 28 20 520 34
$ready.Font = [System.Drawing.Font]::new('Segoe UI', 15, [System.Drawing.FontStyle]::Bold)
$ready.ForeColor = [System.Drawing.Color]::FromArgb(16, 92, 72)
$form.Controls.Add($ready)

$description = New-Label "この画面を確認してから、D1 Writeだけの短期Tokenを作成してください。`r`nPOST前にD1 0件を確認し、create POSTは最大1回だけ送ります。" 30 62 520 52
$form.Controls.Add($description)

$form.Controls.Add((New-Label 'Account ID（非表示）' 30 126 230 24))
$accountBox = [System.Windows.Forms.TextBox]::new()
$accountBox.Location = [System.Drawing.Point]::new(30, 151)
$accountBox.Size = [System.Drawing.Size]::new(520, 29)
$accountBox.UseSystemPasswordChar = $true
$form.Controls.Add($accountBox)

$form.Controls.Add((New-Label '新しい短期Token（非表示）' 30 193 250 24))
$tokenBox = [System.Windows.Forms.TextBox]::new()
$tokenBox.Location = [System.Drawing.Point]::new(30, 218)
$tokenBox.Size = [System.Drawing.Size]::new(520, 29)
$tokenBox.UseSystemPasswordChar = $true
$form.Controls.Add($tokenBox)

$summaryCheck = [System.Windows.Forms.CheckBox]::new()
$summaryCheck.Text = '正しいaccount・D1 Writeだけ・7日・不要権限0件を確認しました'
$summaryCheck.Location = [System.Drawing.Point]::new(30, 265)
$summaryCheck.Size = [System.Drawing.Size]::new(520, 36)
$form.Controls.Add($summaryCheck)

$status = New-Label '入力待ちです。まだ外部通信もPOSTも行っていません。' 30 310 520 52
$status.ForeColor = [System.Drawing.Color]::FromArgb(70, 70, 70)
$form.Controls.Add($status)

$runButton = [System.Windows.Forms.Button]::new()
$runButton.Text = '一回限りPOST試験を開始'
$runButton.Location = [System.Drawing.Point]::new(270, 405)
$runButton.Size = [System.Drawing.Size]::new(190, 40)
$form.Controls.Add($runButton)

$cancelButton = [System.Windows.Forms.Button]::new()
$cancelButton.Text = '中止'
$cancelButton.Location = [System.Drawing.Point]::new(475, 405)
$cancelButton.Size = [System.Drawing.Size]::new(75, 40)
$form.Controls.Add($cancelButton)
$form.CancelButton = $cancelButton

$cancelButton.Add_Click({
    $accountBox.Clear()
    $tokenBox.Clear()
    try { [System.Windows.Forms.Clipboard]::Clear() } catch {}
    $script:SafeOutput = '{"schema_version":1,"operation":"free-1w-create-once","status":"cancelled"}'
    $form.Close()
})

$runButton.Add_Click({
    $accountId = $accountBox.Text
    $token = $tokenBox.Text
    if (-not $summaryCheck.Checked) {
        $status.Text = 'Token Summaryの4条件を確認してチェックしてください。'
        $status.ForeColor = [System.Drawing.Color]::FromArgb(165, 72, 0)
        return
    }
    if ($accountId -notmatch '^[0-9a-fA-F]{32}$' -or $token -notmatch '^\S{20,256}$') {
        $status.Text = '入力形式を確認してください。値は送信されていません。'
        $status.ForeColor = [System.Drawing.Color]::FromArgb(165, 72, 0)
        return
    }

    $runButton.Enabled = $false
    $cancelButton.Enabled = $false
    $accountBox.Enabled = $false
    $tokenBox.Enabled = $false
    $summaryCheck.Enabled = $false
    $status.Text = 'POST前確認と一回限りPOSTを実行しています…'
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
        $script:SafeOutput = $safe | ConvertTo-Json -Compress -Depth 7

        if ($safe.stopped_reason -eq 'none' -and $safe.create.outcome -eq 'success' -and $safe.postcheck.d1_count -eq 1) {
            $status.Text = '隔離D1 1件を確認しました。Tokenを失効してください。'
            $status.ForeColor = [System.Drawing.Color]::FromArgb(16, 92, 72)
        } elseif ($safe.stopped_reason -eq 'outcome_unknown') {
            $status.Text = '結果不明で安全停止しました。再試行せずToken失効とD1件数確認をしてください。'
            $status.ForeColor = [System.Drawing.Color]::FromArgb(165, 72, 0)
        } else {
            $status.Text = '安全停止しました。再試行せずTokenを失効してください。'
            $status.ForeColor = [System.Drawing.Color]::FromArgb(165, 32, 32)
        }
    } catch {
        $script:SafeOutput = '{"schema_version":1,"operation":"free-1w-create-once","status":"safe_stop"}'
        $status.Text = '安全停止しました。再試行せずTokenを失効し、D1件数を確認してください。'
        $status.ForeColor = [System.Drawing.Color]::FromArgb(165, 32, 32)
    } finally {
        $accountId = $null
        $token = $null
        $stdout = $null
        $stderr = $null
        try { [System.Windows.Forms.Clipboard]::Clear() } catch {}
        $closeButton = [System.Windows.Forms.Button]::new()
        $closeButton.Text = '閉じる'
        $closeButton.Location = [System.Drawing.Point]::new(445, 405)
        $closeButton.Size = [System.Drawing.Size]::new(105, 40)
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

