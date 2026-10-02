import { useEffect, useLayoutEffect, useState } from 'react';

/**
 * เลือกจำนวนคอลัมน์ของตารางการ์ดผู้เล่น ให้ "ทุกคนพอดีจอ" ไม่ต้องเลื่อน — การ์ดใหญ่ที่สุดเท่าที่ยัดทุกคนได้
 * คิดจากพื้นที่ว่างจริง: ความสูงจอ − ตำแหน่งบนของตาราง − ของที่ติดขอบล่าง (แถบแท็บ/ปุ่มลงมือ)
 * ถ้าเล็กสุดแล้วก็ยังไม่พอ (คนเยอะมาก/จอเตี้ย) จะใช้การ์ดเล็กที่สุดที่ยังอ่านได้ แล้วให้เลื่อนเล็กน้อยแทน
 * ความกว้างที่ยังวัดไม่ได้ (0/ติดลบ — ตารางยังไม่ถูกวาด) ห้ามนำมาคิด: คืนค่าปลอดภัย 3 คอลัมน์ ไม่ใช่ 1 (ไม่งั้นการ์ดใหญ่เต็มจอ)
 */
export function pickColumns(count: number, width: number, height: number, gap = 8, aspect = 1.25, minCardW = 44): number {
  if (count <= 0) return 1;
  if (!(width >= minCardW * 2)) return Math.min(count, 3);
  let smallest = 1;
  for (let c = 1; c <= count; c++) {
    const w = (width - gap * (c - 1)) / c;
    if (w < minCardW) break;
    smallest = c;
    const rows = Math.ceil(count / c);
    const need = rows * w * aspect + (rows - 1) * gap;
    if (need <= height) return c; // c น้อยสุดที่พอดี = การ์ดใหญ่สุด
  }
  return smallest;
}

/**
 * fixedTop: ถ้าระบุ จะใช้ค่านี้เป็น "ความสูงของส่วนที่อยู่เหนือตาราง" แทนการวัดจริง → จำนวนคอลัมน์ไม่ขยับตามช่วงของเกม
 * (การ์ดสถานะยาวสั้นต่างกันในแต่ละเฟส) ทำให้ตัวละครขนาดเท่ากันตลอดทั้งเกม เปลี่ยนเฉพาะเมื่อจำนวนคน/ขนาดจอเปลี่ยน
 *
 * ใช้ callback ref (state) — ตารางที่ถูกถอดออกแล้วใส่กลับ (เช่น สลับแท็บแชท → กลับมาแท็บเกม) จะคำนวณใหม่ทันที
 */
export function useFitColumns<T extends HTMLElement>(count: number, reserveBottom: number, gap = 8, fixedTop?: number) {
  const [el, setEl] = useState<T | null>(null);
  const [cols, setCols] = useState(3);

  useLayoutEffect(() => {
    if (!el) return;
    const calc = () => {
      const width = el.clientWidth;
      if (!(width > 0)) return; // ยังไม่ถูกวาด — รอรอบถัดไป อย่าเดา
      const top = fixedTop ?? el.getBoundingClientRect().top + window.scrollY;
      const height = Math.max(160, window.innerHeight - top - reserveBottom);
      setCols(pickColumns(count, width, height, gap));
    };
    calc();
    window.addEventListener('resize', calc);
    const ro = new ResizeObserver(calc);
    ro.observe(document.body);
    ro.observe(el);
    return () => { window.removeEventListener('resize', calc); ro.disconnect(); };
  }, [el, count, reserveBottom, gap, fixedTop]);

  // เผื่อฟอนต์/รูปโหลดเสร็จทีหลังแล้วตำแหน่งขยับ
  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 400);
    return () => clearTimeout(t);
  }, [count, el]);

  return { ref: setEl, cols };
}
