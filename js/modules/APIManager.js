class APIManager {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('game2048_token');
    }

    // 设置认证token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('game2048_token', token);
        } else {
            localStorage.removeItem('game2048_token');
        }
    }

    // 获取认证头
    _headers() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    // 通用请求方法
    async _request(method, endpoint, data = null) {
        const options = {
            method,
            headers: this._headers()
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || '请求失败');
            }

            return result;
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    }

    // ============ 用户相关 ============

    // 注册
    async register(username, password, nickname = '', email = '', avatar = '👤') {
        const result = await this._request('POST', '/users/register', {
            username,
            password,
            nickname,
            email,
            avatar
        });
        if (result.token) {
            this.setToken(result.token);
        }
        return result;
    }

    // 登录
    async login(username, password) {
        const result = await this._request('POST', '/users/login', {
            username,
            password
        });
        if (result.token) {
            this.setToken(result.token);
        }
        return result;
    }

    // 登出
    logout() {
        this.setToken(null);
        return Promise.resolve();
    }

    // 获取用户信息
    async getProfile() {
        return this._request('GET', '/users/profile');
    }

    // 更新用户信息
    async updateProfile(data) {
        return this._request('PUT', '/users/profile', data);
    }

    // 检查是否已登录
    isLoggedIn() {
        return !!this.token;
    }

    // ============ 游戏相关 ============

    // 提交游戏记录
    async submitGameRecord(gameData) {
        return this._request('POST', '/games/record', gameData);
    }

    // 获取游戏历史
    async getGameHistory(page = 1, limit = 10, difficulty = '') {
        let endpoint = `/games/history?page=${page}&limit=${limit}`;
        if (difficulty) {
            endpoint += `&difficulty=${difficulty}`;
        }
        return this._request('GET', endpoint);
    }

    // 获取用户统计
    async getGameStats() {
        return this._request('GET', '/games/stats');
    }

    // ============ 排行榜相关 ============

    // 获取排行榜
    async getLeaderboard(difficulty = 'normal', sort = 'score', page = 1, limit = 20) {
        return this._request('GET', `/leaderboard/${difficulty}?sort=${sort}&page=${page}&limit=${limit}`);
    }

    // 获取我的排名
    async getMyRank(difficulty = 'normal') {
        return this._request('GET', `/leaderboard/my-rank/${difficulty}`);
    }

    // 获取最近比赛
    async getRecentGames(difficulty = 'normal') {
        return this._request('GET', `/leaderboard/recent/${difficulty}`);
    }

    // ============ 成就相关 ============

    // 获取成就列表
    async getAchievements() {
        return this._request('GET', '/achievements');
    }

    // 检查成就
    async checkAchievements(gameRecordId, gameData) {
        return this._request('POST', '/achievements/check', {
            gameRecordId,
            ...gameData
        });
    }

    // 获取成就定义
    async getAchievementDefinitions() {
        return this._request('GET', '/achievements/definitions');
    }
}

// 创建全局API实例
window.api = new APIManager();
