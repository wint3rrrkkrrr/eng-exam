const TOTAL_PARTS = 10;
const PARTS = Array.from({ length: TOTAL_PARTS }, (_, i) =>
  `/bgm/part${String(i).padStart(2, '0')}.mp3`
);

class BgmPlayer {
  private audio: HTMLAudioElement;
  private partIndex = 0;
  private _playing = false;
  private _volume = 0.45;
  private _muted = false;
  private listeners: (() => void)[] = [];

  constructor() {
    this.audio = new Audio();
    this.audio.volume = this._volume;
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

  get volume() {
    return this._volume;
  }

  get muted() {
    return this._muted;
  }

  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (!this._muted) this.audio.volume = this._volume;
    this.notify();
  }

  toggleMute() {
    this._muted = !this._muted;
    this.audio.volume = this._muted ? 0 : this._volume;
    this.notify();
  }
}

export const bgmPlayer = new BgmPlayer();
