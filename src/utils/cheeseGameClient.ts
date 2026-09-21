import { supabase } from './supabaseClient';

export type CheesePhase = 'lobby' | 'night' | 'day' | 'voting' | 'ended';
export type CheeseRole = 'mouse' | 'thief' | 'accomplice';

export interface CheeseRoom {
  room_code: string;
  host_username: string;
  phase: CheesePhase;
  current_hour: number;
  cheese_location: 'center' | 'stolen';
  accomplice_count: number;
  discussion_seconds: number;
  day_phase_ends_at: string | null;
  vote_round: number;
  winner: 'mice' | 'thief' | null;
  revealed_usernames: string[];
  created_at: string;
}

export interface CheesePlayer {
  room_code: string;
  username: string;
  avatar: string;
  role: CheeseRole | null;
  dice_hour: number | null;
  is_host: boolean;
  is_kicked: boolean;
  joined_at: string;
}

export interface CheeseChatMsg {
  id: string;
  room_code: string;
  sender: string;
  avatar: string;
  text: string;
  channel: 'main' | 'thief';
  timestamp: string;
}

export interface CheeseVote {
  room_code: string;
  round: number;
  voter: string;
  target: string;
  voted_at: string;
}

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I confusion

function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

// Thai convention: 1am-5am is "ตี X", but 6am breaks that pattern and is said as "6 โมง(เช้า)".
export function formatNightHour(hour: number): string {
  if (hour >= 6) return '6 โมง';
  return `ตี ${hour}`;
}

export function recommendedAccompliceCount(playerCount: number): number {
  if (playerCount <= 5) return 0;
  if (playerCount <= 7) return 1;
  if (playerCount <= 9) return 2;
  return 3;
}

export const cheeseGame = {
  // ---- Room lifecycle ----
  createRoom: async (hostUsername: string, avatar: string): Promise<string> => {
    const clean = hostUsername.trim();
    let code = generateRoomCode();
    // Extremely unlikely collision, but guard anyway
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data } = await supabase.from('cheese_rooms').select('room_code').eq('room_code', code).maybeSingle();
      if (!data) break;
      code = generateRoomCode();
    }
    const { error } = await supabase.from('cheese_rooms').insert({
      room_code: code,
      host_username: clean,
      phase: 'lobby',
      current_hour: 0,
      cheese_location: 'center',
      accomplice_count: 1,
      discussion_seconds: 180,
      vote_round: 1,
      revealed_usernames: [],
    });
    if (error) throw error;
    await supabase.from('cheese_players').insert({
      room_code: code,
      username: clean,
      avatar,
      is_host: true,
    });
    return code;
  },

  joinRoom: async (roomCode: string, username: string, avatar: string): Promise<{ success: boolean; message: string }> => {
    const code = roomCode.trim().toUpperCase();
    const clean = username.trim();
    const { data: room } = await supabase.from('cheese_rooms').select('*').eq('room_code', code).maybeSingle();
    if (!room) return { success: false, message: 'ไม่พบห้องนี้ เช็ครหัสห้องอีกครั้ง' };
    if (room.phase !== 'lobby') return { success: false, message: 'เกมเริ่มไปแล้ว เข้าร่วมไม่ได้' };

    const { data: existing } = await supabase.from('cheese_players').select('*').eq('room_code', code).eq('username', clean).maybeSingle();
    if (existing) {
      if (existing.is_kicked) return { success: false, message: 'คุณถูกเตะออกจากห้องนี้แล้ว' };
      return { success: true, message: 'กลับเข้าห้องแล้ว' };
    }

    const { data: players } = await supabase.from('cheese_players').select('username').eq('room_code', code).eq('is_kicked', false);
    if (players && players.some(p => p.username.toLowerCase() === clean.toLowerCase())) {
      return { success: false, message: 'ชื่อนี้มีคนใช้ในห้องแล้ว ลองเปลี่ยนชื่อ' };
    }

    const { error } = await supabase.from('cheese_players').insert({
      room_code: code,
      username: clean,
      avatar,
      is_host: false,
    });
    if (error) return { success: false, message: 'เข้าห้องไม่สำเร็จ ลองใหม่อีกครั้ง' };
    return { success: true, message: 'เข้าห้องสำเร็จ!' };
  },

  leaveRoom: async (roomCode: string, username: string) => {
    await supabase.from('cheese_players').delete().eq('room_code', roomCode).eq('username', username);
  },

  kickPlayer: async (roomCode: string, username: string) => {
    await supabase.from('cheese_players').update({ is_kicked: true }).eq('room_code', roomCode).eq('username', username);
  },

  updateSettings: async (roomCode: string, settings: { accomplice_count?: number; discussion_seconds?: number }) => {
    await supabase.from('cheese_rooms').update(settings).eq('room_code', roomCode);
  },

  getRoom: async (roomCode: string): Promise<CheeseRoom | null> => {
    const { data } = await supabase.from('cheese_rooms').select('*').eq('room_code', roomCode).maybeSingle();
    return data as CheeseRoom | null;
  },

  getPlayers: async (roomCode: string): Promise<CheesePlayer[]> => {
    const { data } = await supabase.from('cheese_players').select('*').eq('room_code', roomCode).eq('is_kicked', false).order('joined_at', { ascending: true });
    return (data || []) as CheesePlayer[];
  },

  // ---- Game start: assign roles + dice hours ----
  startGame: async (roomCode: string, accompliceCountOverride?: number): Promise<{ success: boolean; message: string }> => {
    const players = await cheeseGame.getPlayers(roomCode);
    if (players.length < 4) return { success: false, message: 'ต้องมีผู้เล่นอย่างน้อย 4 คนถึงจะเริ่มได้' };

    const room = await cheeseGame.getRoom(roomCode);
    const accompliceCount = Math.min(
      accompliceCountOverride ?? room?.accomplice_count ?? recommendedAccompliceCount(players.length),
      Math.max(0, Math.floor(players.length / 3))
    );

    const shuffled = [...players].sort(() => Math.random() - 0.5);
    // Accomplice roles are NOT assigned at start — thief picks them at hour 6
    const roles: CheeseRole[] = [
      'thief',
      ...Array(Math.max(0, shuffled.length - 1)).fill('mouse'),
    ];

    const updates = shuffled.map((p, i) => ({
      room_code: roomCode,
      username: p.username,
      role: roles[i],
      dice_hour: 1 + Math.floor(Math.random() * 5), // ตี 1–5 only; hour 6 = 6 โมง (thief-selection phase)
    }));

    for (const u of updates) {
      await supabase.from('cheese_players').update({ role: u.role, dice_hour: u.dice_hour }).eq('room_code', roomCode).eq('username', u.username);
    }

    await supabase.from('cheese_rooms').update({
      phase: 'night',
      current_hour: 0, // 0 = everyone is still viewing their role/dice card; the hour clock hasn't started
      cheese_location: 'center',
      accomplice_count: accompliceCount,
      winner: null,
      revealed_usernames: [],
      vote_round: 1,
    }).eq('room_code', roomCode);

    return { success: true, message: 'เริ่มเกม!' };
  },

  // ---- Night phase ----
  // A player calls this once they've tapped through their own role+dice
  // reveal, so the host knows when it's safe to start the real hour clock —
  // otherwise someone whose dice says "hour 1" could still be looking at
  // their card when hour 1 already came and went.
  markReadyForNight: async (roomCode: string, username: string, role: CheeseRole) => {
    await supabase.from('cheese_night_log').upsert({ room_code: roomCode, hour: 0, username, role }, { onConflict: 'room_code,hour,username' });
  },

  getReadyCount: async (roomCode: string): Promise<number> => {
    const log = await cheeseGame.getNightLogForHour(roomCode, 0);
    return log.length;
  },

  advanceHour: async (roomCode: string, nextHour: number) => {
    if (nextHour > 6) {
      await supabase.from('cheese_rooms').update({ phase: 'day', current_hour: 6, day_phase_ends_at: null }).eq('room_code', roomCode);
    } else {
      await supabase.from('cheese_rooms').update({ current_hour: nextHour }).eq('room_code', roomCode);
    }
  },

  startDayTimer: async (roomCode: string, seconds: number) => {
    const endsAt = new Date(Date.now() + seconds * 1000).toISOString();
    await supabase.from('cheese_rooms').update({ phase: 'day', day_phase_ends_at: endsAt }).eq('room_code', roomCode);
  },

  logNightWake: async (roomCode: string, hour: number, username: string, role: CheeseRole) => {
    await supabase.from('cheese_night_log').upsert({ room_code: roomCode, hour, username, role }, { onConflict: 'room_code,hour,username' });
  },

  getNightLogForHour: async (roomCode: string, hour: number): Promise<{ username: string; role: string }[]> => {
    const { data } = await supabase.from('cheese_night_log').select('username, role').eq('room_code', roomCode).eq('hour', hour);
    return data || [];
  },

  thiefStealCheese: async (roomCode: string) => {
    await supabase.from('cheese_rooms').update({ cheese_location: 'stolen' }).eq('room_code', roomCode);
  },

  // Thief picks accomplices at hour 6 (instead of random assignment at game start)
  thiefAssignAccomplices: async (roomCode: string, usernames: string[]) => {
    for (const u of usernames) {
      await supabase.from('cheese_players').update({ role: 'accomplice' }).eq('room_code', roomCode).eq('username', u);
    }
  },

  // ---- Voting ----
  goToVoting: async (roomCode: string) => {
    await supabase.from('cheese_rooms').update({ phase: 'voting' }).eq('room_code', roomCode);
  },

  submitVote: async (roomCode: string, round: number, voter: string, target: string) => {
    await supabase.from('cheese_votes').upsert({ room_code: roomCode, round, voter, target }, { onConflict: 'room_code,round,voter' });
  },

  getVotes: async (roomCode: string, round: number): Promise<CheeseVote[]> => {
    const { data } = await supabase.from('cheese_votes').select('*').eq('room_code', roomCode).eq('round', round);
    return (data || []) as CheeseVote[];
  },

  // Tally votes; if a clear single most-voted player exists, reveal them and end.
  // If there's a tie, reveal ALL tied players (mice win if any of them is the thief) and end.
  finishVoting: async (roomCode: string): Promise<{ winner: 'mice' | 'thief'; revealed: string[] }> => {
    const room = await cheeseGame.getRoom(roomCode);
    const round = room?.vote_round || 1;
    const votes = await cheeseGame.getVotes(roomCode, round);
    const players = await cheeseGame.getPlayers(roomCode);

    const tally: Record<string, number> = {};
    votes.forEach(v => { tally[v.target] = (tally[v.target] || 0) + 1; });
    let maxVotes = 0;
    Object.values(tally).forEach(c => { if (c > maxVotes) maxVotes = c; });
    const topVoted = Object.keys(tally).filter(u => tally[u] === maxVotes);

    const revealed = topVoted;
    const thief = players.find(p => p.role === 'thief');
    const winner: 'mice' | 'thief' = thief && revealed.includes(thief.username) ? 'mice' : 'thief';

    await supabase.from('cheese_rooms').update({
      phase: 'ended',
      winner,
      revealed_usernames: revealed,
    }).eq('room_code', roomCode);

    return { winner, revealed };
  },

  getAllRoles: async (roomCode: string): Promise<CheesePlayer[]> => {
    const { data } = await supabase.from('cheese_players').select('*').eq('room_code', roomCode);
    return (data || []) as CheesePlayer[];
  },

  restartToLobby: async (roomCode: string) => {
    await supabase.from('cheese_players').update({ role: null, dice_hour: null }).eq('room_code', roomCode);
    await supabase.from('cheese_votes').delete().eq('room_code', roomCode);
    await supabase.from('cheese_night_log').delete().eq('room_code', roomCode);
    await supabase.from('cheese_chat').delete().eq('room_code', roomCode);
    await supabase.from('cheese_rooms').update({
      phase: 'lobby', current_hour: 0, cheese_location: 'center', winner: null, revealed_usernames: [], vote_round: 1, day_phase_ends_at: null,
    }).eq('room_code', roomCode);
  },

  // ---- Chat ----
  getChat: async (roomCode: string, channel: 'main' | 'thief'): Promise<CheeseChatMsg[]> => {
    const { data } = await supabase.from('cheese_chat').select('*').eq('room_code', roomCode).eq('channel', channel).order('timestamp', { ascending: true }).limit(200);
    return (data || []) as CheeseChatMsg[];
  },

  sendChat: async (roomCode: string, sender: string, avatar: string, text: string, channel: 'main' | 'thief') => {
    if (!text.trim()) return;
    await supabase.from('cheese_chat').insert({ room_code: roomCode, sender, avatar, text: text.trim(), channel });
  },

  // ---- Realtime subscription ----
  // NOTE: multiple components (room shell, chat panels, voting view) each
  // subscribe independently. Supabase channel topics must be unique per
  // channel instance — reusing the same name across concurrent subscriptions
  // throws "cannot add postgres_changes callbacks ... after subscribe()" and
  // crashes the whole tree. Each call gets its own unique topic name.
  subscribeToRoom: (roomCode: string, onChange: () => void) => {
    const uniqueTopic = `cheese_room_${roomCode}_${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(uniqueTopic)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cheese_rooms', filter: `room_code=eq.${roomCode}` }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cheese_players', filter: `room_code=eq.${roomCode}` }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cheese_chat', filter: `room_code=eq.${roomCode}` }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cheese_votes', filter: `room_code=eq.${roomCode}` }, onChange)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },
};
