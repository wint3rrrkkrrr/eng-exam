// shared/sound.ts — เสียงประกอบสั้นๆ สังเคราะห์ด้วย Web Audio API ล้วน (ไม่มีไฟล์เสียงภายนอกให้โหลด)
// ปิด/เปิดได้ (จำไว้ในเครื่องนี้) · เบราว์เซอร์บล็อกเสียงก่อนมีการแตะหน้าจอ — เรียกฟังก์ชันพวกนี้จากอีเวนต์ที่ผู้ใช้กดเองเสมอ
const MUTE_KEY = 'ww_sound_muted_v1';

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

export function isSoundMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setSoundMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch { /* ไม่เป็นไร — แค่จำสถานะไม่ได้ข้ามเซสชัน */ }
}

interface Tone { freq: number; start: number; dur: number; type?: OscillatorType; gain?: number }

/** เล่นชุดโน้ตสั้นๆ ต่อกัน (เวลาเป็นวินาที นับจากตอนเรียก) */
function playTones(tones: Tone[]): void {
  if (isSoundMuted()) return;
  const audio = getCtx();
  if (!audio) return;
  const now = audio.currentTime;
  for (const t of tones) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = t.type ?? 'sine';
    osc.frequency.value = t.freq;
    const peak = t.gain ?? 0.12;
    const t0 = now + t.start;
    const t1 = t0 + t.dur;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + Math.min(0.02, t.dur / 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, t1);
    osc.connect(gain).connect(audio.destination);
    osc.start(t0);
    osc.stop(t1 + 0.02);
  }
}

export type SoundKind =
  | 'night_start' | 'morning' | 'death' | 'tap' | 'confirm' | 'vote_result' | 'win' | 'lose' | 'timer_low';

/** เสียงแต่ละเหตุการณ์ในเกม — ทำนองสั้นๆ แยกแยะกันได้ด้วยหู ไม่ต้องมีไฟล์เสียง */
export function playGameSound(kind: SoundKind): void {
  switch (kind) {
    case 'night_start': // เสียงต่ำกังวาน ชวนให้รู้สึกถึงกลางคืน
      playTones([{ freq: 196, start: 0, dur: 0.9, type: 'sine', gain: 0.1 }, { freq: 147, start: 0.05, dur: 1, type: 'sine', gain: 0.07 }]);
      break;
    case 'morning': // ไล่เสียงขึ้นสดใส
      playTones([
        { freq: 392, start: 0, dur: 0.18, type: 'triangle' },
        { freq: 494, start: 0.15, dur: 0.18, type: 'triangle' },
        { freq: 587, start: 0.3, dur: 0.3, type: 'triangle' },
      ]);
      break;
    case 'death': // เสียงหม่นต่ำ
      playTones([{ freq: 130, start: 0, dur: 0.5, type: 'sawtooth', gain: 0.08 }, { freq: 98, start: 0.1, dur: 0.6, type: 'sine', gain: 0.1 }]);
      break;
    case 'tap': // แตะเลือกการ์ด — คลิกสั้นมาก
      playTones([{ freq: 880, start: 0, dur: 0.04, type: 'square', gain: 0.05 }]);
      break;
    case 'confirm': // ยืนยันคำสั่ง
      playTones([{ freq: 660, start: 0, dur: 0.08, type: 'sine', gain: 0.08 }, { freq: 880, start: 0.07, dur: 0.1, type: 'sine', gain: 0.08 }]);
      break;
    case 'vote_result': // ผลโหวต — เคาะเน้น
      playTones([{ freq: 220, start: 0, dur: 0.12, type: 'square', gain: 0.09 }, { freq: 220, start: 0.15, dur: 0.2, type: 'square', gain: 0.09 }]);
      break;
    case 'win': // ทำนองชนะ ไล่สูงขึ้น
      playTones([
        { freq: 523, start: 0, dur: 0.15 }, { freq: 659, start: 0.13, dur: 0.15 },
        { freq: 784, start: 0.26, dur: 0.15 }, { freq: 1047, start: 0.39, dur: 0.4 },
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
  }
}
