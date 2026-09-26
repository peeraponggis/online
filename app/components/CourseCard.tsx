import Link from 'next/link'
import type { Course } from '../lib/types'
import { formatBaht } from '../lib/format'

export default function CourseCard({ course }: { course: Course }) {
  return (
    <article className="card-hover flex flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
      <Link
        href={`/courses/${course.slug}`}
        className={`grid h-32 place-items-center bg-gradient-to-br ${course.cover} text-5xl`}
        aria-label={`ดูรายละเอียดคอร์ส ${course.title}`}
      >
        <span aria-hidden>{course.icon}</span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
            {course.category}
          </span>
          <span className="rounded-full border border-emerald-200 px-2 py-1 text-xs text-emerald-700">
            {course.level}
          </span>
        </div>

        <h3 className="mb-1 text-lg font-bold text-emerald-900">
          <Link href={`/courses/${course.slug}`} className="hover:text-emerald-600">
            {course.title}
          </Link>
        </h3>
        <p className="mb-3 line-clamp-2 text-sm text-emerald-700">{course.desc}</p>

        <p className="mb-3 text-xs text-emerald-600">
          {course.lessons} บทเรียน · {course.hours} ชม. · Tier {course.tier} ·{' '}
          {course.credits} เครดิต
        </p>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-bold text-emerald-600">
              {formatBaht(course.price)}฿
            </div>
            <div className="text-xs text-amber-500">
              ★ {course.rating} ({formatBaht(course.students)})
            </div>
          </div>
          <Link
            href={`/courses/${course.slug}`}
            className="shrink-0 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            เข้าเรียน
          </Link>
        </div>
      </div>
    </article>
  )
}
