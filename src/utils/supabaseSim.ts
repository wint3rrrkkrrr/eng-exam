import { subjectsList } from '../data/subjectsData';

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
}

const STORAGE_KEY_SCORES = 'winter_exam_supabase_scores_v2';
const STORAGE_KEY_USERS = 'winter_exam_supabase_real_users_v2';

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

      return filtered;
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

      const newRecord: UserScoreRecord = {
        id: Math.random().toString(36).substring(2, 9),
        username: cleanName,
        subject_id: subjectId,
        subject_name: subjectName,
        score,
        max_questions: maxQuestions,
        streak,
        created_at: new Date().toISOString(),
        device_info: detectDevice(),
      };

      scores.push(newRecord);
      localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(scores));
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
    } catch (e) {
      console.error("Error deleting user", e);
    }
  },

  // Admin method: Reset all scores
  clearAllScoresByAdmin: () => {
    try {
      localStorage.removeItem(STORAGE_KEY_SCORES);
      localStorage.removeItem(STORAGE_KEY_USERS);
    } catch (e) {
      console.error("Error clearing scores", e);
    }
  }
};
