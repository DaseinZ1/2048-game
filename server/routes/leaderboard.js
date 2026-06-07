const express = require('express');
const GameRecord = require('../models/GameRecord');

const router = express.Router();

// 获取排行榜
router.get('/:difficulty?', async (req, res) => {
    try {
        const { difficulty = 'normal', sort = 'score', limit = 20, page = 1 } = req.query;

        const validDifficulties = ['easy', 'normal', 'hard'];
        const difficultyFilter = validDifficulties.includes(difficulty) ? difficulty : 'normal';

        // 聚合查询：按用户名分组，取每个用户的最高分
        const pipeline = [
            { $match: { difficulty: difficultyFilter } },
            {
                $group: {
                    _id: '$userId',
                    username: { $first: '$username' },
                    bestScore: { $max: '$score' },
                    gamesPlayed: { $sum: 1 },
                    fastestTime: { $min: '$timeElapsed' },
                    wonGames: { $sum: { $cond: ['$won', 1, 0] } },
                    lastPlayedAt: { $max: '$playedAt' }
                }
            }
        ];

        // 根据排序字段排序
        const sortField = sort === 'time' ? 'fastestTime' : 'bestScore';
        pipeline.push({ $sort: { [sortField]: sort === 'time' ? 1 : -1 } });

        // 分页
        pipeline.push({ $skip: (page - 1) * limit });
        pipeline.push({ $limit: parseInt(limit) });

        const leaderboard = await GameRecord.aggregate(pipeline);

        // 获取总数
        const countPipeline = [
            { $match: { difficulty: difficultyFilter } },
            { $group: { _id: '$userId' } },
            { $count: 'total' }
        ];
        const countResult = await GameRecord.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        res.json({
            difficulty: difficultyFilter,
            sort,
            leaderboard: leaderboard.map((entry, index) => ({
                rank: (page - 1) * limit + index + 1,
                userId: entry._id,
                username: entry.username,
                bestScore: entry.bestScore,
                gamesPlayed: entry.gamesPlayed,
                fastestTime: entry.fastestTime,
                wonGames: entry.wonGames,
                winRate: entry.gamesPlayed > 0
                    ? ((entry.wonGames / entry.gamesPlayed) * 100).toFixed(1)
                    : 0,
                lastPlayedAt: entry.lastPlayedAt
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('获取排行榜错误:', error);
        res.status(500).json({ error: '获取排行榜失败' });
    }
});

// 获取我的排名
router.get('/my-rank/:difficulty', async (req, res) => {
    try {
        const { difficulty = 'normal' } = req.params;
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: '请先登录' });
        }

        const token = authHeader.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const User = require('../models/User');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: '用户不存在' });
        }

        // 获取该用户的最佳成绩
        const myBest = await GameRecord.findOne({
            userId: user._id,
            difficulty
        }).sort({ score: -1 });

        if (!myBest) {
            return res.json({ rank: null, message: '暂无记录' });
        }

        // 计算排名
        const rank = await GameRecord.aggregate([
            { $match: { difficulty, userId: { $ne: user._id } } },
            {
                $group: {
                    _id: '$userId',
                    bestScore: { $max: '$score' }
                }
            },
            { $match: { bestScore: { $gt: myBest.score } } },
            { $count: 'higherScores' }
        ]);

        const higherCount = rank[0]?.higherScores || 0;

        res.json({
            rank: higherCount + 1,
            bestScore: myBest.score,
            difficulty
        });
    } catch (error) {
        console.error('获取排名错误:', error);
        res.status(500).json({ error: '获取排名失败' });
    }
});

// 获取最近比赛
router.get('/recent/:difficulty?', async (req, res) => {
    try {
        const { difficulty = 'normal' } = req.params;

        const recentGames = await GameRecord.find({ difficulty })
            .sort({ playedAt: -1 })
            .limit(10)
            .select('username score timeElapsed won playedAt');

        res.json({
            difficulty,
            recentGames: recentGames.map(g => ({
                username: g.username,
                score: g.score,
                timeElapsed: g.timeElapsed,
                won: g.won,
                playedAt: g.playedAt
            }))
        });
    } catch (error) {
        res.status(500).json({ error: '获取最近比赛失败' });
    }
});

module.exports = router;
