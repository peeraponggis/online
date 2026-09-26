export const COVERS = {
  emerald: 'from-emerald-100 to-green-100',
  lime: 'from-lime-100 to-green-100',
  teal: 'from-teal-100 to-cyan-100',
  cyan: 'from-cyan-100 to-sky-100',
  sky: 'from-sky-100 to-blue-100',
  indigo: 'from-indigo-100 to-blue-100',
  violet: 'from-violet-100 to-purple-100',
  purple: 'from-purple-100 to-violet-100',
  fuchsia: 'from-fuchsia-100 to-pink-100',
  pink: 'from-pink-100 to-rose-100',
  rose: 'from-rose-100 to-pink-100',
  amber: 'from-amber-100 to-orange-100',
  orange: 'from-orange-100 to-amber-100',
  yellow: 'from-yellow-100 to-amber-100',
  slate: 'from-slate-100 to-gray-200',
  stone: 'from-stone-100 to-neutral-200',
  zinc: 'from-zinc-100 to-gray-200',
} as const

export type CoverToken = keyof typeof COVERS

export const COVER_TOKENS = Object.keys(COVERS) as CoverToken[]

export const DEFAULT_COVER: CoverToken = 'emerald'

export function isCoverToken(value: unknown): value is CoverToken {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(COVERS, value)
}

export function coverClass(token: string): string {
  return isCoverToken(token) ? COVERS[token] : COVERS[DEFAULT_COVER]
}

export function coverLabel(token: string): string {
  return isCoverToken(token) ? token : DEFAULT_COVER
}

const CLASS_TO_TOKEN = new Map<string, CoverToken>(
  Object.entries(COVERS).map(([token, cls]) => [cls, token as CoverToken])
)

/** แปลงจากรูปแบบเดิม 'from-emerald-100 to-green-100' เป็น token 'emerald' */
export function tokenFromClass(value: string): CoverToken {
  const trimmed = value.trim()
  const direct = CLASS_TO_TOKEN.get(trimmed)
  if (direct) return direct
  const first = trimmed.split(/\s+/)[0] ?? ''
  const fromMatch = /^from-([a-z]+)-\d+$/.exec(first)
  if (fromMatch) {
    const name = fromMatch[1]
    const found = COVER_TOKENS.find(t => t === name || t.startsWith(name))
    if (found) return found
  }
  return DEFAULT_COVER
}
