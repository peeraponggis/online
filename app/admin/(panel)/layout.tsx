import Link from 'next/link'
import { requireAdmin, listAdminCategories, listAdminInstructors, listAdminPlans, listAdminCourses } from '../queries'
import { signOutAction } from '../actions'
import { isSupabaseConfigured } from '../../lib/supabase/client'

export const dynamic = 'force-dynamic'

const NAV = [
  { href: '/admin', label: 'แดชบอร์ด', icon: '📊', exact: true },
  { href: '/admin/courses', label: 'คอร์ส', icon: '📚' },
  { href: '/admin/courses/import', label: 'นำเข้าคอร์ส', icon: '📥' },
  { href: '/admin/instructors', label: 'ผู้สอน', icon: '👨‍🏫' },
  { href: '/admin/plans', label: 'แพ็กเกจ', icon: '💎' },
  { href: '/admin/categories', label: 'หมวดหมู่', icon: '🏷️' },
  { href: '/admin/settings', label: 'ตั้งค่าเว็บ', icon: '⚙️' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const identity = await requireAdmin().catch(() => null)
  if (!identity) return null

  const [courses, categories, instructors, plans] = await Promise.all([
    listAdminCourses(),
    listAdminCategories(),
    listAdminInstructors(),
    listAdminPlans(),
  ])

  const counts: Record<string, number> = {
    '/admin/courses': courses.length,
    '/admin/instructors': instructors.length,
    '/admin/plans': plans.length,
    '/admin/categories': categories.length,
  }

  const configured = isSupabaseConfigured()

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row">
        <aside className="md:w-60 md:shrink-0">
          <div className="rounded-2xl bg-emerald-900 p-4 text-emerald-50 shadow-sm md:sticky md:top-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 font-bold text-emerald-950">
                L
              </span>
              <div>
                <div className="text-sm font-bold text-white">ผู้ดูแลระบบ</div>
                <div className="truncate text-[11px] text-emerald-300">{identity.email}</div>
              </div>
            </div>

            <nav aria-label="เมนูผู้ดูแล" className="space-y-1">
              {NAV.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-emerald-100 transition-colors hover:bg-emerald-800"
                >
                  <span>
                    <span aria-hidden className="mr-2">
                      {item.icon}
                    </span>
                    {item.label}
                  </span>
                  {counts[item.href] !== undefined && (
                    <span className="rounded-full bg-emerald-800 px-1.5 text-[11px] text-emerald-200">
                      {counts[item.href]}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="mt-4 border-t border-emerald-800 pt-3">
              <Link
                href="/"
                className="block rounded-lg px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-800"
              >
                🌐 ดูหน้าเว็บ
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-emerald-200 hover:bg-emerald-800"
                >
                  🚪 ออกจากระบบ
                </button>
              </form>
            </div>

            {!configured && (
              <p className="mt-3 rounded-lg bg-amber-500/20 px-3 py-2 text-[11px] text-amber-100">
                ยังไม่ได้ตั้งค่า Supabase — ข้อมูลทั้งหมดเป็นตัวอย่าง
              </p>
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
