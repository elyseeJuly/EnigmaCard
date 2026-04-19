@echo off
:: 隐信片 (Enigma Card) 启动器
:: 方便在 Windows 上双击启动

cd /d %~dp0

:: 检查 node_modules 是否存在
if not exist "node_modules\" (
    echo 未发现 node_modules，正在安装依赖...
    call npm install
)

echo 正在启动 隐信片...
call npm run dev -- --open

pause
