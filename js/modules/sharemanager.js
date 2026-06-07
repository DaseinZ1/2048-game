class ShareManager {
    _init(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; this.ctx = c.getContext('2d'); return c; }
    generateCard(score, difficulty, time, theme) {
        const canvas = this._init(600, 400);
        const ctx = this.ctx;
        const grads = { classic: ['#faf8ef', '#bbada0'], dark: ['#1a1a2e', '#16213e'], forest: ['#f0f7f0', '#74c69d'] };
        const g = ctx.createLinearGradient(0, 0, 600, 400);
        const colors = grads[theme] || grads.classic;
        g.addColorStop(0, colors[0]); g.addColorStop(1, colors[1]);
        ctx.fillStyle = g; ctx.fillRect(0, 0, 600, 400);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 4; ctx.strokeRect(20, 20, 560, 360);
        ctx.fillStyle = theme === 'dark' ? '#00d4aa' : '#776e65'; ctx.font = 'bold 48px Arial'; ctx.textAlign = 'center';
        ctx.fillText('2048', 300, 80);
        ctx.fillStyle = theme === 'dark' ? '#fff' : '#776e65'; ctx.font = 'bold 72px Arial';
        ctx.fillText(score.toString(), 300, 170); ctx.font = '24px Arial'; ctx.fillText('分', 300, 200);
        ctx.font = '20px Arial';
        ctx.fillText('难度: ' + ({ easy: '简单', normal: '普通', hard: '困难' }[difficulty] || difficulty), 300, 250);
        const m = Math.floor(time / 60), s = time % 60;
        ctx.fillText(`用时: ${m}分${s}秒`, 300, 280);
        ctx.font = '16px Arial'; ctx.fillStyle = theme === 'dark' ? '#888' : '#999';
        ctx.fillText(new Date().toLocaleDateString('zh-CN'), 300, 330);
        ctx.fillText('2048 游戏 - 挑战你的极限！', 300, 370);
        return canvas;
    }
    getText(score, difficulty, time) {
        const m = Math.floor(time / 60), s = time % 60;
        return `🎮 我在 2048 游戏中获得了 ${score} 分！\n难度: ${({ easy: '简单', normal: '普通', hard: '困难' }[difficulty] || difficulty)}\n用时: ${m}分${s}秒\n快来挑战我吧！`;
    }
    async copy(text) { try { await navigator.clipboard.writeText(text); return true; } catch { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); const r = document.execCommand('copy'); document.body.removeChild(t); return r; } }
    download(canvas, fn) { const a = document.createElement('a'); a.download = fn || '2048-score.png'; a.href = canvas.toDataURL('image/png'); a.click(); }
}
window.ShareManager = ShareManager;