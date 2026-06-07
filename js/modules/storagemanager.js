class StorageManager {
    constructor() {
        this.prefix = 'game2048_';
        this.keys = {
            bestScore: 'bestScore',
            leaderboard: 'leaderboard',
            achievements: 'achievements',
            theme: 'theme',
            settings: 'settings',
            firstVisit: 'firstVisit',
            userData: 'userData'
        };
    }
    _key(name) { return this.prefix + name; }
    getItem(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(this._key(key));
            return data ? JSON.parse(data) : defaultValue;
        } catch { return defaultValue; }
    }
    setItem(key, value) {
        try { localStorage.setItem(this._key(key), JSON.stringify(value)); }
        catch (e) { console.warn('Storage save failed:', e); }
    }
    getBestScore(difficulty = 'normal') {
        const scores = this.getItem(this.keys.bestScore, {});
        return scores[difficulty] || 0;
    }
    setBestScore(difficulty, score) {
        const scores = this.getItem(this.keys.bestScore, {});
        if (score > (scores[difficulty] || 0)) {
            scores[difficulty] = score;
            this.setItem(this.keys.bestScore, scores);
            return true;
        }
        return false;
    }
    getLeaderboard(difficulty = 'normal') {
        const all = this.getItem(this.keys.leaderboard, {});
        return (all[difficulty] || []).slice(0, 10);
    }
    addToLeaderboard(difficulty, entry) {
        const all = this.getItem(this.keys.leaderboard, {});
        if (!all[difficulty]) all[difficulty] = [];
        all[difficulty].push({ ...entry, date: new Date().toISOString() });
        all[difficulty].sort((a, b) => b.score - a.score);
        all[difficulty] = all[difficulty].slice(0, 20);
        this.setItem(this.keys.leaderboard, all);
    }
    clearLeaderboard(difficulty) {
        let all = this.getItem(this.keys.leaderboard, {});
        if (difficulty) { delete all[difficulty]; }
        else { all = {}; }
        this.setItem(this.keys.leaderboard, all);
    }
    getAchievements() { return this.getItem(this.keys.achievements, {}); }
    unlockAchievement(id) {
        const achievements = this.getAchievements();
        if (!achievements[id]) {
            achievements[id] = { unlocked: true, date: new Date().toISOString() };
            this.setItem(this.keys.achievements, achievements);
            return true;
        }
        return false;
    }
    isAchievementUnlocked(id) { return !!this.getAchievements()[id]?.unlocked; }
    getTheme() { return this.getItem(this.keys.theme, 'classic'); }
    setTheme(theme) { this.setItem(this.keys.theme, theme); }
    getSettings() {
        return this.getItem(this.keys.settings, { volume: 0.5, muted: false, showTutorial: true });
    }
    setSettings(settings) { this.setItem(this.keys.settings, settings); }
    isFirstVisit() { return !this.getItem(this.keys.firstVisit, false); }
    setFirstVisit() { this.setItem(this.keys.firstVisit, true); }
    
    getUserData() { 
        console.log('getUserData called');
        return this.getItem(this.keys.userData, null); 
    }
    saveUserData(data) { 
        console.log('saveUserData called with:', data);
        this.setItem(this.keys.userData, data); 
    }
    clearUserData() { 
        console.log('clearUserData called');
        this.setItem(this.keys.userData, null); 
    }
}
console.log('StorageManager class defined:', StorageManager);
window.StorageManager = StorageManager;
console.log('StorageManager added to window:', window.StorageManager);