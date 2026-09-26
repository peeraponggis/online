'use client'

import { useState } from 'react'
import { inputClass, inputErrorClass } from './ui'

export default function TagInput({
  name,
  label,
  hint,
  error,
  defaultValues = [],
  placeholder = 'พิมพ์แล้วกด Enter หรือจุลภาค',
}: {
  name: string
  label: string
  hint?: string
  error?: string
  defaultValues?: string[]
  placeholder?: string
}) {
  const [tags, setTags] = useState<string[]>(defaultValues)
  const [draft, setDraft] = useState('')

  const commit = () => {
    const v = draft.trim()
    if (!v) return
    if (!tags.includes(v)) setTags([...tags, v])
    setDraft('')
  }

  const removeAt = (i: number) => setTags(tags.filter((_, idx) => idx !== i))

  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-emerald-800">
        {label}
      </label>

      <div className="mb-2 flex flex-wrap gap-1.5">
        {tags.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-800"
          >
            {t}
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label={`ลบ ${t}`}
              className="text-emerald-700 hover:text-red-700"
            >
              ✕
            </button>
          </span>
        ))}
        {tags.length === 0 && <span className="text-xs text-emerald-500">ยังไม่มีรายการ</span>}
      </div>

      <div className="flex gap-2">
        <input
          id={name}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              commit()
            }
          }}
          onBlur={commit}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
          className={error ? inputErrorClass : inputClass}
        />
        <button
          type="button"
          onClick={commit}
          className="shrink-0 rounded-lg border border-emerald-300 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
        >
          เพิ่ม
        </button>
      </div>

      <input type="hidden" name={name} value={tags.join('\n')} />

      {hint && !error && (
        <p className="mt-1 text-xs text-emerald-600">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs font-medium text-red-700">{error}</p>
      )}
    </div>
  )
}
