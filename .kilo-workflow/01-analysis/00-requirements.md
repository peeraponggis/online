# Analysis Document — Requirements

## Project: LMS Online Course Platform

> อัปเดต: 2026-09-26

---

## ข้อบังคับทางเทคนิค

| ข้อ | ค่า |
|---|---|
| งบ | จำกัด — เริ่มที่ free tier (Tier 0) |
| กรอบเวลา | MVP 6–8 สัปดาห์ |
| ทีม | Solo developer (1 คน) |
| ตลาด | ไทย → ต้องรองรับ PromptPay |

---

## In scope ตอนนี้

### A. เว็บหน้าหลัก (เสร็จแล้ว)
- แสดงคอร์สจากแหล่งข้อมูลเดียว (`data/courses.js`)
- ค้นหา / กรอง / เรียงลำดับ
- หน้ารายละเอียดคอร์ส (syllabus, ไฟล์ประกอบ, ผู้สอน, ระดับสิทธิ์)
- หน้าแพ็กเกจ + หน้าเกี่ยวกับเรา
- เวอร์ชันสองชุด: HTML vanilla (`localhost:8080`) และ Next.js (`npm run dev`)

### B. ต้นแบบเชิงธุรกิจ (ยังเป็น mock — ต้องทำต่อ)
- ตะกร้าซื้อและ checkout
- ระบบสมาชิก 3 ระดับ + เครดิต + tier gating
- ความคืบหน้าการเรียน

### C. คุณภาพโค้ด
- แก้ข้อความไทยที่เสียหายจาก encoding
- ปิดช่องโหว่ static server
- มี unit test ที่รันได้โดยไม่ต้องเปิด browser
- มี `.gitignore` และเอกสารที่ตรงกับความจริง

---

## Later / not started

รายการต่อไปนี้ **ยังไม่มีแม้แต่ต้นแบบ** — ไม่ใช่ส่วนที่ทำค้าง แต่เป็นขอบเขตของ Phase ถัดไป

| หัวข้อ | เหตุผลที่ยังไม่ทำ |
|---|---|
| Video streaming | ยังเลือกไม่ได้ว่า Bunny Stream หรือ Cloudflare Stream |
| DRM / watermarking | ต้องเลือก hosting ก่อน |
| Admin dashboard | ต้องมี auth ก่อนจึงจะมีสิทธิ์ admin ได้ |
| Auto slip verification | ต้องต่อ SlipOK API ก่อน |
| Anti-bot / fraud scoring | ต้องมี traffic จริงก่อนจะวัดได้ |
| Certificate / mobile app | Phase 4 |

> **ข้อเตือน:** ระบบชำระเงินที่มีอยู่ตอนนี้เป็น **mock** เท่านั้น —
> QR สร้างจาก library ฝั่ง client, ไม่มีการยืนยันกับธนาคร,
> และปุ่มอนุมัติเรียก `fakeApprove()` โดยตรง **ห้ามใช้ขายจริง**

---

## ตัวเลือก architecture ที่พิจารณา

1. Self-hosted (VPS + Nginx)
2. **Cloud-native (Cloudflare + Supabase)** ← เลือก
3. Hybrid approach

เหตุผลการเลือกอยู่ที่ `../02-decisions/02-final-decisions.md`

---

## ค่าใช้จ่าย

| Tier | รายเดือน | สิ่งที่ได้ |
|---|---|---|
| Tier 0 | ~35 ฿ | Cloudflare Pages + Supabase Free (มีแค่ค่าโดเมน) |
| Tier 1 | 500–800 ฿ | + Bunny Stream, Supabase Pro, Slip API |
| Tier 2 | 3,000–9,000 ฿ | + Cloudflare Pro, streaming เต็มรูปแบบ |

รายละเอียดที่ `02-cost-analysis.md`

---

## Definition of Done

ตรวจสอบได้ด้วยคำสั่งจริง ไม่ใช่ความรู้สึกว่าเสร็จ

| # | เกณฑ์ | คำสั่งตรวจ |
|---|---|---|
| DoD-1 | Logic ถูกต้อง | `node test.js` → exit 0 (59 assertions) |
| DoD-2 | Syntax ถูกต้อง | `node --check server.js` → ไม่มี output |
| DoD-3 | เว็บ HTML ใช้ได้ | `node server.js 8080` แล้วเปิด http://localhost:8080 |
| DoD-4 | เว็บ Next.js build ได้ | `npm.cmd run build` → exit 0 |
| DoD-5 | Route ครบ | `/`, `/courses`, `/courses/[slug]`, `/plans`, `/about` ตอบ 200 |
| DoD-6 | ไม่มีข้อความเสียหาย | grep อักษรจีน/ญี่ปุ่นใน `app/` → ไม่พบ |
| DoD-7 | ข้อมูลแหล่งเดียว | แก้ `data/courses.js` แล้วทั้งสองเวอร์ชันเปลี่ยนตาม |
