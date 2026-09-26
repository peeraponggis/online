import { listAdminInstructors, countCoursesPerInstructor } from '../../queries'
import InstructorManager from './InstructorManager'

export const metadata = { title: 'จัดการผู้สอน — ผู้ดูแล' }

export default async function AdminInstructorsPage() {
  const [instructors, courseCounts] = await Promise.all([
    listAdminInstructors(),
    countCoursesPerInstructor(),
  ])

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-emerald-900">จัดการผู้สอน</h1>
        <p className="mt-1 text-sm text-emerald-600">
          ผู้สอน {instructors.length} คน — ลบไม่ได้ถ้ายังมีคอร์สที่สอนอยู่
        </p>
      </header>

      <InstructorManager instructors={instructors} courseCounts={courseCounts} />
    </div>
  )
}
