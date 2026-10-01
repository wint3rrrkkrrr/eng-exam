// engine/rng.ts — ตัวสุ่มแบบกำหนดเมล็ด (seeded) ให้เทสต์ซ้ำได้ผลเดิม
// สถานะของตัวสุ่มเก็บเป็นตัวเลขใน GameState.rngState (แปลงเป็น JSON ได้)

export function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

// mulberry32
export function nextRand(s: { rngState: number }): number {
  s.rngState = (s.rngState + 0x6d2b79f5) >>> 0;
  let t = s.rngState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function randInt(s: { rngState: number }, n: number): number {
  return Math.floor(nextRand(s) * n);
}

export function pick<T>(s: { rngState: number }, arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[randInt(s, arr.length)];
}

export function shuffle<T>(s: { rngState: number }, arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(s, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
