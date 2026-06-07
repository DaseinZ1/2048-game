class GameRenderer {
    constructor(boardEl) { this.board = boardEl; this.tiles = new Map(); }
    setSize(size) {
        this.board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        this.board.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    }
    _dims(size) {
        const mobile = window.innerWidth <= 520;
        const bw = mobile ? 325 : 475;
        const pad = mobile ? 10 : 15;
        const gap = mobile ? 10 : 15;
        const ts = (bw - pad * 2 - gap * (size - 1)) / size;
        return { bw, pad, gap, ts, mobile };
    }
    createCells(size) {
        this.board.innerHTML = '';
        this.tiles.clear();
        for (let i = 0; i < size * size; i++) { const c = document.createElement('div'); c.className = 'cell'; this.board.appendChild(c); }
        this.setSize(size);
    }
    render(grid, size) {
        const { bw, pad, gap, ts, mobile } = this._dims(size);
        this.board.style.width = bw + 'px';
        this.board.style.height = bw + 'px';
        const existing = new Set();
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const v = grid[r][c];
                const k = r + ',' + c;
                existing.add(k);
                if (v !== null) {
                    let t = this.tiles.get(k);
                    if (!t) { t = this._makeTile(r, c, v, pad, gap, ts, true); this.tiles.set(k, t); }
                    else { this._updTile(t, v); this._pos(t, r, c, pad, gap, ts); }
                } else { const t = this.tiles.get(k); if (t) { t.remove(); this.tiles.delete(k); } }
            }
        }
        for (const [k, t] of this.tiles) { if (!existing.has(k)) { t.remove(); this.tiles.delete(k); } }
    }
    _makeTile(r, c, v, pad, gap, ts, isNew) {
        const t = document.createElement('div');
        t.className = 'tile' + (isNew ? ' new' : '');
        this._sty(t, v);
        this._pos(t, r, c, pad, gap, ts);
        t.textContent = v;
        this.board.appendChild(t);
        if (isNew) setTimeout(() => t.classList.remove('new'), 300);
        return t;
    }
    _updTile(t, v) {
        if (t.textContent !== String(v)) { t.textContent = v; t.classList.add('merged'); setTimeout(() => t.classList.remove('merged'), 200); }
        this._sty(t, v);
    }
    _sty(t, v) { t.className = 'tile tile-' + (v <= 2048 ? v : 'super'); }
    _pos(t, r, c, pad, gap, ts) {
        const left = pad + c * (ts + gap);
        const top = pad + r * (ts + gap);
        t.style.width = ts + 'px'; t.style.height = ts + 'px';
        t.style.left = left + 'px'; t.style.top = top + 'px';
        const v = parseInt(t.textContent) || 2;
        t.style.fontSize = this._fs(v) + 'px';
    }
    _fs(v) {
        const mobile = window.innerWidth <= 520;
        if (v >= 1024) return mobile ? 24 : 35;
        if (v >= 128) return mobile ? 30 : 45;
        return mobile ? 36 : 55;
    }
    clear() { this.board.querySelectorAll('.tile').forEach(t => t.remove()); this.tiles.clear(); }
}
window.GameRenderer = GameRenderer;