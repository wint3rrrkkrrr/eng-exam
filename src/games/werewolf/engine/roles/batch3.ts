// engine/roles/batch3.ts — M6 แพ็กที่ 3: สายสืบสวนที่ "ไม่เผยบทจริง" + นักบวช + ผู้ดูแลสุสาน
import type { RoleDef } from '../types';

export const priest: RoleDef = {
  id: 'priest', nameTh: 'นักบวช', kind: 'normal',
  descriptionTh: 'ทุกคืนคุณสวดคุ้มครอง 1 คน กันการโจมตีได้เกือบทุกชนิด แต่ห้ามคุ้มครองคนเดิมสองคืนติดกัน',
  startTeam: 'village', winWith: 'village',
  goalTh: 'รักษาคนสำคัญของหมู่บ้านให้รอดจากคืนอันตราย',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้านเมื่อหมาป่าและฝ่ายศัตรูถูกกำจัดหมด',
  balanceScore: 4, nightSlot: 22, wakes: 'every-night',
  abilities: [{ kind: 'protect_priest', targets: 1, canTargetSelf: true, canTargetDead: false, uses: 'unlimited' }],
  priority: 22,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ความสามารถกลางคืนหยุด',
  interactions: [
    'กันการกัดของหมาป่าได้ (เหมือนหมอ) · ห้ามคุ้มครองคนเดิมสองคืนติดกันเสมอ (ไม่มีตัวเลือกปิด)',
    'พิษแม่มดทะลุการคุ้มครองของนักบวช',
    'คุ้มครองตัวเองได้',
    'ทำงานหลังหมอ (ช่อง 22) — ถ้าทั้งคู่กันคนเดียวกัน ผลเหมือนกันคือรอด',
  ],
};

export const auraSeer: RoleDef = {
  id: 'aura_seer', nameTh: 'ผู้หยั่งรู้รัศมี', kind: 'normal',
  descriptionTh: 'ทุกคืนเลือก 1 คน เห็น "รัศมี" ของเขา: ดี (ฝ่ายหมู่บ้าน) · ร้าย (ฝ่ายหมาป่า) · อิสระ (ฝ่ายอิสระ) — ไม่เห็นบทจริง',
  startTeam: 'village', winWith: 'village',
  goalTh: 'คัดแยกฝ่ายของผู้เล่นให้หมู่บ้านไล่ล่าถูกตัว',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้านเมื่อหมาป่าและฝ่ายศัตรูถูกกำจัดหมด',
  balanceScore: 5, nightSlot: 41, wakes: 'every-night',
  abilities: [{ kind: 'investigate_aura', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' }],
  priority: 41,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ความสามารถกลางคืนหยุด',
  interactions: [
    'เห็นรัศมีของฝ่ายอิสระเป็น "อิสระ" (ต่างจากผู้หยั่งรู้ธรรมดาที่เห็นเป็น "ไม่ใช่หมาป่า")',
    'มนุษย์หมาป่าลวงตาเห็นเป็น "ดี" (รัศมีไม่ถูกหลอก — ต่างจากผู้หยั่งรู้ธรรมดา)',
    'ไม่เห็นบทจริง เห็นแค่กลุ่มฝ่าย',
  ],
};

export const mysticSeer: RoleDef = {
  id: 'mystic_seer', nameTh: 'ผู้หยั่งรู้ลึกลับ', kind: 'normal',
  descriptionTh: 'ทุกคืนเลือก 1 คน เห็น "ประเภทความสามารถ" ของเขา: ฆ่า · ป้องกัน · สืบสวน · ขัดขวาง · เปลี่ยนฝ่าย · ไม่มีความสามารถ',
  startTeam: 'village', winWith: 'village',
  goalTh: 'หาว่าใครถือความสามารถอันตราย และใครเป็นชาวบ้านธรรมดา',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้านเมื่อหมาป่าและฝ่ายศัตรูถูกกำจัดหมด',
  balanceScore: 5, nightSlot: 42, wakes: 'every-night',
  abilities: [{ kind: 'investigate_mystic', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' }],
  priority: 42,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ความสามารถกลางคืนหยุด',
  interactions: [
    'บอกแค่ "ประเภท" ไม่บอกบทและไม่บอกฝ่าย (หมาป่ากับฆาตกรเห็นเป็น "ฆ่า" เหมือนกัน · หมอกับนักบวชเห็นเป็น "ป้องกัน" เหมือนกัน)',
    'ชาวบ้าน ผู้ใหญ่บ้าน ผู้รักสันติ เจ้าชาย คนโง่ คนฟอก เห็นเป็น "ไม่มีความสามารถ"',
  ],
};

export const detective: RoleDef = {
  id: 'detective', nameTh: 'นักสืบ', kind: 'normal',
  descriptionTh: 'ทุกคืนเลือก 2 คน แล้วรู้ว่าทั้งสองอยู่ "ฝ่ายเดียวกัน" หรือ "คนละฝ่าย" — ไม่บอกว่าฝ่ายไหน',
  startTeam: 'village', winWith: 'village',
  goalTh: 'จับคู่ผู้เล่นเพื่อไล่หาว่ากลุ่มไหนเป็นพวกเดียวกัน',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้านเมื่อหมาป่าและฝ่ายศัตรูถูกกำจัดหมด',
  balanceScore: 4, nightSlot: 43, wakes: 'every-night',
  abilities: [{ kind: 'investigate_pair', targets: 2, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' }],
  priority: 43,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ความสามารถกลางคืนหยุด',
  interactions: [
    'เทียบ "ฝ่ายปัจจุบัน" ของทั้งสองคน (ถ้าคนหนึ่งเปลี่ยนฝ่ายไปแล้ว ใช้ฝ่ายใหม่)',
    'ฝ่ายอิสระแต่ละคนถือว่าเป็นคนละฝ่ายกับทุกคน ยกเว้นอยู่ทีมอิสระเดียวกัน',
    'ไม่บอกบทและไม่บอกว่าเป็นฝ่ายอะไร',
  ],
};

export const investigator: RoleDef = {
  id: 'investigator', nameTh: 'นักสืบสวน', kind: 'normal',
  descriptionTh: 'ทุกคืนเลือก 2 คน แล้วรู้ว่า "ในกลุ่มนี้มีหมาป่าหรือไม่" — แต่ไม่รู้ว่าเป็นใคร',
  startTeam: 'village', winWith: 'village',
  goalTh: 'ค่อยๆ ตีวงให้แคบลงว่าหมาป่าซ่อนอยู่ในกลุ่มไหน',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้านเมื่อหมาป่าและฝ่ายศัตรูถูกกำจัดหมด',
  balanceScore: 4, nightSlot: 44, wakes: 'every-night',
  abilities: [{ kind: 'investigate_group', targets: 2, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' }],
  priority: 44,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ความสามารถกลางคืนหยุด',
  interactions: [
    'ใช้กติกาเดียวกับผู้หยั่งรู้ว่าใคร "นับเป็นหมาป่า" (มนุษย์หมาป่าลวงตานับเป็นหมาป่า — หลอกได้)',
    'บอกแค่ มี/ไม่มี ไม่บอกจำนวนและไม่บอกว่าเป็นใคร',
  ],
};

export const gravekeeper: RoleDef = {
  id: 'gravekeeper', nameTh: 'ผู้ดูแลสุสาน', kind: 'normal',
  descriptionTh: 'ทุกคืนเลือก "ผู้ที่ตายไปแล้ว" 1 คน แล้วรู้บทจริงและฝ่ายของเขา (คืนชีพไม่ได้)',
  startTeam: 'village', winWith: 'village',
  goalTh: 'อ่านศพเพื่อยืนยันว่าหมู่บ้านโหวตถูกตัวหรือผิดตัว',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้านเมื่อหมาป่าและฝ่ายศัตรูถูกกำจัดหมด',
  balanceScore: 3, nightSlot: 45, wakes: 'every-night',
  abilities: [{ kind: 'inspect_grave', targets: 1, canTargetSelf: false, canTargetDead: true, uses: 'unlimited' }],
  priority: 45,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'n/a',
  onActorDeath: 'ความสามารถกลางคืนหยุด',
  interactions: [
    'เลือกได้เฉพาะผู้ที่ตายแล้วเท่านั้น (คืนแรกยังไม่มีศพ = ไม่มีเป้าหมายให้เลือก)',
    'เห็นบทจริงเต็มๆ แม้ตั้งค่าห้องจะไม่เปิดเผยบทตอนตายก็ตาม',
    'ไม่คืนชีพและไม่เปลี่ยนอะไรในเกม',
  ],
};

export const BATCH3_ROLES: RoleDef[] = [priest, auraSeer, mysticSeer, detective, investigator, gravekeeper];
