// ชุดบทพรีเซ็ต: ทุกจำนวนผู้เล่น × ทุกชุดสลับ ต้องตั้งห้องได้จริง และรวมกันแล้วทุกบทมีโอกาสถูกใช้
import { describe, expect, it } from 'vitest';
import { presetRoles } from '../presets';
import { ROLES, ROLE_LIST } from '../roles';
import { validateSetup } from '../settings';

describe('presetRoles', () => {
  it('ทุกขนาด (5–30) × ชุดสลับ 0–7: จำนวนตรงผู้เล่น · บทมีจริง · ผ่านการตรวจชุดบท · ช่างก่อสร้างมาเป็นคู่', () => {
    for (let n = 5; n <= 30; n++) {
      for (let v = 0; v <= 7; v++) {
        const roles = presetRoles(n, v);
        expect(roles, `n=${n} v=${v}`).toHaveLength(n);
        for (const r of roles) expect(ROLES[r], `ไม่รู้จักบท ${r}`).toBeDefined();
        expect(validateSetup(roles, n).filter((i) => i.level === 'error'), `n=${n} v=${v}`).toEqual([]);
        const masons = roles.filter((r) => r === 'mason').length;
        expect(masons === 0 || masons >= 2, `n=${n} v=${v} ช่างก่อสร้างโดดเดี่ยว`).toBe(true);
      }
    }
  });

  it('ชุด 0 คงเดิมทุกครั้ง (กำหนดตายตัว) · ชุดสลับคงที่ตามค่า ไม่สุ่มเอง', () => {
    for (const n of [8, 15, 24, 30]) {
      expect(presetRoles(n)).toEqual(presetRoles(n, 0));
      expect(presetRoles(n, 3)).toEqual(presetRoles(n, 3));
    }
  });

  it('เกมใหญ่ (30 คน) กดสลับหลายครั้งแล้ว ทุกบทในเกม (ยกเว้นสมาชิกลัทธิที่ได้จากการชักชวน) ได้ขึ้นอย่างน้อยหนึ่งชุด', () => {
    const seen = new Set<string>();
    for (const n of [26, 28, 30]) for (let v = 0; v <= 60; v++) presetRoles(n, v).forEach((r) => seen.add(r));
    const missing = ROLE_LIST.map((r) => r.id).filter((id) => !seen.has(id) && id !== 'cult_member' && id !== 'villager'); // สมาชิกลัทธิได้จากการชักชวน · ชาวบ้านเป็นตัวเติมที่นั่ง
    expect(missing).toEqual([]);
  });

  it('ชุดสลับยังคงเปิดด้วยบทหลักตามลำดับความสำคัญ (หมอดู/หมอ ยังอยู่ทุกชุด)', () => {
    for (let v = 0; v <= 10; v++) {
      const r = presetRoles(24, v);
      expect(r).toContain('seer');
      expect(r).toContain('doctor');
    }
  });
});
