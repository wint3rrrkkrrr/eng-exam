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
}

export interface UserAggregatedLeaderboard {
  username: string;
  totalScore: number;
  totalAttempted: number;
  maxStreak: number;
  quizzesCompleted: number;
  lastActive: string;
}

const STORAGE_KEY_SCORES = 'winter_exam_supabase_scores_v2';
const STORAGE_KEY_USERS = 'winter_exam_supabase_real_users_v2';

export const supabaseSim = {
  // Register or update user active status
  registerUser: (username: string) => {
    if (!username || !username.trim()) return;
    const cleanName = username.trim();
    try {
      const usersRaw = localStorage.getItem(STORAGE_KEY_USERS);
      let users: { username: string; joined_at: string; last_active: string }[] = usersRaw ? JSON.parse(usersRaw) : [];
      
      const existingIdx = users.findIndex(u => u.username.toLowerCase() === cleanName.toLowerCase());
      const now = new Date().toISOString();
      
      if (existingIdx !== -1) {
        users[existingIdx].last_active = now;
      } else {
        users.push({
          username: cleanName,
          joined_at: now,
          last_active: now,
        });
      }
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {
      console.error("Error registering user", e);
    }
  },

  // Get list of all real users registered in the app
  getRealUsers: (): { username: string; joined_at: string; last_active: string }[] => {
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
