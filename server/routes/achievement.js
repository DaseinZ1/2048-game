const express = require('express');
const Achievement = require('../models/Achievement');
const GameRecord = require('../models/GameRecord');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// 成就定义
const ACHIEVEMENTS = {
    firstWin: {
        id: 'firstWin',
        name: '首次通关',
        description: '首次达到目标分数',
        icon: '🏆'
    },
    scoreChallenge: {
        id: 'scoreChallenge',
        name: '满分挑战',
        description: '单局得分超过10000分',
        icon: '⭐'
    },
    speedKing: {
        id: 'speedKing',
        name: '速度之王',
        description: '60秒内达到目标分数',
        icon: '⚡'
    },
    marathoner: {
        id: 'marathoner',
        name: '坚持不懈',
        description: '完成50局游戏',
        icon: '🎯'
    },
    centurion: {
        id: 'centurion',
        name: '百分大师',
        description: '单局得分超过100分',
        icon: '💯'
    },
    veteran: {
        id: 'veteran',
        name: '资深玩家',
        description: '累计得分超过50000分',
        icon: '🎖️'
    },
    perfectionist: {
        id: 'perfectionist',
        name: '完美主义',
        description: '在困难模式下获胜',
        icon: '💎'
    },
    dailyPlayer: {
        id: 'dailyPlayer',
        name: '每日玩家',
        description: '连续7天每天玩一局',
        icon: '📅'
    }
};

// 获取所有成就定义
router.get('/definitions', (req, res) => {
    res.json({
        achievements: Object.values(ACHIEVEMENTS)
    });
});

// 获取用户成就列表
router.get('/', optionalAuth, async (req, res) => {
    try {
        if (!req.user) {
            return res.json({
                achievements: [],
                unlockedCount: 0,
                totalCount: Object.keys(ACHIEVEMENTS).length
            });
        }

        const userAchievements = await Achievement.find({ userId: req.user._id });

        const achievements = Object.values(ACHIEVEMENTS).map(a => {
            const userAchievement = userAchievements.find(ua => ua.achievementId === a.id);
            return {
                ...a,
                unlocked: !!userAchievement,
                unlockedAt: userAchievement?.unlockedAt,
                gameRecordId: userAchievement?.gameRecordId
            };
        });

        res.json({
            achievements,
            unlockedCount: userAchievements.length,
            totalCount: Object.keys(ACHIEVEMENTS).length
        });
    } catch (error) {
        console.error('获取成就错误:', error);
        res.status(500).json({ error: '获取成就失败' });
    }
});

// 检查并解锁成就
router.post('/check', optionalAuth, async (req, res) => {
    try {
        const { gameRecordId, difficulty, score, won, timeElapsed, maxTile, gridSize } = req.body;

        if (!req.user) {
            return res.json({ unlocked: [], message: '游客模式，跳过成就检查' });
        }

        const unlocked = [];
        const userAchievements = await Achievement.find({ userId: req.user._id });
        const unlockedIds = userAchievements.map(a => a.achievementId);

        // 检查各项成就条件
        const checks = [
            // 首次通关
            {
                id: 'firstWin',
                condition: won && !unlockedIds.includes('firstWin')
            },
            // 满分挑战 - 单局超过10000分
            {
                id: 'scoreChallenge',
                condition: score > 10000 && !unlockedIds.includes('scoreChallenge')
            },
            // 速度之王 - 60秒内通关
            {
                id: 'speedKing',
                condition: won && timeElapsed <= 60 && !unlockedIds.includes('speedKing')
            },
            // 百分大师 - 单局超过100分
            {
                id: 'centurion',
                condition: score > 100 && !unlockedIds.includes('centurion')
            },
            // 完美主义 - 困难模式获胜
            {
                id: 'perfectionist',
                condition: won && difficulty === 'hard' && !unlockedIds.includes('perfectionist')
            }
        ];

        // 检查累计成就
        const userStats = await GameRecord.aggregate([
            { $match: { userId: req.user._id } },
            {
                $group: {
                    _id: null,
                    totalGames: { $sum: 1 },
                    totalScore: { $sum: '$score' }
                }
            }
        ]);

        const stats = userStats[0] || { totalGames: 0, totalScore: 0 };

        if (stats.totalGames >= 50 && !unlockedIds.includes('marathoner')) {
            checks.push({ id: 'marathoner', condition: true });
        }

        if (stats.totalScore >= 50000 && !unlockedIds.includes('veteran')) {
            checks.push({ id: 'veteran', condition: true });
        }

        // 解锁达标的成就
        for (const check of checks) {
            if (check.condition) {
                const achievement = new Achievement({
                    userId: req.user._id,
                    achievementId: check.id,
                    name: ACHIEVEMENTS[check.id].name,
                    description: ACHIEVEMENTS[check.id].description,
                    gameRecordId
                });

                await achievement.save();
                unlocked.push({
                    ...ACHIEVEMENTS[check.id],
                    unlockedAt: achievement.unlockedAt
                });
            }
        }

        res.json({
            unlocked,
            totalUnlocked: userAchievements.length + unlocked.length
        });
    } catch (error) {
        console.error('检查成就错误:', error);
        res.status(500).json({ error: '检查成就失败' });
    }
});

module.exports = router;
