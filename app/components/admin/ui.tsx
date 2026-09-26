export function Alert({
  tone = 'error',
  children,
}: {
  tone?: 'error' | 'success' | 'info' | 'warn'
  children: React.ReactNode
}) {
  const tones = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    info: 'bg-sky-50 border-sky-200 text-sky-800',
    warn: 'bg-amber-50 border-amber-200 text-amber-800',
  }
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}
    >
      {children}
    </div>
  )
}

export function FieldShell({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-emerald-800">
        {label}
        {required && (
          <span className="ml-1 text-red-600" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="mt-1 text-xs text-emerald-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

export const inputClass =
  'w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-900 placeholder:text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200'

export const inputErrorClass =
  'w-full rounded-lg border border-red-400 bg-white px-3 py-2 text-sm text-emerald-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200'

export function Card({
  title,
  description,
  children,
  actions,
}: {
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
      <header className="flex items-start justify-between gap-4 border-b border-emerald-100 px-5 py-4">
        <div>
          <h2 className="font-bold text-emerald-900">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-emerald-600">{description}</p>}
        </div>
        {actions}
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="text-xs text-emerald-600">{label}</div>
      <div className="mt-1 text-3xl font-bold text-emerald-700">{value}</div>
      {hint && <div className="mt-1 text-xs text-emerald-500">{hint}</div>}
    </div>
  )
}

export function Toggle({
  id,
  name,
  label,
  description,
  defaultChecked,
}: {
  id: string
  name: string
  label: string
  description?: string
  defaultChecked?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 shrink-0 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-400"
      />
      <label htmlFor={id} className="text-sm text-emerald-800">
        <span className="font-medium">{label}</span>
        {description && <span className="block text-xs text-emerald-600">{description}</span>}
      </label>
    </div>
  )
}
