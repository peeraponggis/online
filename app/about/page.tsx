import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { COURSES, INSTRUCTORS, TOTAL_STUDENTS, AVERAGE_RATING, formatBaht } from '../lib/data'

export const metadata = {
  title: 'เกี่ยวกับเรา — คอร์สออนไลน์',
  description: 'แพลตฟอร์มคอร์สออนไลน์ธีมธรรมชาติ จากผู้สอนมืออาชีพ',
}

export default function AboutPage() {
  const instructors = Object.values(INSTRUCTORS)

  return (
    <>
      <Header />

      <section className="py-14">
        <div className="mx-auto max-w-4xl px-4">
          <nav aria-label="เส้นทาง" className="mb-4 text-sm text-emerald-600">
            <Link href="/" className="hover:underline">
              หน้าแรก
            </Link>
            <span className="mx-2">/</span>
            <span className="text-emerald-800">เกี่ยวกับเรา</span>
          </nav>

          <h1 className="mb-3 text-3xl font-bold text-emerald-800">เกี่ยวกับเรา</h1>
          <p className="mb-10 text-emerald-700">
            แพลตฟอร์มคอร์สออนไลน์ที่เน้นความสบายตาในการอ่าน ธีมธรรมชาติสีเขียวสบายตา
            เนื้อหาจากผู้สอนมืออาชีพ เข้าเรียนได้ทุกที่ทุกเวลา
          </p>

          <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-emerald-50 p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{COURSES.length}</div>
              <div className="text-xs text-emerald-700">คอร์ส</div>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{instructors.length}</div>
              <div className="text-xs text-emerald-700">ผู้สอน</div>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {formatBaht(TOTAL_STUDENTS)}
              </div>
              <div className="text-xs text-emerald-700">ผู้เรียนสะสม</div>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{AVERAGE_RATING}</div>
              <div className="text-xs text-emerald-700">คะแนนเฉลี่ย</div>
            </div>
          </div>

          <h2 className="mb-4 text-2xl font-bold text-emerald-800">ทีมผู้สอน</h2>
          <ul className="mb-12 space-y-2">
            {instructors.map(i => (
              <li
                key={i.name}
                className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-3"
              >
                <span className="text-2xl">{i.avatar}</span>
                <div className="flex-1">
                  <div className="font-medium text-emerald-900">{i.name}</div>
                  <div className="text-xs text-emerald-600">
                    {i.title} · ประสบการณ์ {i.experience} · สอน {formatBaht(i.students)} คน
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <h2 className="mb-4 text-2xl font-bold text-emerald-800">ติดต่อเรา</h2>
          <ul className="mb-12 space-y-1 text-emerald-700">
            <li>อีเมล: hello@course.example</li>
            <li>โทร: 02-xxx-xxxx</li>
            <li>กรุงเทพมหานคร ประเทศไทย</li>
          </ul>

          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <strong>หมายเหตุ:</strong> เว็บนี้เป็นต้นแบบสาธิต (mockup) ระบบสมาชิกและระบบชำระเงิน
            ยังไม่เชื่อมต่อกับบริการจริง — ห้ามใช้สั่งซื้อสินค้าจริง
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
