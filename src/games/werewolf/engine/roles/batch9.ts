// engine/roles/batch9.ts — M6 แพ็กที่ 9: ฝ่ายอิสระที่เหลือ (ฆาตกรเดี่ยว · นักวางเพลิง · นักล่าหมาป่าเดี่ยว · ชูปาคาบรา)
// นักเลียนแบบ (copycat) และผู้ควบคุมเวลา ยังไม่ทำในแพ็กนี้ — ดูเหตุผลใน PLAN.md
import type { RoleDef } from '../types';

export const serialKiller: RoleDef = {
  id: 'serial_killer', nameTh: 'ฆาตกรเดี่ยว', kind: 'neutral',
  descriptionTh: 'ทุกคืนเลือกฆ่า 1 คน — หมอกันคุณไม่ได้ แต่ผู้คุ้มกันและนักบวชยังกันได้',
  startTeam: 'solo', winWith: 'self',
  goalTh: 'ฆ่าทุกคนจนเหลือคุณเพียงคนเดียว',
  winTh: 'ชนะเมื่อเป็นผู้เล่นคนสุดท้ายที่รอด (เหลือ 2 คน = ยังไม่ชนะ)',
  balanceScore: -4, nightSlot: 35, wakes: 'every-night',
  abilities: [{ kind: 'solo_kill', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' }],
  priority: 35,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ไม่มี',
  interactions: [
    'หมอกันไม่ได้ (ไม่มีตัวเลือกปิด — เป็นจุดเด่นของบทนี้) · ผู้คุ้มกันและนักบวชยังกันได้ตามปกติ · แม่มดชุบไม่ได้ (ไม่ใช่เหยื่อฝูงหมาป่า)',
    'ถูกหมาป่ากัด/โหวต/ยิง ตายได้ตามปกติ — ไม่มีภูมิคุ้มกันพิเศษ',
    'ผู้หยั่งรู้เห็นเป็น "ไม่ใช่หมาป่า"',
  ],
};

export const arsonist: RoleDef = {
  id: 'arsonist', nameTh: 'นักวางเพลิง', kind: 'neutral',
  descriptionTh: 'ทุกคืนเลือก "ชโลมน้ำมัน" ผู้เล่น 1 คน หรือ "จุดไฟ" เผาทุกคนที่ชโลมไว้พร้อมกัน — ไฟทะลุทุกการป้องกัน',
  startTeam: 'solo', winWith: 'self',
  goalTh: 'สะสมเครื่องหมายน้ำมันให้มากที่สุดแล้วจุดไฟเผาทีเดียวจนเหลือคุณคนเดียว',
  winTh: 'ชนะเมื่อเป็นผู้เล่นคนสุดท้ายที่รอด (เหลือ 2 คน = ยังไม่ชนะ)',
  balanceScore: -4, nightSlot: 36, wakes: 'every-night',
  abilities: [
    { kind: 'oil_mark', targets: 1, canTargetSelf: true, canTargetDead: false, uses: 'unlimited' },
    { kind: 'ignite', targets: 0, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' },
  ],
  priority: 36,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'n/a',
  onActorDeath: 'เครื่องหมายน้ำมันที่ชโลมไว้หายไป (จุดไม่ได้อีก)',
  interactions: [
    'เลือกได้คืนละอย่างเดียว: ชโลมน้ำมันเพิ่ม 1 คน หรือจุดไฟเผาทุกคนที่มีเครื่องหมายพร้อมกัน',
    'ไฟทะลุหมอ ผู้คุ้มกัน นักบวช และแม่มดชุบไม่ได้ (🔸A30 ข้อสมมติ: ไฟทะลุทุกการป้องกันแบบไม่มีข้อยกเว้น เพื่อความชัดเจนของเอนจิน)',
    'ชโลมน้ำมันตัวเองได้ (ใช้เป็นเหยื่อล่อ หรือจุดตัวเองตายไปพร้อมเป้าหมาย)',
  ],
  initRoleState: () => ({ marked: [] }),
};

export const loneWolfHunter: RoleDef = {
  id: 'lone_wolf_hunter', nameTh: 'นักล่าหมาป่าเดี่ยว', kind: 'neutral',
  descriptionTh: 'ทุกคืนเลือกฆ่า 1 คน — ตราบใดที่ยังมีหมาป่าเหลืออยู่ คุณฆ่าได้เฉพาะหมาป่าเท่านั้น หลังหมาป่าหมดแล้วฆ่าใครก็ได้',
  startTeam: 'solo', winWith: 'self',
  goalTh: 'ล่าหมาป่าให้หมดก่อน แล้วค่อยกำจัดที่เหลือจนเป็นคนสุดท้าย',
  winTh: 'ชนะเมื่อเป็นผู้เล่นคนสุดท้ายที่รอด (เหลือ 2 คน = ยังไม่ชนะ)',
  balanceScore: -3, nightSlot: 38, wakes: 'every-night',
  abilities: [{ kind: 'hunt_wolf', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' }],
  priority: 38,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ไม่มี',
  interactions: [
    'ยังมีหมาป่าเหลืออยู่ = เลือกได้เฉพาะหมาป่าเท่านั้น · หมาป่าหมดแล้ว = เลือกใครก็ได้',
    'หมอ/ผู้คุ้มกัน/นักบวชกันได้ตามปกติ · แม่มดชุบไม่ได้',
  ],
};

export const chupacabra: RoleDef = {
  id: 'chupacabra', nameTh: 'ชูปาคาบรา', kind: 'neutral',
  descriptionTh: 'ทุกคืนเลือก 1 คน — ถ้าเขาเป็นหมาป่า เขาจะตาย ถ้าไม่ใช่ จะไม่เกิดอะไรขึ้น (คุณไม่รู้ผลด้วยซ้ำ)',
  startTeam: 'solo', winWith: 'self',
  goalTh: 'ตามหาหมาป่าให้เจอทีละตัวโดยไม่รู้ว่าทายถูกหรือผิด',
  winTh: 'หมาป่าทุกตัวตายหมด และคุณยังมีชีวิตอยู่ตอนนั้น = ชนะร่วม (ประกาศพร้อมผู้ชนะหลัก)',
  balanceScore: -2, nightSlot: 37, wakes: 'every-night',
  abilities: [{ kind: 'hunt_chupacabra', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' }],
  priority: 37,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ไม่มี',
  interactions: [
    'เลือกถูก (เป็นหมาป่า) = หมาป่าตายทันที ไม่มีใครรู้ว่าใครฆ่า · เลือกผิด = เงียบ ไม่มีอะไรเกิดขึ้น ไม่รู้ผลด้วย',
    'หมอ/ผู้คุ้มกัน/นักบวชกันได้ตามปกติ · แม่มดชุบไม่ได้',
    'ชนะแบบ "ชนะแยก" ประกาศคู่กับผู้ชนะหลักเสมอ ไม่ต้องเป็นคนสุดท้าย',
  ],
};

export const BATCH9_ROLES: RoleDef[] = [serialKiller, arsonist, loneWolfHunter, chupacabra];
