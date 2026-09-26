/**
 * ดึงข้อมูลจาก Supabase กลับไปเขียน data/courses.js
 *
 * ทำไมต้องมี: เวอร์ชัน HTML (index.html + app.js) เปิดด้วย server.js ที่ไม่มี backend
 * จึงยังอ่านไฟล์นี้อยู่ ไฟล์นี้คือ "snapshot" ของฐานข้อมูล ไม่ใช่แหล่งข้อมูลหลัก
 * ถ้าแก้ในแอดมิน เวอร์ชัน HTML จะไม่เปลี่ยนจนกว่าจะรันสคริปต์นี้
 *
 * วิธีใช้:  node scripts/export-snapshot.mjs
 * ต้องการ:  NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ใน .env.local
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnvFile() {
  const p = join(ROOT, '.env.local')
  if (!existsSync(p)) return
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (!m) continue
    const key = m[1]
    let value = m[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('ยังไม่ได้ตั้งค่า — ต้องมี NEXT_PUBLIC_SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY ใน .env.local')
  process.exit(1)
}

const coversSrc = readFileSync(join(ROOT, 'app', 'lib', 'covers.ts'), 'utf8')

function classFromToken(token) {
  const body = coversSrc.slice(coversSrc.indexOf('{'), coversSrc.indexOf('} as const'))
  for (const m of body.matchAll(/(\w+):\s*'([^']+)'/g)) {
    if (m[1] === token) return m[2]
  }
  for (const m of body.matchAll(/(\w+):\s*'([^']+)'/g)) {
    if (m[1] === 'emerald') return m[2]
  }
  return 'from-emerald-100 to-green-100'
}

const esc = s => String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")

const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function main() {
  console.log('กำลังดึงข้อมูลจาก Supabase...')

  const [{ data: cats }, { data: ins }, { data: plans }, { data: courses }] = await Promise.all([
    supabase.from('categories').select('id, name').order('sort_order'),
    supabase.from('instructors').select('id, key, name, title, experience, students, avatar').order('sort_order'),
    supabase.from('plans').select('code, name, price, quota, max_tier, feats, sort_order').order('sort_order'),
    supabase
      .from('courses')
      .select(
        `id, legacy_id, slug, title, desc, level, tier, credits, price, icon, cover, rating,
         students, lessons, hours, certificate, lifetime, published, sort_order,
         category_id, instructor_id,
         course_topics(topic, sort_order),
         course_syllabus(n, title, duration, sort_order),
         course_files(name, size, type, sort_order)`
      )
      .order('sort_order'),
  ])

  if (!courses?.length) {
    console.error('ไม่พบคอร์สในฐานข้อมูล — ไม่เขียนทับไฟล์เดิม')
    process.exit(1)
  }

  const catName = new Map((cats ?? []).map(c => [c.id, c.name]))
  const insKey = new Map((ins ?? []).map(i => [i.id, i.key]))

  const lines = []
  lines.push("const CATEGORIES = ['ทั้งหมด', " + (cats ?? []).map(c => `'${esc(c.name)}'`).join(', ') + '];')
  lines.push('')
  lines.push('const INSTRUCTORS = {')
  for (const i of ins ?? []) {
    lines.push(
      `  ${i.key}: { name: '${esc(i.name)}', title: '${esc(i.title)}', experience: '${esc(i.experience)}', students: ${Number(i.students) || 0}, avatar: '${esc(i.avatar)}' },`
    )
  }
  lines.push('};')
  lines.push('')
  lines.push('const PLANS = [')
  for (const p of plans ?? []) {
    const feats = Array.isArray(p.feats) ? p.feats : []
    lines.push(
      `  { code: '${esc(p.code)}', name: '${esc(p.name)}', price: ${Number(p.price) || 0}, quota: ${Number(p.quota)}, maxTier: ${Number(p.max_tier)}, feats: [${feats.map(f => `'${esc(f)}'`).join(', ')}] },`
    )
  }
  lines.push('];')
  lines.push('')
  lines.push('const BANK = {')
  lines.push("  name: 'ชื่อบริษัท จำกัด',")
  lines.push("  account: '123-4-56789-012',")
  lines.push("  promptpay: '0123456789',")
  lines.push('};')
  lines.push('')
  lines.push('const COURSES = [')
  for (const c of courses) {
    const topics = [...(c.course_topics ?? [])].sort((a, b) => a.sort_order - b.sort_order)
    const syl = [...(c.course_syllabus ?? [])].sort((a, b) => a.sort_order - b.sort_order)
    const files = [...(c.course_files ?? [])].sort((a, b) => a.sort_order - b.sort_order)
    const insRef = insKey.get(c.instructor_id)

    lines.push('  {')
    lines.push(`    id: '${esc(c.legacy_id ?? c.slug)}',`)
    lines.push(`    slug: '${esc(c.slug)}',`)
    lines.push(`    title: '${esc(c.title)}',`)
    lines.push(`    desc: '${esc(c.desc)}',`)
    lines.push(`    category: '${esc(catName.get(c.category_id) ?? 'ทั้งหมด')}',`)
    lines.push(`    level: '${esc(c.level)}', tier: ${Number(c.tier)}, credits: ${Number(c.credits)}, price: ${Number(c.price)},`)
    lines.push(
      `    icon: '${esc(c.icon)}', cover: '${esc(classFromToken(c.cover))}', rating: ${Number(c.rating) || 0}, students: ${Number(c.students) || 0},`
    )
    lines.push(
      `    lessons: ${Number(c.lessons) || 0}, hours: ${Number(c.hours) || 0}, certificate: ${!!c.certificate}, lifetime: ${!!c.lifetime},`
    )
    lines.push(`    instructor: ${insRef ? `INSTRUCTORS.${insRef}` : 'undefined'},`)
    lines.push(`    topics: [${topics.map(t => `'${esc(t.topic)}'`).join(', ')}],`)
    lines.push('    syllabus: [')
    for (const s of syl) {
      lines.push(`      { n: ${Number(s.n)}, title: '${esc(s.title)}', duration: '${esc(s.duration)}' },`)
    }
    lines.push('    ],')
    lines.push('    files: [')
    for (const f of files) {
      lines.push(`      { name: '${esc(f.name)}', size: '${esc(f.size)}', type: '${esc(f.type)}' },`)
    }
    lines.push('    ],')
    lines.push('  },')
  }
  lines.push('];')
  lines.push('')
  lines.push('const DATA = { CATEGORIES, INSTRUCTORS, PLANS, BANK, COURSES };')
  lines.push('if (typeof module !== "undefined" && module.exports) { module.exports = DATA; }')
  lines.push('if (typeof window !== "undefined") {')
  lines.push('  window.CATEGORIES = CATEGORIES; window.INSTRUCTORS = INSTRUCTORS;')
  lines.push('  window.PLANS = PLANS; window.BANK = BANK; window.COURSES = COURSES;')
  lines.push('}')

  const header = `/* eslint-disable */
/**
 * data/courses.js — SNAPSHOT จากฐานข้อมูล Supabase
 *
 * สร้างโดย scripts/export-snapshot.mjs — ห้ามแก้ด้วยมือ
 * แหล่งข้อมูลจริงอยู่ที่ฐานข้อมูล ให้แก้ผ่านหน้า /admin
 * รันคำสั่งนี้เพื่อดึงข้อมูลล่าสุด: node scripts/export-snapshot.mjs
 */
`

  const target = join(ROOT, 'data', 'courses.js')
  const backup = join(ROOT, 'data', 'courses.js.bak')
  if (existsSync(target)) writeFileSync(backup, readFileSync(target, 'utf8'))

  writeFileSync(target, header + lines.join('\n') + '\n', 'utf8')

  const published = courses.filter(c => c.published).length
  console.log('')
  console.log(`เขียน data/courses.js แล้ว`)
  console.log(`  คอร์ส ${courses.length} (เผยแพร่ ${published}) · ผู้สอน ${(ins ?? []).length} · แพ็กเกจ ${(plans ?? []).length} · หมวดหมู่ ${(cats ?? []).length}`)
  console.log('  ไฟล์เดิมถูกสำรองไว้ที่ data/courses.js.bak')
  console.log('  อย่าลืมรัน: node test.js เพื่อยืนยันว่าเวอร์ชัน HTML ยังใช้ได้')
}

main().catch(e => {
  console.error('ส่งออกข้อมูลผิดพลาด:', e)
  process.exit(1)
})
