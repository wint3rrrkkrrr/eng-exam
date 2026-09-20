import { subjectsList } from '../data/subjectsData';
import { supabase } from './supabaseClient';
import claytonKimImg from '../assets/images/clayton_kim_1789743353081.jpg';

export interface UserScoreRecord {
  id: string;
  username: string;
  subject_id: string;
  subject_name: string;
  score: number;
  max_questions: number;
  streak: number;
  created_at: string;
  device_info?: string;
}

export interface RegisteredUser {
  username: string;
  joined_at: string;
  last_active: string;
  device_info: string;
}

export interface UserAggregatedLeaderboard {
  username: string;
  totalScore: number;
  totalAttempted: number;
  maxStreak: number;
  quizzesCompleted: number;
  lastActive: string;
  deviceInfo: string;
  isRankZero?: boolean;
}

export interface UserProfile {
  username: string;
  avatar: string;
  bio: string;
  joined_at: string;
  last_active: string;
  device_info: string;
  mouse_avatar?: string;
}

export interface FriendRequest {
  id: string;
  fromUsername: string;
  toUsername: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ChatMessage {
  id: string;
  sender: string;
  recipient?: string;
  text: string;
  timestamp: string;
  isGlobal: boolean;
  avatar?: string;
}

export const DEFAULT_AVATARS = [
  claytonKimImg,
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
];

export function detectDevice(): string {
  if (typeof window === 'undefined' || !navigator) return 'ไม่ทราบอุปกรณ์';
  const ua = navigator.userAgent || '';
  let brandModel = '';
  if (/iPhone/i.test(ua)) brandModel = 'iPhone';
  else if (/iPad/i.test(ua)) brandModel = 'iPad';
  else if (/SM-[A-Z0-9]+/i.test(ua) || /Samsung/i.test(ua)) {
    const m = ua.match(/SM-[A-Z0-9]+/i);
    brandModel = m ? `Samsung Galaxy (${m[0]})` : 'Samsung Galaxy';
  }
  let osName = '';
  if (/windows nt 10|windows nt 11/i.test(ua)) osName = 'Windows PC (10/11)';
  else if (/macintosh|mac os x/i.test(ua)) osName = 'MacBook / Mac (macOS)';
  else if (/iphone|ipod/i.test(ua)) osName = 'iOS';
  else if (/ipad/i.test(ua)) osName = 'iPadOS';
  else if (/android/i.test(ua)) {
    const ver = ua.match(/Android\s([0-9.]+)/i);
    osName = ver ? `Android ${ver[1]}` : 'Android';
  } else if (/linux/i.test(ua)) osName = 'Linux PC';
  let browserName = '';
  if (/edg/i.test(ua)) browserName = 'Edge';
  else if (/chrome|crios/i.test(ua)) browserName = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browserName = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browserName = 'Safari';
  const icon = /mobile/i.test(ua) || /iphone|android/i.test(ua) ? '📱' : '💻';
  if (brandModel) return `${icon} ${brandModel} (${osName}${browserName ? ' • ' + browserName : ''})`;
  return `${icon} ${osName || 'ไม่ทราบอุปกรณ์'}${browserName ? ' (' + browserName + ')' : ''}`;
}

// syncWithServer: kept for compatibility with existing call sites (App.tsx
// polls this every 4s). Now it re-warms the profile cache from Supabase —
// this is what makes OTHER users' (and your own, on a fresh reload) saved
// avatar/bio show up instead of the deterministic fallback.
export async function syncWithServer() {
  await supabaseSim.warmProfileCache();
  window.dispatchEvent(new Event('storage'));
}

// ---- Profile cache (in-memory for this session) ----
const profileCache: Record<string, UserProfile> = {};

export const supabaseSim = {
  registerUser: async (username: string) => {
    if (!username?.trim()) return;
    const clean = username.trim();
    const device = detectDevice();
    const now = new Date().toISOString();
    try {
      await supabase.from('winter_users').upsert(
        { username: clean, last_active: now, device_info: device },
        { onConflict: 'username' }
      );
    } catch (e) {
      console.error('registerUser error', e);
    }
  },

  getRealUsers: async (): Promise<RegisteredUser[]> => {
    try {
      const { data, error } = await supabase
        .from('winter_users')
        .select('*')
        .order('last_active', { ascending: false });
      if (error) throw error;
      return (data || []).map(u => ({
        username: u.username,
        joined_at: u.joined_at,
        last_active: u.last_active,
        device_info: u.device_info || '',
      }));
    } catch (e) {
      console.error('getRealUsers error', e);
      return [];
    }
  },

  getAggregatedLeaderboard: async (): Promise<UserAggregatedLeaderboard[]> => {
    try {
      const [usersRes, scoresRes] = await Promise.all([
        supabase.from('winter_users').select('*'),
        supabase.from('winter_scores').select('*'),
      ]);
      const users: RegisteredUser[] = (usersRes.data || []);
      const scores: UserScoreRecord[] = (scoresRes.data || []).map(s => ({
        id: s.id,
        username: s.username,
        subject_id: s.subject_id,
        subject_name: s.subject_name,
        score: s.score,
        max_questions: s.max_questions,
        streak: s.streak,
        created_at: s.created_at,
        device_info: s.device_info,
      }));
      const currentDevice = detectDevice();
      const userMap: Record<string, UserAggregatedLeaderboard> = {};
      users.forEach(u => {
        userMap[u.username.toLowerCase()] = {
          username: u.username,
          totalScore: 0,
          totalAttempted: 0,
          maxStreak: 0,
          quizzesCompleted: 0,
          lastActive: u.last_active,
          deviceInfo: u.device_info || currentDevice,
        };
      });
      scores.forEach(rec => {
        const key = rec.username.toLowerCase();
        if (!userMap[key]) {
          userMap[key] = {
            username: rec.username,
            totalScore: 0,
            totalAttempted: 0,
            maxStreak: 0,
            quizzesCompleted: 0,
            lastActive: rec.created_at,
            deviceInfo: rec.device_info || currentDevice,
          };
        }
        userMap[key].totalScore += rec.score;
        userMap[key].totalAttempted += rec.max_questions;
        userMap[key].quizzesCompleted += 1;
        if (rec.streak > userMap[key].maxStreak) userMap[key].maxStreak = rec.streak;
        if (new Date(rec.created_at) > new Date(userMap[key].lastActive)) userMap[key].lastActive = rec.created_at;
        if (rec.device_info) userMap[key].deviceInfo = rec.device_info;
      });
      const filtered = Object.values(userMap).filter(u => u.totalAttempted > 0 || users.some(r => r.username.toLowerCase() === u.username.toLowerCase()));
      filtered.sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        if (b.maxStreak !== a.maxStreak) return b.maxStreak - a.maxStreak;
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      });
      const rankZeroWin: UserAggregatedLeaderboard = {
        username: 'WIN',
        totalScore: 999,
        totalAttempted: 999,
        maxStreak: 999,
        quizzesCompleted: 999,
        lastActive: new Date().toISOString(),
        deviceInfo: currentDevice,
        isRankZero: true,
      };
      const filteredReal = filtered.filter(u => u.username.trim().toLowerCase() !== 'win');
      return [rankZeroWin, ...filteredReal];
    } catch (e) {
      console.error('getAggregatedLeaderboard error', e);
      return [];
    }
  },

  submitScore: async (username: string, subjectId: string, score: number, maxQuestions: number, streak: number): Promise<void> => {
    if (!username?.trim()) return;
    const clean = username.trim();
    await supabaseSim.registerUser(clean);
    try {
      const subject = subjectsList.find(s => s.id === subjectId);
      const subjectName = subject ? subject.name : subjectId;
      const device = detectDevice();
      await supabase.from('winter_scores').insert({
        username: clean,
        subject_id: subjectId,
        subject_name: subjectName,
        score,
        max_questions: maxQuestions,
        streak,
        device_info: device,
      });
    } catch (e) {
      console.error('submitScore error', e);
    }
  },

  deleteUserByAdmin: async (username: string) => {
    const clean = username.trim();
    await supabase.from('winter_users').delete().eq('username', clean);
    await supabase.from('winter_scores').delete().eq('username', clean);
    await supabase.from('winter_profiles').delete().eq('username', clean);
    await supabase.from('winter_friends').delete().eq('username', clean);
    await supabase.from('winter_friends').delete().eq('friend_username', clean);
    await supabase.from('winter_friend_requests').delete().or(`from_username.eq.${clean},to_username.eq.${clean}`);
  },

  clearAllScoresByAdmin: async () => {
    await supabase.from('winter_scores').delete().neq('id', '');
    await supabase.from('winter_users').delete().neq('username', '');
  },

  getProfile: (username: string): UserProfile => {
    if (!username) return { username: '', avatar: DEFAULT_AVATARS[0], bio: 'สู้ๆ ไปด้วยกันนะ!', joined_at: '', last_active: '', device_info: '' };
    const key = username.trim().toLowerCase();
    if (profileCache[key]) return profileCache[key];
    if (key === 'win' || key === 'wintararer') {
      return { username: 'WIN', avatar: claytonKimImg, bio: '👑 RANK 0 TOP SUPREME VIP', joined_at: new Date().toISOString(), last_active: new Date().toISOString(), device_info: detectDevice() };
    }
    return { username: username.trim(), avatar: DEFAULT_AVATARS[Math.abs(username.length) % DEFAULT_AVATARS.length], bio: 'เด็กเตรียมสอบ WINTER 2026 ✌️', joined_at: new Date().toISOString(), last_active: new Date().toISOString(), device_info: detectDevice() };
  },

  fetchProfile: async (username: string): Promise<UserProfile> => {
    const key = username.trim().toLowerCase();
    try {
      const { data } = await supabase.from('winter_profiles').select('*').eq('username', username.trim()).single();
      if (data) {
        const p: UserProfile = { username: data.username, avatar: data.avatar || DEFAULT_AVATARS[0], bio: data.bio || '', joined_at: data.joined_at, last_active: data.last_active, device_info: data.device_info || '', mouse_avatar: data.mouse_avatar || undefined };
        profileCache[key] = p;
        return p;
      }
    } catch (e) { /* no profile yet */ }
    return supabaseSim.getProfile(username);
  },

  // Bulk-load every saved profile from Supabase into the in-memory cache.
  // Call this on app start (and before rendering lists of other users'
  // avatars) so getProfile() — which is synchronous — returns the real
  // saved avatar/bio instead of falling back to the deterministic default.
  warmProfileCache: async (): Promise<void> => {
    try {
      const { data, error } = await supabase.from('winter_profiles').select('*');
      if (error) throw error;
      (data || []).forEach((row: any) => {
        const key = row.username.trim().toLowerCase();
        profileCache[key] = {
          username: row.username,
          avatar: row.avatar || DEFAULT_AVATARS[0],
          bio: row.bio || '',
          joined_at: row.joined_at,
          last_active: row.last_active,
          device_info: row.device_info || '',
          mouse_avatar: row.mouse_avatar || undefined,
        };
      });
    } catch (e) {
      console.error('warmProfileCache error', e);
    }
  },

  updateProfile: async (username: string, updates: { avatar?: string; bio?: string; mouse_avatar?: string }) => {
    if (!username) return;
    const clean = username.trim();
    const device = detectDevice();
    const now = new Date().toISOString();
    const current = supabaseSim.getProfile(clean);
    const updated: UserProfile = { ...current, ...updates, username: clean, last_active: now, device_info: device };
    profileCache[clean.toLowerCase()] = updated;
    window.dispatchEvent(new Event('storage'));
    try {
      await supabase.from('winter_profiles').upsert({
        username: clean,
        avatar: updated.avatar,
        bio: updated.bio,
        mouse_avatar: updated.mouse_avatar ?? null,
        last_active: now,
        device_info: device,
      }, { onConflict: 'username' });
    } catch (e) {
      console.error('updateProfile error', e);
    }
  },

  getFriends: async (username: string): Promise<string[]> => {
    if (!username) return [];
    try {
      const { data } = await supabase.from('winter_friends').select('friend_username').eq('username', username.trim());
      return (data || []).map(r => r.friend_username);
    } catch { return []; }
  },

  sendFriendRequest: async (fromUsername: string, toUsername: string): Promise<{ success: boolean; message: string }> => {
    if (!fromUsername || !toUsername) return { success: false, message: 'ข้อมูลไม่ถูกต้อง' };
    if (fromUsername.trim().toLowerCase() === toUsername.trim().toLowerCase()) return { success: false, message: 'ไม่สามารถแอดตัวเองได้' };
    const cleanFrom = fromUsername.trim();
    const cleanTo = toUsername.trim();
    try {
      const { data: existing } = await supabase.from('winter_friend_requests').select('id').eq('from_username', cleanFrom).eq('to_username', cleanTo).eq('status', 'pending');
      if (existing && existing.length > 0) return { success: false, message: 'ส่งคำขอไปแล้ว รอการตอบรับ' };
      const { data: friends } = await supabase.from('winter_friends').select('friend_username').eq('username', cleanFrom).eq('friend_username', cleanTo);
      if (friends && friends.length > 0) return { success: false, message: `เป็นเพื่อนกับ ${cleanTo} อยู่แล้ว` };
      await supabase.from('winter_friend_requests').insert({ from_username: cleanFrom, to_username: cleanTo, status: 'pending' });
      window.dispatchEvent(new Event('storage'));
      return { success: true, message: `ส่งคำขอเป็นเพื่อนถึง ${cleanTo} แล้ว!` };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'เกิดข้อผิดพลาด' };
    }
  },

  getFriendRequests: async (username: string): Promise<FriendRequest[]> => {
    if (!username) return [];
    try {
      const { data } = await supabase.from('winter_friend_requests').select('*').eq('to_username', username.trim()).eq('status', 'pending');
      return (data || []).map(r => ({ id: r.id, fromUsername: r.from_username, toUsername: r.to_username, timestamp: r.timestamp, status: r.status }));
    } catch { return []; }
  },

  respondFriendRequest: async (requestId: string, accept: boolean) => {
    try {
      const { data: req } = await supabase.from('winter_friend_requests').select('*').eq('id', requestId).single();
      if (!req) return;
      await supabase.from('winter_friend_requests').update({ status: accept ? 'accepted' : 'rejected' }).eq('id', requestId);
      if (accept) {
        await supabase.from('winter_friends').upsert([
          { username: req.from_username, friend_username: req.to_username },
          { username: req.to_username, friend_username: req.from_username },
        ]);
      }
      window.dispatchEvent(new Event('storage'));
    } catch (e) { console.error(e); }
  },

  getChatMessages: async (username: string, recipient?: string): Promise<ChatMessage[]> => {
    try {
      let query = supabase.from('winter_chat').select('*').order('timestamp', { ascending: true }).limit(100);
      if (!recipient) {
        query = query.eq('is_global', true);
      } else {
        const cleanUser = username.trim();
        const cleanRecip = recipient.trim();
        query = query.eq('is_global', false).or(
          `and(sender.eq.${cleanUser},recipient.eq.${cleanRecip}),and(sender.eq.${cleanRecip},recipient.eq.${cleanUser})`
        );
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(m => ({ id: m.id, sender: m.sender, recipient: m.recipient, text: m.text, timestamp: m.timestamp, isGlobal: m.is_global, avatar: m.avatar }));
    } catch (e) {
      console.error('getChatMessages error', e);
      return [];
    }
  },

  sendChatMessage: async (msg: { sender: string; recipient?: string; text: string; isGlobal: boolean; avatar?: string }): Promise<ChatMessage> => {
    const avatar = msg.avatar || supabaseSim.getProfile(msg.sender).avatar;
    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: msg.sender,
      recipient: msg.recipient,
      text: msg.text.trim(),
      timestamp: new Date().toISOString(),
      isGlobal: msg.isGlobal,
      avatar,
    };
    try {
      const { data } = await supabase.from('winter_chat').insert({
        sender: msg.sender,
        recipient: msg.recipient || null,
        text: msg.text.trim(),
        is_global: msg.isGlobal,
        avatar,
      }).select().single();
      if (data) newMsg.id = data.id;
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('sendChatMessage error', e);
    }
    return newMsg;
  },
};
