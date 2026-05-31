$ErrorActionPreference = "Stop"

$backendDir = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..\backend")
Push-Location $backendDir

try {
  if (-not (Test-Path -LiteralPath "node_modules")) {
    npm install
  }

  npm run dev
}
finally {
  Pop-Location
}
