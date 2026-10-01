// components/avatar/anim.tsx — ตัวช่วยทำภาพเคลื่อนไหวด้วย SMIL (ใน SVG ล้วน ไม่ต้องใช้ CSS/ไลบรารี)
// on=false (ผู้ใช้ตั้งลดการเคลื่อนไหว) → วาดนิ่งที่ท่าเริ่มต้น
// หมายเหตุ: animateTransform จะ "แทนที่" ค่า transform ของ <g> ตัวเอง → ใส่ตำแหน่งไว้ที่ <g> ชั้นนอกเสมอ
import React from 'react';

type Kids = { children?: React.ReactNode };

/** เลื่อน/หมุน/ย่อขยาย วนซ้ำ (begin ติดลบ = เริ่มกลางรอบ จึงกระจายจังหวะได้) */
export const Move: React.FC<Kids & {
  on: boolean; type?: 'translate' | 'rotate' | 'scale'; from?: string; to?: string; values?: string;
  dur: number; begin?: number; fade?: boolean; ease?: boolean;
}> = ({ on, type = 'translate', from, to, values, dur, begin = 0, fade, ease, children }) => (
  <g>
    {on && (
      <animateTransform
        attributeName="transform" type={type} dur={`${dur}s`} begin={`${-begin}s`} repeatCount="indefinite"
        {...(values ? { values } : { from, to })}
        {...(ease ? { calcMode: 'spline', keyTimes: '0;1', keySplines: '.4 0 .6 1' } : {})}
      />
    )}
    {on && fade && <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.75;1" dur={`${dur}s`} begin={`${-begin}s`} repeatCount="indefinite" />}
    {children}
  </g>
);

/** กะพริบ/จางเข้าออก */
export const Blink: React.FC<Kids & { on: boolean; values?: string; dur: number; begin?: number }> = ({ on, values = '0.15;1;0.15', dur, begin = 0, children }) => (
  <g>
    {on && <animate attributeName="opacity" values={values} dur={`${dur}s`} begin={`${-begin}s`} repeatCount="indefinite" />}
    {children}
  </g>
);

/** ย่อ-ขยายรอบจุด (0,0) ของกลุ่มที่ครอบอยู่ */
export const Pulse: React.FC<Kids & { on: boolean; min?: number; max?: number; dur: number; begin?: number; twinkle?: boolean }> = ({ on, min = 0.4, max = 1, dur, begin = 0, twinkle, children }) => (
  <g>
    {on && <animateTransform attributeName="transform" type="scale" values={`${min};${max};${min}`} dur={`${dur}s`} begin={`${-begin}s`} repeatCount="indefinite" />}
    {on && twinkle && <animate attributeName="opacity" values="0.2;1;0.2" dur={`${dur}s`} begin={`${-begin}s`} repeatCount="indefinite" />}
    {children}
  </g>
);

/** ดาวสี่แฉก (ศูนย์กลาง 0,0 รัศมี r) */
export const starPath = (r = 7) => `M0 ${-r} L${r * 0.26} ${-r * 0.26} L${r} 0 L${r * 0.26} ${r * 0.26} L0 ${r} L${-r * 0.26} ${r * 0.26} L${-r} 0 L${-r * 0.26} ${-r * 0.26} Z`;
/** หัวใจ (ศูนย์กลาง 0,0 กว้างประมาณ 2r) */
export const heartPath = (r = 6) => `M0 ${r} C${-r * 2} ${-r * 0.2} ${-r * 1.1} ${-r * 1.4} 0 ${-r * 0.5} C${r * 1.1} ${-r * 1.4} ${r * 2} ${-r * 0.2} 0 ${r} Z`;
