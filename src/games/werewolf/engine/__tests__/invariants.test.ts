import { describe, expect, it } from 'vitest';
import { createGame } from '../state';
import { playBotGame } from '../bots';
import { hashSeed } from '../rng';
import { presetRoles } from '../presets';
import { getRole } from '../roles';

describe('invariants after bot games', () => {
  for (const n of [6, 8, 10, 15, 20, 30]) {
    it(`${n} players`, () => {
      const problems: string[] = [];
      for (let i = 0; i < 25; i++) {
        const seed = `inv-${n}-${i}`;
        const players = Array.from({ length: n }, (_, k) => ({ id: `p${k + 1}`, name: `P${k + 1}`, seat: k + 1 }));
        const { state } = createGame({ roomCode: 'INV01', players, roleIds: presetRoles(n), seed });
        const res = playBotGame(state!, hashSeed(seed + ':b'));
        const s = res.state;
        if (!res.finished) problems.push(`${seed}: not finished`);
        if (res.rejected.length) problems.push(`${seed}: rejected ${res.rejected[0]}`);
        for (const p of s.players) {
          const log = s.privateLog[p.id] ?? [];
          const died = log.filter((r) => r.kind === 'you_died');
          if (!p.alive && died.length !== 1) problems.push(`${seed}: ${p.id} dead but you_died x${died.length}`);
          if (p.alive && died.length) problems.push(`${seed}: ${p.id} alive but has you_died`);
          // team vs role consistency
          const def = getRole(p.roleId);
          if (p.team === 'wolf' && !['wolf'].includes(def.startTeam) && p.roleId !== 'werewolf') problems.push(`${seed}: ${p.id} team wolf role ${p.roleId}`);
          if (p.roleState.heal != null && ![0, 1].includes(Number(p.roleState.heal))) problems.push(`${seed}: heal=${p.roleState.heal}`);
          if (p.roleState.poison != null && ![0, 1].includes(Number(p.roleState.poison))) problems.push(`${seed}: poison=${p.roleState.poison}`);
          if (p.loverOf) {
            const l = s.players.find((x) => x.id === p.loverOf)!;
            if (l.loverOf !== p.id) problems.push(`${seed}: lover asym ${p.id}`);
            if (p.alive !== l.alive && s.winners && !s.winners.some((w) => w.team === 'lovers')) {
              // lovers must die together
              problems.push(`${seed}: lover ${p.id} alive=${p.alive} but partner alive=${l.alive}`);
            }
          }
        }
        if (s.night !== null) problems.push(`${seed}: night state leaked after game over`);
      }
      expect(problems).toEqual([]);
    });
  }
});
