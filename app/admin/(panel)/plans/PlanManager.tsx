'use client'

import { useActionState, useState } from 'react'
import { savePlanAction, deletePlanAction, type ActionState } from '../../actions'
import { Alert, Card, FieldShell, inputClass, inputErrorClass } from '../../../components/admin/ui'
import { SubmitButton, ConfirmSubmit } from '../../../components/admin/SubmitButton'
import TagInput from '../../../components/admin/TagInput'
import { formatBaht } from '../../../lib/format'
import type { PlanRow } from '../../../lib/types'

const initial: ActionState = { ok: false, message: '' }

function PlanForm({ plan }: { plan?: PlanRow }) {
  const [state, action] = useActionState(savePlanAction, initial)
  const e = state.errors ?? {}
  const key = plan?.code ?? 'new'

  return (
    <form action={action} className="space-y-3">
      {plan && <input type="hidden" name="code" value={plan.code} />}
      {state.message && <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>}

      <div className="grid gap-3 sm:grid-cols-2">
        {!plan && (
          <FieldShell label="รหัสแพ็กเกจ" htmlFor={`pl-code-${key}`} error={e.code} required hint="a-z 0-9 และขีด เช่น basic">
            <input id={`pl-code-${key}`} name="code" className={`${e.code ? inputErrorClass : inputClass} font-mono`} />
          </FieldShell>
        )}

        <FieldShell label="ชื่อที่แสดง" htmlFor={`pl-name-${key}`} error={e.name} required>
          <input
            id={`pl-name-${key}`}
            name="name"
            defaultValue={plan?.name ?? ''}
            className={e.name ? inputErrorClass : inputClass}
          />
        </FieldShell>

        <FieldShell label="ราคา/ปี (บาท)" htmlFor={`pl-price-${key}`} error={e.price} required>
          <input
            id={`pl-price-${key}`}
            name="price"
            type="number"
            min={0}
            step={10}
            defaultValue={plan?.price ?? 0}
            className={inputClass}
          />
        </FieldShell>

        <FieldShell
          label="โควตาคอร์ส"
          htmlFor={`pl-quota-${key}`}
          error={e.quota}
          hint="ใส่ -1 เพื่อไม่จำกัด"
          required
        >
          <input
            id={`pl-quota-${key}`}
            name="quota"
            type="number"
            defaultValue={plan?.quota ?? -1}
            className={e.quota ? inputErrorClass : inputClass}
          />
        </FieldShell>

        <FieldShell
          label="เข้าถึง Tier สูงสุด"
          htmlFor={`pl-tier-${key}`}
          error={e.max_tier}
          required
        >
          <select
            id={`pl-tier-${key}`}
            name="max_tier"
            defaultValue={String(plan?.max_tier ?? 1)}
            className={inputClass}
          >
            {[1, 2, 3].map(t => (
              <option key={t} value={t}>
                Tier 1-{t}
              </option>
            ))}
          </select>
        </FieldShell>

        <FieldShell
          label="ลำดับ"
          htmlFor={`pl-sort-${key}`}
          error={e.sort_order}
          hint="เลขน้อยแสดงก่อน"
        >
          <input
            id={`pl-sort-${key}`}
            name="sort_order"
            type="number"
            min={0}
            defaultValue={plan?.sort_order ?? 99}
            className={inputClass}
          />
        </FieldShell>
      </div>

      <TagInput
        name="feats"
        label="สิทธิ์ที่ได้รับ"
        hint="พิมพ์แล้วกด Enter — จะแสดงเป็นเครื่องหมายถูกในการ์ดแพ็กเกจ"
        defaultValues={plan?.feats ?? []}
      />

      <div className="flex justify-end">
        <SubmitButton label={plan ? 'บันทึกแพ็กเกจ' : 'เพิ่มแพ็กเกจ'} />
      </div>
    </form>
  )
}

export default function PlanManager({ plans }: { plans: PlanRow[] }) {
  const [openCode, setOpenCode] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [delMsg, setDelMsg] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <Card
        title="แพ็กเกจทั้งหมด"
        actions={
          <button
            type="button"
            onClick={() => setShowNew(v => !v)}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            {showNew ? 'ยกเลิก' : '+ เพิ่มแพ็กเกจ'}
          </button>
        }
      >
        {delMsg && (
          <div className="mb-3">
            <Alert tone="error">{delMsg}</Alert>
          </div>
        )}

        {plans.length === 0 ? (
          <p className="py-6 text-center text-sm text-emerald-600">ยังไม่มีแพ็กเกจ</p>
        ) : (
          <ul className="space-y-2">
            {plans.map(p => (
              <li key={p.code} className="rounded-xl border border-emerald-100 p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-emerald-900">{p.name}</span>
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[11px] text-emerald-700">
                        {p.code}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-emerald-600">
                      {formatBaht(p.price)} ฿/ปี · {p.quota === -1 ? 'ไม่จำกัด' : `${p.quota} คอร์ส`} · Tier
                      1-{p.max_tier} · {p.feats.length} สิทธิ์
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenCode(openCode === p.code ? null : p.code)
                        setDelMsg(null)
                      }}
                      className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50"
                    >
                      {openCode === p.code ? 'ปิด' : 'แก้ไข'}
                    </button>
                    <form action={deletePlanAction} className="inline">
                      <input type="hidden" name="code" value={p.code} />
                      <ConfirmSubmit
                        label="ลบ"
                        message={`ลบแพ็กเกจ ${p.name} ?`}
                        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
                      />
                    </form>
                  </div>
                </div>

                {openCode === p.code && (
                  <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                    <PlanForm plan={p} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {showNew && (
        <Card title="เพิ่มแพ็กเกจใหม่">
          <PlanForm />
        </Card>
      )}
    </div>
  )
}
