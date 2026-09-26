import { listAdminPlans } from '../../queries'
import PlanManager from './PlanManager'

export const metadata = { title: 'จัดการแพ็กเกจ — ผู้ดูแล' }

export default async function AdminPlansPage() {
  const plans = await listAdminPlans()
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-emerald-900">จัดการแพ็กเกจ</h1>
        <p className="mt-1 text-sm text-emerald-600">
          {plans.length} แพ็กเกจ — รหัสแพ็กเกจใช้เป็นกุญแจ ถ้าเปลี่ยนรหัสต้องแก้ข้อมูลอ้างอิงด้วย
        </p>
      </header>
      <PlanManager plans={plans} />
    </div>
  )
}
