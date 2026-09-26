/**
 * สร้างผู้ดูแลระบบบน Supabase โดยถามรหัสผ่านแบบซ่อนตัวอักษร
 *
 * ข้อสำคัญ: รหัสผ่านถูกอ่านจาก stdin เท่านั้น
 * ไม่ผ่าน argument ไม่เข้า shell history ไม่ถูกเขียนลงไฟล์ใด ๆ
 *
 * วิธีใช้:
 *   1. คัดลอก .env.example เป็น .env.local แล้วใส่ค่าให้ครบ
 *   2. node scripts/admin-create.mjs
 *   3. พิมพ์อีเมล กด Enter แล้วพิมพ์รหัสผ่าน (ตัวอักษรจะไม่แสดง)
 *
 * ทางเลือกที่ปลอดภัยกว่า: สร้าง user เองที่
 *   Supabase Dashboard -> Authentication -> Users -> Add user
 */

import { readFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

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

const rl = createInterface({ input: stdin, output: stdout })

async function ask(question, { hidden = false } = {}) {
  if (!hidden) {
    const a = await rl.question(question)
    return a.trim()
  }

  stdout.write(question)
  stdin.setRawMode(true)
  stdin.resume()
  stdin.setEncoding('utf8')

  let value = ''
  const onKey = ch => {
    if (ch === '\r' || ch === '\n' || ch === '') {
      stdin.off('data', onKey)
      stdin.setRawMode(false)
      stdin.pause()
      stdout.write('\n')
      process.stdout.write('')
      resolveDone()
      return
    }
    if (ch === '') {
      process.exit(1)
    }
    if (ch === '' || ch === '\b') {
      value = value.slice(0, -1)
      return
    }
    value += ch
  }

  let resolveDone
  const finished = new Promise(r => {
    resolveDone = r
  })

  stdin.on('data', onKey)
  await finished
  return value
}

async function main() {
  console.log('สร้างผู้ดูแลระบบบน Supabase')
  console.log('รหัสผ่านจะถูกอ่านแบบซ่อนตัวอักษร และไม่ถูกบันทึกลงไฟล์ใด ๆ')
  console.log('')

  const email = await ask('อีเมลผู้ดูแล: ')
  if (!email || !email.includes('@')) {
    console.error('อีเมลไม่ถูกต้อง')
    process.exit(1)
  }

  const password = await ask('รหัสผ่าน: ', { hidden: true })
  if (!password || password.length < 8) {
    console.error('รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร')
    process.exit(1)
  }

  const confirm = await ask('ยืนยันรหัสผ่านอีกครั้ง: ', { hidden: true })
  if (confirm !== password) {
    console.error('รหัสผ่านสองครั้งไม่ตรงกัน')
    process.exit(1)
  }

  rl.close()

  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    console.error('สร้าง user ไม่สำเร็จ:', error.message)
    process.exit(1)
  }

  const { error: adminErr } = await supabase
    .from('admins')
    .upsert({ user_id: data.user.id, email }, { onConflict: 'user_id' })

  if (adminErr) {
    console.error('ใส่ข้อมูลลงตาราง admins ไม่สำเร็จ:', adminErr.message)
    console.error(`user_id = ${data.user.id}`)
    process.exit(1)
  }

  console.log('')
  console.log('สร้างผู้ดูแลเรียบร้อย')
  console.log(`  อีเมล : ${email}`)
  console.log(`  user_id: ${data.user.id}`)
  console.log('')
  console.log('ลองเข้า /admin ได้เลย')
}

main().catch(e => {
  console.error('ผิดพลาด:', e)
  process.exit(1)
})
