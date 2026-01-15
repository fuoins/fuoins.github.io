---
layout: page
title: 我的写作
subtitle: 记录思考，分享知识，沉淀成长
permalink: /pages/writing/
last_modified_at: 2026-01-06
---



### 一、技术栈总览
本博客采用**无插件轻量化架构**，完全基于Jekyll原生功能+原生Web技术实现，不依赖任何第三方插件，避免插件兼容问题，同时保证加载速度与稳定性。核心技术栈如下：

| 技术领域 | 核心技术 | 选择理由 |
|----------|----------|----------|
| 静态站点生成 | Jekyll 4.4.1 | 与GitHub Pages深度兼容，纯Ruby编写，无需后端服务，部署成本为零 |
| 前端页面构建 | 原生HTML5/CSS3/JavaScript | 抛弃Vue/React等框架，减少打包体积，提升页面加载速度，降低维护成本 |
| 样式设计 | 响应式布局+CSS变量 | 用CSS变量统一管理配色，媒体查询实现全端适配，贴合白色调高级感设计 |
| 数学公式渲染 | MathJax 3.x | 无插件CDN引入，完美支持LaTeX语法，适配移动端自动换行，满足技术写作需求 |
| 代码块高亮 | 原生CSS | 无需Prism.js等插件，纯CSS实现代码块背景、边框、hover动画，与博客风格统一 |
| 部署平台 | GitHub Pages | 免费稳定，支持自定义域名，提交代码自动部署，无需额外服务器配置 |

### 二、核心功能实现细节
#### 1. 无插件导航栏交互（移动端汉堡菜单）
导航栏是博客的核心交互组件，本博客的导航栏完全通过原生JavaScript实现，无任何插件依赖，核心逻辑如下：
- **桌面端**：横向排列导航选项，hover时显示底部主题色边框，突出当前选中项；
- **移动端**：自动折叠为汉堡菜单，点击触发菜单展开/收起，点击菜单项后自动关闭菜单。

```javascript
//本地预览和修改代码
//下ruby查看当前使用的源地址。
  gem sources

//gem 删除默认源命令
//打开命令行（win+r -> cmd 快速打开命令行），输入命令
//注：默认的url地址后必须有”/”,否则删不掉。 gem sources -r url地址

gem sources --remove https://rubygems.org/  
//一键获取完整项目代码

//gem 添加国内源
gem sources -a https://gems.ruby-china.com/

//检测方法
gem sources -l
```

核心代码实现（对应`_includes/header.html`）：
```javascript
// 获取触发器和菜单元素
const mobileTrigger = document.getElementById('mobileTrigger');
const mobileMenu = document.getElementById('mobileMenu');

// 点击触发器切换菜单显示/隐藏
mobileTrigger.addEventListener('click', function() {
  mobileMenu.classList.toggle('active');
  // 切换图标：菜单→关闭，关闭→菜单
  mobileTrigger.textContent = mobileMenu.classList.contains('active') ? '✕' : '☰';
});

// 点击菜单选项后关闭菜单
const mobileLinks = mobileMenu.querySelectorAll('a');
mobileLinks.forEach(link => {
  link.addEventListener('click', function() {
    mobileMenu.classList.remove('active');
    mobileTrigger.textContent = '☰';
  });
});

// 窗口大小变化时重置菜单状态
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    mobileMenu.classList.remove('active');
    mobileTrigger.textContent = '☰';
  }
});
```

样式核心要点（对应`assets/css/main.css`）：
- 用`position: sticky`实现导航栏吸顶，滚动时始终显示；
- 移动端菜单用`position: absolute`定位，避免挤压主内容；
- 用`transition`添加平滑动画，提升交互体验。

#### 2. 数学公式渲染与移动端自动换行
 
数学公式是技术博客的重要功能，本博客通过MathJax 3.x实现公式渲染，核心解决了两个关键问题：
 
- 公式不显示：通过正确配置 `inlineMath` 和 `displayMath `，确保 `$...$ （行内公式）`和` $$...$$ （块级公式）`被正确识别；
- 移动端换行异常：从「公式不换行」→「公式换行但页面宽出」→「公式换行且页面不超界」，通过三层优化实现终极适配。
 
实现原理
 
核心是「MathJax 内核配置 + CSS 样式穿透」，既要让 MathJax 识别公式并主动换行，也要强制限制公式容器宽度，避免撑开页面：
 
1. MathJax 配置层：开启自动换行机制，指定换行宽度阈值，渲染后强制重绘确保样式生效；
2. CSS 限制层：用  `100vw `（视口宽度）绑定页面最大宽度，禁止横向滚动，同时穿透 MathJax 默认样式，强制公式内部元素继承换行规则。
 
优化历程（从问题到解决）
 
阶段1：初始配置（解决「公式不显示」）
 
先完成基础渲染配置，确保行内/块级公式被正确解析，关闭冗余右键菜单简化体验：
 ```
javascript  
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']], // 行内公式标识
    displayMath: [['$$', '$$'], ['\\[', '\\]']], // 块级公式标识
    processEscapes: true // 支持 \$ 显示普通美元符号
  },
  options: { enableMenu: false } // 关闭右键菜单
};
```
 
阶段2：第一版换行（解决「公式不换行」，但页面宽出）
 
开启 MathJax 自动换行，给公式容器加基础换行样式，但未限制页面宽度，导致公式换行后页面仍被横向拉长：
```
javascript  
html: {
  linebreaks: {
    automatic: true, // 开启自动换行
    width: '85%' // 换行宽度阈值
  }
}
 
 
css  
mjx-container[jax="CHTML"][display="true"] {
  white-space: pre-wrap !important;
  word-wrap: break-word !important;
}
```
 
阶段3：终极适配（解决「页面宽出」，达成目标）
 
核心修改3点，实现「公式换行 + 页面不变宽」：
 
1. 给  `html/body ` 加 ` max-width: 100vw + overflow-x: hidden `，彻底禁止页面横向超界；
2. 换行宽度改用  `calc(100vw - 内边距)` ，绑定视口宽度，公式再长也不超屏；
3. 穿透 MathJax 内部元素`（ mjx-math / mjx-row ）`，强制继承换行规则，避免局部元素撑宽。
 
核心配置（`最终版，对应  _includes/mathjax.html `）
 ```
html  
<!DOCTYPE html>
<html>
<head>
<!-- MathJax 3.x 公式渲染配置 -->
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" id="MathJax-script" async></script>
<script>
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    autoload: { color: [], colorv2: ['color'] }
  },
  chtml: {
    scale: 1.02, // 微调缩放，平衡清晰度与宽度
    displayAlign: 'left', // 块级公式左对齐
    displayIndent: '1em',
    linebreaks: {
      automatic: true,
      width: 'calc(100vw - 2.4rem)', // 视口宽 - 左右内边距，精准控宽
      linebreakAtWhitespace: true
    }
  },
  startup: {
    pageReady: function() {
      return MathJax.startup.defaultPageReady().then(function() {
        // 渲染后强制重绘，确保样式生效
        const mathElements = document.querySelectorAll('mjx-container');
        mathElements.forEach(el => {
          el.style.maxWidth = '100vw !important';
          el.style.overflowX = 'hidden !important';
          el.style.margin = '1.5rem 0 !important';
          el.offsetHeight; // 触发浏览器重绘
        });
      });
    }
  },
  options: {
    enableMenu: false,
    ignoreHtmlClass: 'tex2jax_ignore',
    processHtmlClass: 'tex2jax_process'
  }
};
</script>
<style>
/* 页面不宽出核心样式（高优先级穿透） */
html, body {
  overflow-x: hidden !important; /* 禁止横向滚动 */
  max-width: 100vw !important; /* 页面宽度=视口宽度，绝不超界 */
}

/* 块级公式：强制换行+不撑页 */
.page-content mjx-container[jax="CHTML"][display="true"],
.post-content mjx-container[jax="CHTML"][display="true"] {
  display: block !important;
  max-width: calc(100vw - 2.4rem) !important;
  width: 100% !important;
  overflow-x: hidden !important;
  white-space: pre-wrap !important;
  word-wrap: break-word !important;
  word-break: break-all !important; /* 极端长公式强制断字 */
  margin: 1.5rem 0 !important;
  padding: 0.5rem !important;
  box-sizing: border-box !important;
}

/* 公式内部元素：继承换行规则 */
mjx-container[jax="CHTML"] mjx-math,
mjx-container[jax="CHTML"] mjx-row,
mjx-container[jax="CHTML"] mjx-itable {
  white-space: pre-wrap !important;
  word-wrap: break-word !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

/* 行内公式：适配文本流，不撑破行 */
.page-content mjx-container[jax="CHTML"][display="false"],
.post-content mjx-container[jax="CHTML"][display="false"] {
  vertical-align: middle !important;
  max-width: calc(100vw - 2.4rem) !important;
  box-sizing: border-box !important;
}

/* 移动端适配（匹配博客响应式规则） */
@media (max-width: 768px) {
  .page-content mjx-container[jax="CHTML"][display="true"],
  .post-content mjx-container[jax="CHTML"][display="true"] {
    max-width: calc(100vw - 1.6rem) !important; /* 匹配移动端内边距 */
    displayIndent: 0 !important;
    padding: 0.3rem !important;
    font-size: 0.88em !important;
  }
}
</style>
</head>
<body>
<!-- 公式会自动适配 .page-content/.post-content 容器，直接在 MD 中写 $公式$ 或 $$公式$$ 即可 -->
</body>
</html>
 
 ```
使用方式
 
在 MD 文章中直接编写公式，无需额外标签：
 
- 行内公式： $f(x) = x^2 + 2x + 1$ （嵌入文本中）；
- 块级公式：
 
math  
$$
f(x) = \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}} + \sum_{n=1}^{\infty} \frac{1}{n^2}
$$
   

#### 3. 代码块醒目效果实现（纯CSS）
代码块的醒目效果完全通过CSS实现，无需任何高亮插件，核心设计思路如下：
- **基础样式**：dark；
- **移动端适配**：缩小内边距和字号，减少横向滚动。

核心样式代码（对应`assets/css/main.css`）：
```css
pre {
  background-color: #2B2B2B !important; /* IDEA默认暗黑背景 */
  border: none !important;
  border-radius: 4px !important;
  padding: 16px !important;
  margin: 24px 0 !important;
  position: relative !important;
  font-family: 'JetBrains Mono', 'Consolas', 'Monaco', monospace !important;
  line-height: 1.7 !important;
  font-size: 13px !important;
  color: #A9B7C6 !important;

  /* 核心防扩宽 */
  max-width: 100% !important;
  width: 100% !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  box-sizing: border-box !important;
  white-space: pre !important;
  word-wrap: normal !important;
  word-break: keep-all !important;
  min-width: auto !important;
  flex-shrink: 1 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

pre code {
  font-family: inherit !important;
  font-size: inherit !important;
  line-height: inherit !important;
  color: inherit !important;
  white-space: pre !important;
  display: block !important;
  max-width: 100% !important;
  overflow: visible !important;
}

/* IDEA Dark语法高亮（不变） */
pre code .k, pre code .keyword {
  color: #CC7832 !important;
  font-weight: 500 !important;
}
pre code .s, pre code .string, pre code .s1, pre code .s2 {
  color: #6A8759 !important;
}
pre code .c, pre code .comment, pre code .cm, pre code .c1 {
  color: #808080 !important;
  font-style: italic !important;
  opacity: 0.9 !important;
}
pre code .nf, pre code .function {
  color: #FFC66D !important;
}
pre code .nv, pre code .variable, pre code .id {
  color: #A9B7C6 !important;
}
pre code .m, pre code .number {
  color: #6897BB !important;
}
pre code .o, pre code .operator {
  color: #A9B7C6 !important;
}
pre code .kc, pre code .boolean {
  color: #9876AA !important;
}
pre code .nb, pre code .built_in {
  color: #6897BB !important;
}

/* ZY标识（不变） */
pre::before {
  content: "ZY" !important;
  position: absolute !important;
  top: 0 !important;
  right: 0 !important;
  padding: 2px 10px !important;
  background-color: #3C3F41 !important;
  color: #A9B7C6 !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  border-radius: 0 4px 0 4px !important;
  z-index: 1 !important;
  display: block !important;
  box-sizing: border-box !important;
  max-width: 50% !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

p code, li code, h3 code, h4 code {
  /* 你指定的核心样式（100%保留，无任何修改） */
  background-color: #f8f8f8 !important;
  padding: 2px 4px !important;
  border-radius: 0 !important; /* 直角 */
  font-family: 'JetBrains Mono', 'Consolas', monospace !important;
  font-size: 13px !important;
  color: #7d5bbf !important;
  border: 1px solid #e0e0e0 !important;



/* 移动端同步修改 */
@media (max-width: 768px) {
  p code, li code {
    /* 你指定的样式完全保留，仅微调字号 */
    padding: 2px 4px !important;
    font-size: 12px !important;
    background-color: #f8f8f8 !important;
    color: #7d5bbf !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 0 !important;

    /* 同步核心平衡方案 */
    display: inline !important;
    display: inline-block !important;
    max-width: 100% !important;
    width: auto !important;
    white-space: pre-line !important;
    word-break: break-word !important;
    overflow-wrap: break-word !important;
    overflow: visible !important;
    vertical-align: baseline !important;
    box-sizing: border-box !important;
    line-height: 1.6 !important;
    hyphens: auto !important;
  }
}
```

#### 4. 列表序号出界问题修复
博客开发中遇到的一个典型问题是**列表序号显示在内容区域外侧**，核心原因是`list-style-position`默认值为`outside`，且容器缩进设置不当。修复方案如下：
- 将`list-style-position`设为`inside`，让序号显示在内容区域内；
- 用`padding-left`替代`margin-left`控制缩进，避免序号被挤出；
- 添加`text-indent`实现文本换行对齐，保证排版美观。

核心修复代码：
```css
.page-content ul, .page-content ol,
.post-content ul, .post-content ol {
  list-style-position: inside !important;
  padding-left: 2rem !important;
  margin: 1.5rem 0 !important;
  overflow: visible !important;
}

.page-content li, .post-content li {
  margin-bottom: 0.8rem !important;
  padding-left: 0.5rem !important;
  text-indent: -1.2rem !important;
}
```

修复效果对比：
| 修复前 | 修复后 |
|--------|--------|
| 序号显示在内容外侧，文本顶格 | 序号显示在内容内侧，文本换行后对齐 |
| 移动端序号被挤出屏幕 | 移动端序号完全显示，支持横向滚动 |

### 三、性能优化技巧
#### 1. 资源压缩与加载优化
- **CSS压缩**：将`main.css`中的空格、注释删除，减少文件体积；
- **JS异步加载**：MathJax脚本添加`async`属性，不阻塞页面渲染；
- **图片优化**：使用WebP格式图片，压缩体积，提升加载速度；
- **避免冗余代码**：删除未使用的CSS样式和JS代码，保持代码简洁。

#### 2. 缓存策略
- **浏览器缓存**：GitHub Pages默认开启静态资源缓存，重复访问时无需重新下载CSS/JS文件；
- **Jekyll缓存清理**：本地开发时，通过删除`_site`和`.jekyll-cache`文件夹，避免旧代码缓存导致的样式不生效问题。

#### 3. 移动端加载优化
- **媒体查询适配**：根据屏幕宽度调整字体大小、内边距，减少移动端渲染压力；
- **导航栏懒加载**：移动端导航菜单默认隐藏，点击后才显示，减少初始渲染元素；
- **公式延迟渲染**：MathJax在页面加载完成后再渲染公式，不影响首屏加载速度。

### 四、兼容性处理方案
#### 1. 浏览器兼容性
- **MathJax兼容**：针对低版本浏览器，添加`fallback`配置，确保公式正常显示；
- **CSS属性兼容**：对`transition`、`box-shadow`等属性添加浏览器前缀，如`-webkit-`、`-moz-`；
- **响应式兼容**：使用`viewport`元标签，确保移动端页面缩放正常。

#### 2. Jekyll版本兼容
- **避免高版本特性**：使用Jekyll 4.4.1稳定版，避免使用新版本的实验性功能；
- **无插件配置**：删除所有依赖插件的配置项（如分页），确保在GitHub Pages上正常运行。

### 五、后续扩展计划
本博客的无插件架构具有良好的扩展性，后续可通过原生技术实现以下功能：
1. **搜索功能**：通过原生JS遍历`site.posts`，实现文章标题和内容的搜索；
2. **暗黑模式切换**：通过CSS变量切换配色方案，实现一键切换暗黑/白色模式；
3. **文章阅读量统计**：集成GitHub Issues API，实现无服务器的阅读量统计；
4. **评论功能**：集成Giscus，基于GitHub Discussions实现评论功能，无需第三方评论系统。

### 六、常见问题与解决方案
| 问题现象 | 解决方案 |
|----------|----------|
| MathJax公式不显示 | 检查公式语法是否正确，确认MathJax脚本是否成功加载，添加`window.onload`触发公式渲染 |
| 样式修改后不生效 | 删除`_site`和`.jekyll-cache`文件夹，重启Jekyll服务，清除浏览器缓存 |
| 列表序号出界 | 添加`!important`强制覆盖冲突样式，调整`list-style-position`和`padding-left`属性 |
| 移动端导航菜单不响应 | 检查JS代码是否正确获取元素，确认`id`是否与HTML中的`id`一致 |

### 七、总结
本博客的核心设计理念是**无插件、轻量化、高可维护性**，通过原生Web技术和Jekyll原生功能，实现了一个功能完善、性能优异的技术博客。在开发过程中，我们解决了公式渲染、代码高亮、列表序号出界等多个典型问题，积累了丰富的静态博客开发经验。

如果你在搭建类似博客时遇到问题，欢迎通过邮箱与我交流。我会持续更新博客的技术细节，分享更多静态博客开发的技巧和经验。