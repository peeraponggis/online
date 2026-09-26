export type Level = 'ง่าย' | 'ปานกลาง' | 'ยาก'

export type Tier = 1 | 2 | 3

export interface Instructor {
  name: string
  title: string
  experience: string
  students: number
  avatar: string
}

export interface SyllabusItem {
  n: number
  title: string
  duration: string
}

export interface CourseFile {
  name: string
  size: string
  type: string
}

export interface Course {
  id: string
  slug: string
  title: string
  desc: string
  category: string
  level: Level
  tier: Tier
  credits: number
  price: number
  icon: string
  cover: string
  rating: number
  students: number
  lessons: number
  hours: number
  certificate: boolean
  lifetime: boolean
  instructor: Instructor
  topics: string[]
  syllabus: SyllabusItem[]
  files: CourseFile[]
}

export interface Plan {
  code: string
  name: string
  price: number
  quota: number
  maxTier: number
  feats: string[]
}

export interface BankInfo {
  name: string
  account: string
  promptpay: string
}

export const THAI_LEVELS: Level[] = ['ง่าย', 'ปานกลาง', 'ยาก']

export const ALL_CATEGORIES = 'ทั้งหมด'

export const LEVEL_OPTIONS: Level[] = THAI_LEVELS

/* ---------- รูปแบบข้อมูลจากฐานข้อมูล ---------- */

export interface CategoryRow {
  id: string
  name: string
  slug: string
  sort_order: number
  created_at: string
}

export interface InstructorRow {
  id: string
  key: string
  name: string
  title: string
  experience: string
  students: number
  avatar: string
  sort_order: number
  created_at: string
}

export interface CourseRow {
  id: string
  legacy_id: string | null
  slug: string
  title: string
  desc: string
  category_id: string | null
  level: Level
  tier: number
  credits: number
  price: number
  icon: string
  cover: string
  rating: number
  students: number
  lessons: number
  hours: number
  certificate: boolean
  lifetime: boolean
  instructor_id: string | null
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PlanRow {
  code: string
  name: string
  price: number
  quota: number
  max_tier: number
  feats: string[]
  sort_order: number
}

export interface AuditRow {
  id: number
  actor_id: string | null
  action: string
  entity: string
  entity_id: string | null
  label: string
  at: string
}

export interface SiteSettings {
  headline: string
  subline: string
  ctaPrimary: string
  ctaSecondary: string
  maintenance: boolean
}
