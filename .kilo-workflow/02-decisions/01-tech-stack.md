# Decision Record
## Date: 2026-09-26
## Status: ACCEPTED

> **ปิดสถานะ:** การตัดสินใจฉบับเต็มพร้อมเหตุผลและผลกระทบอยู่ที่
> [`02-final-decisions.md`](./02-final-decisions.md) — ไฟล์นี้เป็นตัวสรุปสั้น

### Decision: Technology Stack Selection

#### Options
1. **Cloudflare + Supabase (SELECTED)**
   - Pros: Free tier, commercial use allowed, no server to patch, Postgres + Auth + RLS ready
   - Cons: Vendor lock-in, free tier limits

2. **Self-hosted VPS**
   - Pros: Full control, lower long-term cost
   - Cons: High maintenance, security burden on a solo developer

3. **AWS + Serverless**
   - Pros: Highly scalable
   - Cons: Complex, exceeds Tier 0 budget

#### Decision
**ACCEPTED — Cloudflare Pages/Workers + Supabase (Postgres + Auth) + Next.js 15 App Router
+ TypeScript + Tailwind 3 + PromptPay/SlipOK**

#### Rationale
- ข้อบังคับหลักคือ "ทีม 1 คน" ไม่มีเวลาดูแล OS ของเซิร์ฟเวอร์
- ข้อมูล LMS เป็น relational ชัดเจน → Postgres เหมาะกว่า Firestore
- Tailwind ต้อง pin **v3** เพราะ `app/globals.css` ใช้ `@tailwind` directives
  (v4 เปลี่ยนเป็น CSS-first config)
- ตลาดไทยต้องใช้ PromptPay ไม่ใช่ Stripe

#### Implementation constraints
ที่ต้องทำตามเพื่อให้ stack นี้ใช้ได้จริง:
1. `package.json` ต้องมี `postcss`, `autoprefixer`, `tailwindcss@^3.4`, `typescript`, `@types/*`
2. ต้องมีไฟล์ `postcss.config.mjs` ไม่งั้น Tailwind ไม่ถูก compile
3. `tailwind.config.ts` ต้องใช้ `export default` ไม่ใช่ `module.exports`
4. `tailwind.config.ts` → `content` ต้องรวม `./data/**/*.{js,ts}` เพราะ gradient class
   อยู่ใน string ของ `data/courses.js` ที่อยู่นอก `app/`
5. **ห้ามเพิ่ม** `"type": "module"` ใน `package.json` — `data/courses.js` เป็น CommonJS

See `02-final-decisions.md` for the full ADR.
