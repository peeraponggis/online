import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminCourse, listAdminCategories, listAdminInstructors } from '../../../queries'
import CourseForm from '../CourseForm'

export const metadata = { title: 'แก้ไขคอร์ส — ผู้ดูแล' }

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [course, categories, instructors] = await Promise.all([
    getAdminCourse(id),
    listAdminCategories(),
    listAdminInstructors(),
  ])

  if (!course) notFound()

  return (
    <div className="space-y-5">
      <header>
        <Link href="/admin/courses" className="text-sm text-emerald-700 hover:underline">
          ← กลับรายการคอร์ส
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-emerald-900">แก้ไข: {course.title}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-emerald-600">
          <span className="font-mono">{course.slug}</span>
          <Link
            href={`/courses/${course.slug}`}
            target="_blank"
            className="rounded border border-emerald-200 px-2 py-0.5 text-xs hover:bg-emerald-50"
          >
            ดูหน้าเว็บ ↗
          </Link>
          <span
            className={
              course.published
                ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-800'
                : 'rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800'
            }
          >
            {course.published ? 'เผยแพร่อยู่' : 'ฉบับร่าง'}
          </span>
        </p>
      </header>

      <CourseForm course={course} categories={categories} instructors={instructors} />
    </div>
  )
}
