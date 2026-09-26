import Link from 'next/link'
import Hero from './components/Hero'
import CourseGrid from './components/CourseGrid'
import Header from './components/Header'
import Footer from './components/Footer'
import Plans from './components/Plans'
import { getCategories, getCourses, getPlans } from './lib/queries'

export const revalidate = 300

export default async function Home() {
  const [courses, categories, plans] = await Promise.all([getCourses(), getCategories(), getPlans()])
  const totalStudents = courses.reduce((s, c) => s + c.students, 0)
  const avgRating =
    courses.length > 0
      ? Math.round((courses.reduce((s, c) => s + c.rating, 0) / courses.length) * 10) / 10
      : 0

  return (
    <>
      <Header />
      <Hero />

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-emerald-800 mb-4">คอร์สยอดนิยม</h2>
            <p className="text-emerald-600 text-lg">คอร์สที่นักเรียนเลือกมากที่สุด ด้วยธีมธรรมชาติ</p>
          </div>
          <CourseGrid courses={courses} categories={categories.map(c => c.name)} />
        </div>
      </section>

      <section className="py-16 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-16">
            <div>
              <div className="text-3xl font-bold text-emerald-600">{courses.length}</div>
              <div className="text-xs text-emerald-700">คอร์ส</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600">
                {totalStudents.toLocaleString('en-US')}
              </div>
              <div className="text-xs text-emerald-700">นักเรียน</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600">{avgRating}</div>
              <div className="text-xs text-emerald-700">คะแนนเฉลี่ย</div>
            </div>
          </div>
        </div>
      </section>

      <Plans plans={plans} />

      <section className="py-14 bg-white border-t border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-emerald-800 mb-4">ยังไม่มีบัญชี?</h2>
          <p className="text-emerald-600 mb-6">
            สมัครสมาชิกเพื่อแลกเครดิตเข้าคอร์สได้ทันที และติดตามความคืบหน้าของคุณได้ทุกที่
          </p>
          <Link
            href="/courses"
            className="inline-block px-8 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
          >
            เริ่มต้นเรียนฟรี
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
