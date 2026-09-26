import { createBrowserClient } from '@supabase/ssr'
import { readEnv, type SupabaseEnv } from './env'

export function readSupabaseEnv(): SupabaseEnv | null {
  return readEnv()
}

export function isSupabaseConfigured(): boolean {
  return readEnv() !== null
}

export function browserSupabase() {
  const env = readEnv()
  if (!env) throw new Error('Supabase ยังไม่ได้ตั้งค่า — ตรวจ .env.local')
  return createBrowserClient(env.url, env.anonKey)
}
