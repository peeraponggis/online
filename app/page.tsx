import Link from 'next/link'
import Hero from './components/Hero'
import CourseGrid from './components/CourseGrid'
import Header from './components/Header'
import Footer from './components/Footer'
import Plans from './components/Plans'
import { COURSES, TOTAL_STUDENTS, AVERAGE_RATING } from './lib/data'

export default function Home() {
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
          <CourseGrid />
        </div>
      </section>

      <section className="py-16 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-16">
            <div>
              <div className="text-3xl font-bold text-emerald-600">{COURSES.length}</div>
              <div className="text-xs text-emerald-700">คอร์ส</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600">
                {TOTAL_STUDENTS.toLocaleString('en-US')}
              </div>
              <div className="text-xs text-emerald-700">นักเรียน</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600">{AVERAGE_RATING}</div>
              <div className="text-xs text-emerald-700">คะแนนเฉลี่ย</div>
            </div>
          </div>
        </div>
      </section>

      <Plans />

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
