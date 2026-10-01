// บังคับกฎเหล็กข้อ 7: engine/ ต้องเป็น TypeScript ล้วน — ห้าม import react / supabase / motion
// และห้ามใช้ตัวสุ่ม/เวลาของระบบ (Math.random, Date.now) เพราะทำให้เทสต์ซ้ำไม่ได้
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ENGINE_DIR = join(__dirname, '..');

function listSource(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === '__tests__') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listSource(full));
    else if (name.endsWith('.ts')) out.push(full);
  }
  return out;
}

const files = listSource(ENGINE_DIR);

describe('engine/ เป็น TypeScript ล้วน', () => {
  it('พบไฟล์ของเอนจินให้ตรวจ', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  for (const f of files) {
    const rel = f.slice(ENGINE_DIR.length + 1);
    const src = readFileSync(f, 'utf8');
    it(`${rel}: ไม่ import react / supabase / motion / node / dom`, () => {
      const imports = Array.from(src.matchAll(/from\s+['"]([^'"]+)['"]/g)).map((m) => m[1]);
      for (const spec of imports) {
        expect(spec, `${rel} import "${spec}"`).not.toMatch(/^(react|react-dom|motion|@supabase\/|lucide-react|node:)/);
        // อนุญาตเฉพาะ import ภายในโฟลเดอร์ engine หรือไฟล์ข้อความ ../text/th
        expect(spec.startsWith('.'), `${rel} import "${spec}" ไม่ใช่ไฟล์ภายใน`).toBe(true);
      }
    });
    it(`${rel}: ไม่ใช้ Math.random / Date.now / new Date`, () => {
      const code = src.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      expect(code).not.toMatch(/Math\.random\s*\(/);
      expect(code).not.toMatch(/Date\.now\s*\(/);
      expect(code).not.toMatch(/new\s+Date\s*\(/);
    });
  }
});
