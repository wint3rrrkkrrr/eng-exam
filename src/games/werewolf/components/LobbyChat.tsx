import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { UI } from '../text/th';
import { api } from '../net/werewolfClient';
import type { Session } from '../net/werewolfClient';
import type { MyViewResponse } from '../shared/api';

interface Props {
  view: MyViewResponse;
  session: Session;
  refresh: () => Promise<void>;
}

// แชทสาธารณะในล็อบบี้ (ช่องแชทลับของหมาป่า/คู่รัก/ผู้ตายจะทำในหน้าเล่นจริง M4)
export const LobbyChat: React.FC<Props> = ({ view, session, refresh }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setText('');
    const r = await api('chat', { channel: 'public', text: t }, session);
    setError(r.ok ? null : r.errorTh);
    await refresh();
  };

  return (
    <section className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4 space-y-3">
      <h2 className="text-sm font-black text-slate-200">{UI.lobby.chat}</h2>
      <div className="max-h-48 overflow-y-auto space-y-1.5 text-sm">
        {view.chat.public.length === 0 && <p className="text-xs text-slate-600">—</p>}
        {view.chat.public.map((c) => (
          <p key={c.id} className="break-words">
            <span className="font-bold text-violet-300">{c.displayName}</span>
            <span className="text-slate-300">: {c.text}</span>
          </p>
        ))}
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
      <form onSubmit={send} className="flex gap-2">
        <input
          value={text}
          maxLength={300}
          onChange={(e) => setText(e.target.value)}
          placeholder={UI.lobby.chatPlaceholder}
          className="flex-1 min-h-12 px-3 rounded-xl bg-slate-900/80 border border-slate-700 text-base text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-400"
        />
        <button type="submit" aria-label={UI.lobby.send} className="min-w-12 min-h-12 rounded-xl bg-violet-700 hover:bg-violet-600 flex items-center justify-center cursor-pointer">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </section>
  );
};
