# REUSE_AUDIT.md — ตรวจของเก่าก่อนสร้างเกมแววูฟ

> สถานะ: **เสร็จแล้ว (M0)** · อัปเดตล่าสุด: 2026-10-01 · ตรวจจาก commit `306d73a`

เอกสารนี้คือผลการอ่านโค้ดทั้งโปรเจกต์ `wint3rrrkkrrr/eng-exam` ก่อนเริ่มทำเกมแววูฟ
เป้าหมาย: รู้ว่าอะไร **ใช้ของเก่าได้เลย** อะไร **ต้องดึงออกมาเป็นส่วนกลาง** อะไร **ต้องทำใหม่**

---

## 0. สรุปสั้น 10 บรรทัด (อ่านแค่นี้ก็พอ)

1. โปรเจกต์นี้คือ **เว็บเดียว ไฟล์เดียว ไม่มีระบบเปลี่ยนหน้า (routing)** — สลับหน้าด้วยตัวแปร `useState` ใน `src/App.tsx`
2. มีเกมอยู่แล้ว 1 เกม = **"หนูชีสอยู่ไหน?" (Cheese Thief)** อยู่ใน `src/components/cheese-game/`
3. **ระบบเรียลไทม์ = Supabase Realtime + ถามซ้ำทุก 4 วินาที** (ไม่มี WebSocket เอง ไม่มี socket.io)
4. **ไม่มีระบบล็อกอินจริง** — ตัวตนผู้เล่นคือ "ชื่อเล่นที่พิมพ์เอง" เก็บใน localStorage เท่านั้น
5. **`server.ts` (Express) ไม่ได้ทำงานบนเว็บจริง** — Netlify ปล่อยแค่ไฟล์ static · โค้ดหน้าเว็บไม่เรียก `/api/...` เลยแม้แต่ที่เดียว
6. เบราว์เซอร์ **คุยกับ Supabase ตรงๆ** ด้วย anon key
7. **RLS ของเกมเดิมเป็น `allow all`** = ใครก็อ่านบทบาทของคนอื่นได้ → **ห้ามลอกวิธีนี้มาใช้กับแววูฟ**
8. **ไม่มีระบบเทสต์เลย** (ไม่มี vitest/jest) → แววูฟต้องติดตั้งเอง
9. ของที่ยืมมาใช้ได้ทันทีเยอะมาก: ธีมสี, แอนิเมชัน `motion`, ไอคอน `lucide-react`, เสียง, อวตาร์หนู, แชทในห้อง, ระบบบอท, โครงเฟส
10. **ทางเดินที่แนะนำ:** เกมแววูฟต้องมี "เซิร์ฟเวอร์ตัดสิน" จริง → ใช้ **Netlify Functions** (รายละเอียดข้อ 6)

---

## 1. โครงสร้างโฟลเดอร์

```
eng-exam/
├── index.html                      จุดเริ่มของหน้าเว็บ
├── src/
│   ├── main.tsx                    ติด React เข้ากับ <div id="root">
│   ├── App.tsx                     ★ 1,894 บรรทัด — ทั้งเว็บอยู่ในไฟล์นี้
│   ├── types.ts                    ชนิดข้อมูลกลาง (Question, ThemeMode, ...)
│   ├── index.css                   มีบรรทัดเดียว: @import "tailwindcss"
│   ├── components/                 UI ของระบบข้อสอบ (19 ไฟล์)
│   │   └── cheese-game/            ★ เกมเดิม (14 ไฟล์) — แม่แบบที่ดีที่สุดสำหรับแววูฟ
│   │       └── phases/             หน้าจอแยกตามเฟส: lobby / night / day / voting / ended
│   ├── data/                       คลังข้อสอบ ~25 ไฟล์ (ไม่เกี่ยวกับเกม)
│   ├── utils/                      supabaseClient, supabaseSim, cheeseGameClient, audio, confetti, bgmPlayer, ...
│   └── assets/images/
├── server.ts                       Express — ใช้แค่ตอน dev (ดูข้อ 6)
├── netlify.toml                    build + redirect SPA
├── supabase_setup.sql              ตารางหลัก winter_*
├── supabase_cheese_game_setup.sql  ตารางเกมเดิม cheese_*
├── vite.config.ts  tsconfig.json  package.json
└── .env.example
```

**ศัพท์:** *Vite* = เครื่องมือรวมไฟล์+เซิร์ฟเวอร์ตอนพัฒนา · *Tailwind* = เขียนสไตล์ด้วยชื่อคลาสสั้นๆ ใน HTML · *Supabase* = ฐานข้อมูล PostgreSQL บนคลาวด์ที่เบราว์เซอร์เรียกได้ตรง

---

## 2. หน้าเว็บสลับระหว่างเกม/หน้า อย่างไร

**ไม่มี router** (ไม่มี react-router, ไม่มี URL แยกต่อหน้า) ทั้งหมดเป็น `useState` แบบ boolean ใน `App.tsx`:

| ตัวแปร | ไฟล์:บรรทัด | ความหมาย |
|---|---|---|
| `showLandingPage` | `src/App.tsx:169` | หน้าแรก |
| `showSubjectSelector` | `src/App.tsx:177` | หน้าเลือกวิชา |
| `showCheeseGame` | `src/App.tsx:180` | **หน้าเกมหนูชีส** |
| `showHistoryModal`, `showProfileModal` | `src/App.tsx:178-179` | โมดัล |

การสลับเข้าเกมเดิม — ทำแบบ "ออกก่อนทุกอย่าง" (early return) ที่ `src/App.tsx:998`:

```tsx
if (showCheeseGame) {
  return (
    <>
      <CheeseErrorBoundary onBackToHome={() => setShowCheeseGame(false)}>
        <CheeseGameApp username={username} isDark={isDark} onBack={() => setShowCheeseGame(false)} />
      </CheeseErrorBoundary>
      <BgmButton />
    </>
  );
}
```

ปุ่มเข้าเกมอยู่ที่ `src/App.tsx:1165-1175` (ปุ่มไล่สี indigo→purple→rose บนหน้าแรก)

### ➜ สิ่งที่แววูฟต้องทำ
เพิ่ม **state ตัวเดียว** `showWerewolfGame` + **early return ก้อนเดียว** + **ปุ่มเดียว** = แตะ `App.tsx` แค่ 3 จุด ไม่กระทบเกมเดิม

**ข้อจำกัดที่ต้องรู้:** ไม่มี routing = **แชร์ลิงก์เชิญเข้าห้องตรงๆ ไม่ได้** (เช่น `?ww=AB12C`) ถ้าต้องการลิงก์เชิญ ต้องอ่าน query string ตอนเปิดเว็บแล้วเซ็ต state ให้ — เป็นงานเล็ก ทำได้ ไม่ต้องลง react-router (ดู OPEN_QUESTIONS Q6)

---

## 3. ระบบห้อง / ล็อบบี้ / ผู้เล่นหลายคน + เรียลไทม์

### 3.1 รูปแบบที่เกมเดิมใช้ (สำคัญมาก — เป็นแม่แบบ)

```
ผู้เล่นทุกคน (เบราว์เซอร์)
      │  อ่าน/เขียนตรงๆ ด้วย anon key
      ▼
  Supabase (PostgreSQL)
      │  ส่งสัญญาณ "ข้อมูลเปลี่ยนแล้ว" กลับมา
      ▼
ทุกเบราว์เซอร์เรียก refresh() ดึงข้อมูลใหม่ทั้งก้อน
```

**ไม่มีเซิร์ฟเวอร์ตัดสินเลย** — ตรรกะเกมทั้งหมดรันในเบราว์เซอร์ และ "เครื่องเจ้าของห้อง" ทำหน้าที่เป็นผู้ดำเนินเกม

ไฟล์หลัก:
- `src/utils/cheeseGameClient.ts` (440 บรรทัด) — รวมทุกคำสั่งที่คุยกับ Supabase ไว้ที่เดียว (สร้างห้อง, เข้าห้อง, แจกบท, โหวต, แชท, บอท, subscribe)
- `src/components/cheese-game/CheeseRoom.tsx` (114 บรรทัด) — **เปลือกห้อง**: ดึงข้อมูล → แจกให้เฟส → subscribe realtime → เผื่อพลาดด้วย poll

```ts
// src/components/cheese-game/CheeseRoom.tsx:38-46
useEffect(() => {
  refresh();
  const unsubscribe = cheeseGame.subscribeToRoom(roomCode, refresh);
  pollRef.current = setInterval(refresh, 4000);   // ถามซ้ำกันเหตุการณ์หลุด
  return () => { unsubscribe(); clearInterval(pollRef.current); };
}, [roomCode, refresh]);
```

`subscribeToRoom` (`cheeseGameClient.ts:400-416`) ฟัง 4 ตาราง: `cheese_rooms`, `cheese_players`, `cheese_chat`, `cheese_votes`

**บทเรียนที่จดไว้ในโค้ดเดิม (ห้ามทำซ้ำ):** ชื่อ channel ของ Supabase Realtime **ต้องไม่ซ้ำกัน** ถ้าสองคอมโพเนนต์ subscribe ด้วยชื่อเดียวกัน จะพังทั้งหน้า (`cannot add postgres_changes callbacks after subscribe()`) โค้ดเดิมแก้ด้วยการเติมเลขสุ่มท้ายชื่อ — **แววูฟต้องทำแบบเดียวกัน**

### 3.2 รหัสห้อง
`cheeseGameClient.ts:76-86` — สุ่ม 5 ตัวจากชุด `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (ตัด `0 O 1 I` ออกกันอ่านผิด) + เช็กชนกัน 5 ครั้ง → **ลอกใช้ได้เลย**

### 3.3 เจ้าของห้อง (host)
`CheeseRoom.tsx:50` — `isHost = me?.is_host || room.host_username === username`
เจ้าของห้องคือคนที่ "ขับเคลื่อนเกม" ทั้งหมดจากเครื่องตัวเอง: เดินเวลา, สั่งบอท, นับคะแนนโหวต

**ปัญหาที่ต้องแก้ในแววูฟ:** ถ้าเจ้าของห้องปิดแท็บ เกมหยุดนิ่ง — และถ้าเจ้าของห้องแก้โค้ดในเบราว์เซอร์ก็โกงได้

### 3.4 บอททดสอบ
`cheeseGameClient.ts:366-376` — บอทคือ "ผู้เล่นปลอมที่ชื่อขึ้นต้นด้วย 🤖" เก็บในตารางเดียวกับคนจริง และ **เครื่องเจ้าของห้องเล่นแทนบอท** (`CheeseNightPhase.tsx:367-406`) → **แนวคิดดีมาก ใช้ต่อ** (แต่ควรย้ายไปให้เซิร์ฟเวอร์เล่นแทน)

---

## 4. ระบบตัวตนผู้เล่น

**ไม่มีการล็อกอิน ไม่มีรหัสผ่าน ไม่มี Supabase Auth**

| ส่วน | ที่อยู่ | รายละเอียด |
|---|---|---|
| ชื่อเล่น | `src/App.tsx:183-189` | `localStorage['grammar_quiz_username_v1']` · 2–20 ตัวอักษร |
| หน้ากรอกชื่อ | `src/components/NameInputOverlay.tsx` | กรอกชื่อ + เลือก/อัปโหลดอวตาร์ + bio |
| โปรไฟล์ | ตาราง `winter_profiles` | avatar (base64), bio, mouse_avatar |
| อวตาร์หนู | `src/components/cheese-game/mouseavatar.ts` | สร้างรูป SVG จากค่าตั้งค่า เก็บเป็น data URI |
| ส่งต่อให้เกม | `App.tsx:1002` | ส่ง `username` เป็น prop ลงไป |

### ➜ ผลกระทบต่อแววูฟ (จุดนี้สำคัญที่สุดของทั้งเอกสาร)

RLS ของ Supabase แยกคนได้จาก `auth.uid()` **แต่ที่นี่ทุกคนเป็น `anon` เหมือนกันหมด** → ฐานข้อมูลแยกไม่ออกว่าใครคือใคร → **เขียนกฎ "อ่านได้แค่บทของตัวเอง" ไม่ได้**

ทางออกมี 2 ทาง:

| ทาง | วิธี | ข้อดี | ข้อเสีย |
|---|---|---|---|
| **A (แนะนำ)** | ปิดตารางความลับไม่ให้ `anon` อ่านเลย (deny-all) แล้วให้ข้อมูลส่วนตัวไหลผ่าน **Netlify Function** ที่ตรวจ "ตั๋วผู้เล่น" (player token) | ปลอดภัยแน่นอน · ไม่ต้องรื้อระบบชื่อเล่นเดิม · ความลับไม่เคยอยู่ในเบราว์เซอร์คนอื่น | ข้อมูลส่วนตัวใช้ Realtime ตรงไม่ได้ ต้องดึงผ่าน Function เมื่อสถานะเกมขยับ |
| **B** | เปิด Supabase **Anonymous Sign-in** ให้ทุกคนมี `auth.uid()` จริง แล้วเขียน RLS `using (user_id = auth.uid())` | ใช้ Realtime กับข้อมูลส่วนตัวได้ตรงๆ · RLS เป็นคนคุมเอง | ต้องตั้งค่า Auth ใหม่ · ต้องผูก uid กับชื่อเล่น · ผู้เล่นเปลี่ยนเครื่อง/ล้างข้อมูลแล้วหลุด |

**แนะนำ A** และเก็บ B ไว้เป็นทางอัปเกรดภายหลัง → รอยืนยันใน `OPEN_QUESTIONS.md` Q7

---

## 5. Schema ฐานข้อมูลปัจจุบัน + RLS

### 5.1 ตารางระบบข้อสอบ — `supabase_setup.sql`
`winter_users` · `winter_scores` · `winter_profiles` · `winter_chat` · `winter_friends` · `winter_friend_requests`
Realtime เปิดที่: `winter_chat`, `winter_users`

### 5.2 ตารางเกมเดิม — `supabase_cheese_game_setup.sql`

| ตาราง | คอลัมน์สำคัญ | หมายเหตุ |
|---|---|---|
| `cheese_rooms` | `room_code` (PK), `host_username`, `phase`, `current_hour`, `winner`, `revealed_usernames[]`, ค่าตั้งค่าต่างๆ | ค่าตั้งค่าเกมปนอยู่ในแถวห้องเลย |
| `cheese_players` | PK `(room_code, username)`, **`role`**, `dice_hour`, `is_host`, `is_kicked` | ⚠️ **คอลัมน์ `role` อยู่ในตารางที่ทุกคนอ่านได้** |
| `cheese_votes` | PK `(room_code, round, voter)` | upsert → โหวตซ้ำทับของเดิม |
| `cheese_chat` | `channel` = `main` \| `thief` | ⚠️ **ช่องแชทลับของโจรก็อ่านได้ทุกคน** |
| `cheese_night_log` | PK `(room_code, hour, username)` | ถูกใช้ผิดวัตถุประสงค์เป็น "ที่เก็บของจิปาถะ": hour -1 = พร้อมในล็อบบี้, 7/8 = โหวตข้าม |

### 5.3 RLS ปัจจุบัน — ⚠️ จุดอ่อนที่ห้ามลอก

```sql
create policy "allow all" on cheese_players for all using (true) with check (true);
```

ทุกตารางเป็น `allow all` ทั้งหมด แปลว่า **ใครเปิด DevTools ก็ยิงคำสั่งอ่านบทบาทของทุกคนได้ในวินาทีเดียว** และเขียนทับอะไรก็ได้

> นี่คือสาเหตุที่โจทย์แววูฟสั่งว่า "ห้ามส่งบทของคนอื่นมาที่เบราว์เซอร์" — เกมแววูฟแพ้/ชนะที่ข้อมูลลับ ถ้าทำแบบเกมเดิม เกมจะไม่มีความหมาย

### 5.4 ➜ ตารางใหม่ของแววูฟ
ใช้ชื่อขึ้นต้น **`ww_`** ทุกตาราง แยกไฟล์ SQL เป็น `supabase_werewolf_setup.sql`
และ **แยกตารางเปิด/ตารางลับออกจากกันตั้งแต่แรก** (ห้ามเอา role ไปปนในตารางผู้เล่น) — รายละเอียดใน `GAME_SPEC.md`

---

## 6. `server.ts` ทำอะไร + Netlify รัน Express ได้ไหม

### 6.1 `server.ts` มี API อะไร
Express + เก็บข้อมูลลงไฟล์ `db_store.json`:
`GET /api/all-data` · `POST /api/register-user` · `/api/update-profile` · `/api/submit-score` · `/api/chat` · `/api/friend-request` · `/api/admin/clear-all` · `/api/admin/delete-user`
ท้ายไฟล์ (`server.ts:243-262`) — dev: ใส่ Vite เป็น middleware · prod: เสิร์ฟ `dist/` แล้ว `app.listen(3000)`

### 6.2 ⚠️ ความจริงที่เจอ: API พวกนี้ **ไม่มีใครเรียก**

```
$ grep -rn "/api/" src/
(ไม่พบอะไรเลย)
```

หน้าเว็บคุยกับ Supabase ตรงๆ ทั้งหมด (`src/utils/supabaseSim.ts`, `src/utils/cheeseGameClient.ts`)
→ **`server.ts` เป็นโค้ดตายแล้ว** เหลือประโยชน์แค่เป็นตัวรัน Vite ตอน `npm run dev`
→ `@google/genai` ใน `package.json` ก็ไม่ถูกเรียกที่ไหนเลย (dependency ค้าง)

### 6.3 Netlify รัน Express ต่อเนื่องได้ไหม — **ไม่ได้**

```toml
# netlify.toml ทั้งไฟล์
[build]
  publish = "dist"
  command = "npm run build"
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Netlify ปล่อยแค่ไฟล์ static จาก `dist/` **ไม่มีเซิร์ฟเวอร์ Node รันค้างไว้เลย** (`npm start` ไม่เคยถูกเรียกบน Netlify)
แปลว่าบนเว็บจริงวันนี้ **ไม่มีเซิร์ฟเวอร์ตัดสินอะไรอยู่สักตัว**

### 6.4 ➜ ตัวเลือกสำหรับ "เซิร์ฟเวอร์ตัดสิน" ของแววูฟ

| ตัวเลือก | ข้อดี | ข้อเสีย |
|---|---|---|
| **A. Netlify Functions** ⭐ แนะนำ | อยู่บน Netlify เดิม ไม่เพิ่มผู้ให้บริการ · เขียน TypeScript แบบเดียวกับโปรเจกต์ · deploy พร้อม build เดิม · เก็บ service role key เป็น env var ของ Netlify ได้ | ฟังก์ชันแบบ "เรียกแล้วจบ" (serverless) จับเวลาค้างเองไม่ได้ → ต้องเก็บ "เวลาหมดอายุ" ลง DB แล้วให้ client กระตุ้นให้เดินเฟส (`POST /tick`) |
| **B. Supabase Edge Functions** | อยู่ติดฐานข้อมูล ตอบไว · มี cron ในตัว | ต้องติดตั้ง Supabase CLI + เรียนรันไทม์ Deno เพิ่ม · deploy แยกจาก Netlify |
| **C. ย้าย `server.ts` ไป Render/Fly/Railway** | Express ค้างได้จริง จับเวลาฝั่งเซิร์ฟเวอร์ได้ตรงๆ | เพิ่มผู้ให้บริการ + ค่าใช้จ่าย/การดูแล · เครื่องฟรีมักหลับ ทำให้เกมค้าง |

**แนะนำ A** พร้อมเงื่อนไขทางเทคนิค 2 ข้อที่ต้องทำ:
1. เพิ่ม `[[redirects]] from = "/api/*" to = "/.netlify/functions/:splat"` **ไว้ก่อน** กฎ SPA `/*` เดิม (กฎใน Netlify ทำงานตามลำดับ ถ้าวางผิดลำดับ `/*` จะกลืน API ไปเป็นหน้าเว็บ)
2. ค่า env ของ Netlify: `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (**service role key ห้ามขึ้นชื่อ `VITE_` และห้ามแตะโค้ดฝั่งเบราว์เซอร์เด็ดขาด** เพราะทุกอย่างที่ขึ้นต้น `VITE_` จะถูกฝังลงไฟล์ที่ผู้เล่นดาวน์โหลดได้)

→ รอยืนยันใน `OPEN_QUESTIONS.md` Q8

---

## 7. UI กลาง: ธีม ปุ่ม โมดัล แอนิเมชัน

### 7.1 ธีม
- ไม่มีตัวแปรสี (CSS variable) กลาง — `index.css` มีแค่ `@import "tailwindcss"`
- สีถูกเขียนตรงๆ ในคลาส Tailwind กระจายทั่วไฟล์
- โหมดมืด/สว่างส่งผ่าน prop `isDark: boolean` (ไม่ใช้ `dark:` ของ Tailwind) แล้วเขียน `isDark ? 'bg-...' : 'bg-...'` ทุกที่
- เก็บที่ `localStorage['grammar_quiz_theme']` (`App.tsx:119`) ค่าเริ่มต้น = มืด

### 7.2 ชุดสีที่ใช้จริง
| ที่ | สี |
|---|---|
| ระบบข้อสอบ มืด | พื้น `#0b0c12` · เน้น `amber-400` |
| ระบบข้อสอบ สว่าง | พื้น `stone-50` · เน้น `stone-900` |
| เกมหนูชีส | พื้น `#05060f` / `#0b0c16` · เน้น `amber-400` · ปุ่มไล่สี `#fbbf24→#f59e0b→#d97706` · เรืองแสง `rgba(245,158,11,...)` |

### 7.3 แอนิเมชัน
`motion` v12 (`import { motion, AnimatePresence } from 'motion/react'`) — สไตล์ที่เกมเดิมใช้: `type:'spring', stiffness:160-180, damping:14-16`

### 7.4 ไลบรารีที่มีให้ใช้แล้ว
`react@19` · `vite@6` · `tailwindcss@4` (ผ่าน `@tailwindcss/vite`) · `motion@12` · `lucide-react@0.546` (ไอคอน) · `@supabase/supabase-js@2.116`

### 7.5 ตัวช่วยที่ยืมได้ทันที
| ไฟล์ | ใช้ทำอะไร |
|---|---|
| `src/utils/audio.ts` | `soundFX.playTap() / playCorrect() / playWrong() / playFanfare()` — สร้างเสียงด้วย Web Audio ไม่มีไฟล์เสียง |
| `src/utils/confetti.ts` | `triggerConfetti()` — ใช้ตอนจบเกม |
| `src/utils/bgmPlayer.ts` + `components/BgmButton.tsx` | เพลงพื้นหลัง + ปุ่มลอย (อยู่นอกเกม ใช้ร่วมกันได้เลย) |
| `src/utils/imageUtils.ts` | `compressAndResizeImage()` ย่อรูปอวตาร์ |
| `src/components/cheese-game/CheeseParticles.tsx` | `<CheeseParticles />` + `<AuroraBg />` พื้นหลังเรืองแสง |
| `src/components/cheese-game/CheeseErrorBoundary.tsx` | กันเกมพังทั้งเว็บ — **แววูฟต้องมีของตัวเอง** |
| `src/components/cheese-game/mouseavatar.ts` | สร้างอวตาร์ SVG จากค่าตั้งค่า |
| `src/components/cheese-game/CheeseChatPanel.tsx` | กล่องแชทพร้อมใช้ รับ prop `channel` |

### 7.6 ⚠️ ของที่ "ไม่มี" ต้องรู้ไว้
- ❌ ไม่มีคอมโพเนนต์กลาง `<Button>` / `<Modal>` / `<Card>` — ทุกปุ่มเขียนคลาสซ้ำเองทุกที่
- ❌ ไม่มีระบบเทสต์ (ต้องลง `vitest` เอง)
- ❌ ไม่มี ESLint / Prettier (`npm run lint` = `tsc --noEmit` แค่ตรวจชนิดข้อมูล)
- ❌ ไม่มี CI (ไม่มีโฟลเดอร์ `.github/`)
- ❌ ไม่มี router

---

## 8. แบ่งกลุ่ม (ก) / (ข) / (ค) ตามที่โจทย์สั่ง

### (ก) ใช้ต่อได้เลย — ไม่ต้องแตะอะไร

| ของ | เหตุผล |
|---|---|
| `src/utils/supabaseClient.ts` | client ตัวเดียวทั้งแอป ใช้ร่วมได้ ไม่ต้องสร้างใหม่ |
| `src/utils/audio.ts`, `confetti.ts`, `bgmPlayer.ts`, `imageUtils.ts` | ไม่ผูกกับเกมใดเลย |
| `components/BgmButton.tsx` | อยู่นอกเกมอยู่แล้ว |
| `lucide-react`, `motion`, Tailwind | ติดตั้งแล้ว พร้อมใช้ |
| ระบบชื่อเล่น + โปรไฟล์ (`winter_profiles`, `supabaseSim.fetchProfile/updateProfile`) | แววูฟต้องการแค่ "ชื่อ + รูป" เท่านี้พอ ไม่ต้องทำระบบตัวตนใหม่ |
| สูตรรหัสห้อง 5 ตัว (`cheeseGameClient.ts:76-86`) | ตัดตัวอักษรกำกวมแล้ว คัดลอกไปใช้ |
| โครง `CheeseRoom.tsx` (เปลือกห้อง → แจกให้เฟส → realtime + poll) | สถาปัตยกรรมถูกแล้ว ลอกโครงมาเป็น `WerewolfRoom.tsx` |
| แนวคิดบอท "ชื่อขึ้นต้น 🤖 นั่งในตารางเดียวกับคนจริง" | เรียบง่าย ได้ผล ทดสอบคนเดียวได้ |
| ชุดสีเกมเดิม (พื้นเข้ม + amber เรืองแสง) | ทำให้เกมใหม่ดูเป็นเว็บเดียวกัน (รอตอบ Q3) |

### (ข) ใช้ได้ แต่ต้องดึงออกมาเป็นส่วนกลางก่อน

| ของ | ตอนนี้ | ต้องทำอะไร |
|---|---|---|
| กล่องแชท `CheeseChatPanel.tsx` | ผูกกับ `cheeseGame.getChat/sendChat` และ channel มีแค่ `main`/`thief` | ดึงออกเป็น `<GameChatPanel>` กลาง ที่รับฟังก์ชัน fetch/send เข้ามาเป็น prop → แววูฟใช้ช่อง `village / wolf / lovers / dead` ได้ |
| ชื่อ channel Realtime ที่ไม่ซ้ำกัน | เขียนฝังในเกมหนูชีส | ดึงเป็น `createRoomSubscription(table[], filter, onChange)` ตัวกลาง (ถ้าไม่ดึงออกมา จะผิดซ้ำเดิมและหน้าพังทั้งหน้า) |
| `CheeseErrorBoundary` | ข้อความเป็นหนูชีสโดยเฉพาะ | ดึงเป็น `<GameErrorBoundary title=... />` |
| `mouseavatar.ts` | สร้างหนูเท่านั้น | **ยังไม่ต้องรีบ** — แววูฟใช้อวตาร์เดิมจาก `winter_profiles` ได้ ถ้าอยากมีอวตาร์ชาวบ้านค่อยทำที่ M7 |
| ปุ่ม/การ์ดสไตล์เกม | คลาส Tailwind ซ้ำกันหลายสิบที่ | ทำ `src/games/werewolf/ui/` ของตัวเอง (ปุ่มใหญ่สำหรับมือถือ) — **ไม่ต้องไปรีแฟคเตอร์เกมเดิม** เพื่อไม่ให้เกมเดิมเสี่ยงพัง |
| `netlify.toml` | มีแค่ redirect SPA | เพิ่มกฎ `/api/*` → functions **ก่อน** กฎ `/*` (ถ้าใส่ผิดลำดับ API ตาย) |
| `.env.example` | ยังเขียนถึง AI Studio / ไม่มี VITE_* | เพิ่ม `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (ฝั่งเบราว์เซอร์) + `SUPABASE_SERVICE_ROLE_KEY` (ฝั่งเซิร์ฟเวอร์เท่านั้น) |
| `src/App.tsx` | เป็นที่สลับหน้า | แตะแค่ 3 จุด: import, state `showWerewolfGame`, early return + ปุ่ม — **ห้ามแก้เกินนี้** |

### (ค) ต้องทำใหม่ทั้งหมด

| ของ | ทำไมของเก่าใช้ไม่ได้ |
|---|---|
| **เครื่องยนต์กติกา (rules engine)** | เกมเดิมไม่มีเครื่องยนต์เลย ตรรกะกระจายอยู่ในคอมโพเนนต์ UI (เช่น `CheeseNightPhase.tsx` 1,221 บรรทัดทำทั้ง UI + กติกา + ขับบอท) เขียนเทสต์ไม่ได้ และแววูฟซับซ้อนกว่าหลายเท่า → ต้องเป็น TypeScript ล้วน ไม่มี UI ไม่มี DB |
| **ชั้นเซิร์ฟเวอร์ตัดสิน (Netlify Functions)** | วันนี้ไม่มีเซิร์ฟเวอร์รันบนเว็บจริงเลย และ `server.ts` ก็ไม่มีใครเรียก → ต้องสร้างใหม่หมด |
| **RLS แบบปิดจริง + ตั๋วผู้เล่น (player token)** | ของเดิมเป็น `allow all` ซึ่งตรงข้ามกับที่โจทย์ต้องการ 100% |
| **การแยกตารางเปิด/ตารางลับ** | ของเดิมเอา `role` ไปใส่ในตารางที่ทุกคนอ่านได้ |
| **ข้อมูลบทบาท (role data) + ระบบตั้งค่าละเอียด** | เกมเดิมมี 3 บทตายตัวและค่าตั้งค่าไม่กี่ตัวปนอยู่ในแถวห้อง — แววูฟมี 20+ บทและตั้งค่าหลายสิบตัว ต้องออกแบบใหม่ |
| **บันทึกเกม (game log) / ไทม์ไลน์** | ของเดิมใช้ `cheese_night_log` ผิดวัตถุประสงค์เป็นที่เก็บของจิปาถะ ไม่ใช่บันทึกเหตุการณ์จริง |
| **ระบบเทสต์** | โปรเจกต์ยังไม่มี → ติดตั้ง `vitest` |
| **ผู้ดำเนินเกมอัตโนมัติ (narrator) + ลำดับตื่นกลางคืน** | ไม่มีของเทียบเคียง |

---

## 9. กฎเหล็ก 5 ข้อ ที่สรุปจากการตรวจครั้งนี้

1. **ห้ามแก้เกมหนูชีส** — ไม่แตะไฟล์ใน `src/components/cheese-game/` และไม่แตะตาราง `cheese_*` / `winter_*` (ถ้าจำเป็นต้องแก้ไฟล์ส่วนกลาง ให้แจ้งเหตุผลและทดสอบว่าเกมเดิมยังเล่นได้)
2. **โค้ดแววูฟอยู่ใน `src/games/werewolf/` เท่านั้น** (+ `netlify/functions/ww-*`) · ตารางขึ้นต้น `ww_` เท่านั้น · SQL แยกไฟล์
3. **ห้ามใส่ `role` ลงตารางที่ `anon` อ่านได้** — แยกตารางเปิด/ลับตั้งแต่วันแรก
4. **`SUPABASE_SERVICE_ROLE_KEY` ห้ามโผล่ในโค้ดฝั่งเบราว์เซอร์ ห้ามขึ้นต้น `VITE_` ห้าม commit** — ใช้ได้แค่ใน `netlify/functions/`
5. **ชื่อ Supabase Realtime channel ต้องไม่ซ้ำกัน** ทุกครั้งที่ subscribe (บทเรียนจากเกมเดิม ถ้าผิดหน้าพังทั้งหน้า)

---

## 10. ที่ต้องไปอ่านต่อ
- กติกาและบทบาททุกตัว → `docs/werewolf/RULES.md`
- สถาปัตยกรรม / โครงข้อมูล / ลำดับเฟส → `docs/werewolf/GAME_SPEC.md`
- คำถามที่ยังค้างคา → `docs/werewolf/OPEN_QUESTIONS.md`
- แผนงานและสถานะ → `docs/werewolf/PLAN.md`
