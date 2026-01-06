---
layout: default
title: 关于我
description: 关于 Fuoins' Blog 的详细介绍，包括技术栈、设计理念和使用说明
---

<div class="about">
  <h1 class="about__title">关于 Fuoins' Blog</h1>

  <div class="about__content">
    <p>这是一个基于 Jekyll 构建的个人博客，托管在 GitHub Pages 上，域名是 <code>fuoins.github.io</code>。本博客的设计理念是「极简而不简单」，以白色调为主色调，追求高级感的视觉体验，同时兼顾功能性和易用性。</p>

    <h2>技术栈</h2>
    <p>本博客的核心技术栈如下：</p>
    <ul>
      <li><strong>静态生成框架</strong>：Jekyll（Ruby 编写的静态站点生成器）</li>
      <li><strong>样式</strong>：原生 CSS（无框架），采用响应式设计，适配移动端和桌面端</li>
      <li><strong>数学公式支持</strong>：MathJax 3.x（替代 LaTeX 的开源数学公式渲染库）</li>
      <li><strong>字体</strong>：Inter（Google Fonts 提供的无衬线字体，兼顾可读性和美观性）</li>
      <li><strong>部署</strong>：GitHub Pages（免费、稳定的静态站点托管服务）</li>
    </ul>
    
    <h2>设计理念</h2>
    <p>本博客的设计遵循以下原则：</p>
    <ol>
      <li><strong>白色调为主</strong>：白色背景能最大程度减少视觉干扰，突出内容本身，同时营造高级、简洁的视觉感受。辅助色采用淡蓝色（#3b82f6），既不刺眼，又能起到强调和引导的作用。</li>
      <li><strong>移动端优先</strong>：在设计时首先考虑移动端体验，再通过媒体查询适配更大的屏幕，确保在手机、平板、电脑上都有良好的显示效果。</li>
      <li><strong>内容为王</strong>：所有的设计和交互都围绕内容展开，不添加多余的装饰元素，让读者的注意力集中在文字和内容上。</li>
      <li><strong>性能优先</strong>：尽量减少外部依赖，使用轻量级的代码和资源，确保页面加载速度快，即使在网络条件不佳的情况下也能快速访问。</li>
    </ol>
    
    <h2>数学公式使用说明</h2>
    <p>本博客完美支持 LaTeX 语法的数学公式，使用方式如下：</p>
    <ul>
      <li>行内公式：使用 <code>$公式内容$</code> 或 <code>\(公式内容\)</code> 包裹，例如 $E=mc^2$</li>
      <li>块级公式：使用 <code>$$公式内容$$</code> 或 <code>\[公式内容\]</code> 包裹，例如：
        $$
        \frac{d}{dx} \left( \int_{a}^{x} f(t) dt \right) = f(x)
        $$
      </li>
      <li>自动换行：当公式宽度超过页面宽度时，会自动换行，无需手动调整，例如：
        $$
        \sum_{k=0}^{n} \binom{n}{k} a^{n-k} b^k = (a+b)^n \quad \prod_{i=1}^{n} i = n! \quad \lim_{x \to 0} \frac{\sin x}{x} = 1 \quad \int_{0}^{\pi} \sin x dx = 2
        $$
      </li>
    </ul>
    
    <h2>使用与部署</h2>
    <p>如果你想复用本博客的代码，可以按照以下步骤操作：</p>
    <ol>
      <li>克隆仓库：<code>git clone https://github.com/fuoins/fuoins.github.io.git</code></li>
      <li>安装依赖：确保本地安装了 Ruby 和 Jekyll，然后执行 <code>bundle install</code></li>
      <li>本地运行：<code>bundle exec jekyll serve</code>，访问 <code>http://localhost:4000</code> 查看效果</li>
      <li>修改配置：编辑 <code>_config.yml</code> 文件，替换为自己的信息（标题、邮箱、GitHub 用户名等）</li>
      <li>部署：将代码推送到 GitHub 仓库 <code>fuoins.github.io</code>，GitHub Pages 会自动构建并部署</li>
    </ol>
    
    <h2>联系方式</h2>
    <p>如果你有任何问题、建议或合作意向，可以通过以下方式联系我：</p>
    <ul>
      <li>GitHub：<a href="https://github.com/fuoins" target="_blank" rel="noopener noreferrer">@fuoins</a></li>
      <li>邮箱：your-email@example.com</li>
    </ul>
    
    <p>最后，感谢你的访问！希望本博客的内容能对你有所帮助，也欢迎你分享和推荐本博客。</p>
  </div>
</div>