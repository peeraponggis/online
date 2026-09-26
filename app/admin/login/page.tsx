import Link from 'next/link'
import LoginForm from './LoginForm'

export const metadata = { title: 'เข้าสู่ระบบแอดมิน — คอร์สออนไลน์' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-emerald-50 px-4">
      <div className="w-full max-w-[420px]">
        <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-xl font-bold text-white">
              L
            </div>
            <h1 className="text-xl font-bold text-emerald-800">เข้าสู่ระบบผู้ดูแล</h1>
            <p className="mt-1 text-sm text-emerald-600">จัดการคอร์ส แพ็กเกจ ผู้สอน และหมวดหมู่</p>
          </div>

          <LoginForm forcedError={error === 'forbidden' ? 'forbidden' : undefined} />
        </div>

        <p className="mt-4 text-center">
          <Link href="/" className="text-sm text-emerald-700 hover:underline">
            ← กลับหน้าเว็บ
          </Link>
        </p>
      </div>
    </main>
  )
}
