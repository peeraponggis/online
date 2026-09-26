import 'server-only'
import { serverSupabase } from '../lib/supabase/server'
import { isSupabaseConfigured } from '../lib/supabase/client'
import { requireAdmin } from '../lib/supabase/admin'
import { coverClass } from '../lib/covers'
import type { AuditRow, CategoryRow, CourseRow, InstructorRow, PlanRow } from '../lib/types'

export interface AdminCourseRow extends CourseRow {
  categoryName: string | null
  instructorName: string | null
  topics: string[]
  syllabus: { n: number; title: string; duration: string }[]
  files: { name: string; size: string; type: string }[]
  coverClass: string
}

const LIST_SELECT = `
  id, legacy_id, slug, title, desc, category_id, level, tier, credits, price,
  icon, cover, rating, students, lessons, hours, certificate, lifetime,
  instructor_id, published, sort_order, created_at, updated_at,
  category:categories(name),
  instructor:instructors(name)
`

function shape(row: Record<string, unknown>): AdminCourseRow {
  const cat = row.category as { name: string } | { name: string }[] | null
  const ins = row.instructor as { name: string } | { name: string }[] | null
  const topics = (row.course_topics as { topic: string }[] | null) ?? []
  const syllabus =
    (row.course_syllabus as { n: number; title: string; duration: string }[] | null) ?? []
  const files = (row.course_files as { name: string; size: string; type: string }[] | null) ?? []

  return {
    ...(row as unknown as CourseRow),
    categoryName: Array.isArray(cat) ? (cat[0]?.name ?? null) : (cat?.name ?? null),
    instructorName: Array.isArray(ins) ? (ins[0]?.name ?? null) : (ins?.name ?? null),
    topics: topics.map(t => t.topic),
    syllabus: [...syllabus].sort((a, b) => a.n - b.n),
    files,
    coverClass: coverClass(String(row.cover)),
  }
}

export async function listAdminCourses(): Promise<AdminCourseRow[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = await serverSupabase()
  const { data, error } = await supabase
    .from('courses')
    .select(
      `${LIST_SELECT},
       course_topics(topic, sort_order),
       course_syllabus(n, title, duration, sort_order),
       course_files(name, size, type, sort_order)`
    )
    .order('updated_at', { ascending: false })

  if (error) return []
  return data.map(r => shape(r as Record<string, unknown>))
}

export async function getAdminCourse(id: string): Promise<AdminCourseRow | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = await serverSupabase()
  const { data, error } = await supabase
    .from('courses')
    .select(
      `${LIST_SELECT},
       course_topics(topic, sort_order),
       course_syllabus(n, title, duration, sort_order),
       course_files(name, size, type, sort_order)`
    )
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  return shape(data as Record<string, unknown>)
}

export async function listAdminCategories(): Promise<CategoryRow[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = await serverSupabase()
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, sort_order, created_at')
    .order('sort_order')
  return (data as CategoryRow[]) ?? []
}

export async function listAdminInstructors(): Promise<InstructorRow[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = await serverSupabase()
  const { data } = await supabase
    .from('instructors')
    .select('id, key, name, title, experience, students, avatar, sort_order, created_at')
    .order('sort_order')
  return (data as InstructorRow[]) ?? []
}

export async function countCoursesPerInstructor(): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  if (!isSupabaseConfigured()) return map
  const supabase = await serverSupabase()
  const { data } = await supabase.from('courses').select('instructor_id')
  for (const row of data ?? []) {
    if (!row.instructor_id) continue
    map.set(row.instructor_id, (map.get(row.instructor_id) ?? 0) + 1)
  }
  return map
}

export async function listAdminPlans(): Promise<PlanRow[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = await serverSupabase()
  const { data } = await supabase
    .from('plans')
    .select('code, name, price, quota, max_tier, feats, sort_order')
    .order('sort_order')
  return (data as PlanRow[]) ?? []
}

export async function countCoursesPerCategory(): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  if (!isSupabaseConfigured()) return map
  const supabase = await serverSupabase()
  const { data } = await supabase.from('courses').select('category_id')
  for (const row of data ?? []) {
    if (!row.category_id) continue
    map.set(row.category_id, (map.get(row.category_id) ?? 0) + 1)
  }
  return map
}

export async function listAuditLog(limit = 12): Promise<AuditRow[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = await serverSupabase()
  const { data } = await supabase
    .from('audit_log')
    .select('id, actor_id, action, entity, entity_id, label, at')
    .order('at', { ascending: false })
    .limit(limit)
  return (data as AuditRow[]) ?? []
}

export async function getBankSetting(): Promise<{ name: string; account: string; promptpay: string }> {
  const fallback = { name: '', account: '', promptpay: '' }
  if (!isSupabaseConfigured()) return fallback
  const supabase = await serverSupabase()
  const { data } = await supabase.from('settings').select('value').eq('key', 'bank').maybeSingle()
  const v = (data?.value ?? {}) as Record<string, string>
  return {
    name: v.name ?? '',
    account: v.account ?? '',
    promptpay: v.promptpay ?? '',
  }
}

export async function getSiteSetting(): Promise<{
  headline: string
  subline: string
  ctaPrimary: string
  ctaSecondary: string
  maintenance: boolean
}> {
  const fallback = {
    headline: '',
    subline: '',
    ctaPrimary: '',
    ctaSecondary: '',
    maintenance: false,
  }
  if (!isSupabaseConfigured()) return fallback
  const supabase = await serverSupabase()
  const { data } = await supabase.from('settings').select('value').eq('key', 'site').maybeSingle()
  return { ...fallback, ...((data?.value ?? {}) as typeof fallback) }
}

export { requireAdmin }
