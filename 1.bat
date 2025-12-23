@echo off
:: 强制以管理员身份运行（解决权限不足问题）
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo 请求管理员权限...
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B
)
if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )

chcp 65001 >nul 2>&1
cls

:: ====================== 第一步：强制终止所有占用 _site 的进程（显示执行结果） ======================
echo ==============================================
echo 🛑 正在终止占用 _site 的进程（Jekyll/浏览器）...
echo ==============================================
echo 终止 Ruby 进程（Jekyll 服务）...
taskkill /f /im ruby.exe 2>&1
echo 终止 Bundle 进程...
taskkill /f /im bundle.exe 2>&1
echo 终止访问 4000 端口的浏览器进程...
taskkill /f /im chrome.exe /fi "WINDOWTITLE eq *127.0.0.1:4000*" 2>&1
taskkill /f /im msedge.exe /fi "WINDOWTITLE eq *127.0.0.1:4000*" 2>&1
taskkill /f /im firefox.exe /fi "WINDOWTITLE eq *127.0.0.1:4000*" 2>&1
echo ✅ 进程终止操作完成
echo.

:: ====================== 第二步：Windows 原生强制删除 _site 文件夹（无无效命令） ======================
echo ==============================================
echo 🧹 正在强制删除 _site 文件夹...
echo ==============================================
if exist "_site" (
    echo 步骤1：清空 _site 内所有文件（解除文件占用）...
    :: 先删除文件夹内所有文件，再删文件夹（Windows 原生逻辑，最稳定）
    del /f /s /q "_site\*.*" >nul 2>&1
    
    echo 步骤2：删除空的 _site 文件夹...
    rd /s /q "_site" 2>&1
    
    :: 验证结果
    if not exist "_site" (
        echo ✅ _site 文件夹已彻底删除！
    ) else (
        echo ❌ [31mERROR：_site 删除失败！原因及解决方法：[0m
        echo    1. 原因：_site 仍被进程占用 / 权限不足 / 路径含中文
        echo    2. 解决：
        echo       - 关闭 VS Code/文件管理器等打开项目的程序
        echo       - 右键脚本 → 以管理员身份运行
        echo       - 确保项目路径是纯英文（如 C:\jekyll-blog，不要有中文/空格）
        echo.
        echo 🚨 手动删除：打开项目根目录，右键 _site → 删除
        pause >nul
        exit /b 1
    )
) else (
    echo ✅ 未找到 _site 文件夹，无需删除
)
echo.

:: ====================== 第三步：启动 Jekyll 服务 + 立刻打开浏览器 ======================
echo ==============================================
echo 🚀 正在启动 Jekyll 服务（端口 4000 + 实时重载）...
echo ==============================================
echo 📌 服务启动后将立刻打开：http://127.0.0.1:4000
echo 📌 按 Ctrl+C 可停止服务，窗口不会自动关闭！
echo ==============================================
echo.

:: 立刻打开浏览器
start "" "http://127.0.0.1:4000"

:: 启动服务（强制保窗，显示执行结果）
cmd /k "bundle exec jekyll serve --port 4000 --livereload"

:: 兜底暂停
echo.
echo ==============================================
echo ⚠️  Jekyll 服务已停止，按任意键关闭本窗口...
echo ==============================================
pause >nul