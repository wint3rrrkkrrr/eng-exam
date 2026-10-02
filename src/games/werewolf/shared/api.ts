// shared/api.ts — รูปร่างข้อมูลที่รับ-ส่งระหว่างเบราว์เซอร์กับฟังก์ชันเซิร์ฟเวอร์ (API contract)
import type { MyView } from '../engine';
import type { LobbySettings } from './lobby';
import type { AvatarConfig, RewardBreakdown } from './avatar';

export const API_BASE = '/api/ww';

export interface ApiError {
  errorTh: string;
  code?: string;
}

export interface CreateRoomRequest {
  displayName: string;
  avatar?: string | null;
  password?: string;
}
export interface JoinRoomRequest {
  roomCode: string;
  displayName: string;
  avatar?: string | null;
  password?: string;
}
export interface AuthResponse {
  roomCode: string;
  playerId: string;
  token: string;
}

/** ผู้เล่นในห้อง — ข้อมูลเปิดเผยได้ทั้งหมด (ไม่มีบท) */
export interface LobbyPlayer {
  playerId: string;
  displayName: string;
  avatar: string | null;
  seat: number;
  isHost: boolean;
  isAlive: boolean;
  isConnected: boolean; // false = หลุดการเชื่อมต่อ (ไม่ส่งสัญญาณเกิน 15 วินาที)
  isSpectator: boolean;
  canVote: boolean;
  revealedRole: string | null;
  deathCause: string | null;
}

export interface ChatLine {
  id: number;
  playerId: string;
  displayName: string;
  text: string;
  createdAt: string;
}

export interface PublicLogEvent {
  id: number;
  at: string; // เวลาที่เกิดเหตุการณ์ (ISO) — ใช้เรียงรวมกับแชท
  day: number;
  phase: string;
  kind: string;
  data: Record<string, unknown>;
}

export interface MyViewResponse {
  stateVersion: number;
  serverNow: string; // เวลาเซิร์ฟเวอร์ — ใช้คำนวณนับถอยหลังโดยไม่พึ่งนาฬิกาเครื่องผู้เล่น
  roomCode: string;
  phase: string;
  endsAt: string | null;
  hasPassword: boolean;
  me: { playerId: string; displayName: string; isHost: boolean };
  players: LobbyPlayer[];
  lobby: LobbySettings;
  game: MyView | null; // null ตอนยังอยู่ในล็อบบี้ หรือเป็นผู้ชม
  spectator: boolean; // เราเป็นผู้ชมไหม (ไม่เห็นบทของใคร)
  dayNumber: number;
  reward: RewardBreakdown | null; // เหรียญที่ได้จากเกมนี้ (เฉพาะคนที่มีกระเป๋า และเกมจบแล้ว)
  log: PublicLogEvent[];
  chat: { public: ChatLine[]; private: Record<string, ChatLine[]> };
  canWrite: { public: boolean; channels: string[]; activeChannels: string[] };
}

export type ActionRequest =
  | { type: 'ready' }
  | { type: 'night_action'; kind: string; targets?: string[]; meta?: Record<string, unknown> }
  | { type: 'nominate'; targetId: string }
  | { type: 'vote'; targetId: string | null }
  | { type: 'hunter_shot'; targetId: string }
  | { type: 'gunner_shot'; targetId: string }
  | { type: 'time_adjust'; direction: 'more' | 'less' };

export interface ChatRequest {
  channel: 'public' | 'wolf' | 'lovers' | 'dead';
  text: string;
}

/** กระเป๋าเงินของฉัน (ส่งกลับเฉพาะเจ้าของกระเป๋าที่มีตั๋วถูกต้อง) */
export interface WalletView {
  walletId: string;
  coins: number;
  owned: string[]; // ของที่ซื้อแล้ว (ไม่รวมของฟรี)
  avatar: AvatarConfig; // อวตารที่ใส่อยู่
  gamesPlayed: number;
  wins: number;
}

export interface WalletCreated {
  walletId: string;
  token: string;
  wallet: WalletView;
}
