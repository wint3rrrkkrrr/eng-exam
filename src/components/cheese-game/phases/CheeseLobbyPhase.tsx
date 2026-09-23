import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Crown, UserX, Settings2, Play, LogOut, Loader2, Users2, Bot, Shirt } from 'lucide-react';
import { cheeseGame, isBot, recommendedAccompliceCount } from '../../../utils/cheeseGameClient';
import { CheeseParticles, AuroraBg } from '../CheeseParticles';
import { MouseHatPicker } from '../MouseHatPicker';
import { CheesePhaseProps } from './types';

export const CheeseLobbyPhase: React.FC<CheesePhaseProps> = ({ room, players, username, isDark, isHost, roomCode, refresh, onExitRoom }) => {
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [starting, setStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [accompliceCount, setAccompliceCount] = useState(room.accomplice_count);
  const [discussionMinutes, setDiscussionMinutes] = useState(Math.round(room.discussion_seconds / 60));
  const [actionSeconds, setActionSeconds] = useState(room.action_seconds ?? 15);
  const [nightHours, setNightHours] = useState(room.night_hours ?? 6);
  const [allowPeek, setAllowPeek] = useState(room.allow_peek ?? true);
  const [anonymousVote, setAnonymousVote] = useState(room.anonymous_vote ?? false);
  const [showTimer, setShowTimer] = useState(room.show_timer ?? true);
  const [dawnChatSeconds, setDawnChatSeconds] = useState(room.dawn_chat_seconds ?? 30);
  const [readyUsernames, setReadyUsernames] = useState<string[]>([]);
  const [iAmReady, setIAmReady] = useState(false);
  const [showHatPicker, setShowHatPicker] = useState(false);

  const botCount = players.filter(p => isBot(p)).length;
  const humanPlayers = players.filter(p => !isBot(p));
  const maxPlayers = room.max_players ?? 20;
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
    } catch {}
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
      action_seconds: actionSeconds,
      night_hours: nightHours,
      allow_peek: allowPeek,
      anonymous_vote: anonymousVote,
      show_timer: showTimer,
      dawn_chat_seconds: dawnChatSeconds,
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

  const neonCard = 'rounded-3xl border border-amber-400/15 backdrop-blur-md shadow-xl';
  const neonCardBg = { background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(10,10,25,0.85) 100%)' };
  const settingBtn = (active: boolean) =>
    active
      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
      : 'bg-white/5 text-zinc-400 border border-white/10';

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-8 bg-[#05060f] text-zinc-100">
      <AuroraBg />
      <CheeseParticles count={18} />

      <div className="relative z-10 max-w-lg mx-auto space-y-5">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-1 pt-2"
        >
          <motion.div
            className="text-5xl select-none"
            animate={{ rotate: [-5, 5, -5], scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            🐭🧀
          </motion.div>
          <h1
            className="text-2xl font-black text-white"
            style={{ textShadow: '0 0 20px rgba(245,158,11,0.5)' }}
          >
            ห้องรอผู้เล่น
          </h1>
        </motion.div>

        {/* Room code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`${neonCard} p-5 text-center space-y-3`}
          style={neonCardBg}
        >
          <p className="text-xs font-bold text-zinc-500">แชร์รหัสนี้ให้เพื่อน</p>
          <motion.button
            onClick={handleCopyCode}
            className="mx-auto flex items-center gap-3 px-7 py-3.5 rounded-2xl font-black text-3xl tracking-[0.4em] active:scale-95 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: '#0a0a14',
              boxShadow: '0 0 30px rgba(245,158,11,0.5)',
            }}
            whileHover={{ boxShadow: '0 0 50px rgba(245,158,11,0.8)' }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 opacity-40"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            />
            <span className="relative z-10">{roomCode}</span>
            {copied
              ? <Check className="w-5 h-5 relative z-10" />
              : <Copy className="w-5 h-5 opacity-70 relative z-10" />}
          </motion.button>
          <AnimatePresence>
            {copied && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[11px] font-bold text-emerald-400"
              >
                ✅ คัดลอกแล้ว!
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Player list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`${neonCard} p-4 space-y-2`}
          style={neonCardBg}
        >
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="flex items-center gap-1.5 text-xs font-black text-zinc-300">
              <Users2 className="w-4 h-4 text-amber-400" />
              ผู้เล่น ({players.length}/{maxPlayers})
            </span>
            <motion.span
              key={`${readyUsernames.length}-${allHumansReady}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                canStart
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
              }`}
            >
              {players.length < minPlayers
                ? `ต้องการอีก ${minPlayers - players.length} คน`
                : allHumansReady ? '🎉 ทุกคนพร้อม!' : `พร้อม ${readyUsernames.length}/${humanPlayers.length}`}
            </motion.span>
          </div>

          <AnimatePresence initial={false}>
            {players.map((p, i) => {
              const isReady = readyUsernames.includes(p.username);
              return (
                <motion.div
                  key={p.username}
                  initial={{ opacity: 0, x: -16, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 12, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-2xl border transition"
                  style={{
                    background: isReady
                      ? 'rgba(16,185,129,0.08)'
                      : 'rgba(255,255,255,0.03)',
                    borderColor: isReady
                      ? 'rgba(16,185,129,0.3)'
                      : 'rgba(255,255,255,0.06)',
                    boxShadow: isReady ? '0 0 12px rgba(16,185,129,0.12)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isBot(p) ? (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-base ring-2 ring-zinc-600/40 bg-zinc-800 shrink-0">🤖</div>
                    ) : (
                      <div className="relative shrink-0" style={{ paddingTop: p.mouse_hat ? '8px' : undefined }}>
                        {p.mouse_hat && (
                          <span
                            className="absolute pointer-events-none select-none leading-none z-10"
                            style={{ top: -4, left: '50%', transform: 'translateX(-50%)', fontSize: 16 }}
                          >
                            {p.mouse_hat}
                          </span>
                        )}
                        <img src={p.avatar} alt={p.username} className="w-8 h-8 rounded-full object-cover" />
                        {isReady && (
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{ boxShadow: '0 0 8px 2px rgba(16,185,129,0.5)' }}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </div>
                    )}
                    <span className={`font-bold text-sm truncate ${isBot(p) ? 'text-zinc-500' : 'text-zinc-100'}`}>{p.username}</span>
                    {p.is_host && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    {isBot(p) && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400 shrink-0">BOT</span>
                    )}
                    {!isBot(p) && p.username.toLowerCase() === username.toLowerCase() && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded shrink-0"
                        style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
                        คุณ
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isBot(p) && p.username.toLowerCase() === username.toLowerCase() && (
                      <motion.button
                        onClick={() => setShowHatPicker(true)}
                        className="p-1.5 rounded-lg text-purple-400/70 hover:text-purple-300 hover:bg-purple-500/15 transition shrink-0"
                        whileTap={{ scale: 0.85 }}
                        title="แต่งตัวหนู"
                      >
                        <Shirt className="w-4 h-4" />
                      </motion.button>
                    )}
                    {!isBot(p) && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isReady
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800/60 text-zinc-500 border border-zinc-700/50'
                      }`}>
                        {isReady ? '✅ พร้อม' : '⏳ รอ'}
                      </span>
                    )}
                    {isHost && !p.is_host && (
                      <motion.button
                        onClick={() => isBot(p) ? cheeseGame.removeBot(roomCode, p.username).then(refresh) : handleKick(p.username)}
                        className="p-1.5 rounded-lg text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/15 transition shrink-0"
                        whileTap={{ scale: 0.85 }}
                        title={isBot(p) ? `ลบบอท ${p.username}` : `เตะ ${p.username}`}
                      >
                        <UserX className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Bot controls */}
        {isHost && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${neonCard} p-4 space-y-2`}
            style={neonCardBg}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-zinc-300">
                <Bot className="w-4 h-4 text-zinc-500" />
                บอท {botCount > 0 ? `(${botCount})` : ''}
                <span className="text-[9px] font-bold text-zinc-600">— เล่นคนเดียวได้</span>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { label: '−', action: async () => { const bots = players.filter(p => isBot(p)); if (bots.length > 0) { await cheeseGame.removeBot(roomCode, bots[bots.length-1].username); refresh(); } }, disabled: botCount === 0 },
                  { label: '+', action: async () => { await cheeseGame.addBot(roomCode); refresh(); }, disabled: players.length >= maxPlayers },
                ].map(btn => (
                  <motion.button
                    key={btn.label}
                    disabled={btn.disabled}
                    onClick={btn.action}
                    className="w-7 h-7 rounded-lg font-black text-sm border border-white/10 bg-white/5 text-zinc-300 disabled:opacity-25 disabled:cursor-not-allowed"
                    whileTap={{ scale: 0.85 }}
                  >
                    {btn.label}
                  </motion.button>
                ))}
                <span className="w-5 text-center text-sm font-black text-zinc-300">{botCount}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings */}
        {isHost && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`${neonCard} p-4 space-y-3`}
            style={neonCardBg}
          >
            <motion.button
              onClick={() => setShowSettings(s => !s)}
              className="flex items-center gap-1.5 text-xs font-black text-amber-400"
              whileTap={{ scale: 0.95 }}
            >
              <Settings2 className="w-4 h-4" />
              ตั้งค่าห้อง (เจ้าของห้องเท่านั้น)
              <motion.span animate={{ rotate: showSettings ? 180 : 0 }} transition={{ duration: 0.2 }}>▾</motion.span>
            </motion.button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  {/* บทบาท */}
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">⚔️ บทบาท</p>
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span>ลูกสมุนหนูจิ๊ด <span className="font-normal text-zinc-600">(แนะนำ {recommendedAccompliceCount(players.length)})</span></span>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3].map(n => (
                        <motion.button key={n} onClick={() => setAccompliceCount(n)} whileTap={{ scale: 0.9 }}
                          className={`w-7 h-7 rounded-lg font-black text-xs transition ${accompliceCount === n ? 'bg-amber-400 text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'bg-white/5 text-zinc-400 border border-white/10'}`}>
                          {n}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* คืน */}
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600 pt-1">🌙 คืน</p>
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span>จำนวนคืน</span>
                    <div className="flex items-center gap-1">
                      {[4, 5, 6].map(n => (
                        <motion.button key={n} onClick={() => setNightHours(n)} whileTap={{ scale: 0.9 }}
                          className={`px-2.5 h-7 rounded-lg font-black text-xs transition ${nightHours === n ? 'bg-amber-400 text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'bg-white/5 text-zinc-400 border border-white/10'}`}>
                          {n}คืน
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span>เวลาตัดสินใจต่อคืน</span>
                    <div className="flex items-center gap-1">
                      {[10, 15, 20, 30].map(n => (
                        <motion.button key={n} onClick={() => setActionSeconds(n)} whileTap={{ scale: 0.9 }}
                          className={`px-2 h-7 rounded-lg font-black text-xs transition ${actionSeconds === n ? 'bg-amber-400 text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'bg-white/5 text-zinc-400 border border-white/10'}`}>
                          {n}วิ
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span>แสดงตัวจับเวลาคืน</span>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowTimer(v => !v)} className={`px-3 h-7 rounded-lg font-black text-xs transition ${settingBtn(showTimer)}`}>
                      {showTimer ? '✅ เปิด' : '❌ ปิด'}
                    </motion.button>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span>ระบบแอบดูเวลาคนอื่น</span>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setAllowPeek(v => !v)} className={`px-3 h-7 rounded-lg font-black text-xs transition ${settingBtn(allowPeek)}`}>
                      {allowPeek ? '✅ เปิด' : '❌ ปิด'}
                    </motion.button>
                  </div>

                  {/* กลางวัน */}
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600 pt-1">☀️ กลางวัน & โหวต</p>
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span>เวลาถกเถียงตอนเช้า</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 5, 10].map(n => (
                        <motion.button key={n} onClick={() => setDiscussionMinutes(n)} whileTap={{ scale: 0.9 }}
                          className={`px-2 h-7 rounded-lg font-black text-xs transition ${discussionMinutes === n ? 'bg-amber-400 text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'bg-white/5 text-zinc-400 border border-white/10'}`}>
                          {n}น.
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span>โหวตแบบปิดบังชื่อ</span>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setAnonymousVote(v => !v)} className={`px-3 h-7 rounded-lg font-black text-xs transition ${settingBtn(anonymousVote)}`}>
                      {anonymousVote ? '✅ เปิด' : '❌ ปิด'}
                    </motion.button>
                  </div>

                  {/* Section: แชทลับ */}
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600 pt-1">🌙 แชทลับหนูจิ๊ด (รุ่งอรุณ)</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                      <span>เวลาคุยลับก่อนเริ่มวัน</span>
                      <div className="flex items-center gap-1">
                        {[15, 30, 45, 60].map(n => (
                          <motion.button key={n} onClick={() => setDawnChatSeconds(n)} whileTap={{ scale: 0.9 }}
                            className={`px-2 h-7 rounded-lg font-black text-xs transition ${dawnChatSeconds === n ? 'bg-amber-400 text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'bg-white/5 text-zinc-400 border border-white/10'}`}>
                            {n}วิ
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-1">
                      {[{ s: 90, label: '1:30' }, { s: 120, label: '2:00' }].map(({ s, label }) => (
                        <motion.button key={s} onClick={() => setDawnChatSeconds(s)} whileTap={{ scale: 0.9 }}
                          className={`px-2 h-7 rounded-lg font-black text-xs transition ${dawnChatSeconds === s ? 'bg-amber-400 text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'bg-white/5 text-zinc-400 border border-white/10'}`}>
                          {label}น.
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    onClick={handleSaveSettings}
                    className="w-full py-2.5 rounded-xl text-xs font-black text-amber-400 border border-amber-400/30 transition"
                    style={{ background: 'rgba(245,158,11,0.1)' }}
                    whileHover={{ background: 'rgba(245,158,11,0.18)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    💾 บันทึกการตั้งค่า
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <motion.button
            onClick={async () => {
              if (iAmReady) {
                await cheeseGame.unmarkLobbyReady(roomCode, username);
                setIAmReady(false);
              } else {
                await cheeseGame.markLobbyReady(roomCode, username);
                setIAmReady(true);
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition border"
            style={iAmReady
              ? { background: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.4)', color: '#34d399', boxShadow: '0 0 20px rgba(16,185,129,0.2)' }
              : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)', color: '#d4d4d8' }
            }
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {iAmReady ? '✅ พร้อมแล้ว — กดเพื่อยกเลิก' : '👍 กดพร้อม'}
          </motion.button>

          {isHost ? (
            <motion.button
              onClick={handleStart}
              disabled={!canStart || starting}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-zinc-950 disabled:opacity-40 relative overflow-hidden"
              style={{
                background: canStart
                  ? 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)'
                  : 'linear-gradient(135deg, #78716c, #57534e)',
                boxShadow: canStart ? '0 0 30px rgba(245,158,11,0.5)' : 'none',
              }}
              whileHover={canStart ? { scale: 1.02, boxShadow: '0 0 45px rgba(245,158,11,0.7)' } : {}}
              whileTap={{ scale: 0.97 }}
            >
              {canStart && (
                <motion.div
                  className="absolute inset-0 opacity-30"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
              )}
              {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-zinc-950" />}
              <span>{allHumansReady ? '🚀 เริ่มเกม!' : `รอ ${humanPlayers.length - readyUsernames.length} คน...`}</span>
            </motion.button>
          ) : (
            <p className="text-center text-xs font-bold text-zinc-600">⏳ รอเจ้าของห้องกดเริ่มเกม...</p>
          )}

          {errorMsg && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs font-bold text-rose-400">
              ⚠️ {errorMsg}
            </motion.p>
          )}

          <motion.button
            onClick={handleLeave}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl font-bold text-xs border border-white/8 text-zinc-600 hover:text-rose-400 hover:border-rose-500/20 transition"
            whileTap={{ scale: 0.97 }}
          >
            <LogOut className="w-3.5 h-3.5" />
            ออกจากห้อง
          </motion.button>
        </motion.div>
      </div>

      <MouseHatPicker
        open={showHatPicker}
        currentHat={players.find(p => p.username.toLowerCase() === username.toLowerCase())?.mouse_hat ?? null}
        onClose={() => setShowHatPicker(false)}
        onSelect={hat => { cheeseGame.updateMouseHat(roomCode, username, hat); refresh(); }}
      />
    </div>
  );
};
