const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

const memoryUsers = {};
let memoryUserId = 1;

// 注册
router.post('/register', async (req, res) => {
    try {
        const { username, password, nickname, email, avatar } = req.body;

        // 验证输入
        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }

        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ error: '用户名长度应为3-20个字符' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: '密码长度至少6个字符' });
        }

        // 检查用户是否存在
        if (global.dbConnected) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ error: '用户名已存在' });
            }
        } else {
            if (memoryUsers[username]) {
                return res.status(400).json({ error: '用户名已存在' });
            }
        }

        // 创建用户
        const hashedPassword = await bcrypt.hash(password, 10);
        
        let user;
        if (global.dbConnected) {
            user = new User({
                username,
                password: hashedPassword,
                nickname: nickname || username,
                email,
                avatar: avatar || '👤'
            });
            await user.save();
        } else {
            const userId = 'mem_' + memoryUserId++;
            user = {
                _id: userId,
                id: userId,
                username,
                password: hashedPassword,
                nickname: nickname || username,
                email,
                avatar: avatar || '👤',
                totalGames: 0,
                highestScore: 0,
                totalScore: 0
            };
            memoryUsers[username] = user;
        }

        // 生成token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: '注册成功',
            user: {
                id: user._id,
                username: user.username,
                nickname: user.nickname,
                email: user.email,
                avatar: user.avatar,
                totalGames: user.totalGames || 0,
                highestScore: user.highestScore || 0
            },
            token
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ error: '注册失败: ' + error.message });
    }
});

// 登录
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }

        // 查找用户
        let user;
        if (global.dbConnected) {
            user = await User.findOne({ username });
        } else {
            user = memoryUsers[username];
        }
        
        if (!user) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        // 更新最后登录时间（仅数据库模式）
        if (global.dbConnected) {
            user.lastLoginAt = new Date();
            await user.save();
        }

        // 生成token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '7d' }
        );

        res.json({
            message: '登录成功',
            user: {
                id: user._id,
                username: user.username,
                nickname: user.nickname,
                email: user.email,
                avatar: user.avatar,
                totalGames: user.totalGames || 0,
                highestScore: user.highestScore || 0,
                totalScore: user.totalScore || 0
            },
            token
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ error: '登录失败: ' + error.message });
    }
});

// 获取用户信息
router.get('/profile', auth, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                username: req.user.username,
                nickname: req.user.nickname,
                email: req.user.email,
                avatar: req.user.avatar,
                totalGames: req.user.totalGames,
                highestScore: req.user.highestScore,
                totalScore: req.user.totalScore,
                createdAt: req.user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ error: '获取用户信息失败' });
    }
});

// 更新用户信息
router.put('/profile', auth, async (req, res) => {
    try {
        const { nickname, email, avatar } = req.body;

        if (nickname) req.user.nickname = nickname;
        if (email) req.user.email = email;
        if (avatar) req.user.avatar = avatar;

        await req.user.save();

        res.json({
            message: '更新成功',
            user: {
                id: req.user._id,
                username: req.user.username,
                nickname: req.user.nickname,
                email: req.user.email,
                avatar: req.user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({ error: '更新失败' });
    }
});

// 修改密码
router.put('/password', auth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: '请填写完整信息' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: '新密码长度至少6个字符' });
        }

        const isMatch = await bcrypt.compare(oldPassword, req.user.password);
        if (!isMatch) {
            return res.status(401).json({ error: '原密码错误' });
        }

        req.user.password = await bcrypt.hash(newPassword, 10);
        await req.user.save();

        res.json({ message: '密码修改成功' });
    } catch (error) {
        res.status(500).json({ error: '密码修改失败' });
    }
});

module.exports = router;
