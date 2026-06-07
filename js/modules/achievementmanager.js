class AchievementManager {
    constructor(storageManager) { this.storage = storageManager; }
    check(game) {
        const unlocked = [];
        const checks = [
            { id: 'firstWin', name: '首次通关', desc: '首次达到目标分数', test: () => game.isWin() && !this.storage.isAchievementUnlocked('firstWin') },
            { id: 'scoreChallenge', name: '满分挑战', desc: '单局得分超过10000分', test: () => game.getScore() >= 10000 && !this.storage.isAchievementUnlocked('scoreChallenge') },
            { id: 'speedKing', name: '速度之王', desc: '60秒内达到目标分数', test: () => game.isWin() && game.getTimeElapsed() <= 60 && !this.storage.isAchievementUnlocked('speedKing') }
        ];
        checks.forEach(c => { if (c.test() && this.storage.unlockAchievement(c.id)) unlocked.push({ id: c.id, name: c.name, description: c.desc, date: new Date().toISOString() }); });
        return unlocked;
    }
    getAll() {
        const defs = [
            { id: 'firstWin', name: '首次通关', description: '首次达到目标分数' },
            { id: 'scoreChallenge', name: '满分挑战', description: '单局得分超过10000分' },
            { id: 'speedKing', name: '速度之王', description: '60秒内达到目标分数' }
        ];
        return defs.map(d => ({ ...d, unlocked: this.storage.isAchievementUnlocked(d.id), date: this.storage.getAchievements()[d.id]?.date }));
    }
    markUnlocked(achievementId) {
        if (!this.storage.isAchievementUnlocked(achievementId)) {
            this.storage.unlockAchievement(achievementId);
        }
    }
}
window.AchievementManager = AchievementManager;