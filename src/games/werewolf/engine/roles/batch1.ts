// engine/roles/batch1.ts — M6 แพ็กที่ 1: ผู้หยุดความสามารถ (ขัดขวางคืนนั้น) + หญิงชรา (ห้ามโหวตวันถัดไป)
import type { RoleDef } from '../types';

export const roleblocker: RoleDef = {
  id: 'roleblocker', nameTh: 'ผู้หยุดความสามารถ', kind: 'normal',
  descriptionTh: 'ทุกคืนคุณเลือก 1 คน แล้วความสามารถของเขาคืนนั้นจะใช้ไม่ได้ (หยุดผู้หยั่งรู้ หมอ แม่มด หรือแม้แต่การกัดของหมาป่าได้)',
  startTeam: 'village', winWith: 'village',
  goalTh: 'หยุดบทสำคัญของฝ่ายศัตรู หรือป้องกันไม่ให้คนที่เราสงสัยเล่นงานหมู่บ้าน',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้านเมื่อหมาป่าและฝ่ายศัตรูถูกกำจัดหมด',
  balanceScore: 4, nightSlot: 10, wakes: 'every-night',
  abilities: [{ kind: 'block', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' }],
  priority: 10,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ความสามารถกลางคืนหยุด',
  interactions: [
    'ทำงานก่อนทุกบท (ช่อง 10): ผู้ถูกหยุดจะส่งคำสั่งได้ตามปกติแต่คำสั่งนั้นถูกยกเลิก และไม่เสียจำนวนครั้งที่ใช้ได้',
    'หมาป่าที่ถูกหยุดจะไม่ได้ร่วมเลือกเหยื่อคืนนั้น (ตัวอื่นในฝูงที่ไม่ถูกหยุดยังกัดได้)',
    'ผู้ถูกหยุดจะได้รับแจ้งว่า "ความสามารถถูกขัดขวาง" (ปิดแจ้งเตือนได้ในตั้งค่า) — ไม่บอกว่าใครทำ',
    'ถ้าผู้หยุดความสามารถถูกหยุดเอง คืนนั้นเขาหยุดใครไม่ได้',
    'หยุดหญิงชราได้ → คืนนั้นหญิงชราห้ามโหวตใครไม่ได้',
  ],
};

export const oldHag: RoleDef = {
  id: 'old_hag', nameTh: 'หญิงชรา', kind: 'normal',
  descriptionTh: 'ทุกคืนคุณเลือก 1 คน ให้เขา "ห้ามโหวต" ในวันถัดไป (ยังพูดและถูกโหวตได้) — ใช้ปิดปากคนที่อาจเป็นหมาป่าในช่วงโหวตสำคัญ',
  startTeam: 'village', winWith: 'village',
  goalTh: 'ลดพลังโหวตของคนที่น่าสงสัย และช่วยให้หมู่บ้านจับหมาป่าได้',
  winTh: 'ชนะพร้อมฝ่ายหมู่บ้านเมื่อหมาป่าและฝ่ายศัตรูถูกกำจัดหมด · แพ้เมื่อหมู่บ้านแพ้',
  balanceScore: 3, nightSlot: 12, wakes: 'every-night',
  abilities: [{ kind: 'hag_curse', targets: 1, canTargetSelf: false, canTargetDead: false, uses: 'unlimited' }],
  priority: 12,
  onBlocked: 'cancel-keep-uses', onTargetDeath: 'fizzle-keep-uses',
  onActorDeath: 'ความสามารถกลางคืนหยุด · ผู้ที่ถูกห้ามโหวตไปแล้วในคืนนั้นยังคงห้ามตลอดวันถัดไป',
  interactions: [
    'ผู้ถูกห้ามโหวตยังเสนอชื่อ พูด และถูกโหวตได้ตามปกติ · ผู้ถูกห้ามจะได้รับแจ้งเมื่อเริ่มวัน',
    'ผู้หยุดความสามารถหยุดหญิงชราได้ (ทำงานก่อนช่อง 12) — คืนนั้นไม่มีใครถูกห้ามโหวต',
    'ห้ามโหวตมีผลเฉพาะวันถัดไปวันเดียว (คืนถัดไปเลือกใหม่ได้)',
    'คนโง่ประจำหมู่บ้านที่เสียสิทธิ์โหวตถาวรแล้ว ไม่ได้สิทธิ์คืนเมื่อพ้นวัน',
  ],
};

export const BATCH1_ROLES: RoleDef[] = [roleblocker, oldHag];
