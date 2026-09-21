import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Crown, UserX, Settings2, Play, LogOut, Loader2, Users2, Bot } from 'lucide-react';
import { cheeseGame, isBot, recommendedAccompliceCount } from '../../../utils/cheeseGameClient';
import { CheesePhaseProps } from './types';

export const CheeseLobbyPhase: React.FC<CheesePhaseProps> = ({ room, players, username, isDark, isHost, roomCode, refresh, onExitRoom, onBackToHome }) => {
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [starting, setStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [accompliceCount, setAccompliceCount] = useState(room.accomplice_count);
  const [discussionMinutes, setDiscussionMinutes] = useState(Math.round(room.discussion_seconds / 60));
  const [readyUsernames, setReadyUsernames] = useState<string[]>([]);
  const [iAmReady, setIAmReady] = useState(false);

  const botCount = players.filter(p => isBot(p)).length;
  const humanPlayers = players.filter(p => !isBot(p));
  const minPlayers = 3;
  const allHumansReady = humanPlayers.every(p => readyUsernames.includes(p.username));
  const canStart = players.length >= minPlayers && allHumansReady;

  useEffect(() => {
    let active = true;
    const poll = async () => {
      const ready = await cheeseGame.getLobbyReadyUsernames(roomCode);
      if (active) {
        setReadyUsernames(ready);
        if (ready.includes(username)) setIAmReady(true);
      }
    };
    poll();
    const interval = setInterval(poll, 1500);
    return () => { active = false; clearInterval(interval); };
  }, [roomCode, username]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — no-op, user can still read the code
    }
  };

  const handleKick = async (target: string) => {
    if (!confirm(`เตะ "${target}" ออกจากห้อง?`)) return;
    await cheeseGame.kickPlayer(roomCode, target);
    refresh();
  };

  const handleSaveSettings = async () => {
    await cheeseGame.updateSettings(roomCode, {
      accomplice_count: accompliceCount,
      discussion_seconds: Math.max(30, discussionMinutes * 60),
    });
    setShowSettings(false);
    refresh();
  };

  const handleStart = async () => {
    setErrorMsg(null);
    setStarting(true);
    const res = await cheeseGame.startGame(roomCode, accompliceCount);
    setStarting(false);
    if (!res.success) setErrorMsg(res.message);
  };

  const handleLeave = async () => {
    await cheeseGame.leaveRoom(roomCode, username);
    onExitRoom();
  };

  return (
    <div className={`min-h-screen px-4 py-8 ${isDark ? 'bg-[#0b0c16] text-zinc-100' : 'bg-indigo-50 text-stone-900'}`}>
      <div className="max-w-lg mx-auto space-y-5">
        <div className="text-center space-y-1">
          <div className="text-5xl">🐭🧀</div>
          <h1 className="text-xl font-black">ห้องรอผู้เล่น</h1>
        </div>

        {/* Room code card */}
        <div className={`rounded-3xl border p-5 text-center space-y-3 shadow-xl ${isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-stone-200'}`}>
          <p className={`text-xs font-bold ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>แชร์รหัสนี้ให้เพื่อน</p>
          <button
            onClick={handleCopyCode}
            className="mx-auto flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-zinc-950 font-black text-3xl tracking-[0.4em] active:scale-95 transition shadow-lg"
            title="กดเพื่อคัดลอก"
          >
            <span>{roomCode}</span>
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5 opacity-70" />}
          </button>
          {copied && <p className="text-[11px] font-bold text-emerald-400">คัดลอกแล้ว!</p>}
        </div>

        {/* Player list */}
        <div className={`rounded-3xl border p-4 space-y-2 shadow-xl ${isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-stone-200'}`}>
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="flex items-center gap-1.5 text-xs font-black">
              <Users2 className="w-4 h-4 text-amber-400" />
              ผู้เล่น ({players.length})
            </span>
            <span className={`text-[10px] font-bold ${canStart ? 'text-emerald-400' : 'text-rose-400'}`}>
              {players.length < minPlayers
                ? `ต้องการอีก ${minPlayers - players.length} คน`
                : allHumansReady ? 'ทุกคนพร้อมแล้ว!' : `พร้อม ${readyUsernames.length}/${humanPlayers.length} คน`}
            </span>
          </div>
          <AnimatePresence initial={false}>
            {players.map((p) => (
              <motion.div
                key={p.username}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`flex items-center justify-between gap-2 p-2.5 rounded-2xl ${isDark ? 'bg-zinc-800/50' : 'bg-stone-50'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isBot(p) ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base ring-2 ring-zinc-600/40 shrink-0 ${isDark ? 'bg-zinc-700' : 'bg-stone-200'}`}>🤖</div>
                  ) : (
                    <img src={p.avatar} alt={p.username} className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/40 shrink-0" />
                  )}
                  <span className={`font-bold text-sm truncate ${isBot(p) ? 'text-zinc-400' : ''}`}>{p.username}</span>
                  {p.is_host && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  {isBot(p) && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-zinc-600 text-zinc-300 shrink-0">บอท</span>}
                  {!isBot(p) && p.username.toLowerCase() === username.toLowerCase() && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-zinc-950 shrink-0">คุณ</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Ready status badge */}
                  {!isBot(p) && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                      readyUsernames.includes(p.username)
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isDark ? 'bg-zinc-800 text-zinc-500 border border-zinc-700' : 'bg-stone-100 text-stone-400 border border-stone-200'
                    }`}>
                      {readyUsernames.includes(p.username) ? '✅ พร้อม' : '⏳ รอ...'}
                    </span>
                  )}
                  {isHost && !p.is_host && (
                    <button
                      onClick={() => isBot(p) ? cheeseGame.removeBot(roomCode, p.username).then(refresh) : handleKick(p.username)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/15 transition shrink-0"
                      title={isBot(p) ? `ลบบอท ${p.username}` : `เตะ ${p.username}`}
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bot controls (host only) */}
        {isHost && (
          <div className={`rounded-3xl border p-4 space-y-2 shadow-xl ${isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-stone-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black">
                <Bot className="w-4 h-4 text-zinc-400" />
                <span>บอท {botCount > 0 ? `(${botCount})` : ''}</span>
                <span className={`text-[9px] font-bold ${isDark ? 'text-zinc-500' : 'text-stone-400'}`}>— เล่นคนเดียวได้</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={botCount === 0}
                  onClick={async () => {
                    const bots = players.filter(p => isBot(p));
                    if (bots.length > 0) {
                      await cheeseGame.removeBot(roomCode, bots[bots.length - 1].username);
                      refresh();
                    }
                  }}
                  className={`w-7 h-7 rounded-lg font-black text-sm transition ${
                    botCount === 0 ? 'opacity-30 cursor-not-allowed' : isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-black">{botCount}</span>
                <button
                  disabled={players.length >= 10}
                  onClick={async () => {
                    await cheeseGame.addBot(roomCode);
                    refresh();
                  }}
                  className={`w-7 h-7 rounded-lg font-black text-sm transition ${
                    players.length >= 10 ? 'opacity-30 cursor-not-allowed' : isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  +
                </button>
              </div>
            </div>
            {botCount > 0 && (
              <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-stone-400'}`}>
                บอทจะเล่นอัตโนมัติ: ตื่นตามเวลา, ขโมยชีส, โหวต
              </p>
            )}
          </div>
        )}

        {/* Host settings */}
        {isHost && (
          <div className={`rounded-3xl border p-4 space-y-3 shadow-xl ${isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-stone-200'}`}>
            <button
              onClick={() => setShowSettings(s => !s)}
              className="flex items-center gap-1.5 text-xs font-black text-amber-400"
            >
              <Settings2 className="w-4 h-4" />
              ตั้งค่าห้อง (เจ้าของห้องเท่านั้น)
            </button>
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>จำนวนลูกสมุนหนูจิ๊ด (แนะนำ {recommendedAccompliceCount(players.length)})</span>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3].map(n => (
                        <button
                          key={n}
                          onClick={() => setAccompliceCount(n)}
                          className={`w-7 h-7 rounded-lg font-black text-xs transition ${
                            accompliceCount === n ? 'bg-amber-400 text-zinc-950' : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>เวลาถกเถียงตอนเช้า (นาที)</span>
                    <div className="flex items-center gap-1">
                      {[2, 3, 5].map(n => (
                        <button
                          key={n}
                          onClick={() => setDiscussionMinutes(n)}
                          className={`px-2.5 h-7 rounded-lg font-black text-xs transition ${
                            discussionMinutes === n ? 'bg-amber-400 text-zinc-950' : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {n} น.
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    className="w-full py-2 rounded-xl text-xs font-black bg-amber-500/20 text-amber-400 active:scale-95 transition"
                  >
                    บันทึกการตั้งค่า
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {/* Ready button (everyone including host) — toggleable */}
          <button
            onClick={async () => {
              if (iAmReady) {
                await cheeseGame.unmarkLobbyReady(roomCode, username);
                setIAmReady(false);
              } else {
                await cheeseGame.markLobbyReady(roomCode, username);
                setIAmReady(true);
              }
            }}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition active:scale-95 ${
              iAmReady
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400'
                : isDark ? 'bg-zinc-800 border border-zinc-700 text-zinc-200 hover:border-amber-400/40' : 'bg-white border border-stone-200 text-stone-700 hover:border-amber-400'
            }`}
          >
            {iAmReady ? '✅ พร้อมแล้ว — กดเพื่อยกเลิก' : '👍 กดพร้อม'}
          </button>

          {isHost ? (
            <button
              onClick={handleStart}
              disabled={!canStart || starting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-zinc-950 shadow-lg active:scale-95 transition disabled:opacity-50"
            >
              {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-zinc-950" />}
              <span>{allHumansReady ? 'เริ่มเกม!' : `รอ ${humanPlayers.length - readyUsernames.length} คน...`}</span>
            </button>
          ) : (
            <p className={`text-center text-xs font-bold ${isDark ? 'text-zinc-500' : 'text-stone-500'}`}>
              รอเจ้าของห้องกดเริ่มเกม...
            </p>
          )}
          {errorMsg && <p className="text-center text-xs font-bold text-rose-400">{errorMsg}</p>}

          <button
            onClick={handleLeave}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl font-bold text-xs border transition active:scale-95 ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-rose-300' : 'bg-white border-stone-200 text-stone-500 hover:text-rose-600'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            ออกจากห้อง
          </button>
        </div>
      </div>
    </div>
  );
};
