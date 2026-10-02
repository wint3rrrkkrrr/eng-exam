// _shared/supabaseStore.ts — ที่เก็บจริงบน Supabase (ใช้ service role key — ฝั่งเซิร์ฟเวอร์เท่านั้น!)
// ★ ห้าม import ไฟล์นี้จากโค้ดฝั่งเบราว์เซอร์ · ห้ามเอา SUPABASE_SERVICE_ROLE_KEY ไปไว้ในตัวแปรขึ้นต้น VITE_
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  BuyResult, SpinResult, ChatRecord, Commit, EventRow, PlayerRow, PublicEventRecord, RoomRow, RoomSecrets, WalletRow, WwStore,
} from './store';

function must<T>(res: { data: T | null; error: { message: string; code?: string } | null }, what: string): T {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  return res.data as T;
}

export class SupabaseStore implements WwStore {
  private db: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    this.db = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  }

  async getRoom(code: string): Promise<RoomRow | null> {
    const res = await this.db.from('ww_rooms').select('*').eq('room_code', code).maybeSingle();
    return must(res, 'getRoom') as RoomRow | null;
  }

  async getRoomSecrets(code: string): Promise<RoomSecrets | null> {
    const res = await this.db.from('ww_room_secrets').select('rng_seed,password_hash,engine_state').eq('room_code', code).maybeSingle();
    return must(res, 'getRoomSecrets') as RoomSecrets | null;
  }

  async createRoom(room: RoomRow, secrets: { rng_seed: string; password_hash: string | null }, host: PlayerRow, hostTokenHash: string): Promise<boolean> {
    const r1 = await this.db.from('ww_rooms').insert(room);
    if (r1.error) {
      if (r1.error.code === '23505') return false; // รหัสห้องซ้ำ
      throw new Error(`createRoom: ${r1.error.message}`);
    }
    must(await this.db.from('ww_room_secrets').insert({ room_code: room.room_code, ...secrets }) as never, 'createRoom.secrets');
    must(await this.db.from('ww_players').insert(host) as never, 'createRoom.host');
    must(await this.db.from('ww_player_auth').insert({ player_id: host.player_id, room_code: room.room_code, token_hash: hostTokenHash }) as never, 'createRoom.auth');
    return true;
  }

  async listPlayers(code: string): Promise<PlayerRow[]> {
    const res = await this.db.from('ww_players').select('*').eq('room_code', code).order('seat');
    return (must(res, 'listPlayers') ?? []) as PlayerRow[];
  }

  async addPlayer(p: PlayerRow, tokenHash: string): Promise<void> {
    must(await this.db.from('ww_players').insert(p) as never, 'addPlayer');
    must(await this.db.from('ww_player_auth').insert({ player_id: p.player_id, room_code: p.room_code, token_hash: tokenHash }) as never, 'addPlayer.auth');
  }

  async deletePlayer(id: string): Promise<void> {
    must(await this.db.from('ww_players').delete().eq('player_id', id) as never, 'deletePlayer'); // ww_player_auth ลบตาม (cascade)
  }

  async getAuth(id: string) {
    const res = await this.db.from('ww_player_auth').select('token_hash,room_code').eq('player_id', id).maybeSingle();
    return must(res, 'getAuth') as { token_hash: string; room_code: string } | null;
  }

  async setAuth(id: string, roomCode: string, tokenHash: string): Promise<void> {
    must(await this.db.from('ww_player_auth').upsert({ player_id: id, room_code: roomCode, token_hash: tokenHash }) as never, 'setAuth');
  }

  async deleteAuth(id: string): Promise<void> {
    must(await this.db.from('ww_player_auth').delete().eq('player_id', id) as never, 'deleteAuth');
  }

  async setSpectator(id: string, flag: boolean): Promise<void> {
    await this.db.from('ww_players').update({ is_spectator: flag }).eq('player_id', id);
  }

  async touchPlayer(id: string, atIso: string): Promise<void> {
    await this.db.from('ww_players').update({ last_seen_at: atIso, is_connected: true }).eq('player_id', id);
  }

  async updateLobbySettings(code: string, settings: Record<string, unknown>): Promise<void> {
    // ขยับ state_version ทีละ 1 (ไม่ต้องแม่นยำ — ใช้เป็นสัญญาณให้ไคลเอนต์ดึงข้อมูลใหม่)
    const cur = await this.getRoom(code);
    if (!cur) return;
    must(await this.db.from('ww_rooms').update({
      settings, state_version: cur.state_version + 1, updated_at: new Date().toISOString(),
    }).eq('room_code', code).eq('state_version', cur.state_version) as never, 'updateLobbySettings');
  }

  async commit(c: Commit): Promise<boolean> {
    const toRows = (rows: EventRow[], pub: boolean) =>
      rows.map((e) => (pub
        ? { day_number: e.day_number, phase: e.phase, kind: e.kind, payload_public: e.payload }
        : { day_number: e.day_number, phase: e.phase, kind: e.kind, payload: e.payload }));
    const res = await this.db.rpc('ww_commit_state', {
      p_room_code: c.roomCode,
      p_expect_version: c.expectVersion,
      p_room: c.room,
      p_engine: c.engine,
      p_players: c.players,
      p_events_public: toRows(c.eventsPublic, true),
      p_events_private: toRows(c.eventsPrivate, false),
    });
    if (res.error) throw new Error(`commit: ${res.error.message}`);
    return res.data === true;
  }

  async logPrivate(code: string, e: EventRow): Promise<void> {
    await this.db.from('ww_events_private').insert({ room_code: code, day_number: e.day_number, phase: e.phase, kind: e.kind, payload: e.payload });
  }

  // ---------------------------------------------------------------- กระเป๋าเงิน
  async createWallet(walletId: string, tokenHash: string, coins: number): Promise<void> {
    must(await this.db.from('ww_wallets').insert({ wallet_id: walletId, token_hash: tokenHash, coins }) as never, 'createWallet');
  }

  async getWalletTokenHash(walletId: string): Promise<string | null> {
    const res = await this.db.from('ww_wallets').select('token_hash').eq('wallet_id', walletId).maybeSingle();
    return (must(res, 'getWalletTokenHash') as { token_hash: string } | null)?.token_hash ?? null;
  }

  async getWallet(walletId: string): Promise<WalletRow | null> {
    const res = await this.db.from('ww_wallets').select('wallet_id,coins,owned,avatar,games_played,wins,username').eq('wallet_id', walletId).maybeSingle();
    return must(res, 'getWallet') as WalletRow | null;
  }

  async getWalletByUsername(username: string): Promise<WalletRow | null> {
    const res = await this.db.from('ww_wallets').select('wallet_id,coins,owned,avatar,games_played,wins,username').eq('username', username).maybeSingle();
    return must(res, 'getWalletByUsername') as WalletRow | null;
  }

  async bindWalletToAccount(walletId: string, username: string, tokenHash: string): Promise<void> {
    must(await this.db.from('ww_wallets').update({ username, token_hash: tokenHash }).eq('wallet_id', walletId) as never, 'bindWalletToAccount');
  }

  async getCredential(username: string): Promise<string | null> {
    const res = await this.db.from('winter_credentials').select('password_hash').eq('username', username).maybeSingle();
    return (must(res, 'getCredential') as { password_hash: string } | null)?.password_hash ?? null;
  }

  async createCredential(username: string, hash: string): Promise<boolean> {
    const res = await this.db.from('winter_credentials').insert({ username, password_hash: hash });
    if (res.error) {
      if (res.error.code === '23505') return false; // มีอยู่แล้ว
      throw new Error(`createCredential: ${res.error.message}`);
    }
    return true;
  }

  async updateCredential(username: string, hash: string): Promise<void> {
    must(await this.db.from('winter_credentials').update({ password_hash: hash }).eq('username', username) as never, 'updateCredential');
  }

  async ensureUser(username: string): Promise<void> {
    must(await this.db.from('winter_users').upsert({ username, last_active: new Date().toISOString() }, { onConflict: 'username' }) as never, 'ensureUser');
  }

  async createSession(tokenHash: string, username: string, expiresAtIso: string): Promise<void> {
    must(await this.db.from('winter_sessions').insert({ token_hash: tokenHash, username, expires_at: expiresAtIso }) as never, 'createSession');
  }

  async getSession(tokenHash: string): Promise<{ username: string; expires_at: string } | null> {
    const res = await this.db.from('winter_sessions').select('username,expires_at').eq('token_hash', tokenHash).maybeSingle();
    return must(res, 'getSession') as { username: string; expires_at: string } | null;
  }

  async rateHit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const res = await this.db.rpc('ww_rate_hit', { p_key: key, p_limit: limit, p_window: windowSeconds });
    if (res.error) {
      console.error('[ww] rateHit', res.error.message);
      return true; // ตัวนับล้ม ไม่ควรทำให้เกมเล่นไม่ได้
    }
    return res.data === true;
  }

  async walletBuy(walletId: string, itemId: string, price: number): Promise<BuyResult> {
    const res = await this.db.rpc('ww_wallet_buy', { p_wallet: walletId, p_item: itemId, p_price: price });
    if (res.error) throw new Error(`walletBuy: ${res.error.message}`);
    const out = res.data as { ok: boolean; reason?: 'poor' | 'owned' | 'none' };
    if (!out.ok) return { ok: false, reason: out.reason ?? 'none' };
    const wallet = await this.getWallet(walletId);
    return wallet ? { ok: true, wallet } : { ok: false, reason: 'none' };
  }

  async walletCredit(walletId: string, amount: number, won: boolean): Promise<WalletRow | null> {
    const res = await this.db.rpc('ww_wallet_credit', { p_wallet: walletId, p_amount: amount, p_won: won });
    if (res.error) throw new Error(`walletCredit: ${res.error.message}`);
    return this.getWallet(walletId);
  }

  async walletSpin(walletId: string, cost: number, itemId: string, refund: number): Promise<SpinResult> {
    const res = await this.db.rpc('ww_wallet_spin', { p_wallet: walletId, p_cost: cost, p_item: itemId, p_refund: refund });
    if (res.error) throw new Error(`walletSpin: ${res.error.message}`);
    return res.data as SpinResult;
  }

  async walletGrant(walletId: string, itemIds: string[]): Promise<number | null> {
    const res = await this.db.rpc('ww_wallet_grant', { p_wallet: walletId, p_items: itemIds });
    if (res.error) throw new Error(`walletGrant: ${res.error.message}`);
    return typeof res.data === 'number' ? res.data : null;
  }

  async walletSetAvatar(walletId: string, avatar: Record<string, string>): Promise<void> {
    must(await this.db.from('ww_wallets').update({ avatar }).eq('wallet_id', walletId) as never, 'walletSetAvatar');
  }

  async setPlayerWallet(playerId: string, walletId: string | null): Promise<void> {
    must(await this.db.from('ww_player_auth').update({ wallet_id: walletId }).eq('player_id', playerId) as never, 'setPlayerWallet');
  }

  async getRoomWallets(code: string): Promise<Record<string, string>> {
    const res = await this.db.from('ww_player_auth').select('player_id,wallet_id').eq('room_code', code).not('wallet_id', 'is', null);
    const rows = (must(res, 'getRoomWallets') ?? []) as { player_id: string; wallet_id: string }[];
    return Object.fromEntries(rows.map((r) => [r.player_id, r.wallet_id]));
  }

  async setPlayerAvatar(playerId: string, avatarJson: string): Promise<void> {
    must(await this.db.from('ww_players').update({ avatar: avatarJson }).eq('player_id', playerId) as never, 'setPlayerAvatar');
  }

  async resetForNewGame(code: string, newSeed: string): Promise<void> {
    must(await this.db.from('ww_room_secrets').update({ rng_seed: newSeed }).eq('room_code', code) as never, 'reset.seed');
    for (const table of ['ww_events', 'ww_events_private', 'ww_chat_private', 'ww_intents', 'ww_votes', 'ww_nominations']) {
      must(await this.db.from(table).delete().eq('room_code', code) as never, `reset.${table}`);
    }
  }

  async listEvents(code: string, limit: number): Promise<PublicEventRecord[]> {
    const res = await this.db.from('ww_events').select('id,day_number,phase,kind,payload_public,created_at').eq('room_code', code).order('id', { ascending: false }).limit(limit);
    const rows = (must(res, 'listEvents') ?? []) as { id: number; day_number: number; phase: string; kind: string; payload_public: Record<string, unknown>; created_at: string }[];
    return rows.reverse().map((r) => ({ id: r.id, day_number: r.day_number, phase: r.phase, kind: r.kind, payload: r.payload_public, created_at: r.created_at }));
  }

  async insertChatPublic(code: string, p: { player_id: string; display_name: string; text: string }): Promise<void> {
    must(await this.db.from('ww_chat_public').insert({ room_code: code, ...p }) as never, 'insertChatPublic');
  }

  async listChatPublic(code: string, limit: number): Promise<ChatRecord[]> {
    const res = await this.db.from('ww_chat_public').select('id,player_id,display_name,text,created_at').eq('room_code', code).order('id', { ascending: false }).limit(limit);
    return ((must(res, 'listChatPublic') ?? []) as ChatRecord[]).reverse();
  }

  async insertChatPrivate(code: string, channel: string, p: { player_id: string; display_name: string; text: string }): Promise<void> {
    must(await this.db.from('ww_chat_private').insert({ room_code: code, channel, ...p }) as never, 'insertChatPrivate');
  }

  async listChatPrivate(code: string, channel: string, limit: number): Promise<ChatRecord[]> {
    const res = await this.db.from('ww_chat_private').select('id,player_id,display_name,text,created_at').eq('room_code', code).eq('channel', channel).order('id', { ascending: false }).limit(limit);
    return ((must(res, 'listChatPrivate') ?? []) as ChatRecord[]).reverse();
  }
}
