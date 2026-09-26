import type { Metadata } from 'next'
import { Sarabun } from 'next/font/google'
import './globals.css'

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sarabun',
})

export const metadata: Metadata = {
  title: 'คอร์สออนไลน์ - LMS Platform',
  description: 'เรียนรู้ทุกสกิล อย่างเป็นธรรมชาติ คอร์สออนไลน์คุณภาพจากผู้สอนมืออาชีพ เข้าเรียนได้ทุกที่ทุกเวลา',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={sarabun.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
