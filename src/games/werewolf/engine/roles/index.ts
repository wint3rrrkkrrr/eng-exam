// engine/roles/index.ts — ทะเบียนบททั้งหมด
// เพิ่มบทใหม่ = เพิ่มไฟล์ 1 ไฟล์ + ลงทะเบียน 1 บรรทัดที่นี่ (M6)
import type { RoleDef, RoleId } from '../types';
import { CORE_ROLES } from './core';
import { BATCH1_ROLES } from './batch1';
import { BATCH2_ROLES } from './batch2';
import { BATCH3_ROLES } from './batch3';
import { BATCH4_ROLES } from './batch4';
import { BATCH5_ROLES } from './batch5';
import { BATCH6_ROLES } from './batch6';
import { BATCH7_ROLES } from './batch7';
import { BATCH8_ROLES } from './batch8';
import { BATCH9_ROLES } from './batch9';
import { BATCH11_ROLES } from './batch11';

export const ROLE_LIST: RoleDef[] = [...CORE_ROLES, ...BATCH1_ROLES, ...BATCH2_ROLES, ...BATCH3_ROLES, ...BATCH4_ROLES, ...BATCH5_ROLES, ...BATCH6_ROLES, ...BATCH7_ROLES, ...BATCH8_ROLES, ...BATCH9_ROLES, ...BATCH11_ROLES];

export const ROLES: Record<RoleId, RoleDef> = Object.fromEntries(ROLE_LIST.map((r) => [r.id, r]));

export function getRole(id: RoleId): RoleDef {
  const r = ROLES[id];
  if (!r) throw new Error(`ไม่รู้จักบท: ${id}`);
  return r;
}
