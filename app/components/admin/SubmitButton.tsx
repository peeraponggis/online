'use client'

import { useRef } from 'react'
import { useFormStatus } from 'react-dom'

export function SubmitButton({
  label,
  pendingLabel = 'กำลังบันทึก...',
  variant = 'primary',
  name,
  value,
  formNoValidate,
  className = '',
  disabled = false,
}: {
  label: string
  pendingLabel?: string
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  name?: string
  value?: string
  formNoValidate?: boolean
  className?: string
  disabled?: boolean
}) {
  const { pending } = useFormStatus()
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300',
    secondary: 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
    ghost: 'text-emerald-700 hover:bg-emerald-50 disabled:opacity-50',
  }
  return (
    <button
      type="submit"
      name={name}
      value={value}
      formNoValidate={formNoValidate}
      disabled={pending || disabled}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

export function ConfirmSubmit({
  label,
  message,
  requireText,
  pendingLabel = 'กำลังลบ...',
  className = 'rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-red-300',
}: {
  label: string
  message: string
  requireText?: string
  pendingLabel?: string
  className?: string
}) {
  const { pending } = useFormStatus()
  const ref = useRef<HTMLInputElement>(null)

  return (
    <form
      onSubmit={e => {
        if (requireText && ref.current?.value.trim() !== requireText) {
          e.preventDefault()
          window.alert(`กรุณาพิมพ์ "${requireText}" เพื่อยืนยัน`)
        }
      }}
      className="flex flex-wrap items-end gap-2"
    >
      {requireText && (
        <div>
          <label htmlFor={`confirm-${requireText}`} className="mb-1 block text-xs text-red-800">
            พิมพ์ <strong>{requireText}</strong> เพื่อยืนยัน
          </label>
          <input
            id={`confirm-${requireText}`}
            ref={ref}
            name="confirm"
            className="w-28 rounded-lg border border-red-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
      )}
      <button type="submit" disabled={pending} className={className} title={message}>
        {pending ? pendingLabel : label}
      </button>
    </form>
  )
}
