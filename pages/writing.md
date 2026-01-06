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
数学公式是技术博客的重要功能，本博客通过**MathJax 3.x**实现公式渲染，核心解决了两个关键问题：
- **公式不显示**：通过正确配置`inlineMath`和`displayMath`，确保`$...$`（行内公式）和`$$...$$`（块级公式）被正确识别；
- **移动端换行异常**：通过CSS强制公式容器`overflow-x: auto`，超出屏幕宽度时显示横向滚动条，同时用`white-space: pre-wrap`实现自动换行。

核心配置（对应`_includes/mathjax.html`）：
```javascript
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']], // 行内公式标识
    displayMath: [['$$', '$$'], ['\\[', '\\]']], // 块级公式标识
    processEscapes: true // 支持\$显示普通美元符号
  },
  chtml: {
    scale: 1.05, // 公式缩放比例，适配页面字体
    displayAlign: 'left' // 块级公式左对齐，便于换行
  },
  startup: {
    pageReady: function() {
      return MathJax.startup.defaultPageReady().then(function() {
        // 公式渲染完成后添加自适应样式
        const mathElements = document.querySelectorAll('mjx-container');
        mathElements.forEach(el => {
          el.style.maxWidth = '100%';
          el.style.overflowX = 'auto';
        });
      });
    }
  }
};
```

公式渲染示例：
- 行内公式：$f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n$
- 块级公式（自动换行测试）：
  $$
  F(x,y)=\int_{0}^{1}\int_{0}^{1}\frac{\partial^2}{\partial u\partial v}\left[\frac{u^2v^2}{1-(ux+vy)^2}\right]dudv + \prod_{k=1}^{10}\left(1+\frac{1}{k^2}\right)
  $$

#### 3. 代码块醒目效果实现（纯CSS）
代码块的醒目效果完全通过CSS实现，无需任何高亮插件，核心设计思路如下：
- **基础样式**：浅灰背景+细边框+圆角，贴合白色调高级感；
- **hover效果**：边框变主题色+阴影加深，提升交互感；
- **语言标识**：通过`attr(data-lang)`获取代码块语言，显示在右上角；
- **移动端适配**：缩小内边距和字号，减少横向滚动。

核心样式代码（对应`assets/css/main.css`）：
```css
/* 代码块容器 */
pre {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.2rem;
  margin: 1.5rem 0;
  overflow-x: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  position: relative;
  transition: all 0.3s ease;
}

/* hover效果 */
pre:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border-color: #6366f1;
}

/* 代码文本样式 */
pre code {
  font-family: "Fira Code", "Consolas", monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #1e293b;
  white-space: pre;
}

/* 语言标识 */
pre::before {
  content: attr(data-lang);
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.2rem 0.8rem;
  background-color: #6366f1;
  color: white;
  font-size: 0.8rem;
  border-radius: 0 8px 0 8px;
  text-transform: uppercase;
}

/* 行内代码样式 */
p code, li code {
  background-color: #f1f5f9;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: "Fira Code", monospace;
  color: #6366f1;
  border: 1px solid #e2e8f0;
}
```

代码块使用示例：
```python
# 快速排序算法实现
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

# 测试代码
test_arr = [3, 6, 8, 10, 1, 2, 1]
print(quick_sort(test_arr)) # 输出：[1, 1, 2, 3, 6, 8, 10]
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