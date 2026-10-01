// engine/roles/batch4.ts — M6 แพ็กที่ 4: บทที่ใช้ "ผลข้ามคืน" และบทหลอกตา
// ศิษย์ผู้หยั่งรู้ · มนุษย์หมาป่าลวงตา · ชาวบ้านต้องคำสาป · คนถึก · ผู้พิทักษ์ประชาชน · สมุนหมาป่า
import type { RoleDef } from '../types';

export const apprenticeSeer: RoleDef = {
  id: 'apprentice_seer', nameTh: 'ศิษย์ผู้หยั่งรู้', kind: 'normal',
  descriptionTh: 'ตอนนี้คุณยังตรวจใครไม่ได้ แต่เมื่อผู้หยั่งรู้ตาย คุณจะกลายเป็นผู้หยั่งรู้คนใหม่ทันที และใช้ความสามารถได้ตั้งแต่คืนถัดไป',
  startTeam: 'village', winWith: 'village',
  goalTh: 'อยู่เงียบๆ ให้รอด แล้วรับช่วงต่อเมื่อผู้หยั่งรู้ถูกกำจัด',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้านเมื่อหมาป่าและฝ่ายศัตรูถูกกำจัดหมด',
  balanceScore: 2, nightSlot: null, wakes: 'passive', abilities: [], priority: 0,
  onBlocked: 'n/a', onTargetDeath: 'n/a', onActorDeath: 'ไม่มี',
  interactions: [
    'เลื่อนขั้นเมื่อผู้หยั่งรู้ตายด้วยสาเหตุใดก็ได้ (ถูกกัด พิษ โหวต ฯลฯ)',
    'ถ้ามีศิษย์หลายคน คนที่นั่งก่อนจะได้เลื่อนขั้น',
    'ก่อนเลื่อนขั้น ผู้หยั่งรู้ลึกลับเห็นว่าเป็น "ไม่มีความสามารถ"',
  ],
};

export const lycan: RoleDef = {
  id: 'lycan', nameTh: 'มนุษย์หมาป่าลวงตา', kind: 'normal',
  descriptionTh: 'คุณเป็นชาวบ้านแท้ๆ แต่ผู้หยั่งรู้และนักสืบสวนจะเห็นคุณเป็น "หมาป่า" — เตรียมคำอธิบายไว้ให้ดี',
  startTeam: 'village', winWith: 'village',
  goalTh: 'เอาตัวรอดจากการถูกเข้าใจผิดว่าเป็นหมาป่า และช่วยหมู่บ้านชนะ',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้านเมื่อหมาป่าและฝ่ายศัตรูถูกกำจัดหมด',
  balanceScore: -2, nightSlot: null, wakes: 'passive', abilities: [], priority: 0,
  onBlocked: 'n/a', onTargetDeath: 'n/a', onActorDeath: 'ไม่มี',
  interactions: [
    'ผู้หยั่งรู้เห็นเป็น "หมาป่า" · นักสืบสวนนับว่ากลุ่มนี้ "มีหมาป่า"',
    'ผู้หยั่งรู้รัศมีเห็นเป็น "ดี" และนักสืบเห็นว่าอยู่ฝ่ายหมู่บ้าน (รัศมี/ฝ่ายไม่ถูกหลอก)',
    'หมาป่ากัดได้ตามปกติ (ไม่ใช่พวกเดียวกัน)',
  ],
  seenAsWolf: true,
};

export const cursedVillager: RoleDef = {
  id: 'cursed_villager', nameTh: 'ชาวบ้านต้องคำสาป', kind: 'normal',
  descriptionTh: 'ถ้าฝูงหมาป่าเลือกกัดคุณ คุณจะไม่ตาย แต่คำสาปจะทำงาน — คุณกลายเป็นหมาป่าตอนจบคืนถัดไป (ย้อนกลับไม่ได้)',
  startTeam: 'village', winWith: 'village',
  goalTh: 'เริ่มต้นช่วยหมู่บ้าน แต่ถ้าถูกกัดก็ต้องเปลี่ยนไปเล่นให้ฝ่ายหมาป่าชนะ',
  winTh: 'ยังไม่ถูกกัด = ชนะพร้อมฝ่ายหมู่บ้าน · ถูกกัดแล้ว = ชนะพร้อมฝ่ายหมาป่า',
  balanceScore: -1, nightSlot: null, wakes: 'passive', abilities: [], priority: 0,
  onBlocked: 'n/a', onTargetDeath: 'n/a', onActorDeath: 'ไม่มี',
  interactions: [
    'ถ้าหมอ/นักบวช/ผู้คุ้มกันกันไว้ หรือแม่มดชุบ → คำสาปไม่ทำงาน และยังเป็นชาวบ้านต่อ',
    'คำสาปทำงานจากการกัดของฝูงเท่านั้น (พิษแม่มด/ยิง = ตายปกติ)',
    'หลังแปลงแล้วเข้าฝูงในคืนถัดไป และผู้หยั่งรู้จะเห็นเป็นหมาป่า',
  ],
};

export const toughGuy: RoleDef = {
  id: 'tough_guy', nameTh: 'คนถึก', kind: 'normal',
  descriptionTh: 'ถ้าฝูงหมาป่ากัดคุณ คุณจะไม่ตายทันที — คุณทนไปได้อีกหนึ่งวันเต็ม แล้วตายตอนจบคืนถัดไป',
  startTeam: 'village', winWith: 'village',
  goalTh: 'ใช้เวลาที่เหลือหลังถูกกัด บอกหมู่บ้านให้ได้มากที่สุด',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้านเมื่อหมาป่าและฝ่ายศัตรูถูกกำจัดหมด',
  balanceScore: 2, nightSlot: null, wakes: 'passive', abilities: [], priority: 0,
  onBlocked: 'n/a', onTargetDeath: 'n/a', onActorDeath: 'ไม่มี',
  interactions: [
    'ถ้าถูกกัน/ชุบในคืนที่ถูกกัด = ไม่โดนอะไรเลย',
    'ระหว่างวันที่ทนอยู่ ยังพูดและโหวตได้ตามปกติ (คนอื่นไม่รู้ว่าคุณถูกกัดแล้ว)',
    'ในเวอร์ชันนี้ การตายที่ค้างไว้ห้ามไม่ได้ — แม่มดชุบคืนถัดไปไม่ได้ (🔸A25)',
  ],
};

export const vigilante: RoleDef = {
  id: 'vigilante', nameTh: 'ผู้พิทักษ์ประชาชน', kind: 'normal',
  descriptionTh: 'คุณมีกระสุน 1 นัดตลอดเกม ใช้ยิงใครก็ได้ 1 คนในตอนกลางคืน — แต่ถ้ายิงโดนคนของหมู่บ้าน คุณจะทนความรู้สึกผิดไม่ไหวและตายตอนจบคืนถัดไป',
  startTeam: 'village', winWith: 'village',
  goalTh: 'ยิงหมาป่าให้ถูกตัว ด้วยกระสุนเพียงนัดเดียว',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้านเมื่อหมาป่าและฝ่ายศัตรูถูกกำจัดหมด',
  balanceScore: 3, nightSlot: 39, wakes: 'every-night',
  abilities: [{ kind: 'vigilante_shot', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 1 }],
  priority: 39,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ความสามารถกลางคืนหยุด (กระสุนที่เหลือหายไป)',
  interactions: [
    'หมอ นักบวช และผู้คุ้มกันกันกระสุนได้ (ตาราง 11.2)',
    'ถ้าถูกขัดขวาง = ไม่ได้ยิง และกระสุนไม่หาย',
    'ยิงฝ่ายอิสระหรือฝ่ายหมาป่า = ไม่รู้สึกผิด ไม่ตายตาม',
    'ยิงคนของหมู่บ้าน = ตายตอนจบคืนถัดไป (ห้ามไม่ได้)',
  ],
  initRoleState: () => ({ shots: 1 }),
};

export const minion: RoleDef = {
  id: 'minion', nameTh: 'สมุนหมาป่า', kind: 'normal',
  descriptionTh: 'คุณรู้ว่าใครเป็นหมาป่า และหมาป่าก็รู้จักคุณ แต่คุณฆ่าใครไม่ได้ และผู้หยั่งรู้จะเห็นคุณเป็นชาวบ้าน',
  startTeam: 'wolf', winWith: 'wolf',
  goalTh: 'ปกป้องหมาป่าด้วยการพูด ชี้นำการโหวตให้หมู่บ้านฆ่ากันเอง',
  winTh: 'ชนะพร้อมฝ่ายหมาป่าเมื่อจำนวนฝ่ายหมาป่าที่รอด ≥ ผู้เล่นอื่นที่รอด (สมุนนับเป็นฝ่ายหมาป่าด้วย)',
  balanceScore: -3, nightSlot: 6, wakes: 'first-night', autoAck: true, abilities: [], priority: 6,
  onBlocked: 'n/a', onTargetDeath: 'n/a', onActorDeath: 'ไม่มี',
  interactions: [
    'คืนแรกตื่นมาเห็นหน้าหมาป่า และหมาป่าเห็นสมุนด้วย (Q16) · ใช้แชทหมาป่าได้',
    'ผู้หยั่งรู้เห็นเป็น "ไม่ใช่หมาป่า" แต่ผู้หยั่งรู้รัศมีเห็นเป็น "ร้าย" และนักสืบเห็นว่าอยู่ฝ่ายเดียวกับหมาป่า',
    'ฝูงกัดสมุนไม่ได้ (นับเป็นพวกเดียวกัน)',
    'ไม่ร่วมเลือกเหยื่อ',
  ],
  seenAsWolf: false,
};

export const BATCH4_ROLES: RoleDef[] = [apprenticeSeer, lycan, cursedVillager, toughGuy, vigilante, minion];
