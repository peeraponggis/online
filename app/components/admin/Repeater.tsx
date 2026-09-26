'use client'

import { useState } from 'react'
import { inputClass } from './ui'

export interface RepeaterRow {
  [key: string]: string | number
}

export default function Repeater({
  name,
  label,
  hint,
  columns,
  rows,
  create,
  renumber,
}: {
  name: string
  label: string
  hint?: string
  columns: { key: string; label: string; type?: string; options?: readonly string[]; width?: string }[]
  rows: RepeaterRow[]
  create: () => RepeaterRow
  renumber?: boolean
}) {
  const [items, setItems] = useState<RepeaterRow[]>(rows)

  const update = (i: number, key: string, value: string) => {
    setItems(items.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)))
  }

  const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i))

  const add = () => setItems([...items, create()])

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    setItems(next)
  }

  const serialised = renumber
    ? items.map((r, i) => ({ ...r, n: i + 1 }))
    : items

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <span className="block text-sm font-medium text-emerald-800">{label}</span>
          {hint && <span className="block text-xs text-emerald-600">{hint}</span>}
        </div>
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded-lg border border-emerald-300 px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-50"
        >
          + เพิ่ม
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 px-3 py-4 text-center text-xs text-emerald-600">
          ยังไม่มีรายการ — กดปุ่มเพิ่มด้านบน
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((row, i) => (
            <li key={i} className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-2">
              <div className="flex flex-wrap items-end gap-2">
                {renumber && (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                )}
                {columns.map(col => (
                  <div key={col.key} style={col.width ? { flex: `0 0 ${col.width}` } : undefined}>
                    <label
                      htmlFor={`${name}-${i}-${col.key}`}
                      className="mb-0.5 block text-[11px] text-emerald-700"
                    >
                      {col.label}
                    </label>
                    {col.options ? (
                      <select
                        id={`${name}-${i}-${col.key}`}
                        value={String(row[col.key] ?? '')}
                        onChange={e => update(i, col.key, e.target.value)}
                        className={`${inputClass} py-1.5`}
                      >
                        {col.options.map(o => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={`${name}-${i}-${col.key}`}
                        type={col.type ?? 'text'}
                        value={String(row[col.key] ?? '')}
                        onChange={e => update(i, col.key, e.target.value)}
                        className={`${inputClass} py-1.5`}
                      />
                    )}
                  </div>
                ))}
                <div className="ml-auto flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="ย้ายขึ้น"
                    className="rounded border border-emerald-200 px-2 py-1.5 text-xs text-emerald-700 disabled:opacity-40 hover:bg-emerald-50"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                    aria-label="ย้ายลง"
                    className="rounded border border-emerald-200 px-2 py-1.5 text-xs text-emerald-700 disabled:opacity-40 hover:bg-emerald-50"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label="ลบรายการนี้"
                    className="rounded border border-red-200 px-2 py-1.5 text-xs text-red-700 hover:bg-red-50"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input type="hidden" name={name} value={JSON.stringify(serialised)} />
    </div>
  )
}
