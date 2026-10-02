import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { supabaseSim } from '../../utils/supabaseSim';
import type { ChatMessage } from '../../utils/supabaseSim';
import { Avatar, Glass, SectionTitle, isOnline, pill } from './ui';

interface Props {
  username: string;
  isDark: boolean;
  /** เปิดห้องแชทส่วนตัวกับคนนี้ทันที (ส่งมาจากหน้า "ผู้คน") */
  initialFriend?: string | null;
  onTap?: () => void;
}

const GLOBAL = '__global__';

/** แชทชุมชน: ห้องรวม + แชทส่วนตัวกับเพื่อน (ใช้ตารางแชทเดิมของเว็บ) */
export const ChatSection: React.FC<Props> = ({ username, isDark, initialFriend, onTap }) => {
  const [channel, setChannel] = useState<string>(initialFriend || GLOBAL);
  const [friends, setFriends] = useState<string[]>([]);
  const [activeMap, setActiveMap] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const stick = useRef(true); // เลื่อนลงอัตโนมัติเฉพาะตอนผู้ใช้อยู่ล่างสุด

  useEffect(() => { if (initialFriend) setChannel(initialFriend); }, [initialFriend]);

  const load = useCallback(async () => {
    const [f, users, msgs] = await Promise.all([
      supabaseSim.getFriends(username),
      supabaseSim.getRealUsers(),
      supabaseSim.getChatMessages(username, channel === GLOBAL ? undefined : channel),
    ]);
    setFriends(f);
    setActiveMap(Object.fromEntries(users.map((u) => [u.username.toLowerCase(), u.last_active])));
    setMessages(msgs);
  }, [username, channel]);

  useEffect(() => {
    void load();
    const id = setInterval(() => { if (!document.hidden) void load(); }, 3500);
    const onStore = () => void load();
    window.addEventListener('storage', onStore);
    return () => { clearInterval(id); window.removeEventListener('storage', onStore); };
  }, [load]);

  useEffect(() => { if (stick.current) bottom.current?.scrollIntoView({ block: 'end' }); }, [messages.length, channel]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    setText('');
    onTap?.();
    stick.current = true;
    await supabaseSim.sendChatMessage({ sender: username, recipient: channel === GLOBAL ? undefined : channel, text: t, isGlobal: channel === GLOBAL });
    await load();
    setSending(false);
  };

  const strong = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const title = channel === GLOBAL ? '🌐 ห้องรวม Winter Community' : `💬 ${channel}`;

  return (
    <div className="space-y-4">
      <SectionTitle isDark={isDark} icon="💬" title="แชท" hint="คุยกับทุกคนในห้องรวม หรือแชทส่วนตัวกับเพื่อน" />

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="ห้องแชท">
        <button role="tab" aria-selected={channel === GLOBAL} className={pill(isDark, channel === GLOBAL)} onClick={() => setChannel(GLOBAL)}>🌐 ห้องรวม</button>
        {friends.map((f) => (
          <button key={f} role="tab" aria-selected={channel === f} className={`${pill(isDark, channel === f)} inline-flex items-center gap-2`} onClick={() => setChannel(f)}>
            <Avatar username={f} size={20} online={isOnline(activeMap[f.toLowerCase()])} /> {f}
          </button>
        ))}
        {friends.length === 0 && <span className={`text-xs self-center ${muted}`}>เพิ่มเพื่อนเพื่อแชทส่วนตัว</span>}
      </div>

      <Glass isDark={isDark} className="overflow-hidden flex flex-col h-[58vh] min-h-[360px]">
        <div className={`px-5 py-3 border-b text-sm font-black ${strong} ${isDark ? 'border-white/10' : 'border-slate-200'}`}>{title}</div>
        <div
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          aria-live="polite"
          onScroll={(e) => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }}
        >
          {messages.length === 0 && <p className={`text-sm text-center py-10 ${muted}`}>{channel === GLOBAL ? 'ยังไม่มีข้อความ — ทักทายคนแรกเลย 👋' : `เริ่มคุยกับ ${channel} ได้เลย`}</p>}
          {messages.map((m) => {
            const mine = m.sender.toLowerCase() === username.toLowerCase();
            return (
              <div key={m.id} className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                <Avatar username={m.sender} size={32} />
                <div className={`max-w-[78%] ${mine ? 'items-end text-right' : ''}`}>
                  {!mine && <div className={`text-[11px] font-black mb-0.5 ${muted}`}>{m.sender}</div>}
                  <div className={`inline-block px-4 py-2.5 rounded-3xl text-[15px] leading-snug break-words text-left ${
                    mine ? 'bg-gradient-to-br from-cyan-500 to-violet-600 text-white rounded-br-lg' : isDark ? 'bg-white/10 text-slate-100 rounded-bl-lg' : 'bg-white text-slate-800 rounded-bl-lg shadow-sm'
                  }`}>{m.text}</div>
                  <div className={`text-[10px] mt-0.5 ${muted}`}>{new Date(m.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottom} />
        </div>
        <form onSubmit={send} className={`flex gap-2 p-3 border-t ${isDark ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-white/60'}`}>
          <input
            value={text}
            maxLength={500}
            onChange={(e) => setText(e.target.value)}
            placeholder={channel === GLOBAL ? 'พิมพ์ข้อความถึงทุกคน…' : `ข้อความถึง ${channel}…`}
            aria-label="ข้อความ"
            className={`flex-1 min-h-12 px-4 rounded-full outline-none text-base border ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-cyan-400' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500'}`}
          />
          <button type="submit" disabled={sending || !text.trim()} aria-label="ส่ง" className="min-w-12 min-h-12 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 text-white flex items-center justify-center disabled:opacity-50 cursor-pointer">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </Glass>
    </div>
  );
};
