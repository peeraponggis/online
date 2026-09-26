'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { AdminCourseRow } from '../../queries'
import { formatBaht, relativeTime } from '../../../lib/format'
import { ALL_CATEGORIES, THAI_LEVELS } from '../../../lib/types'
import { ConfirmSubmit, SubmitButton } from '../../../components/admin/SubmitButton'
import { deleteCourseAction, togglePublishAction, type ActionState } from '../../actions'

function TogglePublish({ row }: { row: AdminCourseRow }) {
  const [state, setState] = useState<ActionState | null>(null)
  return (
    <form
      action={async fd => {
        fd.set('id', row.id)
        const res = await togglePublishAction(fd)
        setState(res)
      }}
      className="inline"
    >
      <button
        type="submit"
        title={row.published ? 'ถอนเผยแพร่' : 'เผยแพร่'}
        className={
          row.published
            ? 'rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-200'
            : 'rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-800 hover:bg-amber-200'
        }
      >
        {row.published ? 'เผยแพร่' : 'ฉบับร่าง'}
      </button>
      {state && !state.ok && <span className="ml-1 text-[11px] text-red-700">{state.message}</span>}
    </form>
  )
}

export default function CourseTable({ courses }: { courses: AdminCourseRow[] }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState(ALL_CATEGORIES)
  const [lvl, setLvl] = useState(ALL_CATEGORIES)
  const [status, setStatus] = useState('all')

  const categories = useMemo(
    () => Array.from(new Set(courses.map(c => c.categoryName).filter((v): v is string => !!v))),
    [courses]
  )

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return courses.filter(c => {
      if (needle && !`${c.title} ${c.slug}`.toLowerCase().includes(needle)) return false
      if (cat !== ALL_CATEGORIES && c.categoryName !== cat) return false
      if (lvl !== ALL_CATEGORIES && c.level !== lvl) return false
      if (status === 'published' && !c.published) return false
      if (status === 'draft' && c.published) return false
      return true
    })
  }, [courses, q, cat, lvl, status])

  return (
    <div>
      <div className="mb-4 grid gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="a-q" className="mb-1 block text-xs font-semibold text-emerald-700">
            ค้นหา
          </label>
          <input
            id="a-q"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="ชื่อคอร์ส หรือ slug"
            className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
        <div>
          <label htmlFor="a-cat" className="mb-1 block text-xs font-semibold text-emerald-700">
            หมวดหมู่
          </label>
          <select
            id="a-cat"
            value={cat}
            onChange={e => setCat(e.target.value)}
            className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm"
          >
            <option value={ALL_CATEGORIES}>{ALL_CATEGORIES}</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="a-lvl" className="mb-1 block text-xs font-semibold text-emerald-700">
            ระดับ
          </label>
          <select
            id="a-lvl"
            value={lvl}
            onChange={e => setLvl(e.target.value)}
            className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm"
          >
            <option value={ALL_CATEGORIES}>{ALL_CATEGORIES}</option>
            {THAI_LEVELS.map(l => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="a-status" className="mb-1 block text-xs font-semibold text-emerald-700">
            สถานะ
          </label>
          <select
            id="a-status"
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm"
          >
            <option value="all">ทั้งหมด</option>
            <option value="published">เผยแพร่แล้ว</option>
            <option value="draft">ฉบับร่าง</option>
          </select>
        </div>
      </div>

      <p className="mb-3 text-sm text-emerald-700">
        พบ {list.length} จากทั้งหมด {courses.length} คอร์ส
      </p>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-emerald-100 bg-white py-14 text-center">
          <p className="text-emerald-700">ไม่พบคอร์สที่ตรงกับเงื่อนไข</p>
          <Link
            href="/admin/courses/new"
            className="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            เพิ่มคอร์สแรก
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map(c => (
            <li
              key={c.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-100 bg-white p-3 shadow-sm"
            >
              <div
                className={`grid h-12 w-14 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${c.coverClass} text-xl`}
                aria-hidden
              >
                {c.icon}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-medium text-emerald-900">{c.title}</span>
                  <TogglePublish row={c} />
                </div>
                <div className="mt-0.5 text-xs text-emerald-600">
                  <span className="font-mono">{c.slug}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-emerald-700">
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5">
                    {c.categoryName ?? 'ไม่มีหมวด'}
                  </span>
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5">{c.level}</span>
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5">Tier {c.tier}</span>
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5">
                    {formatBaht(c.price)} ฿
                  </span>
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5">
                    แก้ {relativeTime(c.updated_at)}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Link
                  href={`/courses/${c.slug}`}
                  target="_blank"
                  className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50"
                >
                  ดูหน้าเว็บ
                </Link>
                <Link
                  href={`/admin/courses/${c.id}`}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  แก้ไข
                </Link>
                <form action={deleteCourseAction} className="inline">
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmSubmit
                    label="ลบ"
                    message={`ลบ ${c.title} ?`}
                    requireText="ลบ"
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
                  />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
