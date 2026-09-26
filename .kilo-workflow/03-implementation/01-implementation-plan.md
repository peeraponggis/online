# Implementation Plan & Status

> อัปเดต: 2026-09-26
> สถานะ: **Phase 0 เสร็จแล้ว (ยืนยันด้วยการรันจริง)** · Phase 1 เริ่มแล้วแต่ยังไม่มีของจริง

---

## Phase 0 — ทำให้ Next.js build ผ่าน (เสร็จแล้ว 2026-09-26)

ปัญหาที่พบตอนตรวจสอบ และสถานะปัจจุบัน:

| # | ปัญหา | สถานะ |
|---|---|---|
| 1 | `app/page.tsx` import ผิด path ทั้ง 4 (`./Hero` → `./components/Hero`) | ✅ แก้แล้ว |
| 2 | `app/layout.tsx` import `Home` จาก `./page` และไม่ render `{children}` | ✅ แก้แล้ว |
| 3 | `app/layout.tsx` ไม่ import `./globals.css` → Tailwind ไม่เคยโหลด | ✅ แก้แล้ว |
| 4 | `package.json` ไม่มี `devDependencies` เลย | ✅ แก้แล้ว |
| 5 | ไม่มีไฟล์ `postcss.config.mjs` | ✅ สร้างแล้ว |
| 6 | `tailwind.config.ts` ใช้ `module.exports` ในไฟล์ `.ts` | ✅ เปลี่ยนเป็น `export default` |
| 7 | `content` ของ Tailwind ไม่ครอบคลุม `data/courses.js` (gradient class) | ✅ เพิ่มแล้ว |
| 8 | ไม่มี `.gitignore` | ✅ สร้างแล้ว |

**เกณฑ์ผ่าน (DoD):** `node test.js` exit 0 · `node --check server.js` ผ่าน ·
endpoint ตอบถูกต้อง · `npm run build` exit 0

---

## เสร็จแล้ว — ต้นแบบ HTML (`index.html` + `app.js`)

ต้นแบบนี้ใช้งานได้จริงที่ http://localhost:8080 และมีเทสต์ครอบ

| ฟีเจอร์ | สถานะ |
|---|---|
| 12 คอร์ส + 3 แพ็กเกจ + 6 ผู้สอน จาก `data/courses.js` | ✅ |
| ค้นหา (title + desc) | ✅ |
| กรอง หมวด / ระดับ / ราคาสูงสุด | ✅ |
| เรียงลำดับ 5 แบบ | ✅ |
| Modal รายละเอียด (syllabus, ไฟล์ประกอบ, ผู้สอน) | ✅ |
| ตะกร้าซื้อ + เปลี่ยนจำนวน + ลบ | ✅ |
| Checkout + QR PromptPay + เศษสตางค์เฉพาะออเดอร์ | ✅ จำลอง |
| แพ็กเกจ 3 ระดับ + tier gating (Pro ถึง Tier 2) | ✅ |
| เครดิตสมาชิก + โควตา | ✅ |
| My Courses + ความคืบหน้า + localStorage | ✅ |
| XSS escape ครบทุกจุดที่ inject HTML | ✅ |
| เทสต์ 59 assertions | ✅ ผ่าน 59 / ไม่ผ่าน 0 |

---

## เสร็จแล้ว — โครงสร้าง Next.js

| ไฟล์ | หน้าที่ |
|---|---|
| `app/lib/types.ts` | TypeScript interfaces ตรงกับ `data/courses.js` 21 ฟิลด์ |
| `app/lib/data.ts` | สะพานเดียวอ่าน `data/courses.js` — **single source of truth** |
| `data/courses.d.ts` | type declaration ให้ `.js` ผ่าน `strict: true` |
| `app/layout.tsx` | root layout + Google Fonts + globals.css |
| `app/page.tsx` | หน้าแรก + สถิติจากข้อมูลจริง |
| `app/components/CourseGrid.tsx` | search + filter + sort (client component) |
| `app/components/CourseCard.tsx` | การ์ดจาก `Course` type จริง |
| `app/components/Plans.tsx` | แพ็กเกจจาก `PLANS` จริง |
| `app/courses/page.tsx` | หน้า list คอร์ส |
| `app/courses/[slug]/page.tsx` | หน้ารายละเอียด + `generateStaticParams` |
| `app/plans/page.tsx` | หน้าแพ็กเกจ + ตารางเปรียบเทียบ |
| `app/about/page.tsx` | เกี่ยวกับเรา |

---

## เสร็จแล้ว — ความปลอดภัยของ `server.js`

| ช่องโหว่เดิม | แก้แล้ว |
|---|---|
| `decodeURIComponent` โยน error ได้ → process crash | ห่อ try/catch → `400` |
| NUL byte (`/%00`) ทำให้ `fs.readFile` throw | กรองก่อนใช้ → `400` |
| `startsWith(ROOT)` เป็น prefix check ไม่ใช่ path boundary | เทียบ `ROOT + path.sep` → `403` |
| ไม่มี method restriction | รับเฉพาะ GET/HEAD → `405` + `Allow` |
| ไม่มี security header | เพิ่ม `X-Content-Type-Options: nosniff` + `Content-Length` |

---

## Phase 1 — MVP ที่ยังไม่เริ่ม

- [ ] Supabase auth จริง (login / register / session)
- [ ] Course CRUD ฝั่ง admin
- [ ] Enrollment จริง (ซื้อ / แลกเครดิต → บันทึก DB)
- [ ] SlipOK API ตรวจสลิปจริง
- [ ] Video streaming + signed URL
- [ ] Admin dashboard

## Phase 2 — Automation (ยังไม่เริ่ม)

- [ ] ตรวจสลิปอัตโนมัติ
- [ ] ระบบสมาชิกจริง + โควตา
- [ ] Anti-bot / rate limiting
- [ ] Dashboard + รายงานรายได้

## Phase 3 — Hardening (ยังไม่เริ่ม)

- [ ] DRM + watermarking
- [ ] Fraud scoring
- [ ] Security hardening + penetration test

## Phase 4 — Scale (ยังไม่เริ่ม)

- [ ] Certificates
- [ ] Mobile app
- [ ] A/B testing

---

## สิ่งที่ต้องระวัง

1. **ระบบชำระเงินปัจจุบันเป็น mock** — `fakeApprove()` อนุมัติอัตโนมัติโดยไม่ตรวจสอบ
   ห้ามเปิดขายจริงจนกว่าจะต่อ SlipOK และเก็บสลิปใน private bucket
2. **state อยู่ใน localStorage** — แก้ได้จากฝั่ง client ไม่ใช่แหล่งความจริง
3. **โปรเจกต์ยังไม่มี git repository** — ควร `git init` เพื่อมีประวัติการแก้ไข
