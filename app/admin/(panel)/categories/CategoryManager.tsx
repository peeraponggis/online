'use client'

import { useActionState, useState } from 'react'
import { saveCategoryAction, deleteCategoryAction, reorderCategoriesAction, type ActionState } from '../../actions'
import { Alert, Card, FieldShell, inputClass, inputErrorClass } from '../../../components/admin/ui'
import { SubmitButton } from '../../../components/admin/SubmitButton'
import type { CategoryRow } from '../../../lib/types'

const initial: ActionState = { ok: false, message: '' }

function CategoryForm({ category }: { category?: CategoryRow }) {
  const [state, action] = useActionState(saveCategoryAction, initial)
  const [name, setName] = useState(category?.name ?? '')
  const [slug, setSlug] = useState(category?.slug ?? '')
  const [touched, setTouched] = useState(!!category)
  const e = state.errors ?? {}

  const autoSlug = (v: string) =>
    v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  return (
    <form action={action} className="space-y-3">
      {category && <input type="hidden" name="id" value={category.id} />}
      {state.message && <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>}

      <div className="grid gap-3 sm:grid-cols-2">
        <FieldShell label="ชื่อหมวดหมู่" htmlFor={`cat-name-${category?.id ?? 'new'}`} error={e.name} required>
          <input
            id={`cat-name-${category?.id ?? 'new'}`}
            name="name"
            value={name}
            onChange={ev => {
              setName(ev.target.value)
              if (!touched) setSlug(autoSlug(ev.target.value))
            }}
            className={e.name ? inputErrorClass : inputClass}
          />
        </FieldShell>

        <FieldShell
          label="slug"
          htmlFor={`cat-slug-${category?.id ?? 'new'}`}
          error={e.slug}
          hint="สร้างอัตโนมัติจากชื่อ"
          required
        >
          <input
            id={`cat-slug-${category?.id ?? 'new'}`}
            name="slug"
            value={slug}
            onChange={ev => {
              setTouched(true)
              setSlug(ev.target.value)
            }}
            className={`${e.slug ? inputErrorClass : inputClass} font-mono`}
          />
        </FieldShell>

        <FieldShell
          label="ลำดับ"
          htmlFor={`cat-sort-${category?.id ?? 'new'}`}
          error={e.sort_order}
          hint="เลขน้อยแสดงก่อน"
        >
          <input
            id={`cat-sort-${category?.id ?? 'new'}`}
            name="sort_order"
            type="number"
            min={0}
            defaultValue={category?.sort_order ?? 99}
            className={inputClass}
          />
        </FieldShell>
      </div>

      <div className="flex justify-end">
        <SubmitButton label={category ? 'บันทึกหมวดหมู่' : 'เพิ่มหมวดหมู่'} />
      </div>
    </form>
  )
}

export default function CategoryManager({
  categories,
  courseCounts,
}: {
  categories: CategoryRow[]
  courseCounts: Map<string, number>
}) {
  const [order, setOrder] = useState<string[]>(categories.map(c => c.id))
  const [openId, setOpenId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [delMsg, setDelMsg] = useState<string | null>(null)

  const ordered = [...categories].sort((a, b) => a.sort_order - b.sort_order)
  const ids = order.join(',')
  const originalIds = categories.map(c => c.id).join(',')

  const move = (id: string, dir: -1 | 1) => {
    const next = [...order]
    const i = next.indexOf(id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    setOrder(next)
  }

  return (
    <div className="space-y-4">
      <Card
        title="หมวดหมู่"
        actions={
          <button
            type="button"
            onClick={() => setShowNew(v => !v)}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            {showNew ? 'ยกเลิก' : '+ เพิ่มหมวดหมู่'}
          </button>
        }
      >
        {delMsg && (
          <div className="mb-3">
            <Alert tone="error">{delMsg}</Alert>
          </div>
        )}

        {categories.length === 0 ? (
          <p className="py-6 text-center text-sm text-emerald-600">ยังไม่มีหมวดหมู่</p>
        ) : (
          <ul className="space-y-2">
            {ordered.map((c, i) => {
              const count = courseCounts.get(c.id) ?? 0
              return (
                <li key={c.id} className="rounded-xl border border-emerald-100 p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-emerald-900">{c.name}</div>
                      <div className="text-xs text-emerald-600">
                        <span className="font-mono">{c.slug}</span> · {count} คอร์ส
                        {count > 0 && <span className="text-amber-700"> · ลบไม่ได้</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => move(c.id, -1)}
                        disabled={i === 0}
                        aria-label="ย้ายขึ้น"
                        className="rounded border border-emerald-200 px-2 py-1 text-xs text-emerald-700 disabled:opacity-40 hover:bg-emerald-50"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(c.id, 1)}
                        disabled={i === ordered.length - 1}
                        aria-label="ย้ายลง"
                        className="rounded border border-emerald-200 px-2 py-1 text-xs text-emerald-700 disabled:opacity-40 hover:bg-emerald-50"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenId(openId === c.id ? null : c.id)
                          setDelMsg(null)
                        }}
                        className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50"
                      >
                        {openId === c.id ? 'ปิด' : 'แก้ไข'}
                      </button>
                      <form
                        action={async fd => {
                          fd.set('id', c.id)
                          const res = await deleteCategoryAction(fd)
                          setDelMsg(res.ok ? null : res.message)
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
                        >
                          ลบ
                        </button>
                      </form>
                    </div>
                  </div>

                  {openId === c.id && (
                    <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                      <CategoryForm category={c} />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {order.join(',') !== originalIds && (
          <form action={reorderCategoriesAction} className="mt-4 flex items-center gap-3 border-t border-emerald-100 pt-4">
            <input type="hidden" name="order" value={ids} />
            <SubmitButton label="บันทึกลำดับใหม่" pendingLabel="กำลังบันทึก..." />
            <button
              type="button"
              onClick={() => setOrder(categories.map(c => c.id))}
              className="rounded-lg border border-emerald-300 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
            >
              ยกเลิก
            </button>
          </form>
        )}
      </Card>

      {showNew && (
        <Card title="เพิ่มหมวดหมู่ใหม่">
          <CategoryForm />
        </Card>
      )}
    </div>
  )
}
