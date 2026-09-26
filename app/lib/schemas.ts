import { z } from 'zod'
import { COVER_TOKENS } from './covers'

export const THAI_LEVELS = ['ง่าย', 'ปานกลาง', 'ยาก'] as const
export const FILE_TYPES = ['PDF', 'ZIP', 'XLSX', 'CSV', 'FIG', 'DOCX', 'SQL', 'YML', 'DB'] as const

const slug = z
  .string()
  .min(1, 'ต้องมี slug')
  .max(80, 'slug ยาวเกินไป')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug ใช้ได้เฉพาะ a-z 0-9 และขีดกลาง')

const emoji = z.string().min(1, 'ต้องมีไอคอน').max(8, 'ไอคอนยาวเกินไป')

export const syllabusItemSchema = z.object({
  n: z.coerce.number().int().min(1, 'บทต้องเริ่มที่ 1'),
  title: z.string().min(1, 'ต้องมีชื่อบท'),
  duration: z.string().min(1, 'ต้องระบุความยาว'),
})

export const fileItemSchema = z.object({
  name: z.string().min(1, 'ต้องมีชื่อไฟล์'),
  size: z.string().min(1, 'ต้องระบุขนาดไฟล์'),
  type: z.enum(FILE_TYPES, { message: 'ชนิดไฟล์ไม่ถูกต้อง' }),
})

export const courseSchema = z.object({
  title: z.string().min(1, 'ต้องมีชื่อคอร์ส').max(120, 'ชื่อยาวเกินไป'),
  slug,
  desc: z.string().min(1, 'ต้องมีคำอธิบาย').max(600, 'คำอธิบายยาวเกินไป'),
  category_id: z.string().uuid('ต้องเลือกหมวดหมู่'),
  level: z.enum(THAI_LEVELS, { message: 'ระดับไม่ถูกต้อง' }),
  tier: z.coerce.number().int().min(1, 'Tier ต้อง 1-3').max(3, 'Tier ต้อง 1-3'),
  credits: z.coerce.number().int().min(1, 'เครดิตต้องมากกว่า 0').max(20, 'เครดิตสูงเกินไป'),
  price: z.coerce.number().int().min(0, 'ราคาต้องไม่ติดลบ').max(1000000, 'ราคาสูงเกินไป'),
  icon: emoji,
  cover: z.enum(COVER_TOKENS as [string, ...string[]], { message: 'เลือกสีพื้นหลังไม่ถูกต้อง' }),
  rating: z.coerce.number().min(0, 'คะแนนต้อง 0-5').max(5, 'คะแนนต้อง 0-5'),
  students: z.coerce.number().int().min(0, 'จำนวนผู้เรียนต้องไม่ติดลบ'),
  lessons: z.coerce.number().int().min(0, 'จำนวนบทเรียนต้องไม่ติดลบ'),
  hours: z.coerce.number().int().min(0, 'จำนวนชั่วโมงต้องไม่ติดลบ'),
  certificate: z.coerce.boolean().default(false),
  lifetime: z.coerce.boolean().default(false),
  instructor_id: z.string().uuid('ต้องเลือกผู้สอน'),
  published: z.coerce.boolean().default(false),
  topics: z.array(z.string().min(1, 'หัวข้อต้องไม่ว่าง')).max(20, 'หัวข้อมากเกินไป').default([]),
  syllabus: z.array(syllabusItemSchema).max(60, 'หลักสูตรยาวเกินไป').default([]),
  files: z.array(fileItemSchema).max(40, 'ไฟล์ประกอบมากเกินไป').default([]),
})

export const instructorSchema = z.object({
  name: z.string().min(1, 'ต้องมีชื่อผู้สอน').max(80, 'ชื่อยาวเกินไป'),
  title: z.string().min(1, 'ต้องระบุตำแหน่ง').max(80, 'ตำแหน่งยาวเกินไป'),
  experience: z.string().min(1, 'ต้องระบุประสบการณ์').max(60, 'ข้อความยาวเกินไป'),
  students: z.coerce.number().int().min(0, 'จำนวนผู้เรียนต้องไม่ติดลบ'),
  avatar: emoji,
})

export const planSchema = z.object({
  code: z
    .string()
    .min(2, 'รหัสแพ็กเกจสั้นเกินไป')
    .max(20, 'รหัสแพ็กเกจยาวเกินไป')
    .regex(/^[a-z0-9-]+$/, 'รหัสแพ็กเกจใช้ได้เฉพาะ a-z 0-9 และขีดกลาง'),
  name: z.string().min(1, 'ต้องมีชื่อแพ็กเกจ').max(40, 'ชื่อยาวเกินไป'),
  price: z.coerce.number().int().min(0, 'ราคาต้องไม่ติดลบ').max(100000, 'ราคาสูงเกินไป'),
  quota: z.coerce.number().int().refine(v => v === -1 || v > 0, 'โควตาต้องเป็น -1 (ไม่จำกัด) หรือมากกว่า 0'),
  max_tier: z.coerce.number().int().min(1, 'Tier ต้อง 1-3').max(3, 'Tier ต้อง 1-3'),
  feats: z.array(z.string().min(1, 'สิทธิ์ต้องไม่ว่าง')).max(20, 'สิทธิ์มากเกินไป').default([]),
  sort_order: z.coerce.number().int().min(0).default(0),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'ต้องมีชื่อหมวดหมู่').max(40, 'ชื่อยาวเกินไป'),
  slug,
  sort_order: z.coerce.number().int().min(0).default(0),
})

export const bankSettingsSchema = z.object({
  name: z.string().min(1, 'ต้องมีชื่อผู้รับเงิน').max(80, 'ชื่อยาวเกินไป'),
  account: z.string().min(1, 'ต้องมีเลขบัญชี').max(40, 'เลขบัญชียาวเกินไป'),
  promptpay: z
    .string()
    .min(1, 'ต้องมีเลขพร้อมเพย์')
    .max(20, 'เลขพร้อมเพย์ยาวเกินไป')
    .regex(/^[\d-]+$/, 'เลขพร้อมเพย์ต้องเป็นตัวเลขและขีด'),
})

export const siteSettingsSchema = z.object({
  headline: z.string().min(1, 'ต้องมีพาดหัว').max(120, 'พาดหัวยาวเกินไป'),
  subline: z.string().min(1, 'ต้องมีคำอธิบาย').max(300, 'คำอธิบายยาวเกินไป'),
  ctaPrimary: z.string().min(1, 'ต้องมีข้อความปุ่ม').max(40, 'ข้อความยาวเกินไป'),
  ctaSecondary: z.string().min(1, 'ต้องมีข้อความปุ่ม').max(40, 'ข้อความยาวเกินไป'),
  maintenance: z.coerce.boolean().default(false),
})

export type CourseInput = z.infer<typeof courseSchema>
export type InstructorInput = z.infer<typeof instructorSchema>
export type PlanInput = z.infer<typeof planSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type BankSettings = z.infer<typeof bankSettingsSchema>
export type SiteSettings = z.infer<typeof siteSettingsSchema>

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    if (!out[key]) out[key] = issue.message
  }
  return out
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
