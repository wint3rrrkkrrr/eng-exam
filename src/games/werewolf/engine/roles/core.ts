// engine/roles/core.ts — แพ็กหลัก M2 (14 บท) · บทเสริมที่เหลือทำที่ M6 ทีละ 1–2 บท
// ทุกบทเป็น "ข้อมูล" ไม่ใช่ if/else ในเครื่องยนต์ — ครบทุกฟิลด์ตามกติกาเจ้าของเว็บข้อ 22
import type { RoleDef } from '../types';

export const villager: RoleDef = {
  id: 'villager', nameTh: 'ชาวบ้าน', kind: 'normal',
  descriptionTh: 'คุณเป็นชาวบ้านธรรมดา ไม่มีพลังพิเศษ อาวุธของคุณคือการพูดคุยและการโหวต',
  startTeam: 'village', winWith: 'village',
  goalTh: 'กำจัดหมาป่าและฝ่ายศัตรูที่เป็นภัยทั้งหมด',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้านเมื่อหมาป่าทุกตัวถูกกำจัด',
  balanceScore: 1, nightSlot: null, wakes: 'passive', abilities: [], priority: 0,
  onBlocked: 'n/a', onTargetDeath: 'n/a', onActorDeath: 'ไม่มี',
  interactions: ['ผู้หยั่งรู้เห็นเป็น "ไม่ใช่หมาป่า"'],
};

export const werewolf: RoleDef = {
  id: 'werewolf', nameTh: 'มนุษย์หมาป่า', kind: 'normal',
  descriptionTh: 'กลางคืนคุณและพวกตื่นขึ้นมาเลือกเหยื่อร่วมกัน กลางวันแกล้งเป็นชาวบ้าน',
  startTeam: 'wolf', winWith: 'wolf',
  goalTh: 'ฆ่าฝ่ายชาวบ้านและฝ่ายอื่นจนหมาป่าควบคุมเกมได้',
  winTh: 'ชนะพร้อมฝ่ายหมาป่าเมื่อจำนวนหมาป่าที่รอด ≥ ผู้เล่นอื่นที่รอด',
  balanceScore: -6, nightSlot: 30, wakes: 'every-night',
  abilities: [{ kind: 'wolf_bite', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' }],
  priority: 30,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'หมาป่าตัวอื่นยังกัดต่อได้',
  interactions: ['หมอ/ผู้คุ้มกันกันได้', 'ผู้หยั่งรู้เห็นเป็น "หมาป่า"', 'เห็นหมาป่าด้วยกัน'],
  seenAsWolf: true,
};

export const veilWolf: RoleDef = {
  id: 'veil_wolf', nameTh: 'หมาป่าผู้บดบัง', kind: 'special',
  descriptionTh: 'เหมือนมนุษย์หมาป่า และมี 1 ครั้งต่อเกมที่คุณสั่ง "บดบังโหวต" ในวันถัดไป — ทุกคนจะมองไม่เห็นว่าใครโหวตใคร (โหวตยังนับตามปกติ)',
  startTeam: 'wolf', winWith: 'wolf',
  goalTh: 'ฆ่าฝ่ายชาวบ้าน และใช้การบดบังโหวตให้ชาวบ้านจับพิรุธกันไม่ได้',
  winTh: 'ชนะพร้อมฝ่ายหมาป่าเมื่อจำนวนหมาป่าที่รอด ≥ ผู้เล่นอื่นที่รอด',
  balanceScore: -7, nightSlot: 30, wakes: 'every-night',
  abilities: [{ kind: 'wolf_bite', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' }],
  priority: 30,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'หมาป่าตัวอื่นยังกัดต่อได้ · ถ้าสั่งบดบังไปแล้ว การบดบังยังมีผลในวันถัดไป',
  interactions: [
    'ติดมากับการเลือกเหยื่อของฝูง (ติ๊ก "บดบังโหวตวันถัดไป" ตอนส่งคำสั่งกัด)',
    'บดบังเฉพาะ "ใครโหวตใคร" — คะแนนยังนับตามปกติ และผู้ตายกลางวันยังถูกตัดสินตามผลโหวต',
    'ขึ้นประกาศสาธารณะ "โหวตนี้ถูกหมาป่าแทรกแซง" (ไม่บอกว่าใครทำ)',
  ],
  seenAsWolf: true,
  initRoleState: () => ({ veilLeft: 1 }),
};

export const seer: RoleDef = {
  id: 'seer', nameTh: 'ผู้หยั่งรู้', kind: 'normal',
  descriptionTh: 'ทุกคืนคุณเลือกดูผู้เล่นหนึ่งคนว่าเป็นหมาป่าหรือไม่ แต่ถ้าเผยตัวเร็ว หมาป่าจะมาหาคุณก่อน',
  startTeam: 'village', winWith: 'village',
  goalTh: 'หาหมาป่าให้เจอ',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้าน',
  balanceScore: 6, nightSlot: 40, wakes: 'every-night',
  abilities: [{ kind: 'investigate_seer', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' }],
  priority: 100,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ศิษย์ผู้หยั่งรู้เลื่อนขั้น (M6)',
  interactions: ['ผลส่งตอนเช้า (ไม่ตอบทันที)', 'ถูกกระจกสะท้อนได้ (M6)'],
};

export const doctor: RoleDef = {
  id: 'doctor', nameTh: 'หมอ', kind: 'normal',
  descriptionTh: 'ทุกคืนคุณเลือกปกป้องหนึ่งคนจากการโจมตี',
  startTeam: 'village', winWith: 'village',
  goalTh: 'ปกป้องชาวบ้านจากเขี้ยวหมาป่า',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้าน',
  balanceScore: 4, nightSlot: 20, wakes: 'every-night',
  abilities: [{ kind: 'protect_doctor', targets: 1, canTargetSelf: true, canTargetDead: false, noRepeatNights: 1, uses: 'unlimited' }],
  priority: 20,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ไม่มี',
  interactions: ['กันการกัดของหมาป่าได้', 'กันพิษแม่มด/การโหวต/นายพรานไม่ได้', 'แม่มดได้ยาคืนถ้าชุบคนที่หมอกันไว้'],
};

export const bodyguard: RoleDef = {
  id: 'bodyguard', nameTh: 'ผู้คุ้มกัน', kind: 'normal',
  descriptionTh: 'ทุกคืนคุณเลือกคุ้มกันหนึ่งคน ถ้าเขาถูกโจมตี คุณจะตายแทน',
  startTeam: 'village', winWith: 'village',
  goalTh: 'เอาตัวเข้าแลกเพื่อปกป้องคนสำคัญ',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้าน',
  balanceScore: 3, nightSlot: 21, wakes: 'every-night',
  abilities: [{ kind: 'protect_bodyguard', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' }],
  priority: 21,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ไม่มี',
  interactions: ['หมอกันก่อน — ถ้าหมอกันแล้ว ผู้คุ้มกันไม่ต้องตาย', 'ตายแทนเฉพาะการกัดของหมาป่า (พิษไม่รวม)'],
};

export const witch: RoleDef = {
  id: 'witch', nameTh: 'แม่มด', kind: 'normal',
  descriptionTh: 'คุณมียาชุบชีวิต 1 ขวด และยาพิษ 1 ขวด ใช้ได้อย่างละครั้งทั้งเกม ทุกคืนคุณรู้ว่าหมาป่าเลือกใคร',
  startTeam: 'village', winWith: 'village',
  goalTh: 'ใช้ยาให้ถูกคนถูกเวลา',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้าน',
  balanceScore: 5, nightSlot: 50, wakes: 'every-night',
  abilities: [{ kind: 'witch', targets: 0, canTargetSelf: false, canTargetDead: false, uses: 2 }],
  priority: 50,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ยาที่เหลือหายไปด้วย',
  interactions: ['พิษหมอกันไม่ได้', 'ถ้าวางยาคู่รัก อีกคนตายตาม', 'ชุบคนที่หมอกันไว้แล้ว → ได้ยาคืน'],
  initRoleState: () => ({ heal: 1, poison: 1 }),
};

export const hunter: RoleDef = {
  id: 'hunter', nameTh: 'นายพราน', kind: 'normal',
  descriptionTh: 'เมื่อคุณตายด้วยเหตุใดก็ตาม คุณต้องยิงปืนนัดสุดท้ายใส่ผู้เล่นหนึ่งคนทันที',
  startTeam: 'village', winWith: 'village',
  goalTh: 'พาหมาป่าไปด้วยก่อนตาย',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้าน',
  balanceScore: 3, nightSlot: null, wakes: 'on-death', abilities: [], priority: 80,
  onBlocked: 'n/a', onTargetDeath: 'n/a',
  onActorDeath: 'ยิงผู้เล่น 1 คนทันที (1 ครั้ง) · ยิงนายพรานอีกคน = ยิงต่อ · ยิงคู่รัก = อีกคนตายตาม',
  interactions: ['ตายจากโหวต/ถูกกัด/พิษ/ตายตามคู่รัก ก็ยิงได้ทุกกรณี', 'หมดเวลา = สุ่ม (ตั้งค่าได้)'],
};

export const cupid: RoleDef = {
  id: 'cupid', nameTh: 'ผู้จับคู่รัก', kind: 'normal',
  descriptionTh: 'คืนแรกคุณเลือกผู้เล่นสองคนให้เป็นคู่รัก ถ้าคนหนึ่งตาย อีกคนจะตายตามด้วยความเศร้า',
  startTeam: 'village', winWith: 'village',
  goalTh: 'จับคู่และปกป้องคู่รัก',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้าน (และชนะเป็นคู่รักถ้าเหลือแค่สองคนนั้นในกรณีข้ามฝ่าย)',
  balanceScore: 0, nightSlot: 2, wakes: 'first-night',
  abilities: [{ kind: 'cupid_pair', targets: 2, canTargetSelf: true, canTargetDead: false, uses: 1 }],
  priority: 2,
  onBlocked: 'cancel-use-up', onTargetDeath: 'n/a',
  onActorDeath: 'คู่รักยังคงอยู่',
  interactions: ['คู่รักเห็นหน้ากันคืนแรก (ไม่รู้บท)', 'คนหนึ่งตาย อีกคนตายตามทุกกรณี'],
};

export const mason: RoleDef = {
  id: 'mason', nameTh: 'ช่างก่อสร้าง', kind: 'normal',
  descriptionTh: 'คืนแรกช่างก่อสร้างทุกคนตื่นพร้อมกันและรู้จักกัน (ไม่รู้บทอื่น)',
  startTeam: 'village', winWith: 'village',
  goalTh: 'ใช้ความไว้ใจกันเองเป็นแกนของฝ่ายหมู่บ้าน',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้าน',
  balanceScore: 3, nightSlot: 5, wakes: 'first-night', autoAck: true, abilities: [], priority: 5,
  onBlocked: 'n/a', onTargetDeath: 'n/a', onActorDeath: 'ไม่มี',
  interactions: ['ต้องมีอย่างน้อย 2 คน', 'เห็นเฉพาะช่างก่อสร้างด้วยกัน'],
};

export const tanner: RoleDef = {
  id: 'tanner', nameTh: 'คนฟอก', kind: 'neutral',
  descriptionTh: 'คุณอยากถูกโหวตประหาร! แกล้งทำตัวน่าสงสัยให้ชาวบ้านโหวตคุณออก แต่อย่าให้หมาป่าฆ่าคุณก่อน',
  startTeam: 'solo', winWith: 'self',
  goalTh: 'ทำให้ตัวเองถูกโหวตออกในช่วงกลางวัน',
  winTh: 'ถูกโหวตประหาร → ชนะและเกมจบทันที · แพ้ถ้าถูกหมาป่าฆ่าหรือเกมจบก่อน',
  balanceScore: 0, nightSlot: null, wakes: 'passive', abilities: [], priority: 0,
  onBlocked: 'n/a', onTargetDeath: 'n/a', onActorDeath: 'ถ้าตายจากการโหวต = ชนะ · ตายจากอย่างอื่น = แพ้',
  interactions: ['ผู้หยั่งรู้เห็นเป็น "ไม่ใช่หมาป่า"'],
};

export const mayor: RoleDef = {
  id: 'mayor', nameTh: 'ผู้ใหญ่บ้าน', kind: 'normal',
  descriptionTh: 'เสียงโหวตของคุณนับเป็น 2 คะแนน จะเปิดเผยตัวหรือไม่ก็ได้',
  startTeam: 'village', winWith: 'village',
  goalTh: 'ใช้คะแนนเสียงนำหมู่บ้าน',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้าน',
  balanceScore: 2, nightSlot: null, wakes: 'passive', abilities: [], priority: 0,
  onBlocked: 'n/a', onTargetDeath: 'n/a', onActorDeath: 'ไม่มี',
  interactions: ['โหวตนับ 2 คะแนน', 'ตัดสินเมื่อเสียงเสมอ (ถ้าตั้งค่า tieRule = mayor)'],
  voteWeight: 2,
};

export const pacifist: RoleDef = {
  id: 'pacifist', nameTh: 'ผู้รักสันติ', kind: 'normal',
  descriptionTh: 'คุณโหวตได้ แต่คะแนนของคุณไม่นับ — จะไม่ทำให้ใครถูกกำจัด',
  startTeam: 'village', winWith: 'village',
  goalTh: 'ใช้คำพูดแทนคะแนนเสียง',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้าน',
  balanceScore: 0, nightSlot: null, wakes: 'passive', abilities: [], priority: 0,
  onBlocked: 'n/a', onTargetDeath: 'n/a', onActorDeath: 'ไม่มี',
  interactions: ['คะแนนโหวตนับเป็น 0'],
  voteWeight: 0,
};

export const villageIdiot: RoleDef = {
  id: 'village_idiot', nameTh: 'คนโง่ประจำหมู่บ้าน', kind: 'normal',
  descriptionTh: 'ถ้าหมู่บ้านโหวตประหารคุณ คุณจะไม่ตาย แต่จะโหวตไม่ได้อีกตลอดเกม',
  startTeam: 'village', winWith: 'village',
  goalTh: 'รอดจากการโหวตและยังช่วยหมู่บ้านด้วยการพูด',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้าน',
  balanceScore: 0, nightSlot: null, wakes: 'passive', abilities: [], priority: 0,
  onBlocked: 'n/a', onTargetDeath: 'n/a', onActorDeath: 'ไม่มี',
  interactions: ['รอดได้จากการโหวตเท่านั้น (ถูกกัด/พิษ = ตายปกติ)', 'บทถูกเปิดเผยตอนรอด'],
  initRoleState: () => ({ survived: 0 }),
};

export const prince: RoleDef = {
  id: 'prince', nameTh: 'เจ้าชาย', kind: 'normal',
  descriptionTh: 'ถ้าถูกโหวตประหารครั้งแรก คุณจะไม่ตายและทุกคนจะรู้ว่าคุณคือเจ้าชาย',
  startTeam: 'village', winWith: 'village',
  goalTh: 'รอดจากการโหวตและนำหมู่บ้านต่อ',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้าน',
  balanceScore: 1, nightSlot: null, wakes: 'passive', abilities: [], priority: 0,
  onBlocked: 'n/a', onTargetDeath: 'n/a', onActorDeath: 'ไม่มี',
  interactions: ['รอดจากการโหวตครั้งแรก ยังโหวตได้', 'ถูกกัด/พิษ = ตายปกติ'],
  initRoleState: () => ({ survived: 0 }),
};

export const CORE_ROLES: RoleDef[] = [
  villager, werewolf, veilWolf, seer, doctor, bodyguard, witch, hunter, cupid, mason,
  tanner, mayor, pacifist, villageIdiot, prince,
];
