# Stage 1: Local Model Preparation
# เตรียมข้อมูลสำหรับให้ Kilo วิเคราะห์
# รัน:  powershell.exe -ExecutionPolicy Bypass -File .kilo-workflow\05-scripts\01-stage1-prepare.ps1

$ErrorActionPreference = 'Continue'
$Workspace = 'C:\LocalAI\courseweb'
$LogDir = Join-Path $Workspace '.kilo-workflow\04-logs'

if (-not (Test-Path -LiteralPath $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

Write-Host '=== Stage 1: Local Model Preparation ==='
Write-Host "Timestamp: $(Get-Date)"
Write-Host "Workspace: $Workspace"
Write-Host ''

# Step 1: system info
Write-Host 'Gathering system information...'
Get-CimInstance Win32_OperatingSystem |
    Select-Object Caption, Version, BuildNumber, OSArchitecture, LastBootUpTime, TotalVisibleMemorySize |
    Format-List |
    Out-File -FilePath (Join-Path $LogDir '01-system-info.txt') -Encoding UTF8

# Step 2: tool availability (SilentContinue เพราะบางตัวอาจไม่มี)
Write-Host 'Checking available tools...'
$toolRows = foreach ($t in 'docker', 'node', 'npm', 'npm.cmd', 'git', 'python', 'pnpm') {
    $cmd = Get-Command $t -ErrorAction SilentlyContinue
    if ($cmd) { "$t : AVAILABLE" } else { "$t : NOT FOUND" }
}
$toolRows | Out-File -FilePath (Join-Path $LogDir '02-tools-check.txt') -Encoding UTF8
$toolRows | ForEach-Object { Write-Host "  $_" }

# Step 3: file list (ไม่รวม node_modules / .next เพื่อไม่ให้บันทึกบวม)
Write-Host 'Analyzing existing files...'
$files = Get-ChildItem -Path $Workspace -Recurse -File -Force |
    Where-Object { $_.FullName -notmatch '\\(node_modules|\.next|\.git)\\' }
$files | ForEach-Object { $_.FullName.Substring($Workspace.Length + 1) } |
    Out-File -FilePath (Join-Path $LogDir '03-file-list.txt') -Encoding UTF8

# Step 4: analysis summary
Write-Host 'Generating analysis summary...'
$fileCount = $files.Count
$dirCount = (Get-ChildItem -Path $Workspace -Recurse -Directory -Force |
    Where-Object { $_.FullName -notmatch '\\(node_modules|\.next|\.git)\\' }).Count

$analysis = @"
Analysis Complete
==================
Timestamp   : $(Get-Date)
Workspace   : $Workspace
Files       : $fileCount
Directories : $dirCount
Excluded    : node_modules, .next, .git
"@
$analysis | Out-File -FilePath (Join-Path $LogDir '04-analysis-summary.txt') -Encoding UTF8

Write-Host ''
Write-Host "Stage 1 Complete. $fileCount files, $dirCount directories."
Write-Host "Logs written to $LogDir"
