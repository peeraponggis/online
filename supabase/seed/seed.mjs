/**
 * ย้ายข้อมูลจาก data/courses.js เข้า Supabase
 * รันซ้ำได้โดยไม่สร้างข้อมูลซ้ำ (ใช้ upsert บน legacy_id / slug / key / code)
 *
 * วิธีใช้:
 *   1. คัดลอก .env.example เป็น .env.local แล้วใส่ค่าให้ครบ
 *   2. node supabase/seed/seed.mjs
 *
 * ต้องการ SUPABASE_SERVICE_ROLE_KEY (ฝั่ง server เท่านั้น)
 * รหัสผ่านไม่เกี่ยวข้องกับสคริปต์นี้
 */

import { readFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

// อ่าน .env.local แบบง่าย ๆ เพื่อไม่ต้องพึ่ง dotenv
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

const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const COVERS_PATH = join(ROOT, 'app', 'lib', 'covers.ts')
const coversSrc = readFileSync(COVERS_PATH, 'utf8')

/** แปลง 'from-emerald-100 to-green-100' -> 'emerald' โดยไม่ต้อง import ไฟล์ TS */
function tokenFromClass(value) {
  const direct = new Map()
  const body = coversSrc.slice(coversSrc.indexOf('{'), coversSrc.indexOf('} as const'))
  for (const m of body.matchAll(/(\w+):\s*'([^']+)'/g)) direct.set(m[2], m[1])
  const v = String(value).trim()
  if (direct.has(v)) return direct.get(v)
  const first = v.split(/\s+/)[0] ?? ''
  const m = /^from-([a-z]+)-\d+$/.exec(first)
  if (m) {
    const name = m[1]
    for (const key of direct.keys()) {
      const tok = direct.get(key)
      if (tok === name || tok.startsWith(name)) return tok
    }
  }
  return 'emerald'
}

const fileData = require(join(ROOT, 'data', 'courses.js'))

const ok = []
const bad = []

function report(okCount, badCount, label) {
  console.log(`  ${label}: ${okCount} สำเร็จ${badCount ? ` · ${badCount} ผิดพลาด` : ''}`)
}

async function main() {
  console.log('กำลังย้ายข้อมูลเข้า Supabase...')
  console.log(`  ปลายทาง: ${url}`)
  console.log('')

  // ---- categories ----
  const categories = fileData.CATEGORIES.filter(c => c !== 'ทั้งหมด')
  const catIdByName = new Map()
  for (let i = 0; i < categories.length; i++) {
    const name = categories[i]
    const { data, error } = await supabase
      .from('categories')
      .upsert(
        {
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          sort_order: i,
        },
        { onConflict: 'name' }
      )
      .select('id')
      .single()
    if (error || !data) bad.push(`category ${name}: ${error?.message}`)
    else {
      catIdByName.set(name, data.id)
      ok.push(name)
    }
  }
  report(ok.length, bad.length, 'หมวดหมู่')

  // ---- instructors ----
  let insOk = 0
  let insBad = 0
  const insIdByKey = new Map()
  let insOrder = 0
  for (const [key, v] of Object.entries(fileData.INSTRUCTORS)) {
    const { data, error } = await supabase
      .from('instructors')
      .upsert(
        {
          key,
          name: v.name,
          title: v.title,
          experience: v.experience,
          students: v.students,
          avatar: v.avatar,
          sort_order: insOrder++,
        },
        { onConflict: 'key' }
      )
      .select('id')
      .single()
    if (error || !data) {
      insBad++
      bad.push(`instructor ${key}: ${error?.message}`)
    } else {
      insOk++
      insIdByKey.set(key, data.id)
    }
  }
  report(insOk, insBad, 'ผู้สอน')

  // ---- plans ----
  let planOk = 0
  let planBad = 0
  for (let i = 0; i < fileData.PLANS.length; i++) {
    const p = fileData.PLANS[i]
    const { error } = await supabase.from('plans').upsert(
      {
        code: p.code,
        name: p.name,
        price: p.price,
        quota: p.quota,
        max_tier: p.maxTier,
        feats: p.feats,
        sort_order: i,
      },
      { onConflict: 'code' }
    )
    if (error) {
      planBad++
      bad.push(`plan ${p.code}: ${error.message}`)
    } else planOk++
  }
  report(planOk, planBad, 'แพ็กเกจ')

  // ---- courses ----
  let cOk = 0
  let cBad = 0
  for (let i = 0; i < fileData.COURSES.length; i++) {
    const c = fileData.COURSES[i]
    const catId = catIdByName.get(c.category)
    const insId = insIdByKey.get(c.instructor?.key ?? findInstructorKey(c.instructor?.name))
    if (!catId) {
      cBad++
      bad.push(`course ${c.id}: ไม่พบหมวด "${c.category}"`)
      continue
    }
    if (!insId) {
      cBad++
      bad.push(`course ${c.id}: ไม่พบผู้สอน "${c.instructor?.name}"`)
      continue
    }

    const { data: courseRow, error: courseErr } = await supabase
      .from('courses')
      .upsert(
        {
          legacy_id: c.id,
          slug: c.slug,
          title: c.title,
          desc: c.desc,
          category_id: catId,
          level: c.level,
          tier: c.tier,
          credits: c.credits,
          price: c.price,
          icon: c.icon,
          cover: tokenFromClass(c.cover),
          rating: c.rating,
          students: c.students,
          lessons: c.lessons,
          hours: c.hours,
          certificate: c.certificate,
          lifetime: c.lifetime,
          instructor_id: insId,
          published: true,
          sort_order: i,
        },
        { onConflict: 'legacy_id' }
      )
      .select('id')
      .single()

    if (courseErr || !courseRow) {
      cBad++
      bad.push(`course ${c.id}: ${courseErr?.message}`)
      continue
    }

    await supabase.from('course_topics').delete().eq('course_id', courseRow.id)
    await supabase.from('course_syllabus').delete().eq('course_id', courseRow.id)
    await supabase.from('course_files').delete().eq('course_id', courseRow.id)

    if (c.topics?.length) {
      await supabase.from('course_topics').insert(
        c.topics.map((t, k) => ({ course_id: courseRow.id, topic: t, sort_order: k }))
      )
    }
    if (c.syllabus?.length) {
      await supabase.from('course_syllabus').insert(
        c.syllabus.map((s, k) => ({
          course_id: courseRow.id,
          n: s.n,
          title: s.title,
          duration: s.duration,
          sort_order: k,
        }))
      )
    }
    if (c.files?.length) {
      await supabase.from('course_files').insert(
        c.files.map((f, k) => ({
          course_id: courseRow.id,
          name: f.name,
          size: f.size,
          type: f.type,
          sort_order: k,
        }))
      )
    }

    cOk++
  }
  report(cOk, cBad, 'คอร์ส')

  // ---- settings ----
  const { error: bankErr } = await supabase
    .from('settings')
    .upsert({ key: 'bank', value: fileData.BANK }, { onConflict: 'key' })
  if (bankErr) bad.push(`settings bank: ${bankErr.message}`)

  console.log('')
  console.log('='.repeat(46))
  console.log(
    `  สำเร็จ ${ok.length + insOk + planOk + cOk}  |  ผิดพลาด ${bad.length}${bankErr ? 1 : 0}`
  )
  if (bad.length) {
    console.log('\n  รายการที่ผิดพลาด:')
    for (const b of bad) console.log('   - ' + b)
  }
  console.log('='.repeat(46))
  process.exit(bad.length ? 1 : 0)
}

function findInstructorKey(name) {
  if (!name) return ''
  for (const [key, v] of Object.entries(fileData.INSTRUCTORS)) {
    if (v.name === name) return key
  }
  return ''
}

main().catch(e => {
  console.error('นำเข้าผิดพลาด:', e)
  process.exit(1)
})
