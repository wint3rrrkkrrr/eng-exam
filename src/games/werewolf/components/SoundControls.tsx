import React, { useState } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';
import { isMusicMuted, isSoundMuted, playGameSound, setMusicMuted, setSoundMuted } from '../shared/sound';

const btn = 'min-w-12 min-h-12 rounded-xl flex items-center justify-center bg-black/30 hover:bg-black/50 text-slate-100 cursor-pointer';

/** ปุ่มเปิด/ปิดเพลงพื้นหลัง และเสียงเอฟเฟกต์ (แยกกัน จำไว้ในเครื่อง) */
export const SoundControls: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [sfxOff, setSfxOff] = useState<boolean>(() => isSoundMuted());
  const [musicOff, setMusicOff] = useState<boolean>(() => isMusicMuted());
  return (
    <div className={`flex gap-1.5 ${className}`}>
      <button
        onClick={() => { const next = !musicOff; setMusicOff(next); setMusicMuted(next); }}
        aria-label={musicOff ? 'เปิดเพลง' : 'ปิดเพลง'} aria-pressed={musicOff} className={`${btn} ${musicOff ? 'opacity-60' : ''}`}
      >
        <Music className="w-5 h-5" />{musicOff && <span className="absolute w-6 h-0.5 bg-red-400 rotate-45" aria-hidden />}
      </button>
      <button
        onClick={() => { const next = !sfxOff; setSfxOff(next); setSoundMuted(next); if (!next) playGameSound('confirm'); }}
        aria-label={sfxOff ? 'เปิดเสียงเอฟเฟกต์' : 'ปิดเสียงเอฟเฟกต์'} aria-pressed={sfxOff} className={btn}
      >
        {sfxOff ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </div>
  );
};
