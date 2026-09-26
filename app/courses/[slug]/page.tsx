import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { COURSES, PLANS, getCourseBySlug, formatBaht } from '../../lib/data'

export function generateStaticParams() {
  return COURSES.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = getCourseBySlug(slug)
  if (!course) return { title: 'ไม่พบคอร์ส — คอร์สออนไลน์' }
  return { title: `${course.title} — คอร์สออนไลน์`, description: course.desc }
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = getCourseBySlug(slug)
  if (!course) notFound()

  const plan = PLANS.find(p => course.tier <= p.maxTier)
  const ins = course.instructor

  return (
    <>
      <Header />

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4">
          <nav aria-label="เส้นทาง" className="mb-6 text-sm text-emerald-600">
            <Link href="/" className="hover:underline">
              หน้าแรก
            </Link>
            <span className="mx-2">/</span>
            <Link href="/courses" className="hover:underline">
              คอร์สทั้งหมด
            </Link>
            <span className="mx-2">/</span>
            <span className="text-emerald-800">{course.title}</span>
          </nav>

          <div
            className={`mb-6 grid h-48 place-items-center rounded-2xl bg-gradient-to-br ${course.cover} text-7xl`}
          >
            <span aria-hidden>{course.icon}</span>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
              {course.category}
            </span>
            <span className="rounded-full border border-emerald-200 px-2 py-1 text-xs text-emerald-700">
              {course.level}
            </span>
            <span className="rounded-full border border-emerald-200 px-2 py-1 text-xs text-emerald-700">
              Tier {course.tier}
            </span>
            <span className="rounded-full border border-emerald-200 px-2 py-1 text-xs text-emerald-700">
              {course.credits} เครดิต
            </span>
            {course.certificate && (
              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">
                มีใบประกาศนียบัตร
              </span>
            )}
            {course.lifetime && (
              <span className="rounded-full bg-sky-100 px-2 py-1 text-xs text-sky-700">
                ตลอดชีพ
              </span>
            )}
          </div>

          <h1 className="mb-2 text-3xl font-bold text-emerald-900">{course.title}</h1>
          <p className="mb-6 text-emerald-700">{course.desc}</p>

          <div className="mb-8 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-emerald-50 py-3">
              <div className="text-xl font-bold text-emerald-700">{course.lessons}</div>
              <div className="text-xs text-emerald-600">บทเรียน</div>
            </div>
            <div className="rounded-xl bg-emerald-50 py-3">
              <div className="text-xl font-bold text-emerald-700">{course.hours}</div>
              <div className="text-xs text-emerald-600">ชั่วโมง</div>
            </div>
            <div className="rounded-xl bg-emerald-50 py-3">
              <div className="text-xl font-bold text-emerald-700">
                {formatBaht(course.students)}
              </div>
              <div className="text-xs text-emerald-600">ผู้เรียน</div>
            </div>
          </div>

          <h2 className="mb-2 text-lg font-bold text-emerald-800">สิ่งที่คุณจะได้เรียน</h2>
          <ul className="mb-8 grid gap-1.5 text-sm text-emerald-700 sm:grid-cols-2">
            {course.topics.map(t => (
              <li key={t}>✓ {t}</li>
            ))}
          </ul>

          <h2 className="mb-2 text-lg font-bold text-emerald-800">
            หลักสูตร ({course.syllabus.length} บท)
          </h2>
          <ol className="mb-8 space-y-1.5">
            {course.syllabus.map(s => (
              <li
                key={s.n}
                className="flex items-center gap-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                  {s.n}
                </span>
                <span className="flex-1 text-emerald-800">{s.title}</span>
                <span className="text-xs text-emerald-500">{s.duration}</span>
              </li>
            ))}
          </ol>

          <h2 className="mb-2 text-lg font-bold text-emerald-800">
            ไฟล์ประกอบ ({course.files.length})
          </h2>
          <ul className="mb-8 space-y-1.5">
            {course.files.map(f => (
              <li
                key={f.name}
                className="flex items-center gap-3 rounded-lg border border-emerald-100 px-3 py-2 text-sm"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700">
                  {f.type}
                </span>
                <span className="flex-1 text-emerald-800">{f.name}</span>
                <span className="text-xs text-emerald-500">{f.size}</span>
              </li>
            ))}
          </ul>

          <div className="mb-8 flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
            <div className="text-3xl">{ins.avatar}</div>
            <div className="flex-1">
              <div className="font-bold text-emerald-900">{ins.name}</div>
              <div className="text-xs text-emerald-600">
                {ins.title} · ประสบการณ์ {ins.experience} · สอน {formatBaht(ins.students)} คน
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-6">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="text-xs text-emerald-600">ราคาซื้อเดี่ยว</div>
                <div className="text-3xl font-bold text-emerald-600">
                  {formatBaht(course.price)}฿
                </div>
              </div>
              <div className="text-sm text-amber-500">
                ★ {course.rating} ({formatBaht(course.students)} คน)
              </div>
            </div>

            {plan && (
              <p className="mb-4 text-sm text-emerald-600">
                รวมอยู่ในแพ็กเกจ <strong>{plan.name}</strong> (ใช้ {course.credits} เครดิต) —{' '}
                <Link href="/plans" className="underline">
                  ดูรายละเอียดแพ็กเกจ
                </Link>
              </p>
            )}

            <button
              type="button"
              className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white transition-colors hover:bg-emerald-600"
            >
              เข้าเรียน (ต้นแบบ — ยังไม่เชื่อมระบบชำระเงินจริง)
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
