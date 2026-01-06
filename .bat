@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 正在创建 Jekyll 博客目录结构...

REM 创建根目录文件
type nul > _config.yml
type nul > index.md
type nul > 404.md

REM 创建 _layouts 目录及文件
if not exist "_layouts" mkdir _layouts
type nul > _layouts\default.html
type nul > _layouts\home.html
type nul > _layouts\page.html
type nul > _layouts\post.html

REM 创建 _includes 目录及文件
if not exist "_includes" mkdir _includes
type nul > _includes\header.html
type nul > _includes\footer.html
type nul > _includes\mathjax.html

REM 创建 _posts 目录及示例文章
if not exist "_posts" mkdir _posts
type nul > _posts\2026-01-06-test-math.md

REM 创建 pages 目录及页面文件
if not exist "pages" mkdir pages
type nul > pages\about.md
type nul > pages\archive.md
type nul > pages\writing.md

REM 创建 assets/css 目录及样式文件
if not exist "assets\css" mkdir assets\css
type nul > assets\css\main.css

echo.
echo 目录结构创建完成：
echo fuoins.github.io/
echo ├── _config.yml
echo ├── _layouts/
echo │   ├── default.html
echo │   ├── home.html
echo │   ├── page.html
echo │   └── post.html
echo ├── _includes/
echo │   ├── header.html
echo │   ├── footer.html
echo │   └── mathjax.html
echo ├── _posts/
echo │   └── 2026-01-06-test-math.md
echo ├── pages/
echo │   ├── about.md
echo │   ├── archive.md
echo │   └── writing.md
echo ├── assets/
echo │   └── css/
echo │       └── main.css
echo ├── index.md
echo └── 404.md
echo.
echo 注意：
echo 1. 文件已创建完成，但内容为空
echo 2. 请根据需要填充各个文件的内容
echo 3. 此结构适用于 Jekyll 静态博客
echo 4. 页面文件放在 pages/ 目录下
echo.
pause