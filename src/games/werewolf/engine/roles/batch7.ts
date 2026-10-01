// engine/roles/batch7.ts — M6 แพ็กที่ 7: ทีมอิสระ (แวมไพร์ · ผู้นำลัทธิ + สมาชิกลัทธิ)
import type { RoleDef } from '../types';

export const vampire: RoleDef = {
  id: 'vampire', nameTh: 'แวมไพร์', kind: 'neutral',
  descriptionTh: 'ทุกคืนเลือกกัด 1 คน — เหยื่อไม่ตาย แต่จะกลายเป็นแวมไพร์ตอนจบคืนถัดไป (ย้อนกลับไม่ได้) และร่วมกัดคนต่อไปได้ทันที',
  startTeam: 'vampire', winWith: 'vampire',
  goalTh: 'แพร่พันธุ์แวมไพร์จนควบคุมหมู่บ้านได้',
  winTh: 'ชนะเมื่อจำนวนแวมไพร์ที่รอด ≥ ผู้เล่นอื่นที่รอด',
  balanceScore: -6, nightSlot: 33, wakes: 'every-night',
  abilities: [{ kind: 'vampire_bite', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' }],
  priority: 33,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'แวมไพร์ตัวอื่นยังกัดต่อได้',
  interactions: [
    'หมอ นักบวช และผู้คุ้มกันป้องกันการกัดของแวมไพร์ได้ (ตาราง 11.2) — แต่แม่มดชุบไม่ได้ (ไม่ใช่เหยื่อฝูงหมาป่า)',
    'หมาป่าและฝ่ายอิสระอื่นกัดแวมไพร์ไม่ได้ผล (แวมไพร์มีภูมิต้านทาน) 🔸A11',
    'ผู้ที่ถูกแปลงจะมีความสามารถกัดเหมือนแวมไพร์ทุกตัว (ไม่ต้องรอใครเป็น "หัวหน้า")',
    'ผู้หยั่งรู้เห็นเป็น "ไม่ใช่หมาป่า"',
  ],
};

export const cultLeader: RoleDef = {
  id: 'cult_leader', nameTh: 'ผู้นำลัทธิ', kind: 'neutral',
  descriptionTh: 'ทุกคืนเลือกชักชวนผู้เล่นฝ่ายหมู่บ้าน 1 คน — ถ้าสำเร็จ เขาจะเป็นสมาชิกลัทธิทันทีตอนจบคืนนั้น (เร็วกว่าแวมไพร์ที่ต้องรอข้ามคืน)',
  startTeam: 'cult', winWith: 'cult',
  goalTh: 'ชักชวนสมาชิกลัทธิให้ได้มากพอจะควบคุมหมู่บ้าน',
  winTh: 'ชนะเมื่อจำนวนสมาชิกลัทธิ (รวมหัวหน้า) ที่รอด ≥ ผู้เล่นอื่นที่รอด',
  balanceScore: -6, nightSlot: 34, wakes: 'every-night',
  abilities: [{ kind: 'cult_recruit', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' }],
  priority: 34,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ไม่มีใครชักชวนต่อ (สมาชิกเดิมยังอยู่ลัทธิเหมือนเดิม)',
  interactions: [
    'ชักชวนได้เฉพาะผู้เล่นฝ่ายหมู่บ้านเท่านั้น (ชักชวนหมาป่า/ฝ่ายอิสระอื่น/ผู้นำลัทธิอื่นไม่ได้)',
    'เปลี่ยนฝ่ายทันทีตอนจบคืนนั้น (ไม่ต้องรอข้ามคืนเหมือนแวมไพร์)',
    'สมาชิกที่ถูกชักชวนแล้วไม่มีความสามารถชักชวนต่อ (ชักชวนได้เฉพาะหัวหน้า)',
    'ผู้หยั่งรู้เห็นเป็น "ไม่ใช่หมาป่า"',
  ],
};

export const cultMember: RoleDef = {
  id: 'cult_member', nameTh: 'สมาชิกลัทธิ', kind: 'neutral',
  descriptionTh: 'คุณถูกผู้นำลัทธิชักชวนมาเข้าพวกแล้ว ไม่มีความสามารถพิเศษ แต่ร่วมชนะไปกับลัทธิได้',
  startTeam: 'cult', winWith: 'cult',
  goalTh: 'ช่วยปกป้องผู้นำลัทธิและพูดชักจูงให้หมู่บ้านสงสัยคนอื่นแทน',
  winTh: 'ชนะเมื่อจำนวนสมาชิกลัทธิ (รวมหัวหน้า) ที่รอด ≥ ผู้เล่นอื่นที่รอด',
  balanceScore: 0, nightSlot: null, wakes: 'passive', abilities: [], priority: 0,
  onBlocked: 'n/a', onTargetDeath: 'n/a', onActorDeath: 'ไม่มี',
  interactions: ['ไม่มีความสามารถกลางคืน — เป็นได้จากการถูกผู้นำลัทธิชักชวนเท่านั้น', 'ผู้หยั่งรู้เห็นเป็น "ไม่ใช่หมาป่า"'],
};

export const BATCH7_ROLES: RoleDef[] = [vampire, cultLeader, cultMember];
