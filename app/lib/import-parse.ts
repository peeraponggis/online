/** ตัวช่วยแปลงข้อมูลนำเข้า — pure function ไม่ต้องใช้เซิร์ฟเวอร์ ทดสอบได้โดยตรง */

export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
      continue
    }
    if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c !== '\r') {
      field += c
    }
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }

  const cleaned = rows.filter(r => r.some(c => c.trim()))
  if (cleaned.length < 2) return []
  const header = cleaned[0].map(h => h.trim())
  return cleaned.slice(1).map(r => {
    const obj: Record<string, string> = {}
    header.forEach((h, i) => {
      obj[h] = r[i] ?? ''
    })
    return obj
  })
}

export function parseImportPayload(raw: string): unknown[] {
  const text = raw.trim()
  if (text.startsWith('[')) {
    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed)) throw new Error('JSON ต้องเป็น array')
    return parsed
  }
  if (text.startsWith('{')) {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed?.COURSES)) return parsed.COURSES
    if (Array.isArray(parsed?.courses)) return parsed.courses
    return [parsed]
  }
  return parseCsv(text)
}
