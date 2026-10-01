import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { GAME_UI, UI } from '../text/th';
import { api } from '../net/werewolfClient';
import type { Session } from '../net/werewolfClient';
import type { MyViewResponse } from '../shared/api';
import { currentGameEvents, formatEvent } from './eventLog';

interface Props {
  view: MyViewResponse;
  session: Session;
  refresh: () => Promise<void>;
}

interface FeedItem {
  key: string;
  at: number;
  kind: 'system' | 'chat';
  seat?: number;
  name?: string;
  text: string;
  mine?: boolean;
}

// ฟีดแชท: ประกาศของระบบ (สีชมพู) รวมกับข้อความผู้เล่น ("7 busay: 16ดี") เรียงตามเวลา — เหมือนหน้าจอเกมตัวอย่าง
// แท็บช่องลับ (หมาป่า/คู่รัก/ผู้ตาย) แสดงเฉพาะข้อความของช่องนั้น · เซิร์ฟเวอร์ตัดสินสิทธิ์ทั้งอ่านและเขียน
export const GameChatPanel: React.FC<Props> = ({ view, session, refresh }) => {
  const channels = ['public', ...view.canWrite.channels];
  const [tab, setTab] = useState<string>('public');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const active = channels.includes(tab) ? tab : 'public';
  const seatOf = (id: string) => view.players.find((p) => p.playerId === id)?.seat;
  const nameOf = (id: string) => view.players.find((p) => p.playerId === id)?.displayName ?? '?';

  const feed: FeedItem[] = useMemo(() => {
    const chatLines = (active === 'public' ? view.chat.public : view.chat.private[active] ?? []).map((l): FeedItem => ({
      key: `c${l.id}`, at: Date.parse(l.createdAt), kind: 'chat', seat: seatOf(l.playerId), name: l.displayName, text: l.text, mine: l.playerId === view.me.playerId,
    }));
    if (active !== 'public') return chatLines;
    const system = currentGameEvents(view.log).flatMap((e) =>
      formatEvent(e, { nameOf }).map((t, i): FeedItem => ({ key: `e${e.id}-${i}`, at: Date.parse(e.at), kind: 'system', text: t })),
    );
    return [...chatLines, ...system].sort((a, b) => a.at - b.at);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.chat, view.log, view.players, active]);

  const game = view.game;
  let closedReason: string | null = null;
  if (active === 'public' && !view.canWrite.public) {
    if (view.spectator) closedReason = GAME_UI.chat.closedSpectator;
    else if (view.lobby.chatMode === 'voice') closedReason = GAME_UI.chat.closedVoice;
    else if (game && !game.me.isAlive) closedReason = GAME_UI.chat.closedDead;
    else if (view.phase === 'night' || view.phase === 'role_reveal') closedReason = GAME_UI.chat.closedNight;
    else closedReason = GAME_UI.chat.closedPhase;
  }

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'nearest' });
  }, [feed.length, active]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || closedReason) return;
    setText('');
    const r = await api('chat', { channel: active, text: t }, session);
    setError(r.ok ? null : r.errorTh);
    await refresh();
  };

  return (
    <section className="rounded-2xl border border-slate-700/60 bg-slate-950/70 text-slate-100 overflow-hidden">
      <div className="flex gap-1.5 overflow-x-auto bg-black/30 px-2 py-1.5" role="tablist">
        {channels.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={active === c}
            onClick={() => setTab(c)}
            className={`min-h-12 px-4 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
              active === c ? (c === 'public' ? 'bg-violet-700 text-white' : 'bg-red-800 text-white') : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {GAME_UI.chat.tabs[c] ?? c}
          </button>
        ))}
      </div>

      <div className="h-52 overflow-y-auto px-3 py-2 space-y-1 text-[15px] leading-snug" aria-live="polite">
        {feed.length === 0 && <p className="text-xs text-slate-500">{GAME_UI.chat.empty}</p>}
        {feed.map((l) => l.kind === 'system' ? (
          <p key={l.key} className="font-semibold text-pink-300 break-words">{l.text}</p>
        ) : (
          <p key={l.key} className="break-words">
            <span className={`font-black ${l.mine ? 'text-amber-300' : 'text-white'}`}>{l.seat ? `${l.seat} ` : ''}{l.name}</span>
            <span className="text-slate-200">: {l.text}</span>
          </p>
        ))}
        <div ref={bottom} />
      </div>

      {closedReason ? (
        <p className="bg-black/30 px-3 py-2.5 text-xs text-slate-400">{closedReason}</p>
      ) : (
        <form onSubmit={send} className="flex gap-2 bg-black/30 px-2 py-2 border-t border-slate-800">
          <input
            value={text}
            maxLength={300}
            onChange={(e) => setText(e.target.value)}
            placeholder="ส่งข้อความ"
            className="flex-1 min-h-12 px-3 rounded-xl bg-slate-900/80 border border-slate-700 text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400"
          />
          <button type="submit" aria-label={UI.lobby.send} className="min-w-12 min-h-12 rounded-xl bg-violet-700 hover:bg-violet-600 text-white flex items-center justify-center cursor-pointer">
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
      {error && <p className="bg-black/30 px-3 pb-2 text-xs text-red-300">{error}</p>}
    </section>
  );
};
