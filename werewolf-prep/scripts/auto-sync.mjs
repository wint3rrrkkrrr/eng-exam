#!/usr/bin/env node
/**
 * auto-sync.mjs — เฝ้าดูไฟล์ในโปรเจกต์ ถ้ามีการแก้ไข จะ commit + push ให้เองอัตโนมัติ
 *
 * รัน:  npm run sync
 * หยุด: กด Ctrl + C
 *
 * ทำงานได้ทั้ง Windows / macOS / Linux (ใช้แค่ Node ที่มีอยู่แล้ว ไม่ต้องลงอะไรเพิ่ม)
 *
 * วิธีทำงาน:
 *   1. เฝ้าดูทุกไฟล์ในโฟลเดอร์โปรเจกต์ (ข้าม node_modules, dist, .git)
 *   2. เมื่อมีไฟล์เปลี่ยน จะรอให้นิ่งก่อน DEBOUNCE_MS มิลลิวินาที
 *      (กันกรณีเซฟรัวๆ หรือ Claude แก้ 10 ไฟล์ติดกัน → จะได้ commit เดียว ไม่ใช่ 10 commit)
 *   3. แล้วค่อยเรียก scripts/git-autopush.mjs
 */
import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const DEBOUNCE_MS = 5000;   // รอ 5 วินาทีหลังการแก้ครั้งสุดท้าย

const IGNORED_DIRS = new Set([
  '.git', 'node_modules', 'dist', 'build', 'coverage', '.netlify', '.vite', '.cache',
]);

const IGNORED_FILE_PATTERNS = [
  /^\.env/,           // ไฟล์ความลับ — .gitignore คุมอยู่แล้ว แต่กันอีกชั้น
  /\.log$/,
  /^db_store\.json$/, // ฐานข้อมูลตอน dev ของ server.ts
  /^\.DS_Store$/,
  /~$/,               // ไฟล์สำรองของ editor
  /^\d+$/,            // ไฟล์ชั่วคราวบางตัว
];

function shouldIgnore(relPath) {
  const parts = relPath.split(sep);
  if (parts.some(p => IGNORED_DIRS.has(p))) return true;
  const base = parts[parts.length - 1];
  return IGNORED_FILE_PATTERNS.some(re => re.test(base));
}

let timer = null;
let busy = false;
let queuedWhileBusy = false;
const touched = new Set();

function runAutopush() {
  if (busy) { queuedWhileBusy = true; return; }
  busy = true;

  const changed = [...touched];
  touched.clear();

  const label = changed.length === 0
    ? 'อัปเดต'
    : changed.length <= 3
      ? changed.join(', ')
      : `${changed.slice(0, 3).join(', ')} และอีก ${changed.length - 3} ไฟล์`;

  const stamp = new Date().toLocaleTimeString('th-TH');
  console.log(`\n[${stamp}] 🔄 กำลังบันทึกขึ้น Git: ${label}`);

  const child = spawn(process.execPath, [join(ROOT, 'scripts', 'git-autopush.mjs')], {
    cwd: ROOT,
    stdio: 'inherit',
  });

  child.on('exit', (code) => {
    busy = false;
    if (code !== 0) console.log('⚠️  รอบนี้ไม่สำเร็จ (ดูข้อความข้างบน) — จะลองอีกครั้งเมื่อมีไฟล์เปลี่ยนถัดไป');
    if (queuedWhileBusy) {
      queuedWhileBusy = false;
      scheduleSync();
    } else {
      console.log('👀 เฝ้าดูไฟล์ต่อ... (กด Ctrl + C เพื่อหยุด)');
    }
  });
}

function scheduleSync() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(runAutopush, DEBOUNCE_MS);
}

// --- ติดตั้งตัวเฝ้าดู ---
// fs.watch แบบ recursive ใช้ได้บน Windows และ macOS
// บน Linux บาง kernel ยังไม่รองรับ → ถอยไปเฝ้าดูทีละโฟลเดอร์
function watchRecursiveFallback(dir) {
  const watchers = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    const rel = relative(ROOT, current);
    if (rel && shouldIgnore(rel)) continue;
    try {
      watchers.push(watch(current, (_event, filename) => {
        if (!filename) { scheduleSync(); return; }
        const relFile = rel ? join(rel, filename) : filename;
        if (shouldIgnore(relFile)) return;
        touched.add(relFile);
        scheduleSync();
      }));
      for (const entry of readdirSync(current)) {
        const full = join(current, entry);
        try { if (statSync(full).isDirectory()) stack.push(full); } catch { /* ไฟล์หายไประหว่างอ่าน */ }
      }
    } catch { /* เข้าโฟลเดอร์ไม่ได้ ข้าม */ }
  }
  return watchers;
}

console.log('═══════════════════════════════════════════════');
console.log('  🐺 Auto-Sync: แก้ไฟล์แล้วขึ้น Git ให้เองเลย');
console.log('═══════════════════════════════════════════════');
console.log(`โฟลเดอร์: ${ROOT}`);
console.log(`รอให้ไฟล์นิ่ง ${DEBOUNCE_MS / 1000} วินาที แล้วค่อย commit + push`);
console.log('หยุดด้วย Ctrl + C');
console.log('───────────────────────────────────────────────');

try {
  watch(ROOT, { recursive: true }, (_event, filename) => {
    if (!filename) { scheduleSync(); return; }
    if (shouldIgnore(filename)) return;
    touched.add(filename);
    scheduleSync();
  });
  console.log('👀 เฝ้าดูไฟล์อยู่ (โหมด recursive)');
} catch {
  watchRecursiveFallback(ROOT);
  console.log('👀 เฝ้าดูไฟล์อยู่ (โหมดสำรอง — ทีละโฟลเดอร์)');
}

// push ของที่ค้างอยู่ตอนเริ่มรันทันที (เผื่อแก้ไว้ก่อนเปิดสคริปต์)
scheduleSync();

process.on('SIGINT', () => {
  console.log('\n👋 หยุดเฝ้าดูแล้ว');
  process.exit(0);
});
