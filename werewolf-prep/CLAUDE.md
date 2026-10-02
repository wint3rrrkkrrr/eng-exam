# CLAUDE.md — คู่มือสำหรับ Claude ที่ทำงานใน repo นี้

## โปรเจกต์นี้คืออะไร
**Winter Community** (เดิมชื่อ WINTER Prep Hub) — ชุมชนเกม/เพื่อน + เว็บคลังข้อสอบ ม.5 ภาษาไทย (React 19 + Vite 6 + TypeScript + Tailwind 4 + motion + lucide-react)
เจ้าของเว็บ **ไม่ถนัดเขียนโค้ด** → อธิบายเป็นภาษาไทยง่ายๆ อธิบายศัพท์เทคนิคทุกครั้งที่ใช้ และทุกครั้งที่จบขั้นตอนให้บอก **วิธีรัน** และ **วิธีทดสอบ** เป็นข้อๆ

ในเว็บนี้มี 2 ส่วน:
1. **ระบบข้อสอบ** — `src/App.tsx` + `src/components/` + `src/data/`
2. **เกม "หนูชีสอยู่ไหน?"** — `src/components/cheese-game/` (เกมเดิม **ห้ามแก้**)

## งานที่กำลังทำอยู่: เพิ่มเกมแววูฟ (Werewolf)

อ่านเอกสารเหล่านี้ **ก่อนเขียนโค้ดทุกครั้ง** (ลำดับความสำคัญของกติกา: OPEN_QUESTIONS → SPECIAL_ROLES → RULEBOOK_OWNER → RULES):

| ไฟล์ | เนื้อหา |
|---|---|
| `docs/werewolf/BRIEF.md` | โจทย์ต้นฉบับจากเจ้าของเว็บ (ข้อกำหนดทั้งหมด) |
| `docs/werewolf/REUSE_AUDIT.md` | ผลตรวจของเก่า — อะไรใช้ซ้ำได้ อะไรห้ามลอก **อ่านข้อ 9 (กฎเหล็ก 5 ข้อ) ให้ครบ** |
| `docs/werewolf/RULES.md` | กติกาฉบับ 50 บท: ท่อประมวลผลกลางคืน 10 ขั้น ทะเบียนบท เงื่อนไขชนะ ข้อสมมติ 🔸 |
| `docs/werewolf/RULEBOOK_OWNER.md` | กติกา 50 บทต้นฉบับจากเจ้าของเว็บ (**ห้ามแก้เนื้อหา**) |
| `docs/werewolf/SPECIAL_ROLES.md` | สเปกบทพิเศษ 6 บท + ระบบฝ่ายชนะ (จากเจ้าของเว็บ) |
| `docs/werewolf/GAME_SPEC.md` | สถาปัตยกรรม โครงข้อมูล API contract รายการเทสต์ |
| `docs/werewolf/OPEN_QUESTIONS.md` | คำถาม-คำตอบ (Q1–Q23 ปิดแล้ว · Q24 รอยืนยัน) — **ห้ามเดาแล้วทำต่อ** |
| `docs/werewolf/PLAN.md` | แผนงาน M0–M7 + สถานะ + ไฟล์ที่จะแตะ |

### กฎเหล็ก (ห้ามละเมิด)
1. **ห้ามแก้เกมหนูชีส** — ไม่แตะ `src/components/cheese-game/**`, `src/utils/cheeseGameClient.ts` และไม่แตะตาราง `cheese_*` / `winter_*`
   ถ้าจำเป็นต้องแก้ไฟล์ส่วนกลาง (เช่น `src/App.tsx`) → แจ้งเหตุผลและทดสอบว่าเกมเดิมยังเล่นได้
2. โค้ดแววูฟอยู่ใน `src/games/werewolf/` + `netlify/functions/ww-*` เท่านั้น · ตาราง Supabase ขึ้นต้น `ww_` เท่านั้น · SQL แยกไฟล์ `supabase_werewolf_setup.sql`
3. **`src/App.tsx` แตะได้แค่ 3 จุด:** import, state `showWerewolfGame`, early return + ปุ่มเข้าเกม
4. **ห้ามใส่คอลัมน์ `role` (หรือข้อมูลลับอื่น) ลงตารางที่ `anon` อ่านได้** — แยกตารางเปิด/ลับตั้งแต่แรก
5. **`SUPABASE_SERVICE_ROLE_KEY` ห้ามอยู่ในโค้ดฝั่งเบราว์เซอร์ ห้ามขึ้นต้น `VITE_` ห้าม commit** (ใช้ได้แค่ใน `netlify/functions/`)
6. ชื่อ Supabase Realtime channel **ต้องไม่ซ้ำกัน** ทุกครั้งที่ subscribe (เกมเดิมพังทั้งหน้าเพราะเรื่องนี้ — ดู `REUSE_AUDIT.md` ข้อ 3.1)
7. `src/games/werewolf/engine/` **ห้าม import** `react`, `@supabase/supabase-js`, `motion` (ต้องเป็น TypeScript ล้วนเพื่อเขียนเทสต์ได้)
8. ข้อความทุกอย่างในเกม **เป็นภาษาไทย** (ชื่อตัวแปร/โค้ดเป็นอังกฤษได้) เก็บข้อความไว้ที่ `src/games/werewolf/text/th.ts`
9. เจอบั๊กหรือกติกากำกวม → **หยุดแล้วถาม** จดลง `OPEN_QUESTIONS.md` อย่าเงียบๆ ตัดสินใจเอง
10. ทำ **ทีละ milestone** จบแล้วหยุดให้ผู้ใช้ทดสอบก่อนไปต่อ · commit แยกต่อ milestone

## คำสั่งที่ใช้

```bash
npm install          # ติดตั้ง dependency
npm run dev          # รันเว็บที่ http://localhost:3000
npm run lint         # ตรวจชนิดข้อมูล (tsc --noEmit) — ไม่มี ESLint/Prettier ในโปรเจกต์นี้
npm run build        # build ขึ้น production
npm test             # เทสต์ของเกมแววูฟ (vitest) — 195 ข้อ
npm run sim          # จำลองเกมด้วยบอท ~500 เกม ทุกขนาดพรีเซ็ต
```

## สิ่งที่โปรเจกต์นี้ "ไม่มี" (อย่าสมมติว่ามี)
- ❌ ไม่มี router (สลับหน้าด้วย `useState` ใน `App.tsx`)
- ❌ ไม่มีระบบล็อกอิน (ตัวตน = ชื่อเล่นใน localStorage key `grammar_quiz_username_v1`)
- ⚠️ เทสต์มีเฉพาะเกมแววูฟ (`src/games/werewolf/**`) — ส่วนอื่นของเว็บไม่มีเทสต์
- ❌ ไม่มี ESLint / Prettier / CI
- ❌ ไม่มีคอมโพเนนต์กลาง `<Button>` / `<Modal>`
- ❌ **`server.ts` ไม่ได้ทำงานบนเว็บจริง** — Netlify ปล่อยแค่ static (ยกเว้นเกมแววูฟที่ใช้ Netlify Functions ใน `netlify/functions/ww-*` · ตอน `npm run dev` `server.ts` ต่อ `/api/ww/*` เข้ากับ handlers ชุดเดียวกันด้วยที่เก็บในหน่วยความจำ)
- ❌ ไม่มีตัวแปรสี CSS กลาง (โหมดมืด/สว่างส่งผ่าน prop `isDark: boolean`)

## Git
- branch สำหรับงานนี้: `claude/laughing-johnson-qatda0`
- มีระบบ auto-push: `npm run sync` (ดู `docs/AUTO_SYNC.md`) และ hook ใน `.claude/settings.json` ที่ commit+push ให้อัตโนมัติเมื่อจบทุกเทิร์น
- ห้าม commit ไฟล์ `.env` (`.gitignore` คุมไว้แล้ว)
