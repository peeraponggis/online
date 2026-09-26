import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-emerald-900 text-emerald-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg grid place-items-center text-white font-bold">
                L
              </span>
              <span className="text-xl font-bold text-white">คอร์สออนไลน์</span>
            </div>
            <p className="text-emerald-300 text-sm">
              แพลตฟอร์มคอร์สออนไลน์ธีมธรรมชาติ เน้นความสบายตาในการอ่าน
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">คอร์ส</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/courses" className="hover:text-emerald-300 transition-colors">
                  คอร์สทั้งหมด
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-emerald-300 transition-colors">
                  คอร์สยอดนิยม
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-emerald-300 transition-colors">
                  คอร์สใหม่
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">แพ็กเกจ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/plans" className="hover:text-emerald-300 transition-colors">
                  Basic
                </Link>
              </li>
              <li>
                <Link href="/plans" className="hover:text-emerald-300 transition-colors">
                  Pro
                </Link>
              </li>
              <li>
                <Link href="/plans" className="hover:text-emerald-300 transition-colors">
                  Premium
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">ติดต่อเรา</h3>
            <ul className="space-y-2 text-sm">
              <li>อีเมล: hello@course.example</li>
              <li>โทร: 02-xxx-xxxx</li>
              <li>กรุงเทพมหานคร ประเทศไทย</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-800 mt-8 pt-8 text-center text-sm text-emerald-400">
          <p>© 2026 คอร์สออนไลน์ — ต้นแบบสาธิต · ไม่ใช่เว็บจริง</p>
        </div>
      </div>
    </footer>
  )
}
