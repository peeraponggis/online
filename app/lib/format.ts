export function formatBaht(n: number): string {
  return Number(n).toLocaleString('th-TH')
}

export function formatDate(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function relativeTime(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const diff = Date.now() - d.getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return 'เมื่อครู่นี้'
  if (min < 60) return `${min} นาทีที่แล้ว`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr} ชั่วโมงที่แล้ว`
  const day = Math.round(hr / 24)
  if (day < 30) return `${day} วันที่แล้ว`
  return formatDate(iso)
}
