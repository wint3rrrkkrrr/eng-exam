import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AVATAR_ITEMS, DEFAULT_AVATAR, ITEM_BY_ID, SLOTS, STARTING_COINS, randomFreeAvatar, sanitizeAvatar } from './avatar';
import type { AvatarSlot } from './avatar';
import { AvatarArt, GraveArt } from '../components/avatar/AvatarArt';
import { BACKDROP_IDS } from '../components/avatar/layersBackdrop';
import { RoleIcon } from '../components/avatar/RoleIcon';
import { ROLES } from '../engine';

const art = (cfg: Record<string, string>, night = false) => renderToStaticMarkup(React.createElement(AvatarArt, { config: cfg, night, still: true }));
const strip = (s: string) => s.replace(/(?:id|url\(#|href="#)[^"\s)]*/g, '');

describe('แคตตาล็อกอวตาร', () => {
  it('เหรียญเริ่มต้น 100', () => expect(STARTING_COINS).toBe(100));
  it('ไม่มีช่องป้ายมุม (badge) แล้ว · มีช่องเอฟเฟกต์และหลุมศพ', () => {
    expect(Object.keys(DEFAULT_AVATAR)).not.toContain('badge');
    expect(SLOTS.map((s) => s.slot)).toEqual(expect.arrayContaining(['effect', 'grave']));
    expect(AVATAR_ITEMS.some((i) => i.id.startsWith('bd_'))).toBe(false);
  });
  it('id ไม่ซ้ำ · ค่าเริ่มต้นฟรี · ทุกช่องมีของ', () => {
    expect(new Set(AVATAR_ITEMS.map((i) => i.id)).size).toBe(AVATAR_ITEMS.length);
    for (const slot of Object.keys(DEFAULT_AVATAR) as AvatarSlot[]) {
      expect(ITEM_BY_ID[DEFAULT_AVATAR[slot]]?.slot).toBe(slot);
      expect(ITEM_BY_ID[DEFAULT_AVATAR[slot]].price).toBe(0);
    }
    expect(AVATAR_ITEMS.length).toBeGreaterThan(280);
  });
  it('sanitize: ของไม่มี/ของข้ามช่อง → ค่าเริ่มต้น · สุ่มฟรีใช้ได้', () => {
    expect(sanitizeAvatar({ ...DEFAULT_AVATAR, headwear: 'hw_crown', badge: 'bd_star' }, []).headwear).toBe('hw_none');
    const r = randomFreeAvatar('x');
    for (const id of Object.values(r)) expect(ITEM_BY_ID[id].price).toBe(0);
  });
});

describe('ตัววาดอวตารครบทุกชิ้น', () => {
  const baseline = new Map<AvatarSlot, string>();
  for (const slot of Object.keys(DEFAULT_AVATAR) as AvatarSlot[]) baseline.set(slot, art({}));

  it('ทุกชิ้น (ยกเว้นค่าว่าง/ค่าเริ่มต้น) วาดผลต่างจากภาพเริ่มต้น = ไม่ตกไป default เงียบๆ', () => {
    const missing: string[] = [];
    const base = strip(baseline.get('skin')!);
    for (const item of AVATAR_ITEMS) {
      if (item.slot === 'grave' || item.slot === 'backdrop') continue;
      if (DEFAULT_AVATAR[item.slot] === item.id || /_none$/.test(item.id)) continue;
      if (strip(art({ [item.slot]: item.id })) === base) missing.push(item.id);
    }
    expect(missing).toEqual([]);
  });
  it('ฉากหลังทุกธีมมีทั้งกลางวัน/กลางคืน และต่างกัน', () => {
    for (const item of AVATAR_ITEMS.filter((i) => i.slot === 'backdrop')) {
      expect(BACKDROP_IDS, item.id).toContain(item.id);
      expect(strip(art({ backdrop: item.id }, false)), item.id).not.toBe(strip(art({ backdrop: item.id }, true)));
    }
  });
  it('หลุมศพทุกแบบวาดต่างกัน + ถือไอคอนบทที่เฉลย', () => {
    const seen = new Set<string>();
    for (const item of AVATAR_ITEMS.filter((i) => i.slot === 'grave')) {
      const svg = strip(renderToStaticMarkup(React.createElement(GraveArt, { grave: item.id, role: 'seer', still: true })));
      expect(seen.has(svg), item.id).toBe(false);
      seen.add(svg);
    }
    const noRole = renderToStaticMarkup(React.createElement(GraveArt, { grave: 'gr_stone', still: true }));
    const withRole = renderToStaticMarkup(React.createElement(GraveArt, { grave: 'gr_stone', role: 'werewolf', still: true }));
    expect(noRole).not.toBe(withRole);
  });
  it('ทุกบทมีไอคอน SVG ของตัวเอง (ไม่ซ้ำ ไม่ใช่ไอคอน ?)', () => {
    const unknown = renderToStaticMarkup(React.createElement(RoleIcon, { id: 'zzz' }));
    const seen = new Set<string>();
    for (const id of Object.keys(ROLES)) {
      const svg = renderToStaticMarkup(React.createElement(RoleIcon, { id }));
      expect(svg, id).not.toBe(unknown);
      expect(seen.has(svg), id).toBe(false);
      seen.add(svg);
    }
  });
});
