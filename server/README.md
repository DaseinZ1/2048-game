# 2048 游戏后端服务

Node.js + Express + MongoDB 后端服务，为2048游戏提供用户系统、排行榜和成就功能。

## 功能特性

### 用户系统
- 用户注册（用户名、密码、昵称）
- 用户登录（JWT Token认证）
- 用户信息管理
- 密码修改

### 游戏记录
- 提交游戏记录
- 查询游戏历史
- 用户统计数据

### 排行榜
- 全服排行榜
- 按难度分类
- 按分数/用时排序
- 我的排名查询

### 成就系统
- 8个成就（持续扩展中）
- 自动检测解锁
- 跨设备同步

## 技术栈

- **Node.js** - JavaScript运行时
- **Express** - Web框架
- **MongoDB** - NoSQL数据库
- **Mongoose** - MongoDB ORM
- **JWT** - 用户认证
- **bcryptjs** - 密码加密

## 安装部署

### 环境要求

- Node.js >= 14.0.0
- MongoDB >= 4.0.0

### 安装步骤

```bash
# 1. 进入后端目录
cd server

# 2. 安装依赖
npm install

# 3. 配置环境变量
# 编辑 .env 文件，设置：
# - MONGODB_URI: MongoDB连接地址
# - JWT_SECRET: JWT密钥（建议使用随机字符串）
# - PORT: 服务器端口（默认3000）

# 4. 启动服务器
npm start

# 或开发模式（自动重启）
npm run dev
```

### MongoDB 安装

```bash
# macOS (使用Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt install mongodb-org
sudo systemctl start mongod

# Windows
# 下载MongoDB Community Server并安装
```

## API 文档

### 用户相关

#### 注册
```
POST /api/users/register
Content-Type: application/json

{
  "username": "player1",
  "password": "123456",
  "nickname": "玩家1",
  "email": "player@example.com"
}
```

#### 登录
```
POST /api/users/login
Content-Type: application/json

{
  "username": "player1",
  "password": "123456"
}
```

#### 获取用户信息
```
GET /api/users/profile
Authorization: Bearer <token>
```

### 游戏记录

#### 提交游戏记录
```
POST /api/games/record
Authorization: Bearer <token> (可选)

{
  "difficulty": "normal",
  "score": 2048,
  "targetScore": 2048,
  "maxTile": 2048,
  "moveCount": 100,
  "timeElapsed": 120,
  "won": true,
  "gridSize": 4
}
```

#### 获取游戏历史
```
GET /api/games/history?page=1&limit=10&difficulty=normal
Authorization: Bearer <token>
```

### 排行榜

#### 获取排行榜
```
GET /api/leaderboard/:difficulty?sort=score&page=1&limit=20

# 参数说明
# - difficulty: easy | normal | hard
# - sort: score | time
```

#### 获取我的排名
```
GET /api/leaderboard/my-rank/:difficulty
Authorization: Bearer <token>
```

### 成就

#### 获取成就列表
```
GET /api/achievements
Authorization: Bearer <token> (可选)
```

#### 检查成就
```
POST /api/achievements/check
Authorization: Bearer <token>

{
  "gameRecordId": "...",
  "difficulty": "normal",
  "score": 2048,
  "won": true,
  "timeElapsed": 120,
  "maxTile": 2048,
  "gridSize": 4
}
```

## 成就列表

| ID | 名称 | 描述 | 条件 |
|----|------|------|------|
| firstWin | 首次通关 | 首次达到目标分数 | 首次获胜 |
| scoreChallenge | 满分挑战 | 单局得分超过10000分 | 得分 > 10000 |
| speedKing | 速度之王 | 60秒内达到目标分数 | 用时 <= 60秒 |
| marathoner | 坚持不懈 | 完成50局游戏 | 总游戏数 >= 50 |
| centurion | 百分大师 | 单局得分超过100分 | 得分 > 100 |
| veteran | 资深玩家 | 累计得分超过50000分 | 累计得分 >= 50000 |
| perfectionist | 完美主义 | 在困难模式下获胜 | 困难模式获胜 |
| dailyPlayer | 每日玩家 | 连续7天每天玩一局 | (开发中) |

## 项目结构

```
server/
├── package.json
├── .env                 # 环境变量（不提交）
├── server.js           # 主入口
├── models/             # 数据模型
│   ├── User.js
│   ├── GameRecord.js
│   └── Achievement.js
├── routes/            # 路由
│   ├── user.js
│   ├── game.js
│   ├── leaderboard.js
│   └── achievement.js
├── middleware/         # 中间件
│   └── auth.js
└── README.md
```

## 前端集成

前端已集成API调用模块 (`js/modules/APIManager.js`)：

```javascript
// 检查服务器连接状态
if (window.gameApp.serverOnline) {
  // 使用服务器功能
}

// 登录示例
await window.api.login(username, password);

// 提交游戏记录
await window.api.submitGameRecord(gameData);

// 获取排行榜
const leaderboard = await window.api.getLeaderboard('normal');
```

## 安全说明

1. **密码加密**：使用 bcryptjs 加密存储
2. **JWT认证**：7天有效期
3. **敏感数据**：`.env` 文件不提交到版本控制
4. **CORS配置**：已配置允许跨域请求

## 扩展建议

1. 添加头像上传功能
2. 实现好友系统
3. 添加游戏回放功能
4. 实现赛季/排行榜周期
5. 添加聊天/社区功能
6. 实现防作弊机制
7. 添加统计图表
8. 实现成就徽章展示

## License

MIT License
