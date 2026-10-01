#!/usr/bin/env node
/**
 * git-autopush.mjs — commit ทุกอย่างที่เปลี่ยน แล้ว push ขึ้น branch ปัจจุบัน
 *
 * ใช้ครั้งเดียวจบ (one-shot) เรียกจาก:
 *   - hook ของ Claude Code (.claude/settings.json) → push ทุกครั้งที่ Claude ทำงานเสร็จ
 *   - scripts/auto-sync.mjs → push เมื่อไฟล์เปลี่ยน
 *   - มือ: node scripts/git-autopush.mjs "ข้อความ commit"
 *
 * ความปลอดภัย:
 *   - push ขึ้น branch ที่อยู่ปัจจุบันเท่านั้น
 *   - ไม่ยอม push ขึ้น main/master (กันเผลอ)
 *   - ไม่มี force push เด็ดขาด
 *   - ไม่มีอะไรเปลี่ยน = ไม่ทำอะไร (เงียบ)
 */
import { execFileSync } from 'node:child_process';

const PROTECTED_BRANCHES = ['main', 'master'];
const MAX_PUSH_RETRIES = 4;

function git(args, opts = {}) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();
}

function sleep(ms) {
  // รอแบบ synchronous (ไม่ต้องใช้ await) เพื่อให้สคริปต์เรียบง่าย
  const until = Date.now() + ms;
  while (Date.now() < until) { /* busy wait */ }
}

function main() {
  const message = process.argv[2];

  let branch;
  try {
    branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  } catch {
    console.error('[autopush] ไม่ใช่ git repo — ข้าม');
    process.exit(0);
  }

  if (PROTECTED_BRANCHES.includes(branch)) {
    console.error(`[autopush] อยู่บน branch "${branch}" ซึ่งถูกป้องกันไว้ — ไม่ push อัตโนมัติ`);
    console.error('[autopush] สลับไป branch งานก่อน: git switch claude/laughing-johnson-qatda0');
    process.exit(0);
  }

  const status = git(['status', '--porcelain']);
  const hasUnpushedCommits = (() => {
    try {
      const ahead = git(['rev-list', '--count', `origin/${branch}..HEAD`]);
      return Number(ahead) > 0;
    } catch {
      return true; // ยังไม่มี branch นี้บน origin → ต้อง push
    }
  })();

  if (!status && !hasUnpushedCommits) {
    // ไม่มีอะไรเปลี่ยนและไม่มี commit ค้าง → เงียบไว้ ไม่ต้องรบกวน
    process.exit(0);
  }

  if (status) {
    git(['add', '-A']);

    const files = status.split('\n').filter(Boolean);
    const names = files.map(l => l.slice(3)).filter(Boolean);
    const summary = names.length <= 3
      ? names.join(', ')
      : `${names.slice(0, 3).join(', ')} และอีก ${names.length - 3} ไฟล์`;

    const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const commitMessage = message || `chore(autosync): ${summary} [${stamp}]`;

    try {
      git(['commit', '-m', commitMessage]);
      console.error(`[autopush] commit: ${commitMessage}`);
    } catch (e) {
      const out = String(e.stdout || '') + String(e.stderr || '');
      if (/nothing to commit/i.test(out)) {
        console.error('[autopush] ไม่มีอะไรจะ commit');
      } else {
        console.error('[autopush] commit ไม่สำเร็จ:\n' + out);
        process.exit(1);
      }
    }
  }

  // push พร้อม retry แบบถอยหลังทีละเท่า (2s, 4s, 8s, 16s) เผื่อเน็ตสะดุด
  let delay = 2000;
  for (let attempt = 1; attempt <= MAX_PUSH_RETRIES; attempt++) {
    try {
      git(['push', '-u', 'origin', branch], { stdio: ['ignore', 'pipe', 'pipe'] });
      console.error(`[autopush] ✅ push ขึ้น origin/${branch} แล้ว`);
      return;
    } catch (e) {
      const out = String(e.stdout || '') + String(e.stderr || '');

      if (/\[rejected\]|non-fast-forward|fetch first/i.test(out)) {
        // มีคนอื่น (หรือ Claude บนคลาวด์) push มาก่อน → ดึงมารวมแล้วลองใหม่
        console.error('[autopush] มี commit ใหม่บน origin — กำลัง rebase แล้วลองใหม่');
        try {
          git(['pull', '--rebase', 'origin', branch]);
          continue;
        } catch {
          console.error('[autopush] ⚠️ rebase ไม่สำเร็จ (อาจมี conflict) — ต้องแก้ด้วยมือ');
          console.error('[autopush]   git status   แล้วแก้ไฟล์ที่ชนกัน');
          process.exit(1);
        }
      }

      if (attempt === MAX_PUSH_RETRIES) {
        console.error('[autopush] ❌ push ไม่สำเร็จหลังลอง ' + MAX_PUSH_RETRIES + ' ครั้ง:\n' + out);
        process.exit(1);
      }

      console.error(`[autopush] push ไม่สำเร็จ ลองใหม่ในอีก ${delay / 1000} วินาที (ครั้งที่ ${attempt}/${MAX_PUSH_RETRIES})`);
      sleep(delay);
      delay *= 2;
    }
  }
}

main();
