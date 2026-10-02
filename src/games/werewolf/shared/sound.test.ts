import { describe, expect, it } from 'vitest';
import { TRACKS, musicForPhase } from './sound';

describe('เพลงพื้นหลัง', () => {
  it('ทุกเพลงมีโน้ตที่อ่านได้ และไม่ยาวเกินจำนวนสเต็ป', () => {
    for (const [name, t] of Object.entries(TRACKS)) {
      expect(t.voices.length, name).toBeGreaterThan(0);
      for (const v of t.voices) {
        const toks = v.notes.trim().split(/\s+/);
        expect(toks.length, name).toBeLessThanOrEqual(t.steps);
        for (const k of toks) expect(k === '.' || /^[A-G][#b]?\d$/.test(k), `${name}:${k}`).toBe(true);
      }
    }
  });
  it('กลางคืนกับกลางวันใช้เพลงต่างกัน', () => {
    expect(musicForPhase('night')).toBe('night');
    expect(musicForPhase('discussion')).toBe('day');
    expect(musicForPhase('morning')).toBe('day');
    expect(musicForPhase('vote')).toBe('vote');
    expect(musicForPhase('lobby')).toBe('lobby');
    expect(musicForPhase('game_over')).toBeNull();
  });
});
