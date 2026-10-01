// engine/roles/batch5.ts — M6 แพ็กที่ 5: บทฝ่ายหมาป่าที่เหลือทั้งหมด (ตาราง 10.2 ครบ)
import type { RoleDef } from '../types';

export const loneWolf: RoleDef = {
  id: 'lone_wolf', nameTh: 'หมาป่าเดียวดาย', kind: 'normal',
  descriptionTh: 'เหมือนมนุษย์หมาป่าทุกอย่าง แต่คุณอยากเป็นหมาป่าที่เหลือรอดเพียงตัวเดียว',
  startTeam: 'wolf', winWith: 'wolf',
  goalTh: 'กำจัดหมาป่าตัวอื่นทางอ้อม (ปล่อยให้โดนโหวต) แล้วพาฝูงชนะตอนเหลือคุณคนเดียว',
  winTh: 'ชนะเฉพาะเมื่อฝ่ายหมาป่าชนะ **และคุณเป็นหมาป่าที่เหลือรอดเพียงตัวเดียว** — ถ้าหมาป่าชนะขณะมีหมาป่าตัวอื่นรอดด้วย คุณแพ้',
  balanceScore: -5, nightSlot: 30, wakes: 'every-night',
  abilities: [{ kind: 'wolf_bite', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' }],
  priority: 30,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'หมาป่าตัวอื่นยังกัดต่อได้',
  interactions: [
    'ร่วมเลือกเหยื่อกับฝูงตามปกติทุกคืน',
    'ตอนเกมจบด้วยชัยชนะของฝ่ายหมาป่า: ถ้ายังมีหมาป่าตัวอื่นรอดอยู่ คุณจะไม่ถูกนับเป็นผู้ชนะ (แพ้ แม้ฝ่ายหมาป่าชนะ)',
    'ผู้หยั่งรู้เห็นเป็นหมาป่า',
  ],
  seenAsWolf: true,
};

export const sorcerer: RoleDef = {
  id: 'sorcerer', nameTh: 'ผู้พยากรณ์ของหมาป่า', kind: 'normal',
  descriptionTh: 'ทุกคืนเลือก 1 คน แล้วรู้ว่า "เขาเป็นผู้หยั่งรู้หรือไม่" — ช่วยฝูงหาตัวผู้หยั่งรู้มากำจัดก่อน',
  startTeam: 'wolf', winWith: 'wolf',
  goalTh: 'หาตัวผู้หยั่งรู้ให้ฝูงกำจัดก่อนที่จะถูกจับได้',
  winTh: 'ชนะพร้อมฝ่ายหมาป่าเมื่อจำนวนหมาป่าที่รอด ≥ ผู้เล่นอื่นที่รอด',
  balanceScore: -5, nightSlot: 31, wakes: 'every-night',
  abilities: [{ kind: 'investigate_sorcerer', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' }],
  priority: 31,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ความสามารถกลางคืนหยุด',
  interactions: [
    'ไม่ร่วมเลือกเหยื่อกับฝูง (ตื่นแยกช่อง 31 หลังฝูงกัด)',
    'ตรวจจับได้เฉพาะบท "ผู้หยั่งรู้" เท่านั้น (ศิษย์ผู้หยั่งรู้ที่ยังไม่เลื่อนขั้น = ไม่ใช่)',
    'ผู้หยั่งรู้เห็นเป็นหมาป่า',
  ],
  seenAsWolf: true,
};

export const wolfSeer: RoleDef = {
  id: 'wolf_seer', nameTh: 'ผู้หยั่งรู้ฝ่ายหมาป่า', kind: 'normal',
  descriptionTh: 'เหมือนมนุษย์หมาป่า (ร่วมเลือกเหยื่อกับฝูง) และทุกคืนตรวจ 1 คนเพื่อรู้บทจริงของเขา',
  startTeam: 'wolf', winWith: 'wolf',
  goalTh: 'ใช้ข้อมูลบทจริงของชาวบ้านช่วยฝูงวางแผนฆ่าบทสำคัญ',
  winTh: 'ชนะพร้อมฝ่ายหมาป่าเมื่อจำนวนหมาป่าที่รอด ≥ ผู้เล่นอื่นที่รอด',
  balanceScore: -8, nightSlot: 30, wakes: 'every-night',
  abilities: [
    { kind: 'wolf_bite', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' },
    { kind: 'investigate_wolfseer', nightSlot: 32, targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' },
  ],
  priority: 32,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'หมาป่าตัวอื่นยังกัดต่อได้ · ความสามารถตรวจหยุด',
  interactions: [
    'ตื่นสองช่อง: ช่อง 30 ร่วมเลือกเหยื่อกับฝูง · ช่อง 32 ตรวจบทจริงของใครก็ได้ 1 คน',
    'รู้บทจริงเต็มๆ (ไม่ใช่แค่ฝ่าย) — ต่างจากผู้หยั่งรู้ธรรมดาที่รู้แค่ "เป็นหมาป่าหรือไม่"',
    'ผู้หยั่งรู้เห็นเป็นหมาป่า',
  ],
  seenAsWolf: true,
};

export const alphaWolf: RoleDef = {
  id: 'alpha_wolf', nameTh: 'หมาป่าอัลฟ่า', kind: 'normal',
  descriptionTh: 'เหมือนมนุษย์หมาป่า และมี 1 ครั้งตลอดเกม: เลือกผู้เล่นฝ่ายหมู่บ้าน 1 คนให้กลายเป็นหมาป่าตอนจบคืนถัดไป',
  startTeam: 'wolf', winWith: 'wolf',
  goalTh: 'ขยายฝูงหมาป่าแบบเงียบๆ ด้วยการเปลี่ยนคนของหมู่บ้านให้มาเป็นพวกเดียวกัน',
  winTh: 'ชนะพร้อมฝ่ายหมาป่าเมื่อจำนวนหมาป่าที่รอด ≥ ผู้เล่นอื่นที่รอด',
  balanceScore: -7, nightSlot: 30, wakes: 'every-night',
  abilities: [
    { kind: 'wolf_bite', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' },
    { kind: 'alpha_convert', nightSlot: 33, targets: 1, canTargetSelf: false, canTargetDead: false, uses: 1 },
  ],
  priority: 33,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'หมาป่าตัวอื่นยังกัดต่อได้ · นัดเปลี่ยนคนที่ยังไม่ได้ใช้หายไป',
  interactions: [
    'ตื่นสองช่อง: ช่อง 30 ร่วมเลือกเหยื่อกับฝูง · ช่อง 33 (ใช้ได้ 1 ครั้งตลอดเกม) เลือกคนที่จะเปลี่ยนเป็นหมาป่า',
    'ผลเกิดตอนจบคืนถัดไป (ไม่ใช่ทันที) — ถ้าเป้าหมายตายก่อนถึงตอนนั้น ไม่มีผลและนัดไม่หาย',
    'เปลี่ยนแล้วย้อนกลับไม่ได้ และเข้าฝูงกัดร่วมกับหมาป่าได้ทันที',
    'เลือกได้เฉพาะคนฝ่ายหมู่บ้านเท่านั้น',
    'ผู้หยั่งรู้เห็นเป็นหมาป่า',
  ],
  seenAsWolf: true,
  initRoleState: () => ({ alphaUsed: false }),
};

export const infectiousWolf: RoleDef = {
  id: 'infectious_wolf', nameTh: 'หมาป่าแพร่เชื้อ', kind: 'normal',
  descriptionTh: 'เหมือนมนุษย์หมาป่า และมี 1 ครั้งตลอดเกม: ให้ฝูง "แพร่เชื้อ" แทนการฆ่าในคืนนั้น — ผู้ติดเชื้อยังแสดงบทเดิมไปก่อน แล้วกลายเป็นหมาป่าตอนจบคืนที่สองถัดจากนี้',
  startTeam: 'wolf', winWith: 'wolf',
  goalTh: 'แทรกคนของตัวเองเข้าไปในฝ่ายหมู่บ้านโดยไม่มีใครรู้ตัวจนกว่าจะสาย',
  winTh: 'ชนะพร้อมฝ่ายหมาป่าเมื่อจำนวนหมาป่าที่รอด ≥ ผู้เล่นอื่นที่รอด',
  balanceScore: -8, nightSlot: 30, wakes: 'every-night',
  abilities: [
    { kind: 'wolf_bite', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' },
    { kind: 'infect', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 1 },
  ],
  priority: 30,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'หมาป่าตัวอื่นยังกัดต่อได้ · นัดแพร่เชื้อที่ยังไม่ได้ใช้หายไป',
  interactions: [
    'เลือกอย่างใดอย่างหนึ่งต่อคืน: ร่วมกัดกับฝูงตามปกติ (wolf_bite) หรือแพร่เชื้อแทน (infect) — แพร่เชื้อแล้วคืนนั้นฝูงไม่มีใครตายจากการกัด',
    'ผู้ติดเชื้อยังดูเป็นบทเดิมของตัวเองทุกอย่าง (ผู้หยั่งรู้ยังไม่เห็นเป็นหมาป่า) จนกว่าจะแปลงจริง',
    'แปลงเป็นหมาป่าตอนจบคืนที่ 2 หลังจากติดเชื้อ (ไม่ใช่คืนถัดไปทันที) ย้อนกลับไม่ได้',
    '🔸A26 ข้อสมมติ: แม่มดชุบคืนนี้ไม่เกี่ยวกับการแพร่เชื้อ (ไม่มีใครถูกฆ่าให้ชุบอยู่แล้ว)',
    'ผู้หยั่งรู้เห็นเป็นหมาป่า',
  ],
  seenAsWolf: true,
  initRoleState: () => ({ infectUsed: false }),
};

export const wolfCub: RoleDef = {
  id: 'wolf_cub', nameTh: 'ลูกหมาป่า', kind: 'normal',
  descriptionTh: 'เหมือนมนุษย์หมาป่าทุกอย่าง แต่ถ้าคุณตาย ฝูงจะโกรธจัดและฆ่าได้ 2 คนในคืนถัดไป',
  startTeam: 'wolf', winWith: 'wolf',
  goalTh: 'ร่วมฝูงฆ่าชาวบ้าน และถ้าพลาดถูกกำจัด ฝูงจะยิ่งอันตรายขึ้นในคืนถัดไป',
  winTh: 'ชนะพร้อมฝ่ายหมาป่าเมื่อจำนวนหมาป่าที่รอด ≥ ผู้เล่นอื่นที่รอด',
  balanceScore: -6, nightSlot: 30, wakes: 'every-night',
  abilities: [{ kind: 'wolf_bite', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' }],
  priority: 30,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ปลดล็อกคืนถัดไป: ฝูงฆ่าได้ 2 คน (ถ้ายังมีหมาป่าเหลืออยู่)',
  interactions: [
    'ร่วมเลือกเหยื่อกับฝูงตามปกติทุกคืน',
    '🔸A27 ข้อสมมติ: คืนที่ล้างแค้น เป้าหมายแรกยังเป็นไปตามเสียงข้างมากของฝูงตามปกติ ส่วนเป้าหมายที่สองคือผู้เล่นคนถัดไปที่มีหมาป่าอย่างน้อย 1 ตัวเลือก (ถ้าไม่มีก็มีแค่เป้าหมายเดียว) · แม่มดชุบได้เฉพาะเป้าหมายแรกเท่านั้น',
    'ผู้หยั่งรู้เห็นเป็นหมาป่า',
  ],
  seenAsWolf: true,
};

export const BATCH5_ROLES: RoleDef[] = [loneWolf, sorcerer, wolfSeer, alphaWolf, infectiousWolf, wolfCub];
