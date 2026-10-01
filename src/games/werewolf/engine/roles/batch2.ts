// engine/roles/batch2.ts — M6 แพ็กที่ 2: หมาป่าผู้หยุดความสามารถ (ตื่น 2 ช่อง) + ผู้สลับชะตา (ขั้น 2 ของท่อ)
import type { RoleDef } from '../types';

export const wolfBlocker: RoleDef = {
  id: 'wolf_blocker', nameTh: 'หมาป่าผู้หยุดความสามารถ', kind: 'normal',
  descriptionTh: 'เหมือนมนุษย์หมาป่าทุกประการ (ร่วมเลือกเหยื่อกับฝูง) และมีอีกหนึ่งความสามารถ: ทุกคืนเลือก 1 คนขัดขวางความสามารถของเขาคืนนั้น',
  startTeam: 'wolf', winWith: 'wolf',
  goalTh: 'ช่วยฝูงฆ่าฝ่ายชาวบ้าน และขัดขวางบทสำคัญของหมู่บ้าน (หมอ ผู้หยั่งรู้ แม่มด) ไม่ให้ขัดขวางแผนของฝูง',
  winTh: 'ชนะพร้อมฝ่ายหมาป่าเมื่อจำนวนหมาป่าที่รอด ≥ ผู้เล่นอื่นที่รอด',
  balanceScore: -7, nightSlot: 30, wakes: 'every-night',
  abilities: [
    { kind: 'wolf_bite', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' },
    { kind: 'block', nightSlot: 11, targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' },
  ],
  priority: 11,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'หมาป่าตัวอื่นยังกัดต่อได้ · ไม่มีใครขัดขวางความสามารถแทน',
  interactions: [
    'ตื่นสองช่อง: ช่อง 11 เลือกคนที่จะขัดขวาง (ก่อนทุกบท) · ช่อง 30 ร่วมเลือกเหยื่อกับฝูงตามปกติ',
    'ขัดขวางได้ทุกบท รวมถึงหมาป่าตัวอื่น/ผู้หยุดความสามารถฝั่งหมู่บ้าน — ถ้าถูกขัดกลับโดยช่องที่เร็วกว่า (ช่อง 10) จะขัดใครไม่ได้คืนนั้น',
    'ผู้ถูกขัดได้รับแจ้ง "ความสามารถถูกขัดขวาง" ตามตั้งค่า (ไม่บอกว่าใครทำ)',
    'ถ้าตัวเองถูกขัดขวาง (ที่ช่อง 10) จะไม่ได้ร่วมเลือกเหยื่อกับฝูงคืนนั้นด้วย',
    'ผู้หยั่งรู้เห็นเป็นหมาป่า',
  ],
  seenAsWolf: true,
};

export const swapper: RoleDef = {
  id: 'swapper', nameTh: 'ผู้สลับชะตา', kind: 'normal',
  descriptionTh: 'ทุกคืนคุณเลือก 2 คน แล้วสลับ "เป้าหมาย" ของทุกความสามารถที่คนอื่นใช้คืนนั้น เช่น หมาป่าเลือกฆ่า A แต่หมอกัน B → กลายเป็นหมาป่าฆ่า B หมอกัน A',
  startTeam: 'village', winWith: 'village',
  goalTh: 'พลิกสถานการณ์กลางคืนให้เป็นประโยชน์กับหมู่บ้าน โดยไม่มีใครรู้ว่าเกิดอะไรขึ้น',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้านเมื่อหมาป่าและฝ่ายศัตรูถูกกำจัดหมด',
  balanceScore: 5, nightSlot: 60, wakes: 'every-night',
  abilities: [{ kind: 'swap', targets: 2, canTargetSelf: true, canTargetDead: false, uses: 'unlimited' }],
  priority: 60,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ความสามารถกลางคืนหยุด',
  interactions: [
    'ตื่นหลังสุด (ช่อง 60) — สลับหลังทุกคนเลือกเป้าหมายแล้ว ไม่มีใครรู้ตัวว่าถูกสลับ',
    'สลับเป้าหมายของทุกเจตนาที่มีผล (ฆ่า กัน ชุบ สืบสวน ขัดขวาง ห้ามโหวต ฯลฯ) ของคนอื่นทุกคน แบบสมมาตร (A↔B)',
    'สลับ "เป้าหมาย" เท่านั้น — ไม่สลับบทบาทหรือฝ่ายของใคร',
    'การขัดขวาง (ช่อง 1) เกิดขึ้นก่อนการสลับเสมอ — สลับเป้าหมายของคนที่ถูกขัดไปแล้วไม่มีผล',
    'ถ้าถูกขัดขวางเอง คืนนั้นไม่มีการสลับเกิดขึ้น',
  ],
};

export const BATCH2_ROLES: RoleDef[] = [wolfBlocker, swapper];
