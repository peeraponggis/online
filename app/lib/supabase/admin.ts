import 'server-only'
import { serverSupabase } from './server'
import { isSupabaseConfigured } from './client'

export interface AdminIdentity {
  userId: string
  email: string
}

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = await serverSupabase()

  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData?.user) return null

  // RLS บนตาราง admins อนุญาตให้แอดมินอ่านแถวของตัวเองเท่านั้น
  const { data: row, error: rowErr } = await supabase
    .from('admins')
    .select('user_id, email')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (rowErr || !row) return null
  return { userId: String(row.user_id), email: String(row.email) }
}

export async function requireAdmin(): Promise<AdminIdentity> {
  const identity = await getAdminIdentity()
  if (!identity) {
    const err = new Error('ไม่มีสิทธิ์เข้าใช้งานส่วนนี้') as Error & { code?: string }
    err.code = 'FORBIDDEN'
    throw err
  }
  return identity
}
