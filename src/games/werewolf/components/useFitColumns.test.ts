import { describe, expect, it } from 'vitest';
import { pickColumns } from './useFitColumns';

const GAP = 8;
const need = (n: number, c: number, w: number) => {
  const cw = (w - GAP * (c - 1)) / c;
  const rows = Math.ceil(n / c);
  return rows * cw * 1.25 + (rows - 1) * GAP;
};

describe('pickColumns: ทุกคนพอดีจอ', () => {
  const W = 343; // กว้างจอมือถือ 375 − ขอบ
  it('คนน้อยได้การ์ดใหญ่ (คอลัมน์น้อย) · คนเยอะเพิ่มคอลัมน์ · ยิ่งคนเยอะคอลัมน์ไม่ลดลง', () => {
    const H = 380;
    let prev = 0;
    for (let n = 2; n <= 30; n++) {
      const c = pickColumns(n, W, H);
      expect(c, `n=${n}`).toBeGreaterThanOrEqual(prev);
      prev = c;
    }
    expect(pickColumns(4, W, 600)).toBeLessThanOrEqual(2); // ที่สูงพอ 4 คนใช้การ์ดใหญ่ 2 คอลัมน์
    expect(pickColumns(8, W, H)).toBeLessThan(pickColumns(30, W, H));
  });

  it('ถ้ามีวิธีที่พอดีความสูง ต้องเลือกวิธีที่พอดีเสมอ และเป็นการ์ดที่ใหญ่ที่สุด', () => {
    for (const H of [300, 380, 450, 560]) {
      for (let n = 3; n <= 30; n++) {
        const c = pickColumns(n, W, H);
        const cw = (W - GAP * (c - 1)) / c;
        if (cw < 44) continue; // เล็กสุดแล้ว (ตกกรณีไม่พอดี)
        if (need(n, c, W) <= H) {
          // คอลัมน์ที่น้อยกว่า 1 ต้องไม่พอดี (ไม่งั้นเลือกใหญ่กว่าได้)
          if (c > 1) expect(need(n, c - 1, W), `n=${n} H=${H}`).toBeGreaterThan(H);
        }
      }
    }
  });

  it('จอเตี้ยมาก/คนเยอะมาก → ใช้การ์ดเล็กสุดที่ยังอ่านได้ (ไม่เล็กกว่า 44px) ไม่พังเป็น 0', () => {
    const c = pickColumns(30, W, 120);
    expect(c).toBeGreaterThanOrEqual(1);
    expect((W - GAP * (c - 1)) / c).toBeGreaterThanOrEqual(44);
    expect(pickColumns(0, W, 400)).toBe(1);
  });
});

describe('pickColumns: ความกว้างที่วัดไม่ได้', () => {
  it('กว้าง 0/ติดลบ/NaN → ไม่เป็น 1 คอลัมน์ (กันการ์ดใหญ่เต็มจอ) แต่คืน 3 (หรือเท่าจำนวนคนถ้าน้อยกว่า)', () => {
    for (const w of [0, -5, NaN, 20]) {
      expect(pickColumns(8, w, 500)).toBe(3);
      expect(pickColumns(2, w, 500)).toBe(2);
    }
  });
  it('เดสก์ท็อป (กว้าง 544 สูง 666) 8 คน → 4 คอลัมน์ ไม่ใช่ 1', () => {
    expect(pickColumns(8, 544, 666)).toBe(4);
  });
});
