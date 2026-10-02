import { describe, expect, it } from 'vitest';
import { parseAppRoute, routePath, samePath } from './appRoute';

describe('ลิงก์ทั้งเว็บ', () => {
  it('อ่านเส้นทางของทุกส่วน (รวมแบบเข้ารหัส %E0…)', () => {
    expect(parseAppRoute('/')).toEqual({ kind: 'home' });
    expect(parseAppRoute('/werewolf/ABCDE')).toEqual({ kind: 'werewolf', code: 'ABCDE' });
    expect(parseAppRoute('/werewolf')).toEqual({ kind: 'werewolf', code: null });
    expect(parseAppRoute('/cheese')).toEqual({ kind: 'cheese', code: null });
    expect(parseAppRoute(encodeURI('/cheese/'))).toEqual({ kind: 'cheese', code: null });
    expect(parseAppRoute('/exam')).toEqual({ kind: 'exam', subject: null });
    expect(parseAppRoute('/exam/physics')).toEqual({ kind: 'exam', subject: 'physics' });
    expect(parseAppRoute(encodeURI('/exam/c-programming'))).toEqual({ kind: 'exam', subject: 'c-programming' });
  });
  it('path ที่ไม่รู้จัก/อันตราย = หน้าแรก (ไม่พัง)', () => {
    for (const p of ['/abc', '/api/ww/tick', '/exam/a/b', '/exam/<script>', '/%E0%B9', '/cheese/AB!']) {
      expect(parseAppRoute(p), p).toEqual({ kind: 'home' });
    }
  });
  it('สร้าง path แล้วอ่านกลับได้ตรงกัน', () => {
    for (const r of [{ kind: 'home' }, { kind: 'werewolf', code: 'H55GK' }, { kind: 'werewolf', code: null }, { kind: 'cheese', code: 'K7M2P' }, { kind: 'cheese', code: null }, { kind: 'exam', subject: 'math' }, { kind: 'exam', subject: null }] as const) {
      expect(parseAppRoute(routePath(r))).toEqual(r);
    }
  });
  it('samePath ไม่สนรหัสเข้ารหัส/สแลชท้าย', () => {
    expect(samePath(encodeURI('/werewolf/ABCDE'), '/werewolf/ABCDE/')).toBe(true);
    expect(samePath('/werewolf/ABCDE', '/werewolf/ABCDF')).toBe(false);
  });
});
