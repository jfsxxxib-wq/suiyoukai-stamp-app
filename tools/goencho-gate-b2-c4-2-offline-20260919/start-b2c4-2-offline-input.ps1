param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$validator = Join-Path $PSScriptRoot 'validate-secret-input.mjs'
$nodeCommand = Get-Command node.exe -ErrorAction Stop
$fieldNames = @(
    'account_id',
    'api_token',
    'GOENCHO_OWNER_PIN_PEPPER_V1',
    'GOENCHO_TEACHER_PIN_PEPPER_V1',
    'GOENCHO_DEVICE_TOKEN_HMAC_KEY_V1',
    'GOENCHO_SESSION_HMAC_KEY_V1',
    'GOENCHO_RECOVERY_CODE_PEPPER_V1'
)

function Convert-SecureStringToUtf8Bytes([Security.SecureString]$value) {
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($value)
    $characters = $null
    try {
        $length = [Runtime.InteropServices.Marshal]::ReadInt32($pointer, -4) / 2
        $characters = [char[]]::new($length)
        for ($index = 0; $index -lt $length; $index += 1) {
            $characters[$index] = [char][Runtime.InteropServices.Marshal]::ReadInt16($pointer, $index * 2)
        }
        return [Text.Encoding]::UTF8.GetBytes($characters)
    } finally {
        if ($null -ne $characters) { [Array]::Clear($characters, 0, $characters.Length) }
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
}

function Add-UInt32([IO.MemoryStream]$stream, [uint32]$value) {
    $bytes = [BitConverter]::GetBytes($value)
    try { $stream.Write($bytes, 0, $bytes.Length) } finally { [Array]::Clear($bytes, 0, $bytes.Length) }
}

$accountBytes = $null
$secureInputs = [Collections.Generic.List[Security.SecureString]]::new()
$valueBytes = [Collections.Generic.List[byte[]]]::new()
$packet = $null
$stdout = $null
$stderr = $null

try {
    $account = Read-Host '対象account ID（32桁。値は保存しません）'
    $accountBytes = [Text.Encoding]::UTF8.GetBytes($account)
    $account = $null
    $prompts = @(
        '短期API Token',
        'Owner PIN pepper',
        'Teacher PIN pepper',
        'Device token HMAC key',
        'Session HMAC key',
        'Recovery code pepper'
    )
    foreach ($prompt in $prompts) {
        $secure = Read-Host $prompt -AsSecureString
        $secureInputs.Add($secure)
        $valueBytes.Add((Convert-SecureStringToUtf8Bytes $secure))
    }

    $stream = [IO.MemoryStream]::new()
    try {
        $magic = [Text.Encoding]::ASCII.GetBytes('GC42')
        $stream.Write($magic, 0, $magic.Length)
        [Array]::Clear($magic, 0, $magic.Length)
        Add-UInt32 $stream ([uint32]$fieldNames.Count)
        Add-UInt32 $stream ([uint32]$accountBytes.Length)
        $stream.Write($accountBytes, 0, $accountBytes.Length)
        foreach ($bytes in $valueBytes) {
            Add-UInt32 $stream ([uint32]$bytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
        }
        $packet = $stream.ToArray()
    } finally {
        $stream.Dispose()
    }

    $start = [Diagnostics.ProcessStartInfo]::new()
    $start.FileName = $nodeCommand.Source
    $start.ArgumentList.Add($validator)
    $start.UseShellExecute = $false
    $start.CreateNoWindow = $true
    $start.RedirectStandardInput = $true
    $start.RedirectStandardOutput = $true
    $start.RedirectStandardError = $true
    foreach ($name in @('CLOUDFLARE_API_TOKEN','CLOUDFLARE_API_KEY','CLOUDFLARE_ACCOUNT_ID','CF_API_TOKEN','CF_API_KEY')) {
        [void]$start.Environment.Remove($name)
    }
    foreach ($name in $fieldNames | Where-Object { $_ -like 'GOENCHO_*' }) { [void]$start.Environment.Remove($name) }

    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $start
    [void]$process.Start()
    $process.StandardInput.BaseStream.Write($packet, 0, $packet.Length)
    $process.StandardInput.Close()
    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()
    if ($process.ExitCode -ne 0) { throw [InvalidOperationException]::new('Offline input validation stopped safely') }
    [Console]::Out.WriteLine($stdout.Trim())
} finally {
    if ($null -ne $accountBytes) { [Array]::Clear($accountBytes, 0, $accountBytes.Length) }
    foreach ($bytes in $valueBytes) { [Array]::Clear($bytes, 0, $bytes.Length) }
    foreach ($secure in $secureInputs) { $secure.Dispose() }
    if ($null -ne $packet) { [Array]::Clear($packet, 0, $packet.Length) }
    $stdout = $null
    $stderr = $null
}
