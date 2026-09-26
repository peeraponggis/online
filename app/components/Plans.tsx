import Link from 'next/link'
import { PLANS, formatBaht } from '../lib/data'

export default function Plans() {
  return (
    <section id="plans" className="border-y border-emerald-100 bg-emerald-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-3 text-center text-3xl font-bold text-emerald-800">เลือกแพ็กเกจที่เหมาะกับคุณ</h2>
        <p className="mb-10 text-center text-emerald-600">แลกเครดิตเข้าคอร์สได้ทันที</p>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((p, i) => {
            const hot = i === 1
            return (
              <div
                key={p.code}
                className={
                  hot
                    ? 'relative rounded-2xl bg-gradient-to-b from-emerald-600 to-green-700 p-7 text-white shadow-xl'
                    : 'rounded-2xl border-2 border-emerald-100 bg-white p-7 shadow-sm'
                }
              >
                {hot && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-800 px-4 py-1 text-xs">
                    คุ้มค่าที่สุด
                  </span>
                )}

                <h3 className={`text-xl font-bold ${hot ? 'text-white' : 'text-emerald-800'}`}>
                  {p.name}
                </h3>
                <div className={`my-2 text-3xl font-extrabold ${hot ? 'text-white' : 'text-emerald-600'}`}>
                  {formatBaht(p.price)}
                  <span className={`text-sm font-normal ${hot ? 'text-emerald-100' : 'text-emerald-600'}`}>
                    /ปี
                  </span>
                </div>

                <ul className={`mb-5 space-y-1.5 text-sm ${hot ? 'text-white' : 'text-emerald-700'}`}>
                  {p.feats.map(f => (
                    <li key={f}>
                      <span className="mr-2">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/plans"
                  className={
                    hot
                      ? 'block w-full rounded-lg bg-white py-3 text-center font-bold text-emerald-700 transition-colors hover:bg-emerald-50'
                      : 'block w-full rounded-lg bg-emerald-100 py-3 text-center font-bold text-emerald-700 transition-colors hover:bg-emerald-200'
                  }
                >
                  เลือก {p.name}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
