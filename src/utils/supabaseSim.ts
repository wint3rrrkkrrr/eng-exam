import { subjectsList } from '../data/subjectsData';

export interface LeaderboardEntry {
  id: string;
  username: string;
  subject_id: string;
  subject_name: string;
  score: number;
  max_questions: number;
  streak: number;
  created_at: string;
}

// Simulated Supabase client that mirrors Supabase query functionality backed by local storage
export const supabaseSim = {
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    try {
      const saved = localStorage.getItem('winter_exam_supabase_leaderboard_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse leaderboard simulation", e);
    }
    
    // Default seed scores to make the leaderboard look lively right away!
    const defaultData: LeaderboardEntry[] = [
      { id: '1', username: 'WINTER ❄️', subject_id: 'english', subject_name: 'ภาษาอังกฤษ ม.ปลาย', score: 20, max_questions: 20, streak: 12, created_at: new Date().toISOString() },
      { id: '2', username: 'หมอกอ้อย Bio', subject_id: 'biology', subject_name: 'ชีววิทยา ม.4', score: 19, max_questions: 20, streak: 15, created_at: new Date().toISOString() },
      { id: '3', username: 'Nong Por Music', subject_id: 'music', subject_name: 'ดนตรี ม.5', score: 19, max_questions: 20, streak: 11, created_at: new Date().toISOString() },
      { id: '4', username: 'Somchai Learn', subject_id: 'physics', subject_name: 'ฟิสิกส์ ม.5', score: 18, max_questions: 20, streak: 8, created_at: new Date().toISOString() },
      { id: '5', username: 'Somsak Prep', subject_id: 'history', subject_name: 'ประวัติศาสตร์ ม.ปลาย', score: 18, max_questions: 20, streak: 9, created_at: new Date().toISOString() },
      { id: '6', username: 'Manao Coding', subject_id: 'c-programming', subject_name: 'การเขียนโปรแกรมภาษา C', score: 17, max_questions: 20, streak: 6, created_at: new Date().toISOString() },
      { id: '7', username: 'เก่งเลข Math', subject_id: 'math', subject_name: 'คณิตศาสตร์ ม.ปลาย', score: 15, max_questions: 20, streak: 5, created_at: new Date().toISOString() },
    ];
    localStorage.setItem('winter_exam_supabase_leaderboard_v1', JSON.stringify(defaultData));
    return defaultData;
  },

  submitScore: async (username: string, subjectId: string, score: number, maxQuestions: number, streak: number): Promise<{ data: LeaderboardEntry[], error: any }> => {
    const current = await supabaseSim.getLeaderboard();
    const subject = subjectsList.find(s => s.id === subjectId);
    const subjectName = subject ? subject.name : subjectId;

    const newEntry: LeaderboardEntry = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      subject_id: subjectId,
      subject_name: subjectName,
      score,
      max_questions: maxQuestions,
      streak,
      created_at: new Date().toISOString()
    };

    // See if this user already has a record for this subject
    const existingIdx = current.findIndex(
      entry => entry.username.trim().toLowerCase() === username.trim().toLowerCase() && entry.subject_id === subjectId
    );

    if (existingIdx !== -1) {
      // Update if the new score is higher or equal but with a better streak
      if (score > current[existingIdx].score || (score === current[existingIdx].score && streak > current[existingIdx].streak)) {
        current[existingIdx] = newEntry;
      }
    } else {
      current.push(newEntry);
    }

    localStorage.setItem('winter_exam_supabase_leaderboard_v1', JSON.stringify(current));
    return { data: current, error: null };
  }
};
