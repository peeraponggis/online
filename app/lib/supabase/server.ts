import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { readEnv } from './env'

/**
 * client ฝั่ง server แบบไม่ผูก cookie — ใช้กับหน้า public
 * ไม่เรียก cookies() → หน้ายัง prerender เป็น static ได้ (เร็วและประหยัดบน Cloudflare)
 * RLS จะทำงานแบบ anonymous → เห็นเฉพาะ published เท่านั้น
 */
export function publicSupabase() {
  const env = readEnv()
  if (!env) throw new Error('Supabase ยังไม่ได้ตั้งค่า — ตรวจ .env.local')
  return createServerClient(env.url, env.anonKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  })
}

/**
 * client ฝั่ง server ที่ผูกกับ session ของผู้ใช้จริง (จาก cookie)
 * ใช้ anon key + JWT ของผู้ใช้ → RLS ทำงานเต็มที่ → เป็นชั้นป้องกันแรก
 * เรียก cookies() → หน้านี้เป็น dynamic โดยธรรมชาติ (ถูกต้องสำหรับหน้าแอดมิน)
 */
export async function serverSupabase() {
  const env = readEnv()
  if (!env) throw new Error('Supabase ยังไม่ได้ตั้งค่า — ตรวจ .env.local')
  const cookieStore = await cookies()

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(list) {
        try {
          for (const { name, value, options } of list) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // เรียกจาก Server Component ที่ render แล้ว — ข้ามไป ให้ middleware หรือ
          // Server Action เป็นผู้เซ็ต cookie แทน
        }
      },
    },
  })
}

/**
 * ใช้เฉพาะสคริปต์นอกแอป (seed, admin-create) เท่านั้น
 * ห้าม import จากโค้ดที่รันบนเว็บ — ข้าม RLS ทั้งหมด
 */
export function serviceRoleClient() {
  const env = readEnv()
  if (!env) throw new Error('Supabase ยังไม่ได้ตั้งค่า — ตรวจ .env.local')
  if (!env.serviceRoleKey) {
    throw new Error('ขาด SUPABASE_SERVICE_ROLE_KEY')
  }
  return createServerClient(env.url, env.serviceRoleKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  })
}
