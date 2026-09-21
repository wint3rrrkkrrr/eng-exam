const TOTAL_PARTS = 10;
const PARTS = Array.from({ length: TOTAL_PARTS }, (_, i) =>
  `/bgm/part${String(i).padStart(2, '0')}.mp3`
);

class BgmPlayer {
  private audio: HTMLAudioElement;
  private partIndex = 0;
  private _playing = false;
  private listeners: (() => void)[] = [];

  constructor() {
    this.audio = new Audio();
    this.audio.volume = 0.45;
    this.audio.preload = 'none';
    this.audio.addEventListener('ended', () => this.advance());
    this.audio.addEventListener('error', () => this.advance());
  }

  private advance() {
    this.partIndex = (this.partIndex + 1) % TOTAL_PARTS;
    this.audio.src = PARTS[this.partIndex];
    if (this._playing) {
      this.audio.play().catch(() => {});
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  subscribe(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  play() {
    if (!this.audio.src || this.audio.src === window.location.href) {
      this.audio.src = PARTS[this.partIndex];
    }
    this._playing = true;
    this.audio.play().catch(() => {});
    this.notify();
  }

  pause() {
    this._playing = false;
    this.audio.pause();
    this.notify();
  }

  toggle() {
    if (this._playing) this.pause();
    else this.play();
  }

  get isPlaying() {
    return this._playing;
  }
}

export const bgmPlayer = new BgmPlayer();
