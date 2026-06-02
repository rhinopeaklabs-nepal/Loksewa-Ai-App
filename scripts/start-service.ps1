# Starts a single backend service with env loaded
param(
    [Parameter(Mandatory)][string]$ServiceDir,
    [Parameter(Mandatory)][string]$ServiceName,
    [Parameter(Mandatory)][int]$Port,
    [Parameter(Mandatory)][string]$Database
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], "Process")
        }
    }
}

$env:SERVICE_NAME = $ServiceName
$env:SERVICE_PORT = $Port.ToString()
$env:POSTGRES_DB = $Database
$env:LOG_LEVEL = "info"

Set-Location $ServiceDir
Write-Host "[$ServiceName] starting on port $Port (db=$Database)..."
& npx tsx src/server.ts
