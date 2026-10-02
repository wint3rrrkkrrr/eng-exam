import { describe, expect, it } from 'vitest';
import { parseAppRoute, routePath, samePath } from './appRoute';

describe('ลิงก์ทั้งเว็บ', () => {
  it('อ่านเส้นทางของทุกส่วน (รวมแบบเข้ารหัส %E0…)', () => {
    expect(parseAppRoute('/')).toEqual({ kind: 'home' });
    expect(parseAppRoute('/เกม/ABCDE')).toEqual({ kind: 'werewolf', code: 'ABCDE' });
    expect(parseAppRoute('/เกม')).toEqual({ kind: 'werewolf', code: null });
    expect(parseAppRoute('/หนูชีส')).toEqual({ kind: 'cheese' });
    expect(parseAppRoute(encodeURI('/หนูชีส/'))).toEqual({ kind: 'cheese' });
    expect(parseAppRoute('/ข้อสอบ')).toEqual({ kind: 'exam', subject: null });
    expect(parseAppRoute('/ข้อสอบ/physics')).toEqual({ kind: 'exam', subject: 'physics' });
    expect(parseAppRoute(encodeURI('/ข้อสอบ/c-programming'))).toEqual({ kind: 'exam', subject: 'c-programming' });
  });
  it('path ที่ไม่รู้จัก/อันตราย = หน้าแรก (ไม่พัง)', () => {
    for (const p of ['/abc', '/api/ww/tick', '/ข้อสอบ/a/b', '/ข้อสอบ/<script>', '/%E0%B9', '/หนูชีส/ABC']) {
      expect(parseAppRoute(p), p).toEqual({ kind: 'home' });
    }
  });
  it('สร้าง path แล้วอ่านกลับได้ตรงกัน', () => {
    for (const r of [{ kind: 'home' }, { kind: 'werewolf', code: 'H55GK' }, { kind: 'werewolf', code: null }, { kind: 'cheese' }, { kind: 'exam', subject: 'math' }, { kind: 'exam', subject: null }] as const) {
      expect(parseAppRoute(routePath(r))).toEqual(r);
    }
  });
  it('samePath ไม่สนรหัสเข้ารหัส/สแลชท้าย', () => {
    expect(samePath(encodeURI('/เกม/ABCDE'), '/เกม/ABCDE/')).toBe(true);
    expect(samePath('/เกม/ABCDE', '/เกม/ABCDF')).toBe(false);
  });
});
