# 隐信片架构与部署说明

## 当前架构特征

当前项目已经按“可本地分发、可未来上线”的方式组织：

- 前端单页应用
- 核心功能全部在浏览器本地执行
- 无后端依赖才能完成编码与解码
- 构建后可输出静态资源

这意味着它天然适合：

- 本地网页包
- Tauri 桌面包装
- 静态站点部署

## 当前实现如何对应这个目标

### 本地逻辑

- 编码逻辑在 [src/lib/stego/encode.ts](/Users/quantumrose/Documents/Emberois/EnigmaCard/src/lib/stego/encode.ts)
- 解码逻辑在 [src/lib/stego/decode.ts](/Users/quantumrose/Documents/Emberois/EnigmaCard/src/lib/stego/decode.ts)
- 分享风险与护栏在 [src/lib/stego/robustness.ts](/Users/quantumrose/Documents/Emberois/EnigmaCard/src/lib/stego/robustness.ts)

这些都不依赖服务器。

### 页面逻辑

- 主入口在 [src/app/App.tsx](/Users/quantumrose/Documents/Emberois/EnigmaCard/src/app/App.tsx)
- 生成页在 [src/features/encode/EncodePanel.tsx](/Users/quantumrose/Documents/Emberois/EnigmaCard/src/features/encode/EncodePanel.tsx)
- 读取页在 [src/features/decode/DecodePanel.tsx](/Users/quantumrose/Documents/Emberois/EnigmaCard/src/features/decode/DecodePanel.tsx)
- 管理页在 [src/features/gallery/GalleryPanel.tsx](/Users/quantumrose/Documents/Emberois/EnigmaCard/src/features/gallery/GalleryPanel.tsx)

### 本地存储

当前使用的是浏览器 `localStorage` 占位方案：

- [src/lib/storage/gallery.ts](/Users/quantumrose/Documents/Emberois/EnigmaCard/src/lib/storage/gallery.ts)
- [src/lib/storage/settings.ts](/Users/quantumrose/Documents/Emberois/EnigmaCard/src/lib/storage/settings.ts)

后续建议升级为 IndexedDB，但这不会改变“本地运行”的大方向。

## 部署切换原则

### 当作为本地网页包时

- 产物是静态文件
- 用户在本地运行
- 不依赖远端接口

### 当作为正式网站时

- 仍然可以保持前端本地处理
- 只是把静态资源放到线上托管
- 不代表一定要引入后端

也就是说：

“部署到服务器”不等于“把秘密交给服务器”。

## 推荐后续动作

### 近期

- 将 `localStorage` 升级为 IndexedDB
- 准备本地网页包启动脚本
- 验证静态构建产物是否完全自洽

### 中期

- 增加 Tauri 外壳
- 增强本地文件和数据库能力

### 后期

- 将同一套前端构建产物部署到正式静态托管

## 一句话结论

可以先把它当作“本地网页工坊”来做，后面再决定要不要把这座工坊搬上云端。
