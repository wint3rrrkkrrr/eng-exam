import { describe, expect, it } from 'vitest';
import { gamePath, inviteUrl, parseGamePath } from './route';

describe('ลิงก์เกม /เกม/<รหัสห้อง>', () => {
  it('อ่านจาก path ได้ทั้งแบบไทยตรงๆ และแบบเข้ารหัส %E0…', () => {
    expect(parseGamePath('/เกม')).toEqual({ active: true, code: null });
    expect(parseGamePath('/เกม/')).toEqual({ active: true, code: null });
    expect(parseGamePath('/เกม/h55gk')).toEqual({ active: true, code: 'H55GK' });
    expect(parseGamePath(encodeURI('/เกม/ABCDE'))).toEqual({ active: true, code: 'ABCDE' });
    expect(parseGamePath('/%E0%B9%80%E0%B8%81%E0%B8%A1/XYZ12')).toEqual({ active: true, code: 'XYZ12' });
  });
  it('path อื่นไม่ใช่เกม · รหัสแปลกๆ/สั้นไป/ยาวไป/มีอักขระพิเศษ ไม่ถูกรับเป็นรหัส', () => {
    for (const p of ['/', '/api/ww/tick', '/เกมส์', '/เกม/ab', '/เกม/ABCDEFGHIJ', '/เกม/AB$CD', '/เกม/ABCDE/extra', '/x/เกม/ABCDE']) {
      expect(parseGamePath(p).active, p).toBe(false);
    }
    expect(parseGamePath('/%E0%B9').active).toBe(false); // ถอดรหัสไม่ได้ ต้องไม่พัง
  });
  it('สร้างลิงก์ถูกต้อง และอ่านกลับได้', () => {
    expect(gamePath('ABCDE')).toBe('/เกม/ABCDE');
    expect(gamePath(null)).toBe('/เกม');
    const url = inviteUrl('https://winter-prep-hub.onrender.com', 'ABCDE');
    expect(url).toBe('https://winter-prep-hub.onrender.com/%E0%B9%80%E0%B8%81%E0%B8%A1/ABCDE');
    expect(parseGamePath(new URL(url).pathname)).toEqual({ active: true, code: 'ABCDE' });
  });
});
