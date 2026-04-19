# 隐信片构建与打包说明

## 目标

把当前源码项目打成一个可以直接发给别人的本地网页包。

## 构建步骤

在具备 Node.js 与 npm 的环境中：

```bash
npm install
npm run package:local
```

这会先生成 `dist/`，再自动复制到 `distribution/app/`。

## 打包步骤

1. 执行 `npm run package:local`
2. 确认 `distribution/app/` 已生成最新静态产物
3. 保留 `distribution/scripts/`
4. 保留 `distribution/README.txt`
5. 将整个 `distribution/` 文件夹压缩发送

## 交付给用户后的使用方式

### macOS

1. 解压
2. 双击 `distribution/scripts/start-mac.command`
3. 浏览器会自动打开本地地址

### Windows

1. 解压
2. 双击 `distribution/scripts/start-windows.bat`
3. 浏览器会自动打开本地地址

## 适合当前版本的产品承诺

- 默认本地运行
- 默认本地保存
- 不依赖后端服务器完成编码与解码
- 后续仍可直接部署为正式网站

## 当前尚未完成的部分

- 构建产物实机验证
- Service Worker 与更完整的离线缓存
- IndexedDB 真实使用场景回归测试
- 更成熟的桌面壳分发方式

备注：
本次已经通过项目内便携版 Node.js 实际执行了构建与 `package:local`，并生成了 `distribution/app/`。
