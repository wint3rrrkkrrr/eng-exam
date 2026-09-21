import React, { useEffect, useState } from 'react';
import { bgmPlayer } from '../utils/bgmPlayer';

export const BgmButton: React.FC = () => {
  const [playing, setPlaying] = useState(bgmPlayer.isPlaying);

  useEffect(() => {
    return bgmPlayer.subscribe(() => setPlaying(bgmPlayer.isPlaying));
  }, []);

  return (
    <button
      onClick={() => bgmPlayer.toggle()}
      title={playing ? 'หยุดเพลง BGM' : 'เปิดเพลง BGM'}
      className={`fixed bottom-4 left-4 z-[90] flex items-center gap-1.5 px-3 py-2 rounded-full shadow-lg backdrop-blur-sm border active:scale-90 transition-all text-xs font-bold ${
        playing
          ? 'bg-amber-400/90 border-amber-300/50 text-zinc-950'
          : 'bg-zinc-800/90 border-zinc-600/50 text-zinc-300 hover:bg-zinc-700/90 hover:text-white'
      }`}
      aria-label={playing ? 'หยุดเพลง' : 'เปิดเพลง'}
    >
      {playing ? (
        <>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <rect x="3" y="2" width="3.5" height="12" rx="1" />
            <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
          </svg>
          <span>เพลง</span>
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2.5l10 5.5-10 5.5V2.5z" />
          </svg>
          <span>เพลง</span>
        </>
      )}
    </button>
  );
};
