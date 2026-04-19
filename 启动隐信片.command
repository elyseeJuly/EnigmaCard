#!/bin/bash
# 隐信片 (Enigma Card) 启动器
# 方便在 Mac 上双击启动

# 切换到脚本所在目录
cd "$(dirname "$0")"

# 检查 node_modules 是否存在，如果不存在则尝试安装
if [ ! -d "node_modules" ]; then
    echo "未发现 node_modules，正在安装依赖..."
    npm install
fi

# 启动开发服务器并自动打开浏览器
echo "正在启动 隐信片..."
npm run dev -- --open
