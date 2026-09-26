import Link from 'next/link'

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-20">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="text-6xl mb-3">🌿</div>
        <h1 className="text-4xl md:text-5xl font-bold text-emerald-800 mb-6">
          เรียนรู้ทุกสกิล อย่างเป็นธรรมชาติ
        </h1>
        <p className="text-xl text-emerald-700 mb-8 max-w-2xl mx-auto">
          คอร์สออนไลน์คุณภาพจากผู้สอนมืออาชีพ ด้วยธีมธรรมชาติ ให้คุณเรียนรู้อย่างสบายตา
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/courses"
            className="px-8 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors shadow-lg"
          >
            เริ่มต้นเรียนฟรี
          </Link>
          <Link
            href="/plans"
            className="px-8 py-3 bg-white text-emerald-700 border-2 border-emerald-400 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
          >
            ดูแพ็กเกจ
          </Link>
        </div>
      </div>
    </section>
  )
}
