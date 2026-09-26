import Link from 'next/link'
import CourseGrid from '../components/CourseGrid'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { COURSES } from '../lib/data'

export const metadata = {
  title: 'คอร์สทั้งหมด — คอร์สออนไลน์',
  description: 'เลือกดูคอร์สออนไลน์ทั้งหมด ค้นหา กรองตามหมวดหมู่ ระดับ และราคา',
}

export default function CoursesPage() {
  return (
    <>
      <Header />

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4">
          <nav aria-label="เส้นทาง" className="mb-4 text-sm text-emerald-600">
            <Link href="/" className="hover:underline">
              หน้าแรก
            </Link>
            <span className="mx-2">/</span>
            <span className="text-emerald-800">คอร์สทั้งหมด</span>
          </nav>

          <h1 className="mb-2 text-center text-3xl font-bold text-emerald-800">คอร์สทั้งหมด</h1>
          <p className="mb-8 text-center text-emerald-600">
            มีทั้งหมด {COURSES.length} คอร์ส — เลือกได้ตามสกิลและงบที่คุณต้องการ
          </p>

          <CourseGrid />
        </div>
      </section>

      <Footer />
    </>
  )
}
