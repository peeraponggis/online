import Link from 'next/link'
import { listAdminCourses } from '../../queries'
import CourseTable from './CourseTable'

export const metadata = { title: 'จัดการคอร์ส — ผู้ดูแล' }

export default async function AdminCoursesPage() {
  const courses = await listAdminCourses()

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">จัดการคอร์ส</h1>
          <p className="mt-1 text-sm text-emerald-600">
            เพิ่ม แก้ไข ลบ และนำเข้าคอร์ส — มีทั้งหมด {courses.length} รายการ
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/courses/import"
            className="rounded-lg border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            📥 นำเข้า
          </Link>
          <Link
            href="/admin/courses/new"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            + เพิ่มคอร์ส
          </Link>
        </div>
      </header>

      <CourseTable courses={courses} />
    </div>
  )
}
