import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ADMIN = ['/admin/login', '/admin/setup']

function env() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
}

export async function middleware(request: NextRequest) {
  const { url, anonKey } = env()

  if (!url || !anonKey) {
    // ยังไม่ได้ตั้งค่า Supabase -> ส่งไปหน้าที่อธิบาย ไม่ใช่หน้า login ที่จะล้ม
    // ต้องยกเว้น /admin/setup ด้วย ไม่งั้นจะแปะงค์วนเป็นลูปไม่รู้จบ
    if (request.nextUrl.pathname.startsWith('/admin') && !PUBLIC_ADMIN.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/admin/setup', request.url))
    }
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(list) {
        for (const { name, value } of list) request.cookies.set(name, value)
        response = NextResponse.next({ request })
        for (const { name, value, options } of list) response.cookies.set(name, value, options)
      },
    },
  })

  const { data } = await supabase.auth.getUser()
  const user = data?.user ?? null
  const path = request.nextUrl.pathname

  if (path.startsWith('/admin') && !PUBLIC_ADMIN.includes(path)) {
    if (!user) {
      const to = new URL('/admin/login', request.url)
      to.searchParams.set('next', path)
      return NextResponse.redirect(to)
    }

    // ตรวจว่าเป็นแอดมินจริงไหม — เข้าตาราง admins ที่ RLS จำกัดไว้เฉพาะแถวตัวเอง
    const { data: adminRow } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!adminRow) {
      await supabase.auth.signOut()
      const to = new URL('/admin/login', request.url)
      to.searchParams.set('error', 'forbidden')
      return NextResponse.redirect(to)
    }
  }

  if (path === '/admin/login' && user) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
