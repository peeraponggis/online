'use client'

import { useState } from 'react'
import Link from 'next/link'

const LINKS = [
  { href: '/courses', label: 'คอร์สทั้งหมด' },
  { href: '/plans', label: 'แพ็กเกจ' },
  { href: '/about', label: 'เกี่ยวกับเรา' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 shrink-0">
          <span className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg grid place-items-center text-white font-bold text-lg">
            L
          </span>
          <span className="text-xl font-bold text-emerald-700 hidden sm:block">คอร์สออนไลน์</span>
        </Link>

        <nav className="hidden md:flex space-x-8" aria-label="เมนูหลัก">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium transition-colors"
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium transition-colors"
          >
            สมัครสมาชิก
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          aria-label="เปิดเมนู"
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="md:hidden w-10 h-10 grid place-items-center rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
        >
          <span className="text-xl leading-none">{open ? '✕' : '☰'}</span>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="เมนูมือถือ"
          className="md:hidden border-t border-emerald-100 bg-white px-4 py-3"
        >
          <ul className="flex flex-col gap-1">
            {LINKS.map(l => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 px-3 rounded-lg text-gray-700 hover:bg-emerald-50 font-medium"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-emerald-100 flex gap-2">
            <button
              type="button"
              className="flex-1 px-4 py-2 rounded-lg text-emerald-700 border border-emerald-300 font-medium"
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              className="flex-1 px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium"
            >
              สมัครสมาชิก
            </button>
          </div>
        </nav>
      )}
    </header>
  )
}
