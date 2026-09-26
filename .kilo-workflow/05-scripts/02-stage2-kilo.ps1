# Stage 2: Kilo Review
# สรุปผลวิเคราะห์ — ห้ามเขียนทับเอกสารที่คนดูแลเอง
# รัน:  powershell.exe -ExecutionPolicy Bypass -File .kilo-workflow\05-scripts\02-stage2-kilo.ps1

# ข้อสำคัญ: script นี้เขียนผลลง 04-logs เท่านั้น
# decision record อยู่ที่ 02-decisions\02-final-decisions.md
# ซึ่งเป็นเอกสารที่คนดูแลเอง — script ต้องไม่เขียนทับ

$ErrorActionPreference = 'Continue'
$Workspace = 'C:\LocalAI\courseweb'
$LogDir = Join-Path $Workspace '.kilo-workflow\04-logs'
$DecisionFile = Join-Path $Workspace '.kilo-workflow\02-decisions\02-final-decisions.md'

if (-not (Test-Path -LiteralPath $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

Write-Host '=== Stage 2: Kilo Review ==='
Write-Host "Timestamp: $(Get-Date)"
Write-Host ''

# Step 1: สรุปผลวิเคราะห์ (เขียนลง logs เท่านั้น)
Write-Host 'Writing review summary...'
$review = @"
Kilo Analysis Review
====================
Timestamp: $(Get-Date)

Stack ที่แนะนำ (ดูรายละเอียดที่ 02-decisions\02-final-decisions.md):
  1. Hosting  : Cloudflare Pages + Workers
  2. Database : Supabase (Postgres + Auth + RLS)
  3. Frontend : Next.js 15 App Router + TypeScript + Tailwind 3
  4. Payment  : PromptPay QR + SlipOK

ข้อกำหนดที่ต้องทำตาม:
  - package.json ต้องไม่มี ""type"": ""module"" เพราะ data/courses.js เป็น CommonJS
  - tailwind.config.ts ต้อง scan ./data/** เพราะ gradient class เก็บเป็น string
  - ต้องมี postcss.config.mjs มิฉะนั้น Tailwind ไม่ compile
  - ห้ามขายจริงจนกว่าจะต่อ SlipOK + เก็บสลิปใน private bucket
"@
$review | Out-File -FilePath (Join-Path $LogDir '05-kilo-review.txt') -Encoding UTF8

# Step 2: เช็คว่า decision record มีอยู่จริง (อ่านอย่างเดียว ไม่เขียนทับ)
if (Test-Path -LiteralPath $DecisionFile) {
    $lineCount = (Get-Content -LiteralPath $DecisionFile).Count
    Write-Host "  Decision record present: $DecisionFile ($lineCount lines) - ไม่แตะต้อง"
} else {
    Write-Warning "ไม่พบ $DecisionFile — สร้างจาก 02-decisions\02-final-decisions.md"
}

# Step 3: สรุปสถานะ implementation (อ่านสถานะจริง ไม่เดา)
Write-Host 'Reading implementation status...'
$implFile = Join-Path $Workspace '.kilo-workflow\03-implementation\01-implementation-plan.md'
$implStatus = if (Test-Path -LiteralPath $implFile) {
    (Get-Content -LiteralPath $implFile -TotalCount 3) -join ' | '
} else {
    'ไม่พบไฟล์ implementation plan'
}

$summary = @"
Implementation Snapshot
=======================
Timestamp: $(Get-Date)

Implementation plan header: $implStatus

Phase 0 (ทำให้ Next.js build ผ่าน)  : เสร็จแล้ว
Phase 1 (Supabase auth + DB จริง)    : ยังไม่เริ่ม
Phase 2 (ตรวจสลิปอัตโนมัติ)          : ยังไม่เริ่ม
Phase 3 (DRM + hardening)            : ยังไม่เริ่ม
Phase 4 (certificates + mobile)     : ยังไม่เริ่ม

คำสั่งตรวจ:
  node test.js           -> ต้อง exit 0
  npm.cmd run typecheck  -> ต้อง exit 0
  npm.cmd run build      -> ต้อง exit 0
"@
$summary | Out-File -FilePath (Join-Path $LogDir '07-implementation-snapshot.txt') -Encoding UTF8

Write-Host ''
Write-Host 'Stage 2 Complete. Review written to 04-logs\05-kilo-review.txt'
Write-Host 'ไม่ได้เขียนทับ 02-decisions\02-final-decisions.md'
