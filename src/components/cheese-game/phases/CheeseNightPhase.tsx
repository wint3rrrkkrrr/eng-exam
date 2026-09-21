import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, MessageCircleWarning } from 'lucide-react';
import { cheeseGame, formatNightHour, isBot } from '../../../utils/cheeseGameClient';
import type { CheeseRole } from '../../../utils/cheeseGameClient';
import { CheeseChatPanel } from '../CheeseChatPanel';
import { CheesePhaseProps } from './types';

const HOUR_DURATION_MS = 13000;

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

function isImageUrl(s: string) {
  return s.startsWith('http') || s.startsWith('data:') || s.startsWith('/') || s.startsWith('blob:');
}

function MouseIcon({
  avatar,
  username,
  size = 44,
  state,
}: {
  avatar: string;
  username: string;
  size?: number;
  state: 'sleeping' | 'awake' | 'neutral';
}) {
  const isSleeping = state === 'sleeping';
  const isAwake = state === 'awake';

  return (
    <div className="flex flex-col items-center gap-1" style={{ width: size + 16 }}>
      <div className="relative">
        <div
          className={`rounded-full overflow-hidden transition-all duration-500 ${
            isAwake
              ? 'ring-[3px] ring-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.7)]'
              : isSleeping
              ? 'ring-2 ring-zinc-700 grayscale opacity-40'
              : 'ring-2 ring-zinc-600'
          }`}
          style={{ width: size, height: size }}
        >
          {isImageUrl(avatar) ? (
            <img src={avatar} alt={username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center" style={{ fontSize: size * 0.5 }}>
              {avatar}
            </div>
          )}
        </div>

        {/* sleeping / awake badge */}
        {isSleeping && (
          <span className="absolute -top-1 -right-1 text-xs leading-none">💤</span>
        )}
        {isAwake && (
          <motion.span
            className="absolute -top-1 -right-1 text-xs leading-none"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            👁️
          </motion.span>
        )}
      </div>

      <span
        className={`text-[8px] font-bold truncate text-center max-w-[56px] ${
          isAwake ? 'text-amber-300' : isSleeping ? 'text-zinc-600' : 'text-zinc-400'
        }`}
      >
        {username}
      </span>
    </div>
  );
}

export const CheeseNightPhase: React.FC<CheesePhaseProps> = ({
  room,
  players,
  username,
  avatar,
  isDark,
  isHost,
  roomCode,
  refresh,
}) => {
  const me = players.find(p => p.username.toLowerCase() === username.toLowerCase());

  const [awakeWithMe, setAwakeWithMe] = useState<{ username: string; role: string }[]>([]);
  const [showSecretChat, setShowSecretChat] = useState(false);
  const [stealDone, setStealDone] = useState(false);
  const [actionTimeLeft, setActionTimeLeft] = useState(10);
  const [accompliceSelecting, setAccompliceSelecting] = useState(false);
  const [pickedAccomplices, setPickedAccomplices] = useState<string[]>([]);
  const [accompliceSubmitted, setAccompliceSubmitted] = useState(false);
  const [skipChatVoted, setSkipChatVoted] = useState(false);
  const [skipChatVoteCount, setSkipChatVoteCount] = useState(0);
  const [chatSecondsLeft, setChatSecondsLeft] = useState(30);

  const [readyUsernames, setReadyUsernames] = useState<string[]>([]);
  const [introStage, setIntroStage] = useState<
    'role-waiting' | 'role-spin' | 'role-reveal' | 'hour-waiting' | 'hour-spin' | 'hour-reveal' | 'done' | null
  >(null);

  const advancingRef = useRef(false);
  const introTriggeredRef = useRef(false);
  const wakeLoggedForHourRef = useRef<number | null>(null);

  const isThief = me?.role === 'thief';
  const isAccomplice = me?.role === 'accomplice';
  const iAmAwakeNow = !!(me?.dice_hour && me.dice_hour === room.current_hour && room.current_hour >= 1 && room.current_hour <= 6);
  const canSecretChat = (isThief || isAccomplice) && room.current_hour < 7;
  const isPostDawn = room.current_hour === 7;
  const dawnChatStarted = isPostDawn && !!room.day_phase_ends_at;

  // ---- intro: one-time role+dice reveal ----
  useEffect(() => {
    if (!me || introTriggeredRef.current) return;
    if (room.current_hour < 0) return;
    const seenKey = `cheese_intro_seen_${roomCode}`;
    try {
      if (sessionStorage.getItem(seenKey)) { introTriggeredRef.current = true; return; }
      sessionStorage.setItem(seenKey, '1');
    } catch { /* ignore */ }
    introTriggeredRef.current = true;
    setIntroStage('role-waiting');
  }, [me, room.current_hour, roomCode]);

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

  // ---- poll ready list at hour 0 ----
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

  // ---- host drives clock ----
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

    // Hour 7: post-dawn phase — thief picks accomplices then 30s chat
    if (room.current_hour === 7) {
      let cancelled = false;
      let chatTimerSet = !!room.day_phase_ends_at;

      const tryAdvance = async () => {
        if (cancelled || advancingRef.current) return;
        const ps = await cheeseGame.getPlayers(roomCode);
        const accomplicesDone = ps.filter(p => p.role === 'accomplice').length >= room.accomplice_count;

        // Phase 1: wait for accomplice selection, then kick off 30s chat timer
        if (!chatTimerSet && (accomplicesDone || room.accomplice_count === 0)) {
          chatTimerSet = true;
          await cheeseGame.startDawnChatTimer(roomCode);
          return;
        }

        // Phase 2: chat running — check skip votes or timer expiry
        if (chatTimerSet) {
          const room2 = await cheeseGame.getRoom(roomCode);
          if (!room2?.day_phase_ends_at) return;
          const endsAt = new Date(room2.day_phase_ends_at).getTime();
          const skipVotes = await cheeseGame.getSkipChatVotes(roomCode);
          const neededSkips = 1 + room.accomplice_count;
          if (Date.now() >= endsAt || skipVotes.length >= neededSkips) {
            advancingRef.current = true;
            await cheeseGame.startDayTimer(roomCode, room.discussion_seconds);
            advancingRef.current = false;
            refresh();
          }
        }
      };

      const interval = setInterval(tryAdvance, 1500);
      tryAdvance();
      const safetyTimeout = setTimeout(async () => {
        if (cancelled || advancingRef.current) return;
        advancingRef.current = true;
        await cheeseGame.startDayTimer(roomCode, room.discussion_seconds);
        advancingRef.current = false;
        refresh();
      }, 90000);
      return () => { cancelled = true; clearInterval(interval); clearTimeout(safetyTimeout); };
    }

    // Hours 1–6: advance after HOUR_DURATION_MS
    const timer = setTimeout(async () => {
      if (advancingRef.current) return;
      advancingRef.current = true;
      await cheeseGame.advanceHour(roomCode, room.current_hour + 1);
      advancingRef.current = false;
      refresh();
    }, HOUR_DURATION_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, room.current_hour, roomCode, players.length]);

  // ---- log my wake + poll co-wakers when it's my hour ----
  useEffect(() => {
    if (!iAmAwakeNow || !me) return;

    // log wake only once per hour
    if (wakeLoggedForHourRef.current !== room.current_hour) {
      wakeLoggedForHourRef.current = room.current_hour;
      cheeseGame.logNightWake(roomCode, room.current_hour, username, me.role || 'mouse');
      setActionTimeLeft(10);
    }

    let active = true;
    const poll = async () => {
      const log = await cheeseGame.getNightLogForHour(roomCode, room.current_hour);
      if (active) setAwakeWithMe(log.filter(l => l.username.toLowerCase() !== username.toLowerCase()));
    };
    poll();
    const interval = setInterval(poll, 1500);
    return () => { active = false; clearInterval(interval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iAmAwakeNow, room.current_hour, roomCode]);

  // clear co-wakers when hour changes away from mine
  useEffect(() => {
    if (!iAmAwakeNow) setAwakeWithMe([]);
  }, [iAmAwakeNow]);

  // hour 7 dawn chat: countdown + skip vote polling
  useEffect(() => {
    if (!dawnChatStarted || !room.day_phase_ends_at) return;
    const endsAt = new Date(room.day_phase_ends_at).getTime();

    const tick = () => {
      setChatSecondsLeft(Math.max(0, Math.round((endsAt - Date.now()) / 1000)));
    };
    tick();
    const timer = setInterval(tick, 500);

    if (isThief || isAccomplice) {
      const pollSkip = async () => {
        const votes = await cheeseGame.getSkipChatVotes(roomCode);
        setSkipChatVoteCount(votes.length);
        if (votes.includes(username)) setSkipChatVoted(true);
      };
      pollSkip();
      const pollInterval = setInterval(pollSkip, 1500);
      return () => { clearInterval(timer); clearInterval(pollInterval); };
    }
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dawnChatStarted, room.day_phase_ends_at, roomCode]);

  // ---- host drives bots ----
  const botActedForHourRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isHost) return;

    // Mark bots ready at hour 0
    if (room.current_hour === 0) {
      players.filter(p => isBot(p) && p.role).forEach(bot => {
        cheeseGame.markReadyForNight(roomCode, bot.username, bot.role as CheeseRole);
      });
      return;
    }

    if (room.current_hour < 1 || room.current_hour > 7) return;
    if (botActedForHourRef.current === room.current_hour) return;
    botActedForHourRef.current = room.current_hour;

    // Hours 1–6: wake bots that match, thief bot steals
    if (room.current_hour >= 1 && room.current_hour <= 6) {
      const awake = players.filter(p => isBot(p) && p.dice_hour === room.current_hour && p.role);
      awake.forEach(bot => {
        cheeseGame.logNightWake(roomCode, bot.username, bot.role as CheeseRole);
      });
      const thiefBot = awake.find(b => b.role === 'thief');
      if (thiefBot) {
        setTimeout(() => cheeseGame.thiefStealCheese(roomCode), 1200 + Math.random() * 1500);
      }
    }

    // Hour 7: bot thief picks accomplices
    if (room.current_hour === 7) {
      const thiefBot = players.find(p => isBot(p) && p.role === 'thief');
      if (thiefBot && room.accomplice_count > 0) {
        const eligible = players.filter(p => p.username !== thiefBot.username);
        const picks = [...eligible].sort(() => Math.random() - 0.5).slice(0, room.accomplice_count).map(p => p.username);
        setTimeout(() => cheeseGame.thiefAssignAccomplices(roomCode, picks), 1000 + Math.random() * 1200);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, room.current_hour, roomCode]);

  // Bot skip-chat vote when dawn chat starts
  useEffect(() => {
    if (!isHost || !dawnChatStarted) return;
    const botTeam = players.filter(p => isBot(p) && (p.role === 'thief' || p.role === 'accomplice'));
    botTeam.forEach((bot, i) => {
      setTimeout(() => cheeseGame.logSkipChatVote(roomCode, bot.username), 600 + i * 300);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, dawnChatStarted, roomCode]);

  // ---- action countdown ----
  useEffect(() => {
    if (!iAmAwakeNow) return;
    setActionTimeLeft(10);
    const interval = setInterval(() => {
      setActionTimeLeft(t => (t <= 1 ? (clearInterval(interval), 0) : t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [iAmAwakeNow, room.current_hour]);

  const handleSteal = async () => {
    await cheeseGame.thiefStealCheese(roomCode);
    setStealDone(true);
    refresh();
  };

  // Who did I see steal (only visible if they woke at same hour as me)
  const witnessedThief = iAmAwakeNow ? awakeWithMe.find(l => l.role === 'thief') : null;
  const cheeseStolen = room.cheese_location === 'stolen';
  // Accomplice: find the thief among co-wakers (only if same-hour)
  const thiefAmongCoWakers = awakeWithMe.find(l => l.role === 'thief');
  const knownThief = isAccomplice && thiefAmongCoWakers
    ? players.find(p => p.username === thiefAmongCoWakers.username)
    : null;

  // ---- circle layout math ----
  const CONTAINER = 280;
  const RADIUS = 104;
  const cx = CONTAINER / 2;
  const cy = CONTAINER / 2;

  const circlePositions = players.map((p, i) => {
    const angle = (i / players.length) * 2 * Math.PI - Math.PI / 2;
    return {
      player: p,
      x: cx + RADIUS * Math.cos(angle),
      y: cy + RADIUS * Math.sin(angle),
    };
  });

  const getMouseState = (p: typeof players[0]): 'sleeping' | 'awake' | 'neutral' => {
    if (!iAmAwakeNow) return 'sleeping';
    const isSelf = p.username.toLowerCase() === username.toLowerCase();
    if (isSelf) return 'awake';
    if (awakeWithMe.some(w => w.username.toLowerCase() === p.username.toLowerCase())) return 'awake';
    return 'sleeping';
  };

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

      <div className="relative z-10 max-w-lg mx-auto text-center space-y-4">
        {/* Moon + hour */}
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
          <Moon className="w-10 h-10 mx-auto text-indigo-200 fill-indigo-200/30" />
        </motion.div>

        <div>
          <p className="text-[10px] font-bold text-indigo-300 tracking-widest uppercase">คืนนี้...ทุกคนหลับตา</p>
          <AnimatePresence mode="wait">
            <motion.h1
              key={room.current_hour}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="text-4xl font-black mt-0.5"
            >
              {formatNightHour(room.current_hour)}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Hour dots */}
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

        {/* ===== CIRCLE OF MICE ===== */}
        <div className="relative mx-auto" style={{ width: CONTAINER, height: CONTAINER }}>
          {/* Players */}
          {circlePositions.map(({ player, x, y }) => {
            const state = getMouseState(player);
            return (
              <div
                key={player.username}
                className="absolute"
                style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
              >
                <MouseIcon
                  avatar={player.avatar}
                  username={player.username}
                  size={42}
                  state={state}
                />
              </div>
            );
          })}

          {/* Center cheese */}
          <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            <motion.div
              animate={cheeseStolen ? { opacity: 0.25, scale: 0.85 } : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-5xl select-none"
            >
              {cheeseStolen ? '🕳️' : '🧀'}
            </motion.div>
            {cheeseStolen && iAmAwakeNow && (
              <p className="text-[8px] font-black text-rose-400 text-center mt-0.5 whitespace-nowrap">ชีสหายแล้ว!</p>
            )}
          </div>
        </div>

        {/* My hour status */}
        {!iAmAwakeNow && introStage === null && (
          <p className="text-xs text-indigo-400 font-medium">
            {me?.dice_hour ? `คุณจะตื่นตอน ${formatNightHour(me.dice_hour)}` : 'กำลังนับเวลา...'} 💤
          </p>
        )}

        {/* ===== MY HOUR ACTION PANEL ===== */}
        <AnimatePresence>
          {iAmAwakeNow && introStage === null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="rounded-3xl bg-zinc-900/90 border border-amber-500/30 p-4 space-y-3 shadow-2xl backdrop-blur-sm"
            >
              {/* Timer */}
              <div className="flex items-center justify-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-black text-amber-400">
                  {actionTimeLeft}
                </div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">วินาที</span>
              </div>

              {/* Co-wakers banner */}
              {awakeWithMe.length > 0 && (
                <div className="flex items-center justify-center gap-1 flex-wrap text-xs text-amber-300 font-bold">
                  <span>ตื่นพร้อมคุณ:</span>
                  {awakeWithMe.map(w => (
                    <span key={w.username} className="px-1.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30">
                      {w.username}
                    </span>
                  ))}
                </div>
              )}
              {awakeWithMe.length === 0 && (
                <p className="text-[10px] text-zinc-500 text-center">ไม่มีใครตื่นพร้อมคุณตอนนี้...</p>
              )}

              {/* THIEF actions */}
              {isThief && (
                <div className="space-y-2">
                  {!cheeseStolen && !stealDone ? (
                    <button
                      onClick={handleSteal}
                      className="w-full py-2.5 rounded-2xl font-black text-sm bg-gradient-to-r from-rose-500 to-orange-500 text-white active:scale-95 transition shadow-lg"
                    >
                      🧀 หยิบชีสไปซ่อน!
                    </button>
                  ) : (
                    <p className="text-xs font-bold text-emerald-400 text-center">✅ คุณซ่อนชีสไว้แล้ว</p>
                  )}
                  <p className="text-[9px] text-zinc-500 text-center">
                    {awakeWithMe.length > 0
                      ? `⚠️ มีคนเห็น: ${awakeWithMe.map(w => w.username).join(', ')}`
                      : 'ไม่มีใครตื่นพร้อมคุณ — ปลอดภัย!'}
                  </p>
                </div>
              )}

              {/* ACCOMPLICE: see thief */}
              {isAccomplice && (
                <div className="space-y-1.5">
                  {knownThief ? (
                    <div className="flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                      <span className="text-lg">
                        {isImageUrl(knownThief.avatar) ? (
                          <img src={knownThief.avatar} className="w-8 h-8 rounded-full object-cover ring-2 ring-rose-400" alt={knownThief.username} />
                        ) : (
                          <span>{knownThief.avatar}</span>
                        )}
                      </span>
                      <span className="font-black text-rose-300 text-sm">{knownThief.username} คือหัวหน้า!</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-500">หนูจิ๊ดไม่ได้ตื่นชั่วโมงเดียวกัน — จำหน้าต่อตอนเช้า</p>
                  )}
                  {cheeseStolen && <p className="text-[10px] font-bold text-rose-400 text-center">🧀 ชีสถูกขโมยแล้ว</p>}
                </div>
              )}

              {/* NORMAL MOUSE */}
              {me?.role === 'mouse' && (
                <div className="space-y-2">
                  <div className={`p-2.5 rounded-2xl border text-xs font-bold text-center ${
                    cheeseStolen
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  }`}>
                    {cheeseStolen
                      ? witnessedThief
                        ? `😱 ${witnessedThief.username} ขโมยชีสต่อหน้าคุณ!`
                        : '😱 ชีสหายไปแล้ว! ใครเอาไปก็ไม่รู้'
                      : '🧀 ชีสยังอยู่ตรงกลางโต๊ะ'}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== HOUR 7 (รุ่งอรุณ): POST-DAWN SELECTION + CHAT ===== */}
        {isPostDawn && introStage === null && (
          <>
            {/* Non-team: sleeping message */}
            {!isThief && !isAccomplice && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-indigo-300 font-medium"
              >
                ทุกคนหลับตา รอสักครู่... 🌅
              </motion.p>
            )}

            {/* Thief + accomplice overlay */}
            {(isThief || isAccomplice) && (
              <AnimatePresence mode="wait">
                {!dawnChatStarted ? (
                  /* --- Selection phase --- */
                  <motion.div
                    key="selection"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4"
                  >
                    {isThief && !accompliceSubmitted && room.accomplice_count > 0 ? (
                      <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-rose-500/40 p-5 space-y-4 shadow-2xl">
                        <div className="text-center space-y-1">
                          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">รุ่งอรุณ — ทุกคนหลับตา</p>
                          <h2 className="text-lg font-black text-rose-300">เลือกลูกสมุน</h2>
                          <p className="text-[11px] text-zinc-400">
                            เลือกได้ {room.accomplice_count} คน — คนที่เลือกจะเป็นพวกคุณในตอนเช้า
                          </p>
                        </div>
                        <div className="space-y-2 max-h-52 overflow-y-auto">
                          {players.filter(p => p.username.toLowerCase() !== username.toLowerCase()).map(p => {
                            const picked = pickedAccomplices.includes(p.username);
                            const maxReached = pickedAccomplices.length >= room.accomplice_count;
                            return (
                              <button
                                key={p.username}
                                onClick={() => {
                                  if (picked) setPickedAccomplices(prev => prev.filter(u => u !== p.username));
                                  else if (!maxReached) setPickedAccomplices(prev => [...prev, p.username]);
                                }}
                                className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border transition active:scale-95 ${
                                  picked ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                                    : maxReached ? 'opacity-40 border-zinc-700 text-zinc-500 cursor-not-allowed'
                                    : 'bg-zinc-800/60 border-zinc-700 hover:border-rose-400/50 text-zinc-200'
                                }`}
                              >
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-zinc-600">
                                  {isImageUrl(p.avatar)
                                    ? <img src={p.avatar} className="w-full h-full object-cover" alt={p.username} />
                                    : <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-sm">{p.avatar}</div>}
                                </div>
                                <span className="font-bold text-sm">{p.username}</span>
                                {picked && <span className="ml-auto text-rose-400 text-lg">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          disabled={pickedAccomplices.length !== room.accomplice_count || accompliceSelecting}
                          onClick={async () => {
                            setAccompliceSelecting(true);
                            await cheeseGame.thiefAssignAccomplices(roomCode, pickedAccomplices);
                            setAccompliceSubmitted(true);
                            setAccompliceSelecting(false);
                          }}
                          className="w-full py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-rose-500 to-orange-500 text-white active:scale-95 transition shadow-lg disabled:opacity-40"
                        >
                          {accompliceSelecting ? 'กำลังยืนยัน...' : `ยืนยัน (${pickedAccomplices.length}/${room.accomplice_count} คน)`}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          className="text-4xl mx-auto w-fit"
                        >
                          🌅
                        </motion.div>
                        <p className="text-sm font-black text-indigo-200">
                          {isThief ? 'รอเริ่มช่วงพูดคุย...' : 'หัวหน้ากำลังเลือกทีม...'}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* --- Chat phase: 30s private chat --- */
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md pb-0"
                  >
                    <div className="w-full max-w-sm rounded-t-3xl bg-zinc-900 border-t border-x border-rose-500/30 p-4 space-y-3 shadow-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">ก่อนทุกคนลืมตา</p>
                          <p className="text-sm font-black text-rose-200">คุยลับกับทีม</p>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
                          chatSecondsLeft <= 10 ? 'bg-rose-500/30 text-rose-300 animate-pulse' : 'bg-zinc-800 text-amber-300'
                        }`}>
                          {chatSecondsLeft}
                        </div>
                      </div>

                      <CheeseChatPanel
                        roomCode={roomCode}
                        channel="thief"
                        username={username}
                        avatar={avatar}
                        isDark={true}
                        heightClass="h-40"
                        placeholder="พิมพ์ข้อความถึงทีม..."
                      />

                      <button
                        disabled={skipChatVoted}
                        onClick={async () => {
                          await cheeseGame.logSkipChatVote(roomCode, username);
                          setSkipChatVoted(true);
                        }}
                        className={`w-full py-2.5 rounded-2xl font-black text-xs transition active:scale-95 ${
                          skipChatVoted
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                        }`}
                      >
                        {skipChatVoted
                          ? `✅ คุณโหวตข้ามแล้ว (${skipChatVoteCount}/${1 + room.accomplice_count})`
                          : `ข้ามการพูดคุย (${skipChatVoteCount}/${1 + room.accomplice_count})`}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </>
        )}

        {/* Secret chat for thief/accomplice */}
        {canSecretChat && introStage === null && (
          <div className="pt-1">
            <button
              onClick={() => setShowSecretChat(s => !s)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 active:scale-95 transition"
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
                  className="mt-2 overflow-hidden text-left"
                >
                  <CheeseChatPanel roomCode={roomCode} channel="thief" username={username} avatar={avatar} isDark={true} heightClass="h-36" placeholder="คุยลับกับทีมหนูจิ๊ด..." />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ===== WAITING FOR ALL READY (hour 0) ===== */}
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

      {/* ===== INTRO OVERLAY (role + dice reveal) ===== */}
      <AnimatePresence>
        {introStage !== null && introStage !== 'done' && introInfo && me && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md px-4"
          >
            <div className="w-full max-w-sm text-center">
              {/* Role reveal */}
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
                        introStage === 'role-spin'
                          ? 'bg-zinc-900 border-amber-400/50 shadow-2xl'
                          : `${introInfo.cardBg} ${introInfo.cardBorder} ${introInfo.glow}`
                      }`}
                      animate={introStage === 'role-spin' ? { rotateY: [0, 180, 360, 540] } : { rotateY: 0, scale: [0.7, 1.08, 1] }}
                      transition={introStage === 'role-spin' ? { duration: 0.9, ease: 'easeInOut' } : { duration: 0.5 }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {introStage === 'role-spin' ? <span className="text-6xl">❓</span> : <span className="text-7xl">{introInfo.emoji}</span>}
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

              {/* Dice reveal */}
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
                          if (me) await cheeseGame.markReadyForNight(roomCode, username, me.role || 'mouse');
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
