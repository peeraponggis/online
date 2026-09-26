'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getAdminIdentity, requireAdmin } from '../lib/supabase/admin'
import { serverSupabase } from '../lib/supabase/server'
import { isSupabaseConfigured } from '../lib/supabase/client'
import {
  bankSettingsSchema,
  categorySchema,
  courseSchema,
  fieldErrors,
  instructorSchema,
  planSchema,
  siteSettingsSchema,
  slugify,
  type CourseInput,
  type InstructorInput,
  type PlanInput,
  type CategoryInput,
} from '../lib/schemas'
import { parseImportPayload } from '../lib/import-parse'

export interface ActionState {
  ok: boolean
  message: string
  errors?: Record<string, string>
  id?: string
}

const NOT_CONFIGURED: ActionState = {
  ok: false,
  message: 'ยังไม่ได้เชื่อมต่อ Supabase — ดูวิธีตั้งค่าในหัวข้อ 11 ของแผน',
}

function asBool(v: FormDataEntryValue | null): boolean {
  return v === 'on' || v === 'true' || v === '1'
}

function asList(v: FormDataEntryValue | null): string[] {
  if (typeof v !== 'string') return []
  return v
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
}

function asNumberList(v: FormDataEntryValue | null): number[] {
  return asList(v).map(s => Number(s)).filter(n => Number.isFinite(n))
}

async function logAction(
  identity: { userId: string },
  action: 'create' | 'update' | 'delete' | 'import' | 'login',
  entity: string,
  entityId: string | null,
  label: string,
  before?: unknown,
  after?: unknown
) {
  try {
    const supabase = await serverSupabase()
    await supabase.from('audit_log').insert({
      actor_id: identity.userId,
      action,
      entity,
      entity_id: entityId,
      label,
      before: (before ?? null) as never,
      after: (after ?? null) as never,
    })
  } catch {
    // บันทึก audit ไม่สำเร็จ ไม่ควรทำให้การแก้ไขข้อมูลล้มเหลว
  }
}

function revalidatePublic() {
  revalidatePath('/', 'layout')
  revalidatePath('/admin')
}

/* ---------------- auth ---------------- */

export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return { ...NOT_CONFIGURED, message: 'ยังไม่ได้เชื่อมต่อ Supabase — ดู /admin/setup' }
  }
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { ok: false, message: 'กรอกอีเมลและรหัสผ่านให้ครบ' }
  }

  const supabase = await serverSupabase()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { ok: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }
  }

  const { data } = await supabase.auth.getUser()
  if (!data?.user) return { ok: false, message: 'เข้าสู่ระบบไม่สำเร็จ' }

  const { data: adminRow } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle()

  if (!adminRow) {
    await supabase.auth.signOut()
    return { ok: false, message: 'บัญชีนี้ไม่มีสิทธิ์แอดมิน' }
  }

  const identity = await getAdminIdentity()
  if (identity) await logAction(identity, 'login', 'admins', identity.userId, identity.email)

  redirect('/admin')
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await serverSupabase()
    await supabase.auth.signOut()
  }
  redirect('/admin/login')
}

/* ---------------- courses ---------------- */

function readCourseForm(form: FormData): Record<string, unknown> {
  const rawSyllabus = form.get('syllabus')
  let syllabus: unknown[] = []
  if (typeof rawSyllabus === 'string' && rawSyllabus.trim()) {
    try {
      syllabus = JSON.parse(rawSyllabus)
    } catch {
      syllabus = []
    }
  }
  const rawFiles = form.get('files')
  let files: unknown[] = []
  if (typeof rawFiles === 'string' && rawFiles.trim()) {
    try {
      files = JSON.parse(rawFiles)
    } catch {
      files = []
    }
  }

  return {
    title: String(form.get('title') ?? ''),
    slug: String(form.get('slug') ?? '').trim() || slugify(String(form.get('title') ?? '')),
    desc: String(form.get('desc') ?? ''),
    category_id: String(form.get('category_id') ?? ''),
    level: String(form.get('level') ?? 'ง่าย'),
    tier: String(form.get('tier') ?? '1'),
    credits: String(form.get('credits') ?? '1'),
    price: String(form.get('price') ?? '0'),
    icon: String(form.get('icon') ?? '📘'),
    cover: String(form.get('cover') ?? 'emerald'),
    rating: String(form.get('rating') ?? '0'),
    students: String(form.get('students') ?? '0'),
    lessons: String(form.get('lessons') ?? '0'),
    hours: String(form.get('hours') ?? '0'),
    certificate: asBool(form.get('certificate')),
    lifetime: asBool(form.get('lifetime')),
    instructor_id: String(form.get('instructor_id') ?? ''),
    published: asBool(form.get('published')),
    topics: asList(form.get('topics')),
    syllabus,
    files,
  }
}

async function replaceChildren(
  supabase: Awaited<ReturnType<typeof serverSupabase>>,
  courseId: string,
  input: CourseInput
) {
  await supabase.from('course_topics').delete().eq('course_id', courseId)
  await supabase.from('course_syllabus').delete().eq('course_id', courseId)
  await supabase.from('course_files').delete().eq('course_id', courseId)

  if (input.topics.length) {
    await supabase.from('course_topics').insert(
      input.topics.map((topic, i) => ({ course_id: courseId, topic, sort_order: i }))
    )
  }
  if (input.syllabus.length) {
    await supabase.from('course_syllabus').insert(
      input.syllabus.map((s, i) => ({
        course_id: courseId,
        n: s.n,
        title: s.title,
        duration: s.duration,
        sort_order: i,
      }))
    )
  }
  if (input.files.length) {
    await supabase.from('course_files').insert(
      input.files.map((f, i) => ({
        course_id: courseId,
        name: f.name,
        size: f.size,
        type: f.type,
        sort_order: i,
      }))
    )
  }
}

export async function createCourseAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const identity = await requireAdmin()

  const parsed = courseSchema.safeParse(readCourseForm(formData))
  if (!parsed.success) {
    return {
      ok: false,
      message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบช่องที่ทำเครื่องหมายไว้',
      errors: fieldErrors(parsed.error as z.ZodError),
    }
  }
  const input = parsed.data
  const supabase = await serverSupabase()

  const { data: dup } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', input.slug)
    .maybeSingle()
  if (dup) {
    return { ok: false, message: 'slug นี้ถูกใช้ไปแล้ว', errors: { slug: 'slug ต้องไม่ซ้ำ' } }
  }

  const { data: created, error } = await supabase
    .from('courses')
    .insert({
      slug: input.slug,
      title: input.title,
      desc: input.desc,
      category_id: input.category_id,
      level: input.level,
      tier: input.tier,
      credits: input.credits,
      price: input.price,
      icon: input.icon,
      cover: input.cover,
      rating: input.rating,
      students: input.students,
      lessons: input.lessons,
      hours: input.hours,
      certificate: input.certificate,
      lifetime: input.lifetime,
      instructor_id: input.instructor_id,
      published: input.published,
    })
    .select('id')
    .single()

  if (error || !created) {
    return { ok: false, message: `บันทึกไม่สำเร็จ: ${error?.message ?? 'ไม่ทราบสาเหตุ'}` }
  }

  await replaceChildren(supabase, created.id, input)
  await logAction(identity, 'create', 'courses', created.id, input.title)
  revalidatePublic()
  return { ok: true, message: `เพิ่มคอร์ส "${input.title}" แล้ว`, id: created.id }
}

export async function updateCourseAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const identity = await requireAdmin()

  const id = String(formData.get('id') ?? '')
  if (!id) return { ok: false, message: 'ไม่พบรหัสคอร์ส' }

  const parsed = courseSchema.safeParse(readCourseForm(formData))
  if (!parsed.success) {
    return {
      ok: false,
      message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบช่องที่ทำเครื่องหมายไว้',
      errors: fieldErrors(parsed.error as z.ZodError),
    }
  }
  const input = parsed.data
  const supabase = await serverSupabase()

  const { data: dup } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', input.slug)
    .neq('id', id)
    .maybeSingle()
  if (dup) {
    return { ok: false, message: 'slug นี้ถูกใช้ไปแล้ว', errors: { slug: 'slug ต้องไม่ซ้ำ' } }
  }

  const { data: before } = await supabase
    .from('courses')
    .select('title, slug, price, published, updated_at')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase
    .from('courses')
    .update({
      slug: input.slug,
      title: input.title,
      desc: input.desc,
      category_id: input.category_id,
      level: input.level,
      tier: input.tier,
      credits: input.credits,
      price: input.price,
      icon: input.icon,
      cover: input.cover,
      rating: input.rating,
      students: input.students,
      lessons: input.lessons,
      hours: input.hours,
      certificate: input.certificate,
      lifetime: input.lifetime,
      instructor_id: input.instructor_id,
      published: input.published,
    })
    .eq('id', id)

  if (error) return { ok: false, message: `บันทึกไม่สำเร็จ: ${error.message}` }

  await replaceChildren(supabase, id, input)
  await logAction(identity, 'update', 'courses', id, input.title, before, input)
  revalidatePublic()
  return { ok: true, message: `บันทึก "${input.title}" แล้ว`, id }
}

export async function deleteCourseAction(formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const identity = await requireAdmin()

  const id = String(formData.get('id') ?? '')
  const confirm = String(formData.get('confirm') ?? '')
  if (!id) return { ok: false, message: 'ไม่พบรหัสคอร์ส' }
  if (confirm !== 'ลบ') return { ok: false, message: 'ต้องพิมพ์คำว่า "ลบ" เพื่อยืนยัน' }

  const supabase = await serverSupabase()
  const { data: before } = await supabase
    .from('courses')
    .select('title, slug')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) return { ok: false, message: `ลบไม่สำเร็จ: ${error.message}` }

  await logAction(identity, 'delete', 'courses', id, before?.title ?? id, before)
  revalidatePublic()
  return { ok: true, message: `ลบ "${before?.title ?? 'คอร์ส'}" แล้ว` }
}

export async function togglePublishAction(formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const identity = await requireAdmin()

  const id = String(formData.get('id') ?? '')
  if (!id) return { ok: false, message: 'ไม่พบรหัสคอร์ส' }

  const supabase = await serverSupabase()
  const { data: before } = await supabase
    .from('courses')
    .select('title, published')
    .eq('id', id)
    .maybeSingle()
  if (!before) return { ok: false, message: 'ไม่พบคอร์ส' }

  const { error } = await supabase
    .from('courses')
    .update({ published: !before.published })
    .eq('id', id)
  if (error) return { ok: false, message: `เปลี่ยนสถานะไม่สำเร็จ: ${error.message}` }

  await logAction(
    identity,
    'update',
    'courses',
    id,
    before.title,
    { published: before.published },
    { published: !before.published }
  )
  revalidatePublic()
  return { ok: true, message: before.published ? 'ถอนเผยแพร่แล้ว' : 'เผยแพร่แล้ว' }
}

/* ---------------- import ---------------- */

export interface ImportRow {
  index: number
  title: string
  status: 'ok' | 'error' | 'create' | 'update'
  issues: string[]
  payload?: Record<string, unknown>
  id?: string
}

export async function previewImportAction(_prev: ActionState, formData: FormData): Promise<ActionState & { rows?: ImportRow[] }> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  await requireAdmin()

  const raw = String(formData.get('payload') ?? '')
  if (!raw.trim()) return { ok: false, message: 'ยังไม่ได้ใส่ข้อมูล' }

  let items: unknown[]
  try {
    items = parseImportPayload(raw)
  } catch (e) {
    return { ok: false, message: `อ่านข้อมูลไม่ได้: ${(e as Error).message}` }
  }

  const supabase = await serverSupabase()
  const [{ data: cats }, { data: ins }, { data: existing }] = await Promise.all([
    supabase.from('categories').select('id, name'),
    supabase.from('instructors').select('id, name'),
    supabase.from('courses').select('id, slug, title, legacy_id'),
  ])

  const catByName = new Map((cats ?? []).map(c => [c.name, c.id]))
  const insByName = new Map((ins ?? []).map(i => [i.name, i.id]))
  const bySlug = new Map((existing ?? []).map(c => [c.slug, c]))
  const byLegacy = new Map((existing ?? []).filter(c => c.legacy_id).map(c => [c.legacy_id, c]))

  const rows: ImportRow[] = items.map((item, i) => {
    const obj = (item ?? {}) as Record<string, unknown>
    const title = String(obj.title ?? '').trim()
    const issues: string[] = []
    let status: ImportRow['status'] = 'create'
    let id: string | undefined

    const rawCat = typeof obj.category === 'string' ? obj.category : ''
    const categoryId =
      (typeof obj.category_id === 'string' && obj.category_id) || catByName.get(rawCat) || ''
    if (!categoryId) issues.push(`ไม่พบหมวดหมู่ "${rawCat}"`)

    const rawIns = typeof obj.instructor === 'string' ? obj.instructor : ''
    const instructorId =
      (typeof obj.instructor_id === 'string' && obj.instructor_id) || insByName.get(rawIns) || ''
    if (!instructorId) issues.push(`ไม่พบผู้สอน "${rawIns}"`)

    const slug = String(obj.slug ?? '').trim() || slugify(title || `course-${i + 1}`)
    if (!slug) issues.push('slug ไม่ถูกต้อง')
    const legacyId = typeof obj.legacy_id === 'string' ? obj.legacy_id : undefined

    const hit = bySlug.get(slug) ?? (legacyId ? byLegacy.get(legacyId) : undefined)
    if (hit) {
      status = 'update'
      id = hit.id
    }

    const candidate = {
      title,
      slug,
      desc: String(obj.desc ?? ''),
      category_id: categoryId,
      level: String(obj.level ?? 'ง่าย'),
      tier: obj.tier ?? 1,
      credits: obj.credits ?? 1,
      price: obj.price ?? 0,
      icon: String(obj.icon ?? '📘'),
      cover: String(obj.cover ?? 'emerald'),
      rating: obj.rating ?? 0,
      students: obj.students ?? 0,
      lessons: obj.lessons ?? 0,
      hours: obj.hours ?? 0,
      certificate: Boolean(obj.certificate),
      lifetime: Boolean(obj.lifetime),
      instructor_id: instructorId,
      published: obj.published === undefined ? false : Boolean(obj.published),
      topics: Array.isArray(obj.topics) ? obj.topics.map(String) : [],
      syllabus: Array.isArray(obj.syllabus) ? obj.syllabus : [],
      files: Array.isArray(obj.files) ? obj.files : [],
    }

    const parsed = courseSchema.safeParse(candidate)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        issues.push(`${issue.path.join('.')}: ${issue.message}`)
      }
    }

    if (issues.length) status = 'error'
    if (!title) {
      status = 'error'
      issues.push('ไม่มีชื่อคอร์ส')
    }

    return { index: i + 1, title: title || '(ไม่มีชื่อ)', status, issues, payload: candidate, id }
  })

  const good = rows.filter(r => r.status === 'create' || r.status === 'update').length
  return {
    ok: true,
    message: `ตรวจแล้ว ${rows.length} รายการ · นำเข้าได้ ${good} · ต้องแก้ ${rows.length - good}`,
    rows,
  }
}

export async function runImportAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const identity = await requireAdmin()

  const indexes = asNumberList(formData.get('selected'))
  if (!indexes.length) return { ok: false, message: 'ยังไม่ได้เลือกรายการที่จะนำเข้า' }

  const previewRaw = String(formData.get('preview') ?? '')
  let rows: ImportRow[]
  try {
    rows = JSON.parse(previewRaw) as ImportRow[]
  } catch {
    return { ok: false, message: 'ข้อมูลตรวจสอบหายไป กรุณาตรวจไฟล์ใหม่' }
  }

  const supabase = await serverSupabase()
  let created = 0
  let updated = 0
  const failed: string[] = []

  for (const idx of indexes) {
    const row = rows.find(r => r.index === idx)
    if (!row || !row.payload || row.status === 'error') continue
    const input = courseSchema.parse(row.payload)

    if (row.id) {
      const { error } = await supabase
        .from('courses')
        .update({
          slug: input.slug,
          title: input.title,
          desc: input.desc,
          category_id: input.category_id,
          level: input.level,
          tier: input.tier,
          credits: input.credits,
          price: input.price,
          icon: input.icon,
          cover: input.cover,
          rating: input.rating,
          students: input.students,
          lessons: input.lessons,
          hours: input.hours,
          certificate: input.certificate,
          lifetime: input.lifetime,
          instructor_id: input.instructor_id,
          published: input.published,
        })
        .eq('id', row.id)
      if (error) {
        failed.push(`${input.title}: ${error.message}`)
        continue
      }
      await replaceChildren(supabase, row.id, input)
      updated++
    } else {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          slug: input.slug,
          title: input.title,
          desc: input.desc,
          category_id: input.category_id,
          level: input.level,
          tier: input.tier,
          credits: input.credits,
          price: input.price,
          icon: input.icon,
          cover: input.cover,
          rating: input.rating,
          students: input.students,
          lessons: input.lessons,
          hours: input.hours,
          certificate: input.certificate,
          lifetime: input.lifetime,
          instructor_id: input.instructor_id,
          published: input.published,
        })
        .select('id')
        .single()
      if (error || !data) {
        failed.push(`${input.title}: ${error?.message ?? 'ไม่ทราบสาเหตุ'}`)
        continue
      }
      await replaceChildren(supabase, data.id, input)
      created++
    }
  }

  await logAction(
    identity,
    'import',
    'courses',
    null,
    `เพิ่ม ${created} · อัปเดต ${updated} · ผิดพลาด ${failed.length}`,
    undefined,
    { created, updated, failed: failed.length }
  )
  revalidatePublic()

  const parts = [
    created ? `เพิ่มใหม่ ${created}` : '',
    updated ? `อัปเดต ${updated}` : '',
    failed.length ? `ผิดพลาด ${failed.length}` : '',
  ].filter(Boolean)
  return {
    ok: failed.length === 0,
    message: parts.length ? `นำเข้าเสร็จ: ${parts.join(' · ')}` : 'ไม่มีรายการที่นำเข้า',
  }
}

/* ---------------- instructors ---------------- */

export async function saveInstructorAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const identity = await requireAdmin()

  const id = String(formData.get('id') ?? '')
  let targetId = id
  const parsed = instructorSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    title: String(formData.get('title') ?? ''),
    experience: String(formData.get('experience') ?? ''),
    students: String(formData.get('students') ?? '0'),
    avatar: String(formData.get('avatar') ?? '👨‍🏫'),
  })
  if (!parsed.success) {
    return {
      ok: false,
      message: 'ข้อมูลไม่ถูกต้อง',
      errors: fieldErrors(parsed.error as z.ZodError),
    }
  }
  const input: InstructorInput = parsed.data
  const supabase = await serverSupabase()

  if (id) {
    const { error } = await supabase
      .from('instructors')
      .update(input)
      .eq('id', id)
    if (error) return { ok: false, message: `บันทึกไม่สำเร็จ: ${error.message}` }
    await logAction(identity, 'update', 'instructors', id, input.name)
  } else {
    const key = slugify(formData.get('key') ? String(formData.get('key')) : input.name)
    const { data, error } = await supabase
      .from('instructors')
      .insert({ ...input, key, sort_order: 999 })
      .select('id')
      .single()
    if (error || !data) {
      return { ok: false, message: `เพิ่มไม่สำเร็จ: ${error?.message ?? 'ไม่ทราบสาเหตุ'}` }
    }
    targetId = data.id
    await logAction(identity, 'create', 'instructors', targetId, input.name)
  }

  revalidatePublic()
  return { ok: true, message: `บันทึกผู้สอน "${input.name}" แล้ว`, id: targetId }
}

export async function deleteInstructorAction(formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const identity = await requireAdmin()

  const id = String(formData.get('id') ?? '')
  if (!id) return { ok: false, message: 'ไม่พบรหัสผู้สอน' }

  const supabase = await serverSupabase()
  const { count } = await supabase
    .from('courses')
    .select('id', { count: 'exact', head: true })
    .eq('instructor_id', id)

  if ((count ?? 0) > 0) {
    return {
      ok: false,
      message: `ลบผู้สอนนี้ไม่ได้ ยังมี ${count} คอร์สที่สอนอยู่ — คอร์สเหล่านั้นจะถูกตั้งเป็นไม่มีผู้สอน`,
    }
  }

  const { data: before } = await supabase
    .from('instructors')
    .select('name')
    .eq('id', id)
    .maybeSingle()
  const { error } = await supabase.from('instructors').delete().eq('id', id)
  if (error) return { ok: false, message: `ลบไม่สำเร็จ: ${error.message}` }

  await logAction(identity, 'delete', 'instructors', id, before?.name ?? id, before)
  revalidatePublic()
  return { ok: true, message: `ลบ "${before?.name ?? 'ผู้สอน'}" แล้ว` }
}

/* ---------------- plans ---------------- */

export async function savePlanAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const identity = await requireAdmin()

  const parsed = planSchema.safeParse({
    code: String(formData.get('code') ?? ''),
    name: String(formData.get('name') ?? ''),
    price: String(formData.get('price') ?? '0'),
    quota: String(formData.get('quota') ?? '-1'),
    max_tier: String(formData.get('max_tier') ?? '1'),
    feats: asList(formData.get('feats')),
    sort_order: String(formData.get('sort_order') ?? '0'),
  })
  if (!parsed.success) {
    return {
      ok: false,
      message: 'ข้อมูลไม่ถูกต้อง',
      errors: fieldErrors(parsed.error as z.ZodError),
    }
  }
  const input: PlanInput = parsed.data
  const supabase = await serverSupabase()

  const { data: existing } = await supabase
    .from('plans')
    .select('code, name')
    .eq('code', input.code)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from('plans').update(input).eq('code', input.code)
    if (error) return { ok: false, message: `บันทึกไม่สำเร็จ: ${error.message}` }
    await logAction(identity, 'update', 'plans', input.code, input.name, existing, input)
  } else {
    const { error } = await supabase.from('plans').insert(input)
    if (error) return { ok: false, message: `เพิ่มไม่สำเร็จ: ${error.message}` }
    await logAction(identity, 'create', 'plans', input.code, input.name, undefined, input)
  }

  revalidatePublic()
  return { ok: true, message: `บันทึกแพ็กเกจ "${input.name}" แล้ว` }
}

export async function deletePlanAction(formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const identity = await requireAdmin()

  const code = String(formData.get('code') ?? '')
  if (!code) return { ok: false, message: 'ไม่พบรหัสแพ็กเกจ' }

  const supabase = await serverSupabase()
  const { data: before } = await supabase
    .from('plans')
    .select('name')
    .eq('code', code)
    .maybeSingle()

  const { error } = await supabase.from('plans').delete().eq('code', code)
  if (error) return { ok: false, message: `ลบไม่สำเร็จ: ${error.message}` }

  await logAction(identity, 'delete', 'plans', code, before?.name ?? code, before)
  revalidatePublic()
  return { ok: true, message: `ลบแพ็กเกจ "${before?.name ?? code}" แล้ว` }
}

/* ---------------- categories ---------------- */

export async function saveCategoryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const identity = await requireAdmin()

  const id = String(formData.get('id') ?? '')
  const parsed = categorySchema.safeParse({
    name: String(formData.get('name') ?? ''),
    slug: String(formData.get('slug') ?? '').trim() || slugify(String(formData.get('name') ?? '')),
    sort_order: String(formData.get('sort_order') ?? '0'),
  })
  if (!parsed.success) {
    return { ok: false, message: 'ข้อมูลไม่ถูกต้อง', errors: fieldErrors(parsed.error as z.ZodError) }
  }
  const input: CategoryInput = parsed.data
  const supabase = await serverSupabase()

  if (id) {
    const { error } = await supabase.from('categories').update(input).eq('id', id)
    if (error) return { ok: false, message: `บันทึกไม่สำเร็จ: ${error.message}` }
    await logAction(identity, 'update', 'categories', id, input.name)
  } else {
    const { data, error } = await supabase
      .from('categories')
      .insert(input)
      .select('id')
      .single()
    if (error || !data) return { ok: false, message: `เพิ่มไม่สำเร็จ: ${error?.message ?? ''}` }
    await logAction(identity, 'create', 'categories', data.id, input.name)
  }

  revalidatePublic()
  return { ok: true, message: `บันทึกหมวดหมู่ "${input.name}" แล้ว` }
}

export async function deleteCategoryAction(formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const identity = await requireAdmin()

  const id = String(formData.get('id') ?? '')
  if (!id) return { ok: false, message: 'ไม่พบรหัสหมวดหมู่' }

  const supabase = await serverSupabase()
  const { count } = await supabase
    .from('courses')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)

  if ((count ?? 0) > 0) {
    return {
      ok: false,
      message: `ลบหมวดหมู่นี้ไม่ได้ ยังมี ${count} คอร์สอยู่ในหมวด — กรุณาย้ายคอร์สออกก่อน`,
    }
  }

  const { data: before } = await supabase
    .from('categories')
    .select('name')
    .eq('id', id)
    .maybeSingle()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { ok: false, message: `ลบไม่สำเร็จ: ${error.message}` }

  await logAction(identity, 'delete', 'categories', id, before?.name ?? id, before)
  revalidatePublic()
  return { ok: true, message: `ลบหมวดหมู่ "${before?.name ?? id}" แล้ว` }
}

export async function reorderCategoriesAction(formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  await requireAdmin()

  const order = asList(formData.get('order'))
  const supabase = await serverSupabase()

  for (let i = 0; i < order.length; i++) {
    await supabase.from('categories').update({ sort_order: i }).eq('id', order[i])
  }

  revalidatePublic()
  return { ok: true, message: 'จัดลำดับหมวดหมู่แล้ว' }
}

/* ---------------- settings ---------------- */

export async function saveBankAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const identity = await requireAdmin()

  const parsed = bankSettingsSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    account: String(formData.get('account') ?? ''),
    promptpay: String(formData.get('promptpay') ?? ''),
  })
  if (!parsed.success) {
    return { ok: false, message: 'ข้อมูลบัญชีไม่ถูกต้อง', errors: fieldErrors(parsed.error as z.ZodError) }
  }

  const supabase = await serverSupabase()
  const { data: before } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'bank')
    .maybeSingle()

  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'bank', value: parsed.data as never })
  if (error) return { ok: false, message: `บันทึกไม่สำเร็จ: ${error.message}` }

  await logAction(identity, 'update', 'settings', 'bank', 'ข้อมูลธนาคาร', before?.value, parsed.data)
  revalidatePublic()
  return { ok: true, message: 'บันทึกข้อมูลธนาคารแล้ว' }
}

export async function saveSiteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const identity = await requireAdmin()

  const parsed = siteSettingsSchema.safeParse({
    headline: String(formData.get('headline') ?? ''),
    subline: String(formData.get('subline') ?? ''),
    ctaPrimary: String(formData.get('ctaPrimary') ?? ''),
    ctaSecondary: String(formData.get('ctaSecondary') ?? ''),
    maintenance: asBool(formData.get('maintenance')),
  })
  if (!parsed.success) {
    return { ok: false, message: 'ข้อมูลไม่ถูกต้อง', errors: fieldErrors(parsed.error as z.ZodError) }
  }

  const supabase = await serverSupabase()
  const { data: before } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'site')
    .maybeSingle()

  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'site', value: parsed.data as never })
  if (error) return { ok: false, message: `บันทึกไม่สำเร็จ: ${error.message}` }

  await logAction(identity, 'update', 'settings', 'site', 'ข้อความเว็บไซต์', before?.value, parsed.data)
  revalidatePublic()
  return { ok: true, message: 'บันทึกข้อความเว็บไซต์แล้ว' }
}
