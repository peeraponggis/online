'use client'

import { useState } from 'react'
import { COVERS, COVER_TOKENS, isCoverToken, type CoverToken } from '../../lib/covers'
import { FieldShell, inputClass, inputErrorClass } from './ui'

export default function CoverPicker({
  name = 'cover',
  defaultValue = 'emerald',
  error,
}: {
  name?: string
  defaultValue?: string
  error?: string
}) {
  const [value, setValue] = useState<string>(isCoverToken(defaultValue) ? defaultValue : 'emerald')
  const cls = COVERS[value as CoverToken] ?? COVERS.emerald

  return (
    <FieldShell
      label="สีพื้นหลังการ์ด"
      htmlFor="cover"
      error={error}
      hint="เลือกจากรายการนี้เท่านั้น — Tailwind สร้าง CSS ตามรายการนี้ล่วงหน้า ถ้าพิมพ์เองจะไม่มีสีขึ้น"
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-12 w-16 shrink-0 rounded-lg bg-gradient-to-br ${cls}`}
          aria-hidden
        />
        <select
          id="cover"
          name={name}
          value={value}
          onChange={e => setValue(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'cover-error' : 'cover-hint'}
          className={error ? inputErrorClass : inputClass}
        >
          {COVER_TOKENS.map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-1 text-xs text-emerald-600">CSS ที่จะถูกใช้: {cls}</p>
    </FieldShell>
  )
}
