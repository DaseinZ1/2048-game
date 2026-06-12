class GameApp {
    constructor() {
        console.log('GameApp constructor starting');
        console.log('StorageManager available:', window.StorageManager);
        this.storage = new StorageManager();
        console.log('StorageManager created:', this.storage);
        console.log('StorageManager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.storage)));
        this.theme = new ThemeManager(this.storage);
        this.audio = new AudioManager(this.storage);
        this.ui = new UIManager();
        this.input = new InputHandler();
        this.achievements = new AchievementManager(this.storage);
        this.share = new ShareManager();
        this.game = null;
        this.renderer = null;
        this.difficulty = 'normal';
        this.paused = false;
        this.timer = null;
        this.processing = false;
        this.serverOnline = false;
        this.currentGameRecordId = null;
        this.init();
    }
    init() {
        this.ui.showLoading();
        this._checkServerConnection();
        
        let p = 0;
        let attempts = 0;
        const maxAttempts = 20; // 最多尝试20次，确保能完成加载
        
        const iv = setInterval(() => {
            attempts++;
            p += Math.random() * 30;
            
            // 确保进度至少每次增加5%，防止卡住
            if (p < attempts * 5) {
                p = attempts * 5;
            }
            
            if (p >= 100 || attempts >= maxAttempts) { 
                p = 100; 
                clearInterval(iv); 
                this._start(); 
            }
            this.ui.setLoadProgress(p);
        }, 200);
        
        try {
            this._bindEvents();
        } catch (e) {
            console.error('绑定事件失败:', e);
        }
    }
    async _checkServerConnection() {
        try {
            const response = await fetch('http://localhost:3000/api/health');
            if (response.ok) {
                this.serverOnline = true;
                console.log('后端服务器已连接');
                this._updateConnectionStatus(true);
            }
        } catch (e) {
            this.serverOnline = false;
            console.log('后端服务器未连接，使用本地模式');
            this._updateConnectionStatus(false);
        }
    }
    _updateConnectionStatus(online) {
        const statusEl = document.getElementById('connection-status');
        if (statusEl) {
            statusEl.textContent = online ? '🟢 已连接服务器' : '⚪ 本地模式';
            statusEl.className = online ? 'status-online' : 'status-offline';
        }
    }
    _start() {
        setTimeout(() => {
            this.ui.hideLoading();
            this.ui.el['game-container']?.classList.remove('hidden');
            this.newGame();
            if (this.storage.isFirstVisit()) { this.ui.showTutorial(); this.storage.setFirstVisit(); }
            if (window.api.isLoggedIn()) this._syncAchievements();
        }, 500);
    }
    async _syncAchievements() {
        if (!this.serverOnline) return;
        try {
            const result = await window.api.getAchievements();
            const unlocked = result.achievements.filter(a => a.unlocked);
            unlocked.forEach(a => this.achievements.markUnlocked(a.achievementId));
        } catch (e) {
            console.error('同步成就失败:', e);
        }
    }
    newGame() {
        const size = { easy: 3, normal: 4, hard: 5 }[this.difficulty];
        const target = { easy: 512, normal: 2048, hard: 8192 }[this.difficulty];
        this.game = new GameCore(size, target);
        this.renderer = new GameRenderer(document.getElementById('game-board'));
        this.renderer.createCells(size);
        this.game.addRandomTile();
        this.game.addRandomTile();
        this.renderer.render(this.game.getGrid(), size);
        this.paused = false; this.processing = false;
        this.currentGameRecordId = null;
        this._updUI();
        this._startTimer();
        this.input.enable();
        this.ui.hideGameOver(); this.ui.hideWin(); this.ui.hidePause();
    }
    _bindEvents() {
        this.input.on('move', d => this._move(d));
        this.input.on('pause', () => this.togglePause());
        this.input.setup();
        const on = (id, fn) => document.getElementById(id)?.addEventListener('click', fn);
        on('new-game', () => { this.audio.playClick(); this.newGame(); });
        on('restart', () => { this.audio.playClick(); this.newGame(); });
        on('restart-win', () => { this.audio.playClick(); this.newGame(); });
        on('continue', () => { this.audio.playClick(); this.ui.hideWin(); });
        on('continue-game', () => { this.audio.playClick(); this.togglePause(); });
        on('settings-btn', () => { this.audio.playClick(); this.ui.showSettings(); });
        on('close-settings', () => { this.audio.playClick(); this.ui.hideSettings(); });
        on('leaderboard-btn', () => { this.audio.playClick(); this._showLeaderboard(); });
        on('achievements-btn', () => { this.audio.playClick(); this._showAchievements(); });
        on('share-btn', () => { this.audio.playClick(); this._showShare(); });
        on('resume-btn', () => { this.audio.playClick(); this._goToResume(); });
        on('pause-resume-btn', () => { this.audio.playClick(); this._goToResume(); });
        on('user-btn', () => { this.audio.playClick(); this.ui.toggleUserPanel(); });
        on('login-submit', () => { this.audio.playClick(); this._login(); });
        on('register-submit', () => { this.audio.playClick(); this._register(); });
        on('show-register', () => { this.audio.playClick(); this.ui.showRegisterForm(); });
        on('show-login', () => { this.audio.playClick(); this.ui.showLoginForm(); });
        on('login-close', () => { this.audio.playClick(); this.ui.hideUserPanel(); });
        on('logout-btn', () => { this.audio.playClick(); this._logout(); });
        on('switch-account-btn', () => { this.audio.playClick(); this._switchAccount(); });
        on('close-tutorial', () => {
            if (document.getElementById('dont-show-tutorial')?.checked) {
                const s = this.storage.getSettings(); s.showTutorial = false; this.storage.setSettings(s);
            }
            this.ui.hideTutorial();
        });
        document.getElementById('difficulty-select')?.addEventListener('change', e => { this.difficulty = e.target.value; this.newGame(); });
        document.getElementById('theme-select')?.addEventListener('change', e => this.theme.applyTheme(e.target.value));
        document.querySelectorAll('.skin-option')?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.audio.playClick();
                const skin = e.currentTarget.getAttribute('data-skin');
                this._applySkin(skin);
                document.querySelectorAll('.skin-option').forEach(b => b.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
            });
        });
        document.getElementById('volume-slider')?.addEventListener('input', e => this.audio.setVolume(parseFloat(e.target.value)));
        on('mute-btn', () => { const muted = this.audio.toggleMute(); const btn = document.getElementById('mute-btn'); if (btn) btn.textContent = muted ? '🔇' : '🔊'; });
        on('reset-tutorial-btn', () => { const s = this.storage.getSettings(); s.showTutorial = true; this.storage.setSettings(s); alert('操作引导已重置'); });
        window.addEventListener('resize', () => { if (this.renderer && this.game) this.renderer.render(this.game.getGrid(), this.game.getSize()); });
        
        document.querySelectorAll('.avatar-option')?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.audio.playClick();
                const avatar = e.target.getAttribute('data-avatar');
                const input = document.getElementById('register-avatar');
                if (input) input.value = avatar;
                document.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });
    }
    async _move(dir) {
        if (this.paused || this.processing || !this.game) return;
        this.processing = true;
        this.audio.init();
        const r = this.game.move(dir);
        if (r.moved) {
            this.audio.playMove();
            if (r.scoreGained > 0) this.audio.playMerge(r.merged?.[0] || 2);
            this.renderer.render(this.game.getGrid(), this.game.getSize());
            this._updUI();
            const unlocked = this.achievements.check(this.game);
            unlocked.forEach(a => { this.audio.playAchievement(); this.ui.showToast(a); });
            if (this.game.isWin()) { this.audio.playWin(); this._end(true); }
            else if (this.game.isGameOver()) { this.audio.playLose(); this._end(false); }
        }
        this.processing = false;
    }
    async _end(win) {
        this.input.disable(); this._stopTimer();
        const score = this.game.getScore();
        const time = this.game.getTimeElapsed();
        const maxTile = this.game.getMaxTile();
        const moveCount = this.game.getMoveCount();
        const gridSize = this.game.getSize();
        const target = this.game.getTarget();
        const isNew = this.storage.setBestScore(this.difficulty, score);
        if (isNew) setTimeout(() => this.audio.playNewRecord(), 500);
        if (win) this.ui.showWin(); else this.ui.showGameOver(score);
        if (this.serverOnline) {
            try {
                const result = await window.api.submitGameRecord({
                    difficulty: this.difficulty,
                    score,
                    targetScore: target,
                    maxTile,
                    moveCount,
                    timeElapsed: time,
                    won: win,
                    gridSize
                });
                this.currentGameRecordId = result.record?.id;
                if (result.isNewHighScore) setTimeout(() => this.audio.playNewRecord(), 500);
                const achResult = await window.api.checkAchievements(this.currentGameRecordId, {
                    difficulty: this.difficulty,
                    score,
                    won: win,
                    timeElapsed: time,
                    maxTile,
                    gridSize
                });
                if (achResult.unlocked?.length > 0) {
                    achResult.unlocked.forEach(a => {
                        this.audio.playAchievement();
                        this.ui.showToast(a.name + ' - ' + a.description);
                        this.achievements.markUnlocked(a.achievementId);
                    });
                }
            } catch (e) {
                console.error('提交游戏记录失败:', e);
                this._saveLocalRecord(win, score, time, maxTile, moveCount, gridSize, target);
            }
        } else {
            this._saveLocalRecord(win, score, time, maxTile, moveCount, gridSize, target);
        }
        setTimeout(() => {
            this.ui.showNickname(name => {
                if (name) this.storage.addToLeaderboard(this.difficulty, { nickname: name, score, timeElapsed: time, difficulty: this.difficulty });
            });
        }, win ? 1000 : 500);
    }
    _saveLocalRecord(win, score, time, maxTile, moveCount, gridSize, target) {
        this.storage.addToLeaderboard(this.difficulty, { nickname: '本地玩家', score, timeElapsed: time, difficulty: this.difficulty, maxTile, moveCount });
    }
    togglePause() {
        if (!this.game || this.game.isGameOver() || this.game.isWin()) return;
        this.paused = !this.paused;
        if (this.paused) { this.input.disable(); this._stopTimer(); this.ui.showPause(); }
        else { this.input.enable(); this._startTimer(); this.ui.hidePause(); }
    }
    _startTimer() { this._stopTimer(); this.timer = setInterval(() => { if (this.game && !this.paused) this.ui.updateTimer(this.game.getTimeElapsed()); }, 1000); }
    _stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
    _updUI() { if (!this.game) return; this.ui.updateScore(this.game.getScore()); this.ui.updateBestScore(this.storage.getBestScore(this.difficulty)); this.ui.updateMoveCount(this.game.getMoveCount()); this.ui.updateDifficulty(this.difficulty); this._updateUserStatus(); }
    _updateUserStatus() {
        if (window.api.isLoggedIn()) {
            this.ui.showUserInfo();
            const userData = this.storage.getUserData();
            if (userData) {
                this.ui.updateUserAvatar(userData.avatar || '👤');
                this.ui.updateUserInfo(
                    userData.nickname || userData.username || '用户',
                    userData.totalGames || 0,
                    userData.highestScore || 0
                );
            }
        } else {
            this.ui.showLoginForm();
            this.ui.updateUserAvatar('👤');
        }
    }
    
    async _login() {
        const username = document.getElementById('login-username')?.value.trim();
        const password = document.getElementById('login-password')?.value;
        
        if (!username || !password) {
            alert('请填写用户名和密码');
            return;
        }
        
        try {
            const result = await window.api.login(username, password);
            if (result.token) {
                this.storage.saveUserData({
                    username: result.user.username,
                    nickname: result.user.nickname,
                    avatar: result.user.avatar || '👤',
                    totalGames: result.user.totalGames || 0,
                    highestScore: result.user.highestScore || 0
                });
                this._updateUserStatus();
                this.ui.hideUserPanel();
                alert('登录成功！');
                await this._syncAchievements();
            }
        } catch (error) {
            alert('登录失败: ' + (error.message || '未知错误'));
        }
    }
    
    async _register() {
        const username = document.getElementById('register-username')?.value.trim();
        const password = document.getElementById('register-password')?.value;
        const nickname = document.getElementById('register-nickname')?.value.trim();
        const avatar = document.getElementById('register-avatar')?.value.trim() || '👤';
        
        if (!username || !password) {
            alert('请填写用户名和密码');
            return;
        }
        
        try {
            const result = await window.api.register(username, password, nickname, '', avatar);
            console.log('注册结果:', result);
            if (result.token) {
                console.log('保存用户数据前:', this.storage);
                const userData = {
                    username: result.user.username,
                    nickname: result.user.nickname || username,
                    avatar: avatar,
                    totalGames: 0,
                    highestScore: 0
                };
                console.log('用户数据:', userData);
                this.storage.saveUserData(userData);
                this._updateUserStatus();
                this.ui.hideUserPanel();
                alert('注册成功！');
            }
        } catch (error) {
            console.error('注册错误:', error);
            alert('注册失败: ' + (error.message || String(error) || '未知错误'));
        }
    }
    
    _logout() {
        if (confirm('确定要退出登录吗？')) {
            window.api.logout();
            this.storage.clearUserData();
            this._updateUserStatus();
            this.ui.hideUserPanel();
        }
    }
    
    _switchAccount() {
        this.ui.showLoginForm();
        const loginForm = document.getElementById('login-form');
        const inputs = loginForm?.querySelectorAll('input');
        inputs?.forEach(input => input.value = '');
    }
    async _showLeaderboard() {
        if (this.serverOnline) {
            try {
                const result = await window.api.getLeaderboard(this.difficulty, 'score', 1, 20);
                const entries = result.leaderboard.map((e, i) => ({
                    rank: i + 1,
                    nickname: e.username,
                    score: e.bestScore,
                    timeElapsed: e.fastestTime,
                    gamesPlayed: e.gamesPlayed,
                    winRate: e.winRate
                }));
                this.ui.showLeaderboard(entries, async () => {
                    const refreshed = await window.api.getLeaderboard(this.difficulty, 'score', 1, 20);
                    return refreshed.leaderboard.map((e, i) => ({
                        rank: i + 1,
                        nickname: e.username,
                        score: e.bestScore,
                        timeElapsed: e.fastestTime,
                        gamesPlayed: e.gamesPlayed,
                        winRate: e.winRate
                    }));
                }, null, true);
                return;
            } catch (e) {
                console.error('获取服务器排行榜失败:', e);
            }
        }
        const entries = this.storage.getLeaderboard(this.difficulty);
        this.ui.showLeaderboard(entries, () => this._showLeaderboard(), () => { if (confirm('确定清空当前难度排行榜？')) { this.storage.clearLeaderboard(this.difficulty); this._showLeaderboard(); } });
    }
    _showAchievements() { this.ui.showAchievements(this.achievements.getAll()); }
    _goToResume() { window.location.href = 'resume.html'; }
    _applySkin(skin) {
        const body = document.body;
        if (skin === 'classic') {
            body.style.backgroundImage = '';
            body.style.backgroundColor = '';
        } else if (skin === 'dark') {
            body.style.backgroundImage = '';
            body.style.backgroundColor = '#1a1a2e';
        } else if (skin === 'forest') {
            body.style.backgroundImage = '';
            body.style.backgroundColor = '#2d5016';
        } else if (skin === 'jialu1') {
            body.style.backgroundImage = 'url("../4.jpg")';
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
            body.style.backgroundColor = '';
        } else if (skin === 'jialu2') {
            body.style.backgroundImage = 'url("../5.jpg")';
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
            body.style.backgroundColor = '';
        }
        const settings = this.storage.getSettings();
        settings.skin = skin;
        this.storage.setSettings(settings);
    }
    _showShare() {
        const score = this.game ? this.game.getScore() : 0;
        const time = this.game ? this.game.getTimeElapsed() : 0;
        this.ui.showShare(score, this.difficulty, time, async () => { const text = this.share.getText(score, this.difficulty, time); const ok = await this.share.copy(text); alert(ok ? '已复制到剪贴板！' : '复制失败'); }, () => { const canvas = this.share.generateCard(score, this.difficulty, time, this.theme.getCurrentTheme()); this.share.download(canvas); });
    }
}
document.addEventListener('DOMContentLoaded', () => { window.gameApp = new GameApp(); });