'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createCourseAction, updateCourseAction, type ActionState } from '../../actions'
import { Alert, Card, FieldShell, Toggle, inputClass, inputErrorClass } from '../../../components/admin/ui'
import { SubmitButton, ConfirmSubmit } from '../../../components/admin/SubmitButton'
import CoverPicker from '../../../components/admin/CoverPicker'
import TagInput from '../../../components/admin/TagInput'
import Repeater from '../../../components/admin/Repeater'
import { THAI_LEVELS } from '../../../lib/types'
import { FILE_TYPES, slugify } from '../../../lib/schemas'
import type { CategoryRow, InstructorRow } from '../../../lib/types'
import type { AdminCourseRow } from '../../queries'

const initial: ActionState = { ok: false, message: '' }

export default function CourseForm({
  course,
  categories,
  instructors,
}: {
  course?: AdminCourseRow
  categories: CategoryRow[]
  instructors: InstructorRow[]
}) {
  const isEdit = !!course
  const action = isEdit ? updateCourseAction : createCourseAction
  const [state, formAction] = useActionState(action, initial)

  const [title, setTitle] = useState(course?.title ?? '')
  const [slug, setSlug] = useState(course?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(isEdit)

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title))
  }, [title, slugTouched])

  const initialSig = useMemo(
    () =>
      JSON.stringify({
        t: course?.title ?? '',
        s: course?.slug ?? '',
        d: course?.desc ?? '',
        c: course?.category_id ?? '',
        l: course?.level ?? '',
        p: course?.price ?? 0,
        pub: course?.published ?? false,
        cp: course?.cover ?? 'emerald',
      }),
    [course]
  )

  const [sig, setSig] = useState(initialSig)
  const dirty = sig !== initialSig

  const mark = () =>
    setSig(
      JSON.stringify({
        t: title,
        s: slug,
        d: (document.getElementById('f-desc') as HTMLTextAreaElement | null)?.value ?? '',
        c: (document.getElementById('f-category_id') as HTMLSelectElement | null)?.value ?? '',
        l: (document.getElementById('f-level') as HTMLSelectElement | null)?.value ?? '',
        p: Number((document.getElementById('f-price') as HTMLInputElement | null)?.value ?? 0),
        pub: (document.getElementById('f-published') as HTMLInputElement | null)?.checked ?? false,
        cp: (document.getElementById('cover') as HTMLSelectElement | null)?.value ?? 'emerald',
      })
    )

  const e = state.errors ?? {}
  const noCategories = categories.length === 0
  const noInstructors = instructors.length === 0

  return (
    <form action={formAction} onChange={mark} className="space-y-5">
      {course && <input type="hidden" name="id" value={course.id} />}

      {state.message && <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>}

      {noCategories && (
        <Alert tone="warn">
          ยังไม่มีหมวดหมู่ในระบบ — <Link href="/admin/categories" className="underline">เพิ่มหมวดหมู่</Link> ก่อน
        </Alert>
      )}
      {noInstructors && (
        <Alert tone="warn">
          ยังไม่มีผู้สอนในระบบ — <Link href="/admin/instructors" className="underline">เพิ่มผู้สอน</Link> ก่อน
        </Alert>
      )}

      <Card title="ข้อมูลหลัก">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldShell label="ชื่อคอร์ส" htmlFor="f-title" error={e.title} required>
              <input
                id="f-title"
                name="title"
                value={title}
                onChange={ev => setTitle(ev.target.value)}
                aria-invalid={e.title ? true : undefined}
                className={e.title ? inputErrorClass : inputClass}
              />
            </FieldShell>
          </div>

          <FieldShell
            label="slug (URL)"
            htmlFor="f-slug"
            error={e.slug}
            hint="ใช้ได้เฉพาะ a-z 0-9 และขีดกลาง — สร้างอัตโนมัติจากชื่อ"
            required
          >
            <input
              id="f-slug"
              name="slug"
              value={slug}
              onChange={ev => {
                setSlugTouched(true)
                setSlug(ev.target.value)
              }}
              aria-invalid={e.slug ? true : undefined}
              className={`${e.slug ? inputErrorClass : inputClass} font-mono`}
            />
          </FieldShell>

          <FieldShell label="ไอคอน (emoji)" htmlFor="f-icon" error={e.icon} required>
            <input
              id="f-icon"
              name="icon"
              defaultValue={course?.icon ?? '📘'}
              aria-invalid={e.icon ? true : undefined}
              className={`${e.icon ? inputErrorClass : inputClass} text-2xl`}
            />
          </FieldShell>

          <div className="md:col-span-2">
            <FieldShell
              label="คำอธิบาย"
              htmlFor="f-desc"
              error={e.desc}
              hint="1-2 บรรทัด สูงสุด 600 ตัวอักษร"
              required
            >
              <textarea
                id="f-desc"
                name="desc"
                rows={4}
                defaultValue={course?.desc ?? ''}
                aria-invalid={e.desc ? true : undefined}
                className={e.desc ? inputErrorClass : inputClass}
              />
            </FieldShell>
          </div>

          <div className="md:col-span-2">
            <CoverPicker defaultValue={course?.cover ?? 'emerald'} error={e.cover} />
          </div>
        </div>
      </Card>

      <Card title="การจัดหมวดและราคา">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FieldShell label="หมวดหมู่" htmlFor="f-category_id" error={e.category_id} required>
            <select
              id="f-category_id"
              name="category_id"
              defaultValue={course?.category_id ?? ''}
              aria-invalid={e.category_id ? true : undefined}
              className={e.category_id ? inputErrorClass : inputClass}
            >
              <option value="">— เลือกหมวดหมู่ —</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FieldShell>

          <FieldShell label="ระดับ" htmlFor="f-level" error={e.level} required>
            <select
              id="f-level"
              name="level"
              defaultValue={course?.level ?? 'ง่าย'}
              className={inputClass}
            >
              {THAI_LEVELS.map(l => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </FieldShell>

          <FieldShell label="Tier" htmlFor="f-tier" error={e.tier} required hint="1 = Basic, 3 = Premium">
            <select
              id="f-tier"
              name="tier"
              defaultValue={String(course?.tier ?? 1)}
              className={inputClass}
            >
              {[1, 2, 3].map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FieldShell>

          <FieldShell label="เครดิต" htmlFor="f-credits" error={e.credits} required>
            <input
              id="f-credits"
              name="credits"
              type="number"
              min={1}
              defaultValue={course?.credits ?? 1}
              className={inputClass}
            />
          </FieldShell>

          <FieldShell label="ราคา (บาท)" htmlFor="f-price" error={e.price} required>
            <input
              id="f-price"
              name="price"
              type="number"
              min={0}
              step={10}
              defaultValue={course?.price ?? 0}
              aria-invalid={e.price ? true : undefined}
              className={e.price ? inputErrorClass : inputClass}
            />
          </FieldShell>

          <FieldShell label="ผู้สอน" htmlFor="f-instructor_id" error={e.instructor_id} required>
            <select
              id="f-instructor_id"
              name="instructor_id"
              defaultValue={course?.instructor_id ?? ''}
              aria-invalid={e.instructor_id ? true : undefined}
              className={e.instructor_id ? inputErrorClass : inputClass}
            >
              <option value="">— เลือกผู้สอน —</option>
              {instructors.map(i => (
                <option key={i.id} value={i.id}>
                  {i.avatar} {i.name}
                </option>
              ))}
            </select>
          </FieldShell>
        </div>
      </Card>

      <Card title="เนื้อหา">
        <div className="space-y-5">
          <TagInput
            name="topics"
            label="หัวข้อที่จะได้เรียน"
            hint="พิมพ์แล้วกด Enter — สูงสุด 20 หัวข้อ"
            defaultValues={course?.topics ?? []}
          />

          <Repeater
            name="syllabus"
            label="หลักสูตร"
            hint="ลำดับจะถูกตั้งอัตโนมัติตามตำแหน่งในรายการ"
            renumber
            columns={[
              { key: 'title', label: 'ชื่อบท', width: '40%' },
              { key: 'duration', label: 'ความยาว', width: '22%' },
            ]}
            rows={course?.syllabus ?? []}
            create={() => ({ n: 1, title: '', duration: '' })}
          />

          <Repeater
            name="files"
            label="ไฟล์ประกอบ"
            hint="บันทึกแค่ชื่อ ขนาด และชนิด — ยังไม่ได้อัปโหลดไฟล์จริง"
            columns={[
              { key: 'name', label: 'ชื่อไฟล์', width: '40%' },
              { key: 'size', label: 'ขนาด', width: '18%' },
              { key: 'type', label: 'ชนิด', type: 'select', options: FILE_TYPES, width: '18%' },
            ]}
            rows={course?.files ?? []}
            create={() => ({ name: '', size: '', type: 'PDF' })}
          />
        </div>
      </Card>

      <Card title="ตัวเลขและสถานะ">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FieldShell label="คะแนน (0-5)" htmlFor="f-rating" error={e.rating}>
            <input
              id="f-rating"
              name="rating"
              type="number"
              step="0.1"
              min={0}
              max={5}
              defaultValue={course?.rating ?? 0}
              className={inputClass}
            />
          </FieldShell>
          <FieldShell label="จำนวนผู้เรียน" htmlFor="f-students" error={e.students}>
            <input
              id="f-students"
              name="students"
              type="number"
              min={0}
              defaultValue={course?.students ?? 0}
              className={inputClass}
            />
          </FieldShell>
          <FieldShell label="จำนวนบทเรียน" htmlFor="f-lessons" error={e.lessons}>
            <input
              id="f-lessons"
              name="lessons"
              type="number"
              min={0}
              defaultValue={course?.lessons ?? 0}
              className={inputClass}
            />
          </FieldShell>
          <FieldShell label="ชั่วโมง" htmlFor="f-hours" error={e.hours}>
            <input
              id="f-hours"
              name="hours"
              type="number"
              min={0}
              defaultValue={course?.hours ?? 0}
              className={inputClass}
            />
          </FieldShell>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Toggle
            id="f-certificate"
            name="certificate"
            label="มีใบประกาศนียบัตร"
            defaultChecked={course?.certificate}
          />
          <Toggle
            id="f-lifetime"
            name="lifetime"
            label="เข้าเรียนได้ตลอดชีพ"
            defaultChecked={course?.lifetime}
          />
          <Toggle
            id="f-published"
            name="published"
            label="เผยแพร่บนหน้าเว็บ"
            description="เอาออกไว้ก่อนเพื่อยังไม่แสดงต่อผู้เรียน"
            defaultChecked={course?.published}
          />
        </div>
      </Card>

      <div className="sticky bottom-0 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-100 bg-white/95 p-4 shadow-sm backdrop-blur">
        <SubmitButton
          label={isEdit ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มคอร์ส'}
          disabled={!dirty}
          className={dirty ? '' : 'opacity-50'}
        />
        <Link
          href="/admin/courses"
          className="rounded-lg border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
        >
          ยกเลิก
        </Link>
        {!dirty && isEdit && (
          <span className="text-xs text-emerald-500">ยังไม่ได้แก้ไขอะไร</span>
        )}
        {isEdit && course && (
          <div className="ml-auto">
            <ConfirmSubmit
              label="ลบคอร์สนี้"
              message={`ลบ ${course.title} ?`}
              requireText="ลบ"
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
            />
          </div>
        )}
      </div>
    </form>
  )
}
