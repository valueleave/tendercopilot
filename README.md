# TenderCopilot

AI 招标文件智能解析助手

上传招标文件 PDF，3 分钟自动提取资格要求、评分标准、时间节点和风险提示。

---

## 项目简介

TenderCopilot 是一个基于 Next.js 15 构建的 MVP 产品。用户上传招标文件 PDF 后，系统自动解析内容并通过 DeepSeek API 生成结构化分析报告。

**核心功能：**

- 拖拽上传 PDF（最大 50MB）
- AI 自动提取项目概况、时间节点、资格要求、评分标准、风险提示、投标建议
- 结构化结果展示
- 3 分钟内完成全流程

---

## 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 15 | 框架 |
| TypeScript | 类型安全 |
| Tailwind CSS | 样式 |
| shadcn/ui | UI 组件 |
| pdf-parse | PDF 文本提取 |
| DeepSeek API | AI 分析 |

---

## 快速开始

### 前置要求

- Node.js 18+
- pnpm（建议）或 npm
- DeepSeek API Key（[获取地址](https://platform.deepseek.com/)）

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制环境变量模板并编辑：

```bash
cp .env.local.example .env.local
```

填入你的 DeepSeek API Key 到 `.env.local`

### 3. 启动开发服务器

```bash
pnpm dev
```

打开浏览器访问 http://localhost:3000

### 4. 构建生产版本

```bash
pnpm build && pnpm start
```

---

## 项目结构

```
tendercopilot/
├── app/
│   ├── api/analyze/route.ts   # PDF 解析 + AI 分析 API
│   ├── globals.css            # 全局样式
│   ├── layout.tsx             # 根布局
│   └── page.tsx               # 首页
├── components/
│   ├── ui/                    # shadcn/ui 组件
│   ├── analysis-progress.tsx  # 进度动画
│   ├── analysis-result.tsx    # 结果展示
│   └── file-upload.tsx        # 文件上传
├── lib/
│   ├── deepseek.ts            # DeepSeek API
│   └── utils.ts
├── types/pdf-parse.d.ts       # 类型声明
├── .env.local.example
├── next.config.ts
└── package.json
```

---

## 部署到 Vercel

1. 将代码推送到 GitHub 仓库
2. 登录 [Vercel Dashboard](https://vercel.com)
3. 导入项目，在环境变量中添加 `DEEPSEEK_API_KEY`
4. 点击 Deploy

---

## 常见问题

- **PDF 解析失败**: 确认文件为文本型 PDF（非扫描件），未损坏，不超过 50MB
- **API 报错**: 检查 `.env.local` 配置和 DeepSeek 账户余额
- **启动报错**: 删除 `node_modules` 后重新 `pnpm install`

---

## License

MIT
