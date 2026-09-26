import { listAdminCategories, countCoursesPerCategory } from '../../queries'
import CategoryManager from './CategoryManager'

export const metadata = { title: 'จัดการหมวดหมู่ — ผู้ดูแล' }

export default async function AdminCategoriesPage() {
  const [categories, courseCounts] = await Promise.all([
    listAdminCategories(),
    countCoursesPerCategory(),
  ])

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-emerald-900">จัดการหมวดหมู่</h1>
        <p className="mt-1 text-sm text-emerald-600">
          {categories.length} หมวดหมู่ — ลบหมวดที่ยังมีคอร์สอยู่ไม่ได้
        </p>
      </header>

      <CategoryManager categories={categories} courseCounts={courseCounts} />
    </div>
  )
}
