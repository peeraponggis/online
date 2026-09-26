# คอร์สออนไลน์ — LMS Platform (ต้นแบบ)

แพลตฟอร์มขายคอร์สออนไลน์ธีมธรรมชาติ มี **2 เวอร์ชัน** ที่ใช้ข้อมูลชุดเดียวกัน

| เวอร์ชัน | เทคโนโลยี | จุดแข็ง | ใช้เมื่อ |
|---|---|---|---|
| **HTML** | Vanilla JS + Tailwind CDN | เปิดได้ทันที ไม่ต้อง build | ดูต้นแบบ flow ชำระเงิน |
| **Next.js** | Next.js 15 App Router + TS + Tailwind 3 | เป็นฐานสำหรับขยายต่อ | พัฒนาต่อเป็นเว็บจริง |

> ⚠️ **ระบบชำระเงินและสมาชิกเป็น MOCK เท่านั้น — ห้ามใช้ขายจริง**
> QR สร้างจาก library ฝั่ง client · ไม่มีการยืนยันกับธนาคาร ·
> ไฟล์สลิปไม่ถูกอัปโหลดที่ใด · ปุ่มอนุมัติเรียก `fakeApprove()` โดยตรง

---

## เริ่มต้นใช้งาน

### เวอร์ชัน HTML (เริ่มได้ทันที ไม่ต้องติดตั้งอะไร)

```powershell
cd C:\LocalAI\courseweb
node server.js 8080
```

เปิด <http://localhost:8080>

หยุด server: `Ctrl+C` ในหน้าต่างนั้น

> ใช้ **Node.js** เท่านั้น — Python ในเครื่องนี้เป็น Windows Store stub ใช้ไม่ได้

### เวอร์ชัน Next.js

```powershell
cd C:\LocalAI\courseweb
npm.cmd install
npm.cmd run dev
```

เปิด <http://localhost:3000>

> **ต้องใช้ `npm.cmd` ไม่ใช่ `npm`** — `npm.ps1` ถูก PowerShell execution policy บล็อก
> (ถ้าอยากแก้ถาวร: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`)
>
> ถ้า `next dev` ออกทันทีโดยไม่มี error แปลว่า stdin ถูกปิด
> (พบเมื่อรันผ่าน tool ที่จัดการ process แบบ `start`) ให้เรียกตรงแทน:
> `node node_modules\next\dist\bin\next dev`

### สคริปต์อัตโนมัติของ workflow

```powershell
powershell.exe -ExecutionPolicy Bypass -File .kilo-workflow\05-scripts\run-all.ps1
```

รัน 3 stage: เก็บ system info → เขียน review → verification จริง
(`node test.js`, `node --check server.js`, `npm.cmd run typecheck`) แล้วสรุป exit code ลง `04-logs/06-final-report.txt`

> Stage 2 **ไม่เขียนทับ** `02-decisions/02-final-decisions.md` — ไฟล์นั้นดูแลเอง

---

## หน้าแอดมิน (`/admin`)

จัดการคอร์ส แพ็กเกจ ผู้สอน หมวดหมู่ และข้อมูลธนาคารได้จากหน้าเว็บ
**ยังใช้ไม่ได้จนกว่าจะเชื่อม Supabase** — ตอนนี้เปิดแล้วจะถูกพาไปหน้า `/admin/setup` ที่อธิบายขั้นตอน

### ตั้งค่า 6 ขั้นตอน

| # | ทำอะไร | ที่ไหน |
|---|---|---|
| 1 | สร้าง Supabase project | supabase.com |
| 2 | รัน `supabase/migrations/0001_admin_init.sql` แล้วตามด้วย `0002_seed_settings.sql` | SQL Editor |
| 3 | สร้างผู้ดูแล: ใส่อีเมล + **ตั้งรหัสผ่านเอง** → ติ้ก Email confirm เป็น OFF | Dashboard → Authentication → Users |
| 4 | `insert into admins (user_id, email) values ('<uuid>', '<อีเมล>')` — ดู `user_id` จาก `select id, email from auth.users;` | SQL Editor |
| 5 | คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ URL + anon key + service role key | ในโฟลเดอร์โปรเจกต์ |
| 6 | `npm.cmd run seed` — ย้ายข้อมูลเดิมเข้า DB (รันซ้ำได้ ไม่สร้างซ้ำ) | terminal |

เสร็จแล้วเปิด http://localhost:3000/admin แล้วล็อกอิน

> **เรื่องรหัสผ่าน:** ควรตั้งเองที่ Supabase Dashboard เพราะรหัสผ่านจะไม่เคยผ่านเครื่องนี้
> ไม่เข้าไฟล์ ไม่เข้า git ไม่เข้า shell history
> ถ้าอยากให้สคริปต์ช่วยสร้าง: `npm.cmd run admin:create` (ถามรหัสผ่านแบบซ่อนตัวอักษร)
> ห้ามเขียนรหัสผ่านลง `.env.example` หรือไฟล์ใด ๆ ในโปรเจกต์

### คำสั่งจัดการฐานข้อมูล

| คำสั่ง | ทำอะไร |
|---|---|
| `npm.cmd run seed` | ย้ายข้อมูลจาก `data/courses.js` เข้า Supabase (รันซ้ำได้) |
| `npm.cmd run admin:create` | สร้างผู้ดูแลใหม่ (ซ่อนรหัสผ่าน) |
| `npm.cmd run export:snapshot` | ดึง DB กลับ `data/courses.js` สำหรับเดโมเวอร์ชัน HTML |

> `export:snapshot` เขียนทับไฟล์ข้อมูล — จึงสำรองไว้ที่ `data/courses.js.bak`
> หลังรันควรรัน `node test.js` ต่อเพื่อยืนยันว่าเวอร์ชัน HTML ยังใช้ได้

---

## คำสั่งตรวจสอบ

| คำสั่ง | ผลที่ถูกต้อง |
|---|---|
| `node test.js` | `ผ่าน 162 \| ไม่ผ่าน 0` และ exit code 0 |
| `node test-ui.mjs` | `ผ่าน 129 \| ไม่ผ่าน 0` (ขับ Microsoft Edge จริง) |
| `node --check server.js` | ไม่มี output |
| `npm.cmd run typecheck` | exit 0 |
| `npm.cmd run lint` | ไม่มี warning/error |
| `npm.cmd run build` | exit 0 · 22 หน้า (12 route แอดมิน) |
| `next dev` + curl 6 route | 200 ทั้ง 5 route · 404 ถูกต้อง · HMR ทำงาน · log ไม่มี warning |

`test.js` รัน logic ทั้งหมดใน Node โดยไม่ต้องเปิด browser — ใช้ `vm` module
สร้าง DOM จำลอง แล้วโหลด `data/courses.js` + `app.js` เข้าไปใน context เดียว

**9 ชุด (96 assertions):**

| ชุด | ครอบคลุม |
|---|---|
| 1 DATA | จำนวนคอร์ส/แพ็กเกจ, id-slug ไม่ซ้ำ, category, level, tier, price, instructor, syllabus, topics, quota |
| 2 RENDER/FILTER | การ์ด 12 ใบ, dropdown, ค้นหา, กรองหมวด/ระดับ/ราคา, เรียงราคา |
| 3 CART | เพิ่ม/ซ้ำ/จำนวน/ลบ, ยอดรวม, badge |
| 4 CHECKOUT | เลขออเดอร์, เศษสตางค์เฉพาะออเดอร์, modal, QR, ให้สิทธิ์ |
| 5 TIER | tier gating ของสมาชิก Pro |
| 6 PROGRESS | เลื่อนบท, ความคืบหน้า, localStorage persist |
| 7 XSS | escape HTML |
| 8 REGRESSION | ไม่มีอักษรจีน/ญี่ปุ่น/เกาหลีปน, ลิงก์ `IMPORT_GUIDE.html`, ไม่ hardcode ตัวเลข, ลำดับ script, `layout.tsx` import `globals.css` + `{children}`, `CourseGrid` ไม่ hardcode คอร์ส, `postcss.config.mjs` มี, `.gitignore` มี, JSON ไม่มี BOM, tailwind v3 + `content` ครอบ `data/`, **gradient 22/22 class อยู่ใน CSS ที่ build แล้ว** |
| 9 HTTP | spawn `server.js` จริงแล้วยิงจริง: 200/200/200/200, 404, 400 (`/%` และ `%00`), 405 (POST), 403 (traversal), 200 (HEAD), `nosniff`, และ server ยังไม่ crash |
| 10 SCHEMA | `slugify` · zod ปฏิเสธ level/tier/ราคา/slug/cover/category ผิด · `quota = -1` ผ่าน · `quota = 0` ไม่ผ่าน · 17 cover token ไม่ซ้ำ · `tokenFromClass` ครอบคลุม 12 แบบเดิม · แปลง CSV/JSON |
| 11 RLS/ความปลอดภัย | RLS เปิดครบ 10 ตาราง · `is_admin()` · `with check` ครบ · ไม่มี loop ซ่อน policy · `.env.example` ไม่มีค่าจริง · service role ไม่อยู่ในโค้ดฝั่ง browser · middleware กรอง · ทุก action เรียก `requireAdmin()` + เขียน audit log · ลบต้องพิมพ์ยืนยัน |

**UI จริง — `test-ui.mjs` (129 assertions)**
ใช้ `playwright-core` ขับ **Microsoft Edge** ที่ติดตั้งอยู่ในเครื่องอยู่แล้ว
(ไม่ดาวน์โหลดเบราว์เซอร์เพิ่ม) ต้องรัน `npm.cmd run build` ก่อน เพราะสคริปต์ต้องการ production build

| กลุ่ม | ครอบคลุม |
|---|---|
| responsive | 5 route × 3 ขนาดจอ (375 / 768 / 1440) — ไม่มี horizontal overflow, ไม่มี console error, ไม่มี uncaught exception |
| hamburger | มือถือแสดง / เดสก์ท็อปซ่อน · `aria-expanded` สลับถูก · คลิกลิงก์แล้วนำทางและปิดเมนู |
| การโต้ตอบ | search / filter หมวด / filter ระดับ / sort · empty state · ล้างตัวกรอง |
| contrast | ทุกหน้าไม่มีข้อความที่มองไม่เห็น (อ่าน gradient จริงจาก `background-image`) |
| แอดมิน | `/admin` และ `/admin/*` ถูกพาไปหน้าปลอดภัย · `/admin/setup` มี 6 ขั้นตอนและไม่มีช่องรหัสผ่าน · `/admin/login` มีช่องอีเมล/รหัสผ่าน (`type=password`) |
| เวอร์ชัน HTML | การ์ด 12 ใบ · สถิติ 13,801 / 4.8 · คู่มือเปิดได้ |

เก็บภาพหน้าจอไว้ที่ `%TEMP%\courseweb-ui` (20+ ภาพ)

---

## โครงสร้างโปรเจกต์

```
C:\LocalAI\courseweb\
├── index.html              ← เวอร์ชัน HTML หลัก
├── app.js                  ← logic ทั้งหมดของเวอร์ชัน HTML
├── server.js               ← static server (GET/HEAD เท่านั้น)
├── test.js                 ← unit test 162 assertions
├── test-ui.mjs             ← browser test 129 assertions (Edge จริง)
├── icon.svg                ← favicon
├── IMPORT_GUIDE.html       ← คู่มือฟิลด์สำหรับนำเข้าคอร์ส
├── .env.example            ← ต้นแบบตัวแปร (ค่าว่างทั้งหมด)
├── middleware.ts           ← กรอง /admin/*
│
├── supabase\
│   ├── migrations\
│   │   ├── 0001_admin_init.sql    ← schema + RLS + trigger
│   │   └── 0002_seed_settings.sql
│   └── seed\seed.mjs              ← ย้ายข้อมูลเดิมเข้า DB (รันซ้ำได้)
│
├── scripts\
│   ├── admin-create.mjs           ← สร้างผู้ดูแล (ถามรหัสผ่านแบบซ่อน)
│   └── export-snapshot.mjs        ← ดึง DB กลับ data/courses.js
│
├── data\
│   ├── courses.js          ← snapshot จาก DB (สำหรับเดโม HTML)
│   └── courses.d.ts        ← type declaration ให้ TS อ่าน .js ได้
│
├── app\                    ← เวอร์ชัน Next.js (App Router)
│   ├── layout.tsx          ← root layout + next/font + globals.css
│   ├── page.tsx            ← หน้าแรก
│   ├── globals.css
│   ├── icon.svg            ← favicon (Next inject ให้เอง)
│   ├── lib\
│   │   ├── types.ts          ← interfaces ทั้งหมด
│   │   ├── data.ts           ← re-export จาก queries.ts
│   │   ├── queries.ts        ← อ่านข้อมูล (DB หรือ fallback ไฟล์)
│   │   ├── schemas.ts        ← zod ทุก entity
│   │   ├── covers.ts         ← token สี -> Tailwind class (17 สี)
│   │   ├── format.ts         ← formatBaht / relativeTime
│   │   ├── import-parse.ts   ← แปลง CSV/JSON สำหรับนำเข้า
│   │   └── supabase\         ← env, client, server, admin
│   ├── components\         ← Header, Hero, Footer, CourseGrid, CourseCard, Plans
│   │   └── admin\           ← ui, CoverPicker, TagInput, Repeater, SubmitButton
│   ├── admin\
│   │   ├── actions.ts       ← Server Actions ทั้งหมด
│   │   ├── queries.ts       ← คิวรีฝั่งแอดมิน (ต้องล็อกอิน)
│   │   ├── login\  setup\   ← นอก route group (ไม่ต้องล็อกอิน)
│   │   └── (panel)\         ← หน้าที่ต้องล็อกอิน (มี sidebar + guard)
│   │       ├── page.tsx              ← แดชบอร์ด
│   │       ├── courses\  import\  new\  [id]\
│   │       ├── instructors\  plans\  categories\  settings\
│   ├── courses\page.tsx    ← /courses
│   │   └── [slug]\page.tsx ← /courses/[slug]
│   ├── plans\page.tsx      ← /plans
│   └── about\page.tsx      ← /about
│
├── package.json            ← Next.js + Tailwind 3
├── postcss.config.mjs      ← จำเป็น: ไม่มีไฟล์นี้ Tailwind จะไม่ compile
├── tailwind.config.ts
├── tsconfig.json
├── .eslintrc.json
├── .gitignore
│
└── .kilo-workflow\         ← เอกสารการวางแผน + decision records
    ├── 01-analysis\
    ├── 02-decisions\       ← ADR
    ├── 03-implementation\
    ├── 04-logs\
    └── 05-scripts\
```

---

## กฎเหล็กของโปรเจกต์

1. **ทดสอบก่อนสรุปว่าเสร็จเสมอ** — ห้ามสรุปโดยไม่ได้รันจริง
2. **ฐานข้อมูล Supabase คือแหล่งข้อมูลเดียว** — แก้ผ่านหน้า `/admin`
   `data/courses.js` เป็น *snapshot* สำหรับเดโมเวอร์ชัน HTML เท่านั้น ห้ามแก้มือ
   (ยังไม่ได้ต่อ DB — ถ้ายังไม่ตั้งค่า `.env.local` ระบบจะ fallback ไปอ่านไฟล์นี้)
3. **รายงานตามจริง** — ถ้าทำไม่ได้ให้บอกว่าทำไม่ได้ ห้ามกล่าวอ้างว่าสำเร็จ
4. **Thai encoding** — เขียนไฟล์เป็น UTF-8 เสมอ · ห้ามมี BOM ใน JSON
5. **ห้าม commit รหัสผ่านหรือ key** — ใช้ `.env.local` (ถูก gitignore) เท่านั้น

---

## ข้อควรระวัง

- **remote:** `origin` → https://github.com/peeraponggis/online · push ได้ผ่าน Git Credential Manager แล้ว
- **ยังไม่ได้ตั้ง git identity ระดับเครื่อง** — commit ใหม่ต้องใช้
  `git -c user.name="..." -c user.email="..." commit` หรือตั้ง config เองก่อน
- **state อยู่ใน localStorage** — แก้ได้จากฝั่ง client ไม่ใช่แหล่งความจริง
- **ยังไม่ได้เชื่อม Supabase** — ถ้าเปิดเว็บตอนนี้จะเห็นข้อมูลจากไฟล์ และ `/admin`
  จะพาไปหน้า `/admin/setup` ที่อธิบายขั้นตอน (หน้าเว็บหลักยังใช้ได้ครบ)
- **`data/courses.js` เป็น CommonJS** — ห้ามเพิ่ม `"type": "module"` ใน `package.json`
- **Tailwind ต้องเป็น v3** — `globals.css` ใช้ `@tailwind` directives ของ v3

---

## เอกสารเพิ่มเติม

| ไฟล์ | เนื้อหา |
|---|---|
| `STATUS.md` | สถานะปัจจุบัน + ผลตรวจสอบล่าสุด |
| `IMPORT_GUIDE.html` | ฟิลด์ทุกตัวของคอร์ส + ตัวอย่างค่า |
| `.kilo-workflow/02-decisions/02-final-decisions.md` | ADR 4 ข้อ (stack) |
| `.kilo-workflow/02-decisions/03-admin-panel.md` | ADR หน้าแอดมิน (ที่เก็บข้อมูล, auth, cover token) |
| `.kilo-workflow/03-implementation/01-implementation-plan.md` | แผนงาน + สถานะราย phase |

---

*repo นี้สร้างโดย lung pee — ดู https://github.com/peeraponggis/online*
