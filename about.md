---
layout: default
title: 关于我
permalink: /about/
---

<div class="about-page">
  <h1>关于 fuoins 的博客</h1>
  
  <div class="about-content">
    <h3>博客介绍</h3>
    <p>本博客基于 Jekyll v3.10.0 + GitHub Pages v232 构建，采用纯白色调的极简设计风格，注重移动端适配和用户体验。博客的核心目标是分享技术知识、沉淀学习心得，同时为有需要的开发者提供一个优雅的 Jekyll 博客模板参考。</p>
    
    <p>在技术选型上，我们坚持使用 GitHub Pages 内置的插件和功能，避免引入非必要的第三方依赖，确保博客的稳定性和加载性能。同时，针对数学公式渲染需求，集成了 MathJax v3 引擎，支持行内和块级公式的完美渲染，且特别优化了移动端的显示效果，超长公式会自动换行，保证在小屏设备上的可读性。</p>
    
    <h3>技术栈</h3>
    <ul>
      <li><strong>静态站点生成</strong>：Jekyll v3.10.0（兼容 GitHub Pages v232）</li>
      <li><strong>样式与布局</strong>：纯 CSS（Flex/Grid 布局）、响应式设计</li>
      <li><strong>数学公式</strong>：MathJax v3（支持自动换行）</li>
      <li><strong>字体</strong>：Inter 无衬线字体（提升高级感和可读性）</li>
      <li><strong>部署</strong>：GitHub Pages</li>
    </ul>
    
    <h3>设计理念</h3>
    <p>本博客的设计遵循「极简但不简单」的原则：</p>
    <ol>
      <li><strong>视觉简洁</strong>：以纯白色为基调，搭配低饱和度的蓝色作为强调色，减少视觉干扰，让内容成为核心。</li>
      <li><strong>层次分明</strong>：通过字体大小、间距、边框等元素构建清晰的视觉层级，提升内容的可读性。</li>
      <li><strong>交互友好</strong>：添加适度的过渡动画和交互反馈，提升用户体验但不喧宾夺主。</li>
      <li><strong>全端适配</strong>：从手机到桌面端，保证在不同设备上都有一致且舒适的浏览体验。</li>
    </ol>
    
    <h3>数学公式支持细节</h3>
    <p>为了解决数学公式在移动端溢出的问题，我们对 MathJax 进行了深度配置：</p>
    <ul>
      <li>启用 `overflow: linebreak` 选项，让超长公式自动换行</li>
      <li>为公式容器添加 `max-width: 100%` 和 `overflow-x: auto`，确保不会超出页面宽度</li>
      <li>公式渲染完成后自动检测宽度，为超长公式添加横向滚动提示</li>
      <li>支持标准的 Markdown 公式语法（$...$ 行内，$$...$$ 块级）</li>
    </ul>
    
    <p>以下是一个更复杂的数学公式示例，验证自动换行功能：</p>
    $$
    \hat{y}(x) = \sum_{i=1}^{n} \alpha_i y_i K(x, x_i) + b = \sum_{i=1}^{n} \alpha_i y_i \exp\left(-\frac{\|x - x_i\|^2}{2\sigma^2}\right) + b
    $$
    
    <h3>联系方式</h3>
    <p>如果你对本博客的设计或实现有任何疑问、建议，或者想要交流技术相关的话题，欢迎通过以下方式联系我：</p>
    <ul>
      <li>GitHub：<a href="https://github.com/fuoins" target="_blank">@fuoins</a></li>
      <li>邮箱：your-email@example.com（请替换为实际邮箱）</li>
    </ul>
    
    <h3>许可证</h3>
    <p>本博客的代码模板基于 MIT 许可证开源，你可以自由地使用、修改和分发，只需保留原作者的版权声明。</p>
  </div>
</div>