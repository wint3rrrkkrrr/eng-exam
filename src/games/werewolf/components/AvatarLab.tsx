// components/AvatarLab.tsx — หน้าสำหรับนักพัฒนา (เปิดด้วย ?avatarlab=1 ตอน npm run dev เท่านั้น): ดูของแต่งตัวพิเศษ/โทนสี/ลาย แบบเรียงกัน
import React from 'react';
import { AvatarArt, GraveArt } from './avatar/AvatarArt';
import { DEFAULT_AVATAR } from '../shared/avatar';
import type { AvatarConfig } from '../shared/avatar';
import { COLLECTIONS } from '../shared/collections';
import { AVATAR_ITEMS } from '../shared/avatar';
import { setItemIds } from '../shared/avatarExtra';

const setCfg = (set: 'winter' | 'nongfloat' | 'mos' | 'khowfang'): Partial<AvatarConfig> => ({
  outfit: `sp_${set}_outfit`, headwear: `sp_${set}_headwear`, eyewear: `sp_${set}_eyewear`, accessory: `sp_${set}_accessory`,
  effect: `sp_${set}_effect`, backdrop: `sp_${set}_backdrop`, grave: `sp_${set}_grave`,
});

export const AvatarLab: React.FC = () => {
  const sets = ['winter', 'nongfloat', 'mos', 'khowfang'] as const;
  const tones = ['dusk', 'emerald', 'noir', 'gold', 'neon', 'ice'];
  const rapLooks: Partial<AvatarConfig>[] = [
    { outfit: 'rap_outfit_hoodie', headwear: 'rap_headwear_snapback', eyewear: 'rap_eyewear_shades', accessory: 'rap_accessory_chain', mouth: 'rap_mouth_grill', effect: 'rap_effect_flash', backdrop: 'rap_backdrop_graffiti' },
    { outfit: 'rap_outfit_jersey', headwear: 'rap_headwear_durag', eyewear: 'rap_eyewear_goldmirror', accessory: 'rap_accessory_mic', mouth: 'rap_mouth_diamond', effect: 'rap_effect_beat', backdrop: 'rap_backdrop_studio' },
    { outfit: 'rap_outfit_puffer', headwear: 'rap_headwear_snapbackgold', eyewear: 'rap_eyewear_iced', accessory: 'rap_accessory_cuban', mouth: 'rap_mouth_diamond', effect: 'rap_effect_money', backdrop: 'rap_backdrop_stage' },
    { outfit: 'rap_outfit_track', headwear: 'rap_headwear_beanie', eyewear: 'rap_eyewear_shades', accessory: 'rap_accessory_boombox', mouth: 'rap_mouth_grill', effect: 'fx_none', backdrop: 'rap_backdrop_graffiti' },
    { outfit: 'rap_outfit_camo', headwear: 'rap_headwear_durag', eyewear: 'rap_eyewear_goldmirror', accessory: 'rap_accessory_chain', mouth: 'rap_mouth_grill', effect: 'rap_effect_beat', backdrop: 'rap_backdrop_stage' },
    { outfit: 'rap_outfit_bling', headwear: 'rap_headwear_snapback~gold', eyewear: 'rap_eyewear_iced', accessory: 'rap_accessory_cuban~neon', mouth: 'rap_mouth_diamond', effect: 'rap_effect_money', backdrop: 'rap_backdrop_studio' },
  ];
  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100 p-4 space-y-6">
      <h1 className="font-black">Avatar Lab</h1>
      {([['hairStyle', 'hair2_'], ['eyes', 'eyes2_'], ['mouth', 'mouth2_']] as const).map(([slot, p]) => (
        <section key={slot} className="space-y-2">
          <h2 className="text-sm font-bold">{slot} ใหม่</h2>
          <div className="grid grid-cols-8 gap-1">
            {AVATAR_ITEMS.filter((i) => i.id.startsWith(p)).map((i) => <div key={i.id} title={i.nameTh} className="aspect-square rounded-lg overflow-hidden bg-sky-200"><AvatarArt config={{ ...DEFAULT_AVATAR, [slot]: i.id, hairColor: slot === 'hairStyle' ? 'hc_pink' : DEFAULT_AVATAR.hairColor }} still className="w-full h-full" /></div>)}
          </div>
        </section>
      ))}
      <section className="space-y-2">
        <h2 className="text-sm font-bold">คอลเลกชันธีม</h2>
        <div className="grid grid-cols-6 gap-1.5">
          {COLLECTIONS.map((c, i) => <div key={c.id} className="aspect-[4/5] rounded-xl overflow-hidden"><AvatarArt config={{ ...DEFAULT_AVATAR, outfit: `col_${c.id}_outfit_${i % 2 ? 'b' : 'a'}`, headwear: `col_${c.id}_headwear_${i % 2 ? 'a' : 'b'}`, eyewear: `col_${c.id}_eyewear`, accessory: `col_${c.id}_accessory_${i % 2 ? 'b' : 'a'}`, effect: `col_${c.id}_effect`, backdrop: `col_${c.id}_backdrop` }} night={i % 3 === 2} className="w-full h-full" /></div>)}
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-bold">แรปเปอร์ 🎤</h2>
        <div className="grid grid-cols-6 gap-1.5">
          {rapLooks.map((l, i) => <div key={i} className="aspect-[4/5] rounded-xl overflow-hidden"><AvatarArt config={{ ...DEFAULT_AVATAR, ...l }} night={i % 2 === 1} className="w-full h-full" /></div>)}
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {['bling', 'puffer', 'camo', 'track'].map((o) => <div key={o} className="aspect-[4/5] rounded-xl overflow-hidden"><AvatarArt config={{ ...DEFAULT_AVATAR, outfit: `rap_outfit_${o}` }} still className="w-full h-full" /></div>)}
          <div className="aspect-[4/5] rounded-xl overflow-hidden"><GraveArt backdrop="rap_backdrop_studio" grave="rap_grave_boombox" role="seer" className="w-full h-full" /></div>
          <div className="aspect-[4/5] rounded-xl overflow-hidden"><GraveArt backdrop="rap_backdrop_stage" grave="rap_grave_vinyl" role="werewolf" night className="w-full h-full" /></div>
        </div>
      </section>
      {sets.map((s) => (
        <section key={s} className="space-y-2">
          <h2 className="text-sm font-bold">{s} ({setItemIds(s).length} ชิ้น)</h2>
          <div className="grid grid-cols-4 gap-2">
            <div className="aspect-[4/5] rounded-xl overflow-hidden"><AvatarArt config={{ ...DEFAULT_AVATAR, ...setCfg(s) }} night={false} className="w-full h-full" /></div>
            <div className="aspect-[4/5] rounded-xl overflow-hidden"><AvatarArt config={{ ...DEFAULT_AVATAR, ...setCfg(s) }} night className="w-full h-full" /></div>
            <div className="aspect-[4/5] rounded-xl overflow-hidden"><GraveArt backdrop={`sp_${s}_backdrop`} grave={`sp_${s}_grave`} role="seer" night={false} className="w-full h-full" /></div>
            <div className="aspect-[4/5] rounded-xl overflow-hidden"><GraveArt backdrop={`sp_${s}_backdrop`} grave={`sp_${s}_grave`} role="werewolf" night className="w-full h-full" /></div>
          </div>
        </section>
      ))}
      <section className="space-y-2">
        <h2 className="text-sm font-bold">โทนสี (หมวกทรงสูง/เสื้อฮู้ด/ฉากปราสาท)</h2>
        <div className="grid grid-cols-6 gap-2">
          {tones.map((t) => (
            <div key={t} className="aspect-[4/5] rounded-xl overflow-hidden"><AvatarArt config={{ ...DEFAULT_AVATAR, headwear: `hw_tophat~${t}`, outfit: `of_hoodie~${t}`, backdrop: `bg_castle~${t}`, effect: `fx_fire~${t}` }} className="w-full h-full" /></div>
          ))}
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-bold">เสื้อลาย</h2>
        <div className="grid grid-cols-8 gap-1.5">
          {['stripe', 'dots', 'stars', 'check', 'hearts', 'zigzag', 'camo', 'gradient'].map((p, i) => (
            <div key={p} className="aspect-[4/5] rounded-lg overflow-hidden"><AvatarArt config={{ ...DEFAULT_AVATAR, outfit: `of_pat_${p}_${['red', 'blue', 'pink', 'teal', 'gold', 'purple', 'green', 'orange'][i]}` }} still className="w-full h-full" /></div>
          ))}
        </div>
      </section>
    </div>
  );
};
