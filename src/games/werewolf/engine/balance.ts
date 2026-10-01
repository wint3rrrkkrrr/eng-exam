// engine/balance.ts — ตัวช่วยสมดุลบท (RULES ข้อ 12) · เตือนเฉยๆ ไม่ห้ามเริ่ม
import type { RoleId } from './types';
import { ROLES } from './roles';

export interface BalanceReport {
  total: number;
  wolfTeamCount: number;
  recommendedWolves: number;
  warningsTh: string[];
}

export function analyzeBalance(roleIds: RoleId[], playerCount = roleIds.length): BalanceReport {
  const total = roleIds.reduce((sum, id) => sum + (ROLES[id]?.balanceScore ?? 0), 0);
  const wolfTeamCount = roleIds.filter((id) => ROLES[id]?.startTeam === 'wolf').length;
  const recommendedWolves = Math.max(1, Math.round(playerCount / 4));
  const warningsTh: string[] = [];

  if (total < -2) warningsTh.push('⚠️ หมาป่าเปรียบได้มาก ลองเพิ่มผู้หยั่งรู้หรือหมอ');
  if (total > 4) warningsTh.push('⚠️ ชาวบ้านเปรียบได้มาก ลองเพิ่มหมาป่าหรือลดบทพิเศษ');
  if (wolfTeamCount * 2 >= playerCount) warningsTh.push('⚠️ ฝ่ายหมาป่าต้องน้อยกว่าครึ่งหนึ่งของผู้เล่น');
  else if (wolfTeamCount > recommendedWolves + 1) warningsTh.push('⚠️ ฝ่ายหมาป่าค่อนข้างเยอะเมื่อเทียบกับจำนวนผู้เล่น');
  return { total, wolfTeamCount, recommendedWolves, warningsTh };
}
