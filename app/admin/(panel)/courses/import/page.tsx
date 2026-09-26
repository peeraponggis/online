'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import {
  previewImportAction,
  runImportAction,
  type ActionState,
  type ImportRow,
} from '../../../actions'
import { Alert, Card, inputClass } from '../../../../components/admin/ui'
import { SubmitButton } from '../../../../components/admin/SubmitButton'

const previewInitial: ActionState & { rows?: ImportRow[] } = { ok: false, message: '' }
const runInitial: ActionState = { ok: false, message: '' }

const STATUS_META: Record<string, { label: string; cls: string }> = {
  create: { label: 'จะเพิ่มใหม่', cls: 'bg-emerald-100 text-emerald-800' },
  update: { label: 'จะอัปเดต', cls: 'bg-sky-100 text-sky-800' },
  error: { label: 'ผิดพลาด', cls: 'bg-red-100 text-red-800' },
  ok: { label: 'พร้อม', cls: 'bg-emerald-100 text-emerald-800' },
}

const TEMPLATE_JSON = `[
  {
    "title": "ชื่อคอร์สของคุณ",
    "slug": "my-course",
    "desc": "คำอธิบายสั้น ๆ",
    "category": "เขียนโปรแกรม",
    "level": "ง่าย",
    "tier": 1,
    "credits": 1,
    "price": 490,
    "icon": "🚀",
    "cover": "emerald",
    "rating": 5.0,
    "students": 0,
    "lessons": 3,
    "hours": 3,
    "certificate": true,
    "lifetime": true,
    "instructor": "อาจารย์สมชาย",
    "topics": ["หัวข้อที่ 1", "หัวข้อที่ 2"],
    "syllabus": [{ "n": 1, "title": "บทที่ 1", "duration": "30 นาที" }],
    "files": [{ "name": "slide.pdf", "size": "1.2 MB", "type": "PDF" }]
  }
]`

const TEMPLATE_CSV = `title,slug,desc,category,level,tier,credits,price,icon,cover,instructor
ชื่อคอร์ส,my-course,คำอธิบาย,เขียนโปรแกรม,ง่าย,1,1,490,🚀,emerald,อาจารย์สมชาย`

export default function ImportPage() {
  const [preview, previewAction] = useActionState(previewImportAction, previewInitial)
  const [run, runAction] = useActionState(runImportAction, runInitial)
  const [selected, setSelected] = useState<number[]>([])

  const rows = preview.rows ?? []
  const importable = rows.filter(r => r.status === 'create' || r.status === 'update')
  const errCount = rows.filter(r => r.status === 'error').length

  const toggle = (i: number) =>
    setSelected(s => (s.includes(i) ? s.filter(x => x !== i) : [...s, i]))

  const toggleAll = () =>
    setSelected(selected.length === importable.length ? [] : importable.map(r => r.index))

  return (
    <div className="space-y-5">
      <header>
        <Link href="/admin/courses" className="text-sm text-emerald-700 hover:underline">
          ← กลับรายการคอร์ส
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-emerald-900">นำเข้าคอร์ส</h1>
        <p className="mt-1 text-sm text-emerald-600">
          รองรับไฟล์ JSON และ CSV — ระบบจะตรวจทุกรายการก่อนนำเข้าเสมอ
        </p>
      </header>

      <Alert tone="info">
        ชื่อหมวดหมู่และชื่อผู้สอนต้องตรงกับที่มีอยู่ในระบบ ถ้าไม่ตรงรายการนั้นจะถูกทำเครื่องหมายว่าผิดพลาด
        แก้ชื่อหมวดหมู่หรือผู้สอนให้ตรงก่อน แล้วตรวจใหม่
      </Alert>

      <Card title="1. ใส่ข้อมูล" description="วางข้อความ หรืออัปโหลดไฟล์แล้ววางเนื้อหา">
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('payload') as HTMLTextAreaElement | null
              if (el) {
                el.value = TEMPLATE_JSON
                el.dispatchEvent(new Event('input', { bubbles: true }))
              }
            }}
            className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50"
          >
            📋 เทมเพลต JSON
          </button>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('payload') as HTMLTextAreaElement | null
              if (el) {
                el.value = TEMPLATE_CSV
                el.dispatchEvent(new Event('input', { bubbles: true }))
              }
            }}
            className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50"
          >
            📋 เทมเพลต CSV
          </button>
          <label className="cursor-pointer rounded-lg border border-emerald-300 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50">
            📁 เลือกไฟล์
            <input
              type="file"
              accept=".json,.csv,.txt"
              className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0]
                if (!file) return
                const text = await file.text()
                const el = document.getElementById('payload') as HTMLTextAreaElement | null
                if (el) {
                  el.value = text
                  el.dispatchEvent(new Event('input', { bubbles: true }))
                }
              }}
            />
          </label>
        </div>

        <form action={previewAction}>
          <label htmlFor="payload" className="sr-only">
            ข้อมูลที่จะนำเข้า
          </label>
          <textarea
            id="payload"
            name="payload"
            rows={12}
            placeholder="วาง JSON หรือ CSV ที่นี่…"
            className={`${inputClass} font-mono text-xs`}
          />
          <div className="mt-3">
            <SubmitButton label="ตรวจข้อมูลก่อนนำเข้า" pendingLabel="กำลังตรวจ..." />
          </div>
        </form>
      </Card>

      {preview.message && (
        <Alert tone={preview.ok ? 'success' : 'error'}>{preview.message}</Alert>
      )}

      {rows.length > 0 && (
        <Card
          title="2. เลือกรายการที่จะนำเข้า"
          description={`นำเข้าได้ ${importable.length} · ต้องแก้ ${errCount}`}
          actions={
            <button
              type="button"
              onClick={toggleAll}
              className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50"
            >
              {selected.length === importable.length ? 'เอาติ๊กออกหมด' : 'เลือกทั้งหมด'}
            </button>
          }
        >
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-emerald-200 text-left">
                  <th className="w-10 py-2">
                    <span className="sr-only">เลือก</span>
                  </th>
                  <th className="py-2">ชื่อคอร์ส</th>
                  <th className="py-2">slug</th>
                  <th className="py-2">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const meta = STATUS_META[r.status]
                  const canImport = r.status === 'create' || r.status === 'update'
                  return (
                    <tr key={r.index} className="border-b border-emerald-50 align-top">
                      <td className="py-2">
                        <input
                          type="checkbox"
                          checked={selected.includes(r.index)}
                          disabled={!canImport}
                          onChange={() => toggle(r.index)}
                          aria-label={`เลือก ${r.title}`}
                          className="h-4 w-4 rounded border-emerald-300 text-emerald-600"
                        />
                      </td>
                      <td className="py-2 text-emerald-900">{r.title}</td>
                      <td className="py-2 font-mono text-xs text-emerald-600">
                        {String(r.payload?.slug ?? '-')}
                      </td>
                      <td className="py-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] ${meta.cls}`}>
                          {meta.label}
                        </span>
                        {r.issues.length > 0 && (
                          <ul className="mt-1 space-y-0.5 text-[11px] text-red-700">
                            {r.issues.slice(0, 3).map((msg, i) => (
                              <li key={i}>• {msg}</li>
                            ))}
                            {r.issues.length > 3 && <li>• และอีก {r.issues.length - 3} ข้อ</li>}
                          </ul>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <form action={runAction} className="mt-4 border-t border-emerald-100 pt-4">
            <input type="hidden" name="selected" value={selected.join('\n')} />
            <input type="hidden" name="preview" value={JSON.stringify(rows)} />
            <div className="flex flex-wrap items-center gap-3">
              <SubmitButton
                label={`นำเข้า ${selected.length} รายการ`}
                pendingLabel="กำลังนำเข้า..."
                disabled={selected.length === 0}
              />
              <span className="text-xs text-emerald-600">เลือกไว้ {selected.length} รายการ</span>
            </div>
          </form>

          {run.message && (
            <div className="mt-4">
              <Alert tone={run.ok ? 'success' : 'error'}>{run.message}</Alert>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
