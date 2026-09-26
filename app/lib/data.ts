import data from '../../data/courses.js'
import { ALL_CATEGORIES, THAI_LEVELS } from './types'
import type { BankInfo, Course, Instructor, Plan } from './types'

export const CATEGORIES: string[] = data.CATEGORIES
export const INSTRUCTORS: Record<string, Instructor> = data.INSTRUCTORS
export const COURSES: Course[] = data.COURSES
export const PLANS: Plan[] = data.PLANS
export const BANK: BankInfo = data.BANK

export const COURSE_CATEGORIES: string[] = CATEGORIES.filter(c => c !== ALL_CATEGORIES)

export function getCourse(id: string): Course | undefined {
  return COURSES.find(c => c.id === id)
}

export function getCourseBySlug(slug: string): Course | undefined {
  return COURSES.find(c => c.slug === slug)
}

export function formatBaht(n: number): string {
  return Number(n).toLocaleString('th-TH')
}

export function coursesByCategory(category: string): Course[] {
  if (category === ALL_CATEGORIES) return COURSES
  return COURSES.filter(c => c.category === category)
}

export function coursesByLevel(level: string): Course[] {
  if (level === ALL_CATEGORIES) return COURSES
  return COURSES.filter(c => c.level === level)
}

export function isValidLevel(value: string): boolean {
  return (THAI_LEVELS as string[]).includes(value)
}

export const AVERAGE_RATING =
  Math.round((COURSES.reduce((s, c) => s + c.rating, 0) / COURSES.length) * 10) / 10

export const TOTAL_STUDENTS = COURSES.reduce((s, c) => s + c.students, 0)
