class ThemeManager {
    constructor(storageManager) {
        this.storage = storageManager;
        this.currentTheme = this.storage.getTheme();
        this.themes = {
            classic: { '--bg-color': '#faf8ef', '--text-color': '#776e65', '--title-color': '#776e65', '--board-bg': '#bbada0', '--cell-bg': 'rgba(238,228,218,0.35)', '--btn-bg': '#8f7a66', '--btn-hover': '#9f8b77', '--btn-active': '#7f6a56', '--score-bg': '#bbada0', '--score-label': '#eee4da', '--overlay-bg': 'rgba(238,228,218,0.73)', '--modal-bg': 'white', '--nav-bg': '#f4f1e8', '--border-color': '#d6cdc4', '--tile-2': '#eee4da', '--tile-4': '#ede0c8', '--tile-8': '#f2b179', '--tile-16': '#f59563', '--tile-32': '#f67c5f', '--tile-64': '#f65e3b', '--tile-128': '#edcf72', '--tile-256': '#edcc61', '--tile-512': '#edc850', '--tile-1024': '#edc53f', '--tile-2048': '#edc22e', '--tile-super': '#3c3a32', '--tile-text-light': '#f9f6f2', '--tile-text-dark': '#776e65' },
            dark: { '--bg-color': '#1a1a2e', '--text-color': '#e0e0e0', '--title-color': '#00d4aa', '--board-bg': '#16213e', '--cell-bg': 'rgba(255,255,255,0.08)', '--btn-bg': '#0f3460', '--btn-hover': '#1a4a7a', '--btn-active': '#0a2440', '--score-bg': '#16213e', '--score-label': '#888', '--overlay-bg': 'rgba(0,0,0,0.8)', '--modal-bg': '#1a1a2e', '--nav-bg': '#16213e', '--border-color': '#2d3561', '--tile-2': '#2d2d44', '--tile-4': '#3d3d5c', '--tile-8': '#e94560', '--tile-16': '#ff6b6b', '--tile-32': '#feca57', '--tile-64': '#ff9f43', '--tile-128': '#48dbfb', '--tile-256': '#0abde3', '--tile-512': '#1dd1a1', '--tile-1024': '#10ac84', '--tile-2048': '#00d4aa', '--tile-super': '#ffd700', '--tile-text-light': '#fff', '--tile-text-dark': '#ccc' },
            forest: { '--bg-color': '#f0f7f0', '--text-color': '#2d5016', '--title-color': '#1b4332', '--board-bg': '#74c69d', '--cell-bg': 'rgba(255,255,255,0.3)', '--btn-bg': '#2d6a4f', '--btn-hover': '#40916c', '--btn-active': '#1b5238', '--score-bg': '#74c69d', '--score-label': '#d8f3dc', '--overlay-bg': 'rgba(216,243,220,0.85)', '--modal-bg': '#f0f7f0', '--nav-bg': '#e8f5e9', '--border-color': '#95d5b2', '--tile-2': '#d8f3dc', '--tile-4': '#b7e4c7', '--tile-8': '#95d5b2', '--tile-16': '#74c69d', '--tile-32': '#52b788', '--tile-64': '#40916c', '--tile-128': '#2d6a4f', '--tile-256': '#1b4332', '--tile-512': '#081c15', '--tile-1024': '#f4a261', '--tile-2048': '#e76f51', '--tile-super': '#264653', '--tile-text-light': '#fff', '--tile-text-dark': '#2d5016' }
        };
        this.applyTheme(this.currentTheme);
    }
    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;
        const root = document.documentElement;
        Object.entries(theme).forEach(([key, value]) => root.style.setProperty(key, value));
        this.currentTheme = themeName;
        this.storage.setTheme(themeName);
        document.body.setAttribute('data-theme', themeName);
    }
    getCurrentTheme() { return this.currentTheme; }
    getAvailableThemes() { return Object.keys(this.themes); }
    getThemeName(key) { const names = { classic: '经典', dark: '深色', forest: '森林' }; return names[key] || key; }
}
window.ThemeManager = ThemeManager;