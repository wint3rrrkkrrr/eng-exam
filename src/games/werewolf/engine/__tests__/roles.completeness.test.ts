// บังคับกฎ "ห้ามบทกำกวม" (กติกาเจ้าของเว็บข้อ 22): ทุกบทต้องมีครบทุกฟิลด์ + เงื่อนไขชนะ
import { describe, expect, it } from 'vitest';
import { ROLE_LIST, ROLES } from '../roles';

const STRING_FIELDS = ['id', 'nameTh', 'descriptionTh', 'goalTh', 'winTh', 'onActorDeath'] as const;

describe('ทะเบียนบท', () => {
  it('มีบทครบ 54 บท (แพ็กหลัก 14 + หมาป่าผู้บดบัง + แพ็ก M6 #1–#9 อีก 37 + นักเลียนแบบ/ผู้ควบคุมเวลา) และไม่มี id ซ้ำ', () => {
    expect(ROLE_LIST).toHaveLength(54);
    expect(new Set(ROLE_LIST.map((r) => r.id)).size).toBe(ROLE_LIST.length);
    for (const r of ROLE_LIST) expect(ROLES[r.id]).toBe(r);
  });

  for (const role of ROLE_LIST) {
    describe(`${role.nameTh} (${role.id})`, () => {
      it('ฟิลด์ข้อความทุกช่องไม่ว่าง', () => {
        for (const f of STRING_FIELDS) {
          expect(typeof role[f], `${role.id}.${f}`).toBe('string');
          expect((role[f] as string).trim().length, `${role.id}.${f} ว่าง`).toBeGreaterThan(0);
        }
      });

      it('มีเงื่อนไขชนะที่ตอบได้ว่า "ถ้าเกมจบตอนนี้ ชนะหรือแพ้"', () => {
        expect(role.winTh.trim().length).toBeGreaterThan(5);
        expect(['village', 'wolf', 'vampire', 'cult', 'self', 'follow']).toContain(role.winWith);
        expect(['village', 'wolf', 'vampire', 'cult', 'solo']).toContain(role.startTeam);
      });

      it('ช่วงเวลาทำงาน/ช่องตื่นสอดคล้องกัน', () => {
        const night = role.wakes === 'every-night' || role.wakes === 'first-night';
        if (night) expect(role.nightSlot, 'บทที่ตื่นกลางคืนต้องมีช่อง').not.toBeNull();
        else expect(role.nightSlot, 'บทที่ไม่ตื่นต้องไม่มีช่อง').toBeNull();
        if (night && !role.autoAck) expect(role.abilities.length, 'บทตื่นที่ต้องเลือกต้องมีความสามารถ').toBeGreaterThan(0);
      });

      it('ระบุผลเมื่อถูกขัด/เมื่อเป้าหมายตาย/ปฏิสัมพันธ์ครบ', () => {
        expect(['cancel-keep-uses', 'cancel-use-up', 'n/a']).toContain(role.onBlocked);
        expect(['fizzle-keep-uses', 'fizzle-use-up', 'n/a']).toContain(role.onTargetDeath);
        expect(Array.isArray(role.interactions)).toBe(true);
        expect(role.interactions.length).toBeGreaterThan(0);
        if (role.abilities.length > 0) {
          expect(role.onBlocked, 'บทที่มีความสามารถต้องระบุผลเมื่อถูกขัด').not.toBe('n/a');
        }
      });

      it('คะแนนสมดุลเป็นตัวเลข และ priority ไม่ติดลบ', () => {
        expect(Number.isFinite(role.balanceScore)).toBe(true);
        expect(role.priority).toBeGreaterThanOrEqual(0);
      });
    });
  }
});
