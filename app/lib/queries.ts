import 'server-only'
import { isSupabaseConfigured } from './supabase/client'
import { publicSupabase } from './supabase/server'
import fileData from '../../data/courses.js'
import { coverClass, tokenFromClass } from './covers'
import type {
  BankInfo,
  CategoryRow,
  Course,
  CourseRow,
  InstructorRow,
  PlanRow,
  SiteSettings,
} from './types'

const FALLBACK: 'file' | 'db' = isSupabaseConfigured() ? 'db' : 'file'

export function dataSource(): 'file' | 'db' {
  return FALLBACK
}

interface Joined {
  course: CourseRow
  category: string | null
  instructor: InstructorRow | null
  topics: string[]
  syllabus: { n: number; title: string; duration: string }[]
  files: { name: string; size: string; type: string }[]
}

function flatten(rows: Joined[]): Course[] {
  return rows.map(r => ({
    id: r.course.id,
    slug: r.course.slug,
    title: r.course.title,
    desc: r.course.desc,
    category: r.category ?? 'ทั้งหมด',
    level: r.course.level,
    tier: r.course.tier as Course['tier'],
    credits: r.course.credits,
    price: r.course.price,
    icon: r.course.icon,
    cover: coverClass(r.course.cover),
    rating: Number(r.course.rating),
    students: r.course.students,
    lessons: r.course.lessons,
    hours: r.course.hours,
    certificate: r.course.certificate,
    lifetime: r.course.lifetime,
    instructor: r.instructor
      ? {
          name: r.instructor.name,
          title: r.instructor.title,
          experience: r.instructor.experience,
          students: r.instructor.students,
          avatar: r.instructor.avatar,
        }
      : { name: 'ทีมผู้สอน', title: 'ผู้สอน', experience: '-', students: 0, avatar: '👨‍🏫' },
    topics: r.topics,
    syllabus: [...r.syllabus].sort((a, b) => a.n - b.n),
    files: r.files,
  }))
}

const COURSE_SELECT = `
  id, legacy_id, slug, title, desc, category_id, level, tier, credits, price,
  icon, cover, rating, students, lessons, hours, certificate, lifetime,
  instructor_id, published, sort_order, created_at, updated_at,
  category:categories(name),
  instructor:instructors(key, name, title, experience, students, avatar),
  course_topics(topic, sort_order),
  course_syllabus(n, title, duration, sort_order),
  course_files(name, size, type, sort_order)
`

function toJoined(row: CourseRow & Record<string, unknown>): Joined {
  const cat = row.category as { name: string } | { name: string }[] | null
  const ins = row.instructor as InstructorRow | InstructorRow[] | null
  const topics = (row.course_topics as { topic: string; sort_order: number }[] | null) ?? []
  const syllabus =
    (row.course_syllabus as { n: number; title: string; duration: string; sort_order: number }[] | null) ??
    []
  const files =
    (row.course_files as { name: string; size: string; type: string; sort_order: number }[] | null) ?? []

  return {
    course: row,
    category: Array.isArray(cat) ? (cat[0]?.name ?? null) : (cat?.name ?? null),
    instructor: Array.isArray(ins) ? (ins[0] ?? null) : ins,
    topics: [...topics].sort((a, b) => a.sort_order - b.sort_order).map(t => t.topic),
    syllabus: syllabus.map(s => ({ n: s.n, title: s.title, duration: s.duration })),
    files: [...files]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(f => ({ name: f.name, size: f.size, type: f.type })),
  }
}

function fromFile(): Course[] {
  return fileData.COURSES.map(c => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    desc: c.desc,
    category: c.category,
    level: c.level,
    tier: c.tier as Course['tier'],
    credits: c.credits,
    price: c.price,
    icon: c.icon,
    cover: coverClass(tokenFromClass(c.cover)),
    rating: c.rating,
    students: c.students,
    lessons: c.lessons,
    hours: c.hours,
    certificate: c.certificate,
    lifetime: c.lifetime,
    instructor: c.instructor,
    topics: c.topics,
    syllabus: c.syllabus,
    files: c.files,
  }))
}

export async function getCourses(opts: { publishedOnly?: boolean } = {}): Promise<Course[]> {
  if (FALLBACK === 'file') return fromFile()
  try {
    const supabase = publicSupabase()
    const { data, error } = await supabase
      .from('courses')
      .select(COURSE_SELECT)
      .eq('published', opts.publishedOnly ?? true)
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true })
    if (error || !data) return fromFile()
    return flatten(data.map(r => toJoined(r as CourseRow & Record<string, unknown>)))
  } catch {
    return fromFile()
  }
}

export async function getCourseBySlug(slug: string): Promise<Course | undefined> {
  const all = await getCourses({ publishedOnly: false })
  return all.find(c => c.slug === slug)
}

export async function getCourseStats(): Promise<{ total: number; published: number }> {
  if (FALLBACK === 'file') {
    return { total: fileData.COURSES.length, published: fileData.COURSES.length }
  }
  try {
    const supabase = publicSupabase()
    const [{ count: total }, { count: published }] = await Promise.all([
      supabase.from('courses').select('id', { count: 'exact', head: true }),
      supabase.from('courses').select('id', { count: 'exact', head: true }).eq('published', true),
    ])
    return { total: total ?? 0, published: published ?? 0 }
  } catch {
    const list = await getCourses({ publishedOnly: false })
    return { total: list.length, published: list.length }
  }
}

export async function getCategories(): Promise<CategoryRow[]> {
  if (FALLBACK === 'file') {
    return fileData.CATEGORIES.filter(c => c !== 'ทั้งหมด').map((name, i) => ({
      id: `file-${i}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sort_order: i,
      created_at: '',
    }))
  }
  const supabase = publicSupabase()
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, sort_order, created_at')
    .order('sort_order')
  return (data as CategoryRow[]) ?? []
}

export async function getCategoryNames(): Promise<string[]> {
  const rows = await getCategories()
  return rows.map(r => r.name)
}

export async function getInstructors(): Promise<InstructorRow[]> {
  if (FALLBACK === 'file') {
    return Object.entries(fileData.INSTRUCTORS).map(([key, v], i) => ({
      id: `file-${key}`,
      key,
      name: v.name,
      title: v.title,
      experience: v.experience,
      students: v.students,
      avatar: v.avatar,
      sort_order: i,
      created_at: '',
    }))
  }
  const supabase = publicSupabase()
  const { data } = await supabase
    .from('instructors')
    .select('id, key, name, title, experience, students, avatar, sort_order, created_at')
    .order('sort_order')
  return (data as InstructorRow[]) ?? []
}

export async function getPlans(): Promise<{ code: string; name: string; price: number; quota: number; maxTier: number; feats: string[] }[]> {
  if (FALLBACK === 'file') {
    return fileData.PLANS.map(p => ({
      code: p.code,
      name: p.name,
      price: p.price,
      quota: p.quota,
      maxTier: p.maxTier,
      feats: p.feats,
    }))
  }
  const supabase = publicSupabase()
  const { data } = await supabase
    .from('plans')
    .select('code, name, price, quota, max_tier, feats, sort_order')
    .order('sort_order')
  return ((data as PlanRow[]) ?? []).map(p => ({
    code: p.code,
    name: p.name,
    price: p.price,
    quota: p.quota,
    maxTier: p.max_tier,
    feats: Array.isArray(p.feats) ? p.feats : [],
  }))
}

export async function getBank(): Promise<BankInfo> {
  if (FALLBACK === 'file') return fileData.BANK
  const supabase = publicSupabase()
  const { data } = await supabase.from('settings').select('value').eq('key', 'bank').maybeSingle()
  const v = (data?.value ?? {}) as Partial<BankInfo>
  return {
    name: v.name ?? 'ชื่อบริษัท จำกัด',
    account: v.account ?? '',
    promptpay: v.promptpay ?? '',
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const fallback: SiteSettings = {
    headline: 'เรียนรู้ทุกสกิล อย่างเป็นธรรมชาติ',
    subline: 'คอร์สออนไลน์คุณภาพจากผู้สอนมืออาชีพ ด้วยธีมธรรมชาติ ให้คุณเรียนรู้อย่างสบายตา',
    ctaPrimary: 'เริ่มต้นเรียนฟรี',
    ctaSecondary: 'ดูแพ็กเกจ',
    maintenance: false,
  }
  if (FALLBACK === 'file') return fallback
  try {
    const supabase = publicSupabase()
    const { data } = await supabase.from('settings').select('value').eq('key', 'site').maybeSingle()
    return { ...fallback, ...((data?.value ?? {}) as Partial<SiteSettings>) }
  } catch {
    return fallback
  }
}
