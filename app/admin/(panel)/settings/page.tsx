import { getBankSetting, getSiteSetting } from '../../queries'
import SettingsForms from './SettingsForms'

export const metadata = { title: 'ตั้งค่าเว็บ — ผู้ดูแล' }

export default async function AdminSettingsPage() {
  const [bank, site] = await Promise.all([getBankSetting(), getSiteSetting()])

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-emerald-900">ตั้งค่าเว็บ</h1>
        <p className="mt-1 text-sm text-emerald-600">ข้อมูลธนาคารและข้อความบนหน้าแรก</p>
      </header>

      <SettingsForms bank={bank} site={site} />
    </div>
  )
}
