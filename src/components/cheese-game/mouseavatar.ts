export interface MouseAvatarConfig {
  bg: string;
  hat: string;
  acc: string;
}

export const BG_GRADIENTS: Record<string, { colors: [string, string]; label: string }> = {
  pink:     { colors: ['#f9a8d4', '#fce7f3'], label: '🩷 ชมพู' },
  blue:     { colors: ['#93c5fd', '#dbeafe'], label: '💙 ฟ้า' },
  purple:   { colors: ['#c4b5fd', '#ede9fe'], label: '💜 ม่วง' },
  yellow:   { colors: ['#fde68a', '#fef9c3'], label: '💛 เหลือง' },
  mint:     { colors: ['#6ee7b7', '#d1fae5'], label: '💚 มิ้นท์' },
  orange:   { colors: ['#fdba74', '#ffedd5'], label: '🧡 ส้ม' },
  lavender: { colors: ['#e9d5ff', '#f5f3ff'], label: '🪻 ลาเวนเดอร์' },
  dark:     { colors: ['#52525b', '#3f3f46'], label: '🖤 ดำ' },
};

export const HAT_OPTIONS = ['', '👑', '🎩', '🎓', '🎀', '🌸', '⭐', '🍄', '🪖', '🎃', '🎅', '🪄'];
export const ACC_OPTIONS = ['', '✨', '💎', '🌈', '🔥', '🎵', '🍭', '💫', '🌺', '🦋', '🌙', '❤️'];

export const HAT_LABELS = ['ไม่มี', 'มงกุฎ', 'หมวกสุภาพ', 'หมวกวิชาการ', 'โบว์', 'ดอกไม้', 'ดาว', 'เห็ด', 'หมวกทหาร', 'แจ็คโอแลนเทิร์น', 'หมวกซานต้า', 'ไม้กายสิทธิ์'];
export const ACC_LABELS = ['ไม่มี', 'ประกาย', 'เพชร', 'รุ้ง', 'ไฟ', 'โน้ตเพลง', 'ลูกอม', 'ดาวหมุน', 'ดอกกุหลาบ', 'ผีเสื้อ', 'พระจันทร์', 'หัวใจ'];

export const DEFAULT_AVATAR_CONFIG: MouseAvatarConfig = { bg: 'pink', hat: '', acc: '' };
export const AVATAR_STORAGE_KEY = 'cheese_mouse_avatar_v2';

export function loadMouseAvatarConfig(username: string): MouseAvatarConfig {
  try {
    const raw = localStorage.getItem(`${AVATAR_STORAGE_KEY}_${username}`);
    if (raw) return { ...DEFAULT_AVATAR_CONFIG, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_AVATAR_CONFIG };
}

export function saveMouseAvatarConfig(username: string, config: MouseAvatarConfig): void {
  try {
    localStorage.setItem(`${AVATAR_STORAGE_KEY}_${username}`, JSON.stringify(config));
  } catch {}
}

export function generateMouseAvatarUri(config: MouseAvatarConfig): string {
  const grad = BG_GRADIENTS[config.bg] || BG_GRADIENTS.pink;
  const [c1, c2] = grad.colors;
  const hat = config.hat;
  const acc = config.acc;

  const hatText = hat
    ? `<text x="40" y="23" font-size="20" text-anchor="middle" dominant-baseline="middle">${hat}</text>`
    : '';
  const mouseY = hat ? 52 : 46;
  const accText = acc
    ? `<text x="66" y="64" font-size="16" text-anchor="middle" dominant-baseline="middle">${acc}</text>`
    : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <clipPath id="cl"><circle cx="40" cy="40" r="40"/></clipPath>
  </defs>
  <circle cx="40" cy="40" r="40" fill="url(#bg)"/>
  ${hatText}
  <text x="40" y="${mouseY}" font-size="36" text-anchor="middle" dominant-baseline="middle">🐭</text>
  ${accText}
</svg>`;

  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}
