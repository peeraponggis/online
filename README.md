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

## คำสั่งตรวจสอบ

| คำสั่ง | ผลที่ถูกต้อง |
|---|---|
| `node test.js` | `ผ่าน 96  \|  ไม่ผ่าน 0` และ exit code 0 |
| `node test-ui.mjs` | `ผ่าน 115 \| ไม่ผ่าน 0` (ขับ Microsoft Edge จริง) |
| `node --check server.js` | ไม่มี output |
| `npm.cmd run typecheck` | exit 0 |
| `npm.cmd run lint` | ไม่มี warning/error |
| `npm.cmd run build` | exit 0 · 19 หน้า static |
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

**UI จริง — `test-ui.mjs` (115 assertions)**
ใช้ `playwright-core` ขับ **Microsoft Edge** ที่ติดตั้งอยู่ในเครื่องอยู่แล้ว
(ไม่ดาวน์โหลดเบราว์เซอร์เพิ่ม) ต้องรัน `npm.cmd run build` ก่อน เพราะสคริปต์ต้องการ production build

| กลุ่ม | ครอบคลุม |
|---|---|
| responsive | 5 route × 3 ขนาดจอ (375 / 768 / 1440) — ไม่มี horizontal overflow, ไม่มี console error, ไม่มี uncaught exception |
| hamburger | มือถือแสดง / เดสก์ท็อปซ่อน · `aria-expanded` สลับถูก · คลิกลิงก์แล้วนำทางและปิดเมนู |
| การโต้ตอบ | search / filter หมวด / filter ระดับ / sort · empty state · ล้างตัวกรอง |
| contrast | ทุกหน้าไม่มีข้อความที่มองไม่เห็น (อ่าน gradient จริงจาก `background-image`) |
| เวอร์ชัน HTML | การ์ด 12 ใบ · สถิติ 13,801 / 4.8 · คู่มือเปิดได้ |

เก็บภาพหน้าจอไว้ที่ `%TEMP%\courseweb-ui` (19+ ภาพ)

---

## โครงสร้างโปรเจกต์

```
C:\LocalAI\courseweb\
├── index.html              ← เวอร์ชัน HTML หลัก
├── app.js                  ← logic ทั้งหมดของเวอร์ชัน HTML
├── server.js               ← static server (GET/HEAD เท่านั้น)
├── test.js                 ← unit test 96 assertions
├── test-ui.mjs             ← browser test 115 assertions (Edge จริง)
├── icon.svg                ← favicon
├── IMPORT_GUIDE.html       ← คู่มือฟิลด์สำหรับนำเข้าคอร์ส
│
├── data\
│   ├── courses.js          ← ★ แหล่งข้อมูลเดียว แก้ที่นี่
│   └── courses.d.ts        ← type declaration ให้ TS อ่าน .js ได้
│
├── app\                    ← เวอร์ชัน Next.js (App Router)
│   ├── layout.tsx          ← root layout + next/font + globals.css
│   ├── page.tsx            ← หน้าแรก
│   ├── globals.css
│   ├── icon.svg            ← favicon (Next inject ให้เอง)
│   ├── lib\
│   │   ├── types.ts        ← interfaces
│   │   └── data.ts         ← สะพานอ่าน data/courses.js
│   ├── components\         ← Header, Hero, Footer, CourseGrid, CourseCard, Plans
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
2. **แก้ข้อมูลคอร์สที่ `data/courses.js` ไฟล์เดียว** — ห้าม hardcode คอร์สในไฟล์อื่น
3. **รายงานตามจริง** — ถ้าทำไม่ได้ให้บอกว่าทำไม่ได้ ห้ามกล่าวอ้างว่าสำเร็จ
4. **Thai encoding** — เขียนไฟล์เป็น UTF-8 เสมอ

---

## ข้อควรระวัง

- **remote:** `origin` → https://github.com/peeraponggis/online · push ได้ผ่าน Git Credential Manager แล้ว
- **ยังไม่ได้ตั้ง git identity ระดับเครื่อง** — commit ใหม่ต้องใช้
  `git -c user.name="..." -c user.email="..." commit` หรือตั้ง config เองก่อน
- **state อยู่ใน localStorage** — แก้ได้จากฝั่ง client ไม่ใช่แหล่งความจริง
- **ยังไม่มี Supabase** — ทุกอย่างเป็น client-side mock
- **`data/courses.js` เป็น CommonJS** — ห้ามเพิ่ม `"type": "module"` ใน `package.json`
- **Tailwind ต้องเป็น v3** — `globals.css` ใช้ `@tailwind` directives ของ v3

---

## เอกสารเพิ่มเติม

| ไฟล์ | เนื้อหา |
|---|---|
| `STATUS.md` | สถานะปัจจุบัน + ผลตรวจสอบล่าสุด |
| `IMPORT_GUIDE.html` | ฟิลด์ทุกตัวของคอร์ส + ตัวอย่างค่า |
| `.kilo-workflow/02-decisions/02-final-decisions.md` | ADR 4 ข้อพร้อมเหตุผล |
| `.kilo-workflow/03-implementation/01-implementation-plan.md` | แผนงาน + สถานะราย phase |

---

*repo นี้สร้างโดย lung pee — ดู https://github.com/peeraponggis/online*
