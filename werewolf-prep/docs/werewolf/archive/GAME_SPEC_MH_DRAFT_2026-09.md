# GAME_SPEC.md — สถาปัตยกรรมเกมแววูฟ (ฉบับร่าง M1)

> สถานะ: **ร่าง — รอยืนยัน `OPEN_QUESTIONS.md` Q7 (วิธีกันความลับ) และ Q8 (Netlify Functions)**
> อ้างอิงผลตรวจของเก่าใน `REUSE_AUDIT.md` และกติกาใน `RULES.md`

---

## 1. หลักการออกแบบ 4 ข้อ

1. **เซิร์ฟเวอร์เป็นผู้ตัดสิน** — เบราว์เซอร์ส่งได้แค่ "ความตั้งใจ" (ฉันอยากกัดคนนี้) เซิร์ฟเวอร์เป็นคนตัดสินว่าทำได้ไหมและผลเป็นอะไร
2. **เบราว์เซอร์ได้รู้เฉพาะสิ่งที่ตัวเองควรรู้** — ไม่มีทางที่บทของคนอื่นจะเดินทางมาถึงเครื่องผู้เล่น ไม่ว่าจะเปิด DevTools หรือดักเน็ตเวิร์ก
3. **เครื่องยนต์กติกาเป็น TypeScript ล้วน** — ไม่ import React ไม่ import Supabase → เขียนเทสต์ได้ รันในเทอร์มินัลได้
4. **ไม่แตะเกมเดิม** — โค้ดใหม่อยู่คนละโฟลเดอร์ ตารางใหม่ขึ้นต้น `ww_` คนละไฟล์ SQL

---

## 2. ภาพรวมสถาปัตยกรรม

```
            ┌──────────────── เบราว์เซอร์ผู้เล่นแต่ละคน ────────────────┐
            │  src/games/werewolf/  (React + motion + Tailwind)        │
            │                                                          │
            │   อ่านสถานะ "เปิดเผย"  ──── Supabase Realtime ──┐        │
            │   (เฟส, วันที่, ใครรอด, แชทสาธารณะ)             │        │
            │                                                 │        │
            │   ส่งแอคชัน + ขอข้อมูลส่วนตัว                   │        │
            │   POST /api/ww/*  (แนบ player_token)            │        │
            └──────────────┬──────────────────────────────────┼────────┘
                           │                                  │
                  ┌────────▼────────────────────┐             │
                  │  netlify/functions/ww-*.ts  │             │
                  │  ★ ผู้ตัดสิน (service role) │             │
                  │  1. ตรวจ player_token       │             │
                  │  2. ตรวจเฟส/สิทธิ์/ส่งซ้ำ   │             │
                  │  3. เรียกเครื่องยนต์กติกา   │             │
                  │  4. เขียนผลลง DB            │             │
                  │  5. ส่งคืนเฉพาะมุมมองของคนนั้น│            │
                  └────────┬────────────────────┘             │
                           │ service_role key                 │ anon key
                  ┌────────▼──────────────────────────────────▼────────┐
                  │                   Supabase                          │
                  │  ตารางเปิด (anon อ่านได้):  ww_rooms, ww_players,   │
                  │                             ww_chat_public, ww_events│
                  │  ตารางลับ (anon อ่านไม่ได้): ww_secrets, ww_actions, │
                  │                             ww_chat_private, ww_votes│
                  └─────────────────────────────────────────────────────┘
```

**ศัพท์:**
- *service role key* = กุญแจระดับผู้ดูแลฐานข้อมูล ข้าม RLS ได้ทุกกฎ → **ใช้ได้แค่ในฟังก์ชันฝั่งเซิร์ฟเวอร์ ห้ามโผล่ในเบราว์เซอร์**
- *anon key* = กุญแจสาธารณะ ติดอยู่ในหน้าเว็บอยู่แล้ว ทุกคนเห็นได้ → ต้องถูก RLS คุมเสมอ
- *RLS (Row Level Security)* = กฎในฐานข้อมูลว่าแถวไหนใครอ่าน/เขียนได้
- *player_token* = "ตั๋ว" สุ่มยาวๆ ที่เซิร์ฟเวอร์ออกให้ตอนเข้าห้อง เก็บใน localStorage ใช้พิสูจน์ตัวตนทุกครั้งที่ส่งแอคชัน

---

## 3. โครงโฟลเดอร์ใหม่

```
src/games/werewolf/
├── engine/                       ★ TypeScript ล้วน — ไม่มี React ไม่มี Supabase
│   ├── types.ts                  GameState, Player, Action, Settings, Event
│   ├── settings.ts               ค่าเริ่มต้น + พรีเซ็ต + validate
│   ├── roles/
│   │   ├── index.ts              ทะเบียนบททั้งหมด (role registry)
│   │   ├── villager.ts  werewolf.ts  seer.ts  guardian.ts
│   │   ├── witch.ts  hunter.ts  cupid.ts  littleGirl.ts
│   │   ├── chief.ts  idiot.ts
│   │   └── (แพ็กเสริมเพิ่มที่นี่ทีละไฟล์ — M6)
│   ├── nightOrder.ts             ลำดับตื่น + การหน่วงเวลากันเดา
│   ├── resolveNight.ts           ★ ลำดับการตัดสินผล 9 ขั้น (RULES.md ข้อ 5)
│   ├── resolveVote.ts            นับคะแนน + เสียงเสมอ + คนโง่ + หัวหน้า
│   ├── winConditions.ts          เงื่อนไขชนะ + ลำดับความสำคัญ
│   ├── balance.ts                คะแนนสมดุล + คำเตือนไทย
│   ├── narration.ts              ข้อความผู้ดำเนินเกม (ภาษาไทย)
│   ├── reducer.ts                ★ applyAction(state, action) → {state, events}
│   └── bots.ts                   บอทสุ่มเล่นได้ทุกบท (ใช้ทดสอบ)
├── engine/__tests__/             เทสต์ vitest (ดูข้อ 9)
├── net/
│   ├── werewolfClient.ts         เรียก /api/ww/* + subscribe realtime
│   └── types.ts                  รูปร่างข้อมูลที่รับ-ส่งกับเซิร์ฟเวอร์
├── ui/                           ปุ่ม/การ์ด/โมดัลของเกมนี้ (มือถือมาก่อน)
├── components/
│   ├── WerewolfApp.tsx           หน้าแรกเกม: สร้าง/เข้าห้อง (เทียบ CheeseGameApp)
│   ├── WerewolfRoom.tsx          เปลือกห้อง: realtime + poll → แจกให้เฟส
│   ├── WerewolfErrorBoundary.tsx
│   ├── Narrator.tsx              แถบบรรยาย + แอนิเมชันกลางวัน/กลางคืน
│   ├── GameChatPanel.tsx         แชทหลายช่อง
│   ├── HowToPlay.tsx             หน้าวิธีเล่น (ดึงข้อความจาก RULES data)
│   └── phases/
│       ├── LobbyPhase.tsx  SettingsPanel.tsx  RoleRevealPhase.tsx
│       ├── NightPhase.tsx  MorningPhase.tsx   ElectionPhase.tsx
│       ├── DiscussionPhase.tsx  VotePhase.tsx GameOverPhase.tsx
└── text/th.ts                    ★ ข้อความไทยทั้งเกมอยู่ไฟล์เดียว

netlify/functions/
├── _shared/
│   ├── supabaseAdmin.ts          client ด้วย service role (ฝั่งเซิร์ฟเวอร์เท่านั้น)
│   ├── auth.ts                   ตรวจ player_token → รู้ว่าเป็นใครในห้องไหน
│   ├── loadState.ts              ประกอบ GameState จาก DB
│   ├── saveState.ts              เขียน state + events กลับ DB
│   └── views.ts                  ★ กรองข้อมูลตามมุมมองผู้เล่น (ห้ามรั่ว)
├── ww-create-room.ts
├── ww-join-room.ts
├── ww-update-settings.ts
├── ww-start-game.ts
├── ww-my-view.ts                 ★ ดึง "มุมมองของฉัน" (บทฉัน, เพื่อนร่วมฝ่าย, สิ่งที่ฉันทำได้ตอนนี้)
├── ww-action.ts                  ★ ส่งแอคชันทุกชนิด (กัด/ดู/กัน/ยา/ยิง/เลือกคู่รัก/…)
├── ww-vote.ts
├── ww-chat.ts                    ส่ง+อ่านแชทช่องส่วนตัว
└── ww-tick.ts                    ★ เดินเวลา/หมดเวลา (ใครก็เรียกได้ เซิร์ฟเวอร์ตรวจเองว่าถึงเวลาจริงไหม)

supabase_werewolf_setup.sql       ★ ตาราง ww_* + RLS (ไฟล์แยก ไม่แตะของเดิม)
```

---

## 4. โครงข้อมูลในฐานข้อมูล

> หลักการ: **แยกตารางเปิด / ตารางลับ ชัดเจนตั้งแต่วันแรก** (บทเรียนจาก `REUSE_AUDIT.md` ข้อ 5.3)

### 4.1 ตารางเปิด — `anon` อ่านได้ (เขียนไม่ได้)

#### `ww_rooms`
| คอลัมน์ | ชนิด | ความหมาย |
|---|---|---|
| `room_code` | text PK | รหัสห้อง 5 ตัว |
| `host_player_id` | uuid | เจ้าของห้อง |
| `phase` | text | `lobby` `role_reveal` `night` `morning` `election` `discussion` `vote` `game_over` |
| `day_number` | int | 0 = ยังไม่เริ่ม |
| `night_slot` | int | ช่องตื่นที่กำลังทำงาน (ดู `RULES.md` ข้อ 4) |
| `phase_ends_at` | timestamptz | เวลาหมดอายุของเฟส (ไว้ให้ `ww-tick` ตรวจ) |
| `settings` | jsonb | ค่าตั้งค่าทั้งหมด (type `WerewolfSettings`) |
| `state_version` | int | ★ **ตัวนับรุ่น** — ขยับทุกครั้งที่สถานะเปลี่ยน ใช้เป็นสัญญาณให้ client ไปดึงข้อมูลส่วนตัวใหม่ |
| `winner` | text\|null | `village` `werewolf` `lovers` `tanner` `serial_killer` |
| `is_locked` | bool | ล็อกห้อง (เริ่มเกมแล้วห้ามเข้า) |
| `room_password` | text\|null | **เก็บเป็น hash** ไม่ใช่ข้อความดิบ |
| `created_at` | timestamptz | |

#### `ww_players` — **ห้ามมีคอลัมน์ `role` เด็ดขาด**
| คอลัมน์ | ชนิด | ความหมาย |
|---|---|---|
| `player_id` | uuid PK | |
| `room_code` | text FK | |
| `display_name` | text | ชื่อเล่น |
| `avatar` | text | data URI / URL |
| `seat` | int | ลำดับที่นั่ง (ใช้เรียงหน้าจอให้เหมือนกันทุกเครื่อง) |
| `is_host` | bool | |
| `is_bot` | bool | |
| `is_alive` | bool | |
| `is_connected` | bool | ออนไลน์อยู่ไหม |
| `last_seen_at` | timestamptz | ใช้ตรวจคนหลุด |
| `death_day` | int\|null | ตายวันไหน |
| `death_cause` | text\|null | `wolf` `poison` `vote` `hunter` `lover` `caught` … |
| `revealed_role` | text\|null | ★ บทที่ **เปิดเผยแล้วตามกติกา** เท่านั้น (ตายแล้ว + ตั้งค่าให้เปิด) |
| `revealed_team` | text\|null | ฝ่ายที่เปิดเผยแล้ว (กรณีตั้งค่า "เปิดแค่ฝ่าย") |
| `is_chief` | bool | เป็นหัวหน้าหมู่บ้านไหม (เปิดเผยได้) |
| `can_vote` | bool | คนโง่ที่รอดแล้วจะเป็น false |

#### `ww_chat_public`
`id` · `room_code` · `player_id` · `display_name` · `avatar` · `text` · `created_at`
(ช่องสาธารณะเท่านั้น — ช่องลับอยู่ตารางอื่น)

#### `ww_events` — บันทึกเกม **ฉบับที่เปิดเผยได้**
`id` · `room_code` · `day_number` · `phase` · `kind` · `payload_public` jsonb · `created_at`
ใช้ทำแถบบรรยาย + ไทม์ไลน์หน้าจบเกม
⚠️ เหตุการณ์ลับ (ใครกัดใคร, ผู้หยั่งรู้ดูใคร) **เก็บใน `ww_events_private`** และจะถูก "เลื่อนขั้น" มาเป็นสาธารณะตอนจบเกมเท่านั้น

### 4.2 ตารางลับ — `anon` **อ่านไม่ได้เลย** (deny-all)

| ตาราง | เก็บอะไร |
|---|---|
| `ww_secrets` | `player_id` PK · `room_code` · **`role`** · `team` · `role_state` jsonb (ยาแม่มดเหลือกี่ขวด, คู่รักของฉันคือใคร, แบบอย่างของเด็กป่า, หมอกันใครคืนก่อน) |
| `ww_player_auth` | `player_id` PK · `room_code` · **`token_hash`** · `created_at` — ★ เก็บเฉพาะ **แฮช** ของตั๋ว ไม่เก็บตั๋วดิบ |
| `ww_actions` | `id` · `room_code` · `day_number` · `night_slot` · `actor_id` · `kind` · `target_id` · `target_id_2` · `created_at` · unique(`room_code`,`day_number`,`night_slot`,`actor_id`,`kind`) ← **กันส่งซ้ำด้วย DB** |
| `ww_votes` | `room_code` · `day_number` · `round` · `voter_id` · `target_id`\|`skip` · PK(`room_code`,`day_number`,`round`,`voter_id`) |
| `ww_chat_private` | `id` · `room_code` · `channel` (`wolf`\|`lovers`\|`dead`) · `channel_key` · `player_id` · `text` · `created_at` |
| `ww_events_private` | บันทึกเหตุการณ์ลับทั้งหมด (ใช้ตอนจบเกมและตรวจบั๊ก) |

### 4.3 RLS ที่ต้องเขียน

```sql
-- ตารางเปิด: anon อ่านได้ แต่เขียนไม่ได้ (เขียนผ่าน service role เท่านั้น)
alter table ww_rooms enable row level security;
create policy "ww_rooms_read" on ww_rooms for select using (true);
-- ★ ไม่มี policy สำหรับ insert/update/delete = anon เขียนไม่ได้

-- ตารางลับ: ไม่สร้าง policy ใดๆ เลย
alter table ww_secrets enable row level security;
-- ★ เปิด RLS แล้วไม่มี policy = anon อ่าน/เขียนไม่ได้เลย (service role ยังข้ามได้)
```

**เทสต์ความปลอดภัยที่ต้องผ่าน (M3 + M7):** เปิด console ในเบราว์เซอร์ผู้เล่นแล้วลองยิง
`await supabase.from('ww_secrets').select('*')` → ต้องได้ **array ว่าง หรือ error** เท่านั้น

### 4.4 Realtime
เปิดเฉพาะ **ตารางเปิด**:
```sql
alter publication supabase_realtime add table ww_rooms;
alter publication supabase_realtime add table ww_players;
alter publication supabase_realtime add table ww_chat_public;
alter publication supabase_realtime add table ww_events;
```
⚠️ **ห้ามเปิด Realtime กับตารางลับ** แม้จะมี RLS คุมอยู่ก็ไม่เปิด (ลดพื้นที่ผิดพลาด)

### 4.5 กลไก "รู้ว่าต้องไปดึงข้อมูลส่วนตัวใหม่"

ข้อมูลส่วนตัวมาทาง Realtime ไม่ได้ (เพราะปิดไว้) จึงใช้วิธีนี้:

```
เซิร์ฟเวอร์เขียนผล → ww_rooms.state_version += 1
        ↓ Realtime แจ้ง (เป็นข้อมูลเปิด ปลอดภัย)
client เห็น state_version เปลี่ยน → POST /api/ww/my-view
        ↓
ได้ "มุมมองของฉัน" ก้อนใหม่ (บทฉัน, ตาฉันไหม, ปุ่มที่กดได้)
+ poll สำรองทุก 5 วินาที เผื่อสัญญาณหลุด (แบบเดียวกับเกมหนูชีส)
```

---

## 5. เครื่องยนต์กติกา (rules engine)

### 5.1 รูปร่างหลัก

```ts
// src/games/werewolf/engine/types.ts
export interface GameState {
  roomCode: string;
  phase: Phase;
  dayNumber: number;
  nightSlot: number;
  settings: WerewolfSettings;
  players: EnginePlayer[];      // รวมข้อมูลลับ — ★ อยู่ฝั่งเซิร์ฟเวอร์เท่านั้น
  pendingNight: NightIntents;   // ความตั้งใจของคืนนี้ ยังไม่ตัดสิน
  chiefId: string | null;
  loverPairs: [string, string][];
  winner: Winner | null;
  rngSeed: string;              // ★ สุ่มแบบกำหนดเมล็ดได้ → เทสต์ซ้ำได้ผลเดิม
}

// ฟังก์ชันหลักเดียว — ไม่มี side effect
export function applyAction(
  state: GameState,
  action: GameAction,
): { state: GameState; events: GameEvent[]; error?: EngineError };
```

**ข้อบังคับ:** `engine/` **ห้าม import** `react`, `@supabase/supabase-js`, `motion` หรืออะไรที่แตะเน็ตเวิร์ก
→ ใส่ไว้เป็น lint rule หรือเทสต์ตรวจ import ก็ได้

### 5.2 ข้อมูลบทบาท (role data) — เพิ่มบทใหม่ได้โดยไม่แก้เครื่องยนต์

```ts
// src/games/werewolf/engine/roles/seer.ts
export const seer: RoleDefinition = {
  id: 'seer',
  nameTh: 'ผู้หยั่งรู้',
  team: 'village',
  balanceScore: 6,
  descriptionTh: 'ทุกคืนคุณเลือกดูผู้เล่นหนึ่งคนและรู้ความจริงเกี่ยวกับเขา…',
  nightSlot: 5,
  wakesOn: 'every-night',
  actions: [{
    kind: 'investigate',
    targets: 1,
    canTargetSelf: false,
    canTargetDead: false,
    oncePerNight: true,
  }],
  // ผู้หยั่งรู้ไม่ฆ่าใคร ผลลัพธ์คือ "ข้อมูลส่วนตัว" ที่ส่งกลับให้เจ้าตัวเท่านั้น
  onNightResolve: (ctx) => ctx.revealTo(ctx.actorId, ctx.seerResultFor(ctx.targetId)),
  seenBySeerAs: 'seer',
  settingsSchema: [
    { key: 'seerSeesExactRole', labelTh: 'ผู้หยั่งรู้เห็นบทจริง',
      helpTh: 'เปิด = เห็นชื่อบทเต็ม (มาตรฐาน Millers Hollow) · ปิด = เห็นแค่ว่าเป็นหมาป่าหรือไม่ (Ultimate Werewolf)',
      type: 'boolean', default: true },
  ],
};
```

ทะเบียนบทอยู่ที่ `roles/index.ts` → `nightOrder.ts` และหน้าตั้งค่าอ่านจากทะเบียนนี้ทั้งคู่
→ **เพิ่มบทใหม่ = เพิ่มไฟล์ 1 ไฟล์ + ลงทะเบียน 1 บรรทัด**

### 5.3 ลำดับการตัดสินผลตอนเช้า
อยู่ใน `resolveNight.ts` ทำตาม `RULES.md` ข้อ 5 ทั้ง 9 ขั้นแบบตรงตัว
ทุกขั้นต้องเขียน event ลง `ww_events_private` เพื่อให้ตรวจย้อนหลังได้ว่าทำไมใครตาย

---

## 6. ข้อความจากเซิร์ฟเวอร์ถึงผู้เล่น (API contract)

ทุกคำขอมี header: `x-ww-player-id` + `x-ww-token`

### 6.1 `POST /api/ww/my-view` — ★ หัวใจของการกันความลับ

**ส่งไป:** `{ roomCode }`

**ได้คืน (ตัวอย่างของผู้หยั่งรู้ที่ยังมีชีวิต คืนที่ 2):**
```json
{
  "stateVersion": 42,
  "phase": "night",
  "dayNumber": 2,
  "nightSlot": 5,
  "narrationTh": "หมู่บ้านหลับใหล… ผู้หยั่งรู้ตื่นขึ้น",
  "me": {
    "playerId": "p1",
    "role": "seer",
    "roleNameTh": "ผู้หยั่งรู้",
    "team": "village",
    "isAlive": true,
    "roleState": {}
  },
  "allies": [],
  "lover": null,
  "myTurn": {
    "isMyTurn": true,
    "actionKind": "investigate",
    "promptTh": "เลือกผู้เล่นที่ต้องการดู",
    "selectableTargets": ["p2", "p3", "p5"],
    "endsAt": "2026-10-01T12:00:25Z"
  },
  "privateKnowledge": [
    { "day": 1, "textTh": "คืนที่ 1: คุณดู ส้ม → ชาวบ้าน" }
  ],
  "publicPlayers": [
    { "playerId": "p2", "displayName": "ส้ม", "isAlive": true,  "isChief": false, "revealedRole": null },
    { "playerId": "p4", "displayName": "มิ้น", "isAlive": false, "isChief": false, "revealedRole": "villager", "deathCause": "wolf" }
  ]
}
```

**กฎเหล็กของ endpoint นี้:**
- `me.role` มีได้ **แค่บทของคนที่ถาม**
- `allies` ใส่ได้เฉพาะเมื่อกติกาอนุญาต (หมาป่าเห็นหมาป่า, เมสันเห็นเมสัน, คู่รักเห็นกัน)
- `publicPlayers[].revealedRole` ต้องเป็น `null` เสมอ ถ้ายังไม่เข้าเงื่อนไขเปิดเผยตามค่าตั้งค่า
- ❌ **ห้ามส่ง `pendingNight` / `rngSeed` / รายชื่อผู้ถูกกัด (ยกเว้นแม่มดที่กติกาให้เห็น) ออกไปเด็ดขาด**
- ทำ **เทสต์เฉพาะ** ของ `views.ts`: ให้ GameState ตั้งต้น → เรียกสร้างมุมมองของผู้เล่นทุกคน → ตรวจว่าไม่มี JSON ของใครมีคำว่า `werewolf` ยกเว้นของหมาป่าเอง

### 6.2 `POST /api/ww/action`
```json
{ "roomCode":"AB12C", "dayNumber":2, "nightSlot":6,
  "kind":"wolf_bite", "targetId":"p3" }
```
เซิร์ฟเวอร์ตรวจเรียงลำดับ:
1. ตั๋วถูกต้องและอยู่ห้องนี้จริง
2. ยังมีชีวิต (ถ้าแอคชันต้องมีชีวิต)
3. **ถือบทนั้นจริง** ← ป้องกัน "ชาวบ้านส่งคำสั่งกัด"
4. เฟสและช่องตื่นตรงกับที่บทนั้นควรทำ ← ป้องกัน "ส่งผิดเฟส"
5. ยังไม่เคยส่ง (unique constraint ใน `ww_actions`) ← ป้องกัน "ส่งซ้ำ"
6. เป้าหมายถูกต้องตามกฎของบท (ตัวเองได้ไหม / คนตายได้ไหม / คนเดิมซ้ำได้ไหม)

**ไม่ผ่าน → ตอบ `403` + `{ errorTh: "..." }` และ *ไม่* เปลี่ยนสถานะเกม**
ทุกคำขอที่ถูกปฏิเสธต้องบันทึกลง `ww_events_private` (ไว้ดูว่าใครลองโกง)

### 6.3 endpoint อื่น
| endpoint | หน้าที่ |
|---|---|
| `POST /api/ww/create-room` | สร้างห้อง → คืน `roomCode`, `playerId`, `token` |
| `POST /api/ww/join-room` | เข้าห้อง (ตรวจรหัสผ่าน, ห้องเต็ม, ชื่อซ้ำ) → คืน `playerId`, `token` |
| `POST /api/ww/update-settings` | เจ้าของห้องเท่านั้น · ตรวจ "จำนวนบท = จำนวนผู้เล่น" |
| `POST /api/ww/start-game` | แจกบทลับ (สุ่มด้วย `rngSeed`) → เขียน `ww_secrets` → `phase=role_reveal` |
| `POST /api/ww/vote` | โหวต (ตรวจ `can_vote`, เฟส, ซ้ำ) |
| `POST /api/ww/chat` | ส่ง/อ่านแชทช่องส่วนตัว (เซิร์ฟเวอร์ตรวจว่าอยู่ช่องนั้นจริง) |
| `POST /api/ww/tick` | ★ เดินเฟสเมื่อ `phase_ends_at` ผ่านไปแล้ว — **ใครเรียกก็ได้** เพราะเซิร์ฟเวอร์ตรวจเวลาเองและทำงานแบบ idempotent (เรียกซ้ำไม่เกิดผลสองรอบ) |

> `ww-tick` แก้ข้อจำกัดของ serverless ที่จับเวลาค้างไม่ได้: client ทุกเครื่องเรียก `tick` ทุก 2–3 วินาที
> เซิร์ฟเวอร์เป็นคนตัดสินว่า "ถึงเวลาแล้วจริงไหม" → เกมไม่หยุดแม้เจ้าของห้องปิดแท็บ

### 6.4 `netlify.toml` ที่ต้องเพิ่ม (ลำดับสำคัญ!)
```toml
[[redirects]]              # ★ ต้องมาก่อนกฎ SPA
  from = "/api/ww/*"
  to   = "/.netlify/functions/ww-:splat"
  status = 200

[[redirects]]              # กฎเดิม — ปล่อยไว้
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 7. ตัวตนผู้เล่น + ตั๋ว (player token)

```
เข้าห้อง → เซิร์ฟเวอร์สุ่ม token (32 ไบต์) → เก็บ "แฮช" ลง ww_player_auth
                                            → ส่ง "ตั๋วดิบ" กลับให้เบราว์เซอร์ครั้งเดียว
เบราว์เซอร์เก็บใน localStorage: ww_token_<roomCode>
ทุกคำขอ → แนบ x-ww-player-id + x-ww-token → เซิร์ฟเวอร์แฮชแล้วเทียบ
```

- ยังใช้ `display_name` จากระบบชื่อเล่นเดิม (`grammar_quiz_username_v1`) + อวตาร์จาก `winter_profiles` → **ไม่ต้องรื้อระบบเดิม**
- **กลับเข้าห้องหลังหลุด** = ตั๋วเดิมใน localStorage ยังใช้ได้ → ได้บทเดิมคืน
- เปลี่ยนเครื่อง/ล้าง localStorage = ตั๋วหาย → ต้องให้เจ้าของห้องกด "ปล่อยที่นั่งคืน" (ดู `OPEN_QUESTIONS.md` Q12)

---

## 8. ผู้เล่นหลุดกลางเกม

| ค่าตั้งค่า | พฤติกรรม |
|---|---|
| **รอ** *(ค่าเริ่มต้น)* | เฟสหยุดรอถึง `phase_ends_at` แล้วค่อย "ข้าม/สุ่ม" ตามค่าตั้งค่าเวลา |
| **ให้บอทเล่นแทน** | หลุดเกิน `disconnect_grace_seconds` (60) → `is_bot=true` ชั่วคราว บอทเล่นแทน กลับมาแล้วคืนสิทธิ์ |
| **ถือว่าตาย** | หลุดเกินเวลา → ตาย `death_cause='disconnect'` และ **ต้องตรวจเงื่อนไขชนะทันที** |

ตรวจจากคอลัมน์ `last_seen_at` ที่ client อัปเดตผ่าน `ww-tick`

---

## 9. ระบบเทสต์

ติดตั้ง `vitest` (โปรเจกต์ยังไม่มีอะไรเลย) เพิ่ม script:
```json
"test": "vitest run",
"test:watch": "vitest",
"sim": "tsx src/games/werewolf/engine/__tests__/simulate.ts"
```

### เทสต์ที่ต้องมี (ตามโจทย์ข้อ 7 — ทุกข้อคือ 1 ไฟล์เทสต์)
| ไฟล์ | ครอบคลุม |
|---|---|
| `resolveNight.protect.test.ts` | หมอกันคนที่ถูกกัด + แม่มดชุบซ้ำ (ยาต้องไม่เสียเปล่า) |
| `resolveNight.lovers.test.ts` | คนถูกกัดเป็นคู่รัก · คู่รักตายพร้อมกันจากสองสาเหตุ |
| `resolveNight.hunter.test.ts` | นายพรานตายจากโหวต/พิษ/ตายตามคู่รัก + ลูกโซ่ยิงต่อ |
| `resolveNight.chief.test.ts` | นายพรานยิงหัวหน้า → ส่งต่อตำแหน่ง · หัวหน้าถูกกัด · หัวหน้าเป็นบทอื่นพร้อมกัน |
| `resolveVote.tie.test.ts` | เสียงเสมอทั้ง 4 รูปแบบ |
| `resolveVote.idiot.test.ts` | คนโง่ถูกโหวต แล้วการโหวตครั้งถัดไป |
| `disconnect.test.ts` | ผู้เล่นหลุดกลางเฟสกลางคืน (ทั้ง 3 ค่าตั้งค่า) |
| `winConditions.test.ts` | หลายฝ่ายชนะพร้อมกัน → ตรวจลำดับความสำคัญ (`RULES.md` 7.2) |
| `views.leak.test.ts` | ★ มุมมองของผู้เล่นทุกคนต้องไม่มีความลับของคนอื่น |
| `actionGuards.test.ts` | ★ ส่งแอคชันของบทที่ไม่ได้ถือ / ส่งซ้ำ / ส่งผิดเฟส → ต้องถูกปฏิเสธ |
| `simulate.ts` | ★ จำลองเกมครบวงจรด้วยบอทล้วนในเทอร์มินัล — รัน 500 เกมแล้วต้องไม่มีเกมค้าง ไม่มี crash และมีผู้ชนะทุกเกม |

`rngSeed` ทำให้เทสต์ซ้ำได้ผลเดิม (deterministic) — ถ้าเจอบั๊กจากการจำลอง จะได้ seed ไปทำซ้ำได้

---

## 10. UI มือถือมาก่อน

- ปุ่มสูง ≥ 48px · ตัวอักษร ≥ 14px · ระยะขอบ 16px · ไม่มีการเลื่อนซ้าย-ขวา
- หน้าจอกลางคืน: ภาพเต็มจอ 1 คำถาม 1 รายชื่อ (ไม่ต้องเลื่อนหา)
- รายชื่อผู้เล่นเรียงตาม `seat` **เหมือนกันทุกเครื่อง** (กันความสับสนเวลาคุยกันว่า "คนที่ 3")
- แอนิเมชันเปลี่ยนกลางวัน/กลางคืนด้วย `motion` (ยืมสไตล์ spring จากเกมเดิม)
- คนตายเห็นหน้าจอ "ผู้ชม" + แชทคนตาย (ตามค่าตั้งค่า)

---

## 11. จุดที่ยังไม่ตัดสินใจ
ดู `OPEN_QUESTIONS.md` — **ห้ามเขียนโค้ดส่วนที่ขึ้นกับคำตอบเหล่านั้นก่อนได้คำตอบ**
