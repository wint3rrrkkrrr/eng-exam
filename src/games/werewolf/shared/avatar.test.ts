import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AVATAR_ITEMS, DEFAULT_AVATAR, FREE_ITEM_IDS, ITEM_BY_ID, SLOTS, STARTING_COINS, randomFreeAvatar, sanitizeAvatar } from './avatar';
import { VARIANTS, VARIANT_SLOTS } from './avatarExtra';
import { COLLECTIONS } from './collections';
import { isSpecialId } from '../components/avatar/layersSpecial';
import type { AvatarSlot } from './avatar';
import { AvatarArt, GraveArt } from '../components/avatar/AvatarArt';
import { BACKDROP_IDS } from '../components/avatar/layersBackdrop';
import { RoleIcon } from '../components/avatar/RoleIcon';
import { ROLES } from '../engine';

const art = (cfg: Record<string, string>, night = false) => renderToStaticMarkup(React.createElement(AvatarArt, { config: cfg, night, still: true }));
const strip = (s: string) => s.replace(/(?:id|url\(#|href="#)[^"\s)]*/g, '');

describe('แคตตาล็อกอวตาร', () => {
  it('เหรียญเริ่มต้น 5000', () => expect(STARTING_COINS).toBe(5000));
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
    expect(AVATAR_ITEMS.length).toBeGreaterThan(3500); // ของเดิม + เสื้อลาย + แรปเปอร์ + เซ็ตพิเศษ + โทนสีของทุกชิ้น
  });
  it('อวตารสุ่ม/ของฟรีไม่เคยมีของเซ็ตพิเศษ (ได้จากโค้ดเท่านั้น)', () => {
    expect(FREE_ITEM_IDS.some((id) => id.startsWith('sp_'))).toBe(false);
    for (let i = 0; i < 200; i++) for (const id of Object.values(randomFreeAvatar(`seed${i}`))) expect(ITEM_BY_ID[id].exclusive, id).toBeUndefined();
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

  it('ทุกชิ้น (ยกเว้นค่าว่าง/ค่าเริ่มต้น/โทนสี) วาดผลต่างจากภาพเริ่มต้น = ไม่ตกไป default เงียบๆ', () => {
    const missing: string[] = [];
    const base = strip(baseline.get('skin')!);
    for (const item of AVATAR_ITEMS) {
      if (item.id.includes('~')) continue; // โทนสีตรวจแยกด้านล่าง
      if (item.slot === 'grave' || item.slot === 'backdrop') continue;
      if (DEFAULT_AVATAR[item.slot] === item.id || /_none$/.test(item.id)) continue;
      if (strip(art({ [item.slot]: item.id })) === base) missing.push(item.id);
    }
    expect(missing).toEqual([]);
  }, 60_000);
  it('โทนสีทุกแบบ × ทุกช่องที่คูณได้: ใส่ฟิลเตอร์จริงและต่างจากต้นฉบับ', () => {
    const sample: Record<string, string> = { outfit: 'of_hoodie', headwear: 'hw_tophat', eyewear: 'ew_round', accessory: 'ac_scarf', effect: 'fx_fire', backdrop: 'bg_castle', grave: 'gr_cross' };
    for (const slot of VARIANT_SLOTS) {
      const base = sample[slot];
      expect(ITEM_BY_ID[base], base).toBeDefined();
      for (const v of VARIANTS) {
        const id = `${base}~${v.key}`;
        expect(ITEM_BY_ID[id]?.slot, id).toBe(slot);
        const svg = slot === 'grave'
          ? renderToStaticMarkup(React.createElement(GraveArt, { grave: id, role: 'seer', still: true }))
          : art({ [slot]: id });
        expect(svg, id).toContain('filter=');
        const plain = slot === 'grave'
          ? renderToStaticMarkup(React.createElement(GraveArt, { grave: base, role: 'seer', still: true }))
          : art({ [slot]: base });
        expect(strip(svg), id).not.toBe(strip(plain));
      }
    }
  });
  it('เสื้อลายทุกลาย × ทุกสี และของเซ็ตพิเศษทุกชิ้น วาดได้ (ไม่ตกไป default)', () => {
    const base = strip(baseline.get('skin')!);
    for (const item of AVATAR_ITEMS.filter((i) => i.id.startsWith('of_pat_') || i.exclusive)) {
      if (item.slot === 'grave' || item.slot === 'backdrop') continue;
      expect(strip(art({ [item.slot]: item.id })), item.id).not.toBe(base);
    }
  });
  it('ฉากหลังทุกธีมมีทั้งกลางวัน/กลางคืน และต่างกัน', () => {
    for (const item of AVATAR_ITEMS.filter((i) => i.slot === 'backdrop' && !i.id.includes('~'))) {
      if (!isSpecialId(item.id)) expect(BACKDROP_IDS, item.id).toContain(item.id);
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

describe('คอลเลกชันธีม', () => {
  it('ทุกคอลเลกชัน 10 ชิ้น วาดได้และต่างจากค่าเริ่มต้น (รวมฉากหลัง/หลุมศพ ทั้งกลางวัน-คืน)', () => {
    const base = strip(art({}));
    const baseGrave = strip(renderToStaticMarkup(React.createElement(GraveArt, { grave: 'gr_cross', role: 'seer', still: true })));
    const items = AVATAR_ITEMS.filter((i) => i.id.startsWith('col_') && !i.id.includes('~'));
    expect(items.length).toBe(COLLECTIONS.length * 10);
    for (const item of items) {
      if (item.slot === 'grave') {
        expect(strip(renderToStaticMarkup(React.createElement(GraveArt, { grave: item.id, role: 'seer', still: true }))), item.id).not.toBe(baseGrave);
      } else {
        expect(strip(art({ [item.slot]: item.id })), item.id).not.toBe(base);
        if (item.slot === 'backdrop') expect(strip(art({ backdrop: item.id }, true)), item.id).not.toBe(strip(art({ backdrop: item.id })));
      }
      expect(isSpecialId(item.id)).toBe(true);
      expect(ITEM_BY_ID[item.id + '~' + VARIANTS[0].key]?.slot).toBe(item.slot);
    }
  });
});
