class AudioManager {
    constructor(storageManager) {
        this.storage = storageManager;
        this.ctx = null;
        this.settings = this.storage.getSettings();
        this.volume = this.settings.volume || 0.5;
        this.muted = this.settings.muted || false;
        this.initialized = false;
    }
    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) { console.warn('Web Audio API not supported'); }
    }
    _playTone(freq, duration, type, volMult) {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        const v = this.volume * volMult;
        gain.gain.setValueAtTime(v, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }
    playMove() { this._playTone(200, 0.08, 'sine', 0.3); }
    playMerge(value) {
        const f = 300 + Math.log2(value) * 100;
        this._playTone(f, 0.15, 'triangle', 0.5);
        setTimeout(() => this._playTone(f * 1.5, 0.1, 'triangle', 0.3), 50);
    }
    playWin() {
        [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this._playTone(f, 0.2, 'sine', 0.6), i * 100));
    }
    playLose() {
        [400, 350, 300, 250].forEach((f, i) => setTimeout(() => this._playTone(f, 0.3, 'sawtooth', 0.3), i * 150));
    }
    playNewRecord() {
        [523, 659, 784, 659, 784, 1047].forEach((f, i) => setTimeout(() => this._playTone(f, 0.15, 'sine', 0.5), i * 80));
    }
    playAchievement() {
        [784, 880, 988, 1047].forEach((f, i) => setTimeout(() => this._playTone(f, 0.15, 'sine', 0.6), i * 80));
    }
    playClick() { this._playTone(800, 0.05, 'sine', 0.2); }
    setVolume(v) { this.volume = Math.max(0, Math.min(1, v)); this._saveSettings(); }
    mute() { this.muted = true; this._saveSettings(); }
    unmute() { this.muted = false; if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); this._saveSettings(); }
    toggleMute() { if (this.muted) this.unmute(); else this.mute(); return this.muted; }
    isMuted() { return this.muted; }
    getVolume() { return this.volume; }
    _saveSettings() {
        const s = this.storage.getSettings();
        s.volume = this.volume; s.muted = this.muted;
        this.storage.setSettings(s);
    }
}
window.AudioManager = AudioManager;