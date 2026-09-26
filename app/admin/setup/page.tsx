import Link from 'next/link'
import { Alert } from '../../components/admin/ui'

export const metadata = { title: 'ตั้งค่า Supabase — คอร์สออนไลน์' }

const STEPS = [
  {
    n: 1,
    t: 'สร้าง Supabase project',
    d: 'ไปที่ supabase.com → New project ตั้งชื่อและเลือก region ที่ใกล้ (Singapore) แล้วรอสร้างเสร็จ',
  },
  {
    n: 2,
    t: 'รัน migration',
    d: 'เปิด SQL Editor แล้วรันไฟล์ supabase/migrations/0001_admin_init.sql ตามด้วย 0002_seed_settings.sql (ทำตามลำดับ)',
  },
  {
    n: 3,
    t: 'สร้างผู้ดูแลระบบ',
    d: 'Authentication → Users → Add user ใส่อีเมลผู้ดูแลและตั้งรหัสผ่านเอง → ติ้ก Email confirm เป็น OFF',
  },
  {
    n: 4,
    t: 'ใส่ user_id ลงตาราง admins',
    d: 'รัน SQL: select id, email from auth.users; แล้ว insert into admins (user_id, email) values (\'<uuid>\', \'<อีเมล>\')',
  },
  {
    n: 5,
    t: 'สร้างไฟล์ .env.local',
    d: 'คัดลอก .env.example เป็น .env.local แล้วใส่ URL, anon key และ service role key จาก Project Settings → API',
  },
  {
    n: 6,
    t: 'นำเข้าข้อมูลเดิม',
    d: 'รัน: npm run seed  — จะย้ายคอร์ส 12, ผู้สอน 6, แพ็กเกจ 3, หมวดหมู่ 7 เข้าไปในฐานข้อมูล (รันซ้ำได้)',
  },
]

export default function AdminSetupPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="text-sm text-emerald-700 hover:underline">
        ← กลับหน้าเว็บ
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-emerald-800">ยังไม่ได้เชื่อมต่อฐานข้อมูล</h1>
      <p className="mt-2 text-emerald-700">
        หน้าแอดมินต้องใช้ Supabase จึงจะบันทึกข้อมูลได้จริง ตอนนี้เว็บยังอ่านข้อมูลจากไฟล์
        data/courses.js ตามปกติ (เว็บหน้าบ้านยังใช้ได้ครบ)
      </p>

      <div className="mt-6">
        <Alert tone="info">
          รหัสผ่านไม่ต้องส่งมาในแชทและไม่ต้องเขียนลงไฟล์ในโปรเจกต์ —
          ตั้งเองใน Supabase Dashboard ได้เลย (ขั้นตอนที่ 3) ซึ่งปลอดภัยที่สุด
        </Alert>
      </div>

      <ol className="mt-8 space-y-4">
        {STEPS.map(s => (
          <li key={s.n} className="flex gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-600 font-bold text-white">
              {s.n}
            </span>
            <div>
              <h2 className="font-bold text-emerald-900">{s.t}</h2>
              <p className="mt-1 text-sm text-emerald-700">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl border border-emerald-100 bg-white p-5">
        <h2 className="font-bold text-emerald-900">ไฟล์ที่เกี่ยวข้อง</h2>
        <ul className="mt-2 space-y-1 font-mono text-sm text-emerald-700">
          <li>supabase/migrations/0001_admin_init.sql</li>
          <li>supabase/migrations/0002_seed_settings.sql</li>
          <li>supabase/seed/seed.mjs</li>
          <li>scripts/admin-create.mjs</li>
        </ul>
      </div>
    </main>
  )
}
