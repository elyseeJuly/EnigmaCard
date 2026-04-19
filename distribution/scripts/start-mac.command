#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/../app" && pwd)"
PORT="4173"

cd "$APP_DIR" || exit 1
python3 -m http.server "$PORT" >/tmp/enigma-card-local.log 2>&1 &
SERVER_PID=$!
sleep 1
open "http://127.0.0.1:$PORT"
echo "隐信片本地工坊已启动，地址：http://127.0.0.1:$PORT"
echo "关闭终端窗口后，如需停止服务，可执行：kill $SERVER_PID"
