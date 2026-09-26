/**
 * test-ui.mjs — ทดสอบ UI จริงด้วยเบราว์เซอร์ (Microsoft Edge ที่มีอยู่ในเครื่อง)
 *
 * ใช้ playwright-core ซึ่งไม่ดาวน์โหลดเบราว์เซอร์เพิ่ม
 * รัน:  node test-ui.mjs
 *
 * ครอบคลุม:
 *   - ทุก route ของ Next.js ที่ 3 ขนาดจอ (mobile / tablet / desktop)
 *   - ไม่มี horizontal overflow (สัญญาณว่า responsive พัง)
 *   - hamburger menu บนมือถือ: ซ่อน/โผล่ ตามขนาดจอ + aria-expanded + นำทางได้
 *   - search / filter / sort บน /courses ทำงานจริง
 *   - ไม่มี console error หรือ uncaught exception ระหว่างใช้งาน
 *   - เวอร์ชัน HTML (index.html) บนพอร์ต 8080
 */

import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const ROOT = dirname(fileURLToPath(import.meta.url))
const SHOTS = process.env.UI_SHOT_DIR || join(process.env.TEMP || '.', 'courseweb-ui')
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const NEXT_PORT = 3100
const HTML_PORT = 8099

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

const ROUTES = [
  { path: '/', label: 'หน้าแรก' },
  { path: '/courses', label: 'คอร์สทั้งหมด' },
  { path: '/courses/python-beginner', label: 'รายละเอียดคอร์ส' },
  { path: '/plans', label: 'แพ็กเกจ' },
  { path: '/about', label: 'เกี่ยวกับเรา' },
]

let pass = 0
let fail = 0
const failures = []

function ok(name, cond, detail = '') {
  if (cond) {
    pass++
    console.log(`  PASS  ${name}`)
  } else {
    fail++
    failures.push(`${name}${detail ? ' — ' + detail : ''}`)
    console.log(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`)
  }
}

function section(title) {
  console.log(`\n=== ${title} ===`)
}

const waitReady = (child, label) =>
  new Promise(resolve => {
    const timer = setTimeout(() => resolve(false), 30000)
    const onData = d => {
      if (String(d).includes('Ready') || String(d).includes('READY')) {
        clearTimeout(timer)
        console.log(`  ${label} พร้อม`)
        resolve(true)
      }
    }
    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
    child.on('exit', () => {
      clearTimeout(timer)
      resolve(false)
    })
  })

async function main() {
  mkdirSync(SHOTS, { recursive: true })

  section('เปิดเซิร์ฟเวอร์')
  if (!existsSync(join(ROOT, '.next', 'BUILD_ID'))) {
    ok('มี production build', false, 'ไม่พบ .next/BUILD_ID — ต้องรัน npm.cmd run build ก่อน')
    console.log('         (next dev จะเขียนทับ .next ด้วย dev artifacts)')
    process.exit(1)
  }
  ok('มี production build (.next/BUILD_ID)', true)

  const next = spawn(process.execPath, [join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next'), 'start', '-p', String(NEXT_PORT)], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const html = spawn(process.execPath, [join(ROOT, 'server.js'), String(HTML_PORT)], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const okNext = await waitReady(next, 'Next.js (next start)')
  const okHtml = await waitReady(html, 'HTML (server.js)')
  if (!okNext || !okHtml) {
    ok('เซิร์ฟเวอร์ทั้งสองสตาร์ทได้', false, `next=${okNext} html=${okHtml}`)
    next.kill()
    html.kill()
    return
  }
  ok('เซิร์ฟเวอร์ทั้งสองสตาร์ทได้', true)

  const browser = await chromium.launch({ executablePath: EDGE, headless: true })

  try {
    // ---- 1. ทุก route ทุกขนาดจอ ----
    for (const vp of VIEWPORTS) {
      section(`Next.js · ${vp.name} (${vp.width}×${vp.height})`)
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
      const page = await ctx.newPage()

      const consoleErrors = []
      const pageErrors = []
      const badResponses = []
      page.on('console', m => {
        if (m.type() === 'error') consoleErrors.push(m.text())
      })
      page.on('pageerror', e => pageErrors.push(e.message))
      page.on('response', r => {
        if (r.status() >= 400) badResponses.push(`${r.status()} ${r.url()}`)
      })

      for (const route of ROUTES) {
        consoleErrors.length = 0
        pageErrors.length = 0
        badResponses.length = 0

        const resp = await page.goto(`http://127.0.0.1:${NEXT_PORT}${route.path}`, {
          waitUntil: 'networkidle',
          timeout: 30000,
        })
        ok(`${route.label} ตอบ ${resp.status()}`, resp.status() === 200, `ได้ ${resp.status()}`)

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        )
        ok(`${route.label} ไม่มี horizontal overflow`, overflow <= 1, `ล้น ${overflow}px`)

        const hasThai = await page.evaluate(() =>
          /[\u0E00-\u0E7F]/.test(document.body.innerText)
        )
        ok(`${route.label} มีข้อความไทย render จริง`, hasThai)

        await page.screenshot({
          path: join(SHOTS, `${vp.name}${route.path.replace(/\//g, '_')}.png`),
          fullPage: false,
        })

        ok(`${route.label} ไม่มี console error`, consoleErrors.length === 0,
          consoleErrors.length ? `${consoleErrors[0]} | bad: ${badResponses.join(', ')}` : '')
        ok(`${route.label} ไม่มี uncaught exception`, pageErrors.length === 0, pageErrors[0] || '')
      }

      // ---- 2. hamburger menu ตามขนาดจอ ----
      const burger = page.locator('button[aria-controls="mobile-nav"]')
      const desktopNav = page.locator('nav[aria-label="เมนูหลัก"]')

      if (vp.name === 'mobile') {
        ok('มือถือ: ปุ่ม hamburger แสดง', await burger.isVisible())
        ok('มือถือ: เมนูหลักซ่อน', !(await desktopNav.isVisible()))
        ok('มือถือ: เมนูมือถือยังไม่โผล่', (await page.locator('#mobile-nav').count()) === 0)
        ok('มือถือ: aria-expanded เริ่มเป็น false',
          (await burger.getAttribute('aria-expanded')) === 'false')
      } else {
        ok(`${vp.name}: เมนูหลักแสดง`, await desktopNav.isVisible())
        ok(`${vp.name}: ปุ่ม hamburger ซ่อน`, !(await burger.isVisible()))
      }

      await ctx.close()
    }

    // ---- 3. การโต้ตอบของ hamburger (มือถือ) ----
    section('hamburger menu · มือถือ 375px')
    {
      const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } })
      const page = await ctx.newPage()
      await page.goto(`http://127.0.0.1:${NEXT_PORT}/`, { waitUntil: 'networkidle' })

      const burger = page.locator('button[aria-controls="mobile-nav"]')
      await burger.click()
      await page.waitForSelector('#mobile-nav', { timeout: 5000 })

      ok('คลิกแล้วเมนูมือถือโผล่', await page.locator('#mobile-nav').isVisible())
      ok('aria-expanded เปลี่ยนเป็น true',
        (await burger.getAttribute('aria-expanded')) === 'true')

      const linkCount = await page.locator('#mobile-nav a').count()
      ok('เมนูมือถือมีลิงก์ครบ 3 รายการ', linkCount === 3, `ได้ ${linkCount}`)

      await page.screenshot({ path: join(SHOTS, 'mobile-menu-open.png') })

      await page.locator('#mobile-nav a[href="/courses"]').click()
      await page.waitForURL('**/courses', { timeout: 10000 })
      ok('คลิกลิงก์แล้วนำทางไป /courses', page.url().endsWith('/courses'))
      ok('กดแล้วเมนูปิดกลับ', (await page.locator('#mobile-nav').count()) === 0)

      await ctx.close()
    }

    // ---- 4. search / filter / sort บน /courses ----
    section('search / filter / sort · /courses')
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
      const page = await ctx.newPage()
      await page.goto(`http://127.0.0.1:${NEXT_PORT}/courses`, { waitUntil: 'networkidle' })

      const cards = page.locator('article')
      ok('แสดงคอร์สครบ 12 ใบ', (await cards.count()) === 12, `ได้ ${await cards.count()}`)

      const countText = () => page.locator('text=/พบ \\d+ คอร์ส/').innerText()

      await page.fill('#q', 'python')
      await page.waitForTimeout(300)
      ok('ค้นหา "python" ได้ 2 ใบ', (await cards.count()) === 2, `ได้ ${await cards.count()}`)
      ok('ข้อความจำนวนอัปเดต', (await countText()).includes('2'), await countText())

      await page.fill('#q', 'zzzzzไม่มีจริง')
      await page.waitForTimeout(300)
      ok('ค้นหาไม่พบ -> แสดง empty state', (await cards.count()) === 0)
      ok('มีปุ่มล้างตัวกรอง', await page.locator('button:has-text("ล้างตัวกรอง")').isVisible())
      await page.screenshot({ path: join(SHOTS, 'desktop-empty-state.png') })

      await page.locator('button:has-text("ล้างตัวกรอง")').click()
      await page.waitForTimeout(300)
      ok('ล้างตัวกรองแล้วกลับมา 12 ใบ', (await cards.count()) === 12)

      await page.selectOption('#fCat', 'AI & Data')
      await page.waitForTimeout(300)
      ok('กรองหมวด AI & Data ได้ 4 ใบ', (await cards.count()) === 4, `ได้ ${await cards.count()}`)

      await page.selectOption('#fCat', 'ทั้งหมด')
      await page.selectOption('#fLevel', 'ยาก')
      await page.waitForTimeout(300)
      ok('กรองระดับยากได้ 5 ใบ', (await cards.count()) === 5, `ได้ ${await cards.count()}`)

      await page.selectOption('#fLevel', 'ทั้งหมด')
      await page.waitForTimeout(300)
      await page.selectOption('select[aria-label="เรียงลำดับ"]', 'high')
      await page.waitForTimeout(300)
      const prices = await page.locator('article .text-2xl').allInnerTexts()
      const nums = prices.map(t => Number(t.replace(/[^\d]/g, '')))
      const sortedDesc = nums.every((v, i) => i === 0 || nums[i - 1] >= v)
      ok('เรียงราคาสูง → ต่ำ ถูกต้อง', sortedDesc, nums.join(' >= '))
      await page.screenshot({ path: join(SHOTS, 'desktop-sorted-desc.png') })

      await ctx.close()
    }

    // ---- 5. ความคมชัดของข้อความ (contrast) — กันบั๊ก "สีขาวบนพื้นขาว" ----
    section('ความคมชัดของข้อความ · กันสีขาวทับพื้นขาว')
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
      const page = await ctx.newPage()

      const contrastOf = async () =>
        page.evaluate(() => {
          const lum = c => {
            const [r, g, b] = c.map(v => {
              const s = v / 255
              return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
            })
            return 0.2126 * r + 0.7152 * g + 0.0722 * b
          }
          const parse = s => (s.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number)
          const isTransparent = s => /rgba\([^)]*,\s*0\s*\)/.test(s) || s === 'transparent'

          // หาพื้นหลังจริง: ไล่ขึ้นไป และอ่าน gradient จาก background-image ด้วย
          const bgOf = el => {
            let n = el
            while (n && n !== document.documentElement) {
              const cs = getComputedStyle(n)
              if (cs.backgroundImage && cs.backgroundImage.includes('gradient')) {
                const stops = cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []
                if (stops.length) {
                  const acc = [0, 0, 0]
                  for (const s of stops) {
                    const p = parse(s)
                    for (let i = 0; i < 3; i++) acc[i] += p[i] / stops.length
                  }
                  return acc
                }
              }
              const bg = cs.backgroundColor
              if (!isTransparent(bg)) {
                const p = parse(bg)
                if (p.length === 3) return p
              }
              n = n.parentElement
            }
            return [255, 255, 255]
          }

          const out = []
          for (const el of document.querySelectorAll('h1,h2,h3,p,li,span,div,button,a')) {
            const txt = (el.textContent || '').trim()
            if (!txt || el.children.length > 0) continue
            const cs = getComputedStyle(el)
            if (cs.visibility === 'hidden' || cs.display === 'none') continue
            if (parseFloat(cs.opacity) < 0.1) continue
            const rect = el.getBoundingClientRect()
            if (rect.width === 0 || rect.height === 0) continue
            const fg = parse(cs.color)
            if (fg.length < 3) continue
            const bg = bgOf(el)
            const l1 = lum(fg)
            const l2 = lum(bg)
            const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
            out.push({ text: txt.slice(0, 40), ratio: Math.round(ratio * 100) / 100 })
          }
          return out
        })

      for (const path of ['/plans', '/', '/courses', '/about', '/courses/python-beginner']) {
        await page.goto(`http://127.0.0.1:${NEXT_PORT}${path}`, { waitUntil: 'networkidle' })
        const items = await contrastOf()
        const low = items.filter(i => i.ratio < 1.6)
        ok(
          `${path} ไม่มีข้อความมองไม่เห็น (contrast < 1.6:1)`,
          low.length === 0,
          low.slice(0, 3).map(i => `"${i.text}" ${i.ratio}:1`).join(' | ')
        )
      }

      // ตรวจเฉพาะจุด: ชื่อ/ราคา/ฟีเจอร์ของทั้ง 3 แพ็กเกจต้องอ่านออก
      await page.goto(`http://127.0.0.1:${NEXT_PORT}/plans`, { waitUntil: 'networkidle' })
      const readability = await page.evaluate(() => {
        const lum = c => {
          const [r, g, b] = c.map(v => {
            const s = v / 255
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
          })
          return 0.2126 * r + 0.7152 * g + 0.0722 * b
        }
        const parse = s => (s.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number)
        const result = []
        for (const card of document.querySelectorAll('section#plans h3')) {
          const name = card.textContent.trim()
          const cs = getComputedStyle(card)
          const fg = parse(cs.color)
          // หาพื้นจริงของการ์ด: ไล่ขึ้นจนเจอ gradient หรือสีทึบ
          let n = card.parentElement
          let bg = [255, 255, 255]
          while (n) {
            const s = getComputedStyle(n)
            if (s.backgroundImage && s.backgroundImage.includes('gradient')) {
              const stops = s.backgroundImage.match(/rgba?\([^)]+\)/g) || []
              const acc = [0, 0, 0]
              for (const st of stops) {
                const p = parse(st)
                for (let i = 0; i < 3; i++) acc[i] += p[i] / stops.length
              }
              bg = acc
              break
            }
            if (s.backgroundColor && !/rgba\([^)]*,\s*0\s*\)/.test(s.backgroundColor)) {
              bg = parse(s.backgroundColor)
              break
            }
            n = n.parentElement
          }
          const l1 = lum(fg)
          const l2 = lum(bg)
          result.push({ name, ratio: Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100 })
        }
        return result
      })

      for (const r of readability) {
        ok(`ชื่อแพ็กเกจ "${r.name}" อ่านออก (contrast ${r.ratio}:1)`, r.ratio >= 3)
      }

      const prices = await page.locator('.grid > div .text-3xl').allInnerTexts()
      ok('ราคาทั้ง 3 แพ็กเกจแสดงครบ', prices.length === 3 && prices.every(p => /\d/.test(p)), prices.join(' / '))

      await page.screenshot({ path: join(SHOTS, 'desktop-plans-fixed.png') })
      await ctx.close()
    }

    // ---- 6. route ของแอดมิน (ยังไม่ได้ตั้งค่า Supabase -> ต้องถูกพาไป /admin/setup) ----
    section('เส้นทางแอดมิน · ยังไม่ล็อกอิน')
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
      const page = await ctx.newPage()

      for (const p of ['/admin', '/admin/courses', '/admin/settings', '/admin/courses/new']) {
        await page.goto(`http://127.0.0.1:${NEXT_PORT}${p}`, { waitUntil: 'domcontentloaded' })
        ok(`${p} ไม่ให้เข้าถึงตรง ๆ`, !page.url().endsWith(p), `ไปที่ ${page.url()}`)
        ok(`${p} ถูกพาไปหน้าปลอดภัย`,
          page.url().includes('/admin/setup') || page.url().includes('/admin/login'),
          page.url())
      }

      // ใช้ context ใหม่เพื่อไม่ให้การเชื่อมต่อค้างจากรอบก่อนรบกวน networkidle
      const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
      const p2 = await ctx2.newPage()

      const setup = await p2.goto(`http://127.0.0.1:${NEXT_PORT}/admin/setup`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      })
      ok('/admin/setup เปิดได้', setup.status() === 200, `ได้ ${setup.status()}`)
      await p2.waitForSelector('ol > li', { timeout: 10000 })
      ok('/admin/setup อธิบายขั้นตอน 6 ข้อ',
        (await p2.locator('ol > li').count()) === 6,
        String(await p2.locator('ol > li').count()))
      ok('/admin/setup ไม่มีช่องใส่รหัสผ่าน',
        (await p2.locator('input[type="password"]').count()) === 0)

      const login = await p2.goto(`http://127.0.0.1:${NEXT_PORT}/admin/login`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      })
      ok('/admin/login เปิดได้', login.status() === 200, `ได้ ${login.status()}`)
      await p2.waitForSelector('input[name="email"]', { timeout: 10000 })
      ok('/admin/login มีช่องอีเมลและรหัสผ่าน',
        (await p2.locator('input[name="email"]').count()) === 1 &&
          (await p2.locator('input[name="password"]').count()) === 1)
      ok('ช่องรหัสผ่านเป็น type=password',
        (await p2.locator('input[name="password"]').getAttribute('type')) === 'password')

      await p2.screenshot({ path: join(SHOTS, 'desktop-admin-login.png') })
      await ctx2.close()
      await ctx.close()
    }

    // ---- 7. เวอร์ชัน HTML ----
    section('เวอร์ชัน HTML (index.html) · server.js')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
      const page = await ctx.newPage()
      const errors = []
      page.on('pageerror', e => errors.push(e.message))

      const resp = await page.goto(`http://127.0.0.1:${HTML_PORT}/`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      })
      ok('index.html ตอบ 200', resp.status() === 200, `ได้ ${resp.status()}`)

      const htmlCards = page.locator('#grid article')
      ok('การ์ดคอร์ส 12 ใบ', (await htmlCards.count()) === 12, `ได้ ${await htmlCards.count()}`)

      const stat = await page.locator('#statStudents').innerText()
      ok('สถิติผู้เรียนคำนวณถูก (13,801)', stat.trim() === '13,801', stat)

      const rating = await page.locator('#statRating').innerText()
      ok('สถิติคะแนนเฉลี่ยถูก (4.8)', rating.trim() === '4.8', rating)

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      )
      ok('ไม่มี horizontal overflow', overflow <= 1, `ล้น ${overflow}px`)

      ok('ไม่มี uncaught exception', errors.length === 0, errors[0] || '')

      await page.screenshot({ path: join(SHOTS, 'html-index.png') })

      const guide = await page.goto(`http://127.0.0.1:${HTML_PORT}/IMPORT_GUIDE.html`, {
        waitUntil: 'networkidle',
      })
      ok('คู่มือ IMPORT_GUIDE.html เปิดได้ (ลิงก์ใน footer)', guide.status() === 200)

      await ctx.close()
    }
  } finally {
    await browser.close()
    next.kill()
    html.kill()
  }

  console.log('\n' + '='.repeat(52))
  console.log(`  ผ่าน ${pass}  |  ไม่ผ่าน ${fail}`)
  if (failures.length) {
    console.log('\n  รายการที่ไม่ผ่าน:')
    failures.forEach(f => console.log('   - ' + f))
  }
  console.log(`\n  ภาพหน้าจอ: ${SHOTS}`)
  console.log('='.repeat(52))
  process.exit(fail ? 1 : 0)
}

main().catch(e => {
  console.error('รัน UI test ไม่สำเร็จ:', e)
  process.exit(1)
})
