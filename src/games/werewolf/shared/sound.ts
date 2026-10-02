// shared/sound.ts — เสียงประกอบ + เพลงพื้นหลัง สังเคราะห์ด้วย Web Audio API ล้วน (ไม่มีไฟล์เสียงภายนอกให้โหลด)
// เสียงเอฟเฟกต์ (SFX) และเพลง (music) ปิด/เปิดแยกกันได้ (จำไว้ในเครื่องนี้) · เบราว์เซอร์บล็อกเสียงก่อนมีการแตะหน้าจอ
// → ระบบจะเริ่มเล่นเพลงที่ค้างไว้ให้เองหลังแตะครั้งแรก
const MUTE_KEY = 'ww_sound_muted_v1';
const MUSIC_MUTE_KEY = 'ww_music_muted_v1';

let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

const readFlag = (key: string): boolean => {
  try { return localStorage.getItem(key) === '1'; } catch { return false; }
};
const writeFlag = (key: string, v: boolean): void => {
  try { localStorage.setItem(key, v ? '1' : '0'); } catch { /* จำสถานะข้ามเซสชันไม่ได้ ไม่เป็นไร */ }
};

export const isSoundMuted = (): boolean => readFlag(MUTE_KEY);
export const setSoundMuted = (muted: boolean): void => writeFlag(MUTE_KEY, muted);
export const isMusicMuted = (): boolean => readFlag(MUSIC_MUTE_KEY);
export function setMusicMuted(muted: boolean): void {
  writeFlag(MUSIC_MUTE_KEY, muted);
  syncMusic();
}

// ================================================================ เอฟเฟกต์เสียง
interface Tone { freq: number; start: number; dur: number; type?: OscillatorType; gain?: number; to?: number }

/** เล่นชุดโน้ตสั้นๆ ต่อกัน (เวลาเป็นวินาที นับจากตอนเรียก) · to = ไถความถี่ไปหาค่านี้ (หอน/นกร้อง) */
function playTones(tones: Tone[]): void {
  if (isSoundMuted()) return;
  const audio = getCtx();
  if (!audio) return;
  const now = audio.currentTime;
  for (const t of tones) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = t.type ?? 'sine';
    const t0 = now + t.start;
    const t1 = t0 + t.dur;
    osc.frequency.setValueAtTime(t.freq, t0);
    if (t.to) osc.frequency.exponentialRampToValueAtTime(t.to, t1);
    const peak = t.gain ?? 0.12;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + Math.min(0.02, t.dur / 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, t1);
    osc.connect(gain).connect(audio.destination);
    osc.start(t0);
    osc.stop(t1 + 0.02);
  }
}

let noiseBuf: AudioBuffer | null = null;
/** เสียงซ่า (ลม/ตุบ) ผ่านฟิลเตอร์ */
function playNoise(start: number, dur: number, freq: number, gainPeak = 0.08, q = 1, kind: BiquadFilterType = 'bandpass'): void {
  if (isSoundMuted()) return;
  const audio = getCtx();
  if (!audio) return;
  if (!noiseBuf) {
    noiseBuf = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = audio.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = audio.createBiquadFilter();
  f.type = kind;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = audio.createGain();
  const t0 = audio.currentTime + start;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gainPeak, t0 + Math.min(0.03, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(audio.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
}

export type SoundKind =
  | 'night_start' | 'morning' | 'death' | 'tap' | 'confirm' | 'vote_result' | 'win' | 'lose' | 'timer_low'
  | 'wolf_howl' | 'owl' | 'birds' | 'bell' | 'heartbeat' | 'join' | 'chat' | 'vote_cast' | 'error'
  | 'coin' | 'buy' | 'gacha_tick' | 'rarity_common' | 'rarity_rare' | 'rarity_epic' | 'rarity_legendary';

const howl = (start: number, base: number, gain = 0.07): Tone[] => [
  { freq: base, to: base * 1.9, start, dur: 0.9, type: 'sawtooth', gain: gain * 0.6 },
  { freq: base * 1.9, to: base * 1.5, start: start + 0.85, dur: 1.2, type: 'sine', gain },
  { freq: base * 1.5, to: base * 0.8, start: start + 2, dur: 0.9, type: 'sine', gain: gain * 0.7 },
];
const chirp = (start: number, f: number): Tone[] => [
  { freq: f, to: f * 1.5, start, dur: 0.07, type: 'sine', gain: 0.05 },
  { freq: f * 1.4, to: f * 1.1, start: start + 0.08, dur: 0.09, type: 'sine', gain: 0.045 },
];

/** เสียงแต่ละเหตุการณ์ในเกม — ทำนองสั้นๆ แยกแยะกันได้ด้วยหู ไม่ต้องมีไฟล์เสียง */
export function playGameSound(kind: SoundKind): void {
  switch (kind) {
    case 'night_start': // เสียงต่ำกังวาน + ลมหนาว + หมาป่าหอนไกลๆ
      playTones([{ freq: 196, start: 0, dur: 0.9, type: 'sine', gain: 0.1 }, { freq: 147, start: 0.05, dur: 1, type: 'sine', gain: 0.07 }, ...howl(0.6, 260, 0.045)]);
      playNoise(0, 2.4, 500, 0.03, 0.6);
      break;
    case 'morning': // ไล่เสียงขึ้นสดใส + นกร้อง
      playTones([
        { freq: 392, start: 0, dur: 0.18, type: 'triangle' },
        { freq: 494, start: 0.15, dur: 0.18, type: 'triangle' },
        { freq: 587, start: 0.3, dur: 0.3, type: 'triangle' },
        ...chirp(0.7, 2200), ...chirp(0.95, 2700), ...chirp(1.3, 2400), ...chirp(1.5, 3000),
      ]);
      break;
    case 'death': // เสียงหม่นต่ำ + ตุบ
      playTones([{ freq: 130, start: 0, dur: 0.5, type: 'sawtooth', gain: 0.08 }, { freq: 98, start: 0.1, dur: 0.6, type: 'sine', gain: 0.1 }, { freq: 90, to: 40, start: 0, dur: 0.4, type: 'sine', gain: 0.18 }]);
      playNoise(0, 0.25, 200, 0.1, 0.8, 'lowpass');
      break;
    case 'tap': // แตะเลือกการ์ด — คลิกสั้นมาก
      playTones([{ freq: 880, start: 0, dur: 0.04, type: 'square', gain: 0.05 }]);
      break;
    case 'confirm': // ยืนยันคำสั่ง
      playTones([{ freq: 660, start: 0, dur: 0.08, type: 'sine', gain: 0.08 }, { freq: 880, start: 0.07, dur: 0.1, type: 'sine', gain: 0.08 }]);
      break;
    case 'vote_result': // ผลโหวต — เคาะค้อนเน้น
      playTones([{ freq: 220, start: 0, dur: 0.12, type: 'square', gain: 0.09 }, { freq: 220, start: 0.15, dur: 0.2, type: 'square', gain: 0.09 }]);
      playNoise(0, 0.1, 900, 0.1, 1.2);
      break;
    case 'win': // ทำนองชนะ ไล่สูงขึ้น
      playTones([
        { freq: 523, start: 0, dur: 0.15 }, { freq: 659, start: 0.13, dur: 0.15 },
        { freq: 784, start: 0.26, dur: 0.15 }, { freq: 1047, start: 0.39, dur: 0.4 },
        { freq: 784, start: 0.39, dur: 0.4, gain: 0.06 }, { freq: 659, start: 0.39, dur: 0.4, gain: 0.05 },
      ]);
      break;
    case 'lose': // ทำนองแพ้ ไล่ต่ำลง
      playTones([
        { freq: 392, start: 0, dur: 0.18, type: 'sawtooth' }, { freq: 330, start: 0.16, dur: 0.18, type: 'sawtooth' },
        { freq: 262, start: 0.32, dur: 0.4, type: 'sawtooth' },
      ]);
      break;
    case 'timer_low': // เวลาใกล้หมด
      playTones([{ freq: 1200, start: 0, dur: 0.06, type: 'square', gain: 0.06 }]);
      break;
    case 'wolf_howl':
      playTones(howl(0, 300, 0.09));
      break;
    case 'owl': // นกฮูก ฮู-ฮู้
      playTones([{ freq: 420, to: 380, start: 0, dur: 0.28, gain: 0.08 }, { freq: 400, to: 330, start: 0.4, dur: 0.5, gain: 0.08 }]);
      break;
    case 'birds':
      playTones([...chirp(0, 2300), ...chirp(0.25, 2800), ...chirp(0.7, 2500)]);
      break;
    case 'bell': // ระฆัง
      playTones([{ freq: 660, start: 0, dur: 1.4, gain: 0.09 }, { freq: 1320, start: 0, dur: 0.9, gain: 0.04 }, { freq: 1990, start: 0, dur: 0.5, gain: 0.025 }]);
      break;
    case 'heartbeat':
      playTones([{ freq: 70, to: 45, start: 0, dur: 0.16, gain: 0.2 }, { freq: 65, to: 42, start: 0.2, dur: 0.18, gain: 0.16 }]);
      break;
    case 'join': // มีคนเข้าห้อง
      playTones([{ freq: 587, start: 0, dur: 0.09, type: 'triangle', gain: 0.08 }, { freq: 784, start: 0.09, dur: 0.14, type: 'triangle', gain: 0.08 }]);
      break;
    case 'chat': // มีข้อความใหม่
      playTones([{ freq: 1046, start: 0, dur: 0.06, gain: 0.05 }]);
      break;
    case 'vote_cast': // กดโหวต
      playTones([{ freq: 330, start: 0, dur: 0.07, type: 'square', gain: 0.07 }, { freq: 494, start: 0.06, dur: 0.1, type: 'square', gain: 0.07 }]);
      break;
    case 'error':
      playTones([{ freq: 200, start: 0, dur: 0.12, type: 'square', gain: 0.07 }, { freq: 150, start: 0.1, dur: 0.18, type: 'square', gain: 0.07 }]);
      break;
    case 'coin': // เหรียญกริ๊ง
      playTones([{ freq: 1568, start: 0, dur: 0.08, type: 'square', gain: 0.05 }, { freq: 2093, start: 0.07, dur: 0.35, type: 'square', gain: 0.05 }]);
      break;
    case 'buy': // ซื้อสำเร็จ: เหรียญไหล + ติ๊ง
      playTones([
        { freq: 1568, start: 0, dur: 0.07, type: 'square', gain: 0.045 }, { freq: 2093, start: 0.06, dur: 0.07, type: 'square', gain: 0.045 },
        { freq: 2637, start: 0.12, dur: 0.3, type: 'square', gain: 0.045 }, { freq: 523, start: 0.12, dur: 0.3, type: 'triangle', gain: 0.07 },
      ]);
      break;
    case 'gacha_tick': // วงล้อผ่านช่อง
      playTones([{ freq: 1500, start: 0, dur: 0.025, type: 'square', gain: 0.04 }]);
      break;
    case 'rarity_common':
      playTones([{ freq: 523, start: 0, dur: 0.15, type: 'triangle' }, { freq: 659, start: 0.12, dur: 0.2, type: 'triangle' }]);
      break;
    case 'rarity_rare':
      playTones([{ freq: 523, start: 0, dur: 0.12, type: 'triangle' }, { freq: 659, start: 0.1, dur: 0.12, type: 'triangle' }, { freq: 880, start: 0.2, dur: 0.35, type: 'triangle' }]);
      break;
    case 'rarity_epic':
      playTones([
        { freq: 392, start: 0, dur: 0.12, type: 'triangle' }, { freq: 523, start: 0.1, dur: 0.12, type: 'triangle' }, { freq: 659, start: 0.2, dur: 0.12, type: 'triangle' },
        { freq: 784, start: 0.3, dur: 0.5, type: 'triangle' }, { freq: 1175, start: 0.3, dur: 0.5, type: 'sine', gain: 0.05 },
      ]);
      break;
    case 'rarity_legendary': // แฟนแฟร์ + ระฆัง + ประกาย
      playTones([
        { freq: 392, start: 0, dur: 0.14, type: 'sawtooth', gain: 0.06 }, { freq: 523, start: 0.12, dur: 0.14, type: 'sawtooth', gain: 0.06 },
        { freq: 659, start: 0.24, dur: 0.14, type: 'sawtooth', gain: 0.06 }, { freq: 784, start: 0.36, dur: 0.14, type: 'sawtooth', gain: 0.06 },
        { freq: 1047, start: 0.5, dur: 0.9, type: 'triangle', gain: 0.1 }, { freq: 1568, start: 0.5, dur: 0.9, type: 'sine', gain: 0.05 },
        { freq: 2093, start: 0.7, dur: 0.07, type: 'sine', gain: 0.04 }, { freq: 2637, start: 0.82, dur: 0.07, type: 'sine', gain: 0.04 }, { freq: 3136, start: 0.94, dur: 0.15, type: 'sine', gain: 0.04 },
      ]);
      break;
  }
}

// ================================================================ เพลงพื้นหลัง (ซีเควนเซอร์สังเคราะห์ วนซ้ำ)
export type MusicTrack = 'menu' | 'lobby' | 'day' | 'night' | 'vote';

interface Voice {
  wave: OscillatorType;
  gain: number;
  /** โน้ตต่อ 1 สเต็ป (ครึ่งจังหวะ) คั่นด้วยช่องว่าง · "." = เงียบ */
  notes: string;
  /** ความยาวโน้ต (สเต็ป) */
  hold: number;
  lp?: number; // ตัดความถี่สูง (เสียงนุ่ม)
}
interface Track { bpm: number; steps: number; voices: Voice[] }

const NOTE_RE = /^([A-G])([#b]?)(\d)$/;
const SEMI: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midiOf = (n: string): number | null => {
  const m = NOTE_RE.exec(n);
  if (!m) return null;
  return 12 * (Number(m[3]) + 1) + SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
};
const hz = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);
const parse = (s: string, steps: number): (number | null)[] => {
  const out = s.trim().split(/\s+/).map(midiOf);
  while (out.length < steps) out.push(null);
  return out.slice(0, steps);
};
const rep = (s: string, n: number): string => Array(n).fill(s).join(' ');

export const TRACKS: Record<MusicTrack, Track> = {
  // หน้าแรก/ร้านค้า: ร่าเริง คีย์ซีเมเจอร์
  menu: {
    bpm: 108, steps: 32, voices: [
      { wave: 'triangle', gain: 0.055, hold: 1.6, notes: 'E5 . G5 . E5 . D5 . C5 . E5 . G5 . A5 . G5 . E5 . D5 . C5 . D5 . E5 . . .', lp: 3200 },
      { wave: 'sine', gain: 0.11, hold: 3, notes: 'C3 . . . G2 . . . A2 . . . F2 . . . C3 . . . G2 . . . F2 . . . G2 . . .' },
      { wave: 'sine', gain: 0.03, hold: 8, notes: 'E4 . . . . . . . F4 . . . . . . . E4 . . . . . . . D4 . . . . . . .' },
      { wave: 'triangle', gain: 0.03, hold: 1, notes: 'C5 . . C5 . . C5 . . C5 . . C5 . . C5 . . C5 . . C5 . . C5 . . C5 . . C5', lp: 2500 },
    ],
  },
  // ล็อบบี้รอเพื่อน: อบอุ่น ผ่อนคลาย
  lobby: {
    bpm: 84, steps: 32, voices: [
      { wave: 'sine', gain: 0.07, hold: 2, notes: 'G4 . B4 . D5 . B4 . A4 . C5 . E5 . C5 . G4 . B4 . D5 . . . E5 . D5 . B4 . . .', lp: 2800 },
      { wave: 'sine', gain: 0.1, hold: 4, notes: 'G2 . . . . . . . E3 . . . . . . . C3 . . . . . . . D3 . . . . . . .' },
      { wave: 'triangle', gain: 0.035, hold: 8, notes: 'B3 . . . . . . . G3 . . . . . . . E4 . . . . . . . F#3 . . . . . . .', lp: 1800 },
    ],
  },
  // กลางวัน: สดใส แต่ตึงเล็กน้อย เพราะต้องหาตัวหมาป่า — มีเสียงนกเสริมเป็นระยะ
  day: {
    bpm: 96, steps: 32, voices: [
      { wave: 'triangle', gain: 0.06, hold: 1.5, notes: 'D5 . F#5 . A5 . F#5 . E5 . G5 . B5 . G5 . D5 . F#5 . A5 . . . E5 . F#5 . D5 . . .', lp: 3400 },
      { wave: 'sine', gain: 0.1, hold: 3, notes: 'D3 . . . . . A2 . G2 . . . . . D3 . D3 . . . . . A2 . E3 . . . . . A2 .' },
      { wave: 'sine', gain: 0.03, hold: 8, notes: 'F#4 . . . . . . . G4 . . . . . . . F#4 . . . . . . . E4 . . . . . . .' },
      { wave: 'square', gain: 0.012, hold: 0.7, notes: 'A4 . . . A4 . . . A4 . . . A4 . . . A4 . . . A4 . . . A4 . . . A4 . . .', lp: 1800 },
    ],
  },
  // กลางคืน: มืดหม่น ดีไมเนอร์ จังหวะช้า หัวใจเต้น + ระฆังไกลๆ + ลมหวีด
  night: {
    bpm: 60, steps: 32, voices: [
      { wave: 'sine', gain: 0.07, hold: 16, notes: 'D3 . . . . . . . . . . . . . . . Bb2 . . . . . . . . . . . . . . .', lp: 900 },
      { wave: 'sine', gain: 0.045, hold: 16, notes: 'A3 . . . . . . . . . . . . . . . F3 . . . . . . . . . . . . . . .', lp: 900 },
      { wave: 'sine', gain: 0.17, hold: 1, notes: 'D2 . . D2 . . . . . . . . D2 . . D2 . . . . . . . . D2 . . D2 . . . .' },
      { wave: 'triangle', gain: 0.035, hold: 6, notes: `A5 ${rep('.', 23)} F5 ${rep('.', 7)}`, lp: 3000 },
      { wave: 'sawtooth', gain: 0.012, hold: 12, notes: 'D4', lp: 400 },
    ],
  },
  // โหวต/ตัดสิน: ตึงเครียด ชีพจรเร็ว
  vote: {
    bpm: 124, steps: 32, voices: [
      { wave: 'sawtooth', gain: 0.055, hold: 0.9, notes: `${rep('A2', 8)} ${rep('F2', 8)} ${rep('G2', 8)} ${rep('E2', 8)}`, lp: 700 },
      { wave: 'square', gain: 0.025, hold: 1, notes: 'E5 . . E5 . . E5 . . . . . D5 . . D5 . . D5 . . . . . C5 . . C5 . B4 . .', lp: 2400 },
      { wave: 'sine', gain: 0.12, hold: 1, notes: 'A1 . . . A1 . . . F1 . . . F1 . . . G1 . . . G1 . . . E1 . . . E1 . . .' },
    ],
  },
};

const LOOKAHEAD = 0.3; // วินาทีที่จองโน้ตล่วงหน้า
let wanted: MusicTrack | null = null; // เพลงที่ "ควรเล่น"
interface Running { name: MusicTrack; out: GainNode; timer: number; nextTime: number; step: number; parsed: (number | null)[][] }
let running: Running | null = null;
let primed = false;

function scheduleStep(audio: AudioContext, r: Running, track: Track, at: number): void {
  const stepDur = 60 / track.bpm / 2;
  track.voices.forEach((v, vi) => {
    const midi = r.parsed[vi][r.step];
    if (midi === null || midi === undefined) return;
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = v.wave;
    osc.frequency.value = hz(midi);
    const dur = Math.max(0.05, v.hold * stepDur);
    const atk = Math.min(0.06, dur / 3);
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(v.gain, at + atk);
    g.gain.setValueAtTime(v.gain, at + Math.max(atk, dur * 0.55));
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    if (v.lp) {
      const f = audio.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = v.lp;
      osc.connect(f).connect(g);
    } else {
      osc.connect(g);
    }
    g.connect(r.out);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  });
}

function startTrack(name: MusicTrack): void {
  const audio = getCtx();
  if (!audio || audio.state !== 'running') return;
  const track = TRACKS[name];
  const out = audio.createGain();
  out.gain.setValueAtTime(0, audio.currentTime);
  out.gain.linearRampToValueAtTime(1, audio.currentTime + 1.2);
  out.connect(audio.destination);
  const r: Running = { name, out, timer: 0, nextTime: audio.currentTime + 0.1, step: 0, parsed: track.voices.map((v) => parse(v.notes, track.steps)) };
  const stepDur = 60 / track.bpm / 2;
  r.timer = window.setInterval(() => {
    while (r.nextTime < audio.currentTime + LOOKAHEAD) {
      scheduleStep(audio, r, track, r.nextTime);
      r.nextTime += stepDur;
      r.step = (r.step + 1) % track.steps;
      // เสียงนก/หมาป่า/นกฮูกเสริมแบบสุ่มเบาๆ ตอนขึ้นรอบใหม่ ให้ฉากมีชีวิต
      if (r.step === 0 && !isSoundMuted()) {
        if (r.name === 'day' && Math.random() < 0.7) playGameSound('birds');
        if (r.name === 'night' && Math.random() < 0.5) playGameSound(Math.random() < 0.5 ? 'wolf_howl' : 'owl');
      }
    }
  }, 60);
  running = r;
}

function stopRunning(): void {
  const r = running;
  running = null;
  if (!r) return;
  clearInterval(r.timer);
  const audio = ctx;
  if (audio) {
    try {
      r.out.gain.cancelScheduledValues(audio.currentTime);
      r.out.gain.setValueAtTime(r.out.gain.value, audio.currentTime);
      r.out.gain.linearRampToValueAtTime(0, audio.currentTime + 0.8);
    } catch { /* ignore */ }
    window.setTimeout(() => { try { r.out.disconnect(); } catch { /* ignore */ } }, 1200);
  }
}

/** ทำให้สถานะที่เล่นอยู่ตรงกับที่ต้องการ (เพลงที่เลือก/ปิดเสียง/แท็บซ่อน) */
function syncMusic(): void {
  if (typeof window === 'undefined') return;
  const should = wanted !== null && !isMusicMuted() && !document.hidden;
  if (!should) return stopRunning();
  if (running?.name === wanted) return;
  stopRunning();
  startTrack(wanted!);
}

/** เลือกเพลงพื้นหลัง (null = หยุด) — เรียกซ้ำด้วยชื่อเดิมจะเล่นต่อไม่สะดุด */
export function setMusic(track: MusicTrack | null): void {
  wanted = track;
  if (typeof window === 'undefined') return;
  if (!primed) {
    primed = true;
    // เบราว์เซอร์ต้องมีการแตะก่อนถึงจะเล่นเสียงได้ → ปลุกระบบเสียงตอนแตะครั้งแรก แล้วเริ่มเพลงที่ค้างไว้
    const wake = () => { getCtx(); syncMusic(); };
    window.addEventListener('pointerdown', wake, { passive: true });
    window.addEventListener('keydown', wake);
    document.addEventListener('visibilitychange', syncMusic);
  }
  syncMusic();
}

/** เฟสของห้อง → เพลงที่เหมาะ (กลางคืนมืดหม่น กลางวันสดใส ช่วงโหวตตึงเครียด) */
export function musicForPhase(phase: string): MusicTrack | null {
  switch (phase) {
    case 'lobby': return 'lobby';
    case 'night': case 'role_reveal': return 'night';
    case 'nomination': case 'defense': case 'vote': case 'execution': return 'vote';
    case 'game_over': return null; // เงียบให้ฟังเสียงชนะ/แพ้
    default: return 'day'; // morning, discussion, ฯลฯ
  }
}
