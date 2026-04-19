# 隐信片 Enigma Card

把私语藏进一张安静的图里。

## 当前状态

这是一个面向 MVP 的 React + Vite PWA 骨架，已经包含：

- 铸币局：上传图片、输入引导文案、输入隐藏文本、LSB 编码、PNG 导出
- 显影液：导入图片并本地解码
- 手帐本：本地保存最近生成或收到的卡片摘要
- 设置：原图发送提醒、默认分享方式、备用密钥入口开关
- 文档：完整 PRD 与 MVP 蓝图
- 战略文档：三端矩阵部署路线
- 分发目录：本地网页包启动脚本与说明

## 技术说明

- 前端：React + TypeScript + Vite
- 样式：原生 CSS
- 隐写：Canvas + LSB
- 存储：LocalStorage 占位实现

说明：文档中提到的 IndexedDB、冗余 OCR、DCT 频域隐写、压缩模拟测试，目前还没有完全实现。

## 产品战略文档

- [PRD](./docs/PRD.zh-CN.md)
- [MVP 蓝图](./docs/MVP-Blueprint.zh-CN.md)
- [三端矩阵部署战略](./docs/Go-To-Market-Roadmap.zh-CN.md)
- [本地网页包分发方案](./docs/Local-Web-Distribution.zh-CN.md)

## 本地网页包方向

这个项目从一开始就按“纯静态前端”组织，目标是同时支持两种交付方式：

- 本地网页包分发
- 后期直接部署为正式网站

也就是说，核心产品代码尽量不依赖服务器，部署方式只是外层包装。

## 本地启动

```bash
npm install
npm run dev
```

当前仓库已添加 `.nvmrc`（`24.14.1`），建议先执行：

```bash
nvm use
node -v
npm -v
```

如需生成可分发的本地网页包，后续流程建议为：

```bash
npm install
npm run package:local
```

这会自动构建并将产物复制到 `distribution/app/`，然后把整个 `distribution/` 文件夹打包发送即可。

## Codex 环境自检

为了保证 Codex 在任意会话都能直接使用 Node/npm，建议固定采用下面的进入顺序：

```bash
nvm use
npm ci
npm run build
```

其中 `npm run build` 可作为最直接的健康检查；若输出 `vite ... built` 即说明环境可用。

## 建议下一步

1. 把 `LocalStorage` 替换为 `IndexedDB`
2. 为编码和解码模块补单元测试
3. 增加“压缩模拟测试”与“冗余 OCR 实验模式”
4. 再评估 DCT 频域抗压缩实现
