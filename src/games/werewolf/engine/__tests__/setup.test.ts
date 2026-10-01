// ตรวจชุดบทก่อนเริ่มเกม · ตัวช่วยสมดุล · ความแน่นอนของการสุ่ม (determinism)
import { describe, expect, it } from 'vitest';
import { validateSetup } from '../settings';
import { analyzeBalance } from '../balance';
import { createGame } from '../state';
import { hashSeed } from '../rng';
import { playBotGame } from '../bots';
import { presetRoles } from './sim';

const players = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}`, name: `ผู้เล่น${i + 1}`, seat: i + 1 }));
const errs = (roles: string[], n = roles.length) =>
  validateSetup(roles, n).filter((i) => i.level === 'error').map((i) => i.messageTh);

describe('ตรวจก่อนเริ่มเกม', () => {
  it('จำนวนบทไม่เท่าจำนวนผู้เล่น → ห้ามเริ่ม', () => {
    expect(errs(presetRoles(8), 9).join(' ')).toContain('ไม่เท่ากับจำนวนผู้เล่น');
  });
  it('ช่างก่อสร้างต้องมีอย่างน้อย 2 คน', () => {
    expect(errs(['werewolf', 'mason', 'villager', 'villager', 'villager']).join(' ')).toContain('ช่างก่อสร้าง');
  });
  it('ต้องมีหมาป่าอย่างน้อย 1 และน้อยกว่าครึ่ง', () => {
    expect(errs(['villager', 'villager', 'villager', 'villager', 'villager']).join(' ')).toContain('ฝ่ายหมาป่า แวมไพร์ หรือลัทธิ อย่างน้อย');
    expect(errs(['werewolf', 'werewolf', 'werewolf', 'villager', 'villager']).join(' ')).toContain('น้อยกว่าครึ่ง');
  });
  it('บทที่ไม่รู้จัก · ผู้เล่นน้อย/มากเกินไป', () => {
    expect(errs(['werewolf', 'ghost', 'villager', 'villager', 'villager']).join(' ')).toContain('ไม่รู้จักบท');
    expect(errs(['werewolf', 'villager', 'villager', 'villager']).join(' ')).toContain('อย่างน้อย 5');
  });
  it('createGame ปฏิเสธชุดที่ผิดและไม่สร้างสถานะ', () => {
    const r = createGame({ roomCode: 'X', players: players(5), roleIds: ['villager', 'villager', 'villager', 'villager', 'villager'], seed: 's' });
    expect(r.state).toBeNull();
    expect(r.errors.length).toBeGreaterThan(0);
  });
});

describe('ตัวช่วยสมดุล', () => {
  it('ชุด 8 คนมาตรฐาน: หมาป่า 2 · ไม่มีคำเตือน', () => {
    const r = analyzeBalance(presetRoles(8));
    expect(r.wolfTeamCount).toBe(2);
    expect(r.recommendedWolves).toBe(2);
    expect(r.warningsTh).toEqual([]);
  });
  it('เปรียบหมาป่ามาก/ชาวบ้านมาก → เตือนภาษาไทย (ไม่ห้าม)', () => {
    const wolfHeavy = analyzeBalance(['werewolf', 'werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager']);
    expect(wolfHeavy.warningsTh.join(' ')).toContain('หมาป่าเปรียบได้มาก');
    const villageHeavy = analyzeBalance(['werewolf', 'seer', 'doctor', 'witch', 'bodyguard', 'hunter', 'villager', 'villager']);
    expect(villageHeavy.warningsTh.join(' ')).toContain('ชาวบ้านเปรียบได้มาก');
  });
});

describe('determinism — seed เดิมได้ผลเดิม', () => {
  const make = (seed: string) =>
    createGame({ roomCode: 'D', players: players(15), roleIds: presetRoles(15), seed }).state!;

  it('seed เดียวกัน → แจกบทเหมือนกัน · seed ต่างกัน → ต่างกัน', () => {
    const a = make('alpha').players.map((p) => p.roleId).join(',');
    expect(make('alpha').players.map((p) => p.roleId).join(',')).toBe(a);
    expect(make('beta').players.map((p) => p.roleId).join(',')).not.toBe(a);
  });

  it('บอทเล่น seed เดียวกัน → ผลทั้งเกมเหมือนกันทุกประการ', () => {
    const run = () => playBotGame(make('gamma'), hashSeed('gamma:bots'));
    const r1 = run();
    const r2 = run();
    expect(JSON.stringify(r2.state)).toBe(JSON.stringify(r1.state));
    expect(r1.finished).toBe(true);
  });

  it('การแจกบทกระจายทุกบทให้ผู้เล่นทุกคนครบพอดี (ไม่หาย ไม่ซ้ำ)', () => {
    const s = make('delta');
    expect(s.players.map((p) => p.roleId).sort()).toEqual(presetRoles(15).slice().sort());
  });
});
