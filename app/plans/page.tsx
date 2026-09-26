import Link from 'next/link'
import Plans from '../components/Plans'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getPlans } from '../lib/queries'
import { formatBaht } from '../lib/format'

export const revalidate = 300

export const metadata = {
  title: 'แพ็กเกจสมาชิก — คอร์สออนไลน์',
  description: 'แพ็กเกจสมาชิก 3 ระดับ แลกเครดิตเข้าคอร์สได้ทันที',
}

export default async function PlansPage() {
  const plans = await getPlans()

  return (
    <>
      <Header />

      <section className="py-10">
        <div className="mx-auto max-w-4xl px-4">
          <nav aria-label="เส้นทาง" className="mb-4 text-sm text-emerald-600">
            <Link href="/" className="hover:underline">
              หน้าแรก
            </Link>
            <span className="mx-2">/</span>
            <span className="text-emerald-800">แพ็กเกจ</span>
          </nav>
          <h1 className="mb-3 text-center text-3xl font-bold text-emerald-800">แพ็กเกจสมาชิก</h1>
          <p className="mb-10 text-center text-emerald-600">เลือกแบบที่เหมาะกับคุณ — แลกเครดิตเข้าคอร์สได้ทันที</p>
        </div>
      </section>

      <Plans plans={plans} />

      <section className="bg-white py-14">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-4 text-center text-2xl font-bold text-emerald-800">เปรียบเทียบสิทธิ์ตามระดับ</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-emerald-200 text-left">
                  <th className="py-3 pr-4 font-semibold text-emerald-700">แพ็กเกจ</th>
                  <th className="py-3 pr-4 font-semibold text-emerald-700">ราคา/ปี</th>
                  <th className="py-3 pr-4 font-semibold text-emerald-700">โควตาคอร์ส</th>
                  <th className="py-3 font-semibold text-emerald-700">เข้าถึง Tier</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(p => (
                  <tr key={p.code} className="border-b border-emerald-50">
                    <td className="py-3 pr-4 font-medium text-emerald-900">{p.name}</td>
                    <td className="py-3 pr-4 text-emerald-700">{formatBaht(p.price)} ฿</td>
                    <td className="py-3 pr-4 text-emerald-700">
                      {p.quota === -1 ? 'ไม่จำกัด' : `${p.quota} คอร์ส`}
                    </td>
                    <td className="py-3 text-emerald-700">Tier 1-{p.maxTier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
