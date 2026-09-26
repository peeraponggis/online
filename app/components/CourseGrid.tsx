'use client'

import { useMemo, useState } from 'react'
import CourseCard from './CourseCard'
import { formatBaht } from '../lib/format'
import { ALL_CATEGORIES, LEVEL_OPTIONS } from '../lib/types'
import type { Course, Level } from '../lib/types'

type SortKey = 'pop' | 'low' | 'high' | 'rating' | 'new'

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'pop', label: 'ยอดนิยมสูงสุด' },
  { value: 'low', label: 'ราคา: ต่ำ → สูง' },
  { value: 'high', label: 'ราคา: สูง → ต่ำ' },
  { value: 'rating', label: 'คะแนนสูงสุด' },
  { value: 'new', label: 'เรียงตามรหัส' },
]

const COMPARATORS: Record<SortKey, (a: Course, b: Course) => number> = {
  pop: (a, b) => b.students - a.students,
  low: (a, b) => a.price - b.price,
  high: (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
  new: (a, b) => a.slug.localeCompare(b.slug),
}

const MAX_PRICE = 2000

interface Props {
  courses: Course[]
  categories: string[]
}

export default function CourseGrid({ courses, categories }: Props) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>(ALL_CATEGORIES)
  const [lvl, setLvl] = useState<string>(ALL_CATEGORIES)
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE)
  const [sort, setSort] = useState<SortKey>('pop')

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const filtered = courses.filter(c => {
      if (needle && !`${c.title} ${c.desc}`.toLowerCase().includes(needle)) return false
      if (cat !== ALL_CATEGORIES && c.category !== cat) return false
      if (lvl !== ALL_CATEGORIES && c.level !== (lvl as Level)) return false
      if (c.price > maxPrice) return false
      return true
    })
    return [...filtered].sort(COMPARATORS[sort])
  }, [courses, q, cat, lvl, maxPrice, sort])

  const reset = () => {
    setQ('')
    setCat(ALL_CATEGORIES)
    setLvl(ALL_CATEGORIES)
    setMaxPrice(MAX_PRICE)
    setSort('pop')
  }

  return (
    <div>
      <div className="mb-8 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label htmlFor="q" className="text-xs font-semibold text-emerald-700">
              ค้นหา
            </label>
            <input
              id="q"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="ชื่อคอร์ส หรือ คำอธิบาย..."
              className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label htmlFor="fCat" className="text-xs font-semibold text-emerald-700">
              หมวดหมู่
            </label>
            <select
              id="fCat"
              value={cat}
              onChange={e => setCat(e.target.value)}
              className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm"
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
            <label htmlFor="fLevel" className="text-xs font-semibold text-emerald-700">
              ระดับ
            </label>
            <select
              id="fLevel"
              value={lvl}
              onChange={e => setLvl(e.target.value)}
              className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm"
            >
              <option value={ALL_CATEGORIES}>{ALL_CATEGORIES}</option>
              {LEVEL_OPTIONS.map(l => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fPrice" className="text-xs font-semibold text-emerald-700">
              ราคาสูงสุด: <span className="text-emerald-600">{maxPrice}</span> ฿
            </label>
            <input
              id="fPrice"
              type="range"
              min={390}
              max={MAX_PRICE}
              step={50}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="mt-2 w-full"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-emerald-100 pt-3">
          <span className="text-sm text-emerald-700">
            พบ {list.length} คอร์ส จากทั้งหมด {courses.length} คอร์ส
          </span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            aria-label="เรียงลำดับ"
            className="rounded-lg border border-emerald-200 px-3 py-1.5 text-sm"
          >
            {SORTS.map(s => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {list.length ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(c => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      ) : (
        <div className="col-span-full rounded-2xl border border-emerald-100 bg-white py-16 text-center text-emerald-600">
          <div className="mb-3 text-5xl">🍃</div>
          <p>ไม่พบคอร์สที่ตรงกับเงื่อนไข</p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm text-white"
          >
            ล้างตัวกรอง
          </button>
        </div>
      )}
    </div>
  )
}
