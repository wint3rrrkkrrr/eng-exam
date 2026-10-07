import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  className?: string;
  children: React.ReactNode;
  role?: string;
  'aria-label'?: string;
  /** สีพื้นของขอบที่ใช้ไล่เฉดใต้ปุ่มลูกศร ให้กลืนกับพื้นหลังของแถบ */
  fade?: string;
}

/**
 * แถวที่เลื่อนซ้าย-ขวาได้ — มีปุ่มลูกศรสำหรับคอม (เมาส์ไม่มีนิ้วปัด) โผล่เฉพาะตอนมีของล้นไปด้านนั้น
 * และเลื่อนด้วยล้อเมาส์ได้ด้วย (มือถือยังปัดนิ้วได้เหมือนเดิม)
 */
export const ScrollRow: React.FC<Props> = ({ className = '', children, role, 'aria-label': ariaLabel, fade = '#0b1020' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [can, setCan] = useState({ left: false, right: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCan({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c as Element));
    return () => ro.disconnect();
  }, [update, children]);

  const scrollBy = (dir: -1 | 1) => ref.current?.scrollBy({ left: dir * Math.max(160, (ref.current?.clientWidth ?? 300) * 0.6), behavior: 'smooth' });

  const onWheel = (e: React.WheelEvent) => {
    const el = ref.current;
    if (!el || el.scrollWidth <= el.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    el.scrollLeft += e.deltaY; // ล้อเมาส์แนวตั้ง → เลื่อนแนวนอน
  };

  const arrow = (dir: -1 | 1) => (
    <button
      type="button"
      tabIndex={-1}
      aria-label={dir < 0 ? 'เลื่อนไปทางซ้าย' : 'เลื่อนไปทางขวา'}
      onClick={() => scrollBy(dir)}
      style={{ background: `linear-gradient(to ${dir < 0 ? 'right' : 'left'}, ${fade} 55%, transparent)` }}
      className={`absolute top-0 bottom-0 ${dir < 0 ? 'left-0 pr-3 pl-1' : 'right-0 pl-3 pr-1'} z-10 hidden md:flex items-center cursor-pointer`}
    >
      <span className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center shadow-lg">
        {dir < 0 ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </span>
    </button>
  );

  return (
    <div className="relative">
      <div ref={ref} onScroll={update} onWheel={onWheel} role={role} aria-label={ariaLabel} className={`ww-noscroll overflow-x-auto ${className}`}>
        {children}
      </div>
      {can.left && arrow(-1)}
      {can.right && arrow(1)}
    </div>
  );
};
