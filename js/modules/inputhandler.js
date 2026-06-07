class InputHandler {
    constructor() { this.enabled = true; this.sx = 0; this.sy = 0; this.cb = {}; this._kd = this._kd.bind(this); this._ts = this._ts.bind(this); this._te = this._te.bind(this); }
    on(e, fn) { this.cb[e] = fn; }
    setup() { document.addEventListener('keydown', this._kd); document.addEventListener('touchstart', this._ts, { passive: true }); document.addEventListener('touchend', this._te, { passive: true }); }
    destroy() { document.removeEventListener('keydown', this._kd); document.removeEventListener('touchstart', this._ts); document.removeEventListener('touchend', this._te); }
    enable() { this.enabled = true; }
    disable() { this.enabled = false; }
    _kd(e) {
        if (!this.enabled) return;
        const m = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
        if (m[e.key]) { e.preventDefault(); this._em('move', m[e.key]); }
        if (e.key === 'Escape') this._em('pause');
    }
    _ts(e) { if (!this.enabled) return; const t = e.touches[0]; this.sx = t.clientX; this.sy = t.clientY; }
    _te(e) {
        if (!this.enabled) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - this.sx, dy = t.clientY - this.sy;
        if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
        this._em('move', Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    }
    _em(e, d) { if (this.cb[e]) this.cb[e](d); }
}
window.InputHandler = InputHandler;