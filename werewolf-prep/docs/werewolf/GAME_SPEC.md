# GAME_SPEC.md — สถาปัตยกรรมเกมแววูฟ (M1 ฉบับใหม่ · กติกา 50 บท)

> **สถานะ:** ฉบับร่างสมบูรณ์ รอผู้ใช้อ่าน · แทนที่ฉบับเดิม (สำรองที่ `archive/GAME_SPEC_MH_DRAFT_2026-09.md`)
> อ้างอิง: กติกา `RULES.md` · สเปกบทพิเศษ `SPECIAL_ROLES.md` · ผลตรวจของเก่า `REUSE_AUDIT.md` · การตัดสินใจ `OPEN_QUESTIONS.md` (ปิดครบ Q1–Q23)
> **การตัดสินใจที่ล็อกแล้ว:** ออนไลน์คนละเครื่อง · 15+ คน · ธีมหมาป่าใหม่ · ไทยอย่างเดียว · ไม่มีลิงก์เชิญ (พิมพ์รหัสห้อง 5 ตัว) · ความลับ = ตารางลับ + ตั๋วผู้เล่น + Netlify Functions · DB = Supabase โปรเจกต์เดิม ตาราง `ww_*`

---

## 1. หลักการออกแบบ 5 ข้อ

1. **เซิร์ฟเวอร์เป็นผู้ตัดสิน** — เบราว์เซอร์ส่งได้แค่ "ความตั้งใจ" เซิร์ฟเวอร์ตัดสินว่าทำได้ไหมและผลเป็นอะไร
2. **เบราว์เซอร์รู้เฉพาะสิ่งที่ตัวเองควรรู้** — บทของคนอื่นต้องไม่เดินทางมาถึงเครื่องผู้เล่น ไม่ว่าจะเปิด DevTools หรือดักเน็ตเวิร์ก
3. **เครื่องยนต์กติกาเป็น TypeScript ล้วน** — ไม่ import React/Supabase/motion → เขียนเทสต์ได้ รันในเทอร์มินัลได้
4. **เก็บ "เจตนา" ก่อน ค่อยประมวลผลทั้งคืน** (กติกา 50 บท ข้อ 15 + Q23) — ไม่มีบทไหนฆ่าใครทันที ทุกอย่างเป็นลิสต์แล้วผ่านท่อ 10 ขั้น (`RULES.md` ข้อ 6)
5. **ไม่แตะเกมเดิม** — โค้ดใหม่คนละโฟลเดอร์ ตารางใหม่ขึ้นต้น `ww_` คนละไฟล์ SQL

## 2. ภาพรวมสถาปัตยกรรม

```
            ┌──────────────── เบราว์เซอร์ผู้เล่นแต่ละคน ────────────────┐
            │  src/games/werewolf/  (React + motion + Tailwind)        │
            │   อ่านสถานะ "เปิดเผย" ──── Supabase Realtime ──┐         │
            │   (เฟส วัน ใครรอด แชทสาธารณะ ผู้ถูกเสนอชื่อ)       │         │
            │   ส่งแอคชัน + ขอข้อมูลส่วนตัว                     │         │
            │   POST /api/ww/*  (แนบ player token)              │         │
            └──────────────┬────────────────────────────────────┼─────────┘
                           │                                    │ anon key
                  ┌────────▼───────────────────┐                │
                  │  netlify/functions/ww-*.ts │                │
                  │  ★ ผู้ตัดสิน (service role)│                │
                  │  1 ตรวจตั๋ว 2 ตรวจเฟส/สิทธิ์/ซ้ำ             │
                  │  3 เรียกเครื่องยนต์กติกา 4 เขียนผลลง DB      │
                  │  5 ตอบเฉพาะ "มุมมองของคนนั้น"                │
                  └────────┬───────────────────┘                │
                           │ service role key                   │
                  ┌────────▼────────────────────────────────────▼───────┐
                  │            Supabase (โปรเจกต์เดียวกับเกมหนูชีส)        │
                  │ ตารางเปิด (anon อ่านได้): ww_rooms ww_players        │
                  │      ww_chat_public ww_events ww_nominations        │
                  │ ตารางลับ (anon อ่านไม่ได้): ww_secrets ww_player_auth │
                  │      ww_room_secrets ww_intents ww_votes ww_chat_private ww_events_private │
                  └─────────────────────────────────────────────────────┘
```

**ศัพท์:** *service role key* = กุญแจผู้ดูแลฐานข้อมูล ข้าม RLS ได้ → **อยู่ได้แค่ในฟังก์ชันฝั่งเซิร์ฟเวอร์** · *anon key* = กุญแจสาธารณะที่เว็บเดิมใช้อยู่แล้ว ต้องถูก RLS คุมเสมอ · *RLS* = กฎในฐานข้อมูลว่าแถวไหนใครอ่าน/เขียนได้ · *player token (ตั๋ว)* = ข้อความสุ่มยาวที่เซิร์ฟเวอร์ออกให้ตอนเข้าห้อง ใช้พิสูจน์ตัวตน

**ตัวแปรสภาพแวดล้อม**
| ที่ไหน | ชื่อ | หมายเหตุ |
|---|---|---|
| เบราว์เซอร์ (มีอยู่แล้ว) | `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY` | ใช้ `src/utils/supabaseClient.ts` เดิมได้ ไม่ต้องสร้างใหม่ |
| Netlify Functions เท่านั้น | `SUPABASE_URL` · `SUPABASE_SERVICE_ROLE_KEY` | ★ ห้ามขึ้นต้น `VITE_` ห้าม commit ผู้ใช้ตั้งเองบน Netlify ตอน M3 (Claude บอกขั้นตอนเป็นข้อๆ) |

> **ข้อจำกัดของ serverless ที่ต้องออกแบบรอบ:** Function รันแบบ "ถูกเรียกแล้วจบ" ตั้งตัวจับเวลาค้างไม่ได้ และมี timeout สั้น → เวลาหมดเฟสเก็บใน DB (`phase_ends_at`) แล้วให้ไคลเอนต์เรียก `tick` (ข้อ 6.3) ทุกฟังก์ชันต้อง **เสร็จเร็ว** (ประมวลผลคืนหนึ่งรวมเขียน DB ควร < 3 วินาที) และ **idempotent** (เรียกซ้ำไม่เกิดผลสองรอบ)

## 3. โครงโฟลเดอร์

```
src/games/werewolf/
├── engine/                       ★ TypeScript ล้วน ห้าม import react / @supabase / motion
│   ├── types.ts                  GameState, Player, Intent, Settings, Event, RoleDef
│   ├── settings.ts               ค่าเริ่มต้น + พรีเซ็ตตามจำนวนคน + validate (ตรวจก่อนเริ่ม)
│   ├── roles/
│   │   ├── index.ts              ทะเบียนบททั้ง 53 บท
│   │   ├── village/ wolf/ neutral/ special/   (หนึ่งไฟล์ต่อบท)
│   ├── nightOrder.ts             ช่องตื่น + หน่วงเวลากันเดา
│   ├── pipeline/                 ★ ท่อประมวลผลคืน (หนึ่งไฟล์ต่อขั้น)
│   │   ├── 01blocks.ts 02swap.ts 03mirror.ts 04protect.ts 05immunity.ts
│   │   ├── 06potions.ts 07confirmDeaths.ts 08chain.ts 09conversions.ts 10investigate.ts
│   │   └── index.ts              resolveNight(state, intents) → { state, events }
│   ├── resolveVote.ts            นับคะแนน (ผู้ใหญ่บ้าน 2 / ผู้รักสันติ 0) เสมอ คนโง่ เจ้าชาย ตัวตลก
│   ├── nominations.ts            เสนอชื่อ → ผู้ถูกเสนอ ≤ 3
│   ├── winConditions.ts          เงื่อนไขชนะ + ลำดับความสำคัญ (RULES 8)
│   ├── balance.ts                คะแนนสมดุล + คำเตือนไทย
│   ├── knowledge.ts              ใครรู้อะไรเกี่ยวกับใคร (หมาป่า คู่รัก ช่างก่อสร้าง สมุน)
│   ├── inspect.ts                ผลตรวจของผู้หยั่งรู้ทุกประเภท (ตารางข้อ 11.1)
│   ├── reducer.ts                ★ applyAction(state, action) → { state, events, error? }
│   ├── rng.ts                    สุ่มแบบกำหนดเมล็ด (seeded) ให้เทสต์ซ้ำได้
│   └── bots.ts                   บอทสุ่มเล่นได้ทุกบท (ใช้ทดสอบ + เล่นแทนคนหลุด)
├── engine/__tests__/             vitest (ข้อ 9)
├── net/  werewolfClient.ts  types.ts
├── ui/                           ปุ่ม การ์ด โมดัลของเกมนี้ (มือถือมาก่อน) + ธีมหมาป่า
├── components/
│   ├── WerewolfApp.tsx           หน้าแรก: สร้าง/เข้าห้อง (พิมพ์รหัส 5 ตัว)
│   ├── WerewolfRoom.tsx          เปลือกห้อง: realtime + poll + tick
│   ├── WerewolfErrorBoundary.tsx · Narrator.tsx · GameChatPanel.tsx · HowToPlay.tsx
│   └── phases/  Lobby SettingsPanel RoleReveal Night Morning Discussion Nomination Defense Vote Execution GameOver
└── text/th.ts                    ★ ข้อความไทยทั้งเกมไฟล์เดียว

netlify/functions/
├── _shared/  supabaseAdmin.ts  auth.ts  loadState.ts  saveState.ts  views.ts(★กรองมุมมอง)
├── ww-create-room · ww-join-room · ww-update-settings · ww-start-game
├── ww-my-view (★) · ww-action (★) · ww-nominate · ww-vote · ww-chat · ww-release-seat · ww-tick (★)

supabase_werewolf_setup.sql       ★ ตาราง ww_* + RLS (ไฟล์แยก)
```

> **หมายเหตุโครงจริงหลังทำ M2:** ท่อประมวลผลอยู่ไฟล์เดียว `engine/pipeline.ts` (ไม่แยกต่อขั้น) · บทแพ็กหลักอยู่ `engine/roles/core.ts` (แยกไฟล์ต่อบทตอน M6) · มี `state.ts` `night.ts` `vote.ts` `deaths.ts` `view.ts` เพิ่ม · `engine/__tests__/` มี 11 ไฟล์เทสต์ + `simulate.ts`

> **หมายเหตุหลังทำ M3:** ฟังก์ชัน Netlify เป็นแบบ v2 (รับ `Request` ส่ง `Response`) และ redirect `/api/ww/*` → `/.netlify/functions/ww-:splat` อยู่ใน `netlify.toml` แล้ว · ตรรกะอยู่ `netlify/functions/_shared/handlers.ts` (รับ `WwStore` — มี `memoryStore` กับ `supabaseStore`) · ไม่ต้องติดตั้ง `@netlify/functions` · `ww-chat` ส่งข้อความด้วย `{channel, text}` และอ่านผ่าน `my-view`

> **หมายเหตุหลังทำ M4:** เพิ่ม endpoint `play-again`, `wallet-create`, `wallet`, `shop-buy`, `avatar-save`, `sync-avatar` (ตั๋วกระเป๋าส่งทาง header `x-ww-wallet-id` / `x-ww-wallet-token` แยกจากตั๋วผู้เล่น) · ตารางลับใหม่ `ww_wallets` + คอลัมน์ `ww_player_auth.wallet_id` + ฟังก์ชัน `ww_wallet_buy` / `ww_wallet_credit` (ดู `supabase_werewolf_setup.sql`) · อวตารเก็บเป็นข้อความ JSON ใน `ww_players.avatar` (สาธารณะ) · รางวัลเหรียญคำนวณตอนเปลี่ยนเป็น game_over และเก็บใน `engine_state.rewards`

## 4. เฟส + เวลา

เฟสตามกติกาข้อ 4 (`LOBBY → ROLE_REVEAL → NIGHT → DAWN_RESOLVE → MORNING → DISCUSSION → NOMINATION → DEFENSE → VOTE → EXECUTION → … → GAME_OVER`) **ไม่มีเฟส ELECTION** แล้ว (ผู้ใหญ่บ้านเป็นบท ไม่ใช่ตำแหน่งเลือกตั้ง)

| ตั้งค่าเวลา (วินาที) | ค่าเริ่มต้น | หมายเหตุ |
|---|---|---|
| `night_action_seconds` | 30 | ต่อช่องที่มีคนเล่นจริง |
| `night_idle_seconds` | สุ่ม 4–7 | ช่องที่ไม่มีคน/ตายแล้ว — ต้องกินเวลาเท่าช่องจริง (ข้อ 4.1) |
| `discussion_seconds` | 180 | ผู้ควบคุมเวลาปรับได้ |
| `nomination_seconds` | 30 | |
| `defense_seconds` | 30 | ต่อผู้ถูกเสนอชื่อ |
| `vote_seconds` | 45 | |
| `disconnect_grace_seconds` | 60 | ข้อ 8 |

### 4.1 กันการเดาจากเวลา (anti-timing-tell) — ข้อบังคับ

ถ้าเกมข้ามบทที่ไม่มี/ตายแล้วทันที ผู้เล่นจะรู้ว่า "คืนนี้เร็ว = ผู้หยั่งรู้ตายแล้ว"
**กฎ:** ทุกช่องตื่น (รวมช่องที่ไม่มีคน) กินเวลาสุ่มในช่วงเดียวกัน · ช่องที่คนเล่นกดเร็วก็ต้องรออย่างน้อยเวลาสุ่มขั้นต่ำ · ข้อความบรรยายเหมือนกันทุกครั้ง ("ผู้หยั่งรู้ตื่นขึ้น…" ขึ้นแม้ตายแล้ว) · **ผลลับทุกชนิดส่งพร้อมกันตอนเช้า** (RULES A2) จึงไม่มีสัญญาณจังหวะการตอบ

## 5. เครื่องยนต์กติกา

### 5.1 รูปร่างหลัก

```ts
// engine/types.ts (ย่อ)
export type Team = 'village' | 'wolf' | 'vampire' | 'cult' | 'solo';
export type WinWith = 'village' | 'wolf' | 'vampire' | 'cult' | 'self' | 'follow';

export interface EnginePlayer {            // ★ ฝั่งเซิร์ฟเวอร์เท่านั้น
  id: string; seat: number; name: string;
  roleId: RoleId; startTeam: Team; team: Team; winWith: WinWith;
  alive: boolean; canVote: boolean; voteWeight: number;     // ผู้ใหญ่บ้าน 2 / ผู้รักสันติ 0
  roleState: Record<string, unknown>;      // ยาแม่มดเหลือ, กระสุน, ต้นแบบ, แบบที่ลอก, เครื่องหมายน้ำมัน ฯลฯ
  statuses: Status[];                      // infected / convertAt / dieAt / blocked / silenced / cursed ...
  loverOf: string | null;
}

export interface Intent {                  // เจตนา 1 อัน = ความสามารถ 1 ครั้งของคืนนี้
  id: string; actorId: string; roleId: RoleId; slot: number;
  kind: IntentKind;                        // 'wolf_bite' | 'protect' | 'poison' | 'investigate_seer' | 'block' | 'swap' | ...
  targets: string[];                       // 0–3 คน
  meta?: Record<string, unknown>;
  cancelled?: boolean; redirectedFrom?: string;   // ขั้น 1–3 แก้ไขได้
}

export interface GameState {
  roomCode: string; phase: Phase; dayNumber: number; nightSlot: number;
  settings: WerewolfSettings; players: EnginePlayer[];
  intents: Intent[];                       // ★ ลิสต์เจตนาของคืนนี้ — ยังไม่ตัดสิน
  loverPairs: [string, string][];
  nominations: Record<string, string>;     // ผู้เสนอ → ผู้ถูกเสนอ
  winners: Winner[] | null;
  rngSeed: string;                         // ★ สุ่มแบบกำหนดเมล็ด
}

export function applyAction(state: GameState, action: GameAction):
  { state: GameState; events: GameEvent[]; error?: EngineError };   // ฟังก์ชันบริสุทธิ์ ไม่มี side effect
export function resolveNight(state: GameState): { state: GameState; events: GameEvent[] };
```

### 5.2 บทเป็น "ข้อมูล" — เพิ่มบทใหม่ = เพิ่มไฟล์ 1 ไฟล์ + ลงทะเบียน 1 บรรทัด

```ts
// engine/roles/village/doctor.ts
export const doctor: RoleDef = {
  id: 'doctor', nameTh: 'หมอ', kind: 'normal',
  startTeam: 'village', winWith: 'village',
  balanceScore: 4, nightSlot: 20, wakes: 'every-night',
  abilities: [{
    kind: 'protect', targets: 1, canTargetSelf: true, canTargetDead: false,
    noRepeatNights: 1,                      // กันคนเดิมซ้ำสองคืนติดไม่ได้
    blocks: ['wolf_bite','wolf_infect','alpha_convert','vampire_bite','vigilante_shot','hunter_kill_night'],
  }],
  onBlocked: 'cancel-keep-uses',            // ถูกขัด: ยกเลิกเจตนา ไม่ตัดจำนวนครั้ง
  onActorDeath: 'none',
  settingsSchema: [
    { key: 'doctorSelfProtect', labelTh: 'หมอกันตัวเองได้',
      helpTh: 'เปิด = หมอเลือกกันตัวเองได้ (ตามกติกาเจ้าของเว็บ) · ปิด = กันตัวเองไม่ได้ (Millers Hollow)',
      type: 'boolean', default: true },
  ],
};
```

**ทุกบทต้องมี 13 ฟิลด์ตามกติกาเจ้าของเว็บข้อ 22:** `ชื่อ ฝ่าย เป้าหมาย ช่วงเวลา จำนวนครั้ง เงื่อนไขใช้ priority ผลลัพธ์ ผลเมื่อถูกหยุด ผลเมื่อเป้าหมายตาย ผลเมื่อผู้ใช้ตาย interaction เงื่อนไขชนะ` → ใน `RoleDef` มีฟิลด์ตรงๆ ทั้งหมด (`onBlocked`, `onTargetDeath`, `onActorDeath`, `interactions`, `win`) และมีเทสต์ **`roles.completeness.test.ts`** ที่ล้มทันทีถ้ามีบทไหนขาดฟิลด์ใด (บังคับกฎ "ห้ามบทกำกวม")

### 5.3 ท่อประมวลผลกลางคืน
อยู่ใน `engine/pipeline/` ทำตาม `RULES.md` ข้อ 6 ทั้ง 10 ขั้นแบบตรงตัว ทุกขั้นคืน `events` ที่เขียนลง `ww_events_private` เพื่อตรวจย้อนหลังว่า **ทำไมใครตาย** รันซ้ำด้วย `rngSeed` เดิมต้องได้ผลเดิมทุกครั้ง

### 5.4 บทที่ทับซ้อนกัน (Q23)
**ผู้สลับชะตา · กระจก · นักเลียนแบบ · ผู้ลอกเลียนแบบ** ทำใน M6 (ท้ายสุด) แต่โครงสร้าง `Intent[]` + ขั้น 2–3 ของท่อ **ต้องมีตั้งแต่ M2** (ขั้นว่างๆ ที่ผ่านตรงๆ ไปก่อน) เพื่อไม่ต้องรื้อเอนจิน

## 6. สัญญาระหว่างเบราว์เซอร์กับเซิร์ฟเวอร์ (API contract)

ทุกคำขอมี header `x-ww-player-id` + `x-ww-token` (ยกเว้น `create-room` / `join-room`)

### 6.1 `POST /api/ww/my-view` — ★ หัวใจของการกันความลับ
**ส่ง:** `{ roomCode }` **ได้คืน (ตัวอย่างผู้หยั่งรู้คืนที่ 2):**
```json
{
  "stateVersion": 42, "phase": "night", "dayNumber": 2, "nightSlot": 40,
  "narrationTh": "หมู่บ้านหลับใหล… ผู้หยั่งรู้ตื่นขึ้น",
  "me": { "playerId": "p1", "role": "seer", "roleNameTh": "ผู้หยั่งรู้", "team": "village",
          "isAlive": true, "roleState": {}, "canVote": true },
  "allies": [], "lover": null,
  "myTurn": { "isMyTurn": true, "actionKind": "investigate_seer", "promptTh": "เลือกผู้เล่นที่ต้องการดู",
              "selectableTargets": ["p2","p3","p5"], "endsAt": "2026-10-01T12:00:30Z" },
  "privateResults": [ { "day": 1, "textTh": "คืนที่ 1: ส้ม → ไม่ใช่หมาป่า" } ],
  "publicPlayers": [
    { "playerId": "p2", "displayName": "ส้ม", "isAlive": true, "revealedRole": null },
    { "playerId": "p4", "displayName": "มิ้น", "isAlive": false, "revealedRole": "villager", "deathCause": "wolf" }
  ]
}
```
**กฎเหล็ก:**
- `me.role` มีได้ **แค่บทของคนที่ถาม** · `allies` ใส่เฉพาะเมื่อกติกาอนุญาต (หมาป่า+สมุน+ผู้พยากรณ์ ช่างก่อสร้าง คู่รัก แวมไพร์ ลัทธิ)
- `publicPlayers[].revealedRole` เป็น `null` เสมอ ถ้ายังไม่เข้าเงื่อนไขเปิดเผยตามค่าตั้งค่า
- **คนเมา** ได้ `me.role` เป็นบทปลอมที่ถูกกำหนดตอนแจกบท (เซิร์ฟเวอร์รู้จริง เบราว์เซอร์ไม่รู้) · **ผู้ลอกเลียนแบบ** ได้บทที่ลอกมา
- ❌ ห้ามส่ง `intents` / `rngSeed` / รายชื่อผู้ถูกกัด (ยกเว้นแม่มดตามกติกา) / บทของใครที่ยังไม่เปิดเผย
- **เทสต์ `views.leak.test.ts`:** สร้างมุมมองของผู้เล่นทุกคนทุกบท ตรวจว่า JSON ไม่มีบทของคนอื่น

### 6.2 `POST /api/ww/action`
```json
{ "roomCode":"AB12C", "dayNumber":2, "nightSlot":40, "kind":"investigate_seer", "targets":["p3"] }
```
ตรวจเรียงลำดับ — ไม่ผ่านข้อใด → `403` + `{ errorTh }` และ **ไม่เปลี่ยนสถานะเกม** · ทุกคำขอที่ถูกปฏิเสธบันทึกลง `ww_events_private`
1. ตั๋วถูกต้องและอยู่ห้องนี้ · 2. ยังมีชีวิต (ถ้าแอคชันต้องมีชีวิต) · 3. **ถือบทนั้นจริง** · 4. เฟสและช่องตรงกับบทนั้น · 5. ยังไม่เคยส่ง (unique ใน `ww_intents`) · 6. เป้าหมายถูกต้อง (ตัวเอง/คนตาย/คนเดิมซ้ำ/จำนวนคน) · 7. ความสามารถยังเหลือ (ยา/กระสุน) · 8. ไม่ถูกขัดขวางแบบที่ห้ามส่ง (ถ้าถูกขัด ยังรับคำสั่งแต่ไม่มีผล เพื่อกัน tell)

### 6.3 endpoint ทั้งหมด
| endpoint | หน้าที่ |
|---|---|
| `create-room` | สร้างห้อง → คืน `roomCode`, `playerId`, `token` |
| `join-room` | เข้าห้อง (รหัสผ่าน ห้องเต็ม ชื่อซ้ำ ห้องล็อก) → คืน `playerId`, `token` |
| `update-settings` | เจ้าของห้องเท่านั้น · ตรวจ "จำนวนบท = จำนวนผู้เล่น" + กฎก่อนเริ่ม |
| `start-game` | แจกบทลับ (สุ่มด้วย `rngSeed`) → เขียน `ww_secrets` → `phase=role_reveal` |
| `my-view` | ดึงมุมมองของฉัน (6.1) |
| `action` | ส่งความสามารถ (กลางคืน/กลางวัน/ตอนตาย เช่น นายพรานยิง ตัวตลกเลือกผู้โหวต) |
| `nominate` | เสนอชื่อ (1 คน/ผู้เล่น เสนอตัวเองไม่ได้) |
| `vote` | โหวต (ตรวจ `can_vote` เฟส ซ้ำ) |
| `chat` | ส่ง/อ่านแชทช่องส่วนตัว (หมาป่า คู่รัก แวมไพร์ ลัทธิ ผู้ตาย) เซิร์ฟเวอร์ตรวจว่าอยู่ช่องนั้น |
| `release-seat` | เจ้าของห้องปล่อยที่นั่งคืน (ออกตั๋วใหม่ให้ที่นั่ง · Q12) |
| `tick` | ★ เดินเฟสเมื่อ `phase_ends_at` ผ่านแล้ว — **ใครเรียกก็ได้** เซิร์ฟเวอร์ตรวจเวลาเอง ทำงานแบบ idempotent (ล็อกแถวห้อง + เทียบ `state_version`) |

> `tick`: ไคลเอนต์ทุกเครื่องเรียกทุก 2–3 วินาที → เกมไม่หยุดแม้เจ้าของห้องปิดแท็บ · ถ้าสองเครื่องเรียกพร้อมกัน ใช้ `update … where state_version = :v` ให้มีผู้ชนะคนเดียว

### 6.4 `netlify.toml` ที่ต้องเพิ่ม (ลำดับสำคัญ!)
```toml
[functions]
  directory = "netlify/functions"

[[redirects]]              # ★ ต้องมาก่อนกฎ SPA
  from = "/api/ww/*"
  to   = "/.netlify/functions/ww-:splat"
  status = 200

[[redirects]]              # กฎเดิม — ปล่อยไว้
  from = "/*"
  to = "/index.html"
  status = 200
```

## 6.5 ตารางข้อมูล (รายละเอียดจริงอยู่ใน `supabase_werewolf_setup.sql`)

| กลุ่ม | ตาราง | เก็บอะไร |
|---|---|---|
| เปิด (anon อ่านได้) | `ww_rooms` | เฟส วัน ช่องตื่น เวลาหมดเฟส ค่าตั้งค่า+ชุดบท `state_version` ผู้ชนะ (ไม่มีรหัสผ่าน ไม่มี seed) |
| | `ww_players` | ชื่อ อวตาร์ ที่นั่ง รอด/ตาย ออนไลน์ `revealed_role` (เฉพาะที่เปิดเผยแล้ว) — **ไม่มีคอลัมน์ role** |
| | `ww_chat_public` · `ww_events` · `ww_nominations` | แชทสาธารณะ · เหตุการณ์เปิดเผยได้ · การเสนอชื่อ |
| ลับ (anon อ่านไม่ได้เลย) | `ww_room_secrets` | **`rng_seed`** (รู้แล้วคำนวณการแจกบทได้) · แฮชรหัสผ่านห้อง · สถานะเต็มของเอนจิน |
| | `ww_secrets` | บทจริง `shown_role_id` (คนเมา) ฝ่าย ฝ่ายชนะ สถานะส่วนตัว คู่รัก |
| | `ww_player_auth` | แฮชของตั๋วผู้เล่น |
| | `ww_intents` | เจตนาของแต่ละคืน (unique กันส่งซ้ำ) |
| | `ww_votes` · `ww_chat_private` · `ww_events_private` | คะแนนโหวต · แชทลับ (หมาป่า/คู่รัก/แวมไพร์/ลัทธิ/ผู้ตาย) · บันทึกเหตุการณ์ลับ+คำขอที่ถูกปฏิเสธ |

ความต่างจากฉบับร่างเดิม: เพิ่ม `ww_room_secrets` (ย้าย seed กับแฮชรหัสผ่านออกจากตารางเปิด — ถ้าเก็บใน `ww_rooms` ใครก็อ่านได้) · เพิ่ม `ww_nominations` · `ww_actions` เปลี่ยนชื่อเป็น `ww_intents` · ตัด `is_chief` (ผู้ใหญ่บ้านเป็นบท) · เพิ่ม `has_revealed_mayor`

---

## 7. ตัวตนผู้เล่น + ตั๋ว

```
เข้าห้อง → เซิร์ฟเวอร์สุ่ม token 32 ไบต์ → เก็บ "แฮช" ลง ww_player_auth
                                       → ส่ง "ตั๋วดิบ" กลับครั้งเดียว
เบราว์เซอร์เก็บใน localStorage: ww_token_<roomCode>
ทุกคำขอ → x-ww-player-id + x-ww-token → เซิร์ฟเวอร์แฮชแล้วเทียบ (constant-time)
```
- ใช้ `display_name` จากระบบชื่อเล่นเดิม (`grammar_quiz_username_v1`) + อวตาร์จาก `winter_profiles` (อ่านอย่างเดียว) → ไม่รื้อระบบเดิม
- กลับเข้าห้องหลังหลุด = ตั๋วใน localStorage ใช้ได้ → ได้บทเดิมคืน
- ล้าง localStorage/เปลี่ยนเครื่อง → เจ้าของห้องกด "ปล่อยที่นั่งคืน" (Q12) · ไม่มีลิงก์เชิญ (Q6): พิมพ์รหัสห้อง 5 ตัว

## 8. ผู้เล่นหลุดกลางเกม

| ค่าตั้งค่า | พฤติกรรม |
|---|---|
| **รอ** (ค่าเริ่มต้น) | เฟสรอจน `phase_ends_at` แล้วข้าม/สุ่มตามค่าตั้งค่า |
| **บอทเล่นแทน** | หลุดเกิน `disconnect_grace_seconds` → บอทเล่นแทนชั่วคราว กลับมาแล้วคืนสิทธิ์ |
| **ถือว่าตาย** | หลุดเกินเวลา → ตาย `death_cause='disconnect'` และต้อง **ตรวจเงื่อนไขชนะทันที** |

ตรวจจาก `last_seen_at` ที่ไคลเอนต์อัปเดตผ่าน `tick`

## 9. ระบบเทสต์ (M2)

ติดตั้ง `vitest` + `tsx` เพิ่ม script: `"test": "vitest run"`, `"test:watch": "vitest"`, `"sim": "tsx src/games/werewolf/engine/__tests__/simulate.ts"`

| ไฟล์เทสต์ | ครอบคลุม |
|---|---|
| `pipeline.protect.test.ts` | หมอ/นักบวช/ผู้คุ้มกัน × หมาป่า/ฆาตกร/พิษ/ไฟ (ตาราง 11.2 ทุกช่อง) · แม่มดชุบซ้ำได้ยาคืน |
| `pipeline.blocks.test.ts` | ผู้หยุดความสามารถ/หมาป่าผู้หยุด/หญิงชรา · ผู้ขัดขวางถูกขัด · ไม่ตัดจำนวนครั้ง |
| `pipeline.swap.test.ts` | สลับ A↔B ทุกชนิดเจตนา · แม่มดชุบ+พิษหลังสลับ |
| `pipeline.mirror.test.ts` | สะท้อนการตรวจ/โจมตี · ไม่สะท้อนป้องกัน |
| `pipeline.lovers.test.ts` | คนถูกกัดเป็นคู่รัก · หลายสาเหตุตายพร้อมกัน · ไม่วนซ้ำ |
| `pipeline.hunter.test.ts` | นายพรานตายทุกสาเหตุ + ลูกโซ่ยิงต่อ + ยิงคู่รัก |
| `pipeline.delayed.test.ts` | คนถึก · ผู้ถูกสาป · ผู้ติดเชื้อ · แวมไพร์/ลัทธิ/อัลฟ่า แปลงตอนจบคืนถัดไป |
| `conversion.test.ts` | เด็กป่า/มนุษย์ป่า ต้นแบบตาย · ศิษย์เลื่อนขั้น · ผู้ลอกเลียนแบบ follow |
| `resolveVote.test.ts` | เสนอชื่อ ≤ 3 · เสมอทุกแบบ · ผู้ใหญ่บ้าน 2 · ผู้รักสันติ 0 · คนโง่ · เจ้าชาย |
| `neutralWins.test.ts` | คนฟอก(จบ) · ตัวตลก(ผู้โหวตตายตาม) · คนโง่เจ้าเล่ห์(ไม่จบ ไม่ชนะถ้าถูกกัด) |
| `winConditions.test.ts` | หลายฝ่ายชนะพร้อมกัน → ลำดับ RULES 8.2 · หมาป่าเดียวดาย · ชูปาคาบรา · ผู้ทำนาย |
| `disconnect.test.ts` | หลุดกลางเฟส 3 ค่าตั้งค่า |
| `roles.completeness.test.ts` | ทุกบทมี 13 ฟิลด์ + เงื่อนไขชนะ |
| `views.leak.test.ts` | ★ มุมมองของทุกคนไม่มีความลับของคนอื่น (รวมคนเมา/ผู้ลอก) |
| `actionGuards.test.ts` | ★ บทที่ไม่ได้ถือ / ส่งซ้ำ / ผิดเฟส / ยาหมด / เป้าหมายผิด → ถูกปฏิเสธ |
| `determinism.test.ts` | seed เดิม = ผลเดิม |
| `simulate.ts` | ★ จำลองเกมด้วยบอทล้วน **500 เกม** ทุกชุดบทพรีเซ็ต (8/10/15/20/25) → ต้องไม่ค้าง ไม่ crash มีผู้ชนะทุกเกม |

## 10. UI มือถือมาก่อน + ธีมหมาป่า (Q3)

- ปุ่มสูง ≥ 48px · ตัวอักษร ≥ 14px · ขอบ 16px · ไม่เลื่อนซ้าย-ขวา · รองรับ 15–30 คน (รายชื่อเรียงตาม `seat` เหมือนกันทุกเครื่อง · ค้นหา/ย่อได้)
- **ธีม:** คืนเดือนหงาย — พื้น `#0b1020` น้ำเงินเข้ม · ม่วง `#5b3f8f` · แดงเลือด `#b3202a` (เน้น/อันตราย) · เงินจันทร์ `#dfe6f5` (ตัวอักษร) · กลางวันเปลี่ยนเป็นโทนอุ่นจางๆ · สีเก็บเป็นตัวแปร CSS ในโฟลเดอร์ `ui/` ของเกมนี้ (ไม่แก้ธีมกลาง)
- หน้ากลางคืน: เต็มจอ 1 คำถาม 1 รายชื่อ · แอนิเมชันกลางวัน/กลางคืนด้วย `motion`
- **โหมดคุย (Q5):** เจ้าของห้องเลือก แชทในเกม / เสียงภายนอก / ทั้งคู่ · ถ้าเสียงภายนอก → ซ่อนแชทสาธารณะ ขยายตัวจับเวลา + ปุ่มโหวตใหญ่ · แชทหมาป่า/คู่รัก/ลัทธิ/แวมไพร์/ผู้ตาย **ยังเปิดตลอด** (กลางคืนเงียบ ต้องใช้แชท)
- ผู้ตาย = หน้าจอ "ผู้ชม" + แชทผู้ตาย · ข้อความทุกอย่างอยู่ใน `text/th.ts`
- หน้าจบเกม: เปิดบททุกคน + ไทม์ไลน์จาก `ww_events_private` (เลื่อนขั้นเป็นสาธารณะตอนจบ) + ปุ่ม "เล่นอีกครั้ง"

## 11. ความปลอดภัย (ต้องทดสอบจริงที่ M3 และ M7)

| ภัย | วิธีกัน |
|---|---|
| ผู้เล่นอ่านบทคนอื่นจาก DB | ตารางลับ **RLS เปิด ไม่มี policy** + ไม่เปิด Realtime ให้ตารางลับ |
| ผู้เล่นส่งคำสั่งปลอม | ตรวจ 8 ข้อใน 6.2 + unique constraint ใน `ww_intents` |
| ขโมยตั๋ว | เก็บเฉพาะแฮช · ตั๋ว 32 ไบต์สุ่ม · เทียบแบบ constant-time |
| service role key รั่ว | อยู่เฉพาะ env ของ Netlify Functions ไม่ขึ้นต้น `VITE_` ไม่ commit |
| ดูความลับจากเวลาตอบ | หน่วงเวลาเท่ากัน + ส่งผลลับพร้อมกันตอนเช้า |
| ดูความลับจากขนาด/รูปร่างคำตอบ | `my-view` ทุกบทคืนโครงเดียวกัน · คนเมาได้ข้อมูลปลอมรูปเหมือนจริง |
| เจ้าของห้องโกง | `release-seat` บันทึก event · ยอมรับความเสี่ยงเมื่อเล่นกับเพื่อน (Q12) |
| spam/DoS เบื้องต้น | จำกัดความถี่ต่อผู้เล่น (ใน `ww-*`) · ขนาดแชท ≤ 300 ตัวอักษร |

**เทสต์ที่ต้องผ่าน:** เปิด console ในเบราว์เซอร์ผู้เล่นแล้วยิง `await supabase.from('ww_secrets').select('*')` → ต้องได้ array ว่างหรือ error เท่านั้น (ทุกตารางลับ)

## 12. แผนเชื่อมกับของเดิม

- `src/App.tsx` แตะ **3 จุดเท่านั้น:** import · state `showWerewolfGame` · early return + ปุ่มเข้าเกม (M3) — แจ้งก่อนแก้และทดสอบว่าเกมหนูชีสยังเล่นได้
- `netlify.toml` เพิ่ม `[functions]` + redirect `/api/ww/*` (ข้อ 6.4) · `.env.example` เพิ่มชื่อ env ของ Functions (ไม่ใส่ค่าจริง)
- `package.json`: M2 เพิ่ม `vitest` `tsx` · M3 เพิ่ม `@netlify/functions`

## 13. จุดที่ยังรอผู้ใช้ยืนยัน
- **Q24:** ชุดบท 20 คนในต้นฉบับรวมได้ 21 (ใช้ "ชาวบ้าน 4" ไปก่อน)
- **ข้อสมมติ 🔸 A1–A21** ใน `RULES.md` ข้อ 14 (เช่น เงื่อนไขชนะของชูปาคาบรา/กระจก/นักเลียนแบบ ที่ต้นฉบับไม่ระบุ)
