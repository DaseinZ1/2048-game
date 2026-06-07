class UIManager {
    constructor() {
        this.el = {};
        ['score', 'best-score', 'final-score', 'game-board', 'game-over', 'win-message', 'pause-overlay',
         'settings-panel', 'leaderboard-panel', 'achievements-panel', 'tutorial-overlay', 'nickname-dialog',
         'share-panel', 'loading-screen', 'game-container', 'timer-display', 'move-count', 'difficulty-display',
         'achievement-toast', 'user-area', 'user-btn', 'user-panel', 'user-info', 'auth-forms', 'login-form',
         'register-form', 'user-avatar', 'user-avatar-large', 'user-nickname', 'user-stats', 'connection-status'].forEach(id => {
            const e = document.getElementById(id);
            if (e) this.el[id] = e;
        });
    }
    _show(id) { this.el[id]?.classList.remove('hidden'); }
    _hide(id) { this.el[id]?.classList.add('hidden'); }
    updateScore(s) { if (this.el.score) this.el.score.textContent = s; }
    updateBestScore(s) { if (this.el['best-score']) this.el['best-score'].textContent = s; }
    updateTimer(sec) { if (this.el['timer-display']) { const m = Math.floor(sec / 60), s = sec % 60; this.el['timer-display'].textContent = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`; } }
    updateMoveCount(n) { if (this.el['move-count']) this.el['move-count'].textContent = n + ' 步'; }
    updateDifficulty(d) { if (this.el['difficulty-display']) this.el['difficulty-display'].textContent = { easy: '简单', normal: '普通', hard: '困难' }[d] || d; }
    showGameOver(score) { if (this.el['final-score']) this.el['final-score'].textContent = score; this._show('game-over'); }
    hideGameOver() { this._hide('game-over'); }
    showWin() { this._show('win-message'); }
    hideWin() { this._hide('win-message'); }
    showPause() { this._show('pause-overlay'); }
    hidePause() { this._hide('pause-overlay'); }
    showSettings() { this._show('settings-panel'); }
    hideSettings() { this._hide('settings-panel'); }
    showTutorial() { this._show('tutorial-overlay'); }
    hideTutorial() { this._hide('tutorial-overlay'); }
    showNickname(cb) {
        const d = this.el['nickname-dialog']; if (!d) return; d.classList.remove('hidden');
        const inp = d.querySelector('#nickname-input'), ok = d.querySelector('#confirm-nickname'), skip = d.querySelector('#skip-nickname');
        if (inp) inp.value = '';
        const done = (name) => { d.classList.add('hidden'); ok?.removeEventListener('click', onOk); skip?.removeEventListener('click', onSkip); cb(name); };
        const onOk = () => done(inp?.value.trim() || '匿名玩家');
        const onSkip = () => done(null);
        ok?.addEventListener('click', onOk); skip?.addEventListener('click', onSkip);
        inp?.addEventListener('keypress', (e) => { if (e.key === 'Enter') onOk(); });
        inp?.focus();
    }
    showLeaderboard(entries, onSort, onClear, isServerLeaderboard = false) {
        const p = this.el['leaderboard-panel']; if (!p) return;
        const list = p.querySelector('#leaderboard-list');
        const connectionNote = p.querySelector('#connection-note');
        if (connectionNote) {
            if (isServerLeaderboard) {
                connectionNote.classList.remove('hidden');
            } else {
                connectionNote.classList.add('hidden');
            }
        }
        const formatEntry = (e, i) => {
            const rank = e.rank || (i + 1);
            const name = e.nickname || e.username || '未知';
            const score = e.score || e.bestScore || 0;
            const time = e.timeElapsed || e.fastestTime || 0;
            const gamesPlayed = e.gamesPlayed || '';
            const winRate = e.winRate || '';
            return `<div class="leaderboard-entry">
                <span class="rank">${rank}</span>
                <span class="name">${name}</span>
                <span class="score">${score}</span>
                <span class="time">${time}s</span>
                ${isServerLeaderboard && gamesPlayed ? `<span class="games">${gamesPlayed}局</span>` : ''}
                ${isServerLeaderboard && winRate ? `<span class="rate">${winRate}%</span>` : ''}
            </div>`;
        };
        if (list) {
            list.innerHTML = entries.length ? entries.map((e, i) => formatEntry(e, i)).join('') : '<p class="empty">暂无记录</p>';
        }
        p.classList.remove('hidden');
        p.querySelector('#close-leaderboard')?.addEventListener('click', () => this.hideLeaderboard(), { once: true });
        p.querySelector('#sort-leaderboard')?.addEventListener('click', onSort, { once: true });
        p.querySelector('#clear-leaderboard')?.addEventListener('click', onClear, { once: true });
        const refreshBtn = p.querySelector('#refresh-leaderboard');
        if (refreshBtn) {
            refreshBtn.style.display = isServerLeaderboard ? 'inline-block' : 'none';
        }
    }
    hideLeaderboard() { this._hide('leaderboard-panel'); }
    showAchievements(list) {
        const p = this.el['achievements-panel']; if (!p) return;
        const ul = p.querySelector('#achievements-list');
        if (ul) ul.innerHTML = list.map(a => `<div class="achievement-item ${a.unlocked ? 'unlocked' : 'locked'}"><div class="achievement-icon">${a.unlocked ? '🏆' : '🔒'}</div><div class="achievement-info"><h4>${a.name}</h4><p>${a.description}</p>${a.unlocked ? `<span class="unlock-date">${new Date(a.date).toLocaleDateString()}</span>` : ''}</div></div>`).join('');
        p.classList.remove('hidden');
        p.querySelector('#close-achievements')?.addEventListener('click', () => this.hideAchievements(), { once: true });
    }
    hideAchievements() { this._hide('achievements-panel'); }
    showShare(score, diff, time, onCopy, onDL) {
        const p = this.el['share-panel']; if (!p) return;
        const s = p.querySelector('#share-score'), d = p.querySelector('#share-difficulty'), t = p.querySelector('#share-time');
        if (s) s.textContent = score; if (d) d.textContent = { easy: '简单', normal: '普通', hard: '困难' }[diff] || diff; if (t) t.textContent = time;
        p.classList.remove('hidden');
        p.querySelector('#copy-text')?.addEventListener('click', onCopy, { once: true });
        p.querySelector('#download-image')?.addEventListener('click', onDL, { once: true });
        p.querySelector('#close-share')?.addEventListener('click', () => this.hideShare(), { once: true });
    }
    hideShare() { this._hide('share-panel'); }
    showToast(a) {
        const t = this.el['achievement-toast']; if (!t) return;
        const title = t.querySelector('.toast-title'), msg = t.querySelector('.toast-message');
        if (title) title.textContent = '成就解锁！'; if (msg) msg.textContent = a.name;
        t.classList.remove('hidden'); t.classList.add('show');
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.classList.add('hidden'), 300); }, 3000);
    }
    showLoading() { this._show('loading-screen'); }
    hideLoading() { this._hide('loading-screen'); }
    setLoadProgress(p) { const b = this.el['loading-screen']?.querySelector('.loading-bar-fill'); if (b) b.style.width = p + '%'; }
    
    showUserPanel() { this._show('user-panel'); }
    hideUserPanel() { this._hide('user-panel'); }
    toggleUserPanel() { 
        if (this.el['user-panel']?.classList.contains('hidden')) {
            this.showUserPanel();
        } else {
            this.hideUserPanel();
        }
    }
    
    showLoginForm() { this._show('login-form'); this._hide('register-form'); this._hide('user-info'); }
    showRegisterForm() { this._show('register-form'); this._hide('login-form'); this._hide('user-info'); }
    showUserInfo() { this._show('user-info'); this._hide('login-form'); this._hide('register-form'); }
    
    updateUserAvatar(avatar) {
        if (this.el['user-avatar']) this.el['user-avatar'].textContent = avatar || '👤';
        if (this.el['user-avatar-large']) this.el['user-avatar-large'].textContent = avatar || '👤';
    }
    
    updateUserInfo(nickname, totalGames = 0, highestScore = 0) {
        if (this.el['user-nickname']) this.el['user-nickname'].textContent = nickname || '用户';
        if (this.el['user-stats']) this.el['user-stats'].textContent = `游戏: ${totalGames} | 最高分: ${highestScore}`;
    }
    
    updateConnectionStatus(online) {
        if (this.el['connection-status']) {
            this.el['connection-status'].textContent = online ? '🟢 已连接' : '⚪ 本地模式';
            this.el['connection-status'].className = `connection-status ${online ? 'status-online' : 'status-offline'}`;
        }
    }
}
window.UIManager = UIManager;