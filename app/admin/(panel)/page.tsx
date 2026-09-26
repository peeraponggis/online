import Link from 'next/link'
import {
  listAdminCourses,
  listAdminInstructors,
  listAdminPlans,
  listAdminCategories,
  listAuditLog,
} from '../queries'
import { Card, Stat } from '../../components/admin/ui'
import { relativeTime } from '../../lib/format'
import { isSupabaseConfigured } from '../../lib/supabase/client'

export const metadata = { title: 'แดชบอร์ดผู้ดูแล — คอร์สออนไลน์' }

const ACTION_LABEL: Record<string, string> = {
  create: 'เพิ่ม',
  update: 'แก้ไข',
  delete: 'ลบ',
  import: 'นำเข้า',
  login: 'เข้าสู่ระบบ',
}

const ENTITY_LABEL: Record<string, string> = {
  courses: 'คอร์ส',
  instructors: 'ผู้สอน',
  plans: 'แพ็กเกจ',
  categories: 'หมวดหมู่',
  settings: 'ตั้งค่า',
  admins: 'ระบบ',
}

export default async function AdminDashboardPage() {
  const [courses, instructors, plans, categories, audit] = await Promise.all([
    listAdminCourses(),
    listAdminInstructors(),
    listAdminPlans(),
    listAdminCategories(),
    listAuditLog(10),
  ])

  const published = courses.filter(c => c.published).length
  const drafts = courses.length - published
  const configured = isSupabaseConfigured()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-emerald-900">แดชบอร์ดผู้ดูแล</h1>
        <p className="mt-1 text-sm text-emerald-600">ภาพรวมข้อมูลบนเว็บไซต์</p>
      </header>

      {!configured && (
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="font-bold">ยังไม่ได้เชื่อมต่อฐานข้อมูล</p>
          <p className="mt-1">
            หน้านี้แสดงข้อมูล 0 รายการ เพราะยังไม่ได้ตั้งค่า Supabase —{' '}
            <Link href="/admin/setup" className="font-semibold underline">
              ดูขั้นตอนตั้งค่า
            </Link>
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="คอร์สทั้งหมด" value={courses.length} hint={`เผยแพร่ ${published} · ฉบับร่าง ${drafts}`} />
        <Stat label="ผู้สอน" value={instructors.length} />
        <Stat label="แพ็กเกจ" value={plans.length} />
        <Stat label="หมวดหมู่" value={categories.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="คอร์สที่แก้ไขล่าสุด" description="เรียงตามเวลาที่บันทึกล่าสุด">
          {courses.length === 0 ? (
            <p className="py-6 text-center text-sm text-emerald-600">ยังไม่มีข้อมูล</p>
          ) : (
            <ul className="divide-y divide-emerald-50">
              {courses.slice(0, 6).map(c => (
                <li key={c.id} className="flex items-center gap-3 py-2.5">
                  <div
                    className={`grid h-10 w-12 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${c.coverClass} text-lg`}
                    aria-hidden
                  >
                    {c.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-emerald-900">{c.title}</div>
                    <div className="text-xs text-emerald-600">
                      {c.categoryName ?? 'ไม่มีหมวด'} · {relativeTime(c.updated_at)}
                    </div>
                  </div>
                  <span
                    className={
                      c.published
                        ? 'shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-800'
                        : 'shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800'
                    }
                  >
                    {c.published ? 'เผยแพร่' : 'ฉบับร่าง'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="ประวัติการเปลี่ยนแปลง" description="บันทึกทุกครั้งที่แก้ไข">
          {audit.length === 0 ? (
            <p className="py-6 text-center text-sm text-emerald-600">
              {configured ? 'ยังไม่มีรายการ' : 'ต้องเชื่อมต่อฐานข้อมูลก่อนจึงจะมีประวัติ'}
            </p>
          ) : (
            <ul className="divide-y divide-emerald-50">
              {audit.map(a => (
                <li key={a.id} className="flex items-start gap-3 py-2.5 text-sm">
                  <span className="mt-0.5 shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] text-emerald-800">
                    {ACTION_LABEL[a.action] ?? a.action}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-emerald-900">
                      {ENTITY_LABEL[a.entity] ?? a.entity}: {a.label}
                    </div>
                    <div className="text-xs text-emerald-600">{relativeTime(a.at)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
