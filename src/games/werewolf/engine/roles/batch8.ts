// engine/roles/batch8.ts — M6 แพ็กที่ 8: บท "พิเศษ" ที่เหลือ — ผู้ลอกเลียนแบบ + เด็กป่าหลงทาง + มนุษย์ป่า
// (ผู้ควบคุมเวลาข้ามไว้ก่อนตามคำสั่งผู้ใช้ 2026-10-02 — ต้องแก้ตัวจับเวลาฝั่งเซิร์ฟเวอร์โดยตรง เสี่ยงกว่าบทอื่น)
import type { RoleDef } from '../types';

export const doppelganger: RoleDef = {
  id: 'doppelganger', nameTh: 'ผู้ลอกเลียนแบบ', kind: 'special',
  descriptionTh: 'คืนแรกเลือกผู้เล่น 1 คน แล้วกลายเป็นบทของเขาทันที (ฝ่าย ความสามารถ เงื่อนไขชนะ ครบทุกอย่าง) — ถ้าบทนั้นทำงานคืนแรกด้วย คุณได้ใช้ความสามารถนั้นคืนนี้เลย',
  startTeam: 'village', winWith: 'self',
  goalTh: 'เลือกลอกบทที่จะช่วยให้คุณชนะได้มากที่สุด',
  winTh: 'ตามบทที่ลอก (เปลี่ยนเป็นฝ่าย/เงื่อนไขชนะของบทนั้นทันทีที่ลอกสำเร็จ)',
  balanceScore: 0, nightSlot: 1, wakes: 'first-night',
  abilities: [{ kind: 'copy_role', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 1 }],
  priority: 1,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'n/a', onActorDeath: 'ไม่มี',
  interactions: [
    'ตื่นเป็นคนแรกของเกม (ช่อง 1) ก่อนทุกบท',
    'ได้ "ชุดความสามารถใหม่" ของตัวเอง (ไม่ได้แย่งของบทต้นฉบับ เช่น ลอกแม่มด = ได้ยาชุบ+พิษครบชุดของตัวเอง)',
    'ถ้าบทที่ลอกมีความสามารถคืนแรก (เช่น ผู้จับคู่รัก/เด็กป่า/มนุษย์ป่า/ผู้ทำนายอนาคต) จะได้ใช้ในคืนนี้เลยที่ช่องของบทนั้น',
    'ลอกหมาป่า = กลายเป็นหมาป่าทันที เข้าร่วมฝูงคืนนี้ได้เลย',
    'ลอกบทที่มีเงื่อนไขชนะพิเศษ (เช่น ตัวตลก คนฟอก) ก็ได้เงื่อนไขนั้นไปด้วย',
    '🔸A29 ข้อสมมติ: เป็นการ "คัดลอกครั้งเดียว" ถ้าบทต้นฉบับเปลี่ยนฝ่ายภายหลัง (เช่นถูกกัดจนกลายเป็นหมาป่า) ผู้ลอกจะไม่เปลี่ยนตาม (ต่างจากต้นฉบับที่ตั้งใจให้ตามตลอดเกม — ข้อจำกัดของเอนจินเวอร์ชันนี้)',
  ],
};

export const wildChild: RoleDef = {
  id: 'wild_child', nameTh: 'เด็กป่าหลงทาง', kind: 'special',
  descriptionTh: 'คืนแรกเลือกผู้เล่น 1 คนเป็น "ต้นแบบ" — ถ้าต้นแบบยังมีชีวิต คุณอยู่ฝ่ายหมู่บ้าน แต่ถ้าต้นแบบตายเมื่อไร คุณจะกลายเป็นหมาป่าทันที (ย้อนกลับไม่ได้)',
  startTeam: 'village', winWith: 'village',
  goalTh: 'ปกป้องต้นแบบให้รอด หรือถ้าเขาตายก็เปลี่ยนใจไปช่วยฝูงหมาป่าแทน',
  winTh: 'ต้นแบบรอดจนจบเกม = ชนะพร้อมฝ่ายหมู่บ้าน · ต้นแบบตาย = กลายเป็นหมาป่า ชนะพร้อมฝ่ายหมาป่าแทน',
  balanceScore: -1, nightSlot: 3, wakes: 'first-night',
  abilities: [{ kind: 'pick_model', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 1 }],
  priority: 3,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'n/a', onActorDeath: 'ไม่มี',
  interactions: [
    'เลือกต้นแบบได้คืนแรกเท่านั้น',
    'ต้นแบบตายด้วยสาเหตุใดก็ได้ (กัด พิษ โหวต ยิง ฯลฯ) → แปลงเป็นหมาป่าทันที เข้าฝูงกัดได้ตั้งแต่คืนนั้นเป็นต้นไป',
    'แปลงแล้วย้อนกลับไม่ได้ แม้ภายหลังจะมีบทที่ "ชุบคืนชีพ" ต้นแบบ',
    'ก่อนแปลง ผู้หยั่งรู้เห็นเป็น "ไม่ใช่หมาป่า" — หลังแปลงเห็นเป็นหมาป่าทันที',
  ],
  initRoleState: () => ({ modelId: null }),
};

export const sasquatch: RoleDef = {
  id: 'sasquatch', nameTh: 'มนุษย์ป่า', kind: 'special',
  descriptionTh: 'เหมือนเด็กป่าหลงทางทุกประการ — เลือกต้นแบบคืนแรก ถ้าต้นแบบตายจะกลายเป็นหมาป่าทันที',
  startTeam: 'village', winWith: 'village',
  goalTh: 'ปกป้องต้นแบบให้รอด หรือถ้าเขาตายก็เปลี่ยนใจไปช่วยฝูงหมาป่าแทน',
  winTh: 'ต้นแบบรอดจนจบเกม = ชนะพร้อมฝ่ายหมู่บ้าน · ต้นแบบตาย = กลายเป็นหมาป่า ชนะพร้อมฝ่ายหมาป่าแทน',
  balanceScore: -1, nightSlot: 3, wakes: 'first-night',
  abilities: [{ kind: 'pick_model', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 1 }],
  priority: 3,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'n/a', onActorDeath: 'ไม่มี',
  interactions: [
    'ใช้กลไก "ต้นแบบ" เดียวกับเด็กป่าหลงทาง (เลือกต้นแบบคนละคนกันได้ถ้ามีทั้งสองบทในเกม)',
    'ต้นแบบตายด้วยสาเหตุใดก็ได้ → แปลงเป็นหมาป่าทันที ย้อนกลับไม่ได้',
  ],
  initRoleState: () => ({ modelId: null }),
};

export const BATCH8_ROLES: RoleDef[] = [doppelganger, wildChild, sasquatch];
