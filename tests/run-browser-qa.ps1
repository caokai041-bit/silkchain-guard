$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $workspace 'tmp'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$stdout = Join-Path $logDir 'site-qa-server.out.log'
$stderr = Join-Path $logDir 'site-qa-server.err.log'
$env:PORT = '8792'
$env:QA_URL = 'http://127.0.0.1:8792'
$server = Start-Process -FilePath 'C:\Program Files\nodejs\node.exe' -ArgumentList 'dist/local-server/server.mjs' -WorkingDirectory $workspace -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru -WindowStyle Hidden
try {
  Start-Sleep -Milliseconds 1200
  if ($server.HasExited) {
    $details = if (Test-Path $stderr) { Get-Content $stderr -Raw } else { 'no error log' }
    throw "Local preview server exited early: $details"
  }
  $env:NODE_PATH = 'C:\Users\ASUS\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
  & node (Join-Path $PSScriptRoot 'load-qa.cjs')
  if ($LASTEXITCODE -ne 0) { throw "Load QA failed with exit code $LASTEXITCODE" }
  & node (Join-Path $PSScriptRoot 'browser-qa.cjs')
  if ($LASTEXITCODE -ne 0) { throw "Browser QA failed with exit code $LASTEXITCODE" }
} finally {
  if ($server -and -not $server.HasExited) { Stop-Process -Id $server.Id }
}
