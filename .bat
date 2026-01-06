@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 正在创建 Jekyll 博客目录结构...

REM 创建根目录文件
type nul > _config.yml
type nul > index.html
type nul > 404.html

REM 创建 _includes 目录及文件
if not exist "_includes" mkdir _includes
type nul > _includes\head.html
type nul > _includes\footer.html
type nul > _includes\header.html

REM 创建 _layouts 目录及文件
if not exist "_layouts" mkdir _layouts
type nul > _layouts\default.html
type nul > _layouts\post.html

REM 创建 _posts 目录及示例文章
if not exist "_posts" mkdir _posts
type nul > _posts\2026-01-06-test-math.md

REM 创建 assets/css 目录及样式文件
if not exist "assets\css" mkdir assets\css
type nul > assets\css\main.css

echo.
echo 目录结构创建完成：
echo fuoins.github.io/
echo ├── _config.yml
echo ├── _includes/
echo │   ├── head.html
echo │   ├── footer.html
echo │   └── header.html
echo ├── _layouts/
echo │   ├── default.html
echo │   └── post.html
echo ├── _posts/
echo │   └── 2026-01-06-test-math.md
echo ├── index.html
echo ├── 404.html
echo └── assets/
echo     └── css/
echo         └── main.css
echo.
echo 注意：
echo 1. 文件已创建完成，但内容为空
echo 2. 请根据需要填充各个文件的内容
echo 3. 此结构适用于 Jekyll 静态博客
echo.
pause