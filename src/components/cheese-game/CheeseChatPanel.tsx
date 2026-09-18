import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { cheeseGame, CheeseChatMsg } from '../../utils/cheeseGameClient';

interface CheeseChatPanelProps {
  roomCode: string;
  channel: 'main' | 'thief';
  username: string;
  avatar: string;
  isDark: boolean;
  heightClass?: string;
  placeholder?: string;
}

export const CheeseChatPanel: React.FC<CheeseChatPanelProps> = ({ roomCode, channel, username, avatar, isDark, heightClass = 'h-56', placeholder }) => {
  const [messages, setMessages] = useState<CheeseChatMsg[]>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const msgs = await cheeseGame.getChat(roomCode, channel);
    setMessages(msgs);
  };

  useEffect(() => {
    load();
    const unsubscribe = cheeseGame.subscribeToRoom(roomCode, load);
    const interval = setInterval(load, 3000);
    return () => { unsubscribe(); clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, channel]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput('');
    await cheeseGame.sendChat(roomCode, username, avatar, text, channel);
    load();
  };

  return (
    <div className={`flex flex-col rounded-2xl border overflow-hidden ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200'}`}>
      <div className={`flex-1 overflow-y-auto p-2.5 space-y-2 ${heightClass}`}>
        {messages.length === 0 && (
          <p className={`text-[11px] text-center py-4 ${isDark ? 'text-zinc-600' : 'text-stone-400'}`}>ยังไม่มีข้อความ...</p>
        )}
        {messages.map((m) => {
          const isMe = m.sender.toLowerCase() === username.toLowerCase();
          return (
            <div key={m.id} className={`flex gap-1.5 text-xs ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              <img src={m.avatar} alt={m.sender} className="w-6 h-6 rounded-full object-cover shrink-0" />
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                <span className={`text-[9px] font-bold mb-0.5 ${isDark ? 'text-zinc-500' : 'text-stone-400'}`}>{m.sender}</span>
                <div className={`px-2.5 py-1.5 rounded-xl font-medium break-words ${
                  isMe ? 'bg-amber-500 text-zinc-950 font-semibold' : isDark ? 'bg-zinc-800 text-zinc-100' : 'bg-stone-100 text-stone-800'
                }`}>
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSend} className={`flex gap-1.5 p-2 border-t ${isDark ? 'border-zinc-800' : 'border-stone-200'}`}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder || 'พิมพ์ข้อความ...'}
          className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
            isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-stone-50 border-stone-300 text-stone-800'
          }`}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 transition shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
