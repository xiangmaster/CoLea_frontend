# colea-frontend

CoLea 协作学习平台的演示用前端，对应"专业方向综合项目"第 7 次（最终）答辩。

只有前端，所有数据来自 `src/mocks/` + Zustand store（持久化到 localStorage）；AI 导学页通过 yunwu (gpt-4o) 真实调用，未配 key 时自动回退到离线兜底回复。

视觉真值源：仓库根目录的 `colea-ui-designs.html`。

## 技术栈

- Vite 5 + React 18 + TypeScript
- Tailwind CSS 3（主题色 `brand-*` 与 HTML 设计稿一致）
- React Router 6（HashRouter）
- Zustand + persist
- Tiptap（文档协作页编辑器）
- Recharts（图表）
- lucide-react（图标）

## 安装

```bash
npm install
cp .env.local.example .env.local   # 可选：填 yunwu key
```

## 启动

```bash
npm run dev          # http://127.0.0.1:5173
npm run build
npm run preview
```

## 开发说明

- 主要入口：`src/main.tsx` → `src/App.tsx` → `src/routes.tsx`
- 假网络层：`src/lib/api.ts`，所有页面只调 `api()` 不直接读 store
- LLM：`src/lib/llm.ts`，单一出口
- 演示工具条：右下角，dev 默认显示，生产用 `?demo=1` 呼出
- 视觉对照：开发新页面前先 Read `colea-ui-designs.html` 对应 section

## 预置账号

- 学生：`student@colea` / `123456`（张同学）
- 教师：`teacher@colea` / `123456`（李教授）

## 部署

静态托管即可（Vercel / Netlify / Nginx）。HashRouter 不需要后端路由配置。
