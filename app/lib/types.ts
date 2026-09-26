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
