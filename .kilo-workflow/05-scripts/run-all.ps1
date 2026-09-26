# Master Automation Script
# รันทั้ง 2 stage ตามลำดับ + ตรวจสอบผลจริง
# รัน:  powershell.exe -ExecutionPolicy Bypass -File .kilo-workflow\05-scripts\run-all.ps1

$ErrorActionPreference = 'Continue'
$Workspace = 'C:\LocalAI\courseweb'
$LogDir = Join-Path $Workspace '.kilo-workflow\04-logs'
$ScriptDir = Join-Path $Workspace '.kilo-workflow\05-scripts'

Write-Host '=========================================='
Write-Host '  Kilo Pipeline'
Write-Host "  Started:  $(Get-Date)"
Write-Host '=========================================='

# Stage 1
Write-Host ''
Write-Host '>>> Stage 1: Preparation'
& powershell.exe -ExecutionPolicy Bypass -File (Join-Path $ScriptDir '01-stage1-prepare.ps1')

# Stage 2
Write-Host ''
Write-Host '>>> Stage 2: Review'
& powershell.exe -ExecutionPolicy Bypass -File (Join-Path $ScriptDir '02-stage2-kilo.ps1')

# Verification — รันจริง ไม่เดา
Write-Host ''
Write-Host '>>> Verification'
$results = @()
Push-Location $Workspace
try {
    $nodeExe = (Get-Command node -ErrorAction SilentlyContinue).Source
    if (-not $nodeExe) {
        $results += 'node : NOT FOUND - ข้ามการตรวจ'
    } else {
        & $nodeExe 'test.js' *> $null
        $results += "node test.js          : exit $LASTEXITCODE"

        & $nodeExe --check 'server.js' *> $null
        $results += "node --check server.js: exit $LASTEXITCODE"
    }

    $npmCmd = (Get-Command npm.cmd -ErrorAction SilentlyContinue).Source
    if (-not $npmCmd) {
        $results += 'npm.cmd : NOT FOUND - ข้ามการตรวจ (อย่าใช้ npm เพราะถูก block)'
    } else {
        & $npmCmd run typecheck *> $null
        $results += "npm run typecheck     : exit $LASTEXITCODE"
    }
} finally {
    Pop-Location
}

# Final report
Write-Host ''
Write-Host '>>> Final Report'
$report = @"
==========================================
  FINAL REPORT
  Completed: $(Get-Date)
==========================================

Verification (exit codes):
$($results -join "`n")

เอกสาร:
  01-analysis/       - requirements, architecture, cost
  02-decisions/      - 01-tech-stack.md, 02-final-decisions.md (ดูแลเอง)
  03-implementation/ - 01-implementation-plan.md
  04-logs/           - ผลรันของ script แต่ละ stage
  05-scripts/        - PowerShell scripts

คำสั่งตรวจด้วยตนเอง:
  node test.js
  npm.cmd run typecheck
  npm.cmd run build
"@
$report | Out-File -FilePath (Join-Path $LogDir '06-final-report.txt') -Encoding UTF8
$results | ForEach-Object { Write-Host "  $_" }

Write-Host ''
Write-Host '=========================================='
Write-Host "  Pipeline Complete - $(Get-Date)"
Write-Host '=========================================='
