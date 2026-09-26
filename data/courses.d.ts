export { BANK, CATEGORIES, COURSES, INSTRUCTORS, PLANS }
export type { BankInfo, Course, Instructor, Plan } from '../app/lib/types'

import type { BankInfo, Course, Instructor, Plan } from '../app/lib/types'

declare const CATEGORIES: string[]
declare const INSTRUCTORS: Record<string, Instructor>
declare const COURSES: Course[]
declare const PLANS: Plan[]
declare const BANK: BankInfo
