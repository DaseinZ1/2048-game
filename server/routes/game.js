const express = require('express');
const GameRecord = require('../models/GameRecord');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// 提交游戏记录
router.post('/record', optionalAuth, async (req, res) => {
    try {
        const { difficulty, score, targetScore, maxTile, moveCount, timeElapsed, won, gridSize } = req.body;

        // 验证输入
        if (!difficulty || score === undefined || !targetScore || !moveCount || !timeElapsed || !gridSize) {
            return res.status(400).json({ error: '请提供完整的游戏数据' });
        }

        const gameRecord = new GameRecord({
            userId: req.user?._id,
            username: req.user?.username || '游客',
            difficulty,
            score,
            targetScore,
            maxTile,
            moveCount,
            timeElapsed,
            won,
            gridSize
        });

        await gameRecord.save();

        // 如果已登录，更新用户统计
        if (req.user) {
            req.user.totalGames += 1;
            req.user.totalScore += score;
            if (score > req.user.highestScore) {
                req.user.highestScore = score;
            }
            await req.user.save();
        }

        res.status(201).json({
            message: '游戏记录保存成功',
            record: {
                id: gameRecord._id,
                score: gameRecord.score,
                difficulty: gameRecord.difficulty,
                won: gameRecord.won,
                playedAt: gameRecord.playedAt
            },
            isNewHighScore: req.user && score === req.user.highestScore
        });
    } catch (error) {
        console.error('保存游戏记录错误:', error);
        res.status(500).json({ error: '保存游戏记录失败' });
    }
});

// 获取用户游戏历史
router.get('/history', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, difficulty } = req.query;

        const query = { userId: req.user._id };
        if (difficulty) {
            query.difficulty = difficulty;
        }

        const records = await GameRecord.find(query)
            .sort({ playedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await GameRecord.countDocuments(query);

        res.json({
            records: records.map(r => ({
                id: r._id,
                difficulty: r.difficulty,
                score: r.score,
                targetScore: r.targetScore,
                maxTile: r.maxTile,
                moveCount: r.moveCount,
                timeElapsed: r.timeElapsed,
                won: r.won,
                gridSize: r.gridSize,
                playedAt: r.playedAt
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: '获取游戏历史失败' });
    }
});

// 获取用户统计数据
router.get('/stats', auth, async (req, res) => {
    try {
        const totalGames = await GameRecord.countDocuments({ userId: req.user._id });
        const wonGames = await GameRecord.countDocuments({ userId: req.user._id, won: true });

        // 各难度统计
        const difficultyStats = await GameRecord.aggregate([
            { $match: { userId: req.user._id } },
            {
                $group: {
                    _id: '$difficulty',
                    games: { $sum: 1 },
                    totalScore: { $sum: '$score' },
                    avgScore: { $avg: '$score' },
                    bestScore: { $max: '$score' },
                    fastestTime: { $min: '$timeElapsed' },
                    wins: { $sum: { $cond: ['$won', 1, 0] } }
                }
            }
        ]);

        // 整体统计
        const overallStats = await GameRecord.aggregate([
            { $match: { userId: req.user._id } },
            {
                $group: {
                    _id: null,
                    bestScore: { $max: '$score' },
                    avgScore: { $avg: '$score' },
                    totalMoves: { $sum: '$moveCount' },
                    totalTime: { $sum: '$timeElapsed' }
                }
            }
        ]);

        res.json({
            totalGames,
            wonGames,
            winRate: totalGames > 0 ? ((wonGames / totalGames) * 100).toFixed(1) : 0,
            difficultyStats: difficultyStats.reduce((acc, stat) => {
                acc[stat._id] = {
                    games: stat.games,
                    totalScore: stat.totalScore,
                    avgScore: Math.round(stat.avgScore),
                    bestScore: stat.bestScore,
                    fastestTime: stat.fastestTime,
                    wins: stat.wins,
                    winRate: stat.games > 0 ? ((stat.wins / stat.games) * 100).toFixed(1) : 0
                };
                return acc;
            }, {}),
            overallStats: overallStats[0] || {}
        });
    } catch (error) {
        console.error('获取统计数据错误:', error);
        res.status(500).json({ error: '获取统计数据失败' });
    }
});

module.exports = router;
