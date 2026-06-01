# CoLea 前端 · 团队上手指南

> 给同组成员的快速入门。按步骤走，跑起来不会有坑。预计 15~25 分钟把环境搭好。

---

## 目录

- [一、它是什么](#一它是什么)
- [二、环境准备](#二环境准备)
- [三、最短启动路径（5 步）](#三最短启动路径5-步)
- [四、可选：接入真实 AI](#四可选接入真实-ai)
- [五、可选：让地址栏看起来像部署过](#五可选让地址栏看起来像部署过)
- [六、预置账号](#六预置账号)
- [七、演示工具条用法](#七演示工具条用法)
- [八、目录结构](#八目录结构)
- [九、常见踩坑速查](#九常见踩坑速查)
- [十、演示脚本在哪](#十演示脚本在哪)

---

## 一、它是什么

CoLea 协作学习平台的**纯前端实现**，给"专业方向综合项目"最终答辩演示用：

- 8 大用例覆盖：认证 / 课程 / 智能分组 / 任务 / 文档协作 / 数据分析 / AI 导学 / 教师管理
- **看起来像有后端**：所有交互都走假 API 层，数据持久化到 localStorage
- **文档协作**：真接 OnlyOffice Document Server（docker 本地起），支持 .docx 编辑/批注/协同
- **AI 导学**：真接 yunwu / gpt-4o，流式输出；未配 key 自动走离线兜底
- **实时事件流**：模拟 WebSocket，仪表盘每十几秒推送新动态 + 顶栏 🔔 红点

技术栈：Vite 5 + React 18 + TypeScript + Tailwind 3 + React Router 6 + Zustand + Tiptap + Recharts + OnlyOffice React SDK + lucide-react。

---

## 二、环境准备

| 工具 | 版本 | 必需？ | 用途 |
| --- | --- | --- | --- |
| **Node.js** | ≥ 18.18 | ✅ | 跑 Vite 与构建 |
| **npm** | ≥ 9 | ✅ | 装依赖 |
| **Docker Desktop** | 最新 | ✅ | 跑 OnlyOffice Document Server |
| Homebrew | 最新 | 可选 | Tier 2 域名方案要装 caddy |

检查：

```bash
node -v   # 应 ≥ v18.18
npm -v
docker --version
docker compose version
```

Mac 没 Docker：去官网下 [Docker Desktop](https://www.docker.com/products/docker-desktop/)，第一次启动等它转完。

---

## 三、最短启动路径（5 步）

```bash
# 1. 进入项目
cd /path/to/专业方向综合项目/colea-frontend

# 2. 安装依赖（首次 30~60s）
npm install

# 3. 启动 OnlyOffice Document Server（首次拉镜像约 5~10 min，~1.5GB）
cd onlyoffice
docker compose up -d
cd ..

# 4. 等 OnlyOffice 起来（~30s）
curl http://localhost:8080/healthcheck
# 返回 true 就是 OK

# 5. 启动前端
npm run dev
```

浏览器打开 http://127.0.0.1:5173 → 用 `student@colea` / `123456` 登录。

> 不需要 AI 功能也能跑：未配 key 时 AI 导学和教师风险预警都会走离线兜底回复，演示不会中断。

---

## 四、可选：接入真实 AI

如果想让 AI 导学页 + AI 风险预警 调真实的 gpt-4o（更有说服力）：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```bash
VITE_LLM_BASE_URL=https://yunwu.ai/v1
VITE_LLM_API_KEY=sk-你的key
VITE_LLM_MODEL=gpt-4o
```

**改完必须重启 Vite**（Ctrl+C 然后 `npm run dev`），`.env.local` 不走 HMR。

成功标志：AI 导学页右上角徽章变绿，写「AI 服务在线」。

---

## 五、可选：让地址栏看起来像部署过

默认 `127.0.0.1:5173` 一眼是本地。要让浏览器地址栏显示 `http://colea.edu.cn` 之类的：

**Tier 1（最快，只改 hosts）：**

```bash
bash scripts/setup-domain.sh
# 输入一次 sudo 密码
```

之后访问 `http://colea.edu.cn:5173`，地址栏不再是 IP。

**Tier 2（最像部署，没有端口号）：**

```bash
bash scripts/setup-domain.sh --caddy
# 会自动 brew install caddy 并启动反向代理
```

然后改 `.env.local`：

```bash
VITE_ONLYOFFICE_URL=http://doc.colea.edu.cn
```

重启 Vite，访问 `http://colea.edu.cn`（没端口）。OnlyOffice iframe 走 `http://doc.colea.edu.cn`。

**撤销**：

```bash
bash scripts/teardown-domain.sh
```

---

## 六、预置账号

密码统一 `123456`，演示宽容模式：任意非空密码也能登。

### 教师（3 个）

| 姓名 | 账号 | 工号 |
| --- | --- | --- |
| 李教授 | `teacher@colea` | T2018003 |
| 王教授 | `wangprof@colea` | T2017005 |
| 陈教授 | `chenprof@colea` | T2019008 |

### 学生（12 个）

| 姓名 | 账号 | 学号 |
| --- | --- | --- |
| 张同学（主演示） | `student@colea` | 2024001 |
| 李同学 | `li@colea` | 2024002 |
| 王同学 | `wang@colea` | 2024003 |
| 赵同学 | `zhao@colea` | 2024004 |
| 刘同学 | `liu@colea` | 2024005 |
| 陈同学 | `chen@colea` | 2024006 |
| 周同学 | `zhou@colea` | 2024007 |
| 吴同学 | `wu@colea` | 2024008 |
| 孙同学 | `sun@colea` | 2024009 |
| 郑同学 | `zheng@colea` | 2024010 |
| 黄同学 | `huang@colea` | 2024011 |
| 杨同学 | `yang@colea` | 2024012 |

---

## 七、演示工具条用法

右下角悬浮的「演示工具」按钮（仅 dev 显示，或生产用 `?demo=1`）：

- **切换角色**：一键以张同学 / 李同学 / 王同学 / 赵同学 / 李教授身份登录，不用退出
- **模拟延迟开关**：默认开（请求 400~950ms，更像真后端）；演示前**关掉**，响应即时
- **一键重置演示数据**：清掉所有 localStorage 持久化 + 登出，回到初始状态

录视频前必做：
1. 关模拟延迟 → 流畅
2. 点 X 图标把工具条收起来 → 不出现在画面里

---

## 八、目录结构

```
colea-frontend/
├── README.md                  ← 你正在读
├── CLAUDE.md                  ← 给 AI 助手的项目说明
├── package.json
├── vite.config.ts             ← Vite 配置（端口、allowedHosts、HMR）
├── tailwind.config.ts         ← brand 色阶 = Tailwind blue 系
├── Caddyfile                  ← Tier 2 域名方案的反代配置
├── .env.local.example         ← 复制成 .env.local 填 yunwu key
├── onlyoffice/
│   ├── docker-compose.yml     ← OnlyOffice DS 启动配置
│   └── local.json             ← (运行时由入口脚本生成)
├── public/sample/
│   ├── colea-requirements.docx       ← 需求分析报告
│   ├── colea-system-design.docx      ← 系统设计文档
│   └── colea-meeting-notes.docx      ← 例会纪要
├── scripts/
│   ├── setup-domain.sh        ← 本地 DNS 工具
│   └── teardown-domain.sh
├── docs/
│   └── 演示脚本.md            ← 录视频的口播稿
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── routes.tsx
    ├── layouts/               ← AuthLayout / AppLayout
    ├── pages/
    │   ├── auth/              ← 登录/注册/重置密码
    │   ├── student/           ← 学生端 11 个页面
    │   └── teacher/           ← 教师端 8 个页面
    ├── components/
    │   ├── ui/                ← Button/Card/Modal/Toast/Tag/Avatar
    │   ├── charts/            ← Heatmap/Donut/Radar/TrendLine/Sparkline
    │   ├── doc/               ← OnlyOfficeEditor/CommentSidebar/VersionHistoryDrawer
    │   ├── ai/                ← StreamCard
    │   └── nav/               ← Sidebar/Topbar/CommandPalette/NotificationsDrawer/LivePusher
    ├── store/                 ← Zustand store（auth/course/group/task/doc/analytics/notification/activity/announcement）
    ├── mocks/                 ← seed 数据
    └── lib/
        ├── api.ts             ← 假 API 层（延迟 + 失败率）
        ├── llm.ts             ← OpenAI 兼容 SSE 客户端
        ├── persist.ts         ← localStorage 持久化
        └── demo.ts            ← 重置工具
```

---

## 九、常见踩坑速查

### Q1：OnlyOffice 视图加载报"下载失败"

**症状**：进文档协作页，OnlyOffice 工具栏出来了，但弹"下载失败"。

**最常见原因 + 解法**：

1. **Vite 没监听 0.0.0.0**（容器拿不到文件）
   - 检查 `vite.config.ts` 里 `host: '0.0.0.0'`
2. **Docker 容器内 DNS 没解析 `host.docker.internal`**
   - 检查 `onlyoffice/docker-compose.yml` 是否有 `extra_hosts: ["host.docker.internal:host-gateway"]`
3. **OnlyOffice SSRF 防护挡了**（最常见！）
   - 必须设环境变量 `ALLOW_PRIVATE_IP_ADDRESS=true ALLOW_META_IP_ADDRESS=true`，已在 compose 里
   - 改完要 `docker compose down -v && docker compose up -d` 重建

诊断命令：

```bash
# 容器里能不能拿到 docx
docker exec colea-onlyoffice-ds wget -O /tmp/t.docx \
  http://host.docker.internal:5173/sample/colea-requirements.docx

# 看 DS 在抱怨啥
docker logs colea-onlyoffice-ds --tail 100 2>&1 | grep -iE "error|fail"
```

### Q2：OnlyOffice 一直 "Skip loading. Instance already exists"

React StrictMode 双挂载导致 iframe 冲突。我们已经在 `main.tsx` 去掉了 `StrictMode`。如果你看到这条，检查 `main.tsx` 是不是被改回去了。

### Q3：第一次访问 OnlyOffice 视图卡在"连接中..."

DS 启动慢，正常。`curl http://localhost:8080/healthcheck` 返回 `true` 之前都先别刷新。

### Q4：改了 `.env.local` 但 AI 还是离线

`.env.local` 不走 HMR，必须 Ctrl+C 停 Vite，再 `npm run dev`。

### Q5：数据看起来乱了

```js
// 浏览器控制台
localStorage.clear(); location.reload();
```

或者用演示工具条「一键重置」。

### Q6：Apple Silicon (M1/M2/M3) Mac OnlyOffice 起不来

`docker-compose.yml` 已加 `platform: linux/amd64`。第一次镜像跑会慢些（走 Rosetta），但稳定。

### Q7：端口冲突

| 端口 | 谁占 |
| --- | --- |
| 5173 | Vite |
| 8080 | OnlyOffice DS |
| 80/443 | Caddy（仅 Tier 2 域名方案） |

冲突就改 `vite.config.ts` 的 `port` 或 `docker-compose.yml` 的 `ports`。

### Q8：把项目移到别的目录后报路径错

清掉 node_modules 重装：

```bash
rm -rf node_modules dist
npm install
```

---

## 十、演示脚本在哪

`docs/演示脚本.md` 有完整的 6 段视频口播稿 + 操作指引 + 录制 tips。

录制前再过一遍：

- [ ] OnlyOffice DS 起来了（`curl localhost:8080/healthcheck` 返回 true）
- [ ] `.env.local` 的 yunwu key 填了
- [ ] Vite 已重启
- [ ] 浏览器跑过一次 `localStorage.clear(); location.reload();`
- [ ] 用 `student@colea / 123456` 登录到仪表盘能看到数据
- [ ] OnlyOffice 视图至少打开过一次让 DS 缓存好首个 docx
- [ ] 演示工具条关闭模拟延迟 + 把工具条收起
- [ ] 浏览器窗口 1440×900 左右

---

## 十一、有问题问谁

- **跑不起来**：先按"九、常见踩坑"自查；都试过还不行，把报错截图发组里
- **想改文案 / 数据**：`src/mocks/` 里面都是种子数据，改完刷新就生效
- **想改样式**：`src/styles/globals.css` + `tailwind.config.ts`（brand 色阶在这里改）
- **想加页面**：在 `src/pages/` 加新文件 → 在 `src/routes.tsx` 注册路由 → 在 `src/components/nav/Sidebar.tsx` 加菜单

祝答辩顺利 🎓
