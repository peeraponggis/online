import Link from 'next/link'
import { listAdminCategories, listAdminInstructors } from '../../../queries'
import CourseForm from '../CourseForm'

export const metadata = { title: 'เพิ่มคอร์สใหม่ — ผู้ดูแล' }

export default async function NewCoursePage() {
  const [categories, instructors] = await Promise.all([listAdminCategories(), listAdminInstructors()])

  return (
    <div className="space-y-5">
      <header>
        <Link href="/admin/courses" className="text-sm text-emerald-700 hover:underline">
          ← กลับรายการคอร์ส
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-emerald-900">เพิ่มคอร์สใหม่</h1>
        <p className="mt-1 text-sm text-emerald-600">
          คอร์สใหม่จะเริ่มเป็น <strong>ฉบับร่าง</strong> จนกว่าจะเปิดสวิตช์ “เผยแพร่บนหน้าเว็บ”
        </p>
      </header>

      <CourseForm categories={categories} instructors={instructors} />
    </div>
  )
}
