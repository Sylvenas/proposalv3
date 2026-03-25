# proposalv3

这是一个基于 Next.js 15、React 19、TypeScript 和 Tailwind CSS 4 的原型项目，仓库里包含多个 proposal 相关页面和编辑器实验页。

## 环境要求

- Node.js: 建议使用 24.x
- pnpm: 建议使用 10.x

当前本地验证环境：

- Node.js `v24.14.0`
- pnpm `10.20.0`

## 安装依赖

在项目根目录执行：

```bash
pnpm install
```

## 本地开发

启动开发服务器：

```bash
pnpm dev
```

默认会启动在：

```text
http://localhost:3000
```

打开首页后，可以从导航页进入各个原型页面。

## 常用命令

开发模式：

```bash
pnpm dev
```

生产构建：

```bash
pnpm build
```

本地预览生产环境：

```bash
pnpm start
```

本地化 Figma 资源脚本：

```bash
pnpm figma:localize
```

## 主要页面

- `/`：项目导航页
- `/proposal-future-blueprint`：Proposal Future Blueprint
- `/proposal-v3`：Proposal V3
- `/proposal-html-render`：HTML 渲染版 proposal
- `/homeowner-site-proposal-builder`：拖拽式 proposal builder
- `/custom-widget`：基于 `tldraw` 的 widget 画布
- `/initial-draft`：早期草稿版本
- `/compare`：对比页

## 运行说明

首次拉取项目后，推荐按下面顺序执行：

```bash
pnpm install
pnpm dev
```

如果只是确认项目能否正常打包，执行：

```bash
pnpm build
```

## 已验证

已在当前仓库执行并通过：

```bash
pnpm build
```

构建输出显示所有 `app` 路由均已成功生成。
