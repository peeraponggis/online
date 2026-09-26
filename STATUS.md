# สถานะโปรเจกต์ LMS

> อัปเดตล่าสุด: **2026-09-26 11:45**
> โฟลเดอร์: `C:\LocalAI\courseweb`
> เวอร์ชัน HTML: http://localhost:8080 (หลังรัน `node server.js 8080`)
> เวอร์ชัน Next.js: http://localhost:3000 (หลังรัน `npm.cmd run dev`)

---

## กฎเหล็กของโปรเจกต์นี้ (ต้องทำทุกครั้ง)

1. **ทดสอบก่อนสรุปว่าเสร็จเสมอ** — ห้ามสรุปโดยไม่ได้รันจริง
2. **แก้ข้อมูลคอร์สที่ `data/courses.js` ไฟล์เดียว** — ห้าม hardcode คอร์สในไฟล์อื่น
3. **รายงานตามจริง** — ถ้าทำไม่ได้ให้บอกว่าทำไม่ได้ ห้ามกล่าวอ้างว่าสำเร็จ
4. **Thai encoding** — เขียนไฟล์เป็น UTF-8 เสมอ

---

## ผลตรวจสอบล่าสุด (รันจริงทั้งหมด)

### ✅ ผ่าน

| # | การตรวจ | คำสั่ง | ผล |
|---|---|---|---|
| 1 | Logic unit test | `node test.js` | **ผ่าน 96 / ไม่ผ่าน 0** · exit 0 |
| 2 | Syntax server | `node --check server.js` | ไม่มี output (ผ่าน) |
| 3 | TypeScript | `npm.cmd run typecheck` | **ผ่าน** · 0 error |
| 4 | ESLint | `npm.cmd run lint` | **ผ่าน** · ไม่มี warning |
| 5 | Next.js build | `npm.cmd run build` | **ผ่าน** · 19 หน้า static · exit 0 |
| 6 | PowerShell pipeline | `run-all.ps1` | **ผ่าน** · ทั้ง 3 stage · exit 0 ทุกคำสั่ง |
| 7 | เสิร์ฟหน้าแรก (HTML) | `GET /` | 200 |
| 8 | เสิร์ฟไฟล์ JS | `GET /app.js` | 200 |
| 9 | ไฟล์ไม่มีจริง | `GET /nope.txt` | 404 |
| 10 | URL ผิดรูปแบบ | `GET /%` | 400 · **process ไม่ crash** |
| 11 | method ไม่อนุญาต | `POST /` | 405 |
| 12 | path traversal | `GET /%2e%2e%5c%2e%2e%5cWindows/win.ini` | 403 |
| 13 | NUL byte | `GET /%00` | 400 · ไม่ throw |
| 14 | HEAD | `HEAD /` | 200 |
| 15 | security header | `curl -I /index.html` | `X-Content-Type-Options: nosniff` + `Content-Length` มี |
| 16 | ไม่มีข้อความเสียหาย | grep `[\x{3000}-\x{9FFF}]` ทั้งโปรเจกต์ | **ไม่พบ** |
| 17 | ไม่มี BOM ใน JSON | `node test.js` | `package.json` + `tsconfig.json` parse ได้ |
| 18 | **Tailwind สร้าง gradient ครบ** | ตรวจ CSS ที่ build แล้ว | **22/22 class** จาก `data/courses.js` |

### ✅ Route ของ Next.js (ทดสอบกับ `next start` จริง)

| Route | ผล |
|---|---|
| `/` | 200 |
| `/courses` | 200 |
| `/courses/python-beginner` | 200 |
| `/plans` | 200 |
| `/about` | 200 |
| `/courses/nope` | 404 (ถูกต้อง) |

**ตรวจเนื้อหาใน HTML ที่ render จริงด้วย:**
- หน้ารายละเอียดมีชื่อคอร์ส ชื่อผู้สอน ชื่อไฟล์ประกอบ · ไม่มีอักษร CJK
- หน้าแรกมีสถิติ `13,801` และ `4.8` ที่คำนวณจาก `COURSES` จริง
- มี CSS bundle ของ Next (`_next/static/css`) — ยืนยันว่า Tailwind ถูก compile
- `build` prerender ได้ 12 course detail pages จาก `generateStaticParams`

> หมายเหตุ: เมื่อดู raw HTML จะเห็น `Tier <!-- -->1` — นี่คือ **ผลปกติของ React SSR**
> ที่แทรก comment separator ระหว่าง text node ไม่ใช่บั๊ก ในเบราว์เซอร์แสดง "Tier 1" ปกติ

### ⚠️ ยังไม่ได้ตรวจ

| # | รายการ | เหตุผล |
|---|---|---|
| 1 | UI จริงในเบราว์เซอร์ | ยืนยันได้แค่จาก raw HTML — ยังไม่ได้เปิดด้วยตา |
| 2 | Responsive / mobile menu | ต้องทดสอบด้วย browser จริง |
| 3 | `npm.cmd run dev` (โหมด dev) | ทดสอบแค่ production build + `next start` |

---

## สิ่งที่แก้ในรอบนี้

### 1. Next.js ไม่สามารถ build ได้เลย — แก้ครบ 6 จุด

| # | ปัญหา | แก้ที่ |
|---|---|---|
| 1 | `page.tsx` import ผิด path ทั้ง 4 ตัว (`./Hero` → ไฟล์อยู่ใน `components/`) | `app/page.tsx:1-4` |
| 2 | `layout.tsx` import `Home` จาก `./page` และไม่ render `{children}` → route `/courses` `/plans` `/about` จะ 404 | `app/layout.tsx` |
| 3 | `layout.tsx` ไม่ import `./globals.css` → **Tailwind ไม่เคยถูกโหลด** class ทั้งหมดเปล่า | `app/layout.tsx:2` |
| 4 | `package.json` ไม่มี `devDependencies` เลย (ไม่มี TS ทั้งดุ่น) | `package.json` |
| 5 | ไม่มีไฟล์ `postcss.config.mjs` → Tailwind ไม่ถูก compile | สร้างใหม่ |
| 6 | `tailwind.config.ts` ใช้ `module.exports` ในไฟล์ `.ts` | เปลี่ยนเป็น `export default` |

**เพิ่มเติมที่พบระหว่างทาง:** `content` ของ Tailwind เดิมมีแค่ `./app/**` จึงไม่เห็น
gradient class ที่เก็บเป็น string ใน `data/courses.js` (อยู่นอก `app/`) → เพิ่ม `./data/**/*.{js,ts}` แล้ว

### 2. ข้อความเสียหายจาก encoding — แก้ครบ 12 จุด

รูปแบบเดียวกันหมด: ตัวอักษรจีน/ญี่ปุ่นปน คำอังกฤษแทนคำไทย และคำซ้ำ

| ไฟล์ | ของเสีย | แก้เป็น |
|---|---|---|
| `page.tsx` | `เลือกแพ็กเกจที่适合กับคุณ` | `เลือกแพ็กเกจที่เหมาะกับคุณ` |
| `Header.tsx` | `สมัคร成員` | `สมัครสมาชิก` |
| `Footer.tsx` | `プラตฟอร์มคอร์สออนไลน์` | `แพลตฟอร์มคอร์สออนไลน์` |
| `Footer.tsx` | `คอร์ส_popular` | `คอร์สยอดนิยม` |
| `Footer.tsx` | `roma: 02-xxx-xxxx` | `โทร: 02-xxx-xxxx` |
| `Hero.tsx` | `เพิ่มเต็มเต็มที่` | `อย่างเป็นธรรมชาติ` |
| `Hero.tsx` | `ด้วยthemes` / `อย่างcomfortable` | `ด้วยธีมธรรมชาติ` / `อย่างสบายตา` |
| `layout.tsx` | `ด้วยthemes` | `ด้วยธีมธรรมชาติ` |
| `CourseGrid.tsx` | `ขั้นพื้นbasis` | `ขั้นพื้นฐาน` |
| `CourseGrid.tsx` | `assage ดีไซน์` | `เขียน Prompt ที่ได้ผลลัพธ์ตรงใจ` → ถูกลบทิ้ง (ข้อมูลย้ายไป `data/courses.js`) |
| `CourseGrid.tsx` | `การ marketed ดิจิทัล` | ถูกลบทิ้ง (ข้อมูลย้ายไป `data/courses.js`) |

> เวอร์ชัน HTML (`index.html`) **ไม่เคยมีปัญหานี้** — ปัญหาอยู่เฉพาะโค้ด Next.js ที่สร้างคนละช่วง

### 3. ข้อมูลซ้ำซ้อน 2 ชุด — รวมเป็นแหล่งเดียว

`CourseGrid.tsx` เดิม **hardcode คอร์ส 6 ตัวไว้ในไฟล์** ทั้งที่จริงมี 12 คอร์ส
→ ผิวกฎข้อ 2 และทำให้แก้ `data/courses.js` แล้วเวอร์ชัน Next.js ไม่เปลี่ยน

แก้โดยสร้างสะพาน:
```
data/courses.js  ←  แหล่งข้อมูลเดียว
      ↓
app/lib/data.ts       (อ่าน + ช่วยเหลือ: formatBaht, getCourseBySlug, AVERAGE_RATING)
app/lib/types.ts      (interfaces ตรงกับ 21 ฟิลด์)
data/courses.d.ts     (type declaration ให้ TS อ่าน .js ผ่าน strict mode)
      ↓
app/components/*      (ไม่มีไฟล์ไหน hardcode คอร์สอีกแล้ว)
```

### 4. Route ที่ยังขาด — สร้างครบ

เดิม `Header.tsx` ลิงก์ไป `/courses` `/plans` `/about` แต่ไม่มีไฟล์ route เลย → ทั้งหมด 404

สร้างใหม่: `/courses` · `/courses/[slug]` (มี `generateStaticParams`) · `/plans` · `/about`

### 5. `server.js` — ปิดช่องโหว่ 5 จุด

| ช่องโหว่เดิม | อาการ | แก้แล้ว |
|---|---|---|
| `decodeURIComponent` ไม่มี try/catch | `GET /%` → **crash ทั้ง process** | ตอบ `400` |
| ไม่กรอง NUL byte | `GET /%00` → throw แบบ synchronous | ตอบ `400` |
| `startsWith(ROOT)` เป็น prefix check | path ที่ไปโดนโฟลเดอร์พี่เนื้อได้ | เทียบ `ROOT + path.sep` → `403` |
| ไม่มี method restriction | รับทุก method | GET/HEAD เท่านั้น → `405` + `Allow` |
| ไม่มี security header | — | `nosniff` + `Content-Length` |

คงข้อกำหงับเดิมไว้ครบ: port `8000` + `process.argv[2]` · log `READY http://localhost:` ·
bind `127.0.0.1` · `/` → `index.html` · ตาราง MIME เดิม

### 6. ลิงก์เสีย

`index.html:153` ลิงก์ `IMPORT_GUIDE.md` แต่ไฟล์จริงชื่อ `.html` → **404** แก้แล้ว

### 7. ตัวเลขแข็งใน hero

`index.html` แสดง `5,000+` ผู้เรียน แต่ข้อมูลจริงรวม **13,801** → คำนวณจาก `COURSES` จริงแล้ว
(ค่าเฉลี่ย `4.8` เดิมบังเอิญตรงกับที่คำนวณได้ แต่ตอนนี้มาจากข้อมูลจริง)

### 8. `.ps1` ทั้ง 3 ไฟล์พังจริง — แก้แล้ว

`STATUS.md` เดิมบันทึกปัญหานี้ไว้แต่ไม่เคยแก้ ทั้ง 3 ไฟล์เขียนด้วย **syntax ของ bash**
(`#!/bin/bash`, `WORKSPACE="..."`) แต่รันด้วย PowerShell → พังทันที

| ไฟล์ | ปัญหา | แก้แล้ว |
|---|---|---|
| `01-stage1-prepare.ps1` | bash syntax ทั้งไฟล์ | เขียนใหม่เป็น PowerShell จริง · เพิ่ม `-ErrorAction SilentlyContinue` (เดิม `Get-Command` จะพังเมื่อมี tool ไม่ครบ) · ตัด `node_modules`/`.next` ออกจาก file list |
| `02-stage2-kilo.ps1` | **เขียนทับ `02-final-decisions.md`** ทิ้งทั้งไฟล์ | เปลี่ยนเป็นเขียนลง `04-logs` เท่านั้น + อ่านสถานะ ADR มาแสดง (อ่านอย่างเดียว) |
| `run-all.ps1` | bash syntax + ไม่ตรวจผลจริง | เขียนใหม่ + **รัน verification จริง** (`node test.js`, `node --check`, `npm.cmd run typecheck`) แล้วเขียน exit code ลง report |

> **ข้อสำคัญ:** `02-stage2-kilo.ps1` เดิมรันแล้วจะทำลาย ADR ที่เขียนไว้ 137 บรรทัด
> เพราะมันเขียนทับด้วยเนื้อหาที่ขัดกันเอง (บอก NestJS/Lucia ทั้งที่ ADR เลือก Hono/plain JS)
> ตอนนี้ป้องกันแล้ว — รันซ้ำกี่ครั้งก็ไม่ทับ

**ผลรันจริง:** ทั้ง 3 stage ผ่าน · `node test.js` exit 0 · `node --check server.js` exit 0 ·
`npm run typecheck` exit 0

### 9. ไม่มี `.eslintrc.json` — สร้างแล้ว

`package.json` มี `npm run lint` แต่ไม่มี config → `next lint` จะถามแบบ interactive
สร้าง `.eslintrc.json` (`next/core-web-vitals`) → ผลรัน: **ไม่มี warning ไม่มี error**

### 10. เปลี่ยนจาก `<link>` เป็น `next/font/google`

lint เตือน `@next/next/no-page-custom-font` — ฟอนต์โหลดแบบ manual ไม่มี layout shift
เปลี่ยนเป็น `next/font/google` (Sarabun, subset thai+latin) → self-host อัตโนมัติ
ตัดการพึ่ง CDN ตอน runtime · warning หาย

### 11. ไม่มี `.gitignore` — สร้างแล้ว

### 9. เอกสารที่ขัดแย้งกับความจริง — แก้แล้ว

| ไฟล์ | ปัญหาเดิม |
|---|---|
| `STATUS.md` (เดิม) | บรรทัด 57 เขียน `test.js (รอรัน)` ขัดกับบรรทัด 40 ที่บอกผ่าน 59/59 |
| `STATUS.md` (เดิม) | นับไฟล์ผิดทั้งหมด (02-decisions บอก 2 จริง 1, 03-impl บอก 2 จริง 1, 04-logs บอก 6 จริง 4) |
| `STATUS.md` (เดิม) | อ้าง `02-final-decisions.md` ที่ไม่มีอยู่จริง → สร้างแล้ว |
| `01-tech-stack.md` | `Status: PENDING` ทั้งที่ประกาศว่าตัดสินใจแล้ว → เปลี่ยนเป็น `ACCEPTED` |
| `01-implementation-plan.md` | `PENDING` + checkbox ว่าง 18 อัน ทั้งที่ของจริงทำไปเยอะแล้ว → แยกให้ตรงกับความจริง |
| `00-requirements.md` | เขียน "Video streaming with DRM" เหมือนอยู่ใน MVP ทั้งที่ไม่มีแม้แต่ต้นแบบ → แยก In scope / Later |
| `README.md` | **ไม่มีไฟล์นี้เลย** → สร้างแล้ว |

---

## โครงสร้างโปรเจกต์ (ปัจจุบัน)

```
C:\LocalAI\courseweb\
├── index.html · app.js · server.js · test.js · IMPORT_GUIDE.html
├── README.md · STATUS.md
├── package.json · postcss.config.mjs · next.config.js
├── tailwind.config.ts · tsconfig.json · .gitignore
│
├── data\
│   ├── courses.js      ← ★ แหล่งข้อมูลเดียว (12 คอร์ส)
│   └── courses.d.ts    ← ใหม่
│
├── app\
│   ├── layout.tsx · page.tsx · globals.css
│   ├── lib\            types.ts · data.ts        ← ใหม่
│   ├── components\     Header, Hero, Footer, CourseGrid, CourseCard, Plans(ใหม่)
│   ├── courses\        page.tsx · [slug]\page.tsx   ← ใหม่
│   ├── plans\page.tsx                            ← ใหม่
│   └── about\page.tsx                            ← ใหม่
│
└── .kilo-workflow\     01-analysis (3) · 02-decisions (2) · 03-implementation (1)
                        04-logs (4) · 05-scripts (3)
```

---

## ฟีเจอร์ที่ทำเสร็จแล้ว

### เวอร์ชัน HTML (ใช้งานได้จริง มีเทสต์ครอบ)

| ฟีเจอร์ | สถานะ | ที่อยู่ |
|---|---|---|
| ธีมเขียวธรรมชาติ | ✅ | `index.html` + Tailwind CDN |
| คอร์ส 12 คอร์ส / แพ็กเกจ 3 / ผู้สอน 6 | ✅ | `data/courses.js` |
| ค้นหา | ✅ | `app.js` `render()` |
| กรอง หมวด / ระดับ / ราคา | ✅ | `app.js` `render()` |
| เรียงลำดับ 5 แบบ | ✅ | `app.js` `render()` |
| Modal รายละเอียด + syllabus + ไฟล์ประกอบ | ✅ | `app.js` `viewCourse()` |
| ตะกร้าซื้อ | ✅ | `app.js` `addCart/chQty/rmCart` |
| Checkout + QR + เศษสตางค์เฉพาะออเดอร์ | ✅ จำลอง | `app.js` `checkout()` |
| แพ็กเกจ + tier gating | ✅ | `app.js` `redeem()` |
| My Courses + ความคืบหน้า | ✅ | `app.js` `renderMy()` |
| localStorage persist | ✅ | `app.js` `STORE` |
| XSS escape ครบ | ✅ | `app.js` `esc()` |
| คู่มือนำเข้าคอร์ส | ✅ | `IMPORT_GUIDE.html` |

### เวอร์ชัน Next.js (โครงสร้างพร้อม build)

| ฟีเจอร์ | สถานะ |
|---|---|
| Root layout + ฟอนต์ไทย + Tailwind | ✅ |
| หน้าแรก + สถิติจากข้อมูลจริง | ✅ |
| CourseGrid: ค้นหา / กรอง / เรียง 5 แบบ | ✅ |
| CourseCard จาก `Course` type จริง | ✅ |
| Plans จาก `PLANS` จริง | ✅ |
| `/courses` · `/courses/[slug]` · `/plans` · `/about` | ✅ |
| Mobile nav + a11y ใน Header | ✅ |

---

## ข้อจำกัดที่ต้องรู้

### ระบบชำระเงินเป็นต้นแบบจำลอง
- QR สร้างจาก library ฝั่ง client เท่านั้น **ไม่เชื่อมธนาคารจริง**
- ไฟล์สลิปไม่ถูกอัปโหลดที่ใด เป็นแค่ UI
- ปุ่ม "จำลองระบบอนุมัติอัตโนมัติ" เรียก `fakeApprove()` โดยตรง
- state อยู่ใน localStorage แก้ได้จากฝั่ง client
- **ห้ามใช้ขายจริง** จนกว่าจะต่อ SlipOK/EasySlip + เก็บสลิบใน private bucket

### โปรเจกต์ยังไม่มี git repository
`git rev-parse` ยืนยันแล้วว่าไม่ใช่ repo → **ควรรัน `git init`** เพื่อมีประวัติการแก้ไข
(`.gitignore` เตรียมไว้แล้ว)

### PowerShell บนเครื่องนี้
- **ห้ามใช้ `&&`** — PowerShell 5.1 ไม่รองรับ ใช้ `;` แทน
- **ห้ามใช้ `npm`** — `npm.ps1` ถูก block ด้วย execution policy ให้ใช้ **`npm.cmd`**
- **Python เป็น Windows Store stub** ใช้ไม่ได้ — ต้องใช้ Node.js

---

## ขั้นตอนถัดไป

### A — ตรวจด้วยเบราว์เซอร์ (ยังไม่ได้ทำ)
1. `npm.cmd run dev` → เปิด http://localhost:3000
2. ดูหน้า `/` `/courses` `/courses/python-beginner` `/plans` `/about` ด้วยตา
3. ทดสอบ mobile menu ที่จอเล็ก
4. ทดสอบ search / filter / sort ที่ `/courses`

### B — เชื่อมระบบจริง
1. Supabase (auth + DB)
2. SlipOK API ตรวจสลิปจริง
3. Bunny Stream + signed URL
4. Cloudflare Pages deploy

### C — สุขอนามัยของโปรเจกต์
1. `git init` + commit ครั้งแรก (มี `.gitignore` เตรียมแล้ว) — **ยังไม่มี version control**

---

## เอกสารสำคัญ

| หัวข้อ | ไฟล์ |
|---|---|
| Requirements + DoD | `.kilo-workflow/01-analysis/00-requirements.md` |
| Architecture | `.kilo-workflow/01-analysis/01-architecture.md` |
| งบ 3 ระดับ | `.kilo-workflow/01-analysis/02-cost-analysis.md` |
| ADR 4 ข้อ | `.kilo-workflow/02-decisions/02-final-decisions.md` |
| แผน + สถานะราย phase | `.kilo-workflow/03-implementation/01-implementation-plan.md` |
| วิธีรัน + โครงสร้าง | `README.md` |

---

*ไฟล์นี้ควรอัปเดตทุกครั้งที่ทำงานเสร็จขั้นตอน — และต้องแยกให้ชัดว่าอะไร "ยืนยันด้วยการรันแล้ว"
กับอะไร "ยังไม่ได้ตรวจ"*
