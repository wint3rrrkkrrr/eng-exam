// net/community.ts — เรียก API ฝั่งแววูฟที่ใช้ร่วมกับเว็บ Winter Community: เลเวล/อันดับ/เพื่อนในเกม/รายงาน/แอดมิน
// ทุกอย่างที่ต้องรู้ตัวตนใช้ session token ของบัญชี (ไม่ใช่รหัสผ่าน)
import { api } from './werewolfClient';
import type { ApiResult } from './werewolfClient';
import type { ProgressView } from '../shared/progress';
import { getSessionToken } from '../../../utils/supabaseSim';

export interface LeaderboardRow { rank: number; username: string; level: number; title: string; xp: number; wins: number; games: number }
export interface FriendRow { username: string; level: number; title: string; lastActive: string | null; online: boolean }
export interface ReportRow {
  id: string; created_at: string; reporter_name: string; target_name: string; room_code: string; reason: string; detail: string; status: string; note: string;
}

export const REPORT_REASON_TH: Record<string, string> = {
  abuse: 'ใช้คำหยาบ/ด่าทอ', spam: 'สแปม/ก่อกวน', cheat: 'โกง/เล่นผิดกติกา', leak: 'เปิดเผยบทหรือข้อมูลลับ', afk: 'ทิ้งเกม/ไม่เล่น', other: 'อื่นๆ',
};

const tok = () => ({ sessionToken: getSessionToken() });

export const getMyProgress = (): Promise<ApiResult<ProgressView>> => api<ProgressView>('progress-get', tok());
export const getLeaderboard = (): Promise<ApiResult<{ rows: LeaderboardRow[] }>> => api<{ rows: LeaderboardRow[] }>('leaderboard', {});
export const getGameFriends = (): Promise<ApiResult<{ rows: FriendRow[] }>> => api<{ rows: FriendRow[] }>('friends-list', tok());

export const listReports = (status: 'open' | 'resolved' | 'dismissed' | 'all' = 'open'): Promise<ApiResult<{ rows: ReportRow[] }>> =>
  api<{ rows: ReportRow[] }>('report-list', { ...tok(), status });
export const resolveReport = (id: string, status: 'resolved' | 'dismissed', note = ''): Promise<ApiResult<{ ok: boolean }>> =>
  api<{ ok: boolean }>('report-resolve', { ...tok(), id, status, note });
