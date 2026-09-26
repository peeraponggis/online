'use client'

import { useActionState, useState } from 'react'
import { saveInstructorAction, deleteInstructorAction, type ActionState } from '../../actions'
import { Alert, Card, FieldShell, inputClass, inputErrorClass } from '../../../components/admin/ui'
import { SubmitButton } from '../../../components/admin/SubmitButton'
import { formatBaht } from '../../../lib/format'
import type { InstructorRow } from '../../../lib/types'

const initial: ActionState = { ok: false, message: '' }

const AVATARS = ['👨‍🏫', '👩‍🏫', '🧑‍💻', '👨‍💼', '👩‍💼', '🧑‍🎨', '🧑‍🔬', '👩‍🔬', '🤖', '🦊']

function InstructorForm({ instructor }: { instructor?: InstructorRow }) {
  const [state, action] = useActionState(saveInstructorAction, initial)
  const e = state.errors ?? {}
  const [avatar, setAvatar] = useState(instructor?.avatar ?? '👨‍🏫')

  return (
    <form action={action} className="space-y-3">
      {instructor && <input type="hidden" name="id" value={instructor.id} />}

      {state.message && (
        <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <FieldShell label="ชื่อผู้สอน" htmlFor={`in-name-${instructor?.id ?? 'new'}`} error={e.name} required>
          <input
            id={`in-name-${instructor?.id ?? 'new'}`}
            name="name"
            defaultValue={instructor?.name ?? ''}
            className={e.name ? inputErrorClass : inputClass}
          />
        </FieldShell>

        <FieldShell label="ตำแหน่ง" htmlFor={`in-title-${instructor?.id ?? 'new'}`} error={e.title} required>
          <input
            id={`in-title-${instructor?.id ?? 'new'}`}
            name="title"
            defaultValue={instructor?.title ?? ''}
            className={e.title ? inputErrorClass : inputClass}
          />
        </FieldShell>

        <FieldShell
          label="ประสบการณ์"
          htmlFor={`in-exp-${instructor?.id ?? 'new'}`}
          error={e.experience}
          required
        >
          <input
            id={`in-exp-${instructor?.id ?? 'new'}`}
            name="experience"
            defaultValue={instructor?.experience ?? ''}
            placeholder="เช่น 10 ปี"
            className={e.experience ? inputErrorClass : inputClass}
          />
        </FieldShell>

        <FieldShell
          label="จำนวนผู้เรียนสะสม"
          htmlFor={`in-students-${instructor?.id ?? 'new'}`}
          error={e.students}
        >
          <input
            id={`in-students-${instructor?.id ?? 'new'}`}
            name="students"
            type="number"
            min={0}
            defaultValue={instructor?.students ?? 0}
            className={inputClass}
          />
        </FieldShell>
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium text-emerald-800">รูปประจำตัว</span>
        <div className="flex flex-wrap items-center gap-2">
          {AVATARS.map(a => (
            <button
              key={a}
              type="button"
              onClick={() => setAvatar(a)}
              aria-label={`เลือกไอคอน ${a}`}
              aria-pressed={avatar === a}
              className={`grid h-10 w-10 place-items-center rounded-lg border-2 text-xl transition-colors ${
                avatar === a ? 'border-emerald-500 bg-emerald-50' : 'border-emerald-200'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
        <input type="hidden" name="avatar" value={avatar} />
      </div>

      <div className="flex justify-end">
        <SubmitButton label={instructor ? 'บันทึกผู้สอน' : 'เพิ่มผู้สอน'} />
      </div>
    </form>
  )
}

export default function InstructorManager({
  instructors,
  courseCounts,
}: {
  instructors: InstructorRow[]
  courseCounts: Map<string, number>
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [delMsg, setDelMsg] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <Card
        title="รายชื่อผู้สอน"
        actions={
          <button
            type="button"
            onClick={() => setShowNew(v => !v)}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            {showNew ? 'ยกเลิก' : '+ เพิ่มผู้สอน'}
          </button>
        }
      >
        {delMsg && (
          <div className="mb-3">
            <Alert tone="error">{delMsg}</Alert>
          </div>
        )}

        {instructors.length === 0 ? (
          <p className="py-6 text-center text-sm text-emerald-600">ยังไม่มีผู้สอน</p>
        ) : (
          <ul className="divide-y divide-emerald-50">
            {instructors.map(i => {
              const count = courseCounts.get(i.id) ?? 0
              return (
                <li key={i.id} className="py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-2xl" aria-hidden>
                      {i.avatar}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-emerald-900">{i.name}</div>
                      <div className="text-xs text-emerald-600">
                        {i.title} · {i.experience} · สอน {formatBaht(i.students)} คน
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                      {count} คอร์ส
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenId(openId === i.id ? null : i.id)
                          setDelMsg(null)
                        }}
                        className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50"
                      >
                        {openId === i.id ? 'ปิด' : 'แก้ไข'}
                      </button>
                      <form
                        action={async fd => {
                          fd.set('id', i.id)
                          const res = await deleteInstructorAction(fd)
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

                  {openId === i.id && (
                    <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                      <InstructorForm instructor={i} />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {showNew && (
        <Card title="เพิ่มผู้สอนใหม่">
          <InstructorForm />
        </Card>
      )}
    </div>
  )
}
