require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/user');
const gameRoutes = require('./routes/game');
const leaderboardRoutes = require('./routes/leaderboard');
const achievementRoutes = require('./routes/achievement');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

let dbConnected = false;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/2048game')
    .then(() => {
        console.log('MongoDB 连接成功');
        dbConnected = true;
    })
    .catch(err => {
        console.error('MongoDB 连接失败，将使用内存存储:', err);
        dbConnected = false;
    });

global.dbConnected = dbConnected;

app.get('/api/db-status', (req, res) => {
    res.json({ connected: dbConnected });
});

// 路由
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/achievements', achievementRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '2048 Game Server is running' });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '服务器内部错误' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`2048 游戏服务器运行在端口 ${PORT}`);
});

module.exports = app;
