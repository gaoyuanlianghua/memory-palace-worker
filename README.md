# 记忆宫殿系统前端

> 基于React + TypeScript + Tailwind CSS的记忆宫殿前端系统

## 技术栈

- React 18
- TypeScript 5
- Tailwind CSS 3
- D3.js (知识图谱可视化)
- Vite (构建工具)

## 开发

```bash
cd memory-palace
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 部署

通过GitHub Actions自动部署到Cloudflare Pages。

### 所需Secrets

在GitHub仓库设置以下Secrets：

| Secret | 说明 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API令牌 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare账户ID |
| `GITHUB_TOKEN` | 自动提供，无需手动设置 |

## 功能

- 📊 仪表盘 - 实时系统状态监控
- 🤖 分身管理 - AI分身管理
- 📋 任务管理 - 任务查看与执行
- 🔮 知识图谱 - D3.js力导向图可视化
- 🧠 记忆系统 - 记忆统计与类型分布
- ⚡ 缓存监控 - 实时缓存命中率
- 📈 质量指标 - 内容质量分析
- 📜 执行日志 - 实时操作日志

## API

后端API: https://gyuanpalace.xyz/api

## 许可证

MIT
