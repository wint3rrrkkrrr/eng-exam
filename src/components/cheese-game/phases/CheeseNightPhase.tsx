import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Users, MessageCircleWarning } from 'lucide-react';
import { cheeseGame, formatNightHour } from '../../../utils/cheeseGameClient';
import { CheeseChatPanel } from '../CheeseChatPanel';
import { CheesePhaseProps } from './types';

const HOUR_DURATION_MS = 13000; // how long each "hour" stays on screen

const ROLE_INTRO: Record<string, { emoji: string; title: string; desc: string; color: string; cardBg: string; cardBorder: string; glow: string }> = {
  thief: {
    emoji: '😈🐭',
    title: 'คุณคือหนูจิ๊ด!',
    desc: 'แอบหยิบชีสไปซ่อนตอนตื่นกลางดึกให้ได้ อย่าให้ใครจับได้!',
    color: 'text-rose-400',
    cardBg: 'bg-gradient-to-br from-zinc-950 via-rose-950 to-black',
    cardBorder: 'border-rose-500/70',
    glow: 'shadow-[0_0_45px_rgba(244,63,94,0.5)]',
  },
  accomplice: {
    emoji: '🕵️🐭',
    title: 'คุณคือลูกสมุนหนูจิ๊ด!',
    desc: 'จำหน้าหัวหน้าไว้ แล้วช่วยกันบลัฟตอนเช้า',
    color: 'text-amber-400',
    cardBg: 'bg-gradient-to-br from-zinc-900 via-orange-950 to-zinc-950',
    cardBorder: 'border-amber-500/60',
    glow: 'shadow-[0_0_35px_rgba(245,158,11,0.4)]',
  },
  mouse: {
    emoji: '🐭💕',
    title: 'คุณคือหนูบริสุทธิ์!',
    desc: 'สืบหาตัวหนูจิ๊ดให้เจอ แล้วโหวตจับให้ได้',
    color: 'text-sky-300',
    cardBg: 'bg-gradient-to-br from-sky-200 via-pink-100 to-sky-100',
    cardBorder: 'border-sky-300',
    glow: 'shadow-[0_0_35px_rgba(125,211,252,0.4)]',
  },
};

export const CheeseNightPhase: React.FC<CheesePhaseProps> = ({ room, players, username, avatar, isDark, isHost, roomCode, refresh }) => {
  const me = players.find(p => p.username.toLowerCase() === username.toLowerCase());
  const [modalOpenForHour, setModalOpenForHour] = useState<number | null>(null);
  const [actionTimeLeft, setActionTimeLeft] = useState(10);
  const [coWakers, setCoWakers] = useState<string[]>([]);
  const [showSecretChat, setShowSecretChat] = useState(false);
  const [introStage, setIntroStage] = useState<'role-waiting' | 'role-spin' | 'role-reveal' | 'hour-waiting' | 'hour-spin' | 'hour-reveal' | 'done' | null>(null);
  const [readyUsernames, setReadyUsernames] = useState<string[]>([]);
  const advancingRef = useRef(false);
  const coWakerPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const thief = players.find(p => p.role === 'thief');
  const isThief = me?.role === 'thief';
  const isAccomplice = me?.role === 'accomplice';
  const iAmAwakeNow = me?.dice_hour === room.current_hour;

  // One-time "who am I / when do I wake" reveal, shown when the night begins.
  // The player taps their own card/dice to flip it — nothing auto-plays.
  // Guarded by a ref (not just the introStage state) so it can never
  // re-trigger later — e.g. when room.current_hour ticks forward every
  // ~13s in the background while the player is still looking at their card.
  const introTriggeredRef = useRef(false);
  useEffect(() => {
    if (!me || introTriggeredRef.current) return;
    if (room.current_hour < 0) return;
    const seenKey = `cheese_intro_seen_${roomCode}`;
    try {
      if (sessionStorage.getItem(seenKey)) {
        introTriggeredRef.current = true;
        return;
      }
      sessionStorage.setItem(seenKey, '1');
    } catch { /* ignore */ }
    introTriggeredRef.current = true;
    setIntroStage('role-waiting');
  }, [me, room.current_hour, roomCode]);

  // Brief flip animation after the player taps, then settle on the reveal.
  // Functional updates so a stray/duplicate timer callback can never stomp
  // a stage the player has already moved past.
  useEffect(() => {
    if (introStage === 'role-spin') {
      const t = setTimeout(() => setIntroStage(s => (s === 'role-spin' ? 'role-reveal' : s)), 900);
      return () => clearTimeout(t);
    }
    if (introStage === 'hour-spin') {
      const t = setTimeout(() => setIntroStage(s => (s === 'hour-spin' ? 'hour-reveal' : s)), 900);
      return () => clearTimeout(t);
    }
  }, [introStage]);

  // Everyone (not just the host) watches who's ready, to render the waiting circle.
  useEffect(() => {
    if (room.current_hour !== 0) return;
    let active = true;
    const poll = () => {
      cheeseGame.getNightLogForHour(roomCode, 0).then(log => {
        if (active) setReadyUsernames(log.map(l => l.username));
      });
    };
    poll();
    const interval = setInterval(poll, 1500);
    return () => { active = false; clearInterval(interval); };
  }, [room.current_hour, roomCode]);

  // Host drives the clock. At hour 0 (everyone still viewing their own
  // role/dice card) it waits for every player to be ready — with a safety
  // timeout so the game can't stall forever if someone walks away — before
  // starting the real per-hour countdown.
  useEffect(() => {
    if (!isHost) return;

    if (room.current_hour === 0) {
      let cancelled = false;
      const tryAdvance = async () => {
        if (advancingRef.current || cancelled) return;
        const readyLog = await cheeseGame.getNightLogForHour(roomCode, 0);
        if (cancelled || readyLog.length < players.length) return;
        advancingRef.current = true;
        await cheeseGame.advanceHour(roomCode, 1);
        advancingRef.current = false;
        refresh();
      };
      const interval = setInterval(tryAdvance, 1500);
      tryAdvance();
      const safetyTimeout = setTimeout(async () => {
        if (cancelled || advancingRef.current) return;
        advancingRef.current = true;
        await cheeseGame.advanceHour(roomCode, 1);
        advancingRef.current = false;
        refresh();
      }, 45000);
      return () => { cancelled = true; clearInterval(interval); clearTimeout(safetyTimeout); };
    }

    const timer = setTimeout(async () => {
      if (advancingRef.current) return;
      advancingRef.current = true;
      if (room.current_hour >= 6) {
        await cheeseGame.startDayTimer(roomCode, room.discussion_seconds);
      } else {
        await cheeseGame.advanceHour(roomCode, room.current_hour + 1);
      }
      advancingRef.current = false;
      refresh();
    }, HOUR_DURATION_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, room.current_hour, roomCode, players.length]);

  // When it becomes "my" hour, open the private action modal
  useEffect(() => {
    if (iAmAwakeNow && me && modalOpenForHour !== room.current_hour) {
      setModalOpenForHour(room.current_hour);
      setActionTimeLeft(10);
      cheeseGame.logNightWake(roomCode, room.current_hour, username, me.role || 'mouse');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iAmAwakeNow, room.current_hour]);

  // Mice: keep polling the wake log while the modal is open — other players
  // sharing this hour may log their own wake a moment after ours does.
  useEffect(() => {
    if (coWakerPollRef.current) {
      clearInterval(coWakerPollRef.current);
      coWakerPollRef.current = null;
    }
    if (modalOpenForHour === null || me?.role !== 'mouse') {
      setCoWakers([]);
      return;
    }
    const poll = () => {
      cheeseGame.getNightLogForHour(roomCode, modalOpenForHour).then(log => {
        setCoWakers(log.map(l => l.username).filter(u => u.toLowerCase() !== username.toLowerCase()));
      });
    };
    poll();
    coWakerPollRef.current = setInterval(poll, 1500);
    return () => {
      if (coWakerPollRef.current) clearInterval(coWakerPollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpenForHour, roomCode]);

  // Auto-close the action modal after the 10s window
  useEffect(() => {
    if (modalOpenForHour === null) return;
    setActionTimeLeft(10);
    const interval = setInterval(() => {
      setActionTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          setModalOpenForHour(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [modalOpenForHour]);

  const handleSteal = async () => {
    await cheeseGame.thiefStealCheese(roomCode);
    refresh();
  };

  const canSecretChat = isThief || isAccomplice;
  const introInfo = me?.role ? ROLE_INTRO[me.role] : null;

  return (
    <div className={`min-h-screen relative overflow-hidden px-4 py-8 ${isDark ? 'bg-[#070811] text-zinc-100' : 'bg-indigo-950 text-white'}`}>
      {/* Starfield */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-yellow-100"
            style={{ left: `${(i * 29) % 100}%`, top: `${(i * 41) % 100}%`, fontSize: `${4 + (i % 4) * 2}px` }}
            animate={{ opacity: [0.15, 0.9, 0.15] }}
            transition={{ duration: 2 + (i % 5), repeat: Infinity, delay: i * 0.1 }}
          >
            ✦
          </motion.span>
        ))}
      </div>

      <div className="relative z-10 max-w-lg mx-auto space-y-5 text-center">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-6xl"
        >
          <Moon className="w-16 h-16 mx-auto text-indigo-200 fill-indigo-200/30" />
        </motion.div>

        <div>
          <p className="text-xs font-bold text-indigo-300 tracking-widest uppercase">คืนนี้...ทุกคนหลับตา</p>
          <AnimatePresence mode="wait">
            <motion.h1
              key={room.current_hour}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="text-5xl font-black mt-1"
            >
              {formatNightHour(room.current_hour)}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Hour progress dots */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5, 6].map(h => (
            <div
              key={h}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                h < room.current_hour ? 'bg-indigo-400' : h === room.current_hour ? 'bg-amber-400 scale-125' : 'bg-indigo-900'
              }`}
            />
          ))}
        </div>

        {!modalOpenForHour && (
          <motion.p
            key="sleeping"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-indigo-300 font-medium"
          >
            {me?.dice_hour ? `คุณจะตื่นตอน ${formatNightHour(me.dice_hour)}` : 'กำลังนับเวลา...'} 💤
          </motion.p>
        )}

        {/* Secret chat toggle for thief/accomplice */}
        {canSecretChat && (
          <div className="pt-2">
            <button
              onClick={() => setShowSecretChat(s => !s)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 active:scale-95 transition"
            >
              <MessageCircleWarning className="w-3.5 h-3.5" />
              แชทลับทีมหนูจิ๊ด {showSecretChat ? '(ซ่อน)' : ''}
            </button>
            <AnimatePresence>
              {showSecretChat && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden text-left"
                >
                  <CheeseChatPanel roomCode={roomCode} channel="thief" username={username} avatar={avatar} isDark={true} heightClass="h-40" placeholder="คุยลับกับทีมหนูจิ๊ด..." />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Private action modal */}
      <AnimatePresence>
        {modalOpenForHour !== null && me && introStage === null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-amber-500/30 p-6 text-center space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-black text-amber-400">
                  {actionTimeLeft}
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">วินาทีที่เหลือ</span>
              </div>

              {me.role === 'thief' && (
                <>
                  <div className="text-5xl">🦹🧀</div>
                  <h2 className="text-lg font-black text-rose-400">คุณคือหนูจิ๊ด!</h2>
                  <p className="text-xs text-zinc-400">หยิบก้อนชีสไปซ่อนอย่างเงียบๆ ก่อนหมดเวลา</p>
                  {room.cheese_location === 'center' ? (
                    <button
                      onClick={handleSteal}
                      className="w-full py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-rose-500 to-orange-500 text-white active:scale-95 transition shadow-lg"
                    >
                      🧀 หยิบชีสไปซ่อน!
                    </button>
                  ) : (
                    <p className="text-xs font-bold text-emerald-400">✅ คุณซ่อนชีสไว้แล้ว</p>
                  )}
                </>
              )}

              {me.role === 'accomplice' && (
                <>
                  <div className="text-5xl">🕵️</div>
                  <h2 className="text-lg font-black text-amber-400">คุณคือลูกสมุนหนูจิ๊ด!</h2>
                  <p className="text-xs text-zinc-400">จำหน้าหัวหน้าไว้ให้ดี แล้วช่วยกันบลัฟตอนเช้า</p>
                  <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                    <img src={thief?.avatar} alt={thief?.username} className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-400" />
                    <span className="font-black text-rose-300">{thief?.username || '???'}</span>
                  </div>
                </>
              )}

              {me.role === 'mouse' && (
                <>
                  <div className="text-5xl">🐭</div>
                  <h2 className="text-lg font-black text-blue-300">คุณตื่นขึ้นมากลางดึก...</h2>
                  <p className="text-xs text-zinc-400">ห้ามแตะชีสเด็ดขาด แค่แอบดูสถานการณ์</p>
                  <div className={`p-3 rounded-2xl border text-sm font-bold ${
                    room.cheese_location === 'stolen' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  }`}>
                    {room.cheese_location === 'stolen' ? '😱 ชีสหายไปแล้ว!' : '🧀 ชีสยังอยู่ตรงกลางโต๊ะ'}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 min-h-[1rem]">
                    {coWakers.length > 0 ? (
                      <>
                        <Users className="w-3.5 h-3.5" />
                        <span>ตื่นพร้อมคุณ: {coWakers.join(', ')}</span>
                      </>
                    ) : (
                      <span className="opacity-60">ยังไม่มีใครตื่นพร้อมคุณตอนนี้...</span>
                    )}
                  </div>
                </>
              )}

              <button
                onClick={() => setModalOpenForHour(null)}
                className="text-[11px] font-bold text-zinc-500 hover:text-zinc-300 transition"
              >
                หลับตาต่อ (ปิดหน้าต่างนี้)
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiting for all players to finish viewing their cards */}
      <AnimatePresence>
        {introStage === 'done' && room.current_hour === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md px-4"
          >
            <div className="w-full max-w-sm text-center space-y-5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="text-5xl mx-auto w-fit"
              >
                🌙
              </motion.div>
              <h2 className="text-xl font-black text-indigo-200">รอเพื่อนๆ ดูการ์ดของตัวเองก่อน...</h2>
              <div className="flex flex-wrap justify-center gap-2">
                {players.map(p => {
                  const isReady = readyUsernames.includes(p.username);
                  return (
                    <div
                      key={p.username}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-bold transition-all ${
                        isReady
                          ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                          : 'bg-zinc-800/50 border-zinc-700 text-zinc-500'
                      }`}
                    >
                      <span>{isReady ? '✅' : '⏳'}</span>
                      <span>{p.username}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-zinc-500">
                {readyUsernames.length}/{players.length} คนพร้อมแล้ว — เกมจะเริ่มเมื่อทุกคนพร้อม
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* One-time role + wake-hour reveal, shown when the night begins.
          The player taps their own card / dice to flip it themselves. */}
      <AnimatePresence>
        {introStage !== null && introStage !== 'done' && introInfo && me && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md px-4"
          >
            <div className="w-full max-w-sm text-center">
              {(introStage === 'role-waiting' || introStage === 'role-spin' || introStage === 'role-reveal') && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    {introStage === 'role-reveal' ? 'นี่คือบทบาทของคุณ' : 'การ์ดบทบาทของคุณ'}
                  </p>

                  {introStage === 'role-waiting' ? (
                    <motion.button
                      onClick={() => setIntroStage('role-spin')}
                      animate={{ boxShadow: ['0 0 0px rgba(245,158,11,0.4)', '0 0 30px rgba(245,158,11,0.6)', '0 0 0px rgba(245,158,11,0.4)'] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                      whileTap={{ scale: 0.92 }}
                      className="mx-auto w-40 h-52 rounded-3xl border-2 border-dashed border-amber-400/60 bg-zinc-900 flex flex-col items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="text-5xl">🎴</span>
                      <span className="text-[11px] font-black text-amber-300 px-3">แตะเพื่อเปิดการ์ด</span>
                    </motion.button>
                  ) : (
                    <motion.div
                      key={introStage}
                      className={`mx-auto w-40 h-52 rounded-3xl border-2 flex items-center justify-center ${
                        introStage === 'role-spin' ? 'bg-zinc-900 border-amber-400/50 shadow-2xl' : `${introInfo.cardBg} ${introInfo.cardBorder} ${introInfo.glow}`
                      }`}
                      animate={introStage === 'role-spin' ? { rotateY: [0, 180, 360, 540] } : { rotateY: 0, scale: [0.7, 1.08, 1] }}
                      transition={introStage === 'role-spin' ? { duration: 0.9, ease: 'easeInOut' } : { duration: 0.5 }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {introStage === 'role-spin' ? (
                        <span className="text-6xl">❓</span>
                      ) : (
                        <span className="text-7xl">{introInfo.emoji}</span>
                      )}
                    </motion.div>
                  )}

                  {introStage === 'role-reveal' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <h2 className={`text-2xl font-black ${introInfo.color}`}>{introInfo.title}</h2>
                      <p className="text-xs text-zinc-400 max-w-xs mx-auto">{introInfo.desc}</p>
                      <button
                        onClick={() => setIntroStage('hour-waiting')}
                        className="px-6 py-2.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-400 to-orange-400 text-zinc-950 active:scale-95 transition shadow-lg"
                      >
                        ต่อไป: ทอยเต๋าเวลาตื่น →
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {(introStage === 'hour-waiting' || introStage === 'hour-spin' || introStage === 'hour-reveal') && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">เต๋าหาชั่วโมงตื่นกลางดึก</p>

                  {introStage === 'hour-waiting' ? (
                    <motion.button
                      onClick={() => setIntroStage('hour-spin')}
                      animate={{ boxShadow: ['0 0 0px rgba(129,140,248,0.4)', '0 0 30px rgba(129,140,248,0.6)', '0 0 0px rgba(129,140,248,0.4)'] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                      whileTap={{ scale: 0.9 }}
                      className="mx-auto w-28 h-28 rounded-2xl border-2 border-dashed border-indigo-400/60 bg-zinc-900 flex flex-col items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="text-4xl">🎲</span>
                      <span className="text-[9px] font-black text-indigo-300">แตะเพื่อทอย</span>
                    </motion.button>
                  ) : (
                    <motion.div
                      key={introStage}
                      className="mx-auto w-28 h-28 rounded-2xl border-2 border-indigo-400/50 bg-zinc-900 flex items-center justify-center shadow-2xl text-5xl font-black text-indigo-200"
                      animate={introStage === 'hour-spin' ? { rotate: [0, 120, 240, 360, 480] } : { rotate: 0, scale: [0.7, 1.1, 1] }}
                      transition={introStage === 'hour-spin' ? { duration: 0.9, ease: 'easeInOut' } : { duration: 0.4 }}
                    >
                      {introStage === 'hour-spin' ? '🎲' : (me.dice_hour ?? '?')}
                    </motion.div>
                  )}

                  {introStage === 'hour-reveal' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <p className="text-lg font-black text-indigo-200">
                        คุณจะตื่นตอน {formatNightHour(me.dice_hour || 1)}
                      </p>
                      <button
                        onClick={async () => {
                          if (me) {
                            await cheeseGame.markReadyForNight(roomCode, username, me.role || 'mouse');
                          }
                          setIntroStage('done');
                        }}
                        className="px-6 py-2.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-400 to-orange-400 text-zinc-950 active:scale-95 transition shadow-lg"
                      >
                        เข้าใจแล้ว เริ่มคืนนี้เลย!
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
