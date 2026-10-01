// components/avatar/TimeContext.tsx — บอกอวตารว่าตอนนี้เป็นกลางวันหรือกลางคืน (ฉากหลังสลับตามเฟสเกม)
import { createContext, useContext } from 'react';

/** เฟสที่ถือเป็น "กลางคืน" (ตรงกับ PhaseBackdrop) */
export const NIGHT_PHASES = ['lobby', 'role_reveal', 'night', 'game_over'];
export const isNightPhase = (phase: string | null | undefined): boolean => !!phase && NIGHT_PHASES.includes(phase);

export const NightContext = createContext<boolean>(false);
export const useNight = () => useContext(NightContext);

/** true = ผู้ใช้ตั้งให้ลดการเคลื่อนไหว → วาดนิ่ง */
export function prefersReducedMotion(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
