class GameCore {
    constructor(size, targetScore) {
        this.size = size || 4;
        this.targetScore = targetScore || 2048;
        this.init();
    }
    init() {
        this.grid = [];
        for (let i = 0; i < this.size; i++) { this.grid[i] = []; for (let j = 0; j < this.size; j++) this.grid[i][j] = null; }
        this.score = 0; this.won = false; this.over = false;
        this.startTime = Date.now(); this.moveCount = 0;
    }
    setSize(size) { this.size = size; this.targetScore = size === 3 ? 512 : size === 4 ? 2048 : 8192; this.init(); }
    addRandomTile() {
        const empty = this.getEmptyCells();
        if (empty.length === 0) return false;
        const { row, col } = empty[Math.floor(Math.random() * empty.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        this.grid[row][col] = value;
        return { row, col, value };
    }
    getEmptyCells() {
        const empty = [];
        for (let i = 0; i < this.size; i++) for (let j = 0; j < this.size; j++) if (this.grid[i][j] === null) empty.push({ row: i, col: j });
        return empty;
    }
    move(direction) {
        if (this.over) return { moved: false };
        let moved = false, merged = [], scoreGained = 0;
        const process = (lines) => {
            lines.forEach(({ cells, setCell }) => {
                const vals = cells.map(c => this.grid[c.r][c.c]).filter(v => v !== null);
                const result = this._merge(vals);
                merged.push(...result.merged); scoreGained += result.score;
                cells.forEach((c, i) => {
                    const newVal = result.line[i] !== undefined ? result.line[i] : null;
                    if (this.grid[c.r][c.c] !== newVal) moved = true;
                    this.grid[c.r][c.c] = newVal;
                });
            });
        };
        if (direction === 'up') {
            const lines = [];
            for (let c = 0; c < this.size; c++) { const cells = []; for (let r = 0; r < this.size; r++) cells.push({ r, c }); lines.push({ cells }); }
            process(lines);
        } else if (direction === 'down') {
            const lines = [];
            for (let c = 0; c < this.size; c++) { const cells = []; for (let r = this.size - 1; r >= 0; r--) cells.push({ r, c }); lines.push({ cells }); }
            process(lines);
        } else if (direction === 'left') {
            const lines = [];
            for (let r = 0; r < this.size; r++) { const cells = []; for (let c = 0; c < this.size; c++) cells.push({ r, c }); lines.push({ cells }); }
            process(lines);
        } else if (direction === 'right') {
            const lines = [];
            for (let r = 0; r < this.size; r++) { const cells = []; for (let c = this.size - 1; c >= 0; c--) cells.push({ r, c }); lines.push({ cells }); }
            process(lines);
        }
        if (moved) {
            this.moveCount++; this.score += scoreGained;
            const newTile = this.addRandomTile();
            this._checkWin(); this._checkGameOver();
            return { moved: true, merged, scoreGained, newTile };
        }
        return { moved: false };
    }
    _merge(line) {
        const merged = []; let score = 0;
        for (let i = 0; i < line.length - 1; i++) {
            if (line[i] === line[i + 1]) { line[i] *= 2; score += line[i]; merged.push(line[i]); line.splice(i + 1, 1); }
        }
        while (line.length < this.size) line.push(undefined);
        return { line, merged, score };
    }
    _checkWin() { if (this.won) return; for (let i = 0; i < this.size; i++) for (let j = 0; j < this.size; j++) if (this.grid[i][j] >= this.targetScore) { this.won = true; return; } }
    _checkGameOver() {
        if (this.getEmptyCells().length > 0) return;
        for (let i = 0; i < this.size; i++) for (let j = 0; j < this.size; j++) { if (j < this.size - 1 && this.grid[i][j] === this.grid[i][j + 1]) return; if (i < this.size - 1 && this.grid[i][j] === this.grid[i + 1][j]) return; }
        this.over = true;
    }
    isWin() { return this.won; }
    isGameOver() { return this.over; }
    getScore() { return this.score; }
    getGrid() { return this.grid; }
    getSize() { return this.size; }
    getTimeElapsed() { return Math.floor((Date.now() - this.startTime) / 1000); }
    getMoveCount() { return this.moveCount; }
    getMaxTile() {
        let max = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] > max) max = this.grid[i][j];
            }
        }
        return max;
    }
    getTarget() { return this.targetScore; }
}
window.GameCore = GameCore;