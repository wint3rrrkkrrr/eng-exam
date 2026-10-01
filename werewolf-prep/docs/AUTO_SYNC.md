# AUTO_SYNC.md — เอาไฟล์ลงเครื่อง + ให้งานขึ้น Git เองอัตโนมัติ

> เขียนสำหรับเครื่อง Windows ที่โฟลเดอร์ `C:\Users\user\Downloads\eng-exam`
> branch ที่ใช้ทำงาน: **`claude/laughing-johnson-qatda0`**

---

## ส่วนที่ 1 — ดึงไฟล์ทั้งหมดลงเครื่อง (ทำครั้งเดียว)

เปิด **PowerShell** (กดปุ่ม Windows → พิมพ์ `powershell` → Enter) แล้วทำตามนี้

### กรณี ก: ยังไม่มีโฟลเดอร์นี้ในเครื่อง (เริ่มจากศูนย์)

```powershell
cd C:\Users\user\Downloads
git clone https://github.com/wint3rrrkkrrr/eng-exam.git
cd eng-exam
git switch claude/laughing-johnson-qatda0
npm install
```

### กรณี ข: มีโฟลเดอร์นี้อยู่แล้ว (ดึงของใหม่มาทับ)

```powershell
cd C:\Users\user\Downloads\eng-exam
git fetch origin claude/laughing-johnson-qatda0
git switch claude/laughing-johnson-qatda0
git pull origin claude/laughing-johnson-qatda0
npm install
```

> ถ้า `git pull` ขึ้นว่ามีไฟล์ชนกัน (conflict) แปลว่าคุณมีไฟล์ที่แก้ไว้ในเครื่องแล้วชนกับของใหม่
> ให้พิมพ์ `git status` ดูว่าไฟล์ไหนชน แล้วบอก Claude ให้ช่วยแก้ ไม่ต้องแก้เอง

### เช็กว่าได้ของครบ

```powershell
dir docs\werewolf
```

ต้องเห็น 6 ไฟล์: `BRIEF.md` · `REUSE_AUDIT.md` · `RULES.md` · `GAME_SPEC.md` · `OPEN_QUESTIONS.md` · `PLAN.md`

---

## ส่วนที่ 2 — ให้งานขึ้น Git เองอัตโนมัติ

มีให้ **2 แบบ ทำงานร่วมกันได้** เลือกใช้ทั้งคู่ก็ได้

### แบบ A ⭐ (แนะนำ) — Claude push ให้เองทุกครั้งที่ทำงานเสร็จ

**ติดตั้งแล้วเรียบร้อย ไม่ต้องทำอะไรเพิ่ม** — ไฟล์ `.claude/settings.json` ในโปรเจกต์ตั้ง "hook" ไว้แล้ว

**ศัพท์:** *hook* = คำสั่งที่ Claude Code รันให้อัตโนมัติเมื่อเกิดเหตุการณ์บางอย่าง
ที่ตั้งไว้คือ **`Stop`** = ทุกครั้งที่ Claude ตอบจบ 1 รอบ → `commit` + `push` ให้ทันที

```
Claude แก้ไฟล์ → Claude ตอบจบ → commit + push ขึ้น GitHub เอง
```

เปิด Claude Code ที่โฟลเดอร์นี้:
```powershell
cd C:\Users\user\Downloads\eng-exam
claude
```
ครั้งแรกที่ hook ทำงาน Claude Code อาจถามขออนุญาตรันคำสั่ง — กดอนุญาต

### แบบ B — เฝ้าดูไฟล์ตลอดเวลา (ใช้เมื่อคุณแก้ไฟล์เองด้วย)

เปิด PowerShell **อีกหน้าต่างหนึ่ง** แยกจากหน้าต่างที่รัน Claude แล้วพิมพ์:

```powershell
cd C:\Users\user\Downloads\eng-exam
npm run sync
```

จะเห็นข้อความ:
```
═══════════════════════════════════════════════
  🐺 Auto-Sync: แก้ไฟล์แล้วขึ้น Git ให้เองเลย
═══════════════════════════════════════════════
👀 เฝ้าดูไฟล์อยู่ (โหมด recursive)
```

**ทำอะไร:** เฝ้าดูทุกไฟล์ในโปรเจกต์ · มีไฟล์เปลี่ยน → รอให้นิ่ง **5 วินาที** → `commit` + `push`
(ที่รอ 5 วินาทีเพราะกันกรณีเซฟรัวๆ หรือ Claude แก้ 10 ไฟล์ติดกัน จะได้ **commit เดียว** ไม่ใช่ 10 commit)

**หยุด:** กด `Ctrl + C`

> ปล่อยหน้าต่างนี้เปิดไว้ตลอดเวลาที่ทำงาน

### แบบ C — สั่ง push เองเมื่อต้องการ

```powershell
npm run push
```

---

## ส่วนที่ 3 — กันเผลอ / ความปลอดภัย

สคริปต์ตั้งการ์ดไว้แล้ว:

| การ์ด | รายละเอียด |
|---|---|
| 🛡️ ไม่ push ขึ้น `main` | ถ้าเผลออยู่บน `main`/`master` จะไม่ push และเตือนให้สลับ branch ก่อน |
| 🛡️ ไม่มี force push | ไม่มีคำสั่ง `--force` ในสคริปต์เลย → ประวัติ Git ไม่เสียหาย |
| 🛡️ ไม่ commit ไฟล์ความลับ | `.gitignore` คุม `.env*` อยู่แล้ว + สคริปต์กรอง `.env` อีกชั้น · ข้าม `node_modules`, `dist`, `db_store.json` |
| 🛡️ ชน commit จากคลาวด์ | ถ้ามีคน (หรือ Claude บนเว็บ) push มาก่อน → `git pull --rebase` อัตโนมัติแล้วลองใหม่ |
| 🛡️ เน็ตสะดุด | ลอง push ซ้ำ 4 ครั้ง ถอยหลังทีละเท่า (2 → 4 → 8 → 16 วินาที) |
| 🛡️ ไม่มีอะไรเปลี่ยน | ไม่สร้าง commit เปล่า ไม่รบกวน |

---

## ส่วนที่ 4 — คำสั่งที่ใช้บ่อย

| อยากทำอะไร | พิมพ์ |
|---|---|
| รันเว็บดู | `npm run dev` → เปิด http://localhost:3000 |
| ตรวจว่าโค้ดไม่มี error | `npm run lint` |
| เปิด auto-sync | `npm run sync` |
| push เดี๋ยวนี้ | `npm run push` |
| ดูว่าแก้อะไรไว้ | `git status` |
| ดึงของใหม่จาก GitHub | `git pull origin claude/laughing-johnson-qatda0` |
| ดูประวัติ | `git log --oneline -10` |

---

## ส่วนที่ 5 — ถ้ามีปัญหา

| อาการ | ทำอย่างไร |
|---|---|
| `git` ไม่รู้จัก | ติดตั้ง Git for Windows → https://git-scm.com/download/win แล้วปิด-เปิด PowerShell ใหม่ |
| `node` / `npm` ไม่รู้จัก | ติดตั้ง Node.js LTS → https://nodejs.org แล้วปิด-เปิด PowerShell ใหม่ |
| push แล้วถาม username/password | ใช้ GitHub CLI: `winget install GitHub.cli` แล้ว `gh auth login` (เลือก HTTPS) |
| ขึ้น `[rejected]` | สคริปต์จัดการให้เอง · ถ้าแก้ไม่ได้ จะเตือนว่ามี conflict ให้บอก Claude ช่วยแก้ |
| `npm run sync` ไม่จับการเปลี่ยนไฟล์ | ปิดด้วย `Ctrl + C` แล้วเปิดใหม่ · หรือใช้ `npm run push` สั่งเองไปก่อน |
| อยู่ branch ผิด | `git switch claude/laughing-johnson-qatda0` |

---

## ส่วนที่ 6 — งานค้างอยู่ตรงไหน

อ่าน `docs/werewolf/PLAN.md` — สรุปสั้นๆ:

- ✅ **M0 ตรวจของเก่า** — เอกสารเสร็จแล้ว
- 🟡 **M1 กติกา + สถาปัตยกรรม** — ร่างเสร็จแล้ว
- ⏳ **สิ่งที่ต้องทำต่อ:** ตอบคำถาม **Q1–Q5** ใน `docs/werewolf/OPEN_QUESTIONS.md` แล้ว Claude จะเริ่ม M1 ส่วนที่เหลือ (SQL + RLS) ต่อได้

**ประโยคที่พิมพ์ให้ Claude ที่เครื่อง local ได้เลย:**

```
อ่าน CLAUDE.md และ docs/werewolf/ ทั้งโฟลเดอร์ก่อน
แล้วสรุปให้ฟังว่างานค้างอยู่ตรงไหน และถาม Q1-Q5 ใน OPEN_QUESTIONS.md ทีละข้อ
```
