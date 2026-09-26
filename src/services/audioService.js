/**
 * SafePilot AI - Audio Alert Synthesizer
 * Uses Web Audio API for zero-dependency automotive ADAS alert sounds
 */

class AudioService {
  constructor() {
    this.audioCtx = null;
    this.isMuted = true; // Default muted to respect browser auto-play policies
    this.lastBeepTime = 0;
  }

  init() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.init();
      this.playChime(660, 0.08, 'sine');
    }
    return this.isMuted;
  }

  playForwardCollisionWarning() {
    if (this.isMuted) return;
    const now = performance.now();
    if (now - this.lastBeepTime < 300) return; // rate limit
    this.lastBeepTime = now;
    this.init();

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, this.audioCtx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.15);
    } catch {
      // AudioContext unavailable
    }
  }

  playCriticalBrakeChime() {
    if (this.isMuted) return;
    const now = performance.now();
    if (now - this.lastBeepTime < 450) return;
    this.lastBeepTime = now;
    this.init();

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1100, this.audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
    } catch {
      // AudioContext unavailable
    }
  }

  playChime(freq = 660, duration = 0.1, type = 'sine') {
    if (this.isMuted) return;
    this.init();
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {
      // AudioContext unavailable
    }
  }
}

export const audioService = new AudioService();
