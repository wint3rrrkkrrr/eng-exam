import React, { useEffect, useRef, useState } from 'react';
import { bgmPlayer } from '../utils/bgmPlayer';

export const BgmButton: React.FC = () => {
  const [playing, setPlaying] = useState(bgmPlayer.isPlaying);
  const [volume, setVolume] = useState(bgmPlayer.volume);
  const [muted, setMuted] = useState(bgmPlayer.muted);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return bgmPlayer.subscribe(() => {
      setPlaying(bgmPlayer.isPlaying);
      setVolume(bgmPlayer.volume);
      setMuted(bgmPlayer.muted);
    });
  }, []);

  // close panel when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const volPct = Math.round((muted ? 0 : volume) * 100);

  return (
    <div ref={ref} className="fixed bottom-4 left-4 z-[90] flex flex-col items-start gap-1.5">
      {/* Expanded panel */}
      {open && (
        <div className="bg-zinc-900/95 border border-zinc-700 rounded-2xl shadow-xl p-3 flex flex-col gap-2.5 w-44 backdrop-blur-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">🎵 BGM เพลงประกอบ</p>

          {/* Play / Pause */}
          <button
            onClick={() => bgmPlayer.toggle()}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-xs transition active:scale-95 ${
              playing ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
            }`}
          >
            {playing ? (
              <>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="3" y="2" width="3.5" height="12" rx="1" />
                  <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
                </svg>
                หยุดชั่วคราว
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 2.5l10 5.5-10 5.5V2.5z" />
                </svg>
                เล่นเพลง
              </>
            )}
          </button>

          {/* Volume row */}
          <div className="flex items-center gap-1.5">
            {/* Mute toggle */}
            <button
              onClick={() => bgmPlayer.toggleMute()}
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              title={muted ? 'เปิดเสียง' : 'ปิดเสียง'}
            >
              {muted || volume === 0 ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <line x1="23" y1="9" x2="17" y2="15"/>
                  <line x1="17" y1="9" x2="23" y2="15"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
              )}
            </button>

            {/* Volume slider */}
            <input
              type="range"
              min={0}
              max={100}
              value={volPct}
              onChange={(e) => {
                const v = parseInt(e.target.value) / 100;
                bgmPlayer.setVolume(v);
                if (muted && v > 0) bgmPlayer.toggleMute();
              }}
              className="flex-1 h-1.5 accent-amber-400 cursor-pointer"
            />
            <span className="text-[10px] font-bold text-zinc-400 w-6 text-right shrink-0">{volPct}%</span>
          </div>
        </div>
      )}

      {/* Main toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full shadow-lg backdrop-blur-sm border active:scale-90 transition-all text-xs font-bold ${
          playing
            ? 'bg-amber-400/90 border-amber-300/50 text-zinc-950'
            : 'bg-zinc-800/90 border-zinc-600/50 text-zinc-300 hover:bg-zinc-700/90 hover:text-white'
        }`}
        aria-label={playing ? 'หยุดเพลง' : 'เปิดเพลง'}
      >
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <rect x="3" y="2" width="3.5" height="12" rx="1" />
            <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2.5l10 5.5-10 5.5V2.5z" />
          </svg>
        )}
        <span>เพลง</span>
        <svg width="8" height="8" viewBox="0 0 10 6" fill="currentColor" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M0 5l5-5 5 5H0z"/>
        </svg>
      </button>
    </div>
  );
};
