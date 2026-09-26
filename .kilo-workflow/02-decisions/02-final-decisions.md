# Decision Record — Final Decisions

> วันที่ตัดสินใจ: 2026-09-26
> สถานะ: **ACCEPTED**
> ผู้รับผิดชอบ: solo developer (Kilo + ผู้ใช้)
> ไฟล์นี้ปิดช่องว่าง `PENDING` ที่ค้างอยู่ใน `01-tech-stack.md`

---

## บริบทรวม

โปรเจกต์เป็นแพลตฟอร์มขายคอร์สออนไลน์ (LMS) ที่ต้องการขายจริงในอนาคต
ข้อบังคับหลัก 3 ข้อจาก `01-analysis/00-requirements.md`:

1. **งบจำกัด** — เริ่มที่ free tier ได้ เพราะยังไม่มีลูกค้า
2. **ทีม 1 คน** — ไม่มีเวลาดูแลเซิร์ฟเวอร์
3. **MVP 6–8 สัปดาห์**

ข้อบังคับเฉพาะของโปรเจกต์นี้: ระบบชำระเงินต้องเป็น **PromptPay** (ตลาดไทย) ไม่ใช่ Stripe

---

## การตัดสินใจ 1 — Hosting: Cloudflare Pages + Workers

**ตัวเลือกที่พิจารณา**

| ตัวเลือก | ข้อดี | ข้อเสีย |
|---|---|---|
| Cloudflare Pages/Workers | Free tier ใจดี, ไม่ต้องดูแล OS, auto TLS | ควบคุม infra ไม่ได้, ต้องเขียน Worker แทน server ทั่วไป |
| VPS + Nginx | ควบคุมเต็มที่, ค่าใช้จ่ายต่ำเมื่อ scale | ต้องอัปเดต patch เอง, ความปลอดภัยเป็นภาระของคนเดียว |
| AWS + Serverless | scale ได้ไกล | ซับซ้อน, แพง, เกินงบ Tier 0 |

**ตัดสินใจ: Cloudflare Pages + Workers**

**เหตุผล**
- ตรงกับข้อบังคับ "ทีม 1 คน" มากที่สุด — ไม่มีเซิร์ฟเวอร์ให้ดูแล
- Free tier รองรับ static + Worker เพียงพอสำหรับ MVP
- Cloudflare R2 ใช้แทน S3 ได้โดยไม่มี egress fee (สำคัญกับวิดีโอ)

**ผลกระทบ**
- Business logic ต้องเขียนเป็น Worker (edge runtime) — เลือกใช้ Hono หรือ plain JS ไม่ใช้ framework หนัก ๆ
- ต้องหลีกเลี่ยง Node API ที่ไม่รองรับบน edge runtime
- ถ้าต้องใช้ WebSocket ต่อ อาจต้องย้ายไป Fly.io / Railway ภายหลัง

---

## การตัดสินใจ 2 — Database และ Auth: Supabase

**ตัวเลือกที่พิจารณา**

| ตัวเลือก | ข้อดี | ข้อเสีย |
|---|---|---|
| Supabase | Postgres จริง, auth + storage + RLS ให้พร้อม, free tier | ผูกกับ vendor, free tier จำกัด |
| PlanetScale + NextAuth | Postgres จัดการง่าย | ต้องเขียน auth เอง, ค่าใช้จ่ายเริ่มสูงกว่า |
| Firebase | realtime แข็ง, SDK ดี | โมเดลข้อมูลไม่ใช่ relational, query ยากกว่า, migration เจ็บ |

**ตัดสินใจ: Supabase (Postgres + Auth + Storage)**

**เหตุผล**
- ข้อมูล LMS เป็น relational ชัดเจน (course → lesson → enrollment → order) Postgres ตอบโจทย์กว่า
- Supabase Auth ลดงานเรื่อง password reset / email verify / session ลงเหลือศูนย์
- RLS (Row Level Security) ช่วยแยกข้อมูลผู้เรียนออกจากกันโดยไม่ต้องเขียน permission logic เอง
- ใช้งานการค้าได้เชิงพาณิชย์โดยไม่ต้องจ่าย (ต่างจาก Firebase ที่คิดตาม read)

**ผลกระทบ**
- ต้องออกแบบ schema ก่อนเขียน UI — ใช้ migration ไฟล์เวอร์ชัน ไม่แก้ตารางมือ
- ต้องเขียน RLS policy ทุกตารางที่มีข้อมูลส่วนบุคคล **ก่อน**ขึ้น production
- ต้องเตรียม Supabase client เป็น `@supabase/supabase-js` (เพิ่มใน package.json ของโปรเจกต์จริง)

---

## การตัดสินใจ 3 — Frontend: Next.js App Router + TypeScript + Tailwind

**ตัวเลือกที่พิจารณา**

| ตัวเลือก | ข้อดี | ข้อเสีย |
|---|---|---|
| Next.js App Router | SSR/SSG ได้, route เป็นระบบไฟล์, deploy บน Cloudflare ได้ | learning curve ของ server component |
| Astro | เร็ว, น้ำหนักเบา | ecosystem ชุมชนเล็กกว่า, interactive ต้องเขียน island เอง |
| SvelteKit | bundle เล็กสุด, DX ดี | จำนวนคนที่รู้จักน้อยกว่า, จ้างต่อยอดยาก |

**ตัดสินใจ: Next.js 15 App Router + TypeScript + Tailwind 3**

**เหตุผล**
- ตรงกับ Cloudflare Pages (คำตัดสินใจ 1) โดยตรง
- `generateStaticParams` ทำให้หน้ารายละเอียดคอร์สเป็น static ได้ → เร็วและประหยัด
- TypeScript จับ type mismatch ของข้อมูลคอร์สได้ก่อนรัน (สำคัญเพราะข้อมูลมาจากไฟล์เดียว)
- Tailwind **ต้อง pin เป็น v3** เพราะ `app/globals.css` ใช้ `@tailwind base/components/utilities`
  ซึ่งเป็น syntax ของ v3 (v4 เปลี่ยนเป็น `@import "tailwindcss"` และ config เป็น CSS-first)

**ผลกระทบ**
- `content` ใน `tailwind.config.ts` ต้องรวม `./data/**/*.{js,ts}` เพราะ gradient class
  (`cover`) ถูกเก็บเป็น string ใน `data/courses.js` ซึ่งอยู่นอก `app/` — ถ้าไม่รวม Tailwind จะไม่ generate class เหล่านั้น
- ห้ามเพิ่ม `"type": "module"` ใน `package.json` เพราะ `data/courses.js` เป็น CommonJS
  (`module.exports`) และต้องถูก resolve เป็น CJS
- ต้องมี `postcss.config.mjs` มิฉะนั้น Tailwind จะไม่ถูก compile

---

## การตัดสินใจ 4 — ระบบชำระเงิน: PromptPay + SlipOK

**ตัวเลือกที่พิจารณา**

| ตัวเลือก | ข้อดี | ข้อเสีย |
|---|---|---|
| SlipOK | API ตรงไทย, ราคาถูก, อ่านสลิป QR พร้อม | ผูกกับประเทศ, ต้องเก็บสลิปเอง |
| PromptPay QR ตรง | ไม่มีค่าใช้จ่าย, ควบคุมได้เต็มที่ | ต้องเขียน QR generation + ต้องหาวิธีตรวจสลิปเอง |
| Stripe | ระบบนิยาม, ดูแลภาษีให้ | ไม่รองรับ PromptPay, ขายไทยต้องมีบริษัทต่างประเทศ |

**ตัดสินใจ: PromptPay (QR) + SlipOK (ตรวจสลิปอัตโนมัติ)**

**เหตุผล**
- คนไทยจ่ายผ่าน QR เป็นหลัก — บังคับให้โอนผ่านแอปธนาคาร/พร้อมเพย์
- ใช้ **เศษสตางค์เฉพาะออเดอร์** (1–99 สตางค์) เป็นตัวระบุออเดอร์
  เพราะยอดชนกันได้ง่ายมาก — นี่คือเทคนิคมาตรฐานที่ `app.js` จำลองไว้แล้ว
- SlipOK อ่านสลิปให้ ไม่ต้องเขียน OCR เอง

**ผลกระทบ — ข้อบังคับด้านความปลอดภัย**
- **ห้ามขายจริงจนกว่าจะต่อ SlipOK API จริง** — ปุ่ม `fakeApprove()` ใน `app.js`
  เป็นการอนุมัติอัตโนมัติโดยไม่มีการตรวจสอบ ห้ามเปิดขายทั้งขณะที่ยังเรียกฟังก์ชันนี้
- **สลิปต้องเก็บใน private bucket** ห้ามเก็บใน `public/` (ซึ่งเปิด URL ได้ทันที)
- ต้องมี rate limit ต่อ IP และต่อ order code
- ต้องเก็บ order → slip mapping ในฐานข้อมูล ไม่ใช่ localStorage (localStorage เป็นฝั่ง client และแก้ได้)

---

## สิ่งที่ยังไม่ตัดสินใจ

| หัวข้อ | เหตุผลที่ยังไม่ตัดสินใจ |
|---|---|
| Video hosting | Bunny Stream vs Cloudflare Stream — ขึ้นกับรูปแบบ DRM ที่เลือกใน Phase 3 |
| Email service | Resend vs Supabase Auth built-in — ต้องดูปริมาณจริง |
| Deploy ของ Next.js | Cloudflare Pages (static) vs Node server — ขึ้นกับว่าเรียนเองมี logic server-side แค่ไหน |

---

*ไฟล์นี้ควรอัปเดตเมื่อมีการเปลี่ยน stack — เขียน ADR ใหม่แทนการแก้ของเดิม*
