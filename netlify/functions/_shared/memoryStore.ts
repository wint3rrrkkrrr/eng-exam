// _shared/memoryStore.ts — ที่เก็บในหน่วยความจำ: ใช้ทดสอบ และรันเกมในเครื่องโดยไม่ต้องมี Supabase
// (ข้อมูลหายเมื่อปิดโปรแกรม · ไม่มี Realtime — ไคลเอนต์ใช้การดึงซ้ำ (poll) แทน)
import type {
  BuyResult, SpinResult, ChatRecord, Commit, EventRow, PlayerRow, PublicEventRecord, RoomRow, RoomSecrets, WalletRow, WwStore,
} from './store';

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

interface ChatStore { rows: ChatRecord[]; seq: number }

export class MemoryStore implements WwStore {
  rooms = new Map<string, RoomRow>();
  secrets = new Map<string, RoomSecrets>();
  players = new Map<string, PlayerRow>();
  auth = new Map<string, { token_hash: string; room_code: string }>();
  wallets = new Map<string, WalletRow & { token_hash: string }>();
  credentials = new Map<string, string>(); // username → แฮชรหัสผ่าน (จำลอง winter_credentials)
  users = new Set<string>();
  sessions = new Map<string, { username: string; expires_at: string }>();
  rate = new Map<string, { start: number; hits: number }>();
  playerWallet = new Map<string, string>();
  eventsPublic = new Map<string, PublicEventRecord[]>();
  eventsPrivate = new Map<string, EventRow[]>();
  chatPublic = new Map<string, ChatStore>();
  chatPrivate = new Map<string, ChatStore>(); // key = code|channel
  private eventSeq = 0;

  async getRoom(code: string) {
    const r = this.rooms.get(code);
    return r ? clone(r) : null;
  }

  async getRoomSecrets(code: string) {
    const s = this.secrets.get(code);
    return s ? clone(s) : null;
  }

  async createRoom(room: RoomRow, secrets: { rng_seed: string; password_hash: string | null }, host: PlayerRow, hostTokenHash: string) {
    if (this.rooms.has(room.room_code)) return false;
    this.rooms.set(room.room_code, clone(room));
    this.secrets.set(room.room_code, { ...secrets, engine_state: null });
    this.players.set(host.player_id, clone(host));
    this.auth.set(host.player_id, { token_hash: hostTokenHash, room_code: room.room_code });
    return true;
  }

  async listPlayers(code: string) {
    return Array.from(this.players.values()).filter((p) => p.room_code === code).sort((a, b) => a.seat - b.seat).map(clone);
  }

  async addPlayer(p: PlayerRow, tokenHash: string) {
    this.players.set(p.player_id, clone(p));
    this.auth.set(p.player_id, { token_hash: tokenHash, room_code: p.room_code });
  }

  async deletePlayer(id: string) {
    this.players.delete(id);
    this.auth.delete(id);
  }

  async getAuth(id: string) {
    const a = this.auth.get(id);
    return a ? { ...a } : null;
  }

  async setAuth(id: string, roomCode: string, tokenHash: string) {
    this.auth.set(id, { token_hash: tokenHash, room_code: roomCode });
  }

  async deleteAuth(id: string) {
    this.auth.delete(id);
  }

  async touchPlayer(id: string, atIso: string) {
    const p = this.players.get(id);
    if (p) {
      p.last_seen_at = atIso;
      p.is_connected = true;
    }
  }

  async setSpectator(id: string, flag: boolean) {
    const p = this.players.get(id);
    if (p) p.is_spectator = flag;
  }

  async updateLobbySettings(code: string, settings: Record<string, unknown>) {
    const r = this.rooms.get(code);
    if (!r) return;
    r.settings = clone(settings);
    r.state_version += 1;
    r.updated_at = new Date().toISOString();
  }

  async commit(c: Commit) {
    const r = this.rooms.get(c.roomCode);
    if (!r || r.state_version !== c.expectVersion) return false;
    Object.assign(r, clone(c.room));
    r.state_version += 1;
    r.updated_at = new Date().toISOString();
    const sec = this.secrets.get(c.roomCode);
    if (sec) sec.engine_state = c.engine ? clone(c.engine) : null;
    for (const p of c.players) {
      const row = this.players.get(p.player_id);
      if (row && row.room_code === c.roomCode) Object.assign(row, clone(p));
    }
    const pub = this.eventsPublic.get(c.roomCode) ?? [];
    for (const e of c.eventsPublic) pub.push({ ...clone(e), id: ++this.eventSeq, created_at: new Date().toISOString() });
    this.eventsPublic.set(c.roomCode, pub);
    const priv = this.eventsPrivate.get(c.roomCode) ?? [];
    for (const e of c.eventsPrivate) priv.push(clone(e));
    this.eventsPrivate.set(c.roomCode, priv);
    return true;
  }

  async logPrivate(code: string, e: EventRow) {
    const priv = this.eventsPrivate.get(code) ?? [];
    priv.push(clone(e));
    this.eventsPrivate.set(code, priv);
  }

  // ---------------------------------------------------------------- กระเป๋าเงิน
  async createWallet(walletId: string, tokenHash: string, coins: number) {
    this.wallets.set(walletId, { wallet_id: walletId, token_hash: tokenHash, coins, owned: [], avatar: null, games_played: 0, wins: 0 });
  }

  async getWalletByUsername(username: string) {
    for (const w of this.wallets.values()) if (w.username === username) return this.view(w);
    return null;
  }

  async bindWalletToAccount(walletId: string, username: string, tokenHash: string) {
    const w = this.wallets.get(walletId);
    if (w) { w.username = username; w.token_hash = tokenHash; }
  }

  async getCredential(username: string) {
    return this.credentials.get(username) ?? null;
  }

  async createCredential(username: string, hash: string) {
    if (this.credentials.has(username)) return false;
    this.credentials.set(username, hash);
    return true;
  }

  async updateCredential(username: string, hash: string) {
    this.credentials.set(username, hash);
  }

  async ensureUser(username: string) {
    this.users.add(username);
  }

  async createSession(tokenHash: string, username: string, expiresAtIso: string) {
    this.sessions.set(tokenHash, { username, expires_at: expiresAtIso });
  }

  async getSession(tokenHash: string) {
    const s = this.sessions.get(tokenHash);
    return s ? { ...s } : null;
  }

  async rateHit(key: string, limit: number, windowSeconds: number) {
    const now = Date.now();
    const cur = this.rate.get(key);
    if (!cur || now - cur.start > windowSeconds * 1000) {
      this.rate.set(key, { start: now, hits: 1 });
      return 1 <= limit;
    }
    cur.hits += 1;
    return cur.hits <= limit;
  }

  async getWalletTokenHash(walletId: string) {
    return this.wallets.get(walletId)?.token_hash ?? null;
  }

  private view(w: WalletRow & { token_hash: string }): WalletRow {
    const { token_hash: _t, ...rest } = w;
    void _t;
    return clone(rest);
  }

  async getWallet(walletId: string) {
    const w = this.wallets.get(walletId);
    return w ? this.view(w) : null;
  }

  async walletBuy(walletId: string, itemId: string, price: number): Promise<BuyResult> {
    const w = this.wallets.get(walletId);
    if (!w) return { ok: false, reason: 'none' };
    if (w.owned.includes(itemId)) return { ok: false, reason: 'owned' };
    if (w.coins < price) return { ok: false, reason: 'poor' };
    w.coins -= price; // ไม่มี await ระหว่างตรวจกับหัก → atomic ในโหนดเดียว
    w.owned.push(itemId);
    return { ok: true, wallet: this.view(w) };
  }

  async walletCredit(walletId: string, amount: number, won: boolean) {
    const w = this.wallets.get(walletId);
    if (!w) return null;
    w.coins += amount;
    w.games_played += 1;
    if (won) w.wins += 1;
    return this.view(w);
  }

  async walletSpin(walletId: string, cost: number, itemId: string, refund: number): Promise<SpinResult> {
    const w = this.wallets.get(walletId);
    if (!w) return { ok: false, reason: 'none' };
    if (w.coins < cost) return { ok: false, reason: 'poor' };
    if (w.owned.includes(itemId)) {
      w.coins = w.coins - cost + refund;
      return { ok: true, duplicate: true };
    }
    w.coins -= cost;
    w.owned = [...w.owned, itemId];
    return { ok: true, duplicate: false };
  }

  async walletGrant(walletId: string, itemIds: string[]): Promise<number | null> {
    const w = this.wallets.get(walletId);
    if (!w) return null;
    let added = 0;
    for (const id of itemIds) if (!w.owned.includes(id)) { w.owned = [...w.owned, id]; added++; }
    return added;
  }

  async walletSetAvatar(walletId: string, avatar: Record<string, string>) {
    const w = this.wallets.get(walletId);
    if (w) w.avatar = clone(avatar);
  }

  async setPlayerWallet(playerId: string, walletId: string | null) {
    if (walletId) this.playerWallet.set(playerId, walletId);
    else this.playerWallet.delete(playerId);
  }

  async getRoomWallets(code: string) {
    const out: Record<string, string> = {};
    for (const p of this.players.values()) {
      const w = this.playerWallet.get(p.player_id);
      if (p.room_code === code && w) out[p.player_id] = w;
    }
    return out;
  }

  async setPlayerAvatar(playerId: string, avatarJson: string) {
    const p = this.players.get(playerId);
    if (p) p.avatar = avatarJson;
  }

  async resetForNewGame(code: string, newSeed: string) {
    const sec = this.secrets.get(code);
    if (sec) sec.rng_seed = newSeed;
    this.eventsPublic.set(code, []);
    this.eventsPrivate.set(code, []);
    for (const key of Array.from(this.chatPrivate.keys())) if (key.startsWith(`${code}|`)) this.chatPrivate.delete(key);
  }

  async listEvents(code: string, limit: number): Promise<PublicEventRecord[]> {
    return (this.eventsPublic.get(code) ?? []).slice(-limit).map(clone);
  }

  private chatIn(map: Map<string, ChatStore>, key: string): ChatStore {
    let s = map.get(key);
    if (!s) {
      s = { rows: [], seq: 0 };
      map.set(key, s);
    }
    return s;
  }

  async insertChatPublic(code: string, p: { player_id: string; display_name: string; text: string }) {
    const s = this.chatIn(this.chatPublic, code);
    s.rows.push({ id: ++s.seq, ...p, created_at: new Date().toISOString() });
  }

  async listChatPublic(code: string, limit: number) {
    return this.chatIn(this.chatPublic, code).rows.slice(-limit).map(clone);
  }

  async insertChatPrivate(code: string, channel: string, p: { player_id: string; display_name: string; text: string }) {
    const s = this.chatIn(this.chatPrivate, `${code}|${channel}`);
    s.rows.push({ id: ++s.seq, ...p, created_at: new Date().toISOString() });
  }

  async listChatPrivate(code: string, channel: string, limit: number) {
    return this.chatIn(this.chatPrivate, `${code}|${channel}`).rows.slice(-limit).map(clone);
  }
}
