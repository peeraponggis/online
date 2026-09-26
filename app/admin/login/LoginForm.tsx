'use client'

import { useActionState } from 'react'
import { signInAction, type ActionState } from '../actions'
import { Alert, inputClass } from '../../components/admin/ui'
import { SubmitButton } from '../../components/admin/SubmitButton'

const initial: ActionState = { ok: false, message: '' }

export default function LoginForm({ forcedError }: { forcedError?: string }) {
  const [state, action] = useActionState(signInAction, initial)

  return (
    <form action={action} className="space-y-4" noValidate>
      {forcedError && <Alert tone="error">บัญชีนี้ไม่มีสิทธิ์แอดมิน</Alert>}
      {state.message && <Alert tone={state.ok ? 'success' : 'error'}>{state.message}</Alert>}

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-emerald-800">
          อีเมล
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-emerald-800">
          รหัสผ่าน
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      <SubmitButton label="เข้าสู่ระบบ" className="w-full" />
    </form>
  )
}
