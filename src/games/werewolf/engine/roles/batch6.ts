// engine/roles/batch6.ts — M6 แพ็กที่ 6: มือปืน + ฝ่ายอิสระกลุ่มแรก (ตัวตลก · คนโง่เจ้าเล่ห์ · ผู้ทำนายอนาคต · กระจกสะท้อน)
import type { RoleDef } from '../types';

export const gunner: RoleDef = {
  id: 'gunner', nameTh: 'มือปืน', kind: 'normal',
  descriptionTh: 'คุณมีกระสุน 2 นัด ใช้ยิงใครก็ได้ระหว่างช่วงอภิปรายตอนกลางวัน — ยิงแล้วทุกคนจะรู้ทันทีว่าคุณเป็นมือปืน',
  startTeam: 'village', winWith: 'village',
  goalTh: 'ใช้กระสุนทั้งสองนัดยิงหมาป่าให้ถูกตัวก่อนกระสุนหมด',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้านเมื่อหมาป่าและฝ่ายศัตรูถูกกำจัดหมด',
  balanceScore: 3, nightSlot: null, wakes: 'day', abilities: [], priority: 0,
  onBlocked: 'n/a', onTargetDeath: 'n/a', onActorDeath: 'กระสุนที่เหลือใช้ไม่ได้อีก',
  interactions: [
    'ยิงได้เฉพาะช่วงอภิปราย (ไม่ใช่กลางคืน) — กดยิงได้ทันทีไม่ต้องรอคิว',
    'ยิงแล้วเปิดเผยตัวเป็นมือปืนต่อทุกคนทันที',
    'หมอ/นักบวช/ผู้คุ้มกันกันกระสุนมือปืนไม่ได้ (ทะลุทุกการป้องกัน)',
    'หมดนัดแล้วไม่มีความสามารถเหลือ',
  ],
  initRoleState: () => ({ gunnerShots: 2 }),
};

export const jester: RoleDef = {
  id: 'jester', nameTh: 'ตัวตลก', kind: 'neutral',
  descriptionTh: 'คุณอยากถูกหมู่บ้านโหวตประหาร! ถ้าทำสำเร็จ คุณชนะทันที และดึงคนที่โหวตให้คุณ 1 คนตายตามไปด้วย',
  startTeam: 'solo', winWith: 'self',
  goalTh: 'ทำตัวน่าสงสัยให้มากที่สุดเพื่อให้หมู่บ้านโหวตคุณออก',
  winTh: 'ถูกโหวตประหาร → ชนะทันทีและจบเกม · ตายด้วยวิธีอื่น (ถูกกัด/พิษ/ยิง) = แพ้',
  balanceScore: 0, nightSlot: null, wakes: 'passive', abilities: [], priority: 0,
  onBlocked: 'n/a', onTargetDeath: 'n/a', onActorDeath: 'ไม่มี',
  interactions: [
    'ถูกโหวตประหารสำเร็จ → เกมจบทันที (ชนะเฉพาะตัวตลก) และสุ่มผู้โหวตให้เขา 1 คนตายตามไปด้วย',
    'ตายด้วยสาเหตุอื่น (กัด/พิษ/ยิง) = ไม่ชนะ และเกมเดินต่อตามปกติ',
    'ผู้หยั่งรู้เห็นเป็น "ไม่ใช่หมาป่า"',
  ],
};

export const fool: RoleDef = {
  id: 'fool', nameTh: 'คนโง่เจ้าเล่ห์', kind: 'neutral',
  descriptionTh: 'คุณต้องการให้หมู่บ้านเข้าใจผิดว่าคุณเป็นศัตรูแล้วโหวตคุณออก — ถ้าสำเร็จ คุณชนะเฉพาะตัว (เกมเดินต่อ)',
  startTeam: 'solo', winWith: 'self',
  goalTh: 'แกล้งทำตัวเหมือนหมาป่าหรือฝ่ายร้ายให้หมู่บ้านหลงโหวตออก',
  winTh: 'ถูกโหวตประหาร → ชนะเฉพาะตัว (ประกาศร่วมกับผู้ชนะหลักตอนจบเกม) · ถูกหมาป่าฆ่าหรือวิธีอื่น = ไม่ชนะ',
  balanceScore: 0, nightSlot: null, wakes: 'passive', abilities: [], priority: 0,
  onBlocked: 'n/a', onTargetDeath: 'n/a', onActorDeath: 'ไม่มี',
  interactions: [
    'ถูกโหวตประหารสำเร็จ = ชนะเฉพาะตัว แต่เกม**ไม่จบ** เดินต่อตามปกติ (ต่างจากตัวตลกที่เกมจบทันที)',
    'ตายด้วยสาเหตุอื่น (ถูกกัด/พิษ/ยิง) = ไม่ชนะ',
    'ผู้หยั่งรู้เห็นเป็น "ไม่ใช่หมาป่า"',
  ],
};

export const nostradamus: RoleDef = {
  id: 'nostradamus', nameTh: 'ผู้ทำนายอนาคต', kind: 'neutral',
  descriptionTh: 'คืนแรกคุณทายว่าฝ่ายไหนจะเป็นผู้ชนะหลักของเกมนี้ — ถ้าทายถูก คุณชนะร่วมไปด้วย (ไม่ว่าตัวคุณจะรอดหรือตาย)',
  startTeam: 'solo', winWith: 'self',
  goalTh: 'อ่านสถานการณ์เกมให้ออกว่าฝ่ายไหนจะชนะในที่สุด',
  winTh: 'ฝ่ายที่ทายไว้เป็นผู้ชนะหลักตอนจบเกม = ชนะร่วม (ไม่ต้องมีชีวิตรอด)',
  balanceScore: 0, nightSlot: 4, wakes: 'first-night',
  abilities: [{ kind: 'predict', targets: 0, canTargetSelf: false, canTargetDead: false, uses: 1 }],
  priority: 4,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'n/a', onActorDeath: 'คำทายยังมีผลแม้ตายแล้ว',
  interactions: [
    'ทายได้ครั้งเดียวตอนคืนแรก เลือกฝ่าย: หมู่บ้าน / หมาป่า / ฝ่ายอิสระ',
    'ไม่ต้องมีชีวิตรอดถึงตอนจบเกมก็ชนะได้ถ้าทายถูก',
    'ผลประกาศพร้อมผู้ชนะหลักตอนเกมจบ ไม่แย่งอันดับใคร',
  ],
};

export const mirror: RoleDef = {
  id: 'mirror', nameTh: 'กระจกสะท้อน', kind: 'neutral',
  descriptionTh: 'คุณไม่มีความสามารถ แต่ใครก็ตามที่ยิงหรือสืบสวนคุณในคืนนั้น จะได้รับผลสะท้อนกลับแทน — เป้าหมายคือรอดให้ถึงจบเกม',
  startTeam: 'solo', winWith: 'self',
  goalTh: 'นิ่งเฉยๆ อยู่รอดให้ถึงวันสุดท้ายของเกม',
  winTh: 'รอดชีวิตจนเกมจบ = ชนะร่วม ไม่ว่าฝ่ายใดจะเป็นผู้ชนะหลัก',
  balanceScore: 2, nightSlot: null, wakes: 'passive', abilities: [], priority: 0,
  onBlocked: 'n/a', onTargetDeath: 'n/a', onActorDeath: 'ไม่มี',
  interactions: [
    'ถูกผู้พิทักษ์ประชาชนยิง → กระสุนสะท้อนกลับไปโดนผู้ยิงแทน',
    'ถูกผู้หยั่งรู้/สายสืบสวนต่างๆ ตรวจ → ผู้ตรวจได้รับข้อความ "ผลถูกสะท้อน" ไม่ได้ข้อมูลอะไร',
    'ถูกหมาป่ากัดตายได้ตามปกติ (การกัดของฝูงไม่ถูกสะท้อน เพราะเป็นมติร่วมของทั้งฝูง ไม่ใช่คนเดียว) 🔸A28',
    'ถูกโหวตตายได้ตามปกติ — การสะท้อนมีผลเฉพาะความสามารถกลางคืนเท่านั้น',
  ],
};

export const BATCH6_ROLES: RoleDef[] = [gunner, jester, fool, nostradamus, mirror];
