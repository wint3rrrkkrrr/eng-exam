import React from 'react';

import { NIGHT_PHASES } from './avatar/TimeContext';

/** พื้นหลังทั้งหน้า: กลางคืน = ธีมกลางคืน (น้ำเงิน-ม่วงเข้ม + ดาว) · กลางวัน/เช้า = ธีมท้องฟ้ายามเช้า — เปลี่ยนด้วยการเฟดนุ่มๆ */
export const PhaseBackdrop: React.FC<{ phase: string }> = ({ phase }) => {
  const night = NIGHT_PHASES.includes(phase);
  return (
    <div className="fixed inset-0 -z-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className={`absolute inset-0 bg-gradient-to-b from-[#070b1e] via-[#0e1536] to-[#1d0d2e] transition-opacity duration-1000 ${night ? 'opacity-100' : 'opacity-0'}`}>
        {[[8, 6], [22, 14], [40, 4], [62, 10], [80, 5], [92, 16], [14, 26], [70, 24], [50, 20]].map(([x, y], i) => (
          <span key={i} className="absolute rounded-full bg-white" style={{ left: `${x}%`, top: `${y}%`, width: i % 3 ? 2 : 3, height: i % 3 ? 2 : 3, opacity: 0.7 }} />
        ))}
        <span className="absolute left-[46%] top-[76px] w-8 h-8 rounded-full bg-[#f4eecb] shadow-[0_0_36px_8px_rgba(244,238,203,.25)]" />
      </div>
      <div className={`absolute inset-0 bg-gradient-to-b from-[#2d5896] via-[#4f7fbd] to-[#8db4dc] transition-opacity duration-1000 ${night ? 'opacity-0' : 'opacity-100'}`}>
        <span className="absolute left-[46%] top-[74px] w-10 h-10 rounded-full bg-[#ffe38a] shadow-[0_0_44px_12px_rgba(255,227,138,.45)]" />
        <span className="absolute left-4 top-16 w-24 h-7 rounded-full bg-white/40 blur-[2px]" />
        <span className="absolute left-24 top-24 w-16 h-5 rounded-full bg-white/30 blur-[2px]" />
      </div>
    </div>
  );
};
