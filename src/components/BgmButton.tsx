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
      className="fixed bottom-20 right-4 z-[90] w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/10 bg-zinc-900/75 text-zinc-300 hover:text-white hover:bg-zinc-800/90 active:scale-90 transition-all"
      aria-label={playing ? 'หยุดเพลง' : 'เปิดเพลง'}
    >
      {playing ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="3" y="2" width="3.5" height="12" rx="1" />
          <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 2.5l10 5.5-10 5.5V2.5z" />
        </svg>
      )}
    </button>
  );
};
