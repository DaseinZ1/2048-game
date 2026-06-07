# 2048 游戏 - 快速启动指南

## 🎮 选择你的使用方式

### 方式一：纯前端版本（推荐新手）

**无需安装任何依赖，直接游玩！**

1. 双击打开 `index.html`
2. 或者在终端运行：
   ```bash
   cd 2048-game
   python -m http.server 8000
   ```
3. 浏览器访问 http://localhost:8000

**特点**：
- ✅ 即开即玩
- ✅ 所有功能可用
- ✅ 无需注册账号
- ❌ 数据仅保存在本地

---

### 方式二：前后端完整版（推荐进阶用户）

**需要安装 MongoDB，可体验全服排行榜！**

#### 第一步：安装 MongoDB

**Windows:**
1. 下载 MongoDB Community Server: https://www.mongodb.com/try/download/community
2. 安装时选择 "Complete" 安装
3. 创建数据目录：`C:\data\db`
4. 启动 MongoDB：`mongod --dbpath C:\data\db`

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt install mongodb-org
sudo systemctl start mongod
```

#### 第二步：启动后端服务

```bash
# 进入后端目录
cd server

# 安装依赖
npm install

# 启动服务器
npm start
```

看到以下信息表示启动成功：
```
MongoDB 连接成功
2048 游戏服务器运行在端口 3000
```

#### 第三步：启动前端

```bash
# 新开一个终端
cd 2048-game
python -m http.server 8000
```

#### 第四步：开始游戏

1. 打开浏览器访问 http://localhost:8000
2. 界面右上角应该显示 "🟢 已连接服务器"
3. 点击"注册"创建账号
4. 开始游戏并挑战全服排行榜！

---

## 🌟 核心功能对比

| 功能 | 纯前端版 | 完整版 |
|------|---------|--------|
| 单人游戏 | ✅ | ✅ |
| 本地排行榜 | ✅ | ✅ |
| 成就系统 | ✅ | ✅ |
| 成就云同步 | ❌ | ✅ |
| 全服排行榜 | ❌ | ✅ |
| 用户登录 | ❌ | ✅ |
| 跨设备游玩 | ❌ | ✅ |

---

## 🎯 成就列表

| 成就 | 描述 | 条件 |
|------|------|------|
| 🏆 首次通关 | 首次达到目标分数 | 首次获胜 |
| ⭐ 满分挑战 | 单局得分超过10000分 | 得分 > 10000 |
| ⚡ 速度之王 | 60秒内达到目标分数 | 用时 ≤ 60秒 |

**完整版额外成就：**
| 成就 | 描述 | 条件 |
|------|------|------|
| 🎯 坚持不懈 | 完成50局游戏 | 总游戏数 ≥ 50 |
| 💯 百分大师 | 单局得分超过100分 | 得分 > 100 |
| 🎖️ 资深玩家 | 累计得分超过50000分 | 累计得分 ≥ 50000 |
| 💎 完美主义 | 在困难模式下获胜 | 困难模式获胜 |

---

## ❓ 常见问题

**Q: 纯前端版显示"已连接服务器"但排行榜是空的？**
A: 这是正常的，只是检测到了本地服务器，但后端MongoDB服务未启动。请参考"方式二"启动完整版。

**Q: MongoDB 连接失败？**
A: 请确保：
1. MongoDB 已正确安装
2. MongoDB 服务已启动
3. `.env` 文件中的 `MONGODB_URI` 配置正确

**Q: 如何修改服务器端口？**
A: 编辑 `server/.env` 文件，修改 `PORT=3000` 为你想要的端口号。

**Q: 如何重置数据库？**
A: 在 MongoDB 中执行：
```javascript
use 2048game
db.dropDatabase()
```

---

## 📞 技术支持

如有问题，请检查：
1. Node.js 版本（需要 >= 14.0.0）
2. MongoDB 是否正常运行
3. 端口 3000 和 8000 是否被占用
4. `.env` 文件是否存在且配置正确

---

**祝游戏愉快！🎮**
