import { describe, expect, it } from 'vitest';
import { gamePath, inviteUrl, parseGamePath } from './route';

describe('ลิงก์เกม /werewolf/<รหัสห้อง>', () => {
  it('อ่านจาก path ได้ทั้งแบบไทยตรงๆ และแบบตัวพิมพ์เล็ก', () => {
    expect(parseGamePath('/werewolf')).toEqual({ active: true, code: null });
    expect(parseGamePath('/werewolf/')).toEqual({ active: true, code: null });
    expect(parseGamePath('/werewolf/h55gk')).toEqual({ active: true, code: 'H55GK' });
    expect(parseGamePath(encodeURI('/werewolf/ABCDE'))).toEqual({ active: true, code: 'ABCDE' });
  });
  it('path อื่นไม่ใช่เกม · รหัสแปลกๆ/สั้นไป/ยาวไป/มีอักขระพิเศษ ไม่ถูกรับเป็นรหัส', () => {
    for (const p of ['/', '/api/ww/tick', '/werewolfส์', '/werewolf/ab', '/werewolf/ABCDEFGHIJ', '/werewolf/AB$CD', '/werewolf/ABCDE/extra', '/x/werewolf/ABCDE']) {
      expect(parseGamePath(p).active, p).toBe(false);
    }
    expect(parseGamePath('/%E0%B9').active).toBe(false); // ถอดรหัสไม่ได้ ต้องไม่พัง
  });
  it('สร้างลิงก์ถูกต้อง และอ่านกลับได้', () => {
    expect(gamePath('ABCDE')).toBe('/werewolf/ABCDE');
    expect(gamePath(null)).toBe('/werewolf');
    const url = inviteUrl('https://winter-prep-hub.onrender.com', 'ABCDE');
    expect(url).toBe('https://winter-prep-hub.onrender.com/werewolf/ABCDE');
    expect(parseGamePath(new URL(url).pathname)).toEqual({ active: true, code: 'ABCDE' });
  });
});
