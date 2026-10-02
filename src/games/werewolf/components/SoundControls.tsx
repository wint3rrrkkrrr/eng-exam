import React, { useEffect, useRef, useState } from 'react';
import { Settings2 } from 'lucide-react';
import { isMusicMuted, isSoundMuted, playGameSound, setMusicMuted, setSoundMuted } from '../shared/sound';
import {
  FONT_STEPS, buzz, canNotify, canVibrate, getFontScale, isNotifyOn, isVibrateOn, setFontScale, setNotifyOn, setVibrateOn,
} from '../shared/notify';
import type { FontStep } from '../shared/notify';

const btn = 'min-w-12 min-h-12 rounded-xl flex items-center justify-center bg-black/30 hover:bg-black/50 text-slate-100 cursor-pointer';

const Row: React.FC<{ label: string; hint?: string; on: boolean; onToggle: () => void }> = ({ label, hint, on, onToggle }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    onClick={onToggle}
    className="w-full min-h-12 flex items-center gap-3 px-3 rounded-xl hover:bg-white/5 text-left cursor-pointer"
  >
    <span className="flex-1">
      <span className="block text-sm font-bold text-slate-100">{label}</span>
      {hint && <span className="block text-[11px] text-slate-400">{hint}</span>}
    </span>
    <span className={`shrink-0 w-11 h-6 rounded-full p-0.5 transition-colors ${on ? 'bg-emerald-500' : 'bg-slate-600'}`} aria-hidden>
      <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${on ? 'translate-x-5' : ''}`} />
    </span>
    <span className="sr-only">{on ? 'เปิด' : 'ปิด'}</span>
  </button>
);

/** ปุ่มตั้งค่าเสียง/สั่น/แจ้งเตือน/ขนาดตัวอักษร (แผงเดียว จำค่าไว้ในเครื่อง) */
export const SoundControls: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [open, setOpen] = useState(false);
  const [musicOff, setMusicOff] = useState<boolean>(() => isMusicMuted());
  const [sfxOff, setSfxOff] = useState<boolean>(() => isSoundMuted());
  const [vib, setVib] = useState<boolean>(() => isVibrateOn());
  const [notif, setNotif] = useState<boolean>(() => isNotifyOn());
  const [font, setFont] = useState<FontStep>(() => getFontScale());
  const box = useRef<HTMLDivElement>(null);

  // ปิดแผงเมื่อแตะนอกแผง / กด Esc
  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [open]);

  return (
    <div ref={box} className={`relative ${className}`}>
      <button onClick={() => setOpen((v) => !v)} aria-label="ตั้งค่าเสียง การแจ้งเตือน และขนาดตัวอักษร" aria-expanded={open} className={btn}>
        <Settings2 className="w-5 h-5" />
      </button>
      {open && (
        <div role="dialog" aria-label="ตั้งค่า" className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl border border-slate-600 bg-slate-900/95 backdrop-blur p-2 shadow-2xl space-y-0.5">
          <Row label="🎵 เพลงพื้นหลัง" on={!musicOff} onToggle={() => { const next = !musicOff; setMusicOff(next); setMusicMuted(next); }} />
          <Row label="🔊 เสียงเอฟเฟกต์" on={!sfxOff} onToggle={() => { const next = !sfxOff; setSfxOff(next); setSoundMuted(next); if (!next) playGameSound('confirm'); }} />
          {canVibrate() && (
            <Row label="📳 สั่นเตือน" hint="ตอนตาย ถึงตาคุณ และใกล้หมดเวลา" on={vib} onToggle={() => { const next = !vib; setVib(next); setVibrateOn(next); if (next) buzz(80); }} />
          )}
          {canNotify() && (
            <Row
              label="🔔 แจ้งเตือนตอนสลับแท็บ"
              hint="เด้งเตือนเมื่อเปลี่ยนเฟสหรือถึงตาคุณ (ใช้ได้ตอนเปิดเว็บค้างไว้)"
              on={notif}
              onToggle={async () => { setNotif(await setNotifyOn(!notif)); }}
            />
          )}
          <div className="px-3 pt-2 pb-1">
            <div className="text-sm font-bold text-slate-100 mb-1.5">🔤 ขนาดตัวอักษร</div>
            <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="ขนาดตัวอักษร">
              {FONT_STEPS.map((s, i) => (
                <button
                  key={s}
                  role="radio"
                  aria-checked={font === s}
                  onClick={() => { setFont(s); setFontScale(s); }}
                  className={`min-h-11 rounded-xl font-black cursor-pointer ${font === s ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  style={{ fontSize: `${14 + i * 3}px` }}
                >
                  ก
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
