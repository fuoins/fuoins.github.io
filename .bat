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
type nul > _posts\2026-01-06-first-post.md

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
echo │   └── 2026-01-06-first-post.md
echo ├── assets/
echo │   └── css/
echo │       └── main.css
echo ├── index.html
echo └── 404.html
echo.
pause