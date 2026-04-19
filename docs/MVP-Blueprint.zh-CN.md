# 隐信片 MVP 蓝图

## 1. MVP 一句话
做一个纯本地、可离线、审美在线的“图片藏文”工具，首版解决“稳定写入、稳定读出、体面分享”。

## 2. 首版必须交付
- 选择模板或上传图片
- 输入隐藏文本并实时提示容量
- 通过 LSB 方式编码到 PNG
- 导出图片
- 导入图片并解码
- 本地保存草稿和成品
- 分享前提示“请发送原图”

## 3. 首版不做
- 云端账号
- 在线模板商店
- AI 接口接入
- 跨平台同步
- 第三方图片兼容识别
- 复杂修图
- DCT 频域隐写正式版
- 云端短链备份

## 4. 推荐页面

### 4.1 首页
- 产品一句话介绍
- 进入铸币局
- 进入显影液
- 进入手帐本

### 4.2 铸币局
- 左侧：模板/图片选择、表层文案
- 右侧：隐藏文本、容量提示、生成按钮、预览
- 导出前：压缩风险提示、原图发送提醒

### 4.3 显影液
- 上传图片
- 读取状态
- 打字机文本展示
- 复制与保存

### 4.4 手帐本
- 网格卡片列表
- 过滤标签
- 查看详情弹层

## 5. 数据模型建议

### 5.1 Draft
- id
- coverImage
- overlayText
- secretText
- encodingMode
- createdAt
- updatedAt

### 5.2 Card
- id
- imageBlob
- thumbnailBlob
- overlayText
- secretPreview
- encodingMode
- direction
- checksum
- createdAt

## 6. 工程结构建议

```text
src/
  app/
  pages/
  components/
  features/
    encode/
    decode/
    gallery/
  lib/
    stego/
    storage/
    crypto/
    utils/
  styles/
```

## 7. 算法模块拆分

### 7.1 `lib/stego/encode.ts`
- 文本转字节
- 数据头拼装
- LSB 写入

### 7.2 `lib/stego/decode.ts`
- LSB 读取
- 头信息解析
- 校验与还原

### 7.3 `lib/stego/schema.ts`
- 魔数
- 版本号
- 数据结构常量

### 7.4 `lib/stego/robustness.ts`
- 载荷容量估算
- 压缩风险分级
- 冗余 OCR 版式参数

## 8. 产品文案建议

### 8.1 空状态
- 把想说的话，藏进一张安静的图里。

### 8.2 生成中
- 正在封存这段私语……

### 8.3 解码中
- 显影中，请稍候。

### 8.4 解码失败
- 这张图里没有找到可识别的暗格，或它已经在传递中受损。

## 9. 里程碑建议

### Milestone 1：算法可用
- 输入文本
- 写入 PNG
- 重新导入并读出

### Milestone 2：界面闭环
- 完成编码页与解码页
- 支持导出、复制、保存

### Milestone 3：本地管理
- 支持 IndexedDB 存储与历史查看

### Milestone 4：视觉打磨
- 模板
- 动效
- 文案语气统一

### Milestone 5：抗损增强
- 导出前压缩风险提示
- 冗余 OCR 实验模式
- 压缩模拟测试

## 10. 下一步最值得做的事情
- 先搭一个 React + Tailwind 的 PWA 骨架
- 优先打通 LSB 编码/解码闭环
- 再补“原图发送”分享护栏
- 最后把美术模板和手帐本接上
