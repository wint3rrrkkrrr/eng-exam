import { subjectsList } from '../data/subjectsData';
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

const STORAGE_KEY_SCORES = 'winter_exam_supabase_scores_v2';
const STORAGE_KEY_USERS = 'winter_exam_supabase_real_users_v2';
const STORAGE_KEY_PROFILES = 'winter_exam_user_profiles_v1';
const STORAGE_KEY_FRIENDS = 'winter_exam_user_friends_v1';
const STORAGE_KEY_FRIEND_REQ = 'winter_exam_friend_requests_v1';
const STORAGE_KEY_CHAT = 'winter_exam_chat_messages_v1';

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

  // Extract specific model strings from Android UA if available
  let specificModel = '';
  const androidModelMatch = ua.match(/\(([^)]+)\)/);
  if (androidModelMatch && androidModelMatch[1]) {
    const parts = androidModelMatch[1].split(';').map(p => p.trim());
    for (const part of parts) {
      if (/Android/i.test(part) || /Linux/i.test(part) || /wv/i.test(part)) continue;
      if (/Build\//i.test(part)) {
        const modelName = part.split('Build/')[0].trim();
        if (modelName) {
          specificModel = modelName;
          break;
        }
      } else if (/SM-|Pixel|CPH|RMX|M2|220|V2|M20|Mi|Redmi|POCO|OnePlus|ROG|Xperia|Galaxy/i.test(part)) {
        specificModel = part.replace(/Build\/.*/i, '').trim();
        break;
      }
    }
  }

  // Known Brand / Model detection
  let brandModel = '';
  if (/iPhone/i.test(ua)) {
    brandModel = 'iPhone';
  } else if (/iPad/i.test(ua) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /Macintosh/i.test(ua))) {
    brandModel = 'iPad';
  } else if (/Pixel/i.test(ua)) {
    const m = ua.match(/Pixel\s?[\w\d\s]+/i);
    brandModel = m ? m[0].trim() : 'Google Pixel';
  } else if (/SM-[A-Z0-9]+/i.test(ua) || /Samsung/i.test(ua)) {
    const m = ua.match(/SM-[A-Z0-9]+/i);
    brandModel = m ? `Samsung Galaxy (${m[0]})` : 'Samsung Galaxy';
  } else if (/CPH[0-9]+/i.test(ua) || /OPPO/i.test(ua)) {
    const m = ua.match(/CPH[0-9]+/i);
    brandModel = m ? `OPPO (${m[0]})` : 'OPPO';
  } else if (/V2[0-9]+/i.test(ua) || /vivo/i.test(ua)) {
    const m = ua.match(/V2[0-9]+/i);
    brandModel = m ? `Vivo (${m[0]})` : 'Vivo';
  } else if (/Redmi|Xiaomi|Mi\s|M2[0-9]+/i.test(ua)) {
    const m = ua.match(/(Redmi[\w\s\d]+|Mi[\w\s\d]+)/i);
    brandModel = m ? m[0].trim() : 'Xiaomi / Redmi';
  } else if (/Realme|RMX[0-9]+/i.test(ua)) {
    const m = ua.match(/RMX[0-9]+/i);
    brandModel = m ? `Realme (${m[0]})` : 'Realme';
  } else if (/OnePlus/i.test(ua)) {
    brandModel = 'OnePlus';
  } else if (specificModel) {
    brandModel = specificModel;
  }

  // OS detection with version
  let osName = '';
  if (/windows nt 10/i.test(ua) || /windows nt 11/i.test(ua)) osName = 'Windows PC (10/11)';
  else if (/windows nt 6.3/i.test(ua)) osName = 'Windows PC (8.1)';
  else if (/windows nt 6.1/i.test(ua)) osName = 'Windows PC (7)';
  else if (/windows/i.test(ua)) osName = 'Windows PC';
  else if (/macintosh|mac os x/i.test(ua)) {
    osName = (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) ? 'iPadOS' : 'MacBook / Mac (macOS)';
  } else if (/iphone|ipod/i.test(ua)) osName = 'iOS';
  else if (/ipad/i.test(ua)) osName = 'iPadOS';
  else if (/android/i.test(ua)) {
    const ver = ua.match(/Android\s([0-9.]+)/i);
    osName = ver ? `Android ${ver[1]}` : 'Android';
  } else if (/linux/i.test(ua)) osName = 'Linux PC';

  // Browser detection
  let browserName = '';
  if (/edg/i.test(ua)) browserName = 'Edge';
  else if (/chrome|crios/i.test(ua)) browserName = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browserName = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browserName = 'Safari';

  // Device type icon
  let icon = '💻';
  if (/mobile/i.test(ua) || /iphone|android/i.test(ua)) {
    icon = '📱';
  } else if (/ipad/i.test(ua)) {
    icon = '📱';
  }

  if (brandModel) {
    return `${icon} ${brandModel} (${osName}${browserName ? ' • ' + browserName : ''})`;
  } else {
    return `${icon} ${osName || 'ไม่ทราบอุปกรณ์'}${browserName ? ' (' + browserName + ')' : ''}`;
  }
}

export async function syncWithServer() {
  try {
    const res = await fetch('/api/all-data');
    if (res.ok) {
      const data = await res.json();
      if (data.users && Array.isArray(data.users)) {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(data.users));
      }
      if (data.scores && Array.isArray(data.scores)) {
        localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(data.scores));
      }
      if (data.profiles && typeof data.profiles === 'object') {
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(data.profiles));
      }
      if (data.friends && typeof data.friends === 'object') {
        localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(data.friends));
      }
      if (data.friendRequests && Array.isArray(data.friendRequests)) {
        localStorage.setItem(STORAGE_KEY_FRIEND_REQ, JSON.stringify(data.friendRequests));
      }
      if (data.chatMessages && Array.isArray(data.chatMessages)) {
        localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(data.chatMessages));
      }
    }
  } catch (e) {
    // Offline or static fallback
  }
}

export const supabaseSim = {
  // Register or update user active status
  registerUser: (username: string) => {
    if (!username || !username.trim()) return;
    const cleanName = username.trim();
    const device = detectDevice();
    try {
      const usersRaw = localStorage.getItem(STORAGE_KEY_USERS);
      let users: RegisteredUser[] = usersRaw ? JSON.parse(usersRaw) : [];

      const existingIdx = users.findIndex(u => u.username.toLowerCase() === cleanName.toLowerCase());
      const now = new Date().toISOString();

      if (existingIdx !== -1) {
        users[existingIdx].last_active = now;
        users[existingIdx].device_info = device;
      } else {
        users.push({
          username: cleanName,
          joined_at: now,
          last_active: now,
          device_info: device,
        });
      }
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

      // Post to cloud server
      fetch('/api/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanName, deviceInfo: device }),
      }).catch(() => {});
    } catch (e) {
      console.error("Error registering user", e);
    }
  },

  // Get list of all real users registered in the app
  getRealUsers: (): RegisteredUser[] => {
    try {
      const usersRaw = localStorage.getItem(STORAGE_KEY_USERS);
      if (usersRaw) {
        return JSON.parse(usersRaw);
      }
    } catch (e) {
      console.error("Error fetching real users", e);
    }
    return [];
  },

  // Get aggregated leaderboard scores across all subjects for REAL users only
  getAggregatedLeaderboard: async (): Promise<UserAggregatedLeaderboard[]> => {
    await syncWithServer();
    try {
      const scoresRaw = localStorage.getItem(STORAGE_KEY_SCORES);
      const scores: UserScoreRecord[] = scoresRaw ? JSON.parse(scoresRaw) : [];
      const realUsers = supabaseSim.getRealUsers();
      const currentDevice = detectDevice();

      // Aggregate scores by username
      const userMap: { [username: string]: UserAggregatedLeaderboard } = {};

      // Initialize entries for all registered real users
      realUsers.forEach(u => {
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

      // Sum up score records
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
        if (rec.streak > userMap[key].maxStreak) {
          userMap[key].maxStreak = rec.streak;
        }
        if (new Date(rec.created_at).getTime() > new Date(userMap[key].lastActive).getTime()) {
          userMap[key].lastActive = rec.created_at;
        }
        if (rec.device_info) {
          userMap[key].deviceInfo = rec.device_info;
        }
      });

      const list = Object.values(userMap);

      // Filter out users with 0 score unless registered
      const filtered = list.filter(u => u.totalAttempted > 0 || realUsers.some(r => r.username.toLowerCase() === u.username.toLowerCase()));

      // Sort by Total Score DESC, then Max Streak DESC, then Quizzes Completed DESC
      filtered.sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        if (b.maxStreak !== a.maxStreak) return b.maxStreak - a.maxStreak;
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      });

      // Special Rank 0 Dummy Entry for WIN requested by user
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

      // Filter out any existing 'win' entry from real array to prevent duplicate
      const filteredReal = filtered.filter(u => u.username.trim().toLowerCase() !== 'win');

      return [rankZeroWin, ...filteredReal];
    } catch (e) {
      console.error("Failed to parse aggregated leaderboard", e);
      return [];
    }
  },

  // Submit quiz score
  submitScore: async (username: string, subjectId: string, score: number, maxQuestions: number, streak: number): Promise<void> => {
    if (!username || !username.trim()) return;
    const cleanName = username.trim();
    
    // Register user first
    supabaseSim.registerUser(cleanName);

    try {
      const scoresRaw = localStorage.getItem(STORAGE_KEY_SCORES);
      let scores: UserScoreRecord[] = scoresRaw ? JSON.parse(scoresRaw) : [];

      const subject = subjectsList.find(s => s.id === subjectId);
      const subjectName = subject ? subject.name : subjectId;
      const device = detectDevice();

      const newRecord: UserScoreRecord = {
        id: Math.random().toString(36).substring(2, 9),
        username: cleanName,
        subject_id: subjectId,
        subject_name: subjectName,
        score,
        max_questions: maxQuestions,
        streak,
        created_at: new Date().toISOString(),
        device_info: device,
      };

      scores.push(newRecord);
      localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(scores));

      fetch('/api/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanName, subjectId, subjectName, score, maxQuestions, streak, deviceInfo: device }),
      }).catch(() => {});
    } catch (e) {
      console.error("Error submitting score", e);
    }
  },

  // Admin method: Delete specific user and their scores
  deleteUserByAdmin: (username: string) => {
    try {
      const cleanName = username.trim().toLowerCase();
      
      // Delete from users
      const users = supabaseSim.getRealUsers().filter(u => u.username.trim().toLowerCase() !== cleanName);
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

      // Delete from scores
      const scoresRaw = localStorage.getItem(STORAGE_KEY_SCORES);
      if (scoresRaw) {
        const scores: UserScoreRecord[] = JSON.parse(scoresRaw);
        const filtered = scores.filter(s => s.username.trim().toLowerCase() !== cleanName);
        localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(filtered));
      }

      fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameToDelete: username }),
      }).catch(() => {});
    } catch (e) {
      console.error("Error deleting user", e);
    }
  },

  // Admin method: Reset all scores
  clearAllScoresByAdmin: () => {
    try {
      localStorage.removeItem(STORAGE_KEY_SCORES);
      localStorage.removeItem(STORAGE_KEY_USERS);
      fetch('/api/admin/clear-all', { method: 'POST' }).catch(() => {});
    } catch (e) {
      console.error("Error clearing scores", e);
    }
  },

  // --- Profile Methods ---
  getProfile: (username: string): UserProfile => {
    if (!username) return { username: '', avatar: DEFAULT_AVATARS[0], bio: 'สู้ๆ ไปด้วยกันนะ!', joined_at: '', last_active: '', device_info: '' };
    const cleanName = username.trim().toLowerCase();
    if (cleanName === 'win') {
      return {
        username: 'WIN',
        avatar: claytonKimImg,
        bio: '👑 RANK 0 TOP SUPREME VIP',
        joined_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        device_info: detectDevice(),
      };
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
      const profiles: Record<string, UserProfile> = raw ? JSON.parse(raw) : {};
      if (profiles[cleanName]) return profiles[cleanName];
    } catch (e) {
      console.error(e);
    }
    return {
      username: username.trim(),
      avatar: DEFAULT_AVATARS[Math.abs(username.length) % DEFAULT_AVATARS.length],
      bio: 'เด็กเตรียมสอบ WINTER 2026 ✌️',
      joined_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
      device_info: detectDevice(),
    };
  },

  updateProfile: (username: string, updates: { avatar?: string; bio?: string }) => {
    if (!username) return;
    const cleanName = username.trim().toLowerCase();
    const device = detectDevice();
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
      const profiles: Record<string, UserProfile> = raw ? JSON.parse(raw) : {};
      const current = profiles[cleanName] || supabaseSim.getProfile(username);
      profiles[cleanName] = {
        ...current,
        ...updates,
        username: username.trim(),
        last_active: new Date().toISOString(),
        device_info: device,
      };
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
      window.dispatchEvent(new Event('storage'));

      // Send to server
      fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          avatar: updates.avatar,
          bio: updates.bio,
          deviceInfo: device,
        }),
      }).catch(() => {});
    } catch (e) {
      console.error(e);
    }
  },

  // --- Friend & Friend Request Methods ---
  getFriends: (username: string): string[] => {
    if (!username) return [];
    const cleanName = username.trim().toLowerCase();
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FRIENDS);
      const friendsMap: Record<string, string[]> = raw ? JSON.parse(raw) : {};
      return friendsMap[cleanName] || [];
    } catch {
      return [];
    }
  },

  sendFriendRequest: (fromUsername: string, toUsername: string): { success: boolean; message: string } => {
    if (!fromUsername || !toUsername) return { success: false, message: 'ข้อมูลไม่ถูกต้อง' };
    if (fromUsername.trim().toLowerCase() === toUsername.trim().toLowerCase()) {
      return { success: false, message: 'ไม่สามารถแอดตัวเองเป็นเพื่อนได้' };
    }
    const cleanFrom = fromUsername.trim();
    const cleanTo = toUsername.trim();

    const friends = supabaseSim.getFriends(cleanFrom);
    if (friends.some(f => f.toLowerCase() === cleanTo.toLowerCase())) {
      return { success: false, message: `เป็นเพื่อนกับ ${cleanTo} อยู่แล้ว` };
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY_FRIEND_REQ);
      let reqs: FriendRequest[] = raw ? JSON.parse(raw) : [];

      const existing = reqs.find(
        r => r.fromUsername.toLowerCase() === cleanFrom.toLowerCase() &&
             r.toUsername.toLowerCase() === cleanTo.toLowerCase() &&
             r.status === 'pending'
      );
      if (existing) return { success: false, message: 'ส่งคำขอเป็นเพื่อนไปแล้ว รอการตอบรับ' };

      reqs.push({
        id: Math.random().toString(36).substring(2, 9),
        fromUsername: cleanFrom,
        toUsername: cleanTo,
        timestamp: new Date().toISOString(),
        status: 'pending',
      });
      localStorage.setItem(STORAGE_KEY_FRIEND_REQ, JSON.stringify(reqs));
      window.dispatchEvent(new Event('storage'));

      fetch('/api/friend-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', fromUsername: cleanFrom, toUsername: cleanTo }),
      }).catch(() => {});

      return { success: true, message: `ส่งคำขอเป็นเพื่อนถึง ${cleanTo} แล้ว!` };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'เกิดข้อผิดพลาดในการส่งคำขอ' };
    }
  },

  getFriendRequests: (username: string): FriendRequest[] => {
    if (!username) return [];
    const cleanName = username.trim().toLowerCase();
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FRIEND_REQ);
      const reqs: FriendRequest[] = raw ? JSON.parse(raw) : [];
      return reqs.filter(r => r.toUsername.toLowerCase() === cleanName && r.status === 'pending');
    } catch {
      return [];
    }
  },

  respondFriendRequest: (requestId: string, accept: boolean) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FRIEND_REQ);
      let reqs: FriendRequest[] = raw ? JSON.parse(raw) : [];
      const idx = reqs.findIndex(r => r.id === requestId);
      if (idx === -1) return;

      const req = reqs[idx];
      req.status = accept ? 'accepted' : 'rejected';
      localStorage.setItem(STORAGE_KEY_FRIEND_REQ, JSON.stringify(reqs));

      if (accept) {
        const rawFriends = localStorage.getItem(STORAGE_KEY_FRIENDS);
        const friendsMap: Record<string, string[]> = rawFriends ? JSON.parse(rawFriends) : {};

        const keyA = req.fromUsername.trim().toLowerCase();
        const keyB = req.toUsername.trim().toLowerCase();

        const friendsA = friendsMap[keyA] || [];
        if (!friendsA.some(f => f.toLowerCase() === keyB)) friendsA.push(req.toUsername);
        friendsMap[keyA] = friendsA;

        const friendsB = friendsMap[keyB] || [];
        if (!friendsB.some(f => f.toLowerCase() === keyA)) friendsB.push(req.fromUsername);
        friendsMap[keyB] = friendsB;

        localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(friendsMap));
      }
      window.dispatchEvent(new Event('storage'));

      if (accept) {
        fetch('/api/friend-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'accept', requestId }),
        }).catch(() => {});
      }
    } catch (e) {
      console.error(e);
    }
  },

  // --- Chat Methods ---
  getChatMessages: (username: string, recipient?: string): ChatMessage[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CHAT);
      let messages: ChatMessage[] = raw ? JSON.parse(raw) : [];

      if (!raw || messages.length === 0) {
        const initialMessages: ChatMessage[] = [
          {
            id: 'm1',
            sender: 'wintararer',
            text: 'ยินดีต้อนรับทุกคนสู่ WINTER Prep Hub ครับ! ตั้งใจสอบไปด้วยกันนะ 🔥',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            isGlobal: true,
            avatar: DEFAULT_AVATARS[0],
          },
          {
            id: 'm2',
            sender: 'กบซ่าพาลุย',
            text: 'วิชาชีวะเรื่องเซลล์ทำสนุกมาก ใครสงสัยข้อไหนถามได้นะ ✌️',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            isGlobal: true,
            avatar: DEFAULT_AVATARS[1],
          },
        ];
        localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(initialMessages));
        messages = initialMessages;
      }

      if (!recipient) {
        return messages.filter(m => m.isGlobal);
      } else {
        const cleanUser = username.trim().toLowerCase();
        const cleanRecip = recipient.trim().toLowerCase();
        return messages.filter(
          m => !m.isGlobal &&
          ((m.sender.toLowerCase() === cleanUser && m.recipient?.toLowerCase() === cleanRecip) ||
           (m.sender.toLowerCase() === cleanRecip && m.recipient?.toLowerCase() === cleanUser))
        );
      }
    } catch {
      return [];
    }
  },

  sendChatMessage: (msg: { sender: string; recipient?: string; text: string; isGlobal: boolean; avatar?: string }): ChatMessage => {
    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: msg.sender,
      recipient: msg.recipient,
      text: msg.text.trim(),
      timestamp: new Date().toISOString(),
      isGlobal: msg.isGlobal,
      avatar: msg.avatar || supabaseSim.getProfile(msg.sender).avatar,
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY_CHAT);
      const messages: ChatMessage[] = raw ? JSON.parse(raw) : [];
      messages.push(newMsg);
      localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(messages));
      window.dispatchEvent(new Event('storage'));

      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg),
      }).catch(() => {});
    } catch (e) {
      console.error(e);
    }
    return newMsg;
  }
};
