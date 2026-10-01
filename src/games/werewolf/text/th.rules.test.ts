import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../engine';
import { HIDDEN_RULES, RULE_GROUPS, RULE_LABELS } from './th';
import { RULE_ENUMS, RULE_NUMBER_LIMITS, sanitizeRules } from '../shared/lobby';

describe('หน้าตั้งค่า: ทุกกติกาอยู่ในหมวดและมีคำอธิบาย', () => {
  const grouped = RULE_GROUPS.flatMap((g) => g.keys);
  it('ทุกค่าใน DEFAULT_SETTINGS แสดงในหน้าตั้งค่า (ยกเว้นที่ซ่อนไว้รอ M6) ไม่ซ้ำ ไม่ตกหล่น', () => {
    const shown = Object.keys(DEFAULT_SETTINGS).filter((k) => !HIDDEN_RULES.includes(k));
    expect([...grouped].sort()).toEqual([...shown].sort());
    expect(new Set(grouped).size).toBe(grouped.length);
  });
  it('ทุกกติกามีชื่อ+คำอธิบายภาษาไทย · แบบเลือกค่ามีคำอธิบายครบทุกตัวเลือก · แบบตัวเลขมีช่วง', () => {
    for (const k of grouped) {
      const meta = RULE_LABELS[k];
      expect(meta, k).toBeTruthy();
      expect(meta.label.length).toBeGreaterThan(3);
      expect(meta.help.length).toBeGreaterThan(5);
      const def = (DEFAULT_SETTINGS as unknown as Record<string, unknown>)[k];
      if (typeof def === 'string') {
        const values = (RULE_ENUMS as Record<string, readonly string[]>)[k];
        expect(values, k).toBeTruthy();
        for (const v of values) expect(meta.options?.[v], `${k}.${v}`).toBeTruthy();
        expect(values).toContain(def);
      }
      if (typeof def === 'number') {
        expect(RULE_NUMBER_LIMITS[k as keyof typeof RULE_NUMBER_LIMITS], k).toBeTruthy();
        expect(meta.min).toBeDefined();
        expect(meta.max).toBeDefined();
      }
    }
  });
  it('เซิร์ฟเวอร์รับค่าเฉพาะที่ถูกต้อง (ค่าแปลก → ทิ้ง · ตัวเลข → บีบเข้าช่วง)', () => {
    expect(sanitizeRules({ disconnectMode: 'bot', disconnectGraceSeconds: 9999 })).toEqual({ disconnectMode: 'bot', disconnectGraceSeconds: 300 });
    expect(sanitizeRules({ disconnectMode: 'x', tieRule: 'nope', maxNominees: 99 })).toEqual({ maxNominees: 5 });
  });
});
