param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$probePath = Join-Path $PSScriptRoot 'cloudflare-worker-deploy-once-probe.mjs'
$nodeCommand = Get-Command node.exe -ErrorAction Stop
$script:SafeOutput = $null

function New-Label([string]$text, [int]$x, [int]$y, [int]$width, [int]$height) {
    $label = [System.Windows.Forms.Label]::new()
    $label.Text = $text
    $label.Location = [System.Drawing.Point]::new($x, $y)
    $label.Size = [System.Drawing.Size]::new($width, $height)
    return $label
}

function Get-Value($object, [string]$name) {
    if ($null -eq $object) { return $null }
    return $object.$name
}

function Convert-ToSafeResult($parsed) {
    $post = $parsed.postcheck
    $workers = Get-Value $post 'worker_list'
    $subdomain = Get-Value $post 'subdomain'
    $version = Get-Value $post 'version_settings'
    $scriptSettings = Get-Value $post 'script_settings'
    $secrets = Get-Value $post 'secrets'
    $schedules = Get-Value $post 'schedules'
    return [ordered]@{
        schema_version = [int]$parsed.schema_version
        operation = [string]$parsed.operation
        preflight = [ordered]@{
            success = [bool]$parsed.preflight.success
            http_status = $parsed.preflight.http_status
            error_codes = @($parsed.preflight.error_codes | ForEach-Object { [int]$_ })
            worker_count = $parsed.preflight.worker_count
            target_present = [bool]$parsed.preflight.target_present
        }
        deploy = [ordered]@{
            attempted = [bool]$parsed.deploy.attempted
            outcome = [string]$parsed.deploy.outcome
            exit_code = $parsed.deploy.exit_code
        }
        postcheck = [ordered]@{
            all_safe = [bool](Get-Value $post 'all_safe')
            worker_count = Get-Value $workers 'worker_count'
            target_present = Get-Value $workers 'target_present'
            routes_count = Get-Value $workers 'target_routes_count'
            workers_dev_enabled = Get-Value $subdomain 'enabled'
            preview_urls_enabled = Get-Value $subdomain 'previews_enabled'
            bindings_count = Get-Value $version 'bindings_count'
            observability_enabled = Get-Value $version 'observability_enabled'
            logs_enabled = Get-Value $version 'logs_enabled'
            invocation_logs = Get-Value $version 'invocation_logs'
            traces_enabled = Get-Value $version 'traces_enabled'
            logpush = Get-Value $scriptSettings 'logpush'
            tail_consumers_count = Get-Value $scriptSettings 'tail_consumers_count'
            secrets_count = Get-Value $secrets 'count'
            schedules_count = Get-Value $schedules 'count'
        }
        deploy_attempts = [int]$parsed.deploy_attempts
        stopped_reason = [string]$parsed.stopped_reason
    }
}

$form = [System.Windows.Forms.Form]::new()
$form.Text = 'Cloudflare 隔離Worker 一回作成・非表示入力'
$form.StartPosition = 'CenterScreen'
$form.Size = [System.Drawing.Size]::new(650, 610)
$form.MinimumSize = $form.Size
$form.MaximumSize = $form.Size
$form.TopMost = $true
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$form.FormBorderStyle = 'FixedDialog'

$ready = New-Label 'INPUT_WAITING_READY' 28 18 580 34
$ready.Font = [System.Drawing.Font]::new('Segoe UI', 15, [System.Drawing.FontStyle]::Bold)
$ready.ForeColor = [System.Drawing.Color]::FromArgb(16, 92, 72)
$form.Controls.Add($ready)

$description = New-Label "フォームを確認してから短期Tokenを作成してください。`r`nWorker 0件を確認後、固定名Workerのdeployを最大1回だけ実行します。" 30 58 580 52
$form.Controls.Add($description)

$form.Controls.Add((New-Label 'Account ID（非表示）' 30 120 250 24))
$accountBox = [System.Windows.Forms.TextBox]::new()
$accountBox.Location = [System.Drawing.Point]::new(30, 145)
$accountBox.Size = [System.Drawing.Size]::new(580, 29)
$accountBox.UseSystemPasswordChar = $true
$form.Controls.Add($accountBox)

$form.Controls.Add((New-Label '短期Token（非表示）' 30 188 250 24))
$tokenBox = [System.Windows.Forms.TextBox]::new()
$tokenBox.Location = [System.Drawing.Point]::new(30, 213)
$tokenBox.Size = [System.Drawing.Size]::new(580, 29)
$tokenBox.UseSystemPasswordChar = $true
$form.Controls.Add($tokenBox)

$stateCheck = [System.Windows.Forms.CheckBox]::new()
$stateCheck.Text = 'Workers Paid active・Worker 0件・隔離D1 1件を画面で確認しました'
$stateCheck.Location = [System.Drawing.Point]::new(30, 258)
$stateCheck.Size = [System.Drawing.Size]::new(580, 34)
$form.Controls.Add($stateCheck)

$permissionCheck = [System.Windows.Forms.CheckBox]::new()
$permissionCheck.Text = '対象account限定・Workers Adminだけ・短期・追加権限0件を確認しました'
$permissionCheck.Location = [System.Drawing.Point]::new(30, 298)
$permissionCheck.Size = [System.Drawing.Size]::new(580, 34)
$form.Controls.Add($permissionCheck)

$notice = New-Label 'この操作はD1、secret、route、公開URLを作成しません。結果不明でも再deployしません。' 30 340 580 44
$notice.ForeColor = [System.Drawing.Color]::FromArgb(80, 80, 80)
$form.Controls.Add($notice)

$status = New-Label '入力待ちです。まだ外部通信もdeployも行っていません。' 30 390 580 65
$status.ForeColor = [System.Drawing.Color]::FromArgb(70, 70, 70)
$form.Controls.Add($status)

$runButton = [System.Windows.Forms.Button]::new()
$runButton.Text = '固定名Workerを一度だけ作成'
$runButton.Location = [System.Drawing.Point]::new(290, 500)
$runButton.Size = [System.Drawing.Size]::new(230, 42)
$form.Controls.Add($runButton)

$cancelButton = [System.Windows.Forms.Button]::new()
$cancelButton.Text = '中止'
$cancelButton.Location = [System.Drawing.Point]::new(535, 500)
$cancelButton.Size = [System.Drawing.Size]::new(75, 42)
$form.Controls.Add($cancelButton)
$form.CancelButton = $cancelButton

$cancelButton.Add_Click({
    $accountBox.Clear()
    $tokenBox.Clear()
    try { [System.Windows.Forms.Clipboard]::Clear() } catch {}
    $script:SafeOutput = '{"schema_version":1,"operation":"b2-2c1-worker-create-once","status":"cancelled"}'
    $form.Close()
})

$runButton.Add_Click({
    $accountId = $accountBox.Text
    $token = $tokenBox.Text
    if (-not $stateCheck.Checked -or -not $permissionCheck.Checked) {
        $status.Text = '現在状態とToken Summaryの両方を確認してチェックしてください。'
        $status.ForeColor = [System.Drawing.Color]::FromArgb(165, 72, 0)
        return
    }
    if ($accountId -notmatch '^[0-9a-fA-F]{32}$' -or $token -notmatch '^\S{20,512}$') {
        $status.Text = '入力形式を確認してください。値は送信されていません。'
        $status.ForeColor = [System.Drawing.Color]::FromArgb(165, 72, 0)
        return
    }

    $runButton.Enabled = $false
    $cancelButton.Enabled = $false
    $accountBox.Enabled = $false
    $tokenBox.Enabled = $false
    $stateCheck.Enabled = $false
    $permissionCheck.Enabled = $false
    $status.Text = 'Worker 0件の事前確認後、固定名Workerを最大1回だけ作成しています…'
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
        foreach ($name in @('CLOUDFLARE_API_TOKEN','CLOUDFLARE_ACCOUNT_ID','CLOUDFLARE_API_KEY','CF_API_TOKEN','CF_API_KEY')) {
            [void]$startInfo.Environment.Remove($name)
        }
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

        $parsed = $stdout | ConvertFrom-Json -ErrorAction Stop
        $safe = Convert-ToSafeResult $parsed
        $script:SafeOutput = $safe | ConvertTo-Json -Compress -Depth 8

        if ($safe.stopped_reason -eq 'none' -and $safe.deploy_attempts -eq 1 -and $safe.postcheck.all_safe) {
            $status.Text = '隔離Worker 1件と安全設定を確認しました。今すぐTokenを失効してください。'
            $status.ForeColor = [System.Drawing.Color]::FromArgb(16, 92, 72)
        } elseif ($safe.deploy_attempts -eq 0) {
            $status.Text = '作成前に安全停止しました。Workerは作成していません。Tokenを失効してください。'
            $status.ForeColor = [System.Drawing.Color]::FromArgb(165, 72, 0)
        } else {
            $status.Text = '作成結果または設定確認が不明です。再実行せずTokenを失効してください。'
            $status.ForeColor = [System.Drawing.Color]::FromArgb(165, 32, 32)
        }
    } catch {
        $script:SafeOutput = '{"schema_version":1,"operation":"b2-2c1-worker-create-once","status":"safe_stop"}'
        $status.Text = '安全停止しました。再実行せずTokenを失効し、Worker件数を確認してください。'
        $status.ForeColor = [System.Drawing.Color]::FromArgb(165, 32, 32)
    } finally {
        $accountId = $null
        $token = $null
        $stdout = $null
        $stderr = $null
        try { [System.Windows.Forms.Clipboard]::Clear() } catch {}
        $closeButton = [System.Windows.Forms.Button]::new()
        $closeButton.Text = '閉じる'
        $closeButton.Location = [System.Drawing.Point]::new(505, 500)
        $closeButton.Size = [System.Drawing.Size]::new(105, 42)
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
